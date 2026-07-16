import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  isSupabaseConfigured: vi.fn(() => false),
  upsertProficiencyResult: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({ getAuthUser: mocks.getAuthUser }));
vi.mock('@/lib/supabase/client', () => ({ isSupabaseConfigured: mocks.isSupabaseConfigured }));
vi.mock('@/lib/supabase/user-profiles', () => ({ upsertProficiencyResult: mocks.upsertProficiencyResult }));
// The wrapper's rate-limit path is unused here (no rateLimit configured); keep IP helper simple.
vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: vi.fn(async () => null),
  getRequestIp: vi.fn(() => '203.0.113.1'),
}));

import { POST } from './route';

function req(body?: unknown): Request {
  return new Request('https://x/api/save-proficiency', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? 'not json' : JSON.stringify(body),
  });
}
const valid = {
  email: 'learner@example.com', pctCorrect: 82, levelId: 'l2',
  levelLabel: 'Proficient', topicScores: [], completedAt: '2026-07-16T00:00:00Z',
};

describe('POST /api/save-proficiency (via defineRoute)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthUser.mockResolvedValue({ id: 'u1', email: 'learner@example.com' });
    mocks.isSupabaseConfigured.mockReturnValue(false);
  });

  it('401 when unauthenticated', async () => {
    mocks.getAuthUser.mockResolvedValue(null);
    const res = await POST(req(valid));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Authentication required.' });
  });

  it('400 on invalid JSON', async () => {
    expect((await POST(req(undefined))).status).toBe(400);
  });

  it('400 on invalid payload', async () => {
    const res = await POST(req({ ...valid, pctCorrect: 900 }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Invalid payload.' });
  });

  it('403 when payload email does not match the session', async () => {
    mocks.getAuthUser.mockResolvedValue({ id: 'u1', email: 'someone-else@example.com' });
    expect((await POST(req(valid))).status).toBe(403);
  });

  it('200 and persists when Supabase configured + email matches', async () => {
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.upsertProficiencyResult.mockResolvedValue(undefined);
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(mocks.upsertProficiencyResult).toHaveBeenCalledWith(
      'learner@example.com', expect.objectContaining({ pctCorrect: 82, levelId: 'l2' }),
    );
  });
});
