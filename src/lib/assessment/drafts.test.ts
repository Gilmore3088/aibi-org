import { describe, expect, it } from 'vitest';
import {
  assessmentDraftExpiresAt,
  buildAssessmentResumeUrl,
  createAssessmentResumeToken,
  hashAssessmentResumeToken,
  isValidAssessmentResumeToken,
  validateAssessmentDraftInput,
} from './drafts';

const questionIds = [
  'sv-01',
  'atp-01',
  'dsr-01',
  'ps-01',
  'rf-01',
  'hr-01',
  'doc-01',
  'va-01',
  'cia-01',
  'wr-01',
  'tc-01',
  'lv-01',
];

describe('assessment draft helpers', () => {
  it('validates and normalizes a free-assessment draft', () => {
    const result = validateAssessmentDraftInput({
      email: ' Banker@Example.COM ',
      selectedQuestionIds: questionIds,
      answers: [1, 2, 3],
      currentQuestion: 3,
      phase: 'questions',
    });

    expect(result).toEqual({
      ok: true,
      draft: {
        email: 'banker@example.com',
        selectedQuestionIds: questionIds,
        answers: [1, 2, 3],
        currentQuestion: 3,
        phase: 'questions',
      },
    });
  });

  it('rejects invalid or duplicated question ids', () => {
    expect(
      validateAssessmentDraftInput({
        email: 'banker@example.com',
        selectedQuestionIds: [...questionIds.slice(0, 11), questionIds[0]],
        answers: [],
        currentQuestion: 0,
      }),
    ).toEqual({ ok: false, error: 'Duplicate question id.' });

    expect(
      validateAssessmentDraftInput({
        email: 'banker@example.com',
        selectedQuestionIds: [...questionIds.slice(0, 11), 'unknown'],
        answers: [],
        currentQuestion: 0,
      }),
    ).toEqual({ ok: false, error: 'Unknown question id.' });
  });

  it('creates opaque resume tokens and hashes them for storage', () => {
    const token = createAssessmentResumeToken();
    expect(isValidAssessmentResumeToken(token)).toBe(true);
    expect(hashAssessmentResumeToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashAssessmentResumeToken(token)).toBe(hashAssessmentResumeToken(token));
  });

  it('builds a canonical resume URL and expiry', () => {
    expect(buildAssessmentResumeUrl('abc123_ABC-xyz')).toBe(
      'https://www.aibankinginstitute.com/assessment/take?resume=abc123_ABC-xyz',
    );
    expect(assessmentDraftExpiresAt(new Date('2026-06-23T00:00:00.000Z'))).toBe(
      '2026-07-23T00:00:00.000Z',
    );
  });
});
