import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  getPaidToolboxAccess: vi.fn(),
  canBuildOrRun: vi.fn(),
  rateLimitOrFail: vi.fn(),
  isAllowedModel: vi.fn(),
  scanForPII: vi.fn(),
  scanForInjection: vi.fn(),
  stream: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
  getAuthUser: mocks.getAuthUser,
}));

vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: mocks.getPaidToolboxAccess,
  canBuildOrRun: mocks.canBuildOrRun,
}));

vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
}));

vi.mock('@/lib/toolbox/playground-models', () => ({
  isAllowedModel: mocks.isAllowedModel,
}));

vi.mock('@/lib/sandbox/pii-scanner', () => ({
  scanForPII: mocks.scanForPII,
}));

vi.mock('@/lib/sandbox/injection-filter', () => ({
  scanForInjection: mocks.scanForInjection,
}));

vi.mock('@/lib/ai-harness/client', () => ({
  createLLMClient: vi.fn(() => ({
    name: 'openai',
    chat: vi.fn(),
    stream: mocks.stream,
  })),
}));

import { POST } from './route';

const paidAccess = {
  userId: 'paid-user-123',
  products: ['foundation'],
  source: 'entitlement',
};

const validBody = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Draft a short branch policy update.' }],
  moduleId: 'module-1',
  product: 'foundation',
  systemPrompt: 'You help banking learners practice safely.',
};

function request(body: unknown = validBody): Request {
  return new Request('http://localhost/api/sandbox/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
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

describe('POST /api/sandbox/chat', () => {
  beforeEach(() => {
    mocks.getAuthUser.mockResolvedValue({ id: 'auth-user-123' });
    mocks.getPaidToolboxAccess.mockResolvedValue(paidAccess);
    mocks.canBuildOrRun.mockReturnValue(true);
    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.isAllowedModel.mockReturnValue(true);
    mocks.scanForPII.mockReturnValue({ safe: true });
    mocks.scanForInjection.mockReturnValue({ safe: true });
    mocks.stream.mockImplementation(async function* () {
      yield { type: 'text', text: 'Safe ' };
      yield { type: 'text', text: 'draft.' };
      yield { type: 'stop', stopReason: 'end_turn' };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests before checking entitlement', async () => {
    mocks.getAuthUser.mockResolvedValueOnce(null);

    const response = await POST(request());
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Authentication required.');
    expect(mocks.getPaidToolboxAccess).not.toHaveBeenCalled();
    expect(mocks.rateLimitOrFail).not.toHaveBeenCalled();
  });

  it('rejects authenticated users without paid sandbox access before rate limiting', async () => {
    mocks.getPaidToolboxAccess.mockResolvedValueOnce(null);

    const response = await POST(request());
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Paid sandbox access required.');
    expect(mocks.canBuildOrRun).not.toHaveBeenCalled();
    expect(mocks.rateLimitOrFail).not.toHaveBeenCalled();
  });

  it('rejects authenticated users whose paid access cannot run the sandbox', async () => {
    mocks.canBuildOrRun.mockReturnValueOnce(false);

    const response = await POST(request());
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Paid sandbox access required.');
    expect(mocks.rateLimitOrFail).not.toHaveBeenCalled();
  });

  it('uses the paid-access user id for the sandbox rate limit', async () => {
    const response = await POST(request());
    await readAll(response.body!);

    expect(response.status).toBe(200);
    expect(mocks.rateLimitOrFail).toHaveBeenCalledWith({
      key: 'sandbox-chat',
      scope: 'user',
      identifier: 'paid-user-123',
      max: 50,
      windowSeconds: 3600,
    });
  });

  it('streams model output for paid users after safety validation', async () => {
    const response = await POST(request());
    const text = await readAll(response.body!);

    expect(response.status).toBe(200);
    expect(text).toBe('Safe draft.');
    expect(mocks.scanForPII).toHaveBeenCalled();
    expect(mocks.scanForInjection).toHaveBeenCalled();
    expect(mocks.stream).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gpt-4o-mini',
      maxTokens: 900,
      temperature: 0.2,
    }));
  });
});
