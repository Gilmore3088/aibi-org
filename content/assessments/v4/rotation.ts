// v4 rotation — the In-Depth Diagnostic always asks all 48 questions.
// (Free v3 rotates; paid v4 does not.)
//
// We still shuffle the order on each session so question order does not
// feel rote across multiple takes (operator + spouse, two team members
// comparing notes). Order shuffle is purely cosmetic; scoring sums all
// 48 regardless of order.

import { questions as questionPool } from './questions';
import type { AssessmentQuestion } from './types';

function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectAllQuestions(
  pool: readonly AssessmentQuestion[] = questionPool,
): AssessmentQuestion[] {
  return fisherYatesShuffle(pool);
}
