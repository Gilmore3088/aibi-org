/**
 * AI Skills the AiBI-Foundation curriculum teaches bankers to build.
 *
 * "Skill" here is the AI primitive — a packaged, named, reusable
 * capability invoked by slash command, not a learning outcome.
 * Each Skill encodes a specific workflow with strong opinions about
 * format, decision logic, and citations.
 *
 * This file lists the flagship Skills the curriculum centers on. The
 * full library lives in the Toolbox (toolbox_library_skills in
 * Supabase) and grows as practitioners ship their own. The flagships
 * surface on /education and the homepage as a representative sample.
 *
 * Departments mirror the org chart of a community FI, not abstract
 * pillars — Skills are owned by the people doing the work.
 */

export type AiSkillDept =
  | "Retail"
  | "Lending"
  | "Compliance"
  | "Executive"
  | "Research";

export interface AiSkill {
  readonly cmd: string;
  readonly name: string;
  readonly dept: AiSkillDept;
  readonly summary: string;
}

export const AI_SKILLS: readonly AiSkill[] = [
  {
    cmd: "/disclosure-review",
    name: "Deposit account disclosure review",
    dept: "Retail",
    summary:
      "Audits a TIS / Reg DD draft against a structured rubric. Returns redline plus reviewer checklist for compliance sign-off.",
  },
  {
    cmd: "/adverse-action",
    name: "Adverse action letter",
    dept: "Retail",
    summary:
      "Reg B-compliant adverse action notice generated from underwriting decision data, with reasons properly categorized.",
  },
  {
    cmd: "/credit-memo",
    name: "Credit memo drafter",
    dept: "Lending",
    summary:
      "Drafts a credit memo in your house format from loan app, bureau extract, and financials. The lender edits — they don't draft from scratch.",
  },
  {
    cmd: "/sar-narrative",
    name: "BSA SAR narrative",
    dept: "Compliance",
    summary:
      "Drafts the SAR narrative in FinCEN-expected structure (who, what, when, where, why, how) from alert detail and KYC context.",
  },
  {
    cmd: "/board-packet-section",
    name: "Board packet section",
    dept: "Executive",
    summary:
      "ALCO, credit quality, deposit composition, capital adequacy — drafts the recurring board narrative in the institution's house style.",
  },
  {
    cmd: "/local-institution-research",
    name: "Local institution researcher",
    dept: "Research",
    summary:
      "Sourced intelligence brief on any community FI — call reports, NCUA 5300, branch footprint, leadership, fees. Public sources only.",
  },
  {
    cmd: "/board-prep-market-brief",
    name: "Board-prep market brief",
    dept: "Research",
    summary:
      "One-page local competitive landscape for the board packet. Sourced. Recurring monthly.",
  },
] as const;
