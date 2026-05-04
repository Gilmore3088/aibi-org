import { describe, expect, it, vi, beforeEach } from 'vitest';

const fromMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

import { checkPerMinuteLimits, hashIp } from './rate-limit';

beforeEach(() => {
  fromMock.mockReset();
});

describe('hashIp', () => {
  it('produces a stable, salted SHA-256 hex string', () => {
    process.env.TOOLBOX_IP_HASH_SALT = 'fixed-salt';
    const a = hashIp('1.2.3.4');
    const b = hashIp('1.2.3.4');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
  it('produces different hashes under different salts', () => {
    process.env.TOOLBOX_IP_HASH_SALT = 'salt-a';
    const a = hashIp('1.2.3.4');
    process.env.TOOLBOX_IP_HASH_SALT = 'salt-b';
    const b = hashIp('1.2.3.4');
    expect(a).not.toBe(b);
  });
});

describe('checkPerMinuteLimits', () => {
  it('allows when both user and IP counts are under the cap', async () => {
    let call = 0;
    fromMock.mockImplementation(() => {
      const q = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn(async () => ({ count: call++ === 0 ? 3 : 5, error: null })),
      };
      return q;
    });
    const decision = await checkPerMinuteLimits({
      userId: 'u1',
      ipHash: 'h1',
      limits: { perUserPerMinute: 10, perIpPerMinute: 20 },
    });
    expect(decision.allowed).toBe(true);
  });

  it('blocks with per-user reason when the user cap is reached', async () => {
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn(async () => ({ count: 10, error: null })),
    });
    const decision = await checkPerMinuteLimits({
      userId: 'u1',
      ipHash: 'h1',
      limits: { perUserPerMinute: 10, perIpPerMinute: 20 },
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('per-user-per-minute-exceeded');
    expect(decision.retryAfterSeconds).toBe(60);
  });

  it('blocks with per-IP reason when the IP cap is reached', async () => {
    let call = 0;
    fromMock.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn(async () => ({ count: call++ === 0 ? 1 : 20, error: null })),
    }));
    const decision = await checkPerMinuteLimits({
      userId: 'u1',
      ipHash: 'h1',
      limits: { perUserPerMinute: 10, perIpPerMinute: 20 },
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('per-ip-per-minute-exceeded');
    expect(decision.retryAfterSeconds).toBe(60);
  });
});
