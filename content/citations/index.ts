/**
 * Sourced statistics registry — single source of truth for every figure
 * cited on the public site. Components reference citations by slug; the
 * citation object owns the value, source, and date.
 *
 * Rule: nothing on the public site shows a number that doesn't appear here.
 *
 *   import { CITATIONS, citation } from "@content/citations";
 *
 *   <KPIRibbon items={[
 *     {
 *       label: "Skills gap",
 *       value: citation("gartner-skills-gap").value,
 *       desc: citation("gartner-skills-gap").claim,
 *       source: citation("gartner-skills-gap").short,
 *     },
 *   ]} />
 *
 * Adding a citation is a 1-line entry. Updating a value updates everywhere
 * the slug is referenced.
 */

export interface Citation {
  readonly slug: string;
  readonly value: string;
  /** The natural-language claim — e.g. "of community banks discussing AI in their budget". */
  readonly claim: string;
  readonly publication: string;
  readonly publisher: string;
  readonly year: number;
  /** Short citation rendered in mono under stats. */
  readonly short: string;
  readonly url?: string;
}

export const CITATIONS: readonly Citation[] = [
  {
    slug: "bank-director-budget",
    value: "66%",
    claim: "of community banks are discussing AI in their budget",
    publication: "2024 Technology Survey",
    publisher: "Bank Director (via Jack Henry & Associates)",
    year: 2025,
    short: "Bank Director, 2024 Technology Survey (via Jack Henry, 2025)",
  },
  {
    slug: "gartner-skills-gap",
    value: "57%",
    claim: "of financial institutions struggle with AI skill gaps",
    publication: "Gartner Peer Community",
    publisher: "Gartner (via Jack Henry & Associates)",
    year: 2025,
    short: "Gartner Peer Community (via Jack Henry, 2025)",
  },
  {
    slug: "gartner-no-governance",
    value: "55%",
    claim: "of financial institutions have no AI governance framework yet",
    publication: "Gartner Peer Community",
    publisher: "Gartner (via Jack Henry & Associates)",
    year: 2025,
    short: "Gartner Peer Community (via Jack Henry, 2025)",
  },
  {
    slug: "gartner-no-clarity",
    value: "48%",
    claim: "of financial institutions lack clarity on AI business impacts",
    publication: "Gartner Peer Community",
    publisher: "Gartner (via Jack Henry & Associates)",
    year: 2025,
    short: "Gartner Peer Community (via Jack Henry, 2025)",
  },
  {
    slug: "fdic-community-bank-efficiency-ratio",
    value: "~65%",
    claim: "is the community-bank median efficiency ratio (vs. ~55.7% industry-wide)",
    publication: "Quarterly Banking Profile, Q4 2024",
    publisher: "FDIC",
    year: 2024,
    short: "FDIC Quarterly Banking Profile, Q4 2024",
  },
  {
    slug: "personetics-switch-for-ai",
    value: "84%",
    claim: "would switch financial institutions for AI-driven financial insights",
    publication: "Personetics 2025 study",
    publisher: "Personetics (via Apiture)",
    year: 2025,
    short: "Personetics, 2025 (via Apiture)",
  },
  {
    slug: "personetics-fee-alerts",
    value: "62%",
    claim: "are open to AI-powered fee alerts",
    publication: "2025 consumer survey",
    publisher: "Personetics (via Apiture)",
    year: 2025,
    short: "Personetics, 2025 consumer survey (via Apiture)",
  },
  {
    slug: "motley-fool-switch-for-digital",
    value: "76%",
    claim: "would switch financial institutions for a better digital experience",
    publication: "consumer banking study",
    publisher: "The Motley Fool (via Apiture)",
    year: 2024,
    short: "Motley Fool (via Apiture)",
  },
  {
    slug: "fdic-community-banks-count",
    value: "~8,400",
    claim: "FDIC-insured community banks and credit unions in the United States",
    publication: "BankFind Suite",
    publisher: "FDIC",
    year: 2024,
    short: "FDIC, Q4 2024",
  },
] as const;

export function citation(slug: string): Citation {
  const found = CITATIONS.find((c) => c.slug === slug);
  if (!found) {
    throw new Error(`Citation not found: ${slug}. Add it to content/citations/index.ts.`);
  }
  return found;
}

/** Helper for KPI ribbon items where slug → ready-to-render KPI shape. */
export function citationAsKPI(slug: string, label: string) {
  const c = citation(slug);
  return {
    label,
    value: c.value,
    desc: c.claim,
    source: c.short,
  };
}
