import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FOUNDATION_NOT_STARTED_AFTER_DAYS,
  DEFAULT_FOUNDATION_STALLED_AFTER_DAYS,
  evaluatePaidReengagementCandidate,
  isCompletedInDepthProfile,
  paidReengagementDedupeKey,
  resolvePaidReengagementOptions,
  type PaidReengagementEnrollmentRow,
} from './paid-reengagement';

const baseEnrollment: PaidReengagementEnrollmentRow = {
  id: 'enroll-1',
  email: 'buyer@example.com',
  product: 'foundation',
  stripe_session_id: 'cs_test_123',
  user_id: 'user-1',
  current_module: 1,
  completed_modules: [],
  enrolled_at: '2026-06-20T12:00:00.000Z',
  created_at: '2026-06-20T12:00:00.000Z',
  updated_at: '2026-06-20T12:00:00.000Z',
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('paid re-engagement monitor helpers', () => {
  it('flags foundation buyers who never started after the waiting window', () => {
    const candidate = evaluatePaidReengagementCandidate(
      baseEnrollment,
      new Date('2026-06-24T12:00:00.000Z'),
      resolvePaidReengagementOptions(),
    );

    expect(candidate).toMatchObject({
      campaign: 'foundation_not_started',
      moduleNumber: 1,
      ageDays: 4,
    });
  });

  it('flags idle In-Depth buyers who have not taken the paid assessment', () => {
    const candidate = evaluatePaidReengagementCandidate(
      {
        ...baseEnrollment,
        product: 'in-depth-assessment',
        enrolled_at: '2026-06-20T12:00:00.000Z',
        created_at: '2026-06-20T12:00:00.000Z',
        updated_at: '2026-06-20T12:00:00.000Z',
      },
      new Date('2026-06-24T12:00:00.000Z'),
      resolvePaidReengagementOptions(),
    );

    expect(candidate).toMatchObject({
      campaign: 'in_depth_waiting',
      moduleNumber: null,
      ageDays: 4,
    });
  });

  it('flags stalled foundation learners at their current module', () => {
    const candidate = evaluatePaidReengagementCandidate(
      {
        ...baseEnrollment,
        current_module: 4,
        completed_modules: [1, 2, 3],
        updated_at: '2026-06-15T12:00:00.000Z',
      },
      new Date('2026-06-23T12:00:00.000Z'),
      resolvePaidReengagementOptions(),
    );

    expect(candidate).toMatchObject({
      campaign: 'foundation_stalled',
      moduleNumber: 4,
      ageDays: 8,
    });
  });

  it('ignores fresh, completed, and unsupported enrollments', () => {
    const now = new Date('2026-06-23T12:00:00.000Z');
    const options = resolvePaidReengagementOptions();

    expect(
      evaluatePaidReengagementCandidate(
        { ...baseEnrollment, enrolled_at: '2026-06-22T12:00:00.000Z' },
        now,
        options,
      ),
    ).toBeNull();

    expect(
      evaluatePaidReengagementCandidate(
        {
          ...baseEnrollment,
          current_module: 18,
          completed_modules: Array.from({ length: 18 }, (_, index) => index + 1),
          updated_at: '2026-06-01T12:00:00.000Z',
        },
        now,
        options,
      ),
    ).toBeNull();

    expect(
      evaluatePaidReengagementCandidate(
        { ...baseEnrollment, product: 'team-assessment' },
        now,
        options,
      ),
    ).toBeNull();
  });

  it('recognizes paid In-Depth completions across current and legacy shapes', () => {
    expect(isCompletedInDepthProfile({ readiness_version: 'v4' })).toBe(true);
    expect(isCompletedInDepthProfile({ readiness_answers: Array.from({ length: 48 }, () => 1) })).toBe(true);
    expect(isCompletedInDepthProfile({ readiness_max_score: 192 })).toBe(true);
    expect(isCompletedInDepthProfile({ readiness_version: 'v3', readiness_answers: [1, 2, 3], readiness_max_score: 48 })).toBe(false);
  });

  it('uses stable dedupe keys, including module-specific stalled reminders', () => {
    const options = resolvePaidReengagementOptions();
    const notStarted = evaluatePaidReengagementCandidate(
      baseEnrollment,
      new Date('2026-06-24T12:00:00.000Z'),
      options,
    );
    const stalled = evaluatePaidReengagementCandidate(
      {
        ...baseEnrollment,
        current_module: 5,
        completed_modules: [1, 2, 3, 4],
        updated_at: '2026-06-15T12:00:00.000Z',
      },
      new Date('2026-06-23T12:00:00.000Z'),
      options,
    );

    expect(notStarted && paidReengagementDedupeKey(notStarted)).toBe(
      'paid-reengagement:foundation_not_started:enroll-1',
    );
    expect(stalled && paidReengagementDedupeKey(stalled)).toBe(
      'paid-reengagement:foundation_stalled:enroll-1:m5',
    );
  });

  it('parses and clamps monitor environment options', () => {
    vi.stubEnv('PAID_REENGAGEMENT_FOUNDATION_NOT_STARTED_AFTER_DAYS', '0');
    vi.stubEnv('PAID_REENGAGEMENT_FOUNDATION_STALLED_AFTER_DAYS', '999');
    vi.stubEnv('PAID_REENGAGEMENT_IN_DEPTH_WAITING_AFTER_DAYS', 'bad');
    vi.stubEnv('PAID_REENGAGEMENT_LOOKBACK_DAYS', '0');
    vi.stubEnv('PAID_REENGAGEMENT_MAX_CHECKS', '9999');

    expect(resolvePaidReengagementOptions()).toEqual({
      foundationNotStartedAfterDays: 1,
      foundationStalledAfterDays: 60,
      inDepthWaitingAfterDays: 3,
      lookbackDays: 1,
      maxChecks: 500,
    });
  });

  it('keeps documented default windows stable', () => {
    const options = resolvePaidReengagementOptions();
    expect(options.foundationNotStartedAfterDays).toBe(DEFAULT_FOUNDATION_NOT_STARTED_AFTER_DAYS);
    expect(options.foundationStalledAfterDays).toBe(DEFAULT_FOUNDATION_STALLED_AFTER_DAYS);
  });
});
