import type { EnrollmentData, EnrollmentResult } from './getEnrollment';
import { isFetchError } from './getEnrollment';

export const COURSE_PURCHASE_PATH = '/courses/foundation/program/purchase';

export type CourseOverviewAccess =
  | {
      action: 'render';
      enrollment: EnrollmentData | null;
      fetchFailed: boolean;
    }
  | {
      action: 'redirect';
      href: typeof COURSE_PURCHASE_PATH;
    };

export function resolveCourseOverviewAccess(
  result: EnrollmentResult,
): CourseOverviewAccess {
  if (isFetchError(result)) {
    return {
      action: 'render',
      enrollment: null,
      fetchFailed: true,
    };
  }

  if (result === null) {
    return {
      action: 'redirect',
      href: COURSE_PURCHASE_PATH,
    };
  }

  return {
    action: 'render',
    enrollment: result,
    fetchFailed: false,
  };
}
