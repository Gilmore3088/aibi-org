// Server-only. Loads a user_profiles row by id and shapes it into the
// props ResultsViewV2 expects. Recomputes tier + dimensions live so a
// future scoring/copy update propagates to historical visits.
//
// Defense-in-depth: this helper does NOT enforce ownership. Callers
// (the /results/[id] route) MUST verify the requesting auth.uid()
// matches the row's id before exposing the result.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-4-return-url.md

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getTierV2 } from '@content/assessments/v2/scoring';
import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';

export interface AssessmentResponseLoaded {
  readonly profileId: string;
  readonly email: string;
  readonly score: number;
  readonly maxScore: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly readinessAt: string;
}

export async function loadAssessmentResponse(
  id: string,
): Promise<AssessmentResponseLoaded | null> {
  if (!isSupabaseConfigured()) return null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  // The id parameter is the Supabase Auth user id (auth.uid()) coming from
  // /results/[id]. We look up the profile row by user_id, with a fallback
  // to id for legacy rows that pre-date the auth-account provisioning step.
  const client = createServiceRoleClient();
  let { data, error } = await client
    .from('user_profiles')
    .select(
      'id, email, readiness_score, readiness_max_score, readiness_tier_id, readiness_dimension_breakdown, readiness_at',
    )
    .eq('user_id', id)
    .maybeSingle();

  if (!data && !error) {
    const fallback = await client
      .from('user_profiles')
      .select(
        'id, email, readiness_score, readiness_max_score, readiness_tier_id, readiness_dimension_breakdown, readiness_at',
      )
      .eq('id', id)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) return null;
  if (data.readiness_tier_id == null) return null;
  if (typeof data.readiness_score !== 'number') return null;
  if (!data.readiness_dimension_breakdown) return null;

  const tier = getTierV2(data.readiness_score);
  const breakdown = data.readiness_dimension_breakdown as Record<
    Dimension,
    DimensionScore
  >;

  return {
    profileId: data.id as string,
    email: data.email as string,
    score: data.readiness_score,
    maxScore: (data.readiness_max_score as number | null) ?? 48,
    tier,
    tierId: tier.id,
    dimensionBreakdown: breakdown,
    readinessAt: (data.readiness_at as string) ?? new Date().toISOString(),
  };
}
