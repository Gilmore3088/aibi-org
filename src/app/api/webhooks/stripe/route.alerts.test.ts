// Unauthenticated webhook requests must not trigger ops alerts (issue #620).
// Alerts are reserved for failures after Stripe has verified the event.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';

const notifyOpsAlert = vi.fn();
const constructEvent = vi.fn();

vi.mock('@/lib/ops/alerts', () => ({ notifyOpsAlert }));
vi.mock('@/lib/stripe', () => ({
  stripe: { webhooks: { constructEvent } },
}));
vi.mock('@/lib/stripe/provision-enrollment', () => ({ provisionEnrollment: vi.fn() }));
vi.mock('@/lib/resend', () => ({
  sendCoursePurchaseIndividual: vi.fn(),
  sendCoursePurchaseInstitution: vi.fn(),
  sendInDepthAssessmentPurchase: vi.fn(),
  sendTeamAssessmentPurchase: vi.fn(),
}));

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new Request('https://example.test/api/webhooks/stripe', {
    method: 'POST',
    headers,
    body: '{}',
  }) as unknown as NextRequest;
}

describe('stripe webhook: unauthenticated requests', () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const originalTestSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST;

  beforeEach(() => {
    notifyOpsAlert.mockReset();
    constructEvent.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    if (originalTestSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET_TEST;
    else process.env.STRIPE_WEBHOOK_SECRET_TEST = originalTestSecret;
  });

  it('returns 400 and sends no alert when the stripe-signature header is missing', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    const { POST } = await import('./route');
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    expect(notifyOpsAlert).not.toHaveBeenCalled();
  });

  it('returns 400 and sends no alert when signature verification fails', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    constructEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });
    const { POST } = await import('./route');
    const res = await POST(makeRequest({ 'stripe-signature': 't=1,v1=bad' }));
    expect(res.status).toBe(400);
    expect(notifyOpsAlert).not.toHaveBeenCalled();
  });

  it('returns 503 and sends no alert when no signing secret is configured', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET_TEST;
    const { POST } = await import('./route');
    const res = await POST(makeRequest({ 'stripe-signature': 't=1,v1=x' }));
    expect(res.status).toBe(503);
    expect(notifyOpsAlert).not.toHaveBeenCalled();
  });
});
