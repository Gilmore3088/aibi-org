import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const getUserMock = vi.fn();
const cancelMock = vi.fn();
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
  cancelTeam: (args: unknown) => cancelMock(args),
}));
vi.mock('@/lib/addie/billing/audit', () => ({
  recordBillingAudit: (args: unknown) => auditMock(args),
}));
vi.mock('@/lib/addie/rateLimit/edge', () => ({
  enforceEdgeRateLimit: vi.fn().mockResolvedValue(null),
}));

import { POST } from './route';

function req(body: unknown): NextRequest {
  return new Request('http://localhost/api/addie/billing/team/cancel', {
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

describe('POST /api/addie/billing/team/cancel', () => {
  it('returns 401 when unauthenticated', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const res = await POST(req({ team_id: 't1', confirm: true }));
    expect(res.status).toBe(401);
  });

  it('rejects body without confirm:true', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    const res = await POST(req({ team_id: 't1' }));
    expect(res.status).toBe(400);
  });

  it('rejects missing team_id', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    const res = await POST(req({ confirm: true }));
    expect(res.status).toBe(400);
  });

  it('returns 403 when not the team admin', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    cancelMock.mockRejectedValueOnce(new Error('forbidden_not_team_admin'));
    const res = await POST(req({ team_id: 't1', confirm: true }));
    expect(res.status).toBe(403);
  });

  it('no-ops with SKIP_STRIPE', async () => {
    process.env.SKIP_STRIPE = 'true';
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    const res = await POST(req({ team_id: 't1', confirm: true }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
    expect(cancelMock).not.toHaveBeenCalled();
  });

  it('returns the cancel result', async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    cancelMock.mockResolvedValueOnce({
      cancelled: true,
      seats_revoked: 7,
      refund: { refunded: true, amount_cents: 119400, stripe_refund_id: 're_x' },
      notified_emails: ['a@b.com', 'c@d.com'],
    });
    const res = await POST(req({ team_id: 't1', confirm: true }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.seats_revoked).toBe(7);
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'team_cancelled', status: 'ok' }),
    );
  });
});
