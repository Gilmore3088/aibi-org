import { NextResponse } from 'next/server';
import {
  hashAssessmentResumeToken,
  isValidAssessmentResumeToken,
  type AssessmentDraftState,
} from '@/lib/assessment/drafts';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface DraftRow {
  readonly selected_question_ids: string[];
  readonly answers: unknown;
  readonly current_question: number;
  readonly phase: AssessmentDraftState['phase'];
  readonly expires_at: string;
}

function parseAnswers(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is number => typeof entry === 'number')
    : [];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const { token } = await params;
  if (!isValidAssessmentResumeToken(token)) {
    return NextResponse.json({ ok: false, error: 'Resume link not found.' }, { status: 404 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Resume links are temporarily unavailable.' },
      { status: 503 },
    );
  }

  try {
    const service = createServiceRoleClient();
    const { data, error } = await service
      .from('assessment_drafts')
      .select('selected_question_ids, answers, current_question, phase, expires_at')
      .eq('token_hash', hashAssessmentResumeToken(token))
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: 'Resume link not found.' }, { status: 404 });
    }

    const row = data as DraftRow;
    if (Date.parse(row.expires_at) <= Date.now()) {
      return NextResponse.json({ ok: false, error: 'Resume link expired.' }, { status: 410 });
    }

    await service
      .from('assessment_drafts')
      .update({ last_resumed_at: new Date().toISOString() })
      .eq('token_hash', hashAssessmentResumeToken(token));

    return NextResponse.json({
      ok: true,
      draft: {
        selectedQuestionIds: row.selected_question_ids,
        answers: parseAnswers(row.answers),
        currentQuestion: row.current_question,
        phase: row.phase,
      } satisfies AssessmentDraftState,
    });
  } catch (err) {
    console.warn('[assessment/drafts/:token] lookup skipped:', err);
    return NextResponse.json(
      { ok: false, error: 'Resume links are temporarily unavailable.' },
      { status: 503 },
    );
  }
}
