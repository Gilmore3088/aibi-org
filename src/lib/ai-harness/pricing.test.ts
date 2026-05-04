import { describe, it, expect } from 'vitest';

import { estimateCostCents } from './pricing';

// Hand-computed cents-per-call for a fixed 1000-input / 800-output mix.
// Acts as a tripwire: if a rate is silently edited in pricing.ts, one of
// these expectations breaks. Recompute by hand and update intentionally
// when a provider's published rate actually changes.
//
// Formula: ceil(((1000 * inputPerM) + (800 * outputPerM)) / 1_000_000 * 100)
// Floor of 1 cent for any non-zero call.
const INPUT_TOKENS = 1000;
const OUTPUT_TOKENS = 800;

interface Case {
  readonly model: string;
  readonly provider: 'anthropic' | 'openai' | 'gemini';
  readonly expectedCents: number;
}

const CASES: readonly Case[] = [
  // Anthropic — claude.com/pricing (verified 2026-05-04)
  // Haiku 4.5: $1 / $5  → (1000 + 4000)/1M = $0.005 = 0.5c → ceil 1c
  { model: 'claude-haiku-4-5-20251001', provider: 'anthropic', expectedCents: 1 },
  // Sonnet 4.6: $3 / $15 → (3000 + 12000)/1M = $0.015 = 1.5c → ceil 2c
  { model: 'claude-sonnet-4-6', provider: 'anthropic', expectedCents: 2 },

  // OpenAI — platform.openai.com/docs/pricing (verified 2026-05-04)
  // gpt-4o-mini: $0.15 / $0.60 → (150 + 480)/1M = $0.00063 = 0.063c → ceil 1c
  { model: 'gpt-4o-mini', provider: 'openai', expectedCents: 1 },
  // gpt-4o: $2.50 / $10.00 → (2500 + 8000)/1M = $0.0105 = 1.05c → ceil 2c
  { model: 'gpt-4o', provider: 'openai', expectedCents: 2 },

  // Google — ai.google.dev/pricing (verified 2026-05-04)
  // Gemini 2.5 Flash: $0.30 / $2.50 → (300 + 2000)/1M = $0.0023 = 0.23c → ceil 1c
  { model: 'gemini-2.5-flash', provider: 'gemini', expectedCents: 1 },
  // Gemini 2.5 Pro (≤200K prompt tier): $1.25 / $10.00
  // → (1250 + 8000)/1M = $0.00925 = 0.925c → ceil 1c
  { model: 'gemini-2.5-pro', provider: 'gemini', expectedCents: 1 },
];

describe('estimateCostCents — verified provider rates', () => {
  for (const tc of CASES) {
    it(`returns ${tc.expectedCents}¢ for ${tc.model} at 1000/800 tokens`, () => {
      const cents = estimateCostCents({
        provider: tc.provider,
        model: tc.model,
        inputTokens: INPUT_TOKENS,
        outputTokens: OUTPUT_TOKENS,
      });
      expect(cents).toBe(tc.expectedCents);
    });
  }

  it('returns 0 cents for a call with zero tokens', () => {
    const cents = estimateCostCents({
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      inputTokens: 0,
      outputTokens: 0,
    });
    expect(cents).toBe(0);
  });

  it('floors at 1 cent for any non-zero call', () => {
    // Tiny call on cheapest model still rounds up to 1c
    const cents = estimateCostCents({
      provider: 'openai',
      model: 'gpt-4o-mini',
      inputTokens: 1,
      outputTokens: 1,
    });
    expect(cents).toBe(1);
  });
});
