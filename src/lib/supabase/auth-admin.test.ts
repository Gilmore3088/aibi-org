import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateLinkMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({
    auth: {
      admin: {
        generateLink: generateLinkMock,
      },
    },
  }),
  isSupabaseConfigured: () => true,
}));

import { generateMagicLink, getCanonicalSiteUrl } from './auth-admin';

describe('auth-admin magic links', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    generateLinkMock.mockReset();
    generateLinkMock.mockResolvedValue({
      data: { properties: { hashed_token: 'hashed-token-123' } },
      error: null,
    });
  });

  it('builds callback links from NEXT_PUBLIC_SITE_URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.aibankinginstitute.com/');

    const link = await generateMagicLink('Buyer+Alias@Gmail.com', '/assessment/in-depth/take');

    expect(generateLinkMock).toHaveBeenCalledWith({
      type: 'magiclink',
      email: 'buyer@gmail.com',
    });
    expect(link).toBe(
      'https://www.aibankinginstitute.com/auth/callback?token_hash=hashed-token-123&type=email&next=%2Fassessment%2Fin-depth%2Ftake',
    );
  });

  it('defaults to the canonical www host when site url is unset', () => {
    expect(getCanonicalSiteUrl()).toBe('https://www.aibankinginstitute.com');
  });
});
