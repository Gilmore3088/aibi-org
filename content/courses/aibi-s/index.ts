// AiBI-S Course Content — Barrel Export
// Usage: import { weeks, getWeekByNumber, PHASE_META, ROLE_TRACK_META } from '@content/courses/aibi-s'

export * from './types';
export { week1 } from './weeks/week-1';
export { week2 } from './weeks/week-2';
export { week3 } from './weeks/week-3';
export { week4 } from './weeks/week-4';
export { week5 } from './weeks/week-5';
export { week6 } from './weeks/week-6';

import { week1 } from './weeks/week-1';
import { week2 } from './weeks/week-2';
import { week3 } from './weeks/week-3';
import { week4 } from './weeks/week-4';
import { week5 } from './weeks/week-5';
import { week6 } from './weeks/week-6';
import type { CohortWeek } from './types';

export const weeks: readonly CohortWeek[] = [week1, week2, week3, week4, week5, week6] as const;

export function getWeekByNumber(n: number): CohortWeek | undefined {
  return weeks.find((w) => w.number === n);
}
