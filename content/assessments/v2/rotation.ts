// AiBI Readiness Assessment — v2 Rotation Logic
// Fisher-Yates selection: 1 question per dimension (8) + 4 random from remaining pool = 12.

import { questions } from './questions';
import type { AssessmentQuestion } from './types';
import type { Dimension } from './types';

function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectQuestions(
  pool: readonly AssessmentQuestion[] = questions
): AssessmentQuestion[] {
  // 1. Group questions by dimension
  const byDimension = new Map<Dimension, AssessmentQuestion[]>();
  for (const question of pool) {
    const bucket = byDimension.get(question.dimension) ?? [];
    bucket.push(question);
    byDimension.set(question.dimension, bucket);
  }

  // 2. Fisher-Yates shuffle within each dimension bucket, pick 1 per dimension
  const selected: AssessmentQuestion[] = [];
  const selectedIds = new Set<string>();

  for (const bucket of Array.from(byDimension.values())) {
    const shuffled = fisherYatesShuffle(bucket);
    selected.push(shuffled[0]);
    selectedIds.add(shuffled[0].id);
  }

  // 3. Collect remaining unused questions
  const remaining = pool.filter((q) => !selectedIds.has(q.id));

  // 4. Fisher-Yates shuffle the remaining pool
  const shuffledRemaining = fisherYatesShuffle(remaining);

  // 5. Pick 4 from remaining (total: 8 + 4 = 12)
  const additional = shuffledRemaining.slice(0, 4);
  const allSelected = [...selected, ...additional];

  // 6. Fisher-Yates shuffle the final 12 questions for presentation order
  return fisherYatesShuffle(allSelected);
}
