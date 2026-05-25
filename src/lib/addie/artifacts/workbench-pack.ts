// Workbench Pack — type definitions for M4's primary paid artifact.
//
// Phase 2 of the 2026-05-25 Foundation UX recovery plan (Decision #2).
// Replaces the prior Skill / SkillTemplate / VerifiedSkill artifact-set
// as M4's saved unit. One composite addie.toolbox_items row per Pack
// (open question #1 default: composite over parent/child rows).
//
// The seven pedagogical fields land the reviewer-fleet shape: source
// packet → prompt → first output → review tags → improved output →
// questions to confirm → final work product. CRO Margaret's
// 2026-05-24 finding (#1) adds the four governance fields so a saved
// Pack carries the SR 11-7 metadata a model-risk function needs.
//
// The Pack stores in addie.toolbox_items.content as JSON. The
// markdown export (open question #2, default yes) lives in a sibling
// helper.

export interface WorkbenchPackContent {
  // ---- Pedagogical core (2026-05-25 review) -------------------------
  /** The synthetic banking source material the learner started from. */
  readonly sourcePacket: string;
  /** The prompt as the learner sent it. */
  readonly promptUsed: string;
  /** The first raw output the model returned. */
  readonly firstOutput: string;
  /**
   * Banker-context review tags applied to the first output (e.g.
   * "fabricated citation", "tone off for member-facing", "MNPI risk").
   * Free-form; the M4 review UI surfaces a starter chip set per lab.
   */
  readonly reviewTags: ReadonlyArray<string>;
  /** The output after applying the review tags as prompt edits. */
  readonly improvedOutput: string;
  /** The 4-question guardrail check from M4.4 (cites? tone? human pass? break it how?). */
  readonly questionsToConfirm: ReadonlyArray<string>;
  /** The final work product — what the learner would actually send / save. */
  readonly finalWorkProduct: string;

  // ---- Governance metadata (CRO Margaret 2026-05-24) -----------------
  /** Version stamp. 1 for a freshly saved Pack; bumps on each re-save. */
  readonly version: number;
  /**
   * Approver — null while the Pack is in personal-use scope. Named on
   * team deploy so a model-risk function can inventory the Pack as a
   * recurrently-used model under SR 11-7.
   */
  readonly approver: string | null;
  /**
   * Use boundary. 'personal sandbox' = learner-only practice;
   * 'named-task production' = the Pack will be run recurrently
   * against real work and needs governance attached.
   */
  readonly useBoundary: 'personal sandbox' | 'named-task production';
  /**
   * Validation notes — what the learner verified before saving. Anchors
   * the M4.4 four-question guardrail check as a written record.
   */
  readonly validationNotes: string;
}

/**
 * Export a Workbench Pack as plain markdown the learner can paste into
 * Claude / ChatGPT / their bank's sanctioned AI tool outside the
 * Toolbox. Branch Mgr Devon's "recipe vs kitchen" finding (recovery
 * plan #10): the Pack must travel.
 */
export function packToMarkdown(pack: WorkbenchPackContent): string {
  const tagsBlock = pack.reviewTags.length
    ? pack.reviewTags.map((t) => `- ${t}`).join('\n')
    : '_(no review tags)_';
  const questionsBlock = pack.questionsToConfirm.length
    ? pack.questionsToConfirm.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : '_(no confirmation questions)_';

  return [
    `# Workbench Pack — v${pack.version}`,
    '',
    `**Use boundary:** ${pack.useBoundary}`,
    `**Approver:** ${pack.approver ?? '_(none — personal use)_'}`,
    '',
    `## Source packet`,
    '',
    pack.sourcePacket,
    '',
    `## Prompt used`,
    '',
    '```',
    pack.promptUsed,
    '```',
    '',
    `## First output`,
    '',
    pack.firstOutput,
    '',
    `## Review tags`,
    '',
    tagsBlock,
    '',
    `## Improved output`,
    '',
    pack.improvedOutput,
    '',
    `## Questions to confirm`,
    '',
    questionsBlock,
    '',
    `## Final work product`,
    '',
    pack.finalWorkProduct,
    '',
    `## Validation notes`,
    '',
    pack.validationNotes,
    '',
  ].join('\n');
}

/**
 * Minimal validator — checks that the pedagogical core fields are
 * non-empty before save. Governance metadata can be backfilled later
 * (the approver is intentionally null until team deploy).
 */
export function isPackComplete(pack: WorkbenchPackContent): boolean {
  return (
    pack.sourcePacket.trim().length > 0 &&
    pack.promptUsed.trim().length > 0 &&
    pack.firstOutput.trim().length > 0 &&
    pack.improvedOutput.trim().length > 0 &&
    pack.finalWorkProduct.trim().length > 0 &&
    pack.questionsToConfirm.length >= 1
  );
}
