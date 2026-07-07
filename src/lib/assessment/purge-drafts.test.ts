import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendAssessmentResumeLink: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

import { purgeExpiredAssessmentDrafts } from './abandoned-drafts';

function deleteClient(result: { data: unknown; error: unknown }) {
  const select = vi.fn().mockResolvedValue(result);
  const lt = vi.fn(() => ({ select }));
  const del = vi.fn(() => ({ lt }));
  const client = { from: vi.fn(() => ({ delete: del })) };
  return { client, from: client.from, del, lt, select };
}

describe('purgeExpiredAssessmentDrafts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
  });

  it('skips cleanly when Supabase is not configured', async () => {
    mocks.isSupabaseConfigured.mockReturnValue(false);
    const result = await purgeExpiredAssessmentDrafts(new Date('2026-07-07T00:00:00Z'));
    expect(result).toEqual({ status: 'skipped', skipped: 'supabase-not-configured', deleted: 0 });
  });

  it('deletes rows whose expires_at is before now and reports the count', async () => {
    const now = new Date('2026-07-07T00:00:00.000Z');
    const { client, from, lt, select } = deleteClient({
      data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      error: null,
    });

    const result = await purgeExpiredAssessmentDrafts(now, client as never);

    expect(from).toHaveBeenCalledWith('assessment_drafts');
    expect(lt).toHaveBeenCalledWith('expires_at', now.toISOString());
    expect(select).toHaveBeenCalledWith('id');
    expect(result).toEqual({ status: 'ok', deleted: 3 });
  });

  it('throws with context when the delete errors', async () => {
    const { client } = deleteClient({ data: null, error: { message: 'boom' } });
    await expect(
      purgeExpiredAssessmentDrafts(new Date('2026-07-07T00:00:00Z'), client as never),
    ).rejects.toThrow(/purgeExpiredAssessmentDrafts failed: boom/);
  });
});
