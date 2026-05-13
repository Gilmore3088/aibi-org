// POST /api/assessment/in-depth/submit
// Persists a completed paid In-Depth Assessment (48 questions) for the
// currently-authenticated user. Requires:
//   1. A valid Supabase auth session (user must be logged in)
//   2. A course_enrollments row with product='in-depth-assessment' for the
//      user (purchased via /api/checkout/in-depth)
//
// Differs from /api/capture-email which is the public 12-question free path
// — this route does NOT have an email gate, does NOT subscribe to ConvertKit
// marketing forms, and does NOT enforce the 8/12 answer-length cap.
//
// Server-side scoring (2026-05-12): the client submits only `answers` and
// `questionIds` (the order the user saw the questions in). The server
// recomputes score, maxScore, tier, and dimensionBreakdown from canonical
// data — the client cannot dictate scoring values. questionIds are
// validated as an exact permutation of the canonical 48-question pool.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { upsertReadinessResult } from '@/lib/supabase/user-profiles';
import { questions as canonicalPool } from '@content/assessments/v2/questions';
import {
  getDimensionScores,
  getTierInDepth,
  type DimensionScore,
} from '@content/assessments/v2/scoring';
import { emailVariants } from '@/lib/email/canonicalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SubmitPayload {
  answers?: unknown;
  questionIds?: unknown;
}

const EXPECTED_QUESTION_COUNT = 48;
const POOL_BY_ID = new Map(canonicalPool.map((q) => [q.id, q]));

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Server not configured.' },
      { status: 503 },
    );
  }

  let body: SubmitPayload;
  try {
    body = (await request.json()) as SubmitPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { answers, questionIds } = body;

  if (!Array.isArray(answers) || answers.length !== EXPECTED_QUESTION_COUNT) {
    return NextResponse.json(
      { error: `answers must be an array of ${EXPECTED_QUESTION_COUNT} integers (1-4).` },
      { status: 400 },
    );
  }
  if (
    !answers.every(
      (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 4,
    )
  ) {
    return NextResponse.json(
      { error: 'answers entries must be integers 1-4.' },
      { status: 400 },
    );
  }
  if (
    !Array.isArray(questionIds) ||
    questionIds.length !== EXPECTED_QUESTION_COUNT
  ) {
    return NextResponse.json(
      { error: `questionIds must be an array of ${EXPECTED_QUESTION_COUNT} strings.` },
      { status: 400 },
    );
  }
  if (!questionIds.every((id): id is string => typeof id === 'string')) {
    return NextResponse.json(
      { error: 'questionIds entries must be strings.' },
      { status: 400 },
    );
  }

  // questionIds must be an exact permutation of the canonical pool:
  // every id present, no duplicates, no unknown ids. This is the trust
  // boundary — once it holds, server scoring is deterministic.
  const idSet = new Set(questionIds);
  if (idSet.size !== EXPECTED_QUESTION_COUNT) {
    return NextResponse.json(
      { error: 'questionIds contains duplicates.' },
      { status: 400 },
    );
  }
  const orderedQuestions = (questionIds as string[]).map((id) => POOL_BY_ID.get(id));
  if (orderedQuestions.some((q) => !q)) {
    return NextResponse.json(
      { error: 'questionIds contains unknown question id(s).' },
      { status: 400 },
    );
  }

  // ── Auth + entitlement gate ───────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();
  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  // Variant-aware entitlement lookup — matches the take page + dashboard
  // patterns so Gmail "+alias" buyers are not locked out.
  const variants = emailVariants(user.email);
  const emailClause = variants.map((e) => `email.eq.${e}`).join(',');
  const { data: enrollment, error: enrollErr } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('product', 'in-depth-assessment')
    .or(`user_id.eq.${user.id},${emailClause}`)
    .limit(1)
    .maybeSingle();

  if (enrollErr) {
    console.error('[in-depth/submit] enrollment lookup error:', enrollErr);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
  if (!enrollment) {
    return NextResponse.json(
      { error: 'No In-Depth Assessment purchase found for this account.' },
      { status: 403 },
    );
  }

  // ── Server-side scoring ──────────────────────────────────────────────────
  // Compute everything from the validated (answers, orderedQuestions) pair.
  // No client-supplied scoring fields are read.
  const typedQuestions = orderedQuestions.map((q) => q!);
  const typedAnswers = answers as number[];
  const score = typedAnswers.reduce((sum, n) => sum + n, 0);
  const maxScore = EXPECTED_QUESTION_COUNT * 4;
  const tier = getTierInDepth(score, maxScore);
  const dimensionBreakdown: Record<string, DimensionScore> = getDimensionScores(
    typedAnswers,
    typedQuestions,
  );

  // ── Persist the result ───────────────────────────────────────────────────
  const completedAt = new Date().toISOString();
  let profileId: string | null = null;

  try {
    const result = await upsertReadinessResult(user.email, {
      score,
      tierId: tier.id,
      tierLabel: tier.label,
      answers: typedAnswers,
      completedAt,
      version: 'v2',
      maxScore,
      dimensionBreakdown,
    });
    profileId = result.id;
  } catch (err) {
    console.error('[in-depth/submit] user_profiles upsert error:', err);
    return NextResponse.json({ error: 'Could not save result.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profileId });
}
