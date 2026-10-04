// Banker skills: reusable, fill-in-the-blank AI skills for community-bank
// staff. One source per skill; the site renders it as a fill-in form, a
// plain-text prompt for any AI tool, and a Claude Skill (SKILL.md) that
// works in Claude chat and in Claude for Excel, PowerPoint, Word and Outlook.
//
// Catalog of record: the "AiBI Banker Skills Catalog" doc (approved
// 2026-10-04). Ids and names here must match it.
//
// Fields are written {{snake_case}} in `instructions`. Every field used
// there must be declared in `fields`, and every declared field must be used
// (skills.test.ts enforces both).

import type { RoleSlug } from '@/app/playbooks/data';

/** Where the skill runs best. Every skill also works pasted into chat. */
export type SkillApp = 'Chat' | 'Outlook' | 'Word' | 'Excel' | 'PowerPoint' | 'Teams';

export type SkillGroup = 'everyday' | 'office' | RoleSlug;

export type SkillFamily = 'Write' | 'Review' | 'Summarize' | 'Plan' | 'Excel' | 'PowerPoint' | 'Role';

export interface SkillField {
  /** snake_case; matches {{key}} in instructions. */
  readonly key: string;
  /** What the banker sees next to the box. Plain words, no jargon. */
  readonly label: string;
  /** A realistic example value. Invented names only, never real customers. */
  readonly example: string;
  /**
   * text: one line. long: paste a block (an email, notes, a policy excerpt).
   * file: a path or an attached file (the model reads the file itself).
   * choice: one of `options`.
   */
  readonly kind: 'text' | 'long' | 'file' | 'choice';
  readonly options?: readonly string[];
  /** Optional fields get a sensible default written into the instructions. */
  readonly required: boolean;
}

/** One case the improvement loop runs the skill against. */
export interface SkillTest {
  readonly name: string;
  /** Values for every required field. Synthetic data only. */
  readonly inputs: Readonly<Record<string, string>>;
  /** What a passing output must do, one checkable line each. */
  readonly rubric: readonly string[];
}

export interface BankerSkill {
  /** Catalog id: E1, X3, P2, MK5, RT1, ... */
  readonly id: string;
  /** URL and file slug, kebab-case, from the name. */
  readonly slug: string;
  /** Verb + object, five words or fewer. */
  readonly name: string;
  readonly group: SkillGroup;
  readonly family: SkillFamily;
  readonly apps: readonly SkillApp[];
  /** True when the skill fills or applies a file the bank supplies (deck master, spread workbook). */
  readonly usesTemplate?: boolean;
  /** One line: when a banker reaches for this. */
  readonly useWhen: string;
  /** One line: what comes back. */
  readonly youGet: string;
  readonly fields: readonly SkillField[];
  /**
   * The full skill, addressed to the model. Sections in this order:
   * ROLE, CONTEXT (with the fields), TASK (numbered steps), OUTPUT (exact
   * shape), RULES (what never to do), IF SOMETHING IS MISSING (ask, don't guess).
   */
  readonly instructions: string;
  /** 3-5 checks the banker runs before using the output. */
  readonly checks: readonly string[];
  /** One line: what never goes into this skill. */
  readonly neverPaste: string;
  /** A filled-in run. Inputs use field keys; output is illustrative. */
  readonly example: {
    readonly inputs: Readonly<Record<string, string>>;
    readonly output: string;
  };
  readonly tests: readonly SkillTest[];
  readonly version: number;
  readonly verifiedOn: string;
  readonly reviewBy: string;
}
