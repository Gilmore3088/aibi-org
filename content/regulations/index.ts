/**
 * Regulatory frameworks the institute's curriculum aligns with.
 *
 * Single source of truth for the trust strip and any page that lists
 * regulatory alignment. Changing a regulator's short name here propagates
 * everywhere instantly.
 */

export interface Regulation {
  readonly slug: string;
  readonly short: string;
  readonly long: string;
  readonly issuer: string;
  readonly url?: string;
}

export const REGULATIONS: readonly Regulation[] = [
  {
    // Slug kept stable ("sr-11-7") — it is an internal key referenced by
    // consumers like TrustAnchor. SR 26-2 (Apr 17, 2026) supersedes SR 11-7.
    slug: "sr-11-7",
    short: "SR 26-2",
    long: "Supervisory Letter 26-2 — Revised Interagency Guidance on Model Risk Management (supersedes SR 11-7)",
    issuer: "Federal Reserve, OCC & FDIC",
    url: "https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm",
  },
  {
    slug: "tprm",
    short: "Interagency TPRM Guidance",
    long: "Interagency Guidance on Third-Party Relationships: Risk Management (88 FR 37920)",
    issuer: "OCC, Federal Reserve, FDIC",
    url: "https://www.federalregister.gov/documents/2023/06/09/2023-12340/interagency-guidance-on-third-party-relationships-risk-management",
  },
  {
    slug: "ecoa-reg-b",
    short: "ECOA / Regulation B",
    long: "Equal Credit Opportunity Act and its implementing regulation",
    issuer: "CFPB",
    url: "https://www.consumerfinance.gov/rules-policy/regulations/1002/",
  },
  {
    slug: "aieog",
    short: "AIEOG AI Lexicon",
    long: "AI Executive Oversight Group — AI Lexicon",
    issuer: "Treasury / FBIIC / FSSCC",
    url: "https://home.treasury.gov/news/press-releases/sb0401",
  },
] as const;
