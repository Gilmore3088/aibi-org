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

import { canBuildOrRun, getPaidToolboxAccess, type PaidAccess, type ToolboxTier } from './access';

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
      data: [
        { product: 'foundation', tier: 'full' },
        { product: 'aibi-s', tier: 'full' },
      ],
      error: null,
    });

    const result = await getPaidToolboxAccess();
    expect(result).not.toBeNull();
    expect(result!.userId).toBe('user-1');
    expect(result!.products).toEqual(['foundation', 'aibi-s']);
    expect(result!.tier).toBe('full');
    expect(mockFrom).toHaveBeenCalledWith('entitlements');
  });

  it('also recognizes the legacy aibi-p slug from pre-rename entitlements', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEqActive.mockResolvedValueOnce({
      data: [{ product: 'aibi-p', tier: 'full' }],
      error: null,
    });

    const result = await getPaidToolboxAccess();
    expect(result).not.toBeNull();
    expect(result!.products).toEqual(['aibi-p']);
    expect(result!.tier).toBe('full');
  });

  it('resolves Starter tier for an In-Depth-only entitlement (#219)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEqActive.mockResolvedValueOnce({
      data: [{ product: 'in-depth-assessment', tier: 'starter' }],
      error: null,
    });

    const result = await getPaidToolboxAccess();
    expect(result).not.toBeNull();
    expect(result!.products).toEqual(['in-depth-assessment']);
    expect(result!.tier).toBe('starter');
  });

  it('collapses to Full when a user has BOTH In-Depth and Foundation', async () => {
    // A learner who bought the In-Depth diagnostic FIRST and then enrolled
    // in Foundation should be Full tier — Foundation wins.
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEqActive.mockResolvedValueOnce({
      data: [
        { product: 'in-depth-assessment', tier: 'starter' },
        { product: 'foundation', tier: 'full' },
      ],
      error: null,
    });

    const result = await getPaidToolboxAccess();
    expect(result!.tier).toBe('full');
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
    // Dev bypass is treated as Full tier so the local dev surface keeps
    // working without needing to seed an entitlement row.
    expect(result!.tier).toBe('full');
  });
});

describe('canBuildOrRun (build/run unlocked for all paid tiers — 2026-06-02)', () => {
  // Per the 2026-06-02 operator decision (commit 02aa158a), Build/Run is
  // unlocked for ALL paid buyers — Foundation AND In-Depth Assessment. The
  // only thing that gates is having a paid entitlement at all (non-null
  // access). The starter/full split is retained in the data layer but no
  // longer affects canBuildOrRun.
  function mk(tier: ToolboxTier, products: readonly string[]): PaidAccess {
    return { userId: 'u-1', products, tier };
  }

  it('allows full-tier access', () => {
    expect(canBuildOrRun(mk('full', ['foundation']))).toBe(true);
  });

  it('allows full-tier with the legacy aibi-p slug', () => {
    expect(canBuildOrRun(mk('full', ['aibi-p']))).toBe(true);
  });

  it('allows starter tier (In-Depth Assessment buyers — unlocked 2026-06-02)', () => {
    expect(canBuildOrRun(mk('starter', ['in-depth-assessment']))).toBe(true);
  });

  it('rejects null access (no paid entitlement at all)', () => {
    expect(canBuildOrRun(null)).toBe(false);
  });

  it('allows any non-null paid access regardless of tier value', () => {
    // tier no longer gates build/run; a paid-access record always passes.
    const unknown = {
      userId: 'u-1',
      products: ['toolbox-only'],
      tier: 'enterprise' as unknown as ToolboxTier,
    } as PaidAccess;
    expect(canBuildOrRun(unknown)).toBe(true);
  });
});
