import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const getUserMock = vi.fn();
const revokeMock = vi.fn();
const auditMock = vi.fn();
const isConfiguredMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => isConfiguredMock(),
  createServerClientWithCookies: () => ({
    auth: { getUser: () => getUserMock() },
  }),
}));
vi.mock('next/headers', () => ({ cookies: () => ({}) }));
vi.mock('@/lib/addie/billing/teamRefund', () => ({
  revokeSeatWithRefund: (args: unknown) => revokeMock(args),
}));
vi.mock('@/lib/addie/billing/audit', () => ({
  recordBillingAudit: (args: unknown) => auditMock(args),
}));
vi.mock('@/lib/addie/rateLimit/edge', () => ({
  enforceEdgeRateLimit: vi.fn().mockResolvedValue(null),
}));

import { POST } from './route';

function req(body: unknown): NextRequest {
  return new Request('http://localhost/api/addie/billing/team/seats/revoke', {
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

describe('POST /api/addie/billing/team/seats/revoke', () => {
  it('returns 401 when unauthenticated', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const res = await POST(req({ seat_id: 'seat_1' }));
    expect(res.status).toBe(401);
  });

  it('rejects missing seat_id', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    const res = await POST(req({}));
    expect(res.status).toBe(400);
  });

  it('returns 403 when the caller is not the team admin', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    revokeMock.mockRejectedValueOnce(new Error('forbidden_not_team_admin'));
    const res = await POST(req({ seat_id: 'seat_1' }));
    expect(res.status).toBe(403);
  });

  it('no-ops with SKIP_STRIPE and audits as skipped', async () => {
    process.env.SKIP_STRIPE = 'true';
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    const res = await POST(req({ seat_id: 'seat_1' }));
    expect(res.status).toBe(200);
    expect(revokeMock).not.toHaveBeenCalled();
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'skipped' }),
    );
  });

  it('forwards a successful refund result', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    revokeMock.mockResolvedValueOnce({
      revoked: true,
      refund: {
        refunded: true,
        amount_cents: 14925,
        stripe_refund_id: 're_123',
      },
    });
    const res = await POST(req({ seat_id: 'seat_1' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.refund.refunded).toBe(true);
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'seat_revoked_with_refund' }),
    );
  });
});
