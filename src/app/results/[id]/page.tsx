// /results/[id] — bearer-token-style results page.
//
// The id segment is the user_profiles row UUID. The UUID itself is the
// access token: 122 bits of entropy makes it unguessable, and the
// recipient proved ownership by receiving the email containing the URL.
// Treating the URL as a shared-link credential (Calendly, Notion, Google
// Docs "anyone with the link") removes the magic-link/login round-trip
// that was breaking the assessment-results email flow.
//
// If we later want a fully authenticated dashboard view of the same
// data, that's a separate route that requires login — not this one.

import { notFound } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { loadAssessmentResponse } from '@/lib/assessment/load-response';
import { ResultsViewV2 } from '@/app/assessment/_components/ResultsViewV2';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ResultsPageProps {
  readonly params: { readonly id: string };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  if (!isSupabaseConfigured()) notFound();

  const response = await loadAssessmentResponse(params.id);
  if (!response) notFound();

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] py-12 px-4">
      <ResultsViewV2
        score={response.score}
        tier={response.tier}
        tierId={response.tierId}
        dimensionBreakdown={response.dimensionBreakdown}
        email={response.email}
        firstName={null}
        institutionName={null}
        profileId={response.profileId}
      />
    </main>
  );
}
