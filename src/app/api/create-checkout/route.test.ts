// Multi-product dispatch tests for POST /api/create-checkout.
//
// Covers:
//   - aibi-p backwards compatibility (no `product` field defaults to aibi-p)
//   - indepth-assessment validation: leader_email required + well-formed
//   - indepth-assessment institution mode: quantity >= 10, institution_name required
//   - rejection of unknown products
//
// These tests exercise validation paths that fail before any Stripe call,
// plus one happy-path-or-503 case for aibi-p (depending on whether the test
// environment has STRIPE_AIBIP_PRICE_ID configured).

import { describe, it, expect } from 'vitest';
import { POST } from './route';

const makeReq = (body: unknown) =>
  new Request('https://aibankinginstitute.com/api/create-checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/create-checkout — multi-product dispatch', () => {
  it('rejects unknown product', async () => {
    const res = await POST(makeReq({ product: 'unknown', mode: 'individual' }));
    expect(res.status).toBe(400);
  });

  it('rejects indepth-assessment without leader_email', async () => {
    const res = await POST(
      makeReq({
        product: 'indepth-assessment',
        mode: 'individual',
      })
    );
    expect(res.status).toBe(400);
  });

  it('rejects indepth-assessment with malformed leader_email', async () => {
    const res = await POST(
      makeReq({
        product: 'indepth-assessment',
        mode: 'individual',
        leader_email: 'not-an-email',
      })
    );
    expect(res.status).toBe(400);
  });

  it('rejects indepth-assessment institution mode with quantity < 10', async () => {
    const res = await POST(
      makeReq({
        product: 'indepth-assessment',
        mode: 'institution',
        quantity: 5,
        institution_name: 'Test Bank',
        leader_email: 'leader@bank.test',
      })
    );
    expect(res.status).toBe(400);
  });

  it('rejects indepth-assessment institution mode without institution_name', async () => {
    const res = await POST(
      makeReq({
        product: 'indepth-assessment',
        mode: 'institution',
        quantity: 10,
        leader_email: 'leader@bank.test',
      })
    );
    expect(res.status).toBe(400);
  });

  it('rejects indepth-assessment with unknown mode', async () => {
    const res = await POST(
      makeReq({
        product: 'indepth-assessment',
        mode: 'bogus',
        leader_email: 'leader@bank.test',
      })
    );
    expect(res.status).toBe(400);
  });

  it('preserves aibi-p individual default behavior (200 if configured, 503 if not, 500 on Stripe error)', async () => {
    // Backwards-compat: pre-existing callers may not send `product` at all.
    // The route must default to aibi-p so existing AiBI-P checkouts keep working.
    const res = await POST(makeReq({ mode: 'individual' }));
    expect([200, 500, 503]).toContain(res.status);
  });

  it('rejects aibi-p with invalid mode', async () => {
    const res = await POST(makeReq({ product: 'aibi-p', mode: 'bogus' }));
    expect(res.status).toBe(400);
  });
});
