// /courses/foundation/program/post-assessment — Post-course "Measure Your Growth" assessment.
// Framed as growth measurement, not a readiness screener.
// Gate: all 12 modules must be completed (enforced client-side and server-side).
// Uses the v2 question pool with the same rotation logic as the public assessment.
// On completion: shows GrowthComparison + TransformationCard with pre/post delta.
// Dev bypass: all 12 modules treated as complete; pre-score loaded from localStorage.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { PostAssessmentClient } from './_PostAssessmentClient';

export const metadata: Metadata = {
  title: 'Measure Your Growth | AiBI-Foundation | The AI Banking Institute',
  description:
    'Take the post-course assessment to measure how your AI readiness has changed after completing the AiBI-Foundation Banking AI Practitioner course.',
};

const REQUIRED_MODULES = 12;

export default async function PostAssessmentPage() {
  const enrollment = await getEnrollment();

  // Not enrolled — send to purchase
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  const completedModules = enrollment.completed_modules ?? [];
  const allComplete = Array.from(
    { length: REQUIRED_MODULES },
    (_, i) => i + 1,
  ).every((n) => completedModules.includes(n));

  // Not all modules done — send back to course overview
  if (!allComplete) {
    redirect('/courses/foundation/program');
  }

  return (
    <PostAssessmentClient
      enrollmentId={enrollment.id}
    />
  );
}
