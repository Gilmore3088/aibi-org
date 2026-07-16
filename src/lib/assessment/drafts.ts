import { createHash, randomBytes } from 'node:crypto';
import { questions as questionPool } from '@content/assessments/v3/questions';
import { getCanonicalSiteUrl } from '@/lib/supabase/auth-admin';
import { EMAIL_RE } from '@/lib/email/validate';

export const ASSESSMENT_DRAFT_TTL_DAYS = 30;
export const ASSESSMENT_DRAFT_QUESTIONS_PER_SESSION = 12;
export type AssessmentPhase = 'questions' | 'score' | 'results';

const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;
const VALID_PHASES: ReadonlySet<AssessmentPhase> = new Set(['questions', 'score', 'results']);
const QUESTION_IDS = new Set(questionPool.map((question) => question.id));

export interface AssessmentDraftState {
  readonly selectedQuestionIds: readonly string[];
  readonly answers: readonly number[];
  readonly currentQuestion: number;
  readonly phase: AssessmentPhase;
}

export interface AssessmentDraftInput extends AssessmentDraftState {
  readonly email: string;
}

export type AssessmentDraftValidation =
  | { ok: true; draft: AssessmentDraftInput }
  | { ok: false; error: string };

function isAnswer(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 4;
}

export function validateAssessmentDraftInput(value: unknown): AssessmentDraftValidation {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { ok: false, error: 'Invalid payload.' };
  }

  const input = value as Record<string, unknown>;
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Enter a valid email address.' };

  if (!Array.isArray(input.selectedQuestionIds)) {
    return { ok: false, error: 'Missing selected questions.' };
  }
  const selectedQuestionIds = input.selectedQuestionIds;
  if (selectedQuestionIds.length !== ASSESSMENT_DRAFT_QUESTIONS_PER_SESSION) {
    return { ok: false, error: 'Invalid question set.' };
  }
  if (
    !selectedQuestionIds.every(
      (id): id is string => typeof id === 'string' && QUESTION_IDS.has(id),
    )
  ) {
    return { ok: false, error: 'Unknown question id.' };
  }

  const uniqueIds = new Set(selectedQuestionIds);
  if (uniqueIds.size !== selectedQuestionIds.length) {
    return { ok: false, error: 'Duplicate question id.' };
  }

  if (!Array.isArray(input.answers)) return { ok: false, error: 'Missing answers.' };
  const answers = input.answers;
  if (answers.length > ASSESSMENT_DRAFT_QUESTIONS_PER_SESSION) {
    return { ok: false, error: 'Too many answers.' };
  }
  if (!answers.every(isAnswer)) {
    return { ok: false, error: 'Invalid answers.' };
  }

  const currentQuestion =
    typeof input.currentQuestion === 'number' && Number.isInteger(input.currentQuestion)
      ? input.currentQuestion
      : answers.length;
  if (currentQuestion < 0 || currentQuestion >= ASSESSMENT_DRAFT_QUESTIONS_PER_SESSION) {
    return { ok: false, error: 'Invalid current question.' };
  }

  const phase =
    typeof input.phase === 'string' && VALID_PHASES.has(input.phase as AssessmentPhase)
      ? (input.phase as AssessmentPhase)
      : 'questions';

  return {
    ok: true,
    draft: {
      email,
      selectedQuestionIds: [...selectedQuestionIds],
      answers: [...answers],
      currentQuestion,
      phase,
    },
  };
}

export function createAssessmentResumeToken(): string {
  return randomBytes(32).toString('base64url');
}

export function isValidAssessmentResumeToken(token: string): boolean {
  return TOKEN_RE.test(token);
}

export function hashAssessmentResumeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function buildAssessmentResumeUrl(token: string): string {
  const url = new URL('/assessment/take', getCanonicalSiteUrl());
  url.searchParams.set('resume', token);
  return url.toString();
}

export function assessmentDraftExpiresAt(now = new Date()): string {
  return new Date(now.getTime() + ASSESSMENT_DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
