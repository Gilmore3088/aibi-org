// work-products.ts — Section 6/7 of the Action Intelligence Report.
//
// The thesis: advice is free, artifacts are the value. Each work product here
// is a ready-to-run banking prompt that *generates* a usable asset (a response
// template, an escalation matrix, a reviewer checklist…). Because the Toolbox
// stores skills (prompts you run), every work product can be copied AND saved
// to the Toolbox with one click — which is the report's success metric.
//
// Each prompt is written to the same discipline the Foundation course teaches
// (named role, grounded in the institution's own approved sources, structured
// output, escalation baked in) so the assets a banker generates are examiner-
// ready, not generic. `dimension` tags let the report surface the ones that
// map to the taker's priority gaps.

import type { Dimension } from './types';

export interface WorkProduct {
  readonly id: string;
  readonly name: string;
  readonly intent: string; // one-sentence purpose / what you get
  readonly useBefore: string; // when to reach for it
  readonly copyRule: string; // the boundary sentence to keep with it
  readonly copyPrompt: string; // the actual prompt that generates the asset
  readonly dimension: Dimension; // the gap it most directly closes
}

export const WORK_PRODUCTS: readonly WorkProduct[] = [
  {
    id: 'response-templates',
    name: 'Approved AI Response Templates',
    intent: 'Generate three branch-ready response templates for a recurring member question, grounded in your own policy.',
    useBefore: 'Letting staff free-draft AI-assisted customer replies.',
    copyRule: 'Use approved policy text only. Every template must carry an escalation line for anything touching fees, disputes, or account access.',
    dimension: 'compliance-explainability',
    copyPrompt: `You are a branch operations lead writing approved AI-assisted response templates for tellers at a community bank.

Using ONLY the approved policy text I paste below, write three response templates for this recurring member question: [PASTE THE QUESTION].

For each template:
- Plain-English, member-ready tone (no jargon, no marketing language).
- Ground every factual claim in the pasted policy; if the policy does not cover something, write "[not in policy — escalate]" rather than guessing.
- End with a one-line escalation note for anything involving fees, disputes, account access, or credit.

Output as three labelled templates, each under 120 words.

APPROVED POLICY:
[PASTE YOUR POLICY EXCERPT]`,
  },
  {
    id: 'escalation-matrix',
    name: 'Red / Yellow / Green Escalation Matrix',
    intent: 'Build the escalation matrix that tells staff what AI may handle alone, what needs review, and what must go to a person.',
    useBefore: 'Putting any AI-assisted workflow in front of customers.',
    copyRule: 'Red-zone items (credit, fraud actions, disclosures, account access) must never be automated end-to-end.',
    dimension: 'bounded-autonomy-human-review',
    copyPrompt: `You are a compliance analyst at a community bank building an AI use escalation matrix.

From the list of tasks I paste below, produce a Green / Yellow / Red matrix:
- GREEN: no sensitive data, no customer-specific decision — AI-assisted with normal review.
- YELLOW: internal or sanitised material — approved tool, source verified, named reviewer.
- RED: customer PII/NPI, credit decisions, fraud actions, disclosures, account access — does not go to a general AI tool; escalate to an approved process.

For each task output: task, zone, required safeguard, who signs off. Flag any task you cannot classify as "needs compliance review."

TASKS:
[PASTE YOUR TASK LIST]`,
  },
  {
    id: 'reviewer-checklist',
    name: 'AI Output Reviewer Checklist',
    intent: 'Generate the checklist a reviewer runs before AI-assisted output is used or sent.',
    useBefore: 'Standing up any human-review step for AI work.',
    copyRule: 'Numbers, dates, names, and policy claims get explicit verification before sign-off.',
    dimension: 'model-risk-validation',
    copyPrompt: `You are a risk reviewer at a community bank. Build a one-page reviewer checklist for AI-assisted output before it is used or sent to a member.

The checklist must include:
- Grounding: is every fact traceable to an approved source?
- The four hallucination hotspots: verify every number, date, name, and policy claim.
- Data: was any PII/NPI exposed that the task did not require?
- Decision boundary: did the AI make any call that belongs to a person (credit, fraud, access)?
- Evidence: is the review recorded so it can be shown to an examiner?

Output as a numbered checklist with check boxes and a sign-off line (reviewer, date).`,
  },
  {
    id: 'workflow-sop',
    name: 'First AI Workflow SOP',
    intent: 'Draft the standard operating procedure for your first governed AI-assisted workflow.',
    useBefore: 'Moving an AI experiment into a repeatable process.',
    copyRule: 'The SOP must name an owner and a review cadence — a workflow with no owner does not exist.',
    dimension: 'workflow-orchestration',
    copyPrompt: `You are an operations manager at a community bank documenting your first AI-assisted workflow as a standard operating procedure.

For the workflow I describe below, draft an SOP with:
- Purpose and scope (what it does, what it explicitly does not do).
- Step-by-step procedure, marking each step as AI-assisted or human.
- Approved tools and approved data sources for each step.
- Human-review checkpoints and the escalation rule.
- Owner, reviewer, and review cadence.
- A short change log header.

Keep it to one page. Plain banking language.

WORKFLOW:
[DESCRIBE THE WORKFLOW]`,
  },
  {
    id: 'use-case-inventory',
    name: 'Risk-Tiered AI Use-Case Inventory',
    intent: 'Turn what is actually happening into a living, owned, reviewable inventory of every AI touchpoint.',
    useBefore: 'Writing any AI policy — policy needs something to govern.',
    copyRule: 'Every entry needs a tier, an owner, and a review cadence, or it is not on the inventory.',
    dimension: 'ai-access-architecture',
    copyPrompt: `You are building a risk-tiered AI use-case inventory for a community bank.

From the AI uses I paste below (vendor-embedded, staff-piloted, or sanctioned), produce an inventory table with columns:
Use case | Owner | Data used | Risk tier (Low/Med/High) | Review cadence | Notes

Rules:
- Anything touching customer PII/NPI or a customer-impacting decision is at least High.
- Vendor/core AI features count as AI use — include them.
- Mark any entry missing an owner as "OWNER NEEDED."

End with the three highest-risk entries called out for immediate review.

AI USES:
[PASTE WHAT IS IN USE]`,
  },
  {
    id: 'pilot-tracker',
    name: '30-Day Pilot Tracker',
    intent: 'Generate the tracking sheet that turns a pilot into evidence you can show leadership.',
    useBefore: 'Starting any AI pilot you intend to evaluate.',
    copyRule: 'Define the success metric and the baseline before day one, or the pilot proves nothing.',
    dimension: 'governance-roles-human-capital',
    copyPrompt: `You are running a 30-day AI pilot at a community bank and need a tracker that produces evidence for a go/no-go decision.

For the pilot I describe below, build a tracker with:
- The single success metric and its baseline (measured before day one).
- Weekly checkpoints (days 7, 14, 21, 30) with what to record at each.
- A failure-mode log (what went wrong, who caught it, what changed).
- Time-saved and quality columns.
- A go/no-go summary block for leadership.

Output as a table plus the summary block.

PILOT:
[DESCRIBE THE PILOT]`,
  },
  {
    id: 'comms-standards',
    name: 'AI Communication Standards Brief',
    intent: 'Draft the one-page brief that keeps AI-assisted member communications on-brand and compliant.',
    useBefore: 'Letting AI touch any customer-facing language.',
    copyRule: 'Approved disclosures are reproduced verbatim — AI may not paraphrase them.',
    dimension: 'compliance-explainability',
    copyPrompt: `You are a marketing and compliance lead at a community bank writing a one-page AI communication standards brief for staff using AI on member-facing language.

Cover:
- Tone and voice (plain, trustworthy, no hype — list banned phrases).
- What AI may draft vs. what must be human-written.
- Disclosure handling: approved disclosures reproduced verbatim, never paraphrased.
- Prohibited content (claims, rate promises, inferred sensitive traits).
- The review and approval path before anything reaches a member.

Keep it to one page, scannable, with a short do/do-not list.`,
  },
  {
    id: 'data-handling-card',
    name: 'AI Data-Handling Reference Card',
    intent: 'Generate the desk card that tells staff exactly what may and may not go into an AI tool.',
    useBefore: 'Onboarding any banker to an approved AI tool.',
    copyRule: 'PII, NPI, MNPI, and confidential supervisory information never enter a general AI tool.',
    dimension: 'data-security-guardrails',
    copyPrompt: `You are an information-security lead at a community bank writing a one-page AI data-handling reference card for frontline staff.

Produce:
- A short RED list: data classes that never enter a general AI tool (PII, NPI, MNPI, confidential supervisory information) with one banking example each.
- A GREEN list: what is safe to paste (with names stripped).
- The "strip it first" rule with a before/after example.
- The escalation path if someone is unsure or a leak occurs.

Output as a scannable desk card a teller could keep at their station.`,
  },
];

/** Order so the work products that close the taker's priority gaps come first. */
export function orderWorkProducts(
  priorityDimensions: readonly Dimension[],
): readonly WorkProduct[] {
  const priority = new Set(priorityDimensions);
  const matches = WORK_PRODUCTS.filter((w) => priority.has(w.dimension));
  const rest = WORK_PRODUCTS.filter((w) => !priority.has(w.dimension));
  return [...matches, ...rest];
}
