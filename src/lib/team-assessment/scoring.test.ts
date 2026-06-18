import { describe, expect, it } from 'vitest';
import { questions } from '@content/assessments/v4/questions';
import { scoreTeamAssessmentResponse } from './scoring';

describe('scoreTeamAssessmentResponse', () => {
  const questionIds = questions.map((q) => q.id);

  it('scores the full 48-question v4 instrument on the normalized 0-100 scale', () => {
    const result = scoreTeamAssessmentResponse(
      Array.from({ length: questions.length }, () => 4),
      questionIds,
    );

    expect(result.score).toBe(100);
    expect(result.band.id).toBe('advanced');
    expect(Object.values(result.dimensionBreakdown).every((dim) => dim.score === 100)).toBe(true);
  });

  it('rejects incomplete answer payloads', () => {
    expect(() => scoreTeamAssessmentResponse([1, 2, 3], questionIds)).toThrow(/48/);
  });

  it('rejects duplicate question ids', () => {
    const duplicated = [...questionIds];
    duplicated[1] = duplicated[0];
    expect(() =>
      scoreTeamAssessmentResponse(
        Array.from({ length: questions.length }, () => 2),
        duplicated,
      ),
    ).toThrow(/duplicates/);
  });
});
