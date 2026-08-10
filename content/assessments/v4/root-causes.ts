// root-causes.ts — Section 3 of the Action Intelligence Report.
//
// The diagnostic-credibility move: every weak dimension gets a "scored X
// because…" explanation — the structural gaps that produce a low score, plus
// a confidence level. Authored per dimension (the reasons are the common
// failure modes when that dimension is weak at a community bank / credit
// union), shown for the taker's priority gaps. Grounded in the same
// supervisory frame as the dimensions themselves (SR 26-2, TPRM, ECOA,
// GLBA-class data rules).

import type { Dimension } from './types';

export interface RootCause {
  /** The structural reasons the score exists — shown as "scored X because…". */
  readonly reasons: readonly string[];
  /** How confident the diagnosis is, given the assessment signal. */
  readonly confidence: 'High' | 'Medium';
}

export const ROOT_CAUSES: Record<Dimension, RootCause> = {
  'ai-access-architecture': {
    reasons: [
      'No single approved gateway — staff reach AI tools through a mix of personal and vendor channels',
      'No role-based access tiers defining who may use which tools on which data',
      'Shadow AI use is not inventoried, so access cannot be governed',
      'Prompts and outputs on the approved path are not logged',
    ],
    confidence: 'High',
  },
  'model-risk-validation': {
    reasons: [
      'AI-assisted outputs are not treated as model output under SR 26-2',
      'No documented validation or back-testing of the tools in use',
      'No defined performance thresholds or drift monitoring',
      'No owner accountable for model risk on AI tooling',
    ],
    confidence: 'High',
  },
  'compliance-explainability': {
    reasons: [
      'No documented escalation workflow for AI-assisted customer communications',
      'No approved, reviewed response templates — staff free-draft each time',
      'No standardized review step before AI-assisted output reaches a member',
      'No designated owner for the compliance review of AI workflows',
    ],
    confidence: 'High',
  },
  'data-security-guardrails': {
    reasons: [
      'No data-classification rule defining what may and may not enter a prompt',
      'PII / NPI handling in AI tools is governed by habit, not policy',
      'No technical guardrails (redaction, DLP, environment separation) on the AI path',
      'No incident path for an AI-related data exposure',
    ],
    confidence: 'High',
  },
  'workflow-orchestration': {
    reasons: [
      'AI use is ad-hoc per person, not built into a repeatable workflow',
      'No saved, governed skills — prompts live in chat history and notebooks',
      'Handoffs between AI-assisted steps and human steps are undefined',
      'No owner for the end-to-end workflow, so it cannot be improved',
    ],
    confidence: 'Medium',
  },
  'bounded-autonomy-human-review': {
    reasons: [
      'No defined line between what AI may decide and what a person must decide',
      'Human review happens, but criteria and sign-off ownership are unclear',
      'No checkpoint forcing escalation on credit, fraud, or account-access actions',
      'Review is not evidenced, so it cannot be shown to an examiner',
    ],
    confidence: 'High',
  },
  'vendor-risk-interoperability': {
    reasons: [
      'AI features embedded in core and vendor products are not catalogued as AI use',
      'No due diligence on model provenance, data retention, or subcontractors',
      'Contract terms do not cover AI change management or exit',
      'Vendor model updates that change behavior are not monitored',
    ],
    confidence: 'Medium',
  },
  'governance-roles-human-capital': {
    reasons: [
      'No named owner or committee accountable for AI use across the institution',
      'Roles and responsibilities for AI governance are undefined',
      'Staff lack a baseline AI-literacy standard before they use the tools',
      'No forum where AI decisions, incidents, and approvals are recorded',
    ],
    confidence: 'Medium',
  },
};

/** Confidence rises when the dimension is clearly weak (low score). */
export function rootCauseFor(
  dimension: Dimension,
  score: number,
): RootCause {
  const base = ROOT_CAUSES[dimension];
  // A very low score is unambiguous signal — report High regardless of base.
  if (score < 55) return { reasons: base.reasons, confidence: 'High' };
  return base;
}
