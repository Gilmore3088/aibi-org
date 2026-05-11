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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AssessmentsResponse {
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

  // Entitlement check: course_enrollments row keyed on user_id OR email
  // (older rows may pre-date the user_id binding).
  const { data: enrollments, error: enrollErr } = await supabase
    .from('course_enrollments')
    .select('id, created_at')
    .eq('product', 'in-depth-assessment')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .order('created_at', { ascending: true });

  if (enrollErr) {
    console.error('[dashboard/assessments] enrollment query error:', enrollErr);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }

  const entitled = (enrollments ?? []).length > 0;
  const purchasedAt = entitled ? (enrollments![0].created_at as string) : null;

  // Profile + completion check. The user_profiles row exists for anyone who
  // has taken any flavor of the readiness assessment (free or in-depth).
  // We treat readiness_answers.length === 48 as the in-depth completion
  // signal — the free path stores 12-element arrays.
  let profileId: string | null = null;
  let hasCompleted = false;
  if (entitled) {
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('id, readiness_answers, readiness_version, readiness_max_score')
      .eq('email', user.email)
      .maybeSingle();
    if (profileErr) {
      console.warn('[dashboard/assessments] profile lookup error:', profileErr);
    } else if (profile) {
      profileId = profile.id as string;
      const answers = profile.readiness_answers as unknown[] | null;
      hasCompleted = Array.isArray(answers) && answers.length === 48;
    }
  }

  const body: AssessmentsResponse = {
    inDepth: entitled
      ? { entitled: true, profileId, hasCompleted, purchasedAt }
      : null,
  };
  return NextResponse.json(body);
}
