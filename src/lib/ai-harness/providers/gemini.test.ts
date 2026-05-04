import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateContentMock = vi.fn();
const getGenerativeModelMock = vi.fn<(...args: unknown[]) => unknown>(() => ({ generateContent: generateContentMock }));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function (this: { getGenerativeModel: unknown }) {
    this.getGenerativeModel = getGenerativeModelMock;
  }),
}));

import { createGeminiClient } from './gemini';
import type { StreamChunk } from '../types';

describe('createGeminiClient', () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    getGenerativeModelMock.mockClear();
  });

  it('returns normalized ChatResponse on success', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => 'hello from gemini',
        candidates: [{ finishReason: 'STOP' }],
        usageMetadata: { promptTokenCount: 7, candidatesTokenCount: 4 },
      },
    });
    const client = createGeminiClient('test-key');
    const res = await client.chat({
      model: 'gemini-2.5-flash',
      maxTokens: 1000,
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(res.text).toBe('hello from gemini');
    expect(res.stopReason).toBe('end_turn');
    expect(res.usage.inputTokens).toBe(7);
    expect(res.usage.outputTokens).toBe(4);
  });

  it('passes system prompt as systemInstruction', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: () => 'ok', candidates: [{ finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1 } },
    });
    const client = createGeminiClient('test-key');
    await client.chat({
      model: 'gemini-2.5-pro',
      maxTokens: 100,
      system: 'You are a helpful banker.',
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(getGenerativeModelMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-2.5-pro', systemInstruction: 'You are a helpful banker.' }),
    );
  });

  it('maps assistant role to "model" in contents', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: () => 'ok', candidates: [{ finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1 } },
    });
    const client = createGeminiClient('test-key');
    await client.chat({
      model: 'gemini-2.5-flash',
      maxTokens: 100,
      messages: [
        { role: 'user', content: 'q1' },
        { role: 'assistant', content: 'a1' },
        { role: 'user', content: 'q2' },
      ],
    });
    const arg = generateContentMock.mock.calls[0][0];
    expect(arg.contents[1].role).toBe('model');
    expect(arg.contents[1].parts[0].text).toBe('a1');
  });

  it('maps 401-style errors to LLMError(kind=auth)', async () => {
    generateContentMock.mockRejectedValueOnce(Object.assign(new Error('API key not valid'), { status: 401 }));
    const client = createGeminiClient('test-key');
    await expect(client.chat({ model: 'gemini-2.5-flash', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'auth', provider: 'gemini' });
  });

  it('maps 429-style errors to LLMError(kind=rate-limit, retryable=true)', async () => {
    generateContentMock.mockRejectedValueOnce(Object.assign(new Error('quota exceeded'), { status: 429 }));
    const client = createGeminiClient('test-key');
    await expect(client.chat({ model: 'gemini-2.5-flash', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'rate-limit', retryable: true });
  });

  it('stream() yields text chunks and a final stop with usage', async () => {
    const mockChunks = [
      { text: () => 'hel' },
      { text: () => 'lo' },
    ];
    const mockStream = (async function* () { for (const c of mockChunks) yield c; })();
    const finalResponse = {
      candidates: [{ finishReason: 'STOP' }],
      usageMetadata: { promptTokenCount: 4, candidatesTokenCount: 2 },
    };

    const generateContentStreamMock = vi.fn(() => ({
      stream: mockStream,
      response: Promise.resolve(finalResponse),
    }));
    getGenerativeModelMock.mockReturnValueOnce({ generateContentStream: generateContentStreamMock });

    const client = createGeminiClient('test-key');
    const chunks: StreamChunk[] = [];
    for await (const chunk of client.stream({
      model: 'gemini-2.5-flash',
      maxTokens: 100,
      messages: [{ role: 'user', content: 'hi' }],
    })) {
      chunks.push(chunk);
    }
    const textChunks = chunks.filter((c) => c.type === 'text').map((c) => c.text).join('');
    expect(textChunks).toBe('hello');
    const stopChunk = chunks.find((c) => c.type === 'stop');
    expect(stopChunk).toBeTruthy();
    expect(stopChunk?.usage).toEqual({ inputTokens: 4, outputTokens: 2 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
