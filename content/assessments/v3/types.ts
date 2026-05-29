// AiBI Readiness Assessment — v3 Types
//
// Free assessment = readiness snapshot for the INDIVIDUAL banker. Twelve
// plain-language signals, one question each, scored 1–4. Total range 12–48.
//
// Source: docs/Plans/_assets/aibi-assessment-architecture-2026-05-28.md
// (Section 3, "Free Assessment: 12 Readiness Signals"). The signal list
// here is canonical and should not be reshaped without an updated spec.
//
// Voice: second-person ("you", "your work") — the free assessment is about
// the respondent's own AI maturity, NOT their institution's posture. The
// institutional posture diagnostic is the paid In-Depth (v4, separate type
// module). Aggregate institutional rollout intelligence will be a separate
// product entirely — see plan Phase 4.

export type Dimension =
  | 'strategic-value'
  | 'approved-tool-path'
  | 'data-safety-reflexes'
  | 'prompting-skill'
  | 'role-fit'
  | 'human-review'
  | 'documentation'
  | 'vendor-awareness'
  | 'customer-impact-awareness'
  | 'workflow-readiness'
  | 'training-culture'
  | 'leadership-visibility';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  'strategic-value': 'Strategic Value',
  'approved-tool-path': 'Approved Tool Path',
  'data-safety-reflexes': 'Data Safety Reflexes',
  'prompting-skill': 'Prompting Skill',
  'role-fit': 'Role Fit',
  'human-review': 'Human Review',
  'documentation': 'Documentation',
  'vendor-awareness': 'Vendor Awareness',
  'customer-impact-awareness': 'Customer Impact Awareness',
  'workflow-readiness': 'Workflow Readiness',
  'training-culture': 'Training Culture',
  'leadership-visibility': 'Leadership Visibility',
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
}
