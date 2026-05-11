// /courses/foundation/program/onboarding — Server Component
// Enrollments gate: non-enrolled users redirect to purchase.
//
// Intentionally chromeless (no CourseShellWrapper). OnboardingSurvey
// renders its own two-column layout (SurveyBranding sidebar + form) and
// needs the full viewport. Wrapping it inside the LMS shell's 1080px
// column collapses the layout to a blank page. Modules are locked until
// onboarding completes, so the course sidebar would be useless here anyway.

import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { OnboardingSurvey } from './OnboardingSurvey';

export const metadata = {
  title: 'Onboarding | AiBI-Foundation',
};

export default async function OnboardingPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return <OnboardingSurvey enrollmentId={enrollment.id} />;
}
