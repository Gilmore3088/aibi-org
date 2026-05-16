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
import { getTierV2, getTierInDepth } from '@content/assessments/v2/scoring';
import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import { parseRole, type Role } from '@content/assessments/v2/role';

export interface AssessmentResponseLoaded {
  readonly profileId: string;
  readonly email: string;
  readonly score: number;
  readonly maxScore: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly readinessAt: string;
  readonly role: Role | null;
}

export async function loadAssessmentResponse(
  id: string,
): Promise<AssessmentResponseLoaded | null> {
  if (!isSupabaseConfigured()) return null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  // The id parameter is user_profiles.id, used as a bearer token. The
  // UUID is unguessable; possessing the URL is the access credential.
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('user_profiles')
    .select(
      'id, email, readiness_score, readiness_max_score, readiness_tier_id, readiness_dimension_breakdown, readiness_at, role',
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  if (data.readiness_tier_id == null) return null;
  if (typeof data.readiness_score !== 'number') return null;
  if (!data.readiness_dimension_breakdown) return null;

  // Pick the right tier function based on the stored max. Free flow
  // stores max=48 (12-48 raw range); In-Depth stores max=192 (48-192
  // raw range) after the 2026-05-12 runner fix. We accept either so
  // historical and future rows both render.
  const storedMax = (data.readiness_max_score as number | null) ?? 48;
  const tier =
    storedMax > 48
      ? getTierInDepth(data.readiness_score as number, storedMax)
      : getTierV2(data.readiness_score as number);
  const breakdown = data.readiness_dimension_breakdown as Record<
    Dimension,
    DimensionScore
  >;

  return {
    profileId: data.id as string,
    email: data.email as string,
    score: data.readiness_score,
    maxScore: storedMax,
    tier,
    tierId: tier.id,
    dimensionBreakdown: breakdown,
    readinessAt: (data.readiness_at as string) ?? new Date().toISOString(),
    role: parseRole((data as { role?: unknown }).role),
  };
}
