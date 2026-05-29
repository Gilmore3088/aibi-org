// AiBI In-Depth Diagnostic — v4 Role-Specific Output
//
// Per spec Section 8: the report adjusts artifact recommendations, sample
// prompts, and 30-day-win framing based on the respondent's role.
//
// Source: spec Section 8 provides three worked examples
// (Compliance/Risk, Retail/Branch, Lending/Credit). The other six roles
// are authored here in the same voice and shape, drawn from the spec's
// dimension content and starter artifacts.

import type { RoleV4 } from './roles';

export interface RoleOutput {
  readonly artifact: string;
  readonly samplePrompt: string;
  readonly thirtyDayWin: string;
}

export const ROLE_OUTPUT: Record<RoleV4, RoleOutput> = {
  executive: {
    artifact: 'AI Acceptable Use Standard + Department Readiness Map',
    samplePrompt:
      'Help me draft a one-page "AI use at our institution" framing memo for staff. Cover: what we want more of, what is off-limits, who reviews what, where to ask. Tone: clear, confident, conservative — the kind of document staff will actually read.',
    thirtyDayWin:
      'Publish one written AI position — what is encouraged, what is off-limits, who owns the standard.',
  },
  'compliance-risk': {
    artifact: 'AI Use-Case Inventory + Compliance AI Playbook',
    samplePrompt:
      'Review this AI workflow description and identify data, compliance, customer-impact, and retention risks. For each risk, suggest one mitigation a community bank could implement this quarter.',
    thirtyDayWin:
      'Build a risk-tiered inventory of current AI use cases at the institution.',
  },
  'it-infosec': {
    artifact: 'Approved AI Tools List + Vendor AI Verdict Memo',
    samplePrompt:
      'Help me design a one-page review template for evaluating a new AI tool before live use. Cover: data classes the tool would touch, vendor training-data policy, output explainability, integration risk, recommended verdict (allow / gate / decline).',
    thirtyDayWin:
      'Publish the approved AI tools list with data-class rules, and review three tools currently in use against it.',
  },
  'retail-branch': {
    artifact: 'Branch Style Brief',
    samplePrompt:
      'Turn this approved procedure into a frontline job aid for branch staff. Keep it under one page, use plain language, include three example phrases staff can use with members.',
    thirtyDayWin:
      'Create three approved customer-response templates frontline staff can adapt.',
  },
  'lending-credit': {
    artifact: 'Principal Reason Traceability Table',
    samplePrompt:
      'Using only the human-provided principal reasons below, draft clearer adverse-action language that explains the decision in plain English without adding new reasons.',
    thirtyDayWin:
      'Pilot AI-assisted adverse-action language review on five redacted examples.',
  },
  'bsa-aml': {
    artifact: 'AI Workflow SOP Template (BSA narrative variant)',
    samplePrompt:
      "Given the activity description below, draft a BSA narrative using only the facts provided. Do not invent details. Cover: who, what, when, where, why this is unusual. Flag any places I should verify before signing.",
    thirtyDayWin:
      'Document one BSA narrative workflow end-to-end (input → AI draft → review → final filing), with explicit verification checkpoints.',
  },
  'marketing-product': {
    artifact: 'AI Output Review Checklist (marketing variant)',
    samplePrompt:
      'Take the campaign brief below and draft three customer-message variants. For each, flag any compliance claims I would need to verify before publishing — fees, rates, regulatory disclosures, comparisons to competitors.',
    thirtyDayWin:
      'Run three customer messages through the AI Output Review Checklist before publishing — and document the compliance check.',
  },
  operations: {
    artifact: 'AI Workflow SOP Template + Saved Skill Template',
    samplePrompt:
      'Take this recurring operational task and draft a four-step AI workflow: input I would gather, prompt I would use, review step I would run, final output I would save. Keep each step under three sentences.',
    thirtyDayWin:
      'Document one recurring operational workflow end-to-end so a colleague could run it without you.',
  },
  'training-hr': {
    artifact: 'Training Rollout Plan',
    samplePrompt:
      'Help me draft a 90-day AI training plan for community bank staff in [DEPARTMENT]. Cover three skills, one source per skill, weekly time budget, and what "done" looks like at week 12. Tone: practical, role-specific, no AI jargon.',
    thirtyDayWin:
      'Publish a written six-week AI learning plan for one department, with named sources and weekly time budgets.',
  },
  other: {
    artifact: 'AI Use-Case Inventory',
    samplePrompt:
      'Help me list the five most common AI use cases I could realistically apply to my work this month. For each: the task, the AI shape (draft / summarize / classify / compare), what I would still review, and the win I would measure.',
    thirtyDayWin:
      'Pick two of those five and run one real-work cycle on each this month — keep notes on what worked and what you rewrote.',
  },
};

export function getRoleOutput(role: RoleV4 | null): RoleOutput {
  if (role === null) return ROLE_OUTPUT.other;
  return ROLE_OUTPUT[role];
}
