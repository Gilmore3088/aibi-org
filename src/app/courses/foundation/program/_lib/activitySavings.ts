// Per-module time-savings model for the Foundation micro-module course.
// Used by TimeSavingsCard (per-activity + cumulative) and the post-course
// TransformationCard headline.
//
// These are MODELED estimates, not measured guarantees. Each recurring
// activity stores the two inputs the model rests on — minutes saved per
// reuse and how often a typical learner reuses it — so any figure shown to
// a learner can be displayed WITH its derivation:
//
//   perUseMinutes × runsPerWeek × WEEKS_PER_YEAR ÷ 60  ≈  annual hours
//
// WEEKS_PER_YEAR is held at 50 (not 52) to stay conservative — it assumes
// roughly two non-working weeks a year. Any surface that shows an hours
// figure must also show this derivation and label it a modeled estimate
// (Citations Always rule). Do not display a bare total without the math.

export const WEEKS_PER_YEAR = 50;

export type SavingsMode = 'recurring' | 'one-time' | 'ongoing';

export interface ActivitySavings {
  readonly mode: SavingsMode;
  // Modeled minutes saved each time the artifact is reused.
  readonly perUseMinutes: number;
  // Modeled reuses per week for a typical learner (0 for non-recurring).
  readonly runsPerWeek: number;
  // One-time minutes saved by a setup artifact (0 unless mode === 'one-time').
  readonly oneTimeMinutes: number;
  readonly usageLabel: string;
  readonly activityLabel: string;
}

export const ACTIVITY_SAVINGS: Record<number, ActivitySavings> = {
  1: { mode: 'ongoing', perUseMinutes: 0, runsPerWeek: 0, oneTimeMinutes: 0, usageLabel: 'Boundary-setting habit', activityLabel: 'AI limits card' },
  2: { mode: 'recurring', perUseMinutes: 10, runsPerWeek: 3, oneTimeMinutes: 0, usageLabel: '3×/week', activityLabel: 'Low-risk message rewrite' },
  3: { mode: 'recurring', perUseMinutes: 6, runsPerWeek: 3, oneTimeMinutes: 0, usageLabel: '3×/week', activityLabel: 'CORE prompt card' },
  4: { mode: 'recurring', perUseMinutes: 8, runsPerWeek: 3, oneTimeMinutes: 0, usageLabel: '3×/week', activityLabel: 'First prompt card' },
  5: { mode: 'recurring', perUseMinutes: 6, runsPerWeek: 3, oneTimeMinutes: 0, usageLabel: '3×/week', activityLabel: 'Safe context block' },
  6: { mode: 'recurring', perUseMinutes: 8, runsPerWeek: 3, oneTimeMinutes: 0, usageLabel: '3×/week', activityLabel: 'Structured output template' },
  7: { mode: 'recurring', perUseMinutes: 8, runsPerWeek: 2, oneTimeMinutes: 0, usageLabel: '2×/week', activityLabel: 'AI output review checklist' },
  8: { mode: 'recurring', perUseMinutes: 15, runsPerWeek: 2, oneTimeMinutes: 0, usageLabel: '2×/week', activityLabel: 'Source-grounded prompt' },
  9: { mode: 'recurring', perUseMinutes: 12, runsPerWeek: 3, oneTimeMinutes: 0, usageLabel: '3×/week', activityLabel: 'Reusable prompt template' },
  10: { mode: 'recurring', perUseMinutes: 10, runsPerWeek: 3, oneTimeMinutes: 0, usageLabel: '3×/week', activityLabel: 'Role prompt card' },
  11: { mode: 'ongoing', perUseMinutes: 6, runsPerWeek: 0, oneTimeMinutes: 0, usageLabel: 'Per use-case review', activityLabel: 'Use-case card' },
  12: { mode: 'ongoing', perUseMinutes: 5, runsPerWeek: 0, oneTimeMinutes: 0, usageLabel: 'Per safety decision', activityLabel: 'Safe-use checklist' },
  13: { mode: 'recurring', perUseMinutes: 12, runsPerWeek: 3, oneTimeMinutes: 0, usageLabel: '3×/week', activityLabel: 'Skill template' },
  14: { mode: 'one-time', perUseMinutes: 0, runsPerWeek: 0, oneTimeMinutes: 30, usageLabel: 'One-time workflow map', activityLabel: 'Workflow map' },
  15: { mode: 'ongoing', perUseMinutes: 5, runsPerWeek: 0, oneTimeMinutes: 0, usageLabel: 'Per review gate decision', activityLabel: 'Human review gate card' },
  16: { mode: 'ongoing', perUseMinutes: 5, runsPerWeek: 0, oneTimeMinutes: 0, usageLabel: 'Per reviewed output', activityLabel: 'AI evidence note' },
  17: { mode: 'one-time', perUseMinutes: 0, runsPerWeek: 0, oneTimeMinutes: 45, usageLabel: 'One-time kit build', activityLabel: 'Reusable workflow kit' },
  18: { mode: 'one-time', perUseMinutes: 0, runsPerWeek: 0, oneTimeMinutes: 30, usageLabel: 'Final packet review', activityLabel: 'Foundation packet summary' },
};

// Modeled annual hours for one activity, derived from its own inputs so the
// displayed number always equals the shown math. Non-recurring activities
// contribute no recurring annual hours.
export function getAnnualHours(moduleNumber: number): number {
  const savings = ACTIVITY_SAVINGS[moduleNumber];
  if (!savings || savings.mode !== 'recurring') return 0;
  return Math.round((savings.perUseMinutes * savings.runsPerWeek * WEEKS_PER_YEAR) / 60);
}

export function getCumulativeAnnualHours(upToModule: number): number {
  let total = 0;
  for (let moduleNumber = 1; moduleNumber <= upToModule; moduleNumber++) {
    total += getAnnualHours(moduleNumber);
  }
  return total;
}

export const TOTAL_ANNUAL_HOURS = getCumulativeAnnualHours(
  Math.max(...Object.keys(ACTIVITY_SAVINGS).map(Number)),
);
