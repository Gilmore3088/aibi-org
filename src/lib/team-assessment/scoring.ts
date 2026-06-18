import { questions as canonicalPool } from '@content/assessments/v4/questions';
import {
  getDimensionScores,
  getMaturityBand,
  normalize,
  type DimensionScore,
} from '@content/assessments/v4/scoring';
import type { AssessmentQuestion, Dimension, MaturityBand } from '@content/assessments/v4/types';

export interface TeamAssessmentScore {
  readonly answers: readonly number[];
  readonly questionIds: readonly string[];
  readonly score: number;
  readonly band: MaturityBand;
  readonly dimensionBreakdown: Record<
    Dimension,
    { readonly score: number; readonly maxScore: 100; readonly label: string }
  >;
}

const EXPECTED_QUESTION_COUNT = canonicalPool.length;
const POOL_BY_ID = new Map(canonicalPool.map((q) => [q.id, q]));

export function scoreTeamAssessmentResponse(
  answersInput: unknown,
  questionIdsInput: unknown,
): TeamAssessmentScore {
  if (!Array.isArray(answersInput) || answersInput.length !== EXPECTED_QUESTION_COUNT) {
    throw new Error(`answers must be an array of ${EXPECTED_QUESTION_COUNT} integers.`);
  }
  if (
    !answersInput.every(
      (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 4,
    )
  ) {
    throw new Error('answers entries must be integers 1-4.');
  }
  if (!Array.isArray(questionIdsInput) || questionIdsInput.length !== EXPECTED_QUESTION_COUNT) {
    throw new Error(`questionIds must be an array of ${EXPECTED_QUESTION_COUNT} strings.`);
  }
  if (!questionIdsInput.every((id): id is string => typeof id === 'string')) {
    throw new Error('questionIds entries must be strings.');
  }

  const questionIds = questionIdsInput as string[];
  const idSet = new Set(questionIds);
  if (idSet.size !== EXPECTED_QUESTION_COUNT) {
    throw new Error('questionIds contains duplicates.');
  }

  const orderedQuestions = questionIds.map((id) => POOL_BY_ID.get(id));
  if (orderedQuestions.some((q) => !q)) {
    throw new Error('questionIds contains unknown question id(s).');
  }

  const answers = answersInput as number[];
  const typedQuestions = orderedQuestions as AssessmentQuestion[];
  const rawScore = answers.reduce((sum, n) => sum + n, 0);
  const score = normalize(rawScore);
  const band = getMaturityBand(score);
  const v4Breakdown = getDimensionScores(answers, typedQuestions);

  const dimensionBreakdown = {} as TeamAssessmentScore['dimensionBreakdown'];
  for (const [key, dim] of Object.entries(v4Breakdown) as [Dimension, DimensionScore][]) {
    dimensionBreakdown[key] = {
      score: dim.normalized,
      maxScore: 100,
      label: dim.label,
    };
  }

  return {
    answers,
    questionIds,
    score,
    band,
    dimensionBreakdown,
  };
}
