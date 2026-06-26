// Per-module time-savings context for the Foundation micro-module course.
// Used by TimeSavingsCard for a modest, per-task cue.
//
// 2026-06-25: annualized/cumulative "hours saved per year" figures were
// removed. They were designer estimates with no source and violated the
// Citations Always rule. Keep this qualitative — do not reintroduce annual
// totals or cumulative projections without a named, defensible source.

export type SavingsMode = 'recurring' | 'one-time' | 'ongoing';

export interface ActivitySavings {
  readonly mode: SavingsMode;
  readonly usageLabel: string;
  readonly activityLabel: string;
}

export const ACTIVITY_SAVINGS: Record<number, ActivitySavings> = {
  1: { mode: 'ongoing', usageLabel: 'Boundary-setting habit', activityLabel: 'AI limits card' },
  2: { mode: 'recurring', usageLabel: 'A few times a week', activityLabel: 'Low-risk message rewrite' },
  3: { mode: 'recurring', usageLabel: 'A few times a week', activityLabel: 'CORE prompt card' },
  4: { mode: 'recurring', usageLabel: 'A few times a week', activityLabel: 'First prompt card' },
  5: { mode: 'recurring', usageLabel: 'A few times a week', activityLabel: 'Safe context block' },
  6: { mode: 'recurring', usageLabel: 'A few times a week', activityLabel: 'Structured output template' },
  7: { mode: 'recurring', usageLabel: 'A couple times a week', activityLabel: 'AI output review checklist' },
  8: { mode: 'recurring', usageLabel: 'A couple times a week', activityLabel: 'Source-grounded prompt' },
  9: { mode: 'recurring', usageLabel: 'A few times a week', activityLabel: 'Reusable prompt template' },
  10: { mode: 'recurring', usageLabel: 'A few times a week', activityLabel: 'Role prompt card' },
  11: { mode: 'ongoing', usageLabel: 'Per use-case review', activityLabel: 'Use-case card' },
  12: { mode: 'ongoing', usageLabel: 'Per safety decision', activityLabel: 'Safe-use checklist' },
  13: { mode: 'recurring', usageLabel: 'A few times a week', activityLabel: 'Skill template' },
  14: { mode: 'one-time', usageLabel: 'One-time workflow map', activityLabel: 'Workflow map' },
  15: { mode: 'ongoing', usageLabel: 'Per review gate decision', activityLabel: 'Human review gate card' },
  16: { mode: 'ongoing', usageLabel: 'Per reviewed output', activityLabel: 'AI evidence note' },
  17: { mode: 'one-time', usageLabel: 'One-time kit build', activityLabel: 'Reusable workflow kit' },
  18: { mode: 'one-time', usageLabel: 'Final packet review', activityLabel: 'Foundation packet summary' },
};
