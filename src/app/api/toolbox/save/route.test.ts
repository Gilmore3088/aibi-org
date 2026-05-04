import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({
  insert: insertMock,
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));
vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'u1' })),
}));
vi.mock('@/lib/analytics/plausible', () => ({
  trackEvent: vi.fn(),
}));
vi.mock('@content/courses/aibi-p/prompt-library', async () => ({
  getPromptById: (id: string) =>
    id === 'p-1'
      ? {
          id: 'p-1',
          title: 't',
          promptText: 'pt',
          relatedModule: 2,
          expectedOutput: 'eo',
          difficulty: 'beginner',
          timeEstimate: '5 min',
          role: 'lender',
          platform: 'claude',
        }
      : null,
}));

afterEach(() => {
  vi.clearAllMocks();
  // Default leaf: insert(...).select('id').single()
  insertMock.mockImplementation(() => ({
    select: () => ({
      single: async () => ({ data: { id: 'new-id' }, error: null }),
    }),
  }));
});

function req(body: unknown): Request {
  return new Request('http://localhost/api/toolbox/save', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/toolbox/save', () => {
  it('rejects unauthenticated', async () => {
    const access = (await import('@/lib/toolbox/access'))
      .getPaidToolboxAccess as ReturnType<typeof vi.fn>;
    access.mockResolvedValueOnce(null);
    const res = await POST(
      req({
        origin: 'course',
        payload: { promptId: 'p-1', courseSlug: 'aibi-p', moduleNumber: 2 },
      }),
    );
    expect(res.status).toBe(403);
  });

  it('saves a course prompt and returns the new id', async () => {
    insertMock.mockImplementationOnce(() => ({
      select: () => ({
        single: async () => ({ data: { id: 'new-id' }, error: null }),
      }),
    }));
    const res = await POST(
      req({
        origin: 'course',
        payload: { promptId: 'p-1', courseSlug: 'aibi-p', moduleNumber: 2 },
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { id: string };
    expect(json.id).toBe('new-id');
  });

  it('rejects an unknown origin', async () => {
    const res = await POST(req({ origin: 'cookbook', payload: {} }));
    expect(res.status).toBe(400);
  });

  it('rejects a course payload pointing at a missing prompt', async () => {
    const res = await POST(
      req({
        origin: 'course',
        payload: {
          promptId: 'does-not-exist',
          courseSlug: 'aibi-p',
          moduleNumber: 2,
        },
      }),
    );
    expect(res.status).toBe(404);
  });
});
