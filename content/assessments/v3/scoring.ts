// AiBI Readiness Assessment — v3 Scoring Rubric
// Score range: 12 (all 1s across 12 questions) to 48 (all 4s across 12 questions).
// Tier bands are identical to v2 — same four ids so any downstream consumer
// that has already keyed on the tier id (sequences, dashboards) continues
// to work without branching on assessment version.

import type { Dimension, AssessmentQuestion } from './types';
import { DIMENSION_LABELS } from './types';
import { tiers } from '@content/assessments/shared/free-readiness';
import type { Tier } from '@content/assessments/shared/free-readiness';

// Tier bands are shared with v2 (same four ids) so any downstream consumer
// that has already keyed on the tier id (sequences, dashboards) continues to
// work without branching on assessment version. Re-exported here so existing
// `import { tiers, type Tier } from '.../v3/scoring'` consumers keep working.
export { tiers };
export type { Tier };

export function getTierV3(totalScore: number): Tier {
  const match = tiers.find((t) => totalScore >= t.min && totalScore <= t.max);
  if (!match) {
    throw new Error(`Score ${totalScore} is outside the valid range of 12-48.`);
  }
  return match;
}

export interface DimensionScore {
  readonly score: number;
  readonly maxScore: number;
  readonly label: string;
}

// In v3 each dimension has exactly one question, so getDimensionScores
// returns 12 single-question entries. Kept for shape-compatibility with the
// v2 hook contract; the output surface that will read this is scheduled
// for replacement.
export function getDimensionScores(
  answers: readonly number[],
  sessionQuestions: readonly AssessmentQuestion[],
): Record<Dimension, DimensionScore> {
  const result = {} as Record<Dimension, DimensionScore>;

  for (const dim of Object.keys(DIMENSION_LABELS) as Dimension[]) {
    result[dim] = { score: 0, maxScore: 4, label: DIMENSION_LABELS[dim] };
  }

  sessionQuestions.forEach((question, idx) => {
    const points = answers[idx] ?? 0;
    result[question.dimension] = {
      score: points,
      maxScore: 4,
      label: DIMENSION_LABELS[question.dimension],
    };
  });

  return result;
}
