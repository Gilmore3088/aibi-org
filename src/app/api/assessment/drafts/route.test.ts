import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rateLimitOrFail: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  createServiceRoleClient: vi.fn(),
  insert: vi.fn(),
  sendAssessmentResumeLink: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
  getRequestIp: () => '203.0.113.10',
}));

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock('@/lib/resend', () => ({
  sendAssessmentResumeLink: mocks.sendAssessmentResumeLink,
}));

const questionIds = [
  'sv-01',
  'atp-01',
  'dsr-01',
  'ps-01',
  'rf-01',
  'hr-01',
  'doc-01',
  'va-01',
  'cia-01',
  'wr-01',
  'tc-01',
  'lv-01',
];

describe('POST /api/assessment/drafts', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.rateLimitOrFail.mockReset();
    mocks.isSupabaseConfigured.mockReset();
    mocks.createServiceRoleClient.mockReset();
    mocks.insert.mockReset();
    mocks.sendAssessmentResumeLink.mockReset();

    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.insert.mockResolvedValue({ error: null });
    mocks.createServiceRoleClient.mockReturnValue({
      from: vi.fn(() => ({ insert: mocks.insert })),
    });
    mocks.sendAssessmentResumeLink.mockResolvedValue({ skipped: true, reason: 'test' });
  });

  it('stores a hashed draft token and sends a resume link', async () => {
    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/assessment/drafts', {
        method: 'POST',
        body: JSON.stringify({
          email: 'Banker@Example.com',
          selectedQuestionIds: questionIds,
          answers: [1, 2, 3],
          currentQuestion: 3,
          phase: 'questions',
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'banker@example.com',
        selected_question_ids: questionIds,
        answers: [1, 2, 3],
        current_question: 3,
        phase: 'questions',
        token_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(mocks.sendAssessmentResumeLink).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'banker@example.com',
        resumeUrl: expect.stringContaining('/assessment/take?resume='),
        currentQuestion: 4,
        totalQuestions: 12,
        expiresInDays: 30,
      }),
    );
  });

  it('rejects malformed drafts before side effects', async () => {
    const { POST } = await import('./route');
    const response = await POST(
      new Request('https://example.test/api/assessment/drafts', {
        method: 'POST',
        body: JSON.stringify({
          email: 'banker@example.com',
          selectedQuestionIds: [...questionIds.slice(0, 11), questionIds[0]],
          answers: [],
          currentQuestion: 0,
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.sendAssessmentResumeLink).not.toHaveBeenCalled();
  });
});
