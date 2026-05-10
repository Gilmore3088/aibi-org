// src/lib/toolbox/access.test.ts
//
// The Plan A0 refactor preserves the public signature of getPaidToolboxAccess
// but changes the internal read path from course_enrollments -> entitlements.
// These tests pin the new behavior.

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockEqActive = vi.fn();
const mockEqUserId = vi.fn(() => ({ eq: mockEqActive }));
const mockSelect = vi.fn(() => ({ eq: mockEqUserId }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));
vi.mock('next/headers', () => ({
  cookies: () => ({ getAll: () => [], setAll: () => {} }),
}));
vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => true,
}));

import { getPaidToolboxAccess } from './access';

describe('getPaidToolboxAccess (reads from entitlements)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon';
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.SKIP_ENROLLMENT_GATE;
  });

  it('returns null when no user is signed in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    expect(await getPaidToolboxAccess()).toBeNull();
  });

  it('returns access and queries the entitlements table', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEqActive.mockResolvedValueOnce({
      data: [{ product: 'foundations' }, { product: 'aibi-s' }],
      error: null,
    });

    const result = await getPaidToolboxAccess();
    expect(result).not.toBeNull();
    expect(result!.userId).toBe('user-1');
    expect(result!.products).toEqual(['foundations', 'aibi-s']);
    expect(mockFrom).toHaveBeenCalledWith('entitlements');
  });

  it('returns null when there are no active entitlements', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEqActive.mockResolvedValueOnce({ data: [], error: null });
    expect(await getPaidToolboxAccess()).toBeNull();
  });

  it('returns null and fails closed on query error', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEqActive.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    expect(await getPaidToolboxAccess()).toBeNull();
  });

  it('honors SKIP_ENROLLMENT_GATE in non-production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    process.env.SKIP_ENROLLMENT_GATE = 'true';
    const result = await getPaidToolboxAccess();
    expect(result).not.toBeNull();
    expect(result!.userId).toBe('dev-bypass');
  });
});
