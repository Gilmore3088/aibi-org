// /courses/foundation/program/settings — Server Component
// Allows an enrolled learner to update their onboarding answers at any time.
// Redirects to /purchase if user is not enrolled.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { CourseShellWrapper } from "@/components/lms/CourseShellWrapper";
import { OnboardingSettings } from './OnboardingSettings';

export const metadata: Metadata = {
  title: 'Profile Settings | AiBI-Foundation',
};

export default async function SettingsPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Settings']}>
      <OnboardingSettings
        enrollmentId={enrollment.id}
        currentAnswers={enrollment.onboarding_answers}
      />
    </CourseShellWrapper>
  );
}
