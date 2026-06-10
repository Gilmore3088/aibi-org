// Proves the documented 30/IP/hr cap on /api/capture-email is wired.
// The production code path checks email_capture_log row count for the
// previous hour and 429s once the cap is hit; this test exercises the
// allowed → blocked transition.

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const fromMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

import { checkEmailCaptureLimit } from './rate-limit';

beforeEach(() => {
  fromMock.mockReset();
  // The limiter short-circuits to allow in non-production so local dev
  // never gets blocked. Force production to exercise the real path.
  vi.stubEnv('NODE_ENV', 'production');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function mockCount(count: number) {
  fromMock.mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn(async () => ({ count, error: null })),
  }));
}

describe('checkEmailCaptureLimit', () => {
  it('allows when count is below the per-IP-per-hour cap', async () => {
    mockCount(29);
    const decision = await checkEmailCaptureLimit('hash', { perIpPerHour: 30 });
    expect(decision.allowed).toBe(true);
  });

  it('blocks the 31st request once the cap is hit', async () => {
    mockCount(30);
    const decision = await checkEmailCaptureLimit('hash', { perIpPerHour: 30 });
    expect(decision.allowed).toBe(false);
    expect(decision.retryAfterSeconds).toBe(3600);
  });

  it('continues to block while over the cap', async () => {
    mockCount(99);
    const decision = await checkEmailCaptureLimit('hash', { perIpPerHour: 30 });
    expect(decision.allowed).toBe(false);
  });

  it('fails open on a transient Supabase error so legitimate signups are not blocked', async () => {
    fromMock.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn(async () => ({ count: null, error: { message: 'boom' } })),
    }));
    const decision = await checkEmailCaptureLimit('hash', { perIpPerHour: 30 });
    expect(decision.allowed).toBe(true);
  });

  it('bypasses the limiter outside production so local dev is not throttled', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    // Even with the cap exceeded in mocks, dev mode short-circuits to allow.
    mockCount(9999);
    const decision = await checkEmailCaptureLimit('hash', { perIpPerHour: 30 });
    expect(decision.allowed).toBe(true);
  });
});
