/**
 * §14.7 — anonymous rate limit.
 *
 * 5 anonymous calls/hour per anon_session_id. The 6th call within the
 * window is refused with allowed=false. Uses the in-process fallback;
 * Upstash is not required.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  _resetRateLimiterForTests,
  getRateLimiter,
} from '../../src/rateLimit';

describe('§14.7 anonymous rate limit', () => {
  beforeEach(() => {
    _resetRateLimiterForTests();
  });

  it('blocks the 6th anonymous call within the hour', async () => {
    const limiter = getRateLimiter();
    const ctx = {
      identity: { learnerId: null, anonSessionId: '00000000-0000-0000-0000-000000000001' },
      exerciseId: 'm3-2-ab',
      lessonId: 'm3-2' as string | null,
      provider: 'anthropic' as const,
      ipAddress: '198.51.100.10',
    };

    for (let i = 0; i < 5; i++) {
      const d = await limiter.check(ctx);
      expect(d.allowed, `call ${i + 1}`).toBe(true);
    }
    const sixth = await limiter.check(ctx);
    expect(sixth.allowed).toBe(false);
    expect(sixth.reason).toBeDefined();
  });

  it('blocks the 21st anonymous IP call across distinct anon sessions', async () => {
    const limiter = getRateLimiter();
    const ip = '198.51.100.20';
    // Use distinct anon ids so the per-session cap (5) doesn't fire first.
    for (let i = 0; i < 20; i++) {
      const d = await limiter.check({
        identity: {
          learnerId: null,
          anonSessionId: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
        },
        exerciseId: 'm3-2-ab',
        lessonId: null,
        provider: 'anthropic',
        ipAddress: ip,
      });
      expect(d.allowed, `call ${i + 1}`).toBe(true);
    }
    const twentyFirst = await limiter.check({
      identity: {
        learnerId: null,
        anonSessionId: '00000000-0000-0000-0000-aaaaaaaaaaaa',
      },
      exerciseId: 'm3-2-ab',
      lessonId: null,
      provider: 'anthropic',
      ipAddress: ip,
    });
    expect(twentyFirst.allowed).toBe(false);
  });
});
