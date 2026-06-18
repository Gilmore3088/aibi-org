import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMaturityBand } from '@content/assessments/v4/scoring';
import { parseRoleV4 } from '@content/assessments/v4/roles';
import { getTeamParticipantReport } from '@/lib/team-assessment/db';
import type { DimensionScoreSerializedV4 } from '@/lib/assessment/load-response';
import type { Dimension } from '@content/assessments/v4/types';
import { PaidReport } from '@/app/assessment/in-depth/results/[id]/_components/PaidReport';

export const metadata: Metadata = {
  title: 'Team Assessment Personal Report | The AI Banking Institute',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  readonly params: Promise<{ readonly responseId: string }>;
}

export default async function TeamAssessmentResultPage({ params }: PageProps) {
  const { responseId } = await params;
  const report = await getTeamParticipantReport(responseId);
  if (!report) notFound();

  return (
    <PaidReport
      profileId={report.personal_report_token}
      email={report.participant_email ?? ''}
      score={report.score}
      band={getMaturityBand(report.score)}
      role={parseRoleV4(report.role)}
      dimensionBreakdown={
        report.dimension_breakdown as Record<Dimension, DimensionScoreSerializedV4>
      }
      readinessAt={report.completed_at}
      institutionContext={{ institution_name: report.cohort.institution_name }}
      notesEnabled={false}
      personalizationEnabled={false}
    />
  );
}
