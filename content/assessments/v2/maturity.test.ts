import { describe, it, expect } from 'vitest';
import {
  getTierMaturity,
  scoreToTier,
  getDimensionTierMeaning,
  BANKING_ROLES,
  DIMENSION_TIER_LADDER,
  type TierMaturity,
} from './maturity';
import { tiers } from './scoring';
import { DIMENSION_LABELS } from './types';

describe('getTierMaturity', () => {
  it('returns substance for every tier id', () => {
    for (const tier of tiers) {
      const m = getTierMaturity(tier.id);
      expect(m.tierId).toBe(tier.id);
      expect(m.stageName.length).toBeGreaterThan(0);
      expect(m.whatIsTrue.length).toBeGreaterThan(0);
      expect(m.blockerToNext === null || m.blockerToNext.length > 0).toBe(true);
    }
  });

  it('only the top tier has a null blockerToNext', () => {
    const top = getTierMaturity('ready-to-scale');
    expect(top.blockerToNext).toBeNull();
    expect(getTierMaturity('starting-point').blockerToNext).not.toBeNull();
  });
});

// scoreToTier now routes through tierFromPct (audit A1 follow-up,
// 2026-05-24): same percent-of-max rubric the overall composite uses,
// so per-dimension and overall tiers cannot disagree at equivalent
// percentages. Thresholds: < 50 starting · 50-74 early · 75-89
// building · ≥ 90 ready.
describe('scoreToTier (unified rubric — 50/75/90 pct-of-max)', () => {
  it('returns starting-point when dimension scored at minimum', () => {
    expect(scoreToTier(0, 4)).toBe('starting-point');
  });

  it('returns ready-to-scale when dimension scored at maximum', () => {
    expect(scoreToTier(4, 4)).toBe('ready-to-scale');
  });

  it('handles fractional coverage (free 12Q has 1 question per dimension)', () => {
    expect(scoreToTier(4, 4)).toBe('ready-to-scale'); // 100% → ready
    expect(scoreToTier(1, 4)).toBe('starting-point'); // 25% → starting
  });

  it('matches the overall ladder bands at typical maxScore values', () => {
    // maxScore=4 (1-question free dim): thresholds at 2, 3, 3.6
    expect(scoreToTier(2, 4)).toBe('early-stage');       // 50%  → early
    expect(scoreToTier(3, 4)).toBe('building-momentum'); // 75%  → building
    expect(scoreToTier(4, 4)).toBe('ready-to-scale');    // 100% → ready

    // maxScore=24 (6-question in-depth dim): thresholds at 12, 18, 21.6
    expect(scoreToTier(6, 24)).toBe('starting-point');     // 25%   → starting
    expect(scoreToTier(11, 24)).toBe('starting-point');    // 45.8% → starting (was early under floor-anchored)
    expect(scoreToTier(12, 24)).toBe('early-stage');       // 50%   → early
    expect(scoreToTier(15, 24)).toBe('early-stage');       // 62.5% → early (was building under floor-anchored)
    expect(scoreToTier(18, 24)).toBe('building-momentum'); // 75%   → building
    expect(scoreToTier(20, 24)).toBe('building-momentum'); // 83.3% → building (was ready under floor-anchored)
    expect(scoreToTier(22, 24)).toBe('ready-to-scale');    // 91.7% → ready
  });
});

describe('DIMENSION_TIER_LADDER', () => {
  it('has exactly 32 cells (8 dimensions × 4 tiers)', () => {
    expect(DIMENSION_TIER_LADDER).toHaveLength(32);
  });

  it('every dimension × tier combination is present exactly once', () => {
    const dimensions = Object.keys(DIMENSION_LABELS) as (keyof typeof DIMENSION_LABELS)[];
    for (const dim of dimensions) {
      for (const tier of tiers) {
        const matches = DIMENSION_TIER_LADDER.filter(
          (c) => c.dimension === dim && c.tierId === tier.id
        );
        expect(matches, `missing or duplicate cell for ${dim} × ${tier.id}`).toHaveLength(1);
      }
    }
  });

  it('every cell has non-empty meaning copy', () => {
    for (const cell of DIMENSION_TIER_LADDER) {
      expect(cell.meaning.length, `${cell.dimension} × ${cell.tierId}`).toBeGreaterThan(40);
    }
  });

  it('getDimensionTierMeaning returns the matching cell', () => {
    const cell = getDimensionTierMeaning('security-posture', 'building-momentum');
    expect(cell).toBeDefined();
    expect(cell?.meaning).toMatch(/.+/);
  });
});

describe('BANKING_ROLES', () => {
  it('includes the nine canonical seats from the spec', () => {
    const ids = BANKING_ROLES.map((r) => r.id);
    expect(ids).toEqual([
      'deposit-operations',
      'loan-operations',
      'bsa-aml',
      'treasury-management',
      'branch-leadership',
      'compliance-review',
      'marketing',
      'collections',
      'card-operations',
    ]);
  });

  it('every role has a non-trivial contextLine', () => {
    for (const role of BANKING_ROLES) {
      expect(role.contextLine.length, role.id).toBeGreaterThan(40);
      expect(role.contextLine, role.id).not.toMatch(/TODO/);
    }
  });
});
