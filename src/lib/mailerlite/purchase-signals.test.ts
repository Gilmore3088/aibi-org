import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { markPurchaseSignal } from './purchase-signals';

describe('markPurchaseSignal', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true, text: async () => '' });
    vi.stubGlobal('fetch', fetchMock);
    process.env.MAILERLITE_API_KEY = 'k';
    delete process.env.SKIP_MAILERLITE;
    delete process.env.MAILERLITE_GROUP_ID_CUSTOMER_IN_DEPTH;
    delete process.env.MAILERLITE_GROUP_ID_CUSTOMER_FOUNDATION;
  });
  afterEach(() => vi.unstubAllGlobals());

  const body = () => JSON.parse(fetchMock.mock.calls[0][1].body as string);

  it('sets the date field and joins the Customer group when configured', async () => {
    process.env.MAILERLITE_GROUP_ID_CUSTOMER_IN_DEPTH = 'g1';
    const r = await markPurchaseSignal(' Buyer@Bank.com ', 'in_depth');
    expect(r.status).toBe('marked');
    expect(body().email).toBe('buyer@bank.com');
    expect(body().fields.purchased_in_depth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body().groups).toEqual(['g1']);
  });

  it('writes only the field when no group env var is set', async () => {
    await markPurchaseSignal('a@b.com', 'foundation');
    expect(body().fields.foundation_enrolled).toBeDefined();
    expect(body().groups).toBeUndefined();
  });
});
