/**
 * Google Gemini adapter — generateContent. Server-only.
 *
 * The Google SDK does not currently honor AbortSignal directly; the outer
 * dispatcher's timeout still fires via the AbortController, but the in-flight
 * request will not be cooperatively cancelled. Acceptable for v1.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NormalizedRequest, ProviderResult } from '../types';

export async function callGoogle(
  req: NormalizedRequest,
  apiKey: string,
  signal: AbortSignal,
): Promise<ProviderResult> {
  if (signal.aborted) throw new Error('aborted');

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: req.model,
    systemInstruction: req.system,
    generationConfig: {
      maxOutputTokens: req.maxTokens,
      temperature: req.temperature,
    },
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: req.userContent }] }],
  });

  const outputText = result.response.text();
  const usage = result.response.usageMetadata;
  const tokensUsed = (usage?.promptTokenCount ?? 0) + (usage?.candidatesTokenCount ?? 0);

  return { outputText, tokensUsed };
}
