// addie.leads upsert — Auth Spec §4.2 / §5.2.
//
// Idempotent on email; updates marketing_opt_in and (if previously NULL) track.
// MailerLite sync respects SKIP_MAILERLITE and marketing_opt_in.

import { getAddieServiceClient, normalizeEmail } from '@/lib/addie/supabase/service';
import { subscribeToAssessmentForm, subscribeToNewsletterForm } from '@/lib/mailerlite';

export type LeadSource = 'gate' | 'assessment' | 'newsletter' | 'other';
export type Track = 'risk_compliance' | 'customer_facing' | 'back_office' | 'technical' | 'leadership';

export interface UpsertLeadArgs {
  readonly email: string;
  readonly source: LeadSource;
  readonly marketing_opt_in: boolean;
  readonly track?: Track | null;
}

export interface UpsertLeadResult {
  readonly id: string;
  readonly email: string;
  readonly created: boolean;
}

export async function upsertLead(args: UpsertLeadArgs): Promise<UpsertLeadResult> {
  const email = normalizeEmail(args.email);
  const supa = getAddieServiceClient();

  // Look first so we can report `created` accurately for events/telemetry.
  const { data: existing, error: selErr } = await supa
    .from('leads')
    .select('id, track')
    .eq('email', email)
    .maybeSingle();
  if (selErr) throw new Error(`leads select failed: ${selErr.message}`);

  if (existing) {
    const patch: Record<string, unknown> = { marketing_opt_in: args.marketing_opt_in };
    if (!existing.track && args.track) patch.track = args.track;
    const { error: updErr } = await supa.from('leads').update(patch).eq('id', existing.id);
    if (updErr) throw new Error(`leads update failed: ${updErr.message}`);
    await syncMailerLite(email, args);
    return { id: existing.id as string, email, created: false };
  }

  const { data: inserted, error: insErr } = await supa
    .from('leads')
    .insert({
      email,
      source: args.source,
      marketing_opt_in: args.marketing_opt_in,
      track: args.track ?? null,
    })
    .select('id')
    .single();
  if (insErr || !inserted) throw new Error(`leads insert failed: ${insErr?.message ?? 'no row'}`);

  await syncMailerLite(email, args);
  return { id: inserted.id as string, email, created: true };
}

async function syncMailerLite(email: string, args: UpsertLeadArgs): Promise<void> {
  if (process.env.SKIP_MAILERLITE === 'true') {
    console.info('[addie/leads] SKIP_MAILERLITE — would sync', { email, source: args.source });
    return;
  }
  // Always add to the nurture/assessment group (transactional/lifecycle).
  await subscribeToAssessmentForm({ email });
  // Newsletter only when consent given.
  if (args.marketing_opt_in) {
    await subscribeToNewsletterForm({ email });
  }
}
