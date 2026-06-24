import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(),
  createServiceRoleClient: vi.fn(),
  maybeSingle: vi.fn(),
  updateEq: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

describe('GET /api/assessment/drafts/[token]', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.isSupabaseConfigured.mockReset();
    mocks.createServiceRoleClient.mockReset();
    mocks.maybeSingle.mockReset();
    mocks.updateEq.mockReset();

    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.updateEq.mockResolvedValue({ error: null });
    mocks.createServiceRoleClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: mocks.maybeSingle })),
        })),
        update: vi.fn(() => ({
          eq: mocks.updateEq,
        })),
      })),
    });
  });

  it('returns a saved draft for a valid token', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: {
        selected_question_ids: ['sv-01', 'atp-01'],
        answers: [1, 2],
        current_question: 2,
        phase: 'questions',
        expires_at: '2999-01-01T00:00:00.000Z',
      },
      error: null,
    });

    const { GET } = await import('./route');
    const response = await GET(new Request('https://example.test'), {
      params: Promise.resolve({ token: 'a'.repeat(43) }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      draft: {
        selectedQuestionIds: ['sv-01', 'atp-01'],
        answers: [1, 2],
        currentQuestion: 2,
        phase: 'questions',
      },
    });
    expect(mocks.updateEq).toHaveBeenCalled();
  });

  it('rejects malformed tokens without a database lookup', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('https://example.test'), {
      params: Promise.resolve({ token: 'not valid' }),
    });

    expect(response.status).toBe(404);
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });
});
