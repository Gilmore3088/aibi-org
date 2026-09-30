import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => false,
  createServiceRoleClient: () => {
    throw new Error('not configured');
  },
  createServerClientWithCookies: () => {
    throw new Error('not configured');
  },
}));

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  const readFile = vi.fn(async () => Buffer.from('%PDF-1.7 test'));
  return { ...actual, default: { ...actual, readFile }, readFile };
});

const getDownloadResource = vi.fn();
vi.mock('@/lib/resources/downloadCatalog', () => ({
  getDownloadResource: (slug: string) => getDownloadResource(slug),
}));

import { GET } from './route';

function call(slug: string) {
  return GET(new Request(`http://localhost/api/resources/${slug}/download`), {
    params: Promise.resolve({ slug }),
  } as never);
}

describe('resource download without a database', () => {
  beforeEach(() => {
    getDownloadResource.mockReset();
  });

  it('still serves a free file from the deploy', async () => {
    getDownloadResource.mockReturnValue({ id: 'x', slug: 'free-guide', file_path: 'free-guide.pdf', tier_required: 'free' });

    const res = await call('free-guide');

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('free-guide.pdf');
  });

  it('keeps paid files unavailable', async () => {
    getDownloadResource.mockReturnValue({ id: 'y', slug: 'paid-kit', file_path: 'paid-kit.zip', tier_required: 'foundation' });

    const res = await call('paid-kit');

    expect(res.status).toBe(503);
  });
});
