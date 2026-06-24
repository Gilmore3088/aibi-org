import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rateLimitOrFail: vi.fn(),
  getRequestIp: vi.fn(),
  createServiceRoleClient: vi.fn(),
  ensureAuthUser: vi.fn(),
  generateMagicLink: vi.fn(),
  sendAuthSignInLink: vi.fn(),
  inLookup: vi.fn(),
  eqLookup: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
  getRequestIp: mocks.getRequestIp,
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
  isSupabaseConfigured: () => true,
}));

vi.mock('@/lib/supabase/auth-admin', () => ({
  ensureAuthUser: mocks.ensureAuthUser,
  generateMagicLink: mocks.generateMagicLink,
}));

vi.mock('@/lib/resend', () => ({
  sendAuthSignInLink: mocks.sendAuthSignInLink,
}));

import { POST } from './route';

function request(body: unknown): Request {
  return new Request('https://www.aibankinginstitute.com/api/auth/resend-purchase-link', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.10' },
    body: JSON.stringify(body),
  });
}

function mockEnrollmentLookup(data: unknown[]) {
  mocks.inLookup.mockResolvedValue({ data, error: null });
  mocks.eqLookup.mockResolvedValue({ data: [], error: null });
  mocks.createServiceRoleClient.mockReturnValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: mocks.inLookup,
        eq: mocks.eqLookup,
      })),
    })),
  });
}

describe('POST /api/auth/resend-purchase-link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.getRequestIp.mockReturnValue('203.0.113.10');
    mocks.ensureAuthUser.mockResolvedValue({ userId: 'user-123', created: false });
    mocks.generateMagicLink.mockResolvedValue('https://www.aibankinginstitute.com/auth/callback?token_hash=abc');
    mocks.sendAuthSignInLink.mockResolvedValue({ skipped: true, reason: 'test' });
  });

  it('sends a fresh Foundation access link without revealing purchase existence', async () => {
    mockEnrollmentLookup([
      {
        id: 'enroll-123',
        email: 'buyer@example.com',
        product: 'foundation',
        user_id: 'user-123',
        enrolled_at: '2026-06-23T08:00:00.000Z',
        created_at: '2026-06-23T08:00:00.000Z',
      },
    ]);

    const response = await POST(request({ email: 'Buyer@Example.com' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      message: 'If that email has a purchase, a fresh access link is on its way.',
    });
    expect(mocks.generateMagicLink).toHaveBeenCalledWith(
      'buyer@example.com',
      '/courses/foundation/program',
    );
    expect(mocks.sendAuthSignInLink).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      accessUrl: 'https://www.aibankinginstitute.com/auth/callback?token_hash=abc',
    });
  });

  it('sends a fresh In-Depth access link for $99 buyers without revealing purchase existence', async () => {
    mockEnrollmentLookup([
      {
        id: 'enroll-98',
        email: 'buyer@example.com',
        product: 'in-depth-assessment',
        user_id: 'user-123',
        enrolled_at: '2026-06-23T09:00:00.000Z',
        created_at: '2026-06-23T09:00:00.000Z',
      },
    ]);

    const response = await POST(request({ email: 'Buyer@Example.com' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe('If that email has a purchase, a fresh access link is on its way.');
    expect(mocks.generateMagicLink).toHaveBeenCalledWith(
      'buyer@example.com',
      '/assessment/in-depth/take',
    );
    expect(mocks.sendAuthSignInLink).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      accessUrl: 'https://www.aibankinginstitute.com/auth/callback?token_hash=abc',
    });
  });

  it('keeps the same generic response when no purchase is found', async () => {
    mockEnrollmentLookup([]);

    const response = await POST(request({ email: 'prospect@example.com' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe('If that email has a purchase, a fresh access link is on its way.');
    expect(mocks.generateMagicLink).not.toHaveBeenCalled();
    expect(mocks.sendAuthSignInLink).not.toHaveBeenCalled();
  });
});
