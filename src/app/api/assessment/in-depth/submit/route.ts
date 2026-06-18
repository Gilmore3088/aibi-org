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
import { questions as canonicalPool } from '@content/assessments/v4/questions';
import {
  getDimensionScores,
  normalize,
  getMaturityBand,
  type DimensionScore,
} from '@content/assessments/v4/scoring';
import { findEnrollmentByEmailOrUserIdWithRetry } from '@/lib/enrollment/findEnrollment';
import { parseRoleV4 } from '@content/assessments/v4/roles';
import { rateLimitOrFail } from '@/lib/api/rate-limit';
import { sendAssessmentBreakdown } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SubmitPayload {
  answers?: unknown;
  questionIds?: unknown;
  role?: unknown;
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

  const { answers, questionIds, role: rawRole } = body;
  // Role is optional — null falls back to un-roled Briefing framing.
  // Unknown strings parse to null rather than erroring; the assessment
  // never blocks on this field.
  const role = parseRoleV4(rawRole);

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

  // Per-user rate limit — 10 submissions per hour is plenty for legit
  // resubmission while blocking cost-abuse from a stolen session.
  const limited = await rateLimitOrFail({
    key: 'in-depth-submit',
    scope: 'user',
    identifier: user.id,
    max: 10,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  // Variant-aware entitlement lookup WITH the same post-payment retry the
  // take page uses (findEnrollment...WithRetry). The final save is the last
  // place a paid completion can be lost: a buyer who finishes fast, or whose
  // checkout webhook lagged, would otherwise get their completed 48-question
  // assessment 403-rejected here and silently dropped — the "took it right
  // when I paid, no record of finishing" symptom. Retrying absorbs the
  // webhook latency window without weakening the gate.
  const enrollment = await findEnrollmentByEmailOrUserIdWithRetry<{ id: string }>(
    supabase,
    { user, products: ['in-depth-assessment'], columns: 'id' },
    { attempts: 3, delayMs: 1500 },
  );
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
  const rawScore = typedAnswers.reduce((sum, n) => sum + n, 0);
  // v4: raw 48-192 → normalized 0-100 → 5-band maturity (Unstructured /
  // Emerging / Building Momentum / Controlled Scale / Advanced).
  const normalizedScore = normalize(rawScore);
  const band = getMaturityBand(normalizedScore);
  const v4Breakdown = getDimensionScores(typedAnswers, typedQuestions);
  // Serialize to the canonical {score, maxScore, label} shape so existing
  // dashboards (which read user_profiles.readiness_dimension_breakdown as
  // generic dimension scores) continue to work. We store the v4 normalized
  // 0-100 view per dimension; downstream consumers that want the v4-native
  // band can recover it via getMaturityBand(score) since maxScore is 100.
  const dimensionBreakdown: Record<string, { score: number; maxScore: number; label: string }> = {};
  for (const [key, dim] of Object.entries(v4Breakdown) as [string, DimensionScore][]) {
    dimensionBreakdown[key] = {
      score: dim.normalized,
      maxScore: 100,
      label: dim.label,
    };
  }

  // ── Persist the result ───────────────────────────────────────────────────
  const completedAt = new Date().toISOString();
  let profileId: string | null = null;

  try {
    const result = await upsertReadinessResult(
      user.email,
      {
        // Persist the normalized 0-100 score as readiness_score so the
        // existing dashboard and certificate surfaces continue to read a
        // single number; raw is preserved inside answers and is
        // reconstructable from the breakdown.
        score: normalizedScore,
        tierId: band.id,
        tierLabel: band.label,
        answers: typedAnswers,
        completedAt,
        version: 'v4',
        maxScore: 100,
        dimensionBreakdown,
      },
      { role },
    );
    profileId = result.id;
  } catch (err) {
    console.error('[in-depth/submit] user_profiles upsert error:', err);
    return NextResponse.json({ error: 'Could not save result.' }, { status: 500 });
  }

  // ── Durable recovery: email the briefing link ─────────────────────────────
  // The paid flow previously sent NO results email — the only path to the
  // briefing was the in-browser redirect, so a closed tab or interrupted
  // redirect stranded a completed assessment with no way back ("the results
  // were never mailed"). Send the bearer /results/{id} link now. Best-effort:
  // a mail failure must never fail an already-persisted result. Reuses the
  // published assessment-results-breakdown template, mapping the v4 maturity
  // band onto the tier copy fields.
  if (profileId) {
    try {
      await sendAssessmentBreakdown({
        email: user.email,
        score: normalizedScore,
        maxScore: 100,
        tierId: band.id,
        tierLabel: band.label,
        tierHeadline: band.label,
        tierSummary: band.meaning,
        dimensionBreakdown,
        profileId,
      });
    } catch (err) {
      console.warn('[in-depth/submit] results email skipped:', err);
    }
  }

  return NextResponse.json({ ok: true, profileId });
}
