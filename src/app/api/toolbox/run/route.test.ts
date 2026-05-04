import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

// Mocks
vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'user-test' })),
}));
vi.mock('@/lib/sandbox/pii-scanner', () => ({
  scanForPII: vi.fn(() => ({ safe: true })),
}));
vi.mock('@/lib/sandbox/injection-filter', () => ({
  scanForInjection: vi.fn(() => ({ safe: true })),
}));
vi.mock('@/lib/ai-harness/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  logUsage: vi.fn(async () => {}),
}));

const chatMock = vi.fn();
vi.mock('@/lib/ai-harness/client', () => ({
  createLLMClient: vi.fn((provider: string) => ({
    name: provider,
    chat: chatMock,
    stream: vi.fn(),
  })),
}));

import { createLLMClient } from '@/lib/ai-harness/client';
import { logUsage } from '@/lib/ai-harness/rate-limit';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { scanForInjection } from '@/lib/sandbox/injection-filter';

const minimalSkill = { kind: 'workflow', cmd: '/x', name: 'x' };
const messages = [{ role: 'user', content: 'hello' }];

function reqBody(body: unknown): Request {
  return new Request('http://localhost/api/toolbox/run', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  chatMock.mockResolvedValue({
    text: 'hi',
    stopReason: 'end_turn',
    usage: { inputTokens: 10, outputTokens: 5 },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/toolbox/run dispatcher', () => {
  it('rejects when provider is missing', async () => {
    const res = await POST(reqBody({ skill: minimalSkill, messages, model: 'claude-sonnet-4-6' }));
    expect(res.status).toBe(400);
  });

  it('rejects an unknown provider', async () => {
    const res = await POST(reqBody({ skill: minimalSkill, messages, provider: 'mistral', model: 'foo' }));
    expect(res.status).toBe(400);
  });

  it('rejects a model not on the v1 menu', async () => {
    const res = await POST(reqBody({ skill: minimalSkill, messages, provider: 'anthropic', model: 'claude-opus-4-6' }));
    expect(res.status).toBe(400);
  });

  it('rejects a mismatched provider/model pair', async () => {
    const res = await POST(reqBody({ skill: minimalSkill, messages, provider: 'anthropic', model: 'gpt-4o' }));
    expect(res.status).toBe(400);
  });

  it('runs PII and injection scans BEFORE the LLM call', async () => {
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'openai', model: 'gpt-4o-mini' }));
    expect(scanForPII).toHaveBeenCalled();
    expect(scanForInjection).toHaveBeenCalled();
    // Both scanners must have been called before chatMock
    expect(chatMock).toHaveBeenCalled();
    const piiCallOrder = (scanForPII as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const chatCallOrder = chatMock.mock.invocationCallOrder[0];
    expect(piiCallOrder).toBeLessThan(chatCallOrder);
  });

  it('dispatches to OpenAI when provider=openai', async () => {
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'openai', model: 'gpt-4o-mini' }));
    expect(createLLMClient).toHaveBeenCalledWith('openai');
  });

  it('dispatches to Gemini when provider=gemini', async () => {
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'gemini', model: 'gemini-2.5-flash' }));
    expect(createLLMClient).toHaveBeenCalledWith('gemini');
  });

  it('logs the chosen provider and model on success', async () => {
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'openai', model: 'gpt-4o' }));
    expect(logUsage).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'openai', model: 'gpt-4o', status: 'succeeded' }),
    );
  });

  it('logs the chosen provider and model on error', async () => {
    chatMock.mockRejectedValueOnce(new Error('boom'));
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'gemini', model: 'gemini-2.5-pro' }));
    expect(logUsage).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'gemini', model: 'gemini-2.5-pro', status: 'errored' }),
    );
  });
});
