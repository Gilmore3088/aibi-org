// Per-module time-savings data for the Foundation micro-module course.
// Used by TimeSavingsCard and the post-course assessment headline.

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
  1: { mode: 'ongoing', perUseMinutes: 0, annualHours: 0, oneTimeMinutes: 0, usageLabel: 'Boundary-setting habit', activityLabel: 'AI limits card' },
  2: { mode: 'recurring', perUseMinutes: 10, annualHours: 26, oneTimeMinutes: 0, usageLabel: '3x/week', activityLabel: 'Low-risk message rewrite' },
  3: { mode: 'recurring', perUseMinutes: 6, annualHours: 16, oneTimeMinutes: 0, usageLabel: '3x/week', activityLabel: 'Claim review markup' },
  4: { mode: 'recurring', perUseMinutes: 8, annualHours: 21, oneTimeMinutes: 0, usageLabel: '3x/week', activityLabel: 'First prompt card' },
  5: { mode: 'recurring', perUseMinutes: 6, annualHours: 16, oneTimeMinutes: 0, usageLabel: '3x/week', activityLabel: 'Safe context block' },
  6: { mode: 'recurring', perUseMinutes: 8, annualHours: 21, oneTimeMinutes: 0, usageLabel: '3x/week', activityLabel: 'Structured output template' },
  7: { mode: 'recurring', perUseMinutes: 8, annualHours: 14, oneTimeMinutes: 0, usageLabel: '2x/week', activityLabel: 'AI output review checklist' },
  8: { mode: 'recurring', perUseMinutes: 15, annualHours: 26, oneTimeMinutes: 0, usageLabel: '2x/week', activityLabel: 'Source-grounded prompt' },
  9: { mode: 'recurring', perUseMinutes: 12, annualHours: 31, oneTimeMinutes: 0, usageLabel: '3x/week', activityLabel: 'Reusable prompt template' },
  10: { mode: 'recurring', perUseMinutes: 10, annualHours: 26, oneTimeMinutes: 0, usageLabel: '3x/week', activityLabel: 'Role prompt card' },
  11: { mode: 'ongoing', perUseMinutes: 6, annualHours: 0, oneTimeMinutes: 0, usageLabel: 'Per use-case review', activityLabel: 'Use-case card' },
  12: { mode: 'ongoing', perUseMinutes: 5, annualHours: 0, oneTimeMinutes: 0, usageLabel: 'Per safety decision', activityLabel: 'Safe-use checklist' },
  13: { mode: 'recurring', perUseMinutes: 12, annualHours: 31, oneTimeMinutes: 0, usageLabel: '3x/week', activityLabel: 'Skill template' },
  14: { mode: 'one-time', perUseMinutes: 0, annualHours: 0, oneTimeMinutes: 30, usageLabel: 'One-time workflow map', activityLabel: 'Workflow map' },
  15: { mode: 'ongoing', perUseMinutes: 5, annualHours: 0, oneTimeMinutes: 0, usageLabel: 'Per review gate decision', activityLabel: 'Human review gate card' },
  16: { mode: 'ongoing', perUseMinutes: 5, annualHours: 0, oneTimeMinutes: 0, usageLabel: 'Per reviewed output', activityLabel: 'AI evidence note' },
  17: { mode: 'one-time', perUseMinutes: 0, annualHours: 0, oneTimeMinutes: 45, usageLabel: 'One-time kit build', activityLabel: 'Reusable workflow kit' },
  18: { mode: 'one-time', perUseMinutes: 0, annualHours: 0, oneTimeMinutes: 30, usageLabel: 'Final packet review', activityLabel: 'Foundation packet summary' },
};

export function getCumulativeAnnualHours(upToModule: number): number {
  let total = 0;
  for (let moduleNumber = 1; moduleNumber <= upToModule; moduleNumber++) {
    const savings = ACTIVITY_SAVINGS[moduleNumber];
    if (savings) total += savings.annualHours;
  }
  return total;
}

export const TOTAL_ANNUAL_HOURS = Object.values(ACTIVITY_SAVINGS).reduce(
  (sum, savings) => sum + savings.annualHours,
  0,
);
