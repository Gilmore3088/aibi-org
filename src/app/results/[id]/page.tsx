// /results/[id] — owner-bound assessment brief return URL.
//
// Auth: requires Supabase Auth session. Unauthenticated visits redirect
// to signin with `next=/results/[id]` so the user lands back here.
//
// Ownership: defense-in-depth — explicit auth.uid() === params.id check.
// RLS would also enforce this on user_profiles, but the loader uses the
// service-role client so we MUST gate in code.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-4-return-url.md

import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import { loadAssessmentResponse } from '@/lib/assessment/load-response';
import { ResultsViewV2 } from '@/app/assessment/_components/ResultsViewV2';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ResultsPageProps {
  readonly params: { readonly id: string };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  if (!isSupabaseConfigured()) notFound();

  const cookieStore = cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = encodeURIComponent(`/results/${params.id}`);
    redirect(`/auth/login?next=${next}`);
  }

  if (user.id !== params.id) notFound();

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
