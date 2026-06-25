import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendAssessmentResumeLink: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendAssessmentResumeLink: mocks.sendAssessmentResumeLink,
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

import { runAbandonedAssessmentMonitor } from './abandoned-drafts';

type DraftRowOverrides = Partial<{
  last_sent_at: string | null;
  last_resumed_at: string | null;
  reminder_sent_at: string | null;
}>;

function serviceClient(overrides: DraftRowOverrides = {}) {
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq: updateEq }));
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    is: vi.fn(() => query),
    gte: vi.fn(() => query),
    lte: vi.fn(() => query),
    gt: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'draft-59',
          email: 'lender@communitybank.test',
          selected_question_ids: ['sv-01', 'atp-01'],
          answers: [2],
          current_question: 1,
          phase: 'questions',
          updated_at: '2026-06-22T08:00:00.000Z',
          expires_at: '2026-07-23T00:00:00.000Z',
          last_sent_at: null,
          last_resumed_at: null,
          reminder_sent_at: null,
          reminder_count: 0,
          ...overrides,
        },
      ],
      error: null,
    }),
    update,
  };

  return {
    client: { from: vi.fn(() => query) },
    query,
    update,
    updateEq,
  };
}

describe('runAbandonedAssessmentMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.sendAssessmentResumeLink.mockResolvedValue({ ok: true });
  });

  it('sends a 30-day resume reminder for stale free-assessment drafts', async () => {
    const { client, update, updateEq } = serviceClient();

    const result = await runAbandonedAssessmentMonitor({
      now: new Date('2026-06-23T09:00:00.000Z'),
    }, client as never);

    expect(result.sentReminders).toEqual([
      {
        draftId: 'draft-59',
        email: 'lender@communitybank.test',
        currentQuestion: 2,
        totalQuestions: 2,
      },
    ]);
    expect(mocks.sendAssessmentResumeLink).toHaveBeenCalledWith(expect.objectContaining({
      email: 'lender@communitybank.test',
      resumeUrl: expect.stringContaining('/assessment/take?resume='),
      currentQuestion: 2,
      totalQuestions: 2,
      expiresInDays: 30,
    }));
    expect(update).toHaveBeenNthCalledWith(1, expect.objectContaining({
      token_hash: expect.any(String),
      last_sent_at: '2026-06-23T09:00:00.000Z',
    }));
    expect(update).toHaveBeenNthCalledWith(2, {
      reminder_sent_at: '2026-06-23T09:00:00.000Z',
      reminder_count: 1,
    });
    expect(updateEq).toHaveBeenCalledWith('id', 'draft-59');
  });

  it('never rotates token_hash or re-sends for a draft that already has a link emailed (last_sent_at set)', async () => {
    // The POST flow stamps last_sent_at the moment it emails a resume link.
    // The cron must treat that draft as already-served — minting a new token
    // here would overwrite token_hash and silently invalidate the link the
    // user already received. Guards the token-rotation regression.
    const { client, update } = serviceClient({ last_sent_at: '2026-06-22T09:00:00.000Z' });

    const result = await runAbandonedAssessmentMonitor(
      { now: new Date('2026-06-23T09:00:00.000Z') },
      client as never,
    );

    expect(result.sentReminders).toEqual([]);
    expect(mocks.sendAssessmentResumeLink).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
