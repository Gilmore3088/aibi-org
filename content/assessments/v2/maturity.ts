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
    whatIsTrue:
      'A handful of staff are using AI tools — usually a free chat tool, usually on personal devices, usually for tasks they were going to do anyway. Nothing is shared. Nothing is documented. Leadership is either unaware or has not signaled whether this is allowed.',
    blockerToNext:
      'There is no leadership signal that AI use is sanctioned, no shared place where what works can be captured, and no permission to bring AI use onto bank work without ambiguity about policy.',
  },
  'early-stage': {
    tierId: 'early-stage',
    stageName: 'Team Adoption',
    whatIsTrue:
      'AI use has spread inside one or two teams — often Marketing, Operations, or a single curious branch. Informal best practices are emerging in the form of shared prompts and side-channel chatter. Most use is still unsanctioned by formal policy and invisible to compliance.',
    blockerToNext:
      'No written governance frame, no measurement of what AI use is producing, and no named executive sponsor to convert isolated team wins into an institutional program.',
  },
  'building-momentum': {
    tierId: 'building-momentum',
    stageName: 'Program Building',
    whatIsTrue:
      'AI use is sanctioned. A written acceptable-use policy exists, a use-case inventory is being maintained, and at least one named owner is accountable for AI risk. Real workflows are running in real seats — but the program is fragile because most institutional knowledge still lives in three or four individuals.',
    blockerToNext:
      'Measurement is not yet defensible to leadership or examiners, security and compliance review was bolted on rather than built in, and the program has not yet survived the loss of a key person.',
  },
  'ready-to-scale': {
    tierId: 'ready-to-scale',
    stageName: 'Operational Integration',
    whatIsTrue:
      'AI is part of how work gets done across multiple departments. Governance is operating, not theoretical — the policy is enforced, the inventory is current, and reviews happen on a schedule. Measurement produces budget-defensible numbers, and the next move is the builder move: building bank-specific tools rather than only adopting vendor tools.',
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
