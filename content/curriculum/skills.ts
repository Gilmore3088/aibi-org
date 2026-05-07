/**
 * Skills practitioners leave the curriculum knowing how to do.
 *
 * Verb-stated outcomes. Used on program pages and for-institutions to make
 * the program's value concrete.
 */

export interface CurriculumSkill {
  readonly slug: string;
  readonly verb: string;
  readonly note: string;
  /** Curriculum module(s) where this skill is built. */
  readonly modules: readonly number[];
}

export const SKILLS: readonly CurriculumSkill[] = [
  {
    slug: "verifiable-prompting",
    verb: "Prompt for verifiable, auditable output",
    note: "Audit-trail-friendly patterns; ECOA / Reg B-aware drafting.",
    modules: [3, 4],
  },
  {
    slug: "contain-hallucination",
    verb: "Recognize and contain hallucination",
    note: "The negative-space check; when to refuse the answer.",
    modules: [3, 5],
  },
  {
    slug: "boundary-safety",
    verb: "Apply boundary safety",
    note: "What never goes in a public model; RBAC, redaction, vendor data flow.",
    modules: [2],
  },
  {
    slug: "map-to-sr-11-7",
    verb: "Map AI workflows to SR 11-7 / TPRM",
    note: "The frameworks your examiners already use, applied to the work.",
    modules: [6],
  },
  {
    slug: "use-case-inventory",
    verb: "Author and maintain a use-case inventory",
    note: "Begin one for your institution as a capstone deliverable.",
    modules: [6, 8],
  },
  {
    slug: "role-workflows",
    verb: "Build repeatable role-specific workflows",
    note: "Three reviewed artifacts you ship, peer- and instructor-reviewed.",
    modules: [4, 7, 8],
  },
] as const;
