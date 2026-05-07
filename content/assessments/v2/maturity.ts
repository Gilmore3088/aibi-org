// Maturity-stage substance for the four-tier system. Wraps (does not replace)
// the Tier type in scoring.ts. Authored content lives here as the single
// source of truth consumed by every assessment-results surface.

import type { Tier } from './scoring';
import type { Dimension } from './types';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface TierMaturity {
  readonly tierId: Tier['id'];
  /** Maturity-stage label (e.g. "Individual Experimentation"). Internal frame; not a public rebrand. */
  readonly stageName: string;
  /** One-paragraph "what is true at this stage" — banker-direct, present tense. */
  readonly whatIsTrue: string;
  /** The single named blocker holding the institution at this stage. Null only at the top tier. */
  readonly blockerToNext: string | null;
}

export interface BankingRole {
  readonly id:
    | 'deposit-operations'
    | 'loan-operations'
    | 'bsa-aml'
    | 'treasury-management'
    | 'branch-leadership'
    | 'compliance-review'
    | 'marketing'
    | 'collections'
    | 'card-operations';
  readonly label: string;
  /** Two-line description used when overlaying recommendations onto a role context. */
  readonly contextLine: string;
}

/** Per-dimension tier substance: what does dimension X mean at tier Y. 8 dims × 4 tiers = 32 cells. */
export interface DimensionTierMeaning {
  readonly dimension: Dimension;
  readonly tierId: Tier['id'];
  /** One-line meaning of this dimension at this tier. Banker-direct, present tense. */
  readonly meaning: string;
}

// ---------------------------------------------------------------------------
// AUTHORED CONTENT — populated in Tasks 2, 3, 4
// ---------------------------------------------------------------------------

export const TIER_MATURITY: Record<Tier['id'], TierMaturity> = {
  'starting-point': {
    tierId: 'starting-point',
    stageName: 'Individual Experimentation',
    whatIsTrue: 'TODO: authored in Task 2',
    blockerToNext: 'TODO: authored in Task 2',
  },
  'early-stage': {
    tierId: 'early-stage',
    stageName: 'Team Adoption',
    whatIsTrue: 'TODO: authored in Task 2',
    blockerToNext: 'TODO: authored in Task 2',
  },
  'building-momentum': {
    tierId: 'building-momentum',
    stageName: 'Program Building',
    whatIsTrue: 'TODO: authored in Task 2',
    blockerToNext: 'TODO: authored in Task 2',
  },
  'ready-to-scale': {
    tierId: 'ready-to-scale',
    stageName: 'Operational Integration',
    whatIsTrue: 'TODO: authored in Task 2',
    blockerToNext: null,
  },
};

export const BANKING_ROLES: readonly BankingRole[] = [
  { id: 'deposit-operations', label: 'Deposit Operations', contextLine: 'TODO: authored in Task 4' },
  { id: 'loan-operations', label: 'Loan Operations / Underwriting Support', contextLine: 'TODO: authored in Task 4' },
  { id: 'bsa-aml', label: 'BSA / AML Support', contextLine: 'TODO: authored in Task 4' },
  { id: 'treasury-management', label: 'Treasury Management', contextLine: 'TODO: authored in Task 4' },
  { id: 'branch-leadership', label: 'Branch Leadership', contextLine: 'TODO: authored in Task 4' },
  { id: 'compliance-review', label: 'Compliance Review', contextLine: 'TODO: authored in Task 4' },
  { id: 'marketing', label: 'Marketing', contextLine: 'TODO: authored in Task 4' },
  { id: 'collections', label: 'Collections', contextLine: 'TODO: authored in Task 4' },
  { id: 'card-operations', label: 'Card Operations', contextLine: 'TODO: authored in Task 4' },
] as const;

/** 32-cell ladder. Populated in Task 3. */
export const DIMENSION_TIER_LADDER: readonly DimensionTierMeaning[] = [];

// ---------------------------------------------------------------------------
// RESOLVERS — pure, total functions
// ---------------------------------------------------------------------------

export function getTierMaturity(tierId: Tier['id']): TierMaturity {
  return TIER_MATURITY[tierId];
}

/**
 * Map a per-dimension score (out of maxScore) onto the four-tier ladder.
 * Uses the same equal-spaced 9-point logic as overall scoring, normalized
 * to whatever maxScore the dimension actually has in this session.
 *
 * Pass the dimension's actual maxScore — typically 24 (6 questions × 4 points)
 * for the in-depth 48Q assessment, or 4 (1 question × 4 points) for the
 * free 12Q rotation.
 */
export function scoreToTier(score: number, maxScore: number): Tier['id'] {
  if (maxScore <= 0) return 'starting-point';
  const ratio = score / maxScore;
  if (ratio >= 0.875) return 'ready-to-scale';
  if (ratio >= 0.625) return 'building-momentum';
  if (ratio >= 0.375) return 'early-stage';
  return 'starting-point';
}

export function getDimensionTierMeaning(
  dimension: Dimension,
  tierId: Tier['id']
): DimensionTierMeaning | undefined {
  return DIMENSION_TIER_LADDER.find((c) => c.dimension === dimension && c.tierId === tierId);
}
