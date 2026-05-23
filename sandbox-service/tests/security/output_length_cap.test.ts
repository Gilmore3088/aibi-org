/**
 * §14.5 — output length cap. Gate truncates to gating.maxOutputChars.
 */

import { describe, expect, it } from 'vitest';
import { runOutputGate } from '../../src/gate/pipeline';

describe('§14.5 output length cap', () => {
  it('truncates over-long output to maxOutputChars', () => {
    const oversized = 'a'.repeat(10_000);
    const out = runOutputGate({
      rawOutput: oversized,
      gating: { maxOutputTokens: 800, maxOutputChars: 500 },
    });
    expect(out.outputText.length).toBeLessThanOrEqual(500);
  });

  it('preserves output below the cap unchanged in length', () => {
    const small = 'a'.repeat(100);
    const out = runOutputGate({
      rawOutput: small,
      gating: { maxOutputTokens: 800, maxOutputChars: 500 },
    });
    expect(out.outputText.length).toBeLessThanOrEqual(100);
  });
});
