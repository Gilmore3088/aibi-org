import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/sandbox/pii-scanner', () => ({
  scanForPII: vi.fn(() => ({ safe: true })),
}));
vi.mock('@/lib/sandbox/injection-filter', () => ({
  scanForInjection: vi.fn(() => ({ safe: true })),
}));
vi.mock('@/lib/ai-harness/rate-limit', () => ({
  hashIp: vi.fn(() => 'hash-stub'),
  logUsage: vi.fn(async () => {}),
}));
vi.mock('@/lib/playground/public-budget', async (original) => {
  const actual = await original<typeof import('@/lib/playground/public-budget')>();
  return {
    ...actual,
    checkPublicPlaygroundBudget: vi.fn(async () => ({ allowed: true })),
    resolvePublicPlaygroundLimits: vi.fn(() => ({
      perIpPerMinute: 1,
      perIpPerDay: 5,
      dailyCapCents: 200,
    })),
  };
});

const chatMock = vi.fn();
vi.mock('@/lib/ai-harness/client', () => ({
  createLLMClient: vi.fn(() => ({
    chat: chatMock,
    stream: vi.fn(),
  })),
}));

import { createLLMClient } from '@/lib/ai-harness/client';
import { logUsage } from '@/lib/ai-harness/rate-limit';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { scanForInjection } from '@/lib/sandbox/injection-filter';
import { checkPublicPlaygroundBudget } from '@/lib/playground/public-budget';

function request(body: unknown): Request {
  return new Request('http://localhost/api/playground/run', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.10' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  scenarioTitle: 'Procedure Cleanup',
  sampleData: 'Synthetic account-maintenance procedure excerpt.',
  prompt: 'Turn this into a job aid with review notes.',
};

beforeEach(() => {
  chatMock.mockResolvedValue({
    text: 'Draft job aid\n\nReview before use.',
    stopReason: 'end_turn',
    usage: { inputTokens: 20, outputTokens: 10 },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/playground/run', () => {
  it('uses the public low-cost model and logs usage', async () => {
    const response = await POST(request(validBody));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.text).toContain('Draft job aid');
    expect(createLLMClient).toHaveBeenCalledWith('openai');
    expect(logUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        featureId: 'playground-public',
        provider: 'openai',
        model: 'gpt-4o-mini',
        status: 'succeeded',
      }),
    );
  });

  it('runs safety scans before the model call', async () => {
    await POST(request(validBody));

    expect(scanForPII).toHaveBeenCalled();
    expect(scanForInjection).toHaveBeenCalled();
    const piiOrder = vi.mocked(scanForPII).mock.invocationCallOrder[0];
    const chatOrder = chatMock.mock.invocationCallOrder[0];
    expect(piiOrder).toBeLessThan(chatOrder);
  });

  it('blocks PII without calling the model', async () => {
    vi.mocked(scanForPII).mockReturnValueOnce({ safe: false, reason: 'PII found.' });

    const response = await POST(request(validBody));
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.kind).toBe('pii_blocked');
    expect(chatMock).not.toHaveBeenCalled();
  });

  it('returns a retryable limit response when the public budget blocks', async () => {
    vi.mocked(checkPublicPlaygroundBudget).mockResolvedValueOnce({
      allowed: false,
      reason: 'per-ip-per-minute-exceeded',
      retryAfterSeconds: 60,
    });

    const response = await POST(request(validBody));
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('60');
    expect(json.kind).toBe('per-ip-per-minute-exceeded');
    expect(chatMock).not.toHaveBeenCalled();
    expect(logUsage).toHaveBeenCalledWith(expect.objectContaining({ status: 'rate-limited' }));
  });
});
