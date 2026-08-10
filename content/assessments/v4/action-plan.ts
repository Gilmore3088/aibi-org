// action-plan.ts — Section 5 of the Action Intelligence Report.
//
// One concrete, owned action per dimension: what to do, why it matters, who
// owns it, and the effort / impact / timeline. The report renders the actions
// for the taker's priority gaps, turning "here is what is wrong" (root cause)
// into "here is the move" — each tied to a generated work product.

import type { Dimension } from './types';

export interface ActionItem {
  readonly what: string;
  readonly why: string;
  readonly owner: string;
  readonly effort: 'Low' | 'Medium' | 'High';
  readonly impact: 'Medium' | 'High';
  readonly timeline: string;
}

export const ACTION_FOR: Record<Dimension, ActionItem> = {
  'ai-access-architecture': {
    what: 'Stand up one approved AI gateway and publish a risk-tiered AI Use-Case Inventory of what is already in use.',
    why: 'You cannot govern access you cannot see — the inventory gives policy something to govern.',
    owner: 'IT / InfoSec',
    effort: 'Medium',
    impact: 'High',
    timeline: '60 days',
  },
  'model-risk-validation': {
    what: 'Add a lightweight validation and review routine for the AI tools in use, with a named owner.',
    why: 'AI-assisted output is model output under SR 26-2 and needs documented oversight.',
    owner: 'Risk / Model Risk',
    effort: 'Medium',
    impact: 'High',
    timeline: '60 days',
  },
  'compliance-explainability': {
    what: 'Create three approved branch response templates for your top recurring member questions.',
    why: 'Closes the "no approved templates" gap and ends per-banker free-drafting risk.',
    owner: 'Branch Operations',
    effort: 'Low',
    impact: 'High',
    timeline: '30 days',
  },
  'data-security-guardrails': {
    what: 'Publish a one-page data-classification rule and AI data-handling card for every banker using an AI tool.',
    why: 'Most AI incidents are paste failures — a clear rule prevents them.',
    owner: 'InfoSec / Compliance',
    effort: 'Low',
    impact: 'High',
    timeline: '30 days',
  },
  'workflow-orchestration': {
    what: 'Turn your single best ad-hoc AI use into one governed workflow with a written SOP and an owner.',
    why: 'Value only compounds once AI use is repeatable and owned, not one-off.',
    owner: 'Operations',
    effort: 'Medium',
    impact: 'High',
    timeline: '60 days',
  },
  'bounded-autonomy-human-review': {
    what: 'Draw a Green/Yellow/Red escalation matrix and require evidenced human review on customer-impacting work.',
    why: 'Keeps credit, fraud, and account-access decisions with people — and provable to an examiner.',
    owner: 'Compliance',
    effort: 'Low',
    impact: 'High',
    timeline: '30 days',
  },
  'vendor-risk-interoperability': {
    what: 'Catalogue vendor-embedded AI and add an AI vendor review to your third-party risk process.',
    why: 'Vendor model updates change behavior — TPRM has to cover AI like any other third-party risk.',
    owner: 'Vendor Management',
    effort: 'Medium',
    impact: 'Medium',
    timeline: '90 days',
  },
  'governance-roles-human-capital': {
    what: 'Name an AI owner, stand up a simple review forum, and set a staff AI-literacy baseline.',
    why: 'Without an owner, a forum, and a literacy floor, every other control drifts.',
    owner: 'Executive Sponsor',
    effort: 'Medium',
    impact: 'High',
    timeline: '90 days',
  },
};
