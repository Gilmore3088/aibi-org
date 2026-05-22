import { describe, it, expect } from 'vitest';
import { tiers } from './scoring';
import { SCORE_AUTHORITY } from './scoring-authority';

describe('SCORE_AUTHORITY.thresholdLogic stays consistent with tiers', () => {
  it('mentions every tier band literal from the canonical tiers definition', () => {
    for (const tier of tiers) {
      const expectedBand = `${tier.min}–${tier.max}`; // en dash U+2013
      expect(
        SCORE_AUTHORITY.thresholdLogic,
        `tier ${tier.id} band ${expectedBand} not mentioned in thresholdLogic copy`
      ).toContain(expectedBand);
    }
  });
});
