/**
 * Rough cost estimator. Rates are APPROXIMATE per-1k-token blended figures
 * (input+output averaged) as of 2026-05 and intentionally err high; this is
 * meant to drive the daily-budget circuit breaker, not be exact accounting.
 *
 * When provider/model usage data carries separate input/output token counts
 * we'd switch to split rates — for now we only track a single `tokensUsed`
 * scalar (the existing ProviderResult shape).
 */

import type { ProviderName } from '../types';

const PER_1K: Record<string, number> = {
  // Anthropic
  'claude-sonnet-4-5': 0.0075, // blended sonnet ~ $3/M in + $15/M out
  'claude-haiku-4-5': 0.0008, // haiku is much cheaper
  // OpenAI
  'gpt-4o': 0.005,
  'gpt-4o-mini': 0.0003,
  // Google
  'gemini-2.5-pro': 0.005,
  'gemini-2.5-flash': 0.0004,
};

const PROVIDER_FALLBACK: Record<ProviderName, number> = {
  anthropic: 0.005,
  openai: 0.003,
  google: 0.003,
};

export function estimateCostUsd(
  provider: ProviderName,
  model: string | undefined,
  tokensUsed: number,
): number {
  if (!Number.isFinite(tokensUsed) || tokensUsed <= 0) return 0;
  const rate: number = (model ? PER_1K[model] : undefined) ?? PROVIDER_FALLBACK[provider];
  return (tokensUsed / 1000) * rate;
}
