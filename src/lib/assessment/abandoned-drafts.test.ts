import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
  isAbandonedAssessmentDraftCandidate,
  resolveAbandonedAssessmentOptions,
  type AssessmentDraftReminderRow,
} from './abandoned-drafts';

const baseDraft: AssessmentDraftReminderRow = {
  id: 'draft-1',
  email: 'banker@example.com',
  selected_question_ids: ['sv-01', 'atp-01'],
  answers: [1],
  current_question: 1,
  phase: 'questions',
  updated_at: '2026-06-22T08:00:00.000Z',
  expires_at: '2026-07-01T00:00:00.000Z',
  last_resumed_at: null,
  last_sent_at: null,
  reminder_sent_at: null,
  reminder_count: 0,
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('abandoned assessment draft monitor helpers', () => {
  it('flags stale unanswered free-assessment drafts', () => {
    expect(
      isAbandonedAssessmentDraftCandidate(
        baseDraft,
        new Date('2026-06-23T09:00:00.000Z'),
        DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
      ),
    ).toBe(true);
  });

  it('ignores drafts that are fresh, resumed, reminded, expired, or already scored', () => {
    const now = new Date('2026-06-23T09:00:00.000Z');

    expect(
      isAbandonedAssessmentDraftCandidate(
        { ...baseDraft, updated_at: '2026-06-23T08:30:00.000Z' },
        now,
        DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
      ),
    ).toBe(false);
    expect(
      isAbandonedAssessmentDraftCandidate(
        { ...baseDraft, last_resumed_at: '2026-06-23T08:45:00.000Z' },
        now,
        DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
      ),
    ).toBe(false);
    expect(
      isAbandonedAssessmentDraftCandidate(
        { ...baseDraft, reminder_sent_at: '2026-06-23T08:45:00.000Z' },
        now,
        DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
      ),
    ).toBe(false);
    expect(
      isAbandonedAssessmentDraftCandidate(
        { ...baseDraft, expires_at: '2026-06-23T08:45:00.000Z' },
        now,
        DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
      ),
    ).toBe(false);
    expect(
      isAbandonedAssessmentDraftCandidate(
        { ...baseDraft, phase: 'score' },
        now,
        DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
      ),
    ).toBe(false);
  });

  it('parses and clamps monitor environment options', () => {
    vi.stubEnv('ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS', '0');
    vi.stubEnv('ABANDONED_ASSESSMENT_LOOKBACK_DAYS', '999');
    vi.stubEnv('ABANDONED_ASSESSMENT_MAX_REMINDERS', 'not-a-number');

    expect(resolveAbandonedAssessmentOptions()).toEqual({
      reminderAfterHours: 1,
      lookbackDays: 30,
      maxReminders: 50,
    });
  });
});
