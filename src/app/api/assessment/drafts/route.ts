import { NextResponse } from 'next/server';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import {
  ASSESSMENT_DRAFT_TTL_DAYS,
  assessmentDraftExpiresAt,
  buildAssessmentResumeUrl,
  createAssessmentResumeToken,
  hashAssessmentResumeToken,
  validateAssessmentDraftInput,
} from '@/lib/assessment/drafts';
import { sendAssessmentResumeLink } from '@/lib/resend';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const limitedIp = await rateLimitOrFail({
    key: 'assessment-draft',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 8,
    windowSeconds: 3600,
  });
  if (limitedIp) return limitedIp;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = validateAssessmentDraftInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const limitedEmail = await rateLimitOrFail({
    key: 'assessment-draft',
    scope: 'email',
    identifier: parsed.draft.email,
    max: 4,
    windowSeconds: 3600,
  });
  if (limitedEmail) return limitedEmail;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Resume links are temporarily unavailable.' },
      { status: 503 },
    );
  }

  const token = createAssessmentResumeToken();
  const resumeUrl = buildAssessmentResumeUrl(token);
  const expiresAt = assessmentDraftExpiresAt();

  try {
    const service = createServiceRoleClient();
    const { error } = await service.from('assessment_drafts').insert({
      email: parsed.draft.email,
      token_hash: hashAssessmentResumeToken(token),
      selected_question_ids: parsed.draft.selectedQuestionIds,
      answers: parsed.draft.answers,
      current_question: parsed.draft.currentQuestion,
      phase: parsed.draft.phase,
      last_sent_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    if (error) {
      console.warn('[assessment/drafts] insert failed:', error.message);
      return NextResponse.json(
        { ok: false, error: 'Resume links are temporarily unavailable.' },
        { status: 503 },
      );
    }

    const result = await sendAssessmentResumeLink({
      email: parsed.draft.email,
      resumeUrl,
      currentQuestion: parsed.draft.currentQuestion + 1,
      totalQuestions: parsed.draft.selectedQuestionIds.length,
      expiresInDays: ASSESSMENT_DRAFT_TTL_DAYS,
    });

    if ('ok' in result && result.ok === false) {
      console.warn('[assessment/drafts] resume email failed:', result.error);
    }
  } catch (err) {
    console.warn('[assessment/drafts] skipped:', err);
    return NextResponse.json(
      { ok: false, error: 'Resume links are temporarily unavailable.' },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Check your email for a resume link.',
    expiresAt,
  });
}
