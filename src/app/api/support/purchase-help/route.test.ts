import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createSupportCase: vi.fn(),
  checkSupportIntakeLimit: vi.fn(),
  logSupportIntake: vi.fn(),
  sendSupportCaseNotification: vi.fn(),
  sendSupportCaseAcknowledgement: vi.fn(),
}));

vi.mock('@/lib/support/cases', () => ({
  createSupportCase: mocks.createSupportCase,
}));

vi.mock('@/lib/support/rate-limit', () => ({
  checkSupportIntakeLimit: mocks.checkSupportIntakeLimit,
  hashIp: (ip: string) => `hash:${ip}`,
  logSupportIntake: mocks.logSupportIntake,
}));

vi.mock('@/lib/support/admin', () => ({
  getSupportInboxEmail: () => 'hello@aibankinginstitute.com',
}));

vi.mock('@/lib/supabase/auth-admin', () => ({
  getCanonicalSiteUrl: () => 'https://www.aibankinginstitute.com',
}));

vi.mock('@/lib/resend', () => ({
  sendSupportCaseNotification: mocks.sendSupportCaseNotification,
  sendSupportCaseAcknowledgement: mocks.sendSupportCaseAcknowledgement,
}));

describe('POST /api/support/purchase-help', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.createSupportCase.mockReset();
    mocks.checkSupportIntakeLimit.mockReset();
    mocks.logSupportIntake.mockReset();
    mocks.sendSupportCaseNotification.mockReset();
    mocks.sendSupportCaseAcknowledgement.mockReset();
    mocks.createSupportCase.mockResolvedValue({ id: 'case-123' });
    mocks.checkSupportIntakeLimit.mockResolvedValue({ allowed: true });
    mocks.logSupportIntake.mockResolvedValue(undefined);
    mocks.sendSupportCaseNotification.mockResolvedValue({ skipped: true, reason: 'test' });
    mocks.sendSupportCaseAcknowledgement.mockResolvedValue({ skipped: true, reason: 'test' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a support case and sends notifications', async () => {
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/support/purchase-help', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.1' },
      body: JSON.stringify({
        email: 'Buyer@Example.com',
        category: 'refund_request',
        stripeSessionId: 'cs_live_123',
        message: 'I need help with a refund request.',
      }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.createSupportCase).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'buyer@example.com',
      category: 'refund_request',
      priority: 'high',
      source: 'buyer_form',
      stripeSessionId: 'cs_live_123',
    }));
    expect(mocks.sendSupportCaseNotification).toHaveBeenCalled();
    expect(mocks.sendSupportCaseAcknowledgement).toHaveBeenCalledWith({ email: 'buyer@example.com' });
  });

  it('rate limits abusive intake', async () => {
    mocks.checkSupportIntakeLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 3600 });
    const { POST } = await import('./route');
    const response = await POST(new Request('https://example.test/api/support/purchase-help', {
      method: 'POST',
      body: JSON.stringify({
        email: 'buyer@example.com',
        category: 'access',
        message: 'I cannot access my purchase.',
      }),
    }));

    expect(response.status).toBe(429);
    expect(mocks.createSupportCase).not.toHaveBeenCalled();
  });
});
