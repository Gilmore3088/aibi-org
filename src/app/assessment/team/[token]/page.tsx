import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTeamCohortByToken } from '@/lib/team-assessment/db';
import { TeamAssessmentClient } from '../_components/TeamAssessmentClient';

export const metadata: Metadata = {
  title: 'Team AI Readiness Assessment | The AI Banking Institute',
  description: 'Complete your institution’s paid Team AI Readiness Assessment.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: Promise<{ readonly token: string }>;
}

export default async function TeamAssessmentParticipantPage({ params }: PageProps) {
  const { token } = await params;
  const cohort = await getTeamCohortByToken(token);
  if (!cohort || cohort.status !== 'active') notFound();

  return (
    <TeamAssessmentClient
      token={token}
      institutionName={cohort.institution_name}
      seatsPurchased={cohort.seats_purchased}
    />
  );
}
