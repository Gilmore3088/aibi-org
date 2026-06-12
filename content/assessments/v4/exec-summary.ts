// exec-summary.ts — Section 1 (snapshot fields) + Section 10 (learning path).
//
// Per-dimension one-liners that turn a weak dimension into a primary risk, a
// primary opportunity, and a one-sentence recommendation (Section 1), plus the
// Foundation module that most directly closes it (Section 10 — the assessment
// as the front door to the ecosystem).

import type { Dimension } from './types';

export interface DimensionBrief {
  readonly risk: string;
  readonly opportunity: string;
  readonly recommendation: string;
}

export const DIMENSION_BRIEF: Record<Dimension, DimensionBrief> = {
  'ai-access-architecture': {
    risk: 'Ungoverned shadow AI use you cannot see, log, or control.',
    opportunity: 'One approved AI gateway with role-based access and logging.',
    recommendation:
      'improving Approved AI Access by standing up a single approved gateway with role-based access and prompt logging',
  },
  'model-risk-validation': {
    risk: 'AI-assisted output treated as fact with no validation under SR 11-7.',
    opportunity: 'A lightweight validation and review routine for the tools in use.',
    recommendation:
      'improving Model Oversight by treating AI tools as model output and adding a documented validation and review routine',
  },
  'compliance-explainability': {
    risk: 'Inconsistent member communications and a rising compliance-review burden.',
    opportunity: 'Approved AI-assisted communication workflows for branch staff.',
    recommendation:
      'improving Compliance Clarity by creating approved AI-assisted communication workflows for branch staff',
  },
  'data-security-guardrails': {
    risk: 'PII / NPI exposure from staff pasting the wrong thing into a tool.',
    opportunity: 'A clear data-classification rule and a one-page handling card.',
    recommendation:
      'improving Data Safety by publishing a data-classification rule and a one-page AI data-handling card',
  },
  'workflow-orchestration': {
    risk: 'AI value trapped in one-off personal use that never compounds.',
    opportunity: 'One governed, owned, repeatable AI-assisted workflow.',
    recommendation:
      'improving Workflow Fit by turning your best ad-hoc AI use into one governed, owned workflow with an SOP',
  },
  'bounded-autonomy-human-review': {
    risk: 'AI making calls — credit, fraud, access — that must belong to a person.',
    opportunity: 'A clear escalation line and evidenced human review.',
    recommendation:
      'improving Human Control by drawing a clear escalation line and evidencing human review on customer-impacting work',
  },
  'vendor-risk-interoperability': {
    risk: 'Vendor-embedded AI changing behavior with no oversight or exit.',
    opportunity: 'An AI vendor review tied to your third-party risk process.',
    recommendation:
      'improving Vendor Control by cataloguing vendor-embedded AI and adding an AI vendor review to your TPRM process',
  },
  'governance-roles-human-capital': {
    risk: 'No owner, no forum, and no baseline literacy before staff use AI.',
    opportunity: 'A named owner, a simple forum, and a literacy baseline.',
    recommendation:
      'improving People & Governance by naming an owner, standing up a simple review forum, and setting a staff literacy baseline',
  },
};

export interface ModuleRec {
  readonly number: number;
  readonly title: string;
  readonly why: string;
}

/** The Foundation module that most directly closes each dimension's gap. */
export const MODULE_FOR: Record<Dimension, ModuleRec> = {
  'ai-access-architecture': { number: 9, title: 'Safe AI Use in Banking', why: 'Approved tools, data zones, and access discipline.' },
  'model-risk-validation': { number: 9, title: 'Safe AI Use in Banking', why: 'Checking and evidencing AI output before it is trusted.' },
  'compliance-explainability': { number: 9, title: 'Safe AI Use in Banking', why: 'Escalation, grounding, and review for member-facing work.' },
  'data-security-guardrails': { number: 9, title: 'Safe AI Use in Banking', why: 'What may and may not enter a prompt.' },
  'workflow-orchestration': { number: 8, title: 'Agents & Workflow Thinking', why: 'Turning ad-hoc AI use into a repeatable workflow.' },
  'bounded-autonomy-human-review': { number: 9, title: 'Safe AI Use in Banking', why: 'The line between what AI may decide and what a person must.' },
  'vendor-risk-interoperability': { number: 7, title: 'AI Tools Landscape', why: 'Choosing and governing the tools and vendors you rely on.' },
  'governance-roles-human-capital': { number: 12, title: 'Final Foundation Lab', why: 'Owning an end-to-end AI workflow and its governance.' },
};

const PROMPTING_BASELINE: ModuleRec = {
  number: 3,
  title: 'Prompting Fundamentals',
  why: 'The CORE discipline every other workflow is built on.',
};

/** Prioritised, de-duplicated learning path from the taker's top gaps. */
export function learningPath(topGapDimensions: readonly Dimension[]): readonly ModuleRec[] {
  const path: ModuleRec[] = [];
  const seen = new Set<number>();
  const push = (m: ModuleRec) => {
    if (!seen.has(m.number)) {
      seen.add(m.number);
      path.push(m);
    }
  };
  for (const d of topGapDimensions) push(MODULE_FOR[d]);
  push(PROMPTING_BASELINE); // everyone needs the prompting baseline
  return path.slice(0, 3);
}
