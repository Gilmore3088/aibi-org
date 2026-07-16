import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  profileMaybeSingle: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
  getAuthUser: mocks.getAuthUser,
}));

import { checkProfileWriteAccess } from './profile-write-access';

function client() {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mocks.profileMaybeSingle,
        })),
      })),
    })),
  };
}

describe('checkProfileWriteAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when the profile does not exist', async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await checkProfileWriteAccess(client() as never, 'p-1');
    expect(result).toEqual({ ok: false, status: 404 });
  });

  it('allows the owning signed-in user', async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: { id: 'p-1', user_id: 'user-1' }, error: null });
    mocks.getAuthUser.mockResolvedValue({ id: 'user-1' });
    const result = await checkProfileWriteAccess(client() as never, 'p-1');
    expect(result).toEqual({ ok: true });
  });

  it('rejects a signed-in user writing another user\'s profile', async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: { id: 'p-1', user_id: 'user-1' }, error: null });
    mocks.getAuthUser.mockResolvedValue({ id: 'attacker-2' });
    const result = await checkProfileWriteAccess(client() as never, 'p-1');
    expect(result).toEqual({ ok: false, status: 403 });
  });

  it('preserves the bearer model for logged-out callers', async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: { id: 'p-1', user_id: 'user-1' }, error: null });
    mocks.getAuthUser.mockResolvedValue(null);
    const result = await checkProfileWriteAccess(client() as never, 'p-1');
    expect(result).toEqual({ ok: true });
  });

  it('allows an unlinked profile (no user_id) under the bearer model', async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: { id: 'p-1', user_id: null }, error: null });
    mocks.getAuthUser.mockResolvedValue({ id: 'user-9' });
    const result = await checkProfileWriteAccess(client() as never, 'p-1');
    expect(result).toEqual({ ok: true });
  });
});
