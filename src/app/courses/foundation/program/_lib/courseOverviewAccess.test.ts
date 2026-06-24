import { describe, expect, it } from 'vitest';
import type { EnrollmentData } from './getEnrollment';
import {
  COURSE_PURCHASE_PATH,
  resolveCourseOverviewAccess,
} from './courseOverviewAccess';

const enrollment: EnrollmentData = {
  id: 'enrollment-1',
  user_id: 'user-1',
  completed_modules: [1, 2],
  current_module: 3,
  enrolled_at: '2026-06-23T12:00:00.000Z',
  onboarding_answers: {
    uses_m365: 'not_sure',
    personal_ai_subscriptions: [],
    primary_role: 'compliance',
  },
};

describe('resolveCourseOverviewAccess', () => {
  it('redirects signed-in users without a Foundation enrollment to purchase', () => {
    expect(resolveCourseOverviewAccess(null)).toEqual({
      action: 'redirect',
      href: COURSE_PURCHASE_PATH,
    });
  });

  it('renders the default progress warning when the enrollment fetch fails', () => {
    expect(resolveCourseOverviewAccess({ error: 'fetch_failed' })).toEqual({
      action: 'render',
      enrollment: null,
      fetchFailed: true,
    });
  });

  it('renders the course overview for enrolled learners', () => {
    expect(resolveCourseOverviewAccess(enrollment)).toEqual({
      action: 'render',
      enrollment,
      fetchFailed: false,
    });
  });
});
