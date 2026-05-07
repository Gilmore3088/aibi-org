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
}

export type EssayCategory =
  | "Governance"
  | "Risk & controls"
  | "Vendor / TPRM"
  | "Member impact"
  | "Practitioner work"
  | "Examiner trends"
  | "Methodology";
