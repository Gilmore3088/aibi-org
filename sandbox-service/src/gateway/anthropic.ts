/**
 * Anthropic adapter — Messages API. Server-only.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { NormalizedRequest, ProviderResult } from '../types';

export async function callAnthropic(
  req: NormalizedRequest,
  apiKey: string,
  signal: AbortSignal,
): Promise<ProviderResult> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create(
    {
      model: req.model,
      system: req.system,
      max_tokens: req.maxTokens,
      temperature: req.temperature,
      messages: [{ role: 'user', content: req.userContent }],
    },
    { signal },
  );

  const outputText = response.content
    .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const tokensUsed =
    (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  return { outputText, tokensUsed };
}
