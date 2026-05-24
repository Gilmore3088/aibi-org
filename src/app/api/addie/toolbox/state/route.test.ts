// Tests for GET /api/addie/toolbox/state — confirms the drawer state-matrix
// inputs (count / cap / isPaid / hasIdentity) are derived correctly.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const identityMock = vi.fn();
const overCapMock = vi.fn();

vi.mock('@/lib/addie/auth/resolveIdentity', () => ({
  resolveAddieIdentity: (req: NextRequest) => identityMock(req),
}));
vi.mock('@/lib/addie/toolbox/items', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/addie/toolbox/items')>(
      '@/lib/addie/toolbox/items',
    );
  return {
    ...actual,
    isOverFreeCap: (k: { user_id: string | null; lead_id: string | null }) => overCapMock(k),
  };
});

import { GET } from './route';

function req(): NextRequest {
  return new Request('http://localhost/api/addie/toolbox/state') as unknown as NextRequest;
}

beforeEach(() => {
  identityMock.mockReset();
  overCapMock.mockReset();
});
afterEach(() => vi.clearAllMocks());

describe('GET /api/addie/toolbox/state', () => {
  it('returns hasIdentity=false when no user or lead', async () => {
    identityMock.mockResolvedValueOnce({ user_id: null, lead_id: null, anon_session_id: null });
    const res = await GET(req());
    const json = await res.json();
    expect(json).toEqual({ count: 0, cap: 4, isPaid: false, hasIdentity: false });
    expect(overCapMock).not.toHaveBeenCalled();
  });

  it('returns count + cap for a free-tier learner', async () => {
    identityMock.mockResolvedValueOnce({ user_id: 'u1', lead_id: null, anon_session_id: null });
    overCapMock.mockResolvedValueOnce({ over: false, count: 2, unlimited: false });
    const res = await GET(req());
    const json = await res.json();
    expect(json).toEqual({ count: 2, cap: 4, isPaid: false, hasIdentity: true });
  });

  it('returns isPaid=true for unlimited (entitlement holder)', async () => {
    identityMock.mockResolvedValueOnce({ user_id: 'u1', lead_id: null, anon_session_id: null });
    overCapMock.mockResolvedValueOnce({ over: false, count: -1, unlimited: true });
    const res = await GET(req());
    const json = await res.json();
    expect(json).toEqual({ count: 0, cap: 4, isPaid: true, hasIdentity: true });
  });

  it('reports cap-reached when count equals the cap', async () => {
    identityMock.mockResolvedValueOnce({ user_id: null, lead_id: 'L1', anon_session_id: 'a1' });
    overCapMock.mockResolvedValueOnce({ over: true, count: 4, unlimited: false });
    const res = await GET(req());
    const json = await res.json();
    expect(json.count).toBe(4);
    expect(json.cap).toBe(4);
    expect(json.isPaid).toBe(false);
  });

  it('returns a graceful 500 with safe defaults on failure', async () => {
    identityMock.mockResolvedValueOnce({ user_id: 'u1', lead_id: null, anon_session_id: null });
    overCapMock.mockRejectedValueOnce(new Error('boom'));
    const res = await GET(req());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.hasIdentity).toBe(true);
    expect(json.cap).toBe(4);
  });
});
