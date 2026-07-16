import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rateLimitOrFail: vi.fn(),
  getRequestIp: vi.fn(() => '203.0.113.1'),
  getAuthUser: vi.fn(),
}));

vi.mock('./rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
  getRequestIp: mocks.getRequestIp,
}));
vi.mock('./auth', () => ({ getAuthUser: mocks.getAuthUser }));

import { defineRoute } from './handler';

function req(body?: unknown): Request {
  return new Request('https://x/api/thing', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

interface Payload { name: string }
const isPayload = (b: unknown): b is Payload =>
  typeof b === 'object' && b !== null && typeof (b as Payload).name === 'string';

describe('defineRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.getAuthUser.mockResolvedValue(null);
  });

  it('passes a validated body + ip to the handler', async () => {
    const route = defineRoute({ validate: isPayload }, async ({ body, ip }) =>
      Response.json({ got: body.name, ip }),
    );
    const res = await route(req({ name: 'Ada' }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ got: 'Ada', ip: '203.0.113.1' });
  });

  it('returns 400 on invalid JSON and on failed validation', async () => {
    const route = defineRoute({ validate: isPayload }, async () => Response.json({ ok: true }));
    expect((await route(new Request('https://x', { method: 'POST', body: 'not json' }))).status).toBe(400);
    expect((await route(req({ nope: 1 }))).status).toBe(400);
  });

  it('returns 401 when requireAuth and no session', async () => {
    const route = defineRoute({ requireAuth: true }, async () => Response.json({ ok: true }));
    expect((await route(req())).status).toBe(401);
    mocks.getAuthUser.mockResolvedValue({ id: 'u1' });
    expect((await route(req())).status).toBe(200);
  });

  it('short-circuits with the rate-limit response', async () => {
    const { NextResponse } = await import('next/server');
    mocks.rateLimitOrFail.mockResolvedValue(NextResponse.json({ error: 'rate' }, { status: 429 }));
    const handler = vi.fn(async () => Response.json({ ok: true }));
    const route = defineRoute({ rateLimit: { key: 'k', max: 1, windowSeconds: 60 } }, handler);
    expect((await route(req())).status).toBe(429);
    expect(handler).not.toHaveBeenCalled();
  });

  it('uses the user id as identifier for user-scoped rate limits', async () => {
    mocks.getAuthUser.mockResolvedValue({ id: 'user-42' });
    const route = defineRoute(
      { requireAuth: true, rateLimit: { key: 'k', scope: 'user', max: 5, windowSeconds: 60 } },
      async () => Response.json({ ok: true }),
    );
    await route(req());
    expect(mocks.rateLimitOrFail).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'user', identifier: 'user-42' }),
    );
  });
});
