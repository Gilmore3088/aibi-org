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
  // Fetch up to 10 rows (one per email variant) so we can prefer an
  // In-Depth row over a free-scan row when both exist. Ordering by
  // readiness_at alone produced the regression where a user who took
  // In-Depth then retook the free scan saw 'Take your purchased
  // assessment' on their dashboard because the free row was newer.
  const { data: profileRows, error: profileErr } = await supabase
    .from('user_profiles')
    .select(
      'id, readiness_answers, readiness_score, readiness_tier_id, readiness_tier_label, readiness_max_score, readiness_at',
    )
    .or(variants.map((e) => `email.eq.${e}`).join(','))
    .order('readiness_at', { ascending: false, nullsFirst: false })
    .limit(10);

  function isInDepthRow(row: { readiness_answers: unknown; readiness_max_score: unknown }): boolean {
    const answers = row.readiness_answers as unknown[] | null;
    const maxScore = row.readiness_max_score;
    return (
      (Array.isArray(answers) && answers.length === 48) ||
      (typeof maxScore === 'number' && maxScore === 192)
    );
  }

  if (profileErr) {
    console.warn('[dashboard/assessments] profile lookup error:', profileErr);
  } else if (profileRows && profileRows.length > 0) {
    // Prefer the in-depth row; fall back to the most recent (which is row[0]
    // because of the order-by above).
    const profile = profileRows.find(isInDepthRow) ?? profileRows[0];
    profileId = profile.id as string;
    const answers = profile.readiness_answers as unknown[] | null;
    hasCompleted = isInDepthRow(profile);
    if (
      typeof profile.readiness_score === 'number' &&
      typeof profile.readiness_tier_id === 'string' &&
      typeof profile.readiness_tier_label === 'string'
    ) {
      const isInDepth = hasCompleted;
      const maxScore =
        typeof profile.readiness_max_score === 'number'
          ? profile.readiness_max_score
          : isInDepth
            ? 192
            : Array.isArray(answers) && answers.length === 12
              ? 48
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
