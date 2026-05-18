// /api/dashboard/assessments — returns the logged-in user's assessment
// entitlements + profile state, so the /dashboard surface can render
// "your paid assessments" cards without each component re-querying
// course_enrollments and user_profiles separately.
//
// Scoped to In-Depth only for now (the free assessment is delivered via
// an emailed /results/<id> link; we surface paid items here because that
// is what users cannot easily find without a logged-in entry point).

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { emailVariants } from '@/lib/email/canonicalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ReadinessSnapshot {
  readonly score: number;
  readonly maxScore: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly isInDepth: boolean;
  readonly takenAt: string | null;
}

interface AssessmentsResponse {
  /** First name pulled from Supabase auth user_metadata.full_name.
   *  Empty string when no name is on file — dashboard falls back to "Welcome back". */
  readonly displayName: string;
  /** Most recent readiness reading (free or in-depth), regardless of entitlement.
   *  Surfaced so the dashboard can render YOUR results, not generic CTAs. */
  readonly snapshot: ReadinessSnapshot | null;
  readonly inDepth: {
    readonly entitled: boolean;
    readonly profileId: string | null;
    readonly hasCompleted: boolean;
    readonly purchasedAt: string | null;
  } | null;
}

export async function GET(): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const supabase = createServerClientWithCookies(cookies());
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  // Entitlement check: course_enrollments row keyed on user_id OR any
  // canonical/alias variant of the auth email. Without variant expansion,
  // a Gmail "+alias" buyer who later signs in as the plain address falls
  // through the dashboard gate even though /assessment/in-depth/take
  // recognizes them. Matches the variant-aware pattern used in
  // src/app/assessment/in-depth/take/page.tsx.
  const variants = emailVariants(user.email);
  const emailClause = variants.map((e) => `email.eq.${e}`).join(',');
  const { data: enrollments, error: enrollErr } = await supabase
    .from('course_enrollments')
    .select('id, created_at')
    .eq('product', 'in-depth-assessment')
    .or(`user_id.eq.${user.id},${emailClause}`)
    .order('created_at', { ascending: true });

  if (enrollErr) {
    console.error('[dashboard/assessments] enrollment query error:', enrollErr);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }

  const entitled = (enrollments ?? []).length > 0;
  const purchasedAt = entitled ? (enrollments![0].created_at as string) : null;

  // Profile + completion check. Run UNCONDITIONALLY (was previously gated on
  // entitled) — completion is a property of the profile data, not of
  // entitlement. Users who took the In-Depth via a non-Stripe path (preview
  // bypass, manually-granted access, partner code) still need their dashboard
  // step to flip to Done.
  //
  // Variant-aware lookup — the profile may have been created under the
  // +alias form used in checkout.
  let profileId: string | null = null;
  let hasCompleted = false;
  let snapshot: ReadinessSnapshot | null = null;
  const { data: profileRows, error: profileErr } = await supabase
    .from('user_profiles')
    .select(
      'id, readiness_answers, readiness_score, readiness_tier_id, readiness_tier_label, readiness_max_score, readiness_at',
    )
    .or(variants.map((e) => `email.eq.${e}`).join(','))
    .order('readiness_at', { ascending: false, nullsFirst: false })
    .limit(1);
  const profile = profileRows && profileRows.length > 0 ? profileRows[0] : null;
  if (profileErr) {
    console.warn('[dashboard/assessments] profile lookup error:', profileErr);
  } else if (profile) {
    profileId = profile.id as string;
    const answers = profile.readiness_answers as unknown[] | null;
    // 48-answer length is the canonical In-Depth completion signal — the
    // free assessment stores 12-element arrays.
    hasCompleted = Array.isArray(answers) && answers.length === 48;
    if (
      typeof profile.readiness_score === 'number' &&
      typeof profile.readiness_tier_id === 'string' &&
      typeof profile.readiness_tier_label === 'string'
    ) {
      const answerCount = Array.isArray(answers) ? answers.length : 0;
      const isInDepth = answerCount === 48;
      const maxScore =
        typeof profile.readiness_max_score === 'number'
          ? profile.readiness_max_score
          : isInDepth
            ? 192
            : 48;
      snapshot = {
        score: profile.readiness_score,
        maxScore,
        tierId: profile.readiness_tier_id,
        tierLabel: profile.readiness_tier_label,
        isInDepth,
        takenAt: (profile.readiness_at as string | null) ?? null,
      };
    }
  }

  // First-name display string. Auth metadata is the only canonical source —
  // we never derive a name from the email local-part (produces things like
  // "Jlgilmore2" from jlgilmore2@gmail.com).
  const fullName = (user.user_metadata as { full_name?: unknown } | null | undefined)?.full_name;
  const displayName =
    typeof fullName === 'string' && fullName.trim().length > 0
      ? fullName.trim().split(/\s+/)[0]!
      : '';

  // Surface inDepth whenever the user is entitled OR has completed it. The
  // dashboard reads .hasCompleted to flip step 4 of the activation ladder;
  // returning null when neither condition holds keeps the section hidden
  // for users who never engaged with the paid path.
  const body: AssessmentsResponse = {
    displayName,
    snapshot,
    inDepth: (entitled || hasCompleted)
      ? { entitled, profileId, hasCompleted, purchasedAt }
      : null,
  };
  return NextResponse.json(body);
}
