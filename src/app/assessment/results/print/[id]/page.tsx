import { notFound } from 'next/navigation';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getTierV2, getTierInDepth } from '@content/assessments/v2/scoring';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import { Cover } from '../_components/Cover';
import { ExecSummary } from '../_components/ExecSummary';
import { LensedImplications } from '../_components/LensedImplications';
import { StrengthsAndGaps } from '../_components/StrengthsAndGaps';
import { GapDetail } from '../_components/GapDetail';
import { FirstMove } from '../_components/FirstMove';
import { StarterPromptAndPlan } from '../_components/StarterPromptAndPlan';
import { FutureVisionPage } from '../_components/FutureVisionPage';
import { NextStepsTrio } from '../_components/NextStepsTrio';
import { GovernanceCitations } from '../_components/GovernanceCitations';
import { BackCover } from '../_components/BackCover';
import '../print.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PrintPageProps {
  readonly params: { readonly id: string };
}

interface RankedDim {
  readonly id: Dimension;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

function rankWeakest(
  breakdown: Record<Dimension, DimensionScore>,
): ReadonlyArray<RankedDim> {
  return (Object.entries(breakdown) as [Dimension, DimensionScore][])
    .filter(([, d]) => d.maxScore > 0)
    .map(([id, d]) => ({
      id,
      score: d.score,
      maxScore: d.maxScore,
      pct: d.score / d.maxScore,
    }))
    .sort((a, b) => a.pct - b.pct);
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
  if (!profile.readiness_dimension_breakdown) notFound();

  // Free flow stores max=48 (12–48 range); In-Depth stores max=192
  // (48–192 range). Pick the matching tier function.
  const storedMax = (profile.readiness_max_score as number | null) ?? 48;
  const tier =
    storedMax > 48
      ? getTierInDepth(profile.readiness_score ?? 0, storedMax)
      : getTierV2(profile.readiness_score ?? 0);
  const generatedAt = new Date();
  const breakdown = profile.readiness_dimension_breakdown as Record<Dimension, DimensionScore>;
  const ranked = rankWeakest(breakdown);
  const topTwoCriticalGaps = ranked.slice(0, 2);
  const focusGapId = ranked[0]?.id;

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
      <ExecSummary
        tier={tier}
        tierId={profile.readiness_tier_id}
        score={profile.readiness_score ?? 0}
        maxScore={profile.readiness_max_score ?? 48}
      />
      <LensedImplications tierId={profile.readiness_tier_id} />
      <StrengthsAndGaps dimensionBreakdown={breakdown} />
      {topTwoCriticalGaps.map((dim, idx) => (
        <GapDetail
          key={dim.id}
          dimensionId={dim.id}
          score={dim.score}
          maxScore={dim.maxScore}
          pageNumber={5 + idx}
        />
      ))}
      {focusGapId ? (
        <>
          <FirstMove focusGapId={focusGapId} />
          <StarterPromptAndPlan focusGapId={focusGapId} />
        </>
      ) : null}
      <FutureVisionPage />
      <NextStepsTrio tierId={profile.readiness_tier_id} />
      <GovernanceCitations />
      <BackCover />
    </main>
  );
}
