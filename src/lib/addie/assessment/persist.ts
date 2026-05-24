// Persist an In-Depth Readiness Assessment result into addie.assessment_results.
//
// Idempotency:
//   - If stripe_session_id is supplied → keyed UPSERT on (stripe_session_id).
//     A duplicate Stripe checkout completion updates the existing row instead
//     of inserting a second one.
//   - If stripe_session_id is NOT supplied → fallback idempotency on
//     (email, created_at::date). The same email completing the assessment
//     twice on the same UTC day updates the original row. (This catches
//     accidental double-submits without conflating two legitimately separate
//     attempts a week apart.)
//
// Identity resolution precedence: user_id beats lead_id beats fresh lead.
// Service-role only — the addie.* schema is not exposed to anon/authenticated.

import { getAddieServiceClient, normalizeEmail } from '@/lib/addie/supabase/service';
import { upsertLead } from '@/lib/addie/leads/upsert';

export interface PersistAssessmentInput {
  readonly email: string;
  readonly raw_answers: ReadonlyArray<{ readonly question_id: string; readonly value: number }>;
  readonly dimension_scores: Readonly<Record<string, number>>;
  readonly plan_md?: string | null;
  readonly ideas_prompts_md?: string | null;
  readonly ctas_md?: string | null;
  readonly stripe_session_id?: string | null;
  readonly user_id?: string | null;
  readonly lead_id?: string | null;
  readonly marketing_opt_in?: boolean;
}

export interface PersistAssessmentResult {
  readonly id: string;
  readonly created: boolean;
}

interface AssessmentRow {
  id: string;
}

export async function persistAssessment(
  input: PersistAssessmentInput,
): Promise<PersistAssessmentResult> {
  const email = normalizeEmail(input.email);
  const supa = getAddieServiceClient();

  // Resolve identity. user_id wins. Otherwise use supplied lead_id or upsert one.
  let user_id: string | null = input.user_id ?? null;
  let lead_id: string | null = input.lead_id ?? null;
  if (!user_id && !lead_id) {
    const lead = await upsertLead({
      email,
      source: 'assessment',
      marketing_opt_in: input.marketing_opt_in === true,
      track: null,
    });
    lead_id = lead.id;
  }
  if (user_id) {
    // Don't store both — the CHECK constraint allows either, but keeping it
    // single-identity-per-row avoids ambiguity in ownership checks.
    lead_id = null;
  }

  const baseRow: Record<string, unknown> = {
    user_id,
    lead_id,
    email,
    raw_answers: input.raw_answers,
    dimension_scores: input.dimension_scores,
    plan_md: input.plan_md ?? null,
    ideas_prompts_md: input.ideas_prompts_md ?? null,
    ctas_md: input.ctas_md ?? null,
    stripe_session_id: input.stripe_session_id ?? null,
  };

  // --- Idempotency path 1: stripe_session_id present ----------------------
  if (input.stripe_session_id) {
    const { data: existing, error: selErr } = await supa
      .from('assessment_results')
      .select('id')
      .eq('stripe_session_id', input.stripe_session_id)
      .maybeSingle();
    if (selErr) throw new Error(`assessment_results lookup failed: ${selErr.message}`);
    if (existing) {
      const row = existing as AssessmentRow;
      const { error: updErr } = await supa
        .from('assessment_results')
        .update(baseRow)
        .eq('id', row.id);
      if (updErr) throw new Error(`assessment_results update failed: ${updErr.message}`);
      return { id: row.id, created: false };
    }
  } else {
    // --- Idempotency path 2: (email, created_at::date) --------------------
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const { data: existing, error: selErr } = await supa
      .from('assessment_results')
      .select('id')
      .eq('email', email)
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (selErr) throw new Error(`assessment_results lookup failed: ${selErr.message}`);
    if (existing) {
      const row = existing as AssessmentRow;
      const { error: updErr } = await supa
        .from('assessment_results')
        .update(baseRow)
        .eq('id', row.id);
      if (updErr) throw new Error(`assessment_results update failed: ${updErr.message}`);
      return { id: row.id, created: false };
    }
  }

  const { data: inserted, error: insErr } = await supa
    .from('assessment_results')
    .insert(baseRow)
    .select('id')
    .single();
  if (insErr || !inserted) {
    throw new Error(`assessment_results insert failed: ${insErr?.message ?? 'no row'}`);
  }
  return { id: (inserted as AssessmentRow).id, created: true };
}
