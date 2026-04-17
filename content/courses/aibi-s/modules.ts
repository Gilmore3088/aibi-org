// AiBI-S Course Module Map
// Imports all 6 week files and exports as typed array + lookup function
// Follows the same pattern as content/courses/aibi-p/modules.ts

import type { CohortWeek } from './types';
import { week1 } from './weeks/week-1';
import { week2 } from './weeks/week-2';
import { week3 } from './weeks/week-3';
import { week4 } from './weeks/week-4';
import { week5 } from './weeks/week-5';
import { week6 } from './weeks/week-6';

export const weeks: readonly CohortWeek[] = [
  week1, week2, week3, week4, week5, week6,
] as const;

export function getWeekByNumber(n: number): CohortWeek | undefined {
  return weeks.find((w) => w.number === n);
}

export function getWeeksByPhase(phase: CohortWeek['phase']): readonly CohortWeek[] {
  return weeks.filter((w) => w.phase === phase);
}
