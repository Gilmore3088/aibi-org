// POST /api/courses/save-onboarding
// Persists onboarding answers to course_enrollments.onboarding_answers.
//
// Security model (T-04-01, T-04-02, T-04-03):
//   - T-04-03: Requires valid Supabase auth session (getUser check)
//   - T-04-02: Verifies enrollment.user_id === authenticated user before write
//   - T-04-01: Validates OnboardingAnswers shape server-side; rejects unknown/invalid input
//   - Service role client used for write after manual ownership verification (bypasses RLS safely)

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { OnboardingAnswers, LearnerRole } from '@/types/course';

const VALID_M365_VALUES = new Set<string>(['yes', 'no', 'not_sure']);

const VALID_ROLES = new Set<string>([
  'lending',
  'operations',
  'compliance',
  'finance',
  'marketing',
  'it',
  'retail',
  'executive',
  'other',
]);

/**
 * Server-side validation of the OnboardingAnswers shape.
 * Returns a typed OnboardingAnswers on success, or a string error message on failure.
 */
function validateAnswers(raw: unknown): OnboardingAnswers | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return 'answers must be an object';
  }

  const obj = raw as Record<string, unknown>;

  if (!VALID_M365_VALUES.has(obj.uses_m365 as string)) {
    return 'uses_m365 must be "yes", "no", or "not_sure"';
  }

  if (!Array.isArray(obj.personal_ai_subscriptions)) {
    return 'personal_ai_subscriptions must be an array';
  }
  if (
    !(obj.personal_ai_subscriptions as unknown[]).every((s) => typeof s === 'string')
  ) {
    return 'personal_ai_subscriptions must contain only strings';
  }

  if (!VALID_ROLES.has(obj.primary_role as string)) {
    return `primary_role must be a valid LearnerRole value`;
  }

  return {
    uses_m365: obj.uses_m365 as OnboardingAnswers['uses_m365'],
    personal_ai_subscriptions: obj.personal_ai_subscriptions as string[],
    primary_role: obj.primary_role as LearnerRole,
  };
}

interface RequestBody {
  enrollmentId?: unknown;
  answers?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_DEV_BYPASS !== 'true') {
    return NextResponse.json({ success: true, dev: true });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  // --- Parse body ---
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { enrollmentId, answers: rawAnswers } = body;

  if (typeof enrollmentId !== 'string' || enrollmentId.trim().length === 0) {
    return NextResponse.json({ error: 'enrollmentId is required.' }, { status: 400 });
  }

  // --- Validate answers shape (T-04-01) ---
  const answersResult = validateAnswers(rawAnswers);
  if (typeof answersResult === 'string') {
    return NextResponse.json({ error: answersResult }, { status: 400 });
  }
  const answers = answersResult;

  // --- Authenticate user (T-04-03) ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const anonClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Route Handlers — session kept alive by middleware
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await anonClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  // --- Verify enrollment belongs to this user (T-04-02) ---
  const serviceClient = createServiceRoleClient();

  const { data: enrollment, error: lookupError } = await serviceClient
    .from('course_enrollments')
    .select('id')
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .single();

  if (lookupError || !enrollment) {
    return NextResponse.json(
      { error: 'Enrollment not found or access denied.' },
      { status: 403 }
    );
  }

  // --- Persist onboarding answers ---
  const { error: updateError } = await serviceClient
    .from('course_enrollments')
    .update({ onboarding_answers: answers })
    .eq('id', enrollmentId);

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to save responses. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
