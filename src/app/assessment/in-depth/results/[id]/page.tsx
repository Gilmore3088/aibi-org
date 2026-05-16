// /assessment/in-depth/results/[id] — rich In-Depth Briefing surface.
//
// Bearer-token URL pattern matching /results/[id]: the UUID itself is the
// access credential. We do NOT require auth here — the recipient proves
// access by holding the URL. (Same shape as the free-flow results page.)
//
// Loads the same user_profiles row that the free results page reads, but
// renders the paid In-Depth Briefing surface instead of ResultsViewV2.
// Both views are valid renderings of the same data; the In-Depth route is
// where the 48-question submission lands.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { loadAssessmentResponse } from '@/lib/assessment/load-response';
import { InDepthBriefingView } from './_components/InDepthBriefingView';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'In-Depth AI Readiness Briefing | The AI Banking Institute',
  description:
    'Your personalized In-Depth Briefing — composite score, dimension deep dives, regulatory frame, and a sequenced ninety-day action register.',
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
