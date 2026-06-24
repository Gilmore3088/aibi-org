// promptWizardData.ts — scenario engine for the Module 3 Prompt Wizard.
//
// The teaching mechanic: the learner writes a freeform prompt for a banking
// task, and the AI's answer is a *deterministic function of which CORE
// elements the prompt contains*. The good/bad strings below are the actual
// reply text, one sentence per element, written so they concatenate into a
// coherent answer — and so each "bad" version is the visible failure that
// missing element produces (an invented number, a vague non-answer, a missing
// approval flag). The wizard renders them as one flowing reply with the
// broken parts flagged, so a lazy prompt is never rescued by a smart model.
//
// CORE = Context · Objective · Resources · Expectations.

export type CoreKey = 'context' | 'objective' | 'resources' | 'expectations';

export interface CoreElement {
  readonly key: CoreKey;
  readonly label: string;       // scorecard label
  readonly oneLiner: string;    // what "present" means, plain English
  readonly missingHint: string; // nudge shown when absent
  /** Heuristic: is this element present in the learner's prompt? */
  readonly detect: (prompt: string) => boolean;
  /** Reply sentence when the element IS present (the good answer chunk). */
  readonly good: string;
  /** Reply sentence when the element is MISSING (the visible failure). */
  readonly bad: string;
}

export interface WizardScenario {
  readonly id: string;
  readonly kind: 'warmup' | 'graded';
  readonly title: string;
  readonly memberQuestion: string;
  /** Approved source material the learner is meant to ground the prompt in. */
  readonly sourceLabel: string;
  readonly sourceMaterial: string;
  readonly starterPrompt: string;
  readonly elements: readonly CoreElement[];
  /** Closing line shown only when every element is present. */
  readonly winLine: string;
}

const lc = (s: string) => s.toLowerCase();
const has = (p: string, terms: readonly string[]) =>
  terms.some((t) => lc(p).includes(t));

// ── Scenario 1 — warm-up: fee-waiver FAQ ─────────────────────────────────
const feeWaiver: WizardScenario = {
  id: 'fee-waiver',
  kind: 'warmup',
  title: 'Fee-waiver question',
  memberQuestion:
    'A member asks: "I got a $12 monthly service fee on my Basic Checking. Can you waive it?"',
  sourceLabel: 'Approved fee-waiver policy (excerpt)',
  sourceMaterial:
    'Basic Checking monthly service fee: $12. Waived automatically when the account keeps a $1,500 minimum daily balance OR has a recurring direct deposit of $500+ per month. One courtesy waiver per 12 months may be granted by a banker for members who do not meet either condition. Courtesy waivers require banker approval.',
  starterPrompt:
    'You are a branch banking assistant helping a teller answer a member. Use only the Basic Checking fee-waiver policy below; do not guess. Tell whether the $12 fee can be waived and list the conditions. Answer in 2-3 plain-English sentences and note that courtesy waivers require banker approval.',
  elements: [
    {
      key: 'context',
      label: 'Context / role',
      oneLiner: 'Tell the AI who it is and who the answer is for.',
      missingHint: 'Add a role — e.g. "You are a branch banking assistant helping a teller."',
      detect: (p) =>
        has(p, ['you are', 'act as', 'as a ', 'assistant', 'teller', 'banker', 'branch']),
      good: 'Hi — happy to help with the $12 Basic Checking service fee.',
      bad: 'NOTICE: The Basic Checking monthly service charge is assessed pursuant to the institution’s fee schedule.',
    },
    {
      key: 'objective',
      label: 'Objective',
      oneLiner: 'State the exact task, not just the topic.',
      missingHint: 'Say what to produce — e.g. "tell me whether the fee can be waived and the two conditions."',
      detect: (p) =>
        has(p, ['waive', 'waiver', 'eligible', 'qualif', 'whether', 'can the fee', 'conditions', 'how']),
      good: 'Yes — that fee can be waived.',
      bad: 'There are a few general things worth knowing about how monthly checking fees work.',
    },
    {
      key: 'resources',
      label: 'Resources (grounding)',
      oneLiner: 'Point the AI at the approved source and forbid guessing.',
      missingHint: 'Add: "Use only the fee-waiver policy below. If it is not covered, say so."',
      detect: (p) =>
        has(p, ['policy', 'below', 'provided', 'only use', 'use only', 'based on', 'source', 'excerpt', 'do not guess', 'do not assume', 'do not make up']),
      good: 'It waives automatically with a $1,500 minimum daily balance or a recurring direct deposit of $500+ a month; if neither applies, a banker can grant one courtesy waiver per 12 months.',
      bad: 'It usually waives as long as you keep around $25 in the account or have any direct deposit set up.',
    },
    {
      key: 'expectations',
      label: 'Expectations (format + limits)',
      oneLiner: 'Constrain the output shape and add the escalation note.',
      missingHint: 'Add a format — e.g. "answer in 2–3 sentences, and note that the courtesy waiver needs banker approval."',
      detect: (p) =>
        has(p, ['sentence', 'bullet', 'short', 'under ', 'plain english', 'concise', 'note that', 'flag', 'approval', 'steps', 'format']),
      good: 'One note: the courtesy waiver needs banker approval, so confirm with your banker before promising it.',
      bad: 'We also have several other account types and seasonal promotions you might like, rates change from time to time, and there is always more we can look at together down the road.',
    },
  ],
  winLine:
    'Grounded, on-task, member-ready, and it flagged the approval step. That is a prompt you could hand a new teller.',
};

// ── Scenario 2 — graded: CD early-withdrawal penalty (calc + grounding) ───
const cdPenalty: WizardScenario = {
  id: 'cd-early-withdrawal',
  kind: 'graded',
  title: 'CD early-withdrawal penalty',
  memberQuestion:
    'A member asks: "I have a 12-month CD with $10,000 at 4.00% APY. If I close it 40 days early, what’s the penalty and what do I walk away with?"',
  sourceLabel: 'Approved CD penalty schedule (excerpt)',
  sourceMaterial:
    'Early-withdrawal penalty for terms of 12 months or less: 90 days of simple interest on the amount withdrawn, calculated at the certificate’s stated rate. Simple interest = principal × rate × (days ÷ 365). Penalties may reduce principal if earned interest is insufficient. Quote figures are estimates; the exact figure must be confirmed in the core system before the member is told.',
  starterPrompt:
    'You are a branch assistant preparing a member-ready answer. Use only the CD penalty schedule below; do not assume another formula. Calculate the 90-day simple-interest penalty and final amount the member receives for a $10,000 CD at 4.00% APY. Show the steps, then give a one-line answer and note the estimate must be confirmed in core before quoting.',
  elements: [
    {
      key: 'context',
      label: 'Context / role',
      oneLiner: 'Tell the AI who it is and who the answer is for.',
      missingHint: 'Add a role — e.g. "You are a branch assistant preparing a member-ready answer."',
      detect: (p) =>
        has(p, ['you are', 'act as', 'as a ', 'assistant', 'teller', 'banker', 'branch', 'member-ready', 'for the member']),
      good: 'Here’s a clear, member-ready way to explain the early CD closure.',
      bad: 'scratch: P=10000, r=0.04, t=40d, pen=?, net=P−pen.',
    },
    {
      key: 'objective',
      label: 'Objective',
      oneLiner: 'State the exact task: compute the penalty AND the walk-away amount.',
      missingHint: 'Say what to produce — "calculate the 90-day penalty and the final amount the member receives."',
      detect: (p) =>
        has(p, ['penalty', 'calculate', 'compute', 'how much', 'walk away', 'walk-away', 'final amount', 'receive', 'net']),
      good: 'Closing the 12-month CD 40 days early triggers a penalty, and you receive the balance minus that penalty.',
      bad: 'Early-withdrawal penalties are a standard CD feature meant to discourage closing the account before maturity.',
    },
    {
      key: 'resources',
      label: 'Resources (grounding)',
      oneLiner: 'Point the AI at the penalty schedule and forbid guessing the formula.',
      missingHint: 'Add: "Use only the penalty schedule below for the formula. Do not assume a different penalty."',
      detect: (p) =>
        has(p, ['schedule', 'policy', 'below', 'provided', 'only use', 'use only', 'based on', 'source', 'excerpt', 'do not guess', 'do not assume', 'do not make up', '90 days', '90-day']),
      good: 'The penalty is 90 days of simple interest at the 4.00% rate — $10,000 × 0.04 × (90 ÷ 365) ≈ $98.63 — so about $9,901.37 is returned.',
      bad: 'The penalty is usually around six months of interest, so roughly $200 — you’d get back about $9,800.',
    },
    {
      key: 'expectations',
      label: 'Expectations (format + limits)',
      oneLiner: 'Constrain the output and require the "confirm in core" safeguard.',
      missingHint: 'Add: "Show the steps, then a one-line member-ready answer, and note it must be confirmed in core before quoting."',
      detect: (p) =>
        has(p, ['step', 'show your work', 'show the work', 'bullet', 'one-line', 'one line', 'plain english', 'note that', 'flag', 'confirm', 'estimate', 'format', 'under ']),
      good: 'This is an estimate — confirm the exact figure in the core system before you quote it to the member.',
      bad: 'That should give you a rough sense of it.',
    },
  ],
  winLine:
    'Stepwise, grounded in the real 90-day rule, member-ready, and it flagged the core-system check. Examiner-proof.',
};

export const WIZARD_SCENARIOS: readonly WizardScenario[] = [feeWaiver, cdPenalty];

export function gradePrompt(
  scenario: WizardScenario,
  prompt: string,
): { readonly present: Record<CoreKey, boolean>; readonly score: number } {
  const present = {} as Record<CoreKey, boolean>;
  let score = 0;
  for (const el of scenario.elements) {
    const ok = prompt.trim().length > 0 && el.detect(prompt);
    present[el.key] = ok;
    if (ok) score += 1;
  }
  return { present, score };
}

export const MAX_TRIES = 6;
export const MIN_FINAL_PROMPT_LENGTH = 30;
