// /courses/foundation/program layout — onboarding gate only.
//
// The legacy CourseSidebar + MobileSidebarDrawer chrome was retired
// when the LMS prototype reskin landed (PR #52–#56). The new chrome
// lives inside <CourseShell>, which each page in this tree wraps
// individually. Keeping a second sidebar here produced the documented
// double-sidebar artifact during the migration.
//
// What this layout still does:
//   ONBD-02 — enrolled users with null onboarding_answers are
//   redirected to /onboarding before they can reach any module.

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getEnrollment } from './_lib/getEnrollment';

interface CourseLayoutProps {
  readonly children: ReactNode;
}

// Paths that must never trigger the onboarding redirect (avoids infinite loop).
const ONBOARDING_EXEMPT_SUFFIXES = ['/onboarding', '/settings', '/purchase'];

export default async function CourseLayout({ children }: CourseLayoutProps) {
  const enrollment = await getEnrollment();

  if (enrollment !== null && enrollment.onboarding_answers === null) {
    const headersList = headers();
    const pathname = headersList.get('x-pathname') ?? '';

    const isExempt = ONBOARDING_EXEMPT_SUFFIXES.some((suffix) =>
      pathname.endsWith(suffix),
    );

    if (!isExempt) {
      redirect('/courses/foundation/program/onboarding');
    }
  }

  return <>{children}</>;
}
