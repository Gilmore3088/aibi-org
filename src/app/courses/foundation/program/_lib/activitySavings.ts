// Per-module time-savings data for the Foundation course.
// Used by TimeSavingsCard (in-flow, per-activity) and the post-course
// assessment (cumulative annual hours headline). Single source of truth.

export type SavingsMode = 'recurring' | 'one-time' | 'ongoing';

export interface ActivitySavings {
  readonly mode: SavingsMode;
  readonly perUseMinutes: number;
  readonly annualHours: number;
  readonly oneTimeMinutes: number;
  readonly usageLabel: string;
  readonly activityLabel: string;
}

export const ACTIVITY_SAVINGS: Record<number, ActivitySavings> = {
  1: {
    mode: 'recurring',
    perUseMinutes: 15,
    annualHours: 6,
    oneTimeMinutes: 0,
    usageLabel: '2x/month',
    activityLabel: 'Regulatory cheatsheet reference',
  },
  2: {
    mode: 'one-time',
    perUseMinutes: 0,
    annualHours: 0,
    oneTimeMinutes: 30,
    usageLabel: 'One-time audit',
    activityLabel: 'Subscription inventory',
  },
  3: {
    mode: 'recurring',
    perUseMinutes: 10,
    annualHours: 43,
    oneTimeMinutes: 0,
    usageLabel: '5x/week',
    activityLabel: 'AI tool use (hallucination-aware)',
  },
  4: {
    mode: 'recurring',
    perUseMinutes: 20,
    annualHours: 52,
    oneTimeMinutes: 0,
    usageLabel: '3x/week',
    activityLabel: 'AI feature evaluation',
  },
  5: {
    mode: 'ongoing',
    perUseMinutes: 5,
    annualHours: 0,
    oneTimeMinutes: 0,
    usageLabel: 'Per data-handling decision',
    activityLabel: 'Data classification awareness',
  },
  // M5 Activity 5.2 — same module, represented in module-level display.
  // Listed here as module 5 covers both 5.1 + 5.2 under a single card.
  6: {
    mode: 'ongoing',
    perUseMinutes: 10,
    annualHours: 0,
    oneTimeMinutes: 0,
    usageLabel: 'Per new skill build',
    activityLabel: 'Skill diagnosis before building',
  },
  7: {
    mode: 'recurring',
    perUseMinutes: 20,
    annualHours: 87,
    oneTimeMinutes: 0,
    usageLabel: '5x/week',
    activityLabel: 'Deployed AI skill in daily work',
  },
  8: {
    mode: 'ongoing',
    perUseMinutes: 5,
    annualHours: 0,
    oneTimeMinutes: 0,
    usageLabel: 'Per iteration cycle',
    activityLabel: 'Structured skill iteration',
  },
  9: {
    mode: 'ongoing',
    perUseMinutes: 0,
    annualHours: 0,
    oneTimeMinutes: 0,
    usageLabel: 'Varies by automation',
    activityLabel: 'Capstone automation',
  },
};

// Cumulative annual hours for all modules up to and including moduleNumber.
// One-time savings are excluded from annualisation (shown separately).
export function getCumulativeAnnualHours(upToModule: number): number {
  let total = 0;
  for (let m = 1; m <= upToModule; m++) {
    const s = ACTIVITY_SAVINGS[m];
    if (s) total += s.annualHours;
  }
  return total;
}

// Total annual hours across every module — used by post-assessment headline.
export const TOTAL_ANNUAL_HOURS = Object.values(ACTIVITY_SAVINGS).reduce(
  (sum, s) => sum + s.annualHours,
  0,
);
