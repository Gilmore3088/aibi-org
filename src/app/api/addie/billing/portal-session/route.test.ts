import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const getUserMock = vi.fn();
const createPortalSessionMock = vi.fn();
const recordAuditMock = vi.fn();
const isConfiguredMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => isConfiguredMock(),
  createServerClientWithCookies: () => ({
    auth: { getUser: () => getUserMock() },
  }),
}));
vi.mock('next/headers', () => ({ cookies: () => ({}) }));
vi.mock('@/lib/addie/billing/portal', () => ({
  createPortalSession: (args: unknown) => createPortalSessionMock(args),
}));
vi.mock('@/lib/addie/billing/audit', () => ({
  recordBillingAudit: (args: unknown) => recordAuditMock(args),
}));
vi.mock('@/lib/addie/rateLimit/edge', () => ({
  enforceEdgeRateLimit: vi.fn().mockResolvedValue(null),
}));

import { POST } from './route';

function req(body: unknown = {}): NextRequest {
  return new Request('http://localhost/api/addie/billing/portal-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  isConfiguredMock.mockReturnValue(true);
  delete process.env.SKIP_STRIPE;
});
afterEach(() => {
  delete process.env.SKIP_STRIPE;
});

describe('POST /api/addie/billing/portal-session', () => {
  it('returns 503 when Supabase is unconfigured', async () => {
    isConfiguredMock.mockReturnValue(false);
    const res = await POST(req());
    expect(res.status).toBe(503);
  });

  it('returns 401 when unauthenticated', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it('rejects invalid body (non-url return_url)', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    const res = await POST(req({ return_url: 'not-a-url' }));
    expect(res.status).toBe(400);
  });

  it('no-ops with SKIP_STRIPE and records skipped audit', async () => {
    process.env.SKIP_STRIPE = 'true';
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    const res = await POST(req());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
    expect(recordAuditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'portal_session_opened', status: 'skipped' }),
    );
    expect(createPortalSessionMock).not.toHaveBeenCalled();
  });

  it('returns portal URL when Stripe call succeeds', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    createPortalSessionMock.mockResolvedValueOnce({
      url: 'https://billing.stripe.com/p/session/abc',
      customer_id: 'cus_123',
    });
    const res = await POST(req());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toContain('billing.stripe.com');
    expect(recordAuditMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ok' }),
    );
  });

  it('returns 404 when no Stripe customer exists', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    createPortalSessionMock.mockResolvedValueOnce({ error: 'no_stripe_customer' });
    const res = await POST(req());
    expect(res.status).toBe(404);
  });
});
