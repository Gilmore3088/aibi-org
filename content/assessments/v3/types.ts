// AiBI Readiness Assessment — v3 Types
// Flat 12 questions, one per topic. The output (results UI, PDF, dimension
// breakdown) is scheduled for replacement; v3 keeps the same question/option
// shape as v2 so the runner UI keeps working unchanged.

export type Dimension =
  | 'strategic-value'
  | 'infrastructure-readiness'
  | 'data-quality'
  | 'security-approved-tools'
  | 'runtime-safeguards'
  | 'regulatory-compliance'
  | 'fair-lending-testing'
  | 'human-in-the-loop'
  | 'talent-culture'
  | 'data-safety-reflexes'
  | 'continuous-validation'
  | 'vendor-risk';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  'strategic-value': 'Strategic Value',
  'infrastructure-readiness': 'Infrastructure Readiness',
  'data-quality': 'Data Quality',
  'security-approved-tools': 'Security & Approved Tools',
  'runtime-safeguards': 'Runtime Safeguards',
  'regulatory-compliance': 'Regulatory Compliance',
  'fair-lending-testing': 'Fair Lending Testing',
  'human-in-the-loop': 'Human-in-the-Loop',
  'talent-culture': 'Talent & Culture',
  'data-safety-reflexes': 'Data Safety Reflexes',
  'continuous-validation': 'Continuous Validation',
  'vendor-risk': 'Vendor Risk',
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
