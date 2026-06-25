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
    slug: "sr-11-7",
    short: "SR 11-7",
    long: "Supervisory Letter 11-7 — Guidance on Model Risk Management",
    issuer: "Federal Reserve & OCC",
    url: "https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm",
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
