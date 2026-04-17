// POST /api/courses/save-post-assessment
// Saves the post-course assessment result to course_enrollments for the AiBI-P course.
//
// Security model:
//   - Requires valid Supabase auth session; verifies enrollment.user_id === user.id
//   - Only accepts a result when all 9 modules are completed (forward-only guard)
//   - Service role client used for the write after manual ownership verification
//
// Stores: post_assessment_score, post_assessment_tier_id, post_assessment_tier_label,
//         post_assessment_answers, post_assessment_dimension_scores, post_assessment_at
// These columns must exist in course_enrollments — see migration note below.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getTierV2, getDimensionScores } from '@content/assessments/v2/scoring';
import type { AssessmentQuestion } from '@content/assessments/v2/types';

const REQUIRED_MODULES = 9;

interface RequestBody {
  enrollmentId?: unknown;
  score?: unknown;
  answers?: unknown;
  questionIds?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  // Dev bypass — accept without auth so the page is testable locally.
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_DEV_BYPASS !== 'true') {
    return NextResponse.json({ success: true, dev: true });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const enrollmentId =
    typeof body.enrollmentId === 'string' ? body.enrollmentId.trim() : null;
  const score = typeof body.score === 'number' ? body.score : null;
  const answers = Array.isArray(body.answers) ? (body.answers as number[]) : null;
  const questionIds = Array.isArray(body.questionIds)
    ? (body.questionIds as string[])
    : null;

  if (!enrollmentId || score === null || !answers || !questionIds) {
    return NextResponse.json(
      { error: 'enrollmentId, score, answers, and questionIds are required.' },
      { status: 400 },
    );
  }

  if (score < 12 || score > 48) {
    return NextResponse.json(
      { error: 'Score out of valid range (12–48).' },
      { status: 422 },
    );
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const userClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() {},
    },
  });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // ── Fetch enrollment and verify ownership ───────────────────────────────────
  const serviceClient = createServiceRoleClient();
  const { data: enrollment, error: fetchError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id, completed_modules')
    .eq('id', enrollmentId)
    .single();

  if (fetchError || !enrollment) {
    return NextResponse.json({ error: 'Enrollment not found.' }, { status: 404 });
  }

  if (enrollment.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // ── Completion guard — all 9 modules must be done ───────────────────────────
  const completed: number[] = enrollment.completed_modules ?? [];
  const allComplete = Array.from({ length: REQUIRED_MODULES }, (_, i) => i + 1).every((n) =>
    completed.includes(n),
  );

  if (!allComplete) {
    return NextResponse.json(
      { error: 'All modules must be completed before taking the post-assessment.' },
      { status: 422 },
    );
  }

  // ── Compute tier and dimension scores ───────────────────────────────────────
  const { questions: questionPool } = await import('@content/assessments/v2/questions');
  const poolById = new Map(questionPool.map((q) => [q.id, q]));
  const sessionQuestions: AssessmentQuestion[] = questionIds
    .map((id) => poolById.get(id))
    .filter((q): q is AssessmentQuestion => q !== undefined);

  const tier = getTierV2(score);
  const dimensionScores = getDimensionScores(answers, sessionQuestions);

  // ── Write to course_enrollments ─────────────────────────────────────────────
  const { error: updateError } = await serviceClient
    .from('course_enrollments')
    .update({
      post_assessment_score: score,
      post_assessment_tier_id: tier.id,
      post_assessment_tier_label: tier.label,
      post_assessment_answers: answers,
      post_assessment_question_ids: questionIds,
      post_assessment_dimension_scores: dimensionScores,
      post_assessment_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);

  if (updateError) {
    console.error('[save-post-assessment] update failed:', updateError.message);
    return NextResponse.json({ error: 'Failed to save result.' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    tierId: tier.id,
    tierLabel: tier.label,
    dimensionScores,
  });
}
