/**
 * Provider gateway. Dispatches a NormalizedRequest to a vendor adapter,
 * enforcing timeout and one-shot failover across the configured priority.
 */

import { getConfig } from '../config';
import type { NormalizedRequest, ProviderName, ProviderResult } from '../types';
import { callAnthropic } from './anthropic';
import { callOpenAI } from './openai';
import { callGoogle } from './google';

export interface ProviderAdapter {
  (req: NormalizedRequest, apiKey: string, signal: AbortSignal): Promise<ProviderResult>;
}

const ADAPTERS: Record<ProviderName, ProviderAdapter> = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  google: callGoogle,
};

export interface DispatchInput {
  request: Omit<NormalizedRequest, 'model'>;
  preferredProvider: ProviderName;
  /** When true, use the cheaper anonModel for unauthenticated traffic. */
  useAnonModel: boolean;
}

export interface DispatchResult extends ProviderResult {
  provider: ProviderName;
}

export class AllProvidersFailedError extends Error {
  readonly attempts: Array<{ provider: ProviderName; error: string }>;
  constructor(attempts: Array<{ provider: ProviderName; error: string }>) {
    super(`All providers failed: ${attempts.map((a) => `${a.provider}=${a.error}`).join('; ')}`);
    this.attempts = attempts;
    this.name = 'AllProvidersFailedError';
  }
}

function buildPriorityOrder(preferred: ProviderName): ProviderName[] {
  const cfg = getConfig();
  return [preferred, ...cfg.providerPriority.filter((p) => p !== preferred)];
}

export async function dispatch(input: DispatchInput): Promise<DispatchResult> {
  const cfg = getConfig();
  const order = buildPriorityOrder(input.preferredProvider);
  const attempts: Array<{ provider: ProviderName; error: string }> = [];

  for (const provider of order) {
    const providerCfg = cfg.providers[provider];
    if (!providerCfg.apiKey) {
      attempts.push({ provider, error: 'no_api_key' });
      continue;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.requestTimeoutMs);
    try {
      const adapter = ADAPTERS[provider];
      const result = await adapter(
        {
          ...input.request,
          model: input.useAnonModel ? providerCfg.anonModel : providerCfg.defaultModel,
        },
        providerCfg.apiKey,
        controller.signal,
      );
      return { ...result, provider };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      attempts.push({ provider, error: message });
      // try next provider
    } finally {
      clearTimeout(timer);
    }
  }

  throw new AllProvidersFailedError(attempts);
}
