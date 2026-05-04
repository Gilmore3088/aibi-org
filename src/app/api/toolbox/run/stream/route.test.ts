import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'u1' })),
}));
vi.mock('@/lib/sandbox/pii-scanner', () => ({ scanForPII: vi.fn(() => ({ safe: true })) }));
vi.mock('@/lib/sandbox/injection-filter', () => ({ scanForInjection: vi.fn(() => ({ safe: true })) }));
vi.mock('@/lib/ai-harness/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  logUsage: vi.fn(async () => {}),
}));

const streamMock = vi.fn();
vi.mock('@/lib/ai-harness/client', () => ({
  createLLMClient: vi.fn(() => ({ name: 'openai', chat: vi.fn(), stream: streamMock })),
}));

import { logUsage } from '@/lib/ai-harness/rate-limit';

beforeEach(() => {
  streamMock.mockImplementation(async function* () {
    yield { type: 'text', text: 'hi' };
    yield { type: 'text', text: ' world' };
    yield { type: 'stop', stopReason: 'end_turn', usage: { inputTokens: 3, outputTokens: 2 } };
  });
});
afterEach(() => vi.clearAllMocks());

const body = {
  skill: { kind: 'workflow', cmd: '/x', name: 'x' },
  messages: [{ role: 'user', content: 'hi' }],
  provider: 'openai',
  model: 'gpt-4o-mini',
};

function req(b: unknown): Request {
  return new Request('http://localhost/api/toolbox/run/stream', {
    method: 'POST',
    body: JSON.stringify(b),
    headers: { 'content-type': 'application/json' },
  });
}

async function readAll(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    out += decoder.decode(value);
  }
  return out;
}

describe('POST /api/toolbox/run/stream', () => {
  it('streams NDJSON chunks then a done line', async () => {
    const res = await POST(req(body));
    expect(res.headers.get('content-type')).toMatch(/x-ndjson|application\/json/);
    const text = await readAll(res.body!);
    const lines = text.trim().split('\n').map((l) => JSON.parse(l));
    expect(lines.filter((l) => l.type === 'text').map((l) => l.text).join('')).toBe('hi world');
    expect(lines.find((l) => l.type === 'done')).toBeTruthy();
  });

  it('logs usage on stream completion, not before', async () => {
    let resolveLog: () => void = () => {};
    const logged = new Promise<void>((r) => { resolveLog = r; });
    (logUsage as ReturnType<typeof vi.fn>).mockImplementationOnce(async () => { resolveLog(); });

    const res = await POST(req(body));
    await readAll(res.body!);
    await logged;
    expect(logUsage).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'openai', model: 'gpt-4o-mini', status: 'succeeded', inputTokens: 3, outputTokens: 2 }),
    );
  });

  it('rejects unknown provider with 400 (no stream body)', async () => {
    const res = await POST(req({ ...body, provider: 'mistral' }));
    expect(res.status).toBe(400);
  });
});
