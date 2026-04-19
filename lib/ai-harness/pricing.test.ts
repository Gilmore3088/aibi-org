import { describe, it, expect } from 'vitest';
import { estimateCostCents } from '@/lib/ai-harness/pricing';

describe('estimateCostCents', () => {
  it('computes correctly for claude-opus-4-6 (1k input / 500 output)', () => {
    // 1000 * $15/M + 500 * $75/M = $0.015 + $0.0375 = $0.0525 USD = 5.25 cents → ceil → 6
    const result = estimateCostCents({
      provider: 'anthropic',
      model: 'claude-opus-4-6',
      inputTokens: 1_000,
      outputTokens: 500,
    });
    expect(result).toBe(6);
  });

  it('computes correctly for claude-opus-4-6 (100k input / 50k output)', () => {
    // 100_000 * $15/M + 50_000 * $75/M = $1.50 + $3.75 = $5.25 USD = 525 cents exactly
    const result = estimateCostCents({
      provider: 'anthropic',
      model: 'claude-opus-4-6',
      inputTokens: 100_000,
      outputTokens: 50_000,
    });
    expect(result).toBe(525);
  });

  it('computes correctly for claude-sonnet-4-6 (10k input / 5k output)', () => {
    // 10_000 * $3/M + 5_000 * $15/M = $0.03 + $0.075 = $0.105 USD = 10.5 cents → ceil → 11
    const result = estimateCostCents({
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      inputTokens: 10_000,
      outputTokens: 5_000,
    });
    expect(result).toBe(11);
  });

  it('falls back to Opus-tier pricing for unknown models', () => {
    // Both use 50k input / 20k output — unknown model should match Opus result
    // 50_000 * $15/M + 20_000 * $75/M = $0.75 + $1.50 = $2.25 USD = 225 cents
    const knownResult = estimateCostCents({
      provider: 'anthropic',
      model: 'claude-opus-4-6',
      inputTokens: 50_000,
      outputTokens: 20_000,
    });
    const unknownResult = estimateCostCents({
      provider: 'openai',
      model: 'gpt-unknown-future-model',
      inputTokens: 50_000,
      outputTokens: 20_000,
    });
    expect(knownResult).toBe(225);
    expect(unknownResult).toBe(knownResult);
  });

  it('rounds up — never returns 0 for a non-zero call', () => {
    // 1 input + 1 output token on haiku: (0.80 + 4) / 1_000_000 = 4.8e-6 USD → 4.8e-4 cents → ceil → 1
    const result = estimateCostCents({
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      inputTokens: 1,
      outputTokens: 1,
    });
    expect(result).toBeGreaterThanOrEqual(1);
  });

  it('returns 0 for a zero-token call', () => {
    const result = estimateCostCents({
      provider: 'anthropic',
      model: 'claude-opus-4-6',
      inputTokens: 0,
      outputTokens: 0,
    });
    expect(result).toBe(0);
  });
});
