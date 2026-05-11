// POST /api/certifications/exam/submit
//
// Records a Foundation final exam attempt. Currently a verification-only
// stub — persistence is intentionally deferred until an `exam_results`
// schema exists. The handler:
//
//   1. Verifies the request has a valid Supabase auth session
//   2. Verifies the caller has a course_enrollments row for 'foundation'
//   3. Validates the request body shape
//   4. Returns the parsed attempt summary (no DB write yet)
//
// TODO(2026-05-11): once an `exam_results` table is added (with columns
// for user_id, exam_id, total_correct, total_questions, pct_correct,
// proficiency, topic_scores jsonb, answers jsonb, submitted_at), perform
// the insert here and return the row id.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { normalizeProduct, dbReadValues } from '@/lib/products/normalize';

interface TopicScoreInput {
  readonly topic: unknown;
  readonly correct: unknown;
  readonly total: unknown;
  readonly pct: unknown;
}

interface AnswerInput {
  readonly questionId: unknown;
  readonly key: unknown;
}

interface RequestBody {
  examId?: unknown;
  totalCorrect?: unknown;
  totalQuestions?: unknown;
  pctCorrect?: unknown;
  proficiency?: unknown;
  topicScores?: unknown;
  answers?: unknown;
}

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { examId, totalCorrect, totalQuestions, pctCorrect, proficiency } = body;

  if (typeof examId !== 'string' || examId !== 'foundation') {
    return NextResponse.json({ error: 'Unknown examId.' }, { status: 400 });
  }
  if (!isIntInRange(totalQuestions, 1, 100)) {
    return NextResponse.json({ error: 'Invalid totalQuestions.' }, { status: 400 });
  }
  if (!isIntInRange(totalCorrect, 0, totalQuestions)) {
    return NextResponse.json({ error: 'Invalid totalCorrect.' }, { status: 400 });
  }
  if (!isIntInRange(pctCorrect, 0, 100)) {
    return NextResponse.json({ error: 'Invalid pctCorrect.' }, { status: 400 });
  }
  if (proficiency !== null && typeof proficiency !== 'string') {
    return NextResponse.json({ error: 'Invalid proficiency.' }, { status: 400 });
  }
  if (!Array.isArray(body.topicScores) || !Array.isArray(body.answers)) {
    return NextResponse.json(
      { error: 'topicScores and answers must be arrays.' },
      { status: 400 },
    );
  }

  // Shallow validation of array members — defensive but not exhaustive.
  for (const t of body.topicScores as readonly TopicScoreInput[]) {
    if (typeof t?.topic !== 'string' || typeof t?.correct !== 'number' || typeof t?.total !== 'number') {
      return NextResponse.json({ error: 'Invalid topicScores entry.' }, { status: 400 });
    }
  }
  for (const a of body.answers as readonly AnswerInput[]) {
    if (typeof a?.questionId !== 'string' || typeof a?.key !== 'string') {
      return NextResponse.json({ error: 'Invalid answers entry.' }, { status: 400 });
    }
  }

  // --- Authenticate user ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const anonClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Route Handlers
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

  // --- Verify enrollment ---
  // The exam is only available to enrolled learners. We accept any
  // course_enrollments row that normalizes to the 'foundation' product
  // (handles both legacy 'aibi-p' and current 'foundation'/'foundations'
  // values per the 2026-05-11 rename shim).
  const serviceClient = createServiceRoleClient();
  const productFilterValues = dbReadValues('foundation');
  const { data: enrollment, error: lookupError } = await serviceClient
    .from('course_enrollments')
    .select('id, product')
    .eq('user_id', user.id)
    .in('product', productFilterValues)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 });
  }
  if (!enrollment || normalizeProduct(enrollment.product) !== 'foundation') {
    return NextResponse.json({ error: 'Enrollment required.' }, { status: 403 });
  }

  // TODO(2026-05-11): persist this attempt once an `exam_results` schema
  // exists. The DB write should be a single INSERT with the validated
  // body fields plus user.id, enrollment.id, and a server-side timestamp.
  // For now, return the result so the client can move on without a 500.
  return NextResponse.json({
    success: true,
    persisted: false,
    note: 'Attempt validated. Persistence deferred until exam_results schema lands.',
    summary: {
      examId,
      totalCorrect,
      totalQuestions,
      pctCorrect,
      proficiency,
    },
  });
}
