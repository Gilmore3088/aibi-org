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
  },
  {
    slug: "tprm",
    short: "Interagency TPRM Guidance",
    long: "Interagency Guidance on Third-Party Relationships: Risk Management",
    issuer: "OCC, Federal Reserve, FDIC",
  },
  {
    slug: "ecoa-reg-b",
    short: "ECOA / Regulation B",
    long: "Equal Credit Opportunity Act and its implementing regulation",
    issuer: "CFPB",
  },
  {
    slug: "aieog",
    short: "AIEOG AI Lexicon",
    long: "AI Executive Oversight Group — AI Lexicon",
    issuer: "Treasury / FBIIC / FSSCC",
  },
] as const;
