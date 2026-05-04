// Model pricing (USD per 1M tokens). Updated manually when providers change prices.
//
// Last verified: 2026-05-04
//   - Anthropic: https://docs.anthropic.com/en/docs/about-claude/pricing
//   - OpenAI:    https://platform.openai.com/docs/pricing
//   - Google:    https://ai.google.dev/pricing
//
// Notes:
//   - Gemini 2.5 Pro has tiered pricing by prompt size. We use the standard
//     ≤200K-prompt tier ($1.25 input / $10.00 output). Calls with prompts
//     above 200K tokens will be under-billed by this estimator.
//   - Pricing is locked by `pricing.test.ts` with hand-computed cents-per-call
//     expectations. Edit both files together when a provider changes rates.
//
// Pricing deltas vs. Plan D's proposed rates (resolved 2026-05-04):
//   - Claude Haiku 4.5 was proposed at $0.80 / $4 (those are Haiku 3.5 rates).
//     Anthropic's pricing page lists Haiku 4.5 at $1 / $5; corrected here.

import type { ProviderName } from './types';

interface ModelPrice {
  readonly inputPerM: number;   // USD per 1M input tokens
  readonly outputPerM: number;  // USD per 1M output tokens
}

// Suppress unused-variable warning — ProviderName is imported for future adapter use.
type _ProviderName = ProviderName;

const PRICING: Record<string, ModelPrice> = {
  // Anthropic
  'claude-opus-4-6':              { inputPerM: 15,   outputPerM: 75 },
  'claude-sonnet-4-6':            { inputPerM: 3,    outputPerM: 15 },
  'claude-haiku-4-5-20251001':    { inputPerM: 1,    outputPerM: 5  },

  // OpenAI
  'gpt-4o':                       { inputPerM: 2.5,  outputPerM: 10 },
  'gpt-4o-mini':                  { inputPerM: 0.15, outputPerM: 0.6 },

  // Google (Gemini 2.5 Pro tier: prompts ≤ 200K tokens)
  'gemini-2.5-flash':             { inputPerM: 0.3,  outputPerM: 2.5 },
  'gemini-2.5-pro':               { inputPerM: 1.25, outputPerM: 10 },
};

const FALLBACK_PRICE: ModelPrice = { inputPerM: 15, outputPerM: 75 };

/**
 * Estimate cost in USD cents for a given call.
 * Returns an integer — rounds up to be conservative on budget enforcement.
 * Unknown models fall back to Opus-tier pricing.
 */
export function estimateCostCents(params: {
  readonly provider: ProviderName;
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
}): number {
  const price = PRICING[params.model] ?? FALLBACK_PRICE;
  const costUsd =
    (params.inputTokens * price.inputPerM + params.outputTokens * price.outputPerM) /
    1_000_000;
  // ceil to nearest cent; minimum 1 cent for any non-zero call
  const cents = Math.ceil(costUsd * 100);
  return params.inputTokens > 0 || params.outputTokens > 0 ? Math.max(cents, 1) : 0;
}
