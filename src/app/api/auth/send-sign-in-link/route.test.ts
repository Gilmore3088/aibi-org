import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rateLimitOrFail: vi.fn(),
  getRequestIp: vi.fn(),
  ensureAuthUser: vi.fn(),
  generateMagicLink: vi.fn(),
  sendAuthSignInLink: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
  getRequestIp: mocks.getRequestIp,
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
  return new Request('https://www.aibankinginstitute.com/api/auth/send-sign-in-link', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.86' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/send-sign-in-link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.getRequestIp.mockReturnValue('203.0.113.86');
    mocks.ensureAuthUser.mockResolvedValue({ userId: 'user-86', created: false });
    mocks.generateMagicLink.mockResolvedValue('https://www.aibankinginstitute.com/auth/callback?token_hash=abc');
    mocks.sendAuthSignInLink.mockResolvedValue({ skipped: true, reason: 'test' });
  });

  it('sends a generic passwordless sign-in link for the requested certificate path', async () => {
    const response = await POST(request({
      email: 'Buyer@Example.com',
      next: '/courses/foundation/program/certificate',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: 'If that email can sign in, a one-time link is on its way.',
    });
    expect(mocks.ensureAuthUser).toHaveBeenCalledWith('buyer@example.com');
    expect(mocks.generateMagicLink).toHaveBeenCalledWith(
      'buyer@example.com',
      '/courses/foundation/program/certificate',
    );
    expect(mocks.sendAuthSignInLink).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      accessUrl: 'https://www.aibankinginstitute.com/auth/callback?token_hash=abc',
    });
  });
});
