import { describe, expect, it } from 'vitest';
import { SANDBOX_CONFIGS } from './index';

describe('Foundation sandbox data map', () => {
  const retiredLabPattern = new RegExp(
    ['final practitioner', 'lab'].join(' ') + '|' + ['Final Foundation', 'Lab'].join(' '),
    'i',
  );

  it('uses module 18 packet-review data for the final module surface', () => {
    const finalConfig = SANDBOX_CONFIGS[18];

    expect(finalConfig).toBeTruthy();
    expect(finalConfig?.systemPrompt).toContain('Foundation Packet');
    expect(finalConfig?.systemPrompt).not.toMatch(retiredLabPattern);
    expect(finalConfig?.sampleData.map((data) => data.id)).toEqual([
      'foundation-packet-template',
      'sample-foundation-packet',
      'packet-review-checklist',
    ]);
    expect(finalConfig?.sampleData.every((data) => data.sourceModuleNumber === 18)).toBe(true);
  });

  it('does not expose retired standalone module 12 packet data', () => {
    const module12Config = SANDBOX_CONFIGS[12];

    expect(module12Config).toBeTruthy();
    expect(module12Config?.sampleData.every((data) => data.sourceModuleNumber !== 12)).toBe(true);
    expect(JSON.stringify(module12Config)).not.toMatch(retiredLabPattern);
  });
});
