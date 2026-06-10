// promptWizardData.ts — scenario engine for the Module 3 Prompt Wizard.
//
// The teaching mechanic: the learner writes a freeform prompt for a banking
// task, and the AI's answer is a *deterministic function of which CORE
// elements the prompt contains*. Miss the grounding element and the answer
// invents a number; miss the format element and it buries the answer in a
// paragraph. That visible cause→effect is the lesson — so the output is
// assembled from authored fragments keyed to each element, never piped to a
// model that would quietly rescue a lazy prompt.
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
  /** Output fragment when the element IS present (the good answer chunk). */
  readonly good: string;
  /** Output fragment when the element is MISSING (the visible failure). */
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
  elements: [
    {
      key: 'context',
      label: 'Context / role',
      oneLiner: 'Tell the AI who it is and who the answer is for.',
      missingHint: 'Add a role — e.g. "You are a branch banking assistant helping a teller."',
      detect: (p) =>
        has(p, ['you are', 'act as', 'as a ', 'assistant', 'teller', 'banker', 'branch']),
      good: 'Sets a helpful branch-banker tone aimed at the teller, not internal jargon.',
      bad: 'No role set — the answer drifts into policy-manual voice the teller has to translate for the member.',
    },
    {
      key: 'objective',
      label: 'Objective',
      oneLiner: 'State the exact task, not just the topic.',
      missingHint: 'Say what to produce — e.g. "tell me whether the fee can be waived and the two conditions."',
      detect: (p) =>
        has(p, ['waive', 'waiver', 'eligible', 'qualif', 'whether', 'can the fee', 'conditions', 'how']),
      good: 'Directly answers the waiver question with the two automatic conditions and the courtesy option.',
      bad: 'Gives a vague overview of checking fees instead of answering the actual waiver question.',
    },
    {
      key: 'resources',
      label: 'Resources (grounding)',
      oneLiner: 'Point the AI at the approved source and forbid guessing.',
      missingHint: 'Add: "Use only the fee-waiver policy below. If it is not covered, say so."',
      detect: (p) =>
        has(p, ['policy', 'below', 'provided', 'only use', 'use only', 'based on', 'source', 'excerpt', 'do not guess', 'do not assume', 'do not make up']),
      good: 'Cites the real thresholds: $1,500 minimum daily balance or a $500+ recurring direct deposit; plus one courtesy waiver per 12 months with banker approval.',
      bad: '⚠ Ungrounded — the AI invents a "$25 balance requirement" and a waiver rule that is not in your policy.',
    },
    {
      key: 'expectations',
      label: 'Expectations (format + limits)',
      oneLiner: 'Constrain the output shape and add the escalation note.',
      missingHint: 'Add a format — e.g. "answer in 2–3 sentences, and note that the courtesy waiver needs banker approval."',
      detect: (p) =>
        has(p, ['sentence', 'bullet', 'short', 'under ', 'plain english', 'concise', 'note that', 'flag', 'approval', 'steps', 'format']),
      good: 'Closes with a clean, member-ready summary and flags that the courtesy waiver needs banker approval.',
      bad: 'Runs long and never flags that the courtesy waiver needs banker sign-off, so the teller might promise something they can’t.',
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
  elements: [
    {
      key: 'context',
      label: 'Context / role',
      oneLiner: 'Tell the AI who it is and who the answer is for.',
      missingHint: 'Add a role — e.g. "You are a branch assistant preparing a member-ready answer."',
      detect: (p) =>
        has(p, ['you are', 'act as', 'as a ', 'assistant', 'teller', 'banker', 'branch', 'member-ready', 'for the member']),
      good: 'Frames a calm, member-ready explanation rather than an internal calculation dump.',
      bad: 'No role — the answer reads like raw scratch math, not something you would say to a member.',
    },
    {
      key: 'objective',
      label: 'Objective',
      oneLiner: 'State the exact task: compute the penalty AND the walk-away amount.',
      missingHint: 'Say what to produce — "calculate the 90-day penalty and the final amount the member receives."',
      detect: (p) =>
        has(p, ['penalty', 'calculate', 'compute', 'how much', 'walk away', 'walk-away', 'final amount', 'receive', 'net']),
      good: 'Computes both the penalty and the final walk-away amount, which is what the member actually asked.',
      bad: 'Explains what an early-withdrawal penalty is in general but never produces the numbers the member asked for.',
    },
    {
      key: 'resources',
      label: 'Resources (grounding)',
      oneLiner: 'Point the AI at the penalty schedule and forbid guessing the formula.',
      missingHint: 'Add: "Use only the penalty schedule below for the formula. Do not assume a different penalty."',
      detect: (p) =>
        has(p, ['schedule', 'policy', 'below', 'provided', 'only use', 'use only', 'based on', 'source', 'excerpt', 'do not guess', 'do not assume', 'do not make up', '90 days', '90-day']),
      good: 'Uses the correct rule — 90 days of simple interest at 4.00%: $10,000 × 0.04 × (90 ÷ 365) ≈ $98.63 penalty → about $9,901.37 returned.',
      bad: '⚠ Ungrounded — the AI guesses a "6-month interest" penalty and produces a wrong ~$200 figure you would have quoted to the member.',
    },
    {
      key: 'expectations',
      label: 'Expectations (format + limits)',
      oneLiner: 'Constrain the output and require the "confirm in core" safeguard.',
      missingHint: 'Add: "Show the steps, then a one-line member-ready answer, and note it must be confirmed in core before quoting."',
      detect: (p) =>
        has(p, ['step', 'show your work', 'show the work', 'bullet', 'one-line', 'one line', 'plain english', 'note that', 'flag', 'confirm', 'estimate', 'format', 'under ']),
      good: 'Shows the steps, gives a one-line member-ready figure, and flags that the estimate must be confirmed in core before quoting.',
      bad: 'Buries a single number in a dense paragraph with no steps and no "confirm in core" caveat — easy to mis-quote.',
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
