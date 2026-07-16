import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  cookies: vi.fn(),
  headers: vi.fn(),
  hashIp: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
  headers: mocks.headers,
}));

vi.mock('@/lib/ai-harness/rate-limit', () => ({
  hashIp: mocks.hashIp,
}));

import { logStaticResourceDownload } from './downloadLogging';

describe('logStaticResourceDownload', () => {
  const insert = vi.fn();
  const from = vi.fn(() => ({ insert }));

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.createServiceRoleClient.mockReturnValue({ from });
    mocks.cookies.mockResolvedValue({
      get: (name: string) => (name === 'aibi_free_resource_email'
        ? { value: 'Leader@CommunityBank.test' }
        : undefined),
    });
    mocks.headers.mockResolvedValue({
      get: (name: string) => ({
        'x-forwarded-for': '203.0.113.44, 10.0.0.2',
        'x-real-ip': '198.51.100.10',
        'user-agent': 'Vitest Browser',
        referer: 'https://www.aibankinginstitute.com/security',
      }[name] ?? null),
    });
    mocks.hashIp.mockReturnValue('hashed-ip');
    insert.mockResolvedValue({ error: null });
  });

  it('logs a static resource download with known email and attribution', async () => {
    await logStaticResourceDownload(
      new Request(
        'https://www.aibankinginstitute.com/api/prompt-cards/download?source_surface=prompt-cards-library&assessment_role=executive',
      ),
      {
        resourceSlug: 'aibi-prompt-cards',
        defaultSourceSurface: 'prompt-cards-download',
      },
    );

    expect(from).toHaveBeenCalledWith('resource_downloads');
    // getRequestIpFromHeaders prefers the platform-set x-real-ip over the
    // client-controllable leftmost x-forwarded-for hop.
    expect(mocks.hashIp).toHaveBeenCalledWith('198.51.100.10');
    expect(insert).toHaveBeenCalledWith({
      resource_id: null,
      resource_slug: 'aibi-prompt-cards',
      user_id: null,
      email: 'leader@communitybank.test',
      ip_hash: 'hashed-ip',
      user_agent: 'Vitest Browser',
      referrer: 'https://www.aibankinginstitute.com/security',
      source_surface: 'prompt-cards-library',
      assessment_role: 'executive',
    });
  });

  it('skips logging when Supabase is not configured', async () => {
    mocks.isSupabaseConfigured.mockReturnValue(false);

    await logStaticResourceDownload(
      new Request('https://www.aibankinginstitute.com/api/guides/safe-ai-use'),
      {
        resourceSlug: 'aibi-safe-ai-use-guide',
        defaultSourceSurface: 'security-safe-ai-guide',
      },
    );

    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
});
