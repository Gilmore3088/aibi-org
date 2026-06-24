import { afterEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

import {
  checkPublicPlaygroundBudget,
  resolvePublicPlaygroundLimits,
} from './public-budget';

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

function queryResponse(response: unknown) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn().mockReturnValue(builder);
  builder.eq = vi.fn().mockReturnValue(builder);
  builder.gte = vi.fn().mockReturnValue(builder);
  builder.then = (resolve: (value: unknown) => void) => Promise.resolve(response).then(resolve);
  return builder;
}

describe('public playground budget', () => {
  it('allows a request under IP and global daily caps', async () => {
    const responses = [
      { count: 0, error: null },
      { count: 2, error: null },
      { data: [{ cost_cents: 12 }, { cost_cents: '8' }], error: null },
    ];
    fromMock.mockImplementation(() => queryResponse(responses.shift()));

    await expect(
      checkPublicPlaygroundBudget('ip-hash', { perIpPerMinute: 1, perIpPerDay: 5, dailyCapCents: 200 }),
    ).resolves.toEqual({ allowed: true });
  });

  it('blocks when the per-minute IP cap is reached', async () => {
    fromMock.mockImplementation(() => queryResponse({ count: 1, error: null }));

    await expect(
      checkPublicPlaygroundBudget('ip-hash', { perIpPerMinute: 1, perIpPerDay: 5, dailyCapCents: 200 }),
    ).resolves.toMatchObject({
      allowed: false,
      reason: 'per-ip-per-minute-exceeded',
      retryAfterSeconds: 60,
    });
  });

  it('blocks when the global daily budget is reached', async () => {
    const responses = [
      { count: 0, error: null },
      { count: 0, error: null },
      { data: [{ cost_cents: 200 }], error: null },
    ];
    fromMock.mockImplementation(() => queryResponse(responses.shift()));

    await expect(
      checkPublicPlaygroundBudget('ip-hash', { perIpPerMinute: 1, perIpPerDay: 5, dailyCapCents: 200 }),
    ).resolves.toMatchObject({
      allowed: false,
      reason: 'daily-budget-exceeded',
    });
  });

  it('clamps environment-configured limits', () => {
    vi.stubEnv('PUBLIC_PLAYGROUND_PER_IP_PER_MINUTE', '0');
    vi.stubEnv('PUBLIC_PLAYGROUND_PER_IP_PER_DAY', '9999');
    vi.stubEnv('PUBLIC_PLAYGROUND_DAILY_CAP_CENTS', 'not-a-number');

    expect(resolvePublicPlaygroundLimits()).toEqual({
      perIpPerMinute: 1,
      perIpPerDay: 100,
      dailyCapCents: 200,
    });
  });
});
