// POST /api/indepth/submit-answers
//
// Persists the 48 answers for a paid In-Depth Assessment taker, then
// best-effort tags the subscriber for the completion sequence. The taker
// is identified by the row id returned to the client by the take page —
// the row already exists (created at provisionEnrollment time), this
// endpoint only updates it.
//
// Validation only — DB happy path is exercised by manual QA / Task 20.

import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { questions } from '@content/assessments/v2/questions';
import { getTierV2 } from '@content/assessments/v2/scoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOTAL_QUESTIONS = 48;
const MIN_SCORE = 1;
const MAX_SCORE = 4;
const ALL_QUESTION_IDS = new Set(questions.map((q) => q.id));

interface SubmitBody {
  readonly takerId: string;
  readonly answers: Record<string, number>;
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  if (!body || typeof body !== 'object') {
    return badRequest('body must be a JSON object');
  }

  const { takerId, answers } = body as Partial<SubmitBody>;

  if (typeof takerId !== 'string' || takerId.length === 0) {
    return badRequest('takerId required');
  }

  if (!answers || typeof answers !== 'object') {
    return badRequest('answers required');
  }

  const entries = Object.entries(answers);
  if (entries.length !== TOTAL_QUESTIONS) {
    return badRequest(`must answer all ${TOTAL_QUESTIONS} questions`);
  }

  for (const [qid, score] of entries) {
    if (!ALL_QUESTION_IDS.has(qid)) {
      return badRequest(`unknown question id: ${qid}`);
    }
    if (
      typeof score !== 'number' ||
      !Number.isInteger(score) ||
      score < MIN_SCORE ||
      score > MAX_SCORE
    ) {
      return badRequest(`invalid score for ${qid}`);
    }
  }

  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const perDim: Record<string, number> = {};
  for (const q of questions) {
    perDim[q.dimension] = (perDim[q.dimension] ?? 0) + (answers[q.id] ?? 0);
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('indepth_assessment_takers')
    .update({
      completed_at: new Date().toISOString(),
      score_total: total,
      score_per_dimension: perDim,
      answers,
    })
    .eq('id', takerId);

  if (error) {
    return NextResponse.json({ error: 'persist failed' }, { status: 500 });
  }

  // Best-effort: send completion email + tag for completion sequence.
  // Never blocks success. Both side effects share a single email fetch.
  try {
    const { data: row } = await supabase
      .from('indepth_assessment_takers')
      .select('invite_email')
      .eq('id', takerId)
      .single();
    if (row?.invite_email) {
      // In-Depth max = 48 questions × 4 = 192; getTierV2 normalizes to 12-48 scale.
      const tier = getTierV2(total, 192);
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibankinginstitute.com';
      const resultsUrl = `${origin}/results/in-depth/${takerId}`;

      const [{ sendIndepthIndividualResults }, { tagSubscriberByEnv }] =
        await Promise.all([
          import('@/lib/resend'),
          import('@/lib/convertkit/sequences'),
        ]);

      await Promise.allSettled([
        sendIndepthIndividualResults({
          email: row.invite_email,
          resultsUrl,
          score: total,
          tierLabel: tier.label,
        }),
        tagSubscriberByEnv({
          email: row.invite_email,
          tagIdEnv: 'CONVERTKIT_TAG_ID_INDEPTH_COMPLETER',
          tagName: 'indepth-assessment-completer',
        }),
      ]);
    }
  } catch {
    // swallow — completion succeeds even if email/tagging fails
  }

  return NextResponse.json({ ok: true, takerId, score: total });
}
