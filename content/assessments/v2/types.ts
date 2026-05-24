// AiBI Readiness Assessment — v2 Types
// Dimension-tagged question interfaces for the 12-question rotating assessment.

export type Dimension =
  | 'current-ai-usage'
  | 'experimentation-culture'
  | 'ai-literacy-level'
  | 'quick-win-potential'
  | 'leadership-buy-in'
  | 'security-posture'
  | 'training-infrastructure'
  | 'builder-potential';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  'current-ai-usage': 'Current AI Usage',
  'experimentation-culture': 'Experimentation Culture',
  'ai-literacy-level': 'AI Literacy Level',
  'quick-win-potential': 'Quick Win Potential',
  'leadership-buy-in': 'Leadership Buy-In',
  'security-posture': 'Security Posture',
  'training-infrastructure': 'Training Infrastructure',
  'builder-potential': 'Builder Potential',
};

export interface AssessmentOption {
  readonly label: string;
  readonly points: 1 | 2 | 3 | 4;
}

export interface AssessmentQuestion {
  readonly id: string;
  readonly dimension: Dimension;
  readonly prompt: string;
  readonly options: readonly [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
  // Audit A19 (2026-05-24): when true, scoring is flipped (5 - points)
  // so a "high agreement" answer no longer maps to high maturity.
  // Used to break acquiescence bias when the question wording is itself
  // reversed (e.g. "Our staff resist AI initiatives"). Authoring of the
  // matching reverse-worded items is the Wave-E follow-up; the schema
  // and the scoring transform ship in Wave D so the field can land
  // without further code changes.
  readonly reverseScored?: boolean;
}
