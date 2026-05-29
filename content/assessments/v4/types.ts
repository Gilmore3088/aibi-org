// AiBI In-Depth AI Readiness Diagnostic — v4 Types
//
// Paid assessment = full diagnostic for the INDIVIDUAL banker. Eight
// strategic dimensions, six questions each (48 total), scored 1-4.
// Raw range 48-192; normalized to 0-100 for report readability.
//
// Source: docs/Plans/_assets/aibi-assessment-architecture-2026-05-28.md
// (Section 4 "Paid Diagnostic: 8 Dimensions", Section 2 scoring +
// maturity bands, Section 8 role personalization).
//
// Voice mirrors the free v3 — second-person, individual ("you / your
// work"), banker-direct. The paid product diagnoses depth; it does not
// drift back into institutional posture language.

export type Dimension =
  | 'ai-access-architecture'
  | 'model-risk-validation'
  | 'compliance-explainability'
  | 'data-security-guardrails'
  | 'workflow-orchestration'
  | 'bounded-autonomy-human-review'
  | 'vendor-risk-interoperability'
  | 'governance-roles-human-capital';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  'ai-access-architecture': 'Approved AI Access',
  'model-risk-validation': 'Model Oversight',
  'compliance-explainability': 'Compliance Clarity',
  'data-security-guardrails': 'Data Safety',
  'workflow-orchestration': 'Workflow Fit',
  'bounded-autonomy-human-review': 'Human Control',
  'vendor-risk-interoperability': 'Vendor Control',
  'governance-roles-human-capital': 'People & Governance',
};

// Technical names — kept available for the report's "for the technical
// reader" sub-label. Plain-language `DIMENSION_LABELS` is what fronts
// the UI.
export const DIMENSION_TECHNICAL_NAMES: Record<Dimension, string> = {
  'ai-access-architecture': 'Enterprise Architecture & Gateway Control',
  'model-risk-validation': 'Model Risk Management & Continuous Validation',
  'compliance-explainability': 'Regulatory Compliance & Algorithmic Explainability',
  'data-security-guardrails': 'Data Security & Technical Guardrails',
  'workflow-orchestration': 'Multi-Agent Systems & Workflow Orchestration',
  'bounded-autonomy-human-review': 'Bounded Autonomy & Human-in-the-Loop Checkpoints',
  'vendor-risk-interoperability': 'Vendor Risk Management & Interoperability',
  'governance-roles-human-capital': 'Governance Roles & Human Capital Enablement',
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

// Five maturity bands keyed on the normalized 0-100 score.
// Source: spec Section 2 "Paid Diagnostic Maturity Bands".
export type MaturityBandId =
  | 'unstructured'
  | 'emerging'
  | 'building-momentum'
  | 'controlled-scale'
  | 'advanced';

export interface MaturityBand {
  readonly id: MaturityBandId;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly meaning: string;
}

export const MATURITY_BANDS: readonly MaturityBand[] = [
  {
    id: 'unstructured',
    label: 'Unstructured',
    min: 0,
    max: 39,
    meaning: 'Your AI use is mostly informal, reactive, or uncontrolled. The fastest wins come from naming what you do, naming what you do not, and picking one or two tasks to anchor a routine.',
  },
  {
    id: 'emerging',
    label: 'Emerging',
    min: 40,
    max: 59,
    meaning: 'Early practices exist, but governance, documentation, or role readiness is uneven. The next move is to convert what already works into a documented, repeatable habit.',
  },
  {
    id: 'building-momentum',
    label: 'Building Momentum',
    min: 60,
    max: 74,
    meaning: 'Practical use cases are forming; review paths and artifacts need strengthening. This is the band where compounding starts — formalize one workflow at a time.',
  },
  {
    id: 'controlled-scale',
    label: 'Controlled Scale',
    min: 75,
    max: 89,
    meaning: 'You can scale your AI work with governance, training, and evidence. The opportunity is replication — turning your habits into something colleagues can adopt.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    min: 90,
    max: 100,
    meaning: 'Your AI workflows, oversight, and role-based capability are mature. The remaining work is keeping the bar from drifting — periodic review and quiet refinement.',
  },
] as const;
