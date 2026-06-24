import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(),
  createServerClientWithCookies: vi.fn(),
  createServiceRoleClient: vi.fn(),
  consumeDeviceConfirmation: vi.fn(),
  issueTrustedDevice: vi.fn(),
  generateMagicLink: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: vi.fn() })),
  headers: vi.fn(async () => new Headers()),
}));

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
  createServerClientWithCookies: mocks.createServerClientWithCookies,
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock('@/lib/supabase/auth-admin', () => ({
  generateMagicLink: mocks.generateMagicLink,
}));

vi.mock('@/lib/auth/trusted-device', () => ({
  consumeDeviceConfirmation: mocks.consumeDeviceConfirmation,
  issueTrustedDevice: mocks.issueTrustedDevice,
  TRUSTED_DEVICE_COOKIE: 'aibi-trusted-device',
  trustedDeviceCookieOptions: () => ({ path: '/', httpOnly: true }),
}));

import { GET } from './route';

describe('GET /auth/confirm-device', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.consumeDeviceConfirmation.mockResolvedValue({
      userId: 'user-86',
      redirectTo: '/courses/foundation/program/certificate',
    });
    mocks.createServerClientWithCookies.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });
    mocks.createServiceRoleClient.mockReturnValue({
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: { user: { email: 'buyer@example.com' } },
          }),
        },
      },
    });
    mocks.generateMagicLink.mockResolvedValue(
      'https://www.aibankinginstitute.com/auth/callback?token_hash=abc&type=email&next=%2Fcourses%2Ffoundation%2Fprogram%2Fcertificate',
    );
  });

  it('turns a cross-device confirmation click into a fresh auth link', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/auth/confirm-device?token=device-token'),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://www.aibankinginstitute.com/auth/callback?token_hash=abc&type=email&next=%2Fcourses%2Ffoundation%2Fprogram%2Fcertificate',
    );
    expect(mocks.generateMagicLink).toHaveBeenCalledWith(
      'buyer@example.com',
      '/courses/foundation/program/certificate',
    );
    expect(mocks.issueTrustedDevice).not.toHaveBeenCalled();
  });
});
