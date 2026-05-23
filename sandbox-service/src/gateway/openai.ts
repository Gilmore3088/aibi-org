/**
 * OpenAI adapter — Chat Completions API. Server-only.
 */

import OpenAI from 'openai';
import type { NormalizedRequest, ProviderResult } from '../types';

export async function callOpenAI(
  req: NormalizedRequest,
  apiKey: string,
  signal: AbortSignal,
): Promise<ProviderResult> {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create(
    {
      model: req.model,
      max_tokens: req.maxTokens,
      temperature: req.temperature,
      messages: [
        { role: 'system', content: req.system },
        { role: 'user', content: req.userContent },
      ],
    },
    { signal },
  );

  const outputText = response.choices[0]?.message?.content ?? '';
  const tokensUsed = response.usage?.total_tokens ?? 0;
  return { outputText, tokensUsed };
}
