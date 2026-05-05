import { notFound } from 'next/navigation';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getTierV2 } from '@content/assessments/v2/scoring';
import { Cover } from '../_components/Cover';
import '../print.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PrintPageProps {
  readonly params: { readonly id: string };
}

export default async function PrintPage({ params }: PrintPageProps) {
  if (!isSupabaseConfigured()) notFound();

  const client = createServiceRoleClient();
  const { data: profile, error } = await client
    .from('user_profiles')
    .select(
      'id, email, readiness_score, readiness_max_score, readiness_tier_id, readiness_dimension_breakdown, readiness_at',
    )
    .eq('id', params.id)
    .single();

  if (error || !profile) notFound();
  if (!profile.readiness_tier_id) notFound();

  const tier = getTierV2(profile.readiness_score ?? 0);
  const generatedAt = new Date();

  // first_name + institution_name are not persisted on user_profiles
  // currently; they live only in client-side state during the
  // assessment flow. The PDF currently renders without them. Phase F
  // adds persistence + back-fill.
  return (
    <main>
      <Cover
        tier={tier}
        tierId={profile.readiness_tier_id}
        score={profile.readiness_score ?? 0}
        maxScore={profile.readiness_max_score ?? 48}
        firstName={null}
        institutionName={null}
        generatedAt={generatedAt}
      />
      {/* Subsequent tasks add ExecSummary, LensedImplications, Strengths,
          GapDetail, FirstMove, StarterPromptAndPlan, FutureVisionPage,
          NextStepsTrio, GovernanceCitations, BackCover. */}
    </main>
  );
}
