import { describe, it, expect } from 'vitest';
import { getTierV2 } from './scoring';

describe('getTierV2 (12-48 scale)', () => {
  it.each([
    [12, 'starting-point'],
    [20, 'starting-point'],
    [21, 'early-stage'],
    [29, 'early-stage'],
    [30, 'building-momentum'],
    [38, 'building-momentum'],
    [39, 'ready-to-scale'],
    [48, 'ready-to-scale'],
  ])('score %i maps to %s', (score, expectedTierId) => {
    expect(getTierV2(score).id).toBe(expectedTierId);
  });

  it('throws for scores below 12', () => {
    expect(() => getTierV2(11)).toThrow();
  });

  it('throws for scores above 48', () => {
    expect(() => getTierV2(49)).toThrow();
  });
});
