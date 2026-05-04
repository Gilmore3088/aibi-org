import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const streamMock = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function (this: { messages: unknown }) {
    this.messages = { stream: streamMock };
  }),
}));

import { createAnthropicClient } from './anthropic';

describe('createAnthropicClient stream()', () => {
  beforeEach(() => {
    streamMock.mockReset();
  });

  it('yields text chunks then a final stop with usage populated from SDK events', async () => {
    const mockStream = (async function* () {
      yield {
        type: 'message_start',
        message: { usage: { input_tokens: 17, output_tokens: 0 } },
      };
      yield {
        type: 'content_block_delta',
        delta: { type: 'text_delta', text: 'hel' },
      };
      yield {
        type: 'content_block_delta',
        delta: { type: 'text_delta', text: 'lo' },
      };
      yield {
        type: 'message_delta',
        delta: { stop_reason: 'end_turn' },
        usage: { output_tokens: 9 },
      };
      yield { type: 'message_stop' };
    })();
    streamMock.mockReturnValueOnce(mockStream);

    const client = createAnthropicClient('test-key');
    const chunks: Array<Record<string, unknown>> = [];
    for await (const chunk of client.stream({
      model: 'claude-3-5-sonnet-latest',
      maxTokens: 100,
      messages: [{ role: 'user', content: 'hi' }],
    })) {
      chunks.push(chunk as unknown as Record<string, unknown>);
    }

    const text = chunks
      .filter((c) => c.type === 'text')
      .map((c) => c.text as string)
      .join('');
    expect(text).toBe('hello');

    const stopChunk = chunks.find((c) => c.type === 'stop') as
      | { type: 'stop'; stopReason: string; usage: { inputTokens: number; outputTokens: number } }
      | undefined;
    expect(stopChunk).toBeTruthy();
    expect(stopChunk?.stopReason).toBe('end_turn');
    expect(stopChunk?.usage).toEqual({ inputTokens: 17, outputTokens: 9 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
