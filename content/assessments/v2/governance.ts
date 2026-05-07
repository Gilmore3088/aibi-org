// content/assessments/v2/governance.ts
// Cross-cutting governance + risk metadata. Five attributes per dimension,
// rendered as the governance strip beneath every recommendation in Wave B.
//
// Voice on examinerDefensibility: one sentence, written as if the bank
// officer is sitting across from an examiner being asked "what is your
// posture on this." Plain-English, not legalese, but defensible.

import type { Dimension } from './types';

export type RiskLevel = 'Low' | 'Moderate' | 'Elevated';
export type GovernanceComplexity = 'None' | 'Policy update' | 'Formal review';
export type DataSensitivity = 'Public' | 'Internal' | 'Confidential' | 'NPI';
export type HumanReview = 'Optional' | 'Recommended' | 'Required';

export interface GovernanceAttrs {
  readonly riskLevel: RiskLevel;
  readonly governanceComplexity: GovernanceComplexity;
  readonly dataSensitivity: DataSensitivity;
  readonly humanReview: HumanReview;
  /** One-sentence examiner-defensibility line. Plain English, not legalese. */
  readonly examinerDefensibility: string;
}

export const GOVERNANCE_BY_DIMENSION: Record<Dimension, GovernanceAttrs> = {
  'current-ai-usage': {
    riskLevel: 'Moderate',
    governanceComplexity: 'Policy update',
    dataSensitivity: 'Internal',
    humanReview: 'Recommended',
    examinerDefensibility:
      'AI tool usage is inventoried, the inventory is current, and named owners exist for each sanctioned use case.',
  },
  'experimentation-culture': {
    riskLevel: 'Low',
    governanceComplexity: 'None',
    dataSensitivity: 'Internal',
    humanReview: 'Optional',
    examinerDefensibility:
      'Experimentation happens within sanctioned tools and against non-sensitive data; production use crosses a separate review gate.',
  },
  'ai-literacy-level': {
    riskLevel: 'Low',
    governanceComplexity: 'None',
    dataSensitivity: 'Public',
    humanReview: 'Optional',
    examinerDefensibility:
      'AI literacy is part of staff training; the institution can produce completion records and curriculum on request.',
  },
  'quick-win-potential': {
    riskLevel: 'Moderate',
    governanceComplexity: 'Policy update',
    dataSensitivity: 'Internal',
    humanReview: 'Recommended',
    examinerDefensibility:
      'Pilots are scoped to non-customer-impacting workflows first, with measured before/after and a documented decision to operationalize.',
  },
  'leadership-buy-in': {
    riskLevel: 'Low',
    governanceComplexity: 'Formal review',
    dataSensitivity: 'Internal',
    humanReview: 'Optional',
    examinerDefensibility:
      'A named executive owns AI program risk; the program is reviewed at the same cadence as other strategic initiatives.',
  },
  'security-posture': {
    riskLevel: 'Elevated',
    governanceComplexity: 'Formal review',
    dataSensitivity: 'NPI',
    humanReview: 'Required',
    examinerDefensibility:
      'AI use is governed by a written acceptable-use policy; non-public information cannot be processed by tools that have not passed third-party risk review.',
  },
  'training-infrastructure': {
    riskLevel: 'Low',
    governanceComplexity: 'Policy update',
    dataSensitivity: 'Public',
    humanReview: 'Optional',
    examinerDefensibility:
      'Required AI training is part of onboarding for relevant roles, with refresh cadence defined and tracked alongside other compliance training.',
  },
  'builder-potential': {
    riskLevel: 'Moderate',
    governanceComplexity: 'Formal review',
    dataSensitivity: 'Confidential',
    humanReview: 'Required',
    examinerDefensibility:
      'Internally built AI workflows are subject to the same model-risk and change-management controls as any other internally developed system.',
  },
};

export function getGovernanceFor(dimension: Dimension): GovernanceAttrs {
  return GOVERNANCE_BY_DIMENSION[dimension];
}
