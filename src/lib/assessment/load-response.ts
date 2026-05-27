// Server-only. Loads a user_profiles row by id and shapes it into the
// props the results view expects. Recomputes tier + dimensions live so a
// future scoring/copy update propagates to historical visits.
//
// Defense-in-depth: this helper does NOT enforce ownership. Callers
// (the /results/[id] route) MUST verify the requesting auth.uid()
// matches the row's id before exposing the result.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-4-return-url.md
//
// 2026-05-27: version detection added. v3 rows (readiness_version='v3')
// return v3-shaped tier + dimension keys; v2 / v1 / null versions
// continue to return v2 shape.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getTierV2, getTierInDepth } from '@content/assessments/v2/scoring';
import { getTierV3 } from '@content/assessments/v3/scoring';
import type { Tier as TierV2, DimensionScore as DimensionScoreV2 } from '@content/assessments/v2/scoring';
import type { Tier as TierV3, DimensionScore as DimensionScoreV3 } from '@content/assessments/v3/scoring';
import type { Dimension as DimensionV2 } from '@content/assessments/v2/types';
import type { Dimension as DimensionV3 } from '@content/assessments/v3/types';
import { parseRole, type Role } from '@content/assessments/v2/role';

export type AssessmentResponseVersion = 'v1' | 'v2' | 'v3';

interface AssessmentResponseBase {
  readonly profileId: string;
  readonly email: string;
  readonly score: number;
  readonly maxScore: number;
  readonly readinessAt: string;
  readonly role: Role | null;
}

export interface AssessmentResponseLoadedV2 extends AssessmentResponseBase {
  readonly version: 'v1' | 'v2';
  readonly tier: TierV2;
  readonly tierId: TierV2['id'];
  readonly dimensionBreakdown: Record<DimensionV2, DimensionScoreV2>;
}

export interface AssessmentResponseLoadedV3 extends AssessmentResponseBase {
  readonly version: 'v3';
  readonly tier: TierV3;
  readonly tierId: TierV3['id'];
  readonly dimensionBreakdown: Record<DimensionV3, DimensionScoreV3>;
}

export type AssessmentResponseLoaded = AssessmentResponseLoadedV2 | AssessmentResponseLoadedV3;

export async function loadAssessmentResponse(
  id: string,
): Promise<AssessmentResponseLoaded | null> {
  if (!isSupabaseConfigured()) return null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  // The id parameter is user_profiles.id, used as a bearer token.
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('user_profiles')
    .select(
      'id, email, readiness_score, readiness_max_score, readiness_tier_id, readiness_dimension_breakdown, readiness_version, readiness_at, role',
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  if (data.readiness_tier_id == null) return null;
  if (typeof data.readiness_score !== 'number') return null;
  if (!data.readiness_dimension_breakdown) return null;

  const storedMax = (data.readiness_max_score as number | null) ?? 48;
  const storedVersion = (data.readiness_version as string | null) ?? 'v2';
  const score = data.readiness_score as number;

  const base: AssessmentResponseBase = {
    profileId: data.id as string,
    email: data.email as string,
    score,
    maxScore: storedMax,
    readinessAt: (data.readiness_at as string) ?? new Date().toISOString(),
    role: parseRole((data as { role?: unknown }).role),
  };

  // v3 free funnel: stores 12-48 raw scores with v3 dimension keys.
  if (storedVersion === 'v3' && storedMax === 48) {
    const tier = getTierV3(score);
    return {
      ...base,
      version: 'v3',
      tier,
      tierId: tier.id,
      dimensionBreakdown: data.readiness_dimension_breakdown as Record<
        DimensionV3,
        DimensionScoreV3
      >,
    };
  }

  // v2 / v1 fallback: free flow (max=48) vs In-Depth (max=192).
  const tier =
    storedMax > 48
      ? getTierInDepth(score, storedMax)
      : getTierV2(score);
  return {
    ...base,
    version: storedVersion === 'v1' ? 'v1' : 'v2',
    tier,
    tierId: tier.id,
    dimensionBreakdown: data.readiness_dimension_breakdown as Record<
      DimensionV2,
      DimensionScoreV2
    >,
  };
}
