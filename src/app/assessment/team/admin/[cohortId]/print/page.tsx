import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { TeamAdminDashboard } from '../../../_components/TeamAdminDashboard';
import { loadTeamAdminData } from '../../_lib/loadTeamAdmin';

export const metadata: Metadata = {
  title: 'Team Assessment Printable Report | The AI Banking Institute',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: Promise<{ readonly cohortId: string }>;
}

async function origin(): Promise<string> {
  if (process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  const h = await headers();
  const host = h.get('host') ?? 'aibankinginstitute.com';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export default async function TeamAssessmentPrintPage({ params }: PageProps) {
  const { cohortId } = await params;
  const nextPath = `/assessment/team/admin/${cohortId}/print`;
  const { cohort, responses } = await loadTeamAdminData(cohortId, nextPath);
  const siteOrigin = await origin();

  return (
    <TeamAdminDashboard
      cohort={cohort}
      responses={responses}
      participantUrl={`${siteOrigin}/assessment/team/${cohort.public_token}`}
      printMode
    />
  );
}
