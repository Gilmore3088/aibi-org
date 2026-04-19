// Model pricing (USD per 1M tokens). Updated manually when providers change prices.
// Source: Anthropic pricing page, OpenAI pricing page, Google pricing page.

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
  'claude-haiku-4-5-20251001':    { inputPerM: 0.80, outputPerM: 4  },
  // OpenAI + Gemini placeholders — update when adapters are implemented
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
