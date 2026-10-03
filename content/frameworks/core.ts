// CORE: the one prompt framework the Institute teaches.
//
// Every surface that names a prompt structure (course, certification exam,
// labs, Transformation Report, free downloads, briefs) uses these four parts
// and these names. The Module 3 wizard's scorecard wording is the source; this
// file is where the rest of the site reads it from. A guard test
// (core.test.ts) fails the build if another framework name or part list
// appears on a public or course surface.
//
// Decided 2026-10-03 (docs/prompt-framework-consistency-plan.md).

export type CorePartKey = 'context' | 'objective' | 'resources' | 'expectations';

export interface CorePart {
  readonly key: CorePartKey;
  readonly name: string;
  /** One line a banker can act on. Matches the Module 3 scorecard. */
  readonly definition: string;
  /**
   * Parts of the older frameworks this one replaces, so a reader who learned
   * one of them elsewhere can map it. Order matters: most common first.
   */
  readonly absorbs: readonly string[];
}

export const CORE_NAME = 'CORE';

export const CORE_PARTS: readonly CorePart[] = [
  {
    key: 'context',
    name: 'Context',
    definition: 'Tell the AI who it is and who the answer is for.',
    absorbs: ['Role', 'audience', 'situation'],
  },
  {
    key: 'objective',
    name: 'Objective',
    definition: 'State the exact task, not just the topic.',
    absorbs: ['Task'],
  },
  {
    key: 'resources',
    name: 'Resources',
    definition: 'Point the AI at the approved source, use placeholders for anything sensitive, and forbid guessing.',
    absorbs: ['Source', '"use only [SOURCE]"', 'placeholders'],
  },
  {
    key: 'expectations',
    name: 'Expectations',
    definition: 'Set the output shape and limits, say what not to do, and say how it gets checked.',
    absorbs: ['Format', 'Constraints', 'Review', '"mark [VERIFY]"', '"draft for [REVIEWER]"'],
  },
] as const;

/** "Context, Objective, Resources, Expectations" — the canonical spelled-out list. */
export const CORE_PART_LIST = CORE_PARTS.map((p) => p.name).join(', ');

/**
 * The 5-move discipline on the CORE card is not a second framework. Moves 1–3
 * build a CORE prompt; moves 4–5 handle the answer.
 */
export const FIVE_MOVES_TO_CORE: Readonly<Record<string, readonly CorePartKey[] | 'after-the-answer'>> = {
  State: ['context', 'objective'],
  Ground: ['resources'],
  Constrain: ['expectations'],
  Check: 'after-the-answer',
  Escalate: 'after-the-answer',
};

/**
 * One-line bridge for readers who met RTFC or the Banker Prompt Formula
 * elsewhere. Used where time-fixed material (the lab sample files) still
 * carries an older label.
 */
export const OLDER_LABEL_NOTE =
  'Older material may call this an RTFC prompt. Read Role as Context, Task as Objective, and Format and Constraints as Expectations.';
