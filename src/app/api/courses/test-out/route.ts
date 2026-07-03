// POST /api/courses/test-out
// Prior-experience recognition: grade a module's 3-question test-out check
// server-side and, on a full pass, mark the learner's CURRENT module
// complete — the same forward-only completion write as save-progress, so
// completed_modules stays a contiguous prefix and canAccessModule is
// untouched. The passed check is recorded in activity_responses as the
// module's packet evidence (activity_id `test-out-m{n}`).
//
// Security model mirrors save-progress (T-04-04, T-04-05):
//   - Requires a valid Supabase auth session; verifies enrollment ownership
//   - moduleNumber must equal current_module with all prior modules complete
//   - Eligibility (authored check + early-ramp rule) enforced server-side
//   - Grading is server-side; retries are allowed on a failed check

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { isPreviewAuthBypassEnabled } from '@/lib/auth/previewBypass';
import { FOUNDATION_FINAL_MODULE_NUMBER } from '@content/courses/foundation-program';
import {
  gradeTestOut,
  getTestOutCheck,
  isTestOutEligible,
} from '@content/courses/foundation-program/test-out';
import type { LearnerRole, OnboardingAnswers } from '@/types/course';

const LAST_MODULE = FOUNDATION_FINAL_MODULE_NUMBER;
const DEV_COURSE_ENROLLMENT_ID = 'dev-bypass';

interface RequestBody {
  enrollmentId?: unknown;
  moduleNumber?: unknown;
  answers?: unknown;
}

interface EnrollmentRow {
  id: string;
  user_id: string;
  completed_modules: number[];
  current_module: number;
  onboarding_answers: OnboardingAnswers | null;
}

function parseAnswers(raw: unknown): Record<string, string> | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== 'string') return null;
    answers[key] = value;
  }
  return answers;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { enrollmentId, moduleNumber: rawModuleNumber } = body;

  if (typeof enrollmentId !== 'string' || enrollmentId.trim().length === 0) {
    return NextResponse.json({ error: 'enrollmentId is required.' }, { status: 400 });
  }

  const moduleNumber = typeof rawModuleNumber === 'number' ? rawModuleNumber : NaN;
  if (!Number.isInteger(moduleNumber) || moduleNumber < 1 || moduleNumber > LAST_MODULE) {
    return NextResponse.json(
      { error: `moduleNumber must be an integer between 1 and ${LAST_MODULE}.` },
      { status: 400 }
    );
  }

  const answers = parseAnswers(body.answers);
  if (!answers) {
    return NextResponse.json(
      { error: 'answers must be a map of question id to option id.' },
      { status: 400 }
    );
  }

  if (!getTestOutCheck(moduleNumber)) {
    return NextResponse.json(
      { error: 'This module does not offer a test-out check.' },
      { status: 400 }
    );
  }

  if (
    (process.env.NODE_ENV !== 'production' || isPreviewAuthBypassEnabled()) &&
    enrollmentId === DEV_COURSE_ENROLLMENT_ID
  ) {
    const grade = gradeTestOut(moduleNumber, answers);
    return NextResponse.json({
      success: grade.passed,
      passed: grade.passed,
      correctCount: grade.correctCount,
      total: grade.total,
      nextModule: grade.passed ? moduleNumber + 1 : moduleNumber,
      localPreview: true,
    });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  // --- Authenticate user (T-04-05) ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

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

  // --- Read enrollment and verify ownership (T-04-05) ---
  const serviceClient = createServiceRoleClient();

  const { data: enrollment, error: lookupError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id, completed_modules, current_module, onboarding_answers')
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .single();

  if (lookupError || !enrollment) {
    return NextResponse.json(
      { error: 'Enrollment not found or access denied.' },
      { status: 403 }
    );
  }

  const { completed_modules, current_module, onboarding_answers } = enrollment as EnrollmentRow;

  // --- Forward-only enforcement (T-04-04): fast-forward the CURRENT module only ---
  if (moduleNumber !== current_module) {
    return NextResponse.json(
      { error: 'Module out of sequence. You may only test out of the current module.' },
      { status: 400 }
    );
  }

  for (let prior = 1; prior < moduleNumber; prior++) {
    if (!completed_modules.includes(prior)) {
      return NextResponse.json(
        { error: `Module ${prior} must be completed before completing module ${moduleNumber}.` },
        { status: 400 }
      );
    }
  }

  // --- Server-side eligibility ---
  const learnerRole: LearnerRole = onboarding_answers?.primary_role ?? 'other';
  if (!isTestOutEligible(moduleNumber, learnerRole)) {
    return NextResponse.json(
      { error: 'This module is not eligible for test-out on your path.' },
      { status: 400 }
    );
  }

  // --- Grade server-side ---
  const grade = gradeTestOut(moduleNumber, answers);
  if (!grade.passed) {
    return NextResponse.json({
      success: false,
      passed: false,
      correctCount: grade.correctCount,
      total: grade.total,
    });
  }

  // --- Record the passed check as the module's packet evidence ---
  const { error: evidenceError } = await serviceClient.from('activity_responses').insert({
    enrollment_id: enrollmentId,
    module_number: moduleNumber,
    activity_id: `test-out-m${moduleNumber}`,
    response: { ...answers, __testOut: 'passed' },
  });

  if (evidenceError) {
    return NextResponse.json(
      { error: 'Failed to record the test-out evidence. Please try again.' },
      { status: 500 }
    );
  }

  // --- Same completion write as save-progress ---
  const nextModule = moduleNumber === LAST_MODULE ? LAST_MODULE : moduleNumber + 1;
  const updatedCompleted = Array.from(new Set([...completed_modules, moduleNumber]));

  const { error: updateError } = await serviceClient
    .from('course_enrollments')
    .update({
      completed_modules: updatedCompleted,
      current_module: nextModule,
    })
    .eq('id', enrollmentId);

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to save progress. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    passed: true,
    correctCount: grade.correctCount,
    total: grade.total,
    nextModule,
  });
}
