// AiBI Readiness Assessment — v3 Rotation Logic
// v3 is a flat 12-question pool; there is no rotation. selectQuestions
// returns all 12 in declared order (Strategic Value → Vendor Risk), which
// is a deliberate narrative arc — business value first, infrastructure and
// data next, security and compliance in the middle, talent and oversight
// last. Shuffling would break the flow without buying anything.

import { questions } from './questions';
import type { AssessmentQuestion } from './types';

export function selectQuestions(
  pool: readonly AssessmentQuestion[] = questions,
): AssessmentQuestion[] {
  return [...pool];
}
