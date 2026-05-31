// /assessment/in-depth/results/[id] — In-Depth Diagnostic results surface.
//
// Bearer-token URL pattern matching /results/[id]: the UUID itself is the
// access credential. We do NOT require auth here — the recipient proves
// access by holding the URL. (Same shape as the free-flow results page.)
//
// Version routing:
//   v4 → PaidReport (the 14-section diagnostic per spec Section 7)
//   v2/v1 → InDepthBriefingView (legacy briefing — kept for historical takes)
//   v3 → notFound() (free-funnel rows do not belong on this route)

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { loadAssessmentResponse } from '@/lib/assessment/load-response';
import { InDepthBriefingView } from './_components/InDepthBriefingView';
import { PaidReport } from './_components/PaidReport';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'In-Depth AI Readiness Diagnostic | The AI Banking Institute',
  description:
    'Your personalized In-Depth Diagnostic — overall score, eight-dimension scorecard, strongest and weakest dimensions, role-specific action plan, and a sequenced 30/60/90 day roadmap.',
  robots: { index: false, follow: false },
};

interface PageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export default async function InDepthResultsPage({ params }: PageProps) {
  if (!isSupabaseConfigured()) notFound();
  const { id } = await params;

  const response = await loadAssessmentResponse(id);
  if (!response) notFound();
  // Free-funnel rows do not belong on the paid surface.
  if (response.version === 'v3') notFound();

  if (response.version === 'v4') {
    return (
      <PaidReport
        profileId={response.profileId}
        email={response.email}
        score={response.score}
        band={response.band}
        role={response.role}
        dimensionBreakdown={response.dimensionBreakdown}
        readinessAt={response.readinessAt}
        institutionContext={response.institutionContext}
      />
    );
  }

  // v2 / v1 — legacy In-Depth Briefing.
  return (
    <InDepthBriefingView
      profileId={response.profileId}
      email={response.email}
      score={response.score}
      maxScore={response.maxScore}
      tier={response.tier}
      dimensionBreakdown={response.dimensionBreakdown}
      readinessAt={response.readinessAt}
      role={response.role}
    />
  );
}
