// strategyDrillData.ts — Module 3 strategy quick-fire drill.
//
// Eight banking tasks; the learner matches each to the right prompt strategy
// from the shelf. Untimed, instant feedback, one-line "why" after each. The
// drill IS the lesson — it turns the strategy-shelf table into reps.

export type Strategy =
  | 'Structured'
  | 'Transformation'
  | 'Analysis'
  | 'Thinking'
  | 'Template'
  | 'Sanitisation';

export const STRATEGIES: readonly Strategy[] = [
  'Structured',
  'Transformation',
  'Analysis',
  'Thinking',
  'Template',
  'Sanitisation',
];

export interface DrillRound {
  readonly task: string;
  readonly answer: Strategy;
  readonly why: string;
}

export const STRATEGY_ROUNDS: readonly DrillRound[] = [
  {
    task: 'A wordy internal procedure email needs to be shorter and clearer.',
    answer: 'Transformation',
    why: 'You already have the text — you need a better form of it, not new content.',
  },
  {
    task: 'Draft a first response to a member who complained about a fee.',
    answer: 'Structured',
    why: 'New output from nothing — name the role, the task, and the format.',
  },
  {
    task: 'Find the missing items in a loan file against an underwriting checklist.',
    answer: 'Analysis',
    why: 'Review with a defined lens — gap-finding, not drafting.',
  },
  {
    task: 'Work out how to roll a new overdraft policy out to branch staff.',
    answer: 'Thinking',
    why: 'You need structure and trade-offs before you act, not a finished document.',
  },
  {
    task: 'You run the same weekly branch performance summary every Monday.',
    answer: 'Template',
    why: 'It repeats — it deserves a reusable, parameterised pattern.',
  },
  {
    task: 'A member’s question still contains their SSN and account number.',
    answer: 'Sanitisation',
    why: 'Strip the specifics before you ask — the structure rarely needs them.',
  },
  {
    task: 'Turn a long regulatory bulletin into a five-line summary for the team.',
    answer: 'Transformation',
    why: 'Reshaping existing source text into a tighter form.',
  },
  {
    task: 'List the objections leadership might raise to an AI pilot, in priority order.',
    answer: 'Thinking',
    why: 'Organising reasoning before action — the model returns structure, you decide.',
  },
];
