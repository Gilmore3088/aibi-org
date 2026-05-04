import { OpenAI } from 'openai';
import type { LLMClient, ChatRequest, ChatResponse, StopReason } from '../types';
import { LLMError } from '../types';

function mapStopReason(raw: string | null | undefined): StopReason {
  switch (raw) {
    case 'stop': return 'end_turn';
    case 'length': return 'max_tokens';
    case 'content_filter': return 'stop_sequence';
    case 'tool_calls': return 'tool_use';
    default: return 'end_turn';
  }
}

function toLLMError(err: unknown): LLMError {
  const anyErr = err as { status?: number; message?: string };
  if (anyErr?.status === 401)
    return new LLMError('openai', 'auth', anyErr.message ?? 'auth failed', false, err);
  if (anyErr?.status === 429)
    return new LLMError('openai', 'rate-limit', anyErr.message ?? 'rate limited', true, err);
  if (anyErr?.status === 400)
    return new LLMError('openai', 'invalid-request', anyErr.message ?? 'bad request', false, err);
  if (anyErr?.status && anyErr.status >= 500)
    return new LLMError('openai', 'server', anyErr.message ?? 'server error', true, err);
  return new LLMError('openai', 'unknown', anyErr?.message ?? 'unknown error', false, err);
}

export function createOpenAIClient(apiKey: string): LLMClient {
  const client = new OpenAI({ apiKey });

  return {
    name: 'openai',

    async chat(req: ChatRequest): Promise<ChatResponse> {
      try {
        const messages = req.system
          ? [{ role: 'system' as const, content: req.system }, ...req.messages.map((m) => ({ role: m.role, content: m.content }))]
          : req.messages.map((m) => ({ role: m.role, content: m.content }));

        const resp = await client.chat.completions.create({
          model: req.model,
          messages,
          max_tokens: req.maxTokens,
          temperature: req.temperature,
        });

        const choice = resp.choices[0];
        const text = choice?.message?.content ?? '';
        return {
          text,
          stopReason: mapStopReason(choice?.finish_reason),
          usage: {
            inputTokens: resp.usage?.prompt_tokens ?? 0,
            outputTokens: resp.usage?.completion_tokens ?? 0,
          },
          providerRaw: resp,
        };
      } catch (err) {
        throw toLLMError(err);
      }
    },

    async *stream(): AsyncIterable<never> {
      // Plan E fills this in.
      throw new LLMError('openai', 'unknown', 'OpenAI streaming not implemented yet (Plan E)', false);
    },
  };
}
