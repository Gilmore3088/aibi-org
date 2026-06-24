import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_STRANDED_BUYER_ALERT_AFTER_HOURS,
  evaluateStrandedBuyerCandidate,
  resolveStrandedBuyerOptions,
  strandedBuyerDedupeKey,
  type StrandedBuyerEnrollmentRow,
} from './stranded-buyers';

const baseEnrollment: StrandedBuyerEnrollmentRow = {
  id: 'enroll-1',
  email: 'buyer@example.com',
  product: 'foundation',
  stripe_session_id: 'cs_test_123',
  user_id: 'user-1',
  enrolled_at: '2026-06-23T08:00:00.000Z',
  created_at: '2026-06-23T08:00:00.000Z',
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('stranded buyer monitor helpers', () => {
  it('flags an older paid enrollment when the auth user has never signed in', () => {
    const candidate = evaluateStrandedBuyerCandidate(
      baseEnrollment,
      { created_at: '2026-06-23T08:00:10.000Z', last_sign_in_at: undefined },
      new Date('2026-06-23T13:00:00.000Z'),
      DEFAULT_STRANDED_BUYER_ALERT_AFTER_HOURS,
    );

    expect(candidate).toMatchObject({
      reason: 'never_signed_in',
      enrolledAt: baseEnrollment.enrolled_at,
      ageHours: 5,
      authCreatedAt: '2026-06-23T08:00:10.000Z',
    });
  });

  it('does not flag enrollments inside the waiting window or users who have signed in', () => {
    expect(
      evaluateStrandedBuyerCandidate(
        baseEnrollment,
        { created_at: '2026-06-23T08:00:10.000Z', last_sign_in_at: undefined },
        new Date('2026-06-23T10:00:00.000Z'),
        DEFAULT_STRANDED_BUYER_ALERT_AFTER_HOURS,
      ),
    ).toBeNull();

    expect(
      evaluateStrandedBuyerCandidate(
        baseEnrollment,
        {
          created_at: '2026-06-23T08:00:10.000Z',
          last_sign_in_at: '2026-06-23T08:05:00.000Z',
        },
        new Date('2026-06-23T13:00:00.000Z'),
        DEFAULT_STRANDED_BUYER_ALERT_AFTER_HOURS,
      ),
    ).toBeNull();
  });

  it('flags missing auth users because those buyers cannot recover without help', () => {
    const candidate = evaluateStrandedBuyerCandidate(
      baseEnrollment,
      null,
      new Date('2026-06-23T13:00:00.000Z'),
      DEFAULT_STRANDED_BUYER_ALERT_AFTER_HOURS,
    );

    expect(candidate?.reason).toBe('auth_user_missing');
  });

  it('also flags stranded $99 In-Depth buyers after the waiting window', () => {
    const candidate = evaluateStrandedBuyerCandidate(
      { ...baseEnrollment, id: 'enroll-98', product: 'in-depth-assessment' },
      { created_at: '2026-06-23T08:00:10.000Z', last_sign_in_at: undefined },
      new Date('2026-06-23T13:00:00.000Z'),
      DEFAULT_STRANDED_BUYER_ALERT_AFTER_HOURS,
    );

    expect(candidate).toMatchObject({
      reason: 'never_signed_in',
      enrollment: expect.objectContaining({ product: 'in-depth-assessment' }),
    });
  });

  it('parses and clamps monitor environment options', () => {
    vi.stubEnv('STRANDED_BUYER_ALERT_AFTER_HOURS', '0');
    vi.stubEnv('STRANDED_BUYER_LOOKBACK_DAYS', '999');
    vi.stubEnv('STRANDED_BUYER_MAX_CHECKS', 'not-a-number');

    expect(resolveStrandedBuyerOptions()).toEqual({
      alertAfterHours: 1,
      lookbackDays: 90,
      maxChecks: 100,
    });
  });

  it('uses stable dedupe keys per enrollment', () => {
    expect(strandedBuyerDedupeKey('enroll-1')).toBe('stranded-buyer:enroll-1');
  });
});
