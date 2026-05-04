import type { ProviderName } from '@/lib/ai-harness/types';

export interface PlaygroundModel {
  readonly id: string;            // sent to the provider SDK exactly as written
  readonly provider: ProviderName;
  readonly displayName: string;   // shown in the picker
  readonly description: string;   // one-line guidance shown next to the picker
}

// v1 menu locked by spec §5.3. Adding a model is a deliberate, sourced
// change — update this list, update src/lib/ai-harness/pricing.ts, and
// update docs/compliance/llm-data-handling.md if the provider stance
// shifts. Opus is intentionally absent (cost).
export const PLAYGROUND_MODELS: readonly PlaygroundModel[] = [
  {
    id: 'claude-haiku-4-5-20251001',
    provider: 'anthropic',
    displayName: 'Claude Haiku 4.5',
    description: 'Fast, low-cost. Good for quick drafts and short prompts.',
  },
  {
    id: 'claude-sonnet-4-6',
    provider: 'anthropic',
    displayName: 'Claude Sonnet 4.6',
    description: 'Balanced quality. Default for analytical work.',
  },
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o mini',
    description: 'OpenAI low-cost tier. Compare with Claude Haiku.',
  },
  {
    id: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    description: 'OpenAI mid tier. Compare with Claude Sonnet.',
  },
  {
    id: 'gemini-2.5-flash',
    provider: 'gemini',
    displayName: 'Gemini 2.5 Flash',
    description: 'Google low-cost tier. Compare with Haiku and 4o-mini.',
  },
  {
    id: 'gemini-2.5-pro',
    provider: 'gemini',
    displayName: 'Gemini 2.5 Pro',
    description: 'Google mid tier. Compare with Sonnet and 4o.',
  },
];

export function isAllowedModel(provider: string, model: string): boolean {
  return PLAYGROUND_MODELS.some((m) => m.provider === provider && m.id === model);
}
