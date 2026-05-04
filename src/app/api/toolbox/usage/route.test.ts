import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';

vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'u1' })),
}));
vi.mock('@/lib/toolbox/playground-budget', () => ({
  DAILY_CAP_CENTS: 50,
  MONTHLY_CAP_CENTS: 1000,
  getUsageForUser: vi.fn(async () => ({ todayCents: 31, monthCents: 412 })),
}));

afterEach(() => vi.clearAllMocks());

describe('GET /api/toolbox/usage', () => {
  it('returns the usage summary with caps', async () => {
    const res = await GET(new Request('http://localhost/api/toolbox/usage'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      todayCents: 31,
      dailyCapCents: 50,
      monthCents: 412,
      monthlyCapCents: 1000,
    });
  });

  it('returns 403 when paid access is missing', async () => {
    vi.mocked(getPaidToolboxAccess).mockResolvedValueOnce(null);
    const res = await GET(new Request('http://localhost/api/toolbox/usage'));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toEqual({ error: 'Paid access required.' });
  });
});
