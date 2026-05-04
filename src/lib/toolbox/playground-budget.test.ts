import { describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

import { DAILY_CAP_CENTS, MONTHLY_CAP_CENTS, getUsageForUser } from './playground-budget';

describe('playground-budget caps', () => {
  it('exports plausible-magnitude defaults', () => {
    expect(DAILY_CAP_CENTS).toBeGreaterThan(0);
    expect(MONTHLY_CAP_CENTS).toBeGreaterThanOrEqual(DAILY_CAP_CENTS);
  });
});

describe('getUsageForUser', () => {
  it('returns aggregated cents for today and this month', async () => {
    const responses = [
      { data: [{ total_cents: 31 }], error: null },
      { data: [{ total_cents: 412 }], error: null },
    ];
    let callIndex = 0;

    function buildBuilder() {
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn().mockReturnValue(builder);
      builder.eq = vi.fn().mockReturnValue(builder);
      builder.gte = vi.fn().mockReturnValue(builder);
      builder.then = (resolve: (value: unknown) => void) => {
        const next = responses[callIndex++];
        return Promise.resolve(next).then(resolve);
      };
      return builder;
    }

    fromMock.mockImplementation(() => buildBuilder());

    const usage = await getUsageForUser('u1');
    expect(usage.todayCents).toBe(31);
    expect(usage.monthCents).toBe(412);
  });
});
