/**
 * References registry — the single source of truth for the public /references
 * page ("Sources & references").
 *
 * Goal: keep marketing and product copy clean. Instead of name-dropping a
 * regulation, standard, or statistic inline, copy links to /references (or to
 * the specific anchor), and this file owns the full citation + the canonical
 * source URL.
 *
 * The page composes three groups:
 *   1. Regulatory & supervisory frameworks — the curriculum-alignment set in
 *      content/regulations (REGULATIONS), rendered with their source URLs.
 *   2. Standards, frameworks & government reports — additional sources cited in
 *      educational copy (NIST, OWASP, GAO, GLBA, FinCEN, CDFI).
 *   3. Statistics & research — every figure on the site, sourced from
 *      content/citations (CITATIONS).
 *
 * Adding a source is a one-line entry here; copy elsewhere should link to the
 * anchor (/references#<slug>) rather than restating the citation.
 */

export interface ReferenceSource {
  readonly slug: string;
  readonly short: string;
  readonly long: string;
  readonly issuer: string;
  /** One-line note on how the Institute uses or refers to this source. */
  readonly note: string;
  readonly url: string;
}

/**
 * Standards, frameworks, and government reports cited in educational copy that
 * are not part of the curriculum-alignment trust strip (REGULATIONS).
 */
export const REFERENCE_SOURCES: readonly ReferenceSource[] = [
  {
    slug: "nist-ai-rmf",
    short: "NIST AI RMF 1.0",
    long: "AI Risk Management Framework (AI RMF 1.0, NIST AI 100-1)",
    issuer: "National Institute of Standards and Technology",
    note: "The Govern / Map / Measure / Manage structure behind the Institute's governance templates.",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  {
    slug: "owasp-llm-top-10",
    short: "OWASP LLM Top 10",
    long: "OWASP Top 10 for Large Language Model Applications",
    issuer: "OWASP GenAI Security Project",
    note: "The named LLM risk categories (prompt injection, data leakage) used in the security and data-handling guidance.",
    url: "https://genai.owasp.org/llm-top-10/",
  },
  {
    slug: "gao-25-107197",
    short: "GAO-25-107197",
    long: "Artificial Intelligence: Use and Oversight in Financial Services (May 2025)",
    issuer: "U.S. Government Accountability Office",
    note: "The basis for the statement that there is no comprehensive AI-specific banking regulation yet.",
    url: "https://www.gao.gov/products/gao-25-107197",
  },
  {
    slug: "glba-safeguards",
    short: "GLBA Safeguards Rule",
    long: "Gramm-Leach-Bliley Act, Safeguards Rule (16 CFR Part 314) and Regulation P",
    issuer: "FTC / CFPB",
    note: "The information-security and privacy baseline referenced in data-handling and policy templates.",
    url: "https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know",
  },
  {
    slug: "fincen-bsa-aml",
    short: "FinCEN BSA / AML",
    long: "Bank Secrecy Act / Anti-Money Laundering program and SAR requirements",
    issuer: "Financial Crimes Enforcement Network",
    note: "The reporting-threshold and SAR context used in the AI failure-mode examples.",
    url: "https://www.fincen.gov/resources/statutes-and-regulations",
  },
  {
    slug: "cdfi-fund",
    short: "CDFI Fund",
    long: "Community Development Financial Institutions Fund",
    issuer: "U.S. Department of the Treasury",
    note: "Context for mission-driven community lenders referenced in institution materials.",
    url: "https://www.cdfifund.gov/",
  },
] as const;
