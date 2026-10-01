/**
 * Essay frontmatter — every MDX essay must export `meta` matching this shape.
 */

export interface EssayMeta {
  readonly slug: string;
  readonly title: string;
  /** Italic deck shown under the H1. Editorial, restrained. */
  readonly dek?: string;
  /** ISO date, e.g. "2026-04-24". */
  readonly date: string;
  readonly category: EssayCategory;
  readonly readMinutes: number;
  readonly author?: string;
  /** Sources for the closing block. */
  readonly sources?: readonly { readonly label: string; readonly url?: string }[];
  /** Optional override for the listing display order; lower = earlier. */
  readonly order?: number;
  /** Set to true to exclude from the public archive (drafts). */
  readonly draft?: boolean;
  /**
   * Briefings tier. `pulse` = short daily note (AiBI Research Desk byline),
   * `deep-dive` = weekly researched article. Absent on the pre-briefings
   * legacy essays, which render without a tier chip.
   */
  readonly tier?: BriefingTier;
}

export type BriefingTier = "pulse" | "deep-dive";

export type EssayCategory =
  | "Governance"
  | "Risk & controls"
  | "Vendor / TPRM"
  | "Member impact"
  | "Foundations work"
  | "Examiner trends"
  | "Methodology"
  // Briefings beats (2026-10): the four coverage lanes of the daily pulse.
  | "Regulators"
  | "Banks"
  | "Fintechs"
  | "AI models";
