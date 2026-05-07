// /courses/aibi-p/settings — Server Component
// Allows an enrolled learner to update their onboarding answers at any time.
// Redirects to /purchase if user is not enrolled.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { OnboardingSettings } from './OnboardingSettings';

export const metadata: Metadata = {
  title: 'Profile Settings | AiBI-Practitioner',
};

export default async function SettingsPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/courses/aibi-p/purchase');
  }

  return (
    <div className="mx-auto px-8 lg:px-16 py-12">
      <OnboardingSettings
        enrollmentId={enrollment.id}
        currentAnswers={enrollment.onboarding_answers}
      />
    </div>
  );
}
