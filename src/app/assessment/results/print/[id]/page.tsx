import { notFound, redirect } from 'next/navigation';
import { loadAssessmentResponse } from '@/lib/assessment/load-response';
import { PrintReport } from '../_components/PrintReport';
import '../print.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PrintPageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export default async function PrintPage(props: PrintPageProps) {
  const params = await props.params;

  // Reuse the same loader the on-screen /results/[id] page uses: it does
  // version detection (v2/v3/v4), the previous_id fallback for re-keyed
  // profiles, and the fail-open column retry. This is what the print route
  // was missing — it hard-assumed v2 scoring + v2 dimension keys and threw on
  // the v3 data the free funnel has stored since 2026-05-27.
  const response = await loadAssessmentResponse(params.id);
  if (!response) notFound();

  // The paid In-Depth (v4) renders on its own results surface (5-band
  // maturity, v4 dimension keys) and is never emitted through this v2/v3 print
  // route. A profile can flip free→paid (user_profiles is keyed by email and
  // upsertReadinessResult overwrites), which orphans old free /print links.
  // Mirror /results/[id]: send those to the in-depth surface instead of
  // crashing on the v4 shape or 404-ing a converted user.
  if (response.version === 'v4') {
    redirect(`/assessment/in-depth/results/${params.id}`);
  }

  return (
    <PrintReport
      version={response.version === 'v3' ? 'v3' : 'v2'}
      tier={response.tier}
      tierId={response.tierId}
      score={response.score}
      maxScore={response.maxScore}
      breakdown={response.dimensionBreakdown}
      generatedAt={new Date()}
      firstName={null}
      institutionName={null}
    />
  );
}
