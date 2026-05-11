// /courses/foundation/program/onboarding — Server Component
// Enrollments gate: non-enrolled users redirect to purchase.
// The onboarding survey runs inside the course layout (sidebar present).

import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { CourseShellWrapper } from "@/components/lms/CourseShellWrapper";
import { OnboardingSurvey } from './OnboardingSurvey';

export const metadata = {
  title: 'Onboarding | AiBI-Foundation',
};

export default async function OnboardingPage() {
  const enrollment = await getEnrollment();

  // ONBD-01: Non-enrolled visitors go to purchase
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Onboarding']}>
      <OnboardingSurvey enrollmentId={enrollment.id} />
    </CourseShellWrapper>
  );
}
