import Anthropic from '@anthropic-ai/sdk';
import type { LLMClient, ChatRequest, ChatResponse, StreamChunk, StopReason } from '../types';
import { LLMError } from '../types';

function mapStopReason(raw: string | null | undefined): StopReason {
  switch (raw) {
    case 'end_turn': return 'end_turn';
    case 'max_tokens': return 'max_tokens';
    case 'stop_sequence': return 'stop_sequence';
    case 'tool_use': return 'tool_use';
    default: return 'end_turn';
  }
}

function toLLMError(err: unknown): LLMError {
  const anyErr = err as { status?: number; message?: string };
  if (anyErr?.status === 401)
    return new LLMError('anthropic', 'auth', anyErr.message ?? 'auth failed', false, err);
  if (anyErr?.status === 429)
    return new LLMError('anthropic', 'rate-limit', anyErr.message ?? 'rate limited', true, err);
  if (anyErr?.status === 400)
    return new LLMError('anthropic', 'invalid-request', anyErr.message ?? 'bad request', false, err);
  if (anyErr?.status && anyErr.status >= 500)
    return new LLMError('anthropic', 'server', anyErr.message ?? 'server error', true, err);
  return new LLMError('anthropic', 'unknown', anyErr?.message ?? 'unknown error', false, err);
}

export function createAnthropicClient(apiKey: string): LLMClient {
  const anthropic = new Anthropic({ apiKey });

  return {
    name: 'anthropic',

    async chat(req: ChatRequest): Promise<ChatResponse> {
      try {
        const resp = await anthropic.messages.create({
          model: req.model,
          max_tokens: req.maxTokens,
          system: req.system,
          temperature: req.temperature,
          messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        });
        const textBlock = resp.content.find((b) => b.type === 'text');
        const text = textBlock && textBlock.type === 'text' ? textBlock.text : '';
        return {
          text,
          stopReason: mapStopReason(resp.stop_reason),
          usage: {
            inputTokens: resp.usage.input_tokens,
            outputTokens: resp.usage.output_tokens,
          },
          providerRaw: resp,
        };
      } catch (err) {
        throw toLLMError(err);
      }
    },

    async *stream(req: ChatRequest): AsyncIterable<StreamChunk> {
      try {
        const stream = anthropic.messages.stream({
          model: req.model,
          max_tokens: req.maxTokens,
          system: req.system,
          temperature: req.temperature,
          messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        });
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield { type: 'text', text: event.delta.text };
          } else if (event.type === 'message_delta' && event.delta.stop_reason) {
            yield { type: 'stop', stopReason: mapStopReason(event.delta.stop_reason) };
          }
        }
      } catch (err) {
        yield { type: 'error', error: toLLMError(err) };
      }
    },
  };
}
