import { describe, it, expect } from 'vitest';
import {
  getTierMaturity,
  scoreToTier,
  getDimensionTierMeaning,
  BANKING_ROLES,
  type TierMaturity,
} from './maturity';
import { tiers } from './scoring';

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

describe('scoreToTier', () => {
  it('returns starting-point when dimension scored at minimum', () => {
    expect(scoreToTier(0, 4)).toBe('starting-point');
  });

  it('returns ready-to-scale when dimension scored at maximum', () => {
    expect(scoreToTier(4, 4)).toBe('ready-to-scale');
  });

  it('handles fractional coverage (free 12Q has 1 question per dimension)', () => {
    expect(scoreToTier(4, 4)).toBe('ready-to-scale');
    expect(scoreToTier(1, 4)).toBe('starting-point');
  });
});

describe('getDimensionTierMeaning (empty ladder)', () => {
  it('returns undefined while DIMENSION_TIER_LADDER is empty (Task 1 baseline state)', () => {
    expect(getDimensionTierMeaning('security-posture', 'building-momentum')).toBeUndefined();
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
});
