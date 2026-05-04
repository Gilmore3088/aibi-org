import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(function (this: { chat: unknown }) {
    this.chat = { completions: { create: createMock } };
  }),
}));

import { createOpenAIClient } from './openai';
import { LLMError } from '../types';

describe('createOpenAIClient', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns normalized ChatResponse on success', async () => {
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: 'hello world' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 12, completion_tokens: 8 },
    });
    const client = createOpenAIClient('test-key');
    const res = await client.chat({
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(res.text).toBe('hello world');
    expect(res.stopReason).toBe('end_turn');
    expect(res.usage.inputTokens).toBe(12);
    expect(res.usage.outputTokens).toBe(8);
  });

  it('prepends system as a system message when provided', async () => {
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    });
    const client = createOpenAIClient('test-key');
    await client.chat({
      model: 'gpt-4o-mini',
      maxTokens: 100,
      system: 'You are a helpful banker.',
      messages: [{ role: 'user', content: 'hi' }],
    });
    const callArg = createMock.mock.calls[0][0];
    expect(callArg.messages[0]).toEqual({ role: 'system', content: 'You are a helpful banker.' });
    expect(callArg.messages[1]).toEqual({ role: 'user', content: 'hi' });
  });

  it('maps 401 to LLMError(kind=auth)', async () => {
    createMock.mockRejectedValueOnce({ status: 401, message: 'bad key' });
    const client = createOpenAIClient('test-key');
    await expect(client.chat({ model: 'gpt-4o', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'auth', provider: 'openai' });
  });

  it('maps 429 to LLMError(kind=rate-limit, retryable=true)', async () => {
    createMock.mockRejectedValueOnce({ status: 429, message: 'too many' });
    const client = createOpenAIClient('test-key');
    await expect(client.chat({ model: 'gpt-4o', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'rate-limit', retryable: true });
  });

  it('maps 5xx to LLMError(kind=server, retryable=true)', async () => {
    createMock.mockRejectedValueOnce({ status: 503, message: 'bad gateway' });
    const client = createOpenAIClient('test-key');
    await expect(client.chat({ model: 'gpt-4o', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'server', retryable: true });
  });

  it('stream() still throws (Plan E)', async () => {
    const client = createOpenAIClient('test-key');
    const it = client.stream({ model: 'gpt-4o', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] });
    await expect((async () => { for await (const _ of it) { /* drain */ } })()).rejects.toBeInstanceOf(LLMError);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
