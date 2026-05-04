import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMClient, ChatRequest, ChatResponse, StopReason } from '../types';
import { LLMError } from '../types';

function mapStopReason(raw: string | undefined): StopReason {
  switch (raw) {
    case 'STOP': return 'end_turn';
    case 'MAX_TOKENS': return 'max_tokens';
    case 'SAFETY':
    case 'RECITATION':
      return 'stop_sequence';
    default: return 'end_turn';
  }
}

function toLLMError(err: unknown): LLMError {
  const anyErr = err as { status?: number; message?: string };
  const message = anyErr?.message ?? 'unknown error';
  if (anyErr?.status === 401 || /api key/i.test(message))
    return new LLMError('gemini', 'auth', message, false, err);
  if (anyErr?.status === 429 || /quota/i.test(message))
    return new LLMError('gemini', 'rate-limit', message, true, err);
  if (anyErr?.status === 400)
    return new LLMError('gemini', 'invalid-request', message, false, err);
  if (anyErr?.status && anyErr.status >= 500)
    return new LLMError('gemini', 'server', message, true, err);
  return new LLMError('gemini', 'unknown', message, false, err);
}

export function createGeminiClient(apiKey: string): LLMClient {
  const genAI = new GoogleGenerativeAI(apiKey);

  return {
    name: 'gemini',

    async chat(req: ChatRequest): Promise<ChatResponse> {
      try {
        const model = genAI.getGenerativeModel({
          model: req.model,
          systemInstruction: req.system,
        });

        const contents = req.messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const result = await model.generateContent({
          contents,
          generationConfig: {
            maxOutputTokens: req.maxTokens,
            temperature: req.temperature,
          },
        });

        const response = result.response;
        const text = response.text();
        const finishReason = response.candidates?.[0]?.finishReason;
        const usage = response.usageMetadata;

        return {
          text,
          stopReason: mapStopReason(finishReason),
          usage: {
            inputTokens: usage?.promptTokenCount ?? 0,
            outputTokens: usage?.candidatesTokenCount ?? 0,
          },
          providerRaw: response,
        };
      } catch (err) {
        throw toLLMError(err);
      }
    },

    async *stream(): AsyncIterable<never> {
      // Plan E fills this in.
      throw new LLMError('gemini', 'unknown', 'Gemini streaming not implemented yet (Plan E)', false);
    },
  };
}
