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

import {
  createServiceRoleClient,
  isSupabaseConfigured,
  isSupabaseServiceRoleConfigured,
} from '@/lib/supabase/client';
import { getTierV2, getTierInDepth } from '@content/assessments/v2/scoring';
import { getTierV3 } from '@content/assessments/v3/scoring';
import { getMaturityBand } from '@content/assessments/v4/scoring';
import type { Tier as TierV2, DimensionScore as DimensionScoreV2 } from '@content/assessments/v2/scoring';
import type { Tier as TierV3, DimensionScore as DimensionScoreV3 } from '@content/assessments/v3/scoring';
import type { Dimension as DimensionV2 } from '@content/assessments/v2/types';
import type { Dimension as DimensionV3 } from '@content/assessments/v3/types';
import type { Dimension as DimensionV4, MaturityBand } from '@content/assessments/v4/types';
import { parseRole, type Role } from '@content/assessments/v2/role';
import { parseRoleV4, type RoleV4 } from '@content/assessments/v4/roles';
import { normalizeStoredRoleToFreeRole, type FreeRole } from '@content/assessments/v3/roles';
import { parseFreeAssetBand, type FreeAssetBand } from '@content/assessments/v3/asset-bands';

export type AssessmentResponseVersion = 'v1' | 'v2' | 'v3' | 'v4';

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

export interface AssessmentResponseLoadedV3 extends Omit<AssessmentResponseBase, 'role'> {
  readonly version: 'v3';
  // v3 persists the un-collapsed free role (operations, retail-branch,
  // it-infosec are distinct here, unlike the v2 Role union).
  readonly role: FreeRole | null;
  readonly tier: TierV3;
  readonly tierId: TierV3['id'];
  readonly dimensionBreakdown: Record<DimensionV3, DimensionScoreV3>;
  // Optional asset band shared at the email gate; stored in
  // institution_context.asset_band_free. Context only — never scoring.
  readonly assetBandFree: FreeAssetBand | null;
}

// v4 paid In-Depth: normalized 0-100 score, 5-band maturity, 8 strategic
// dimensions. dimensionBreakdown uses the canonical serialized shape
// {score, maxScore, label} with score = the normalized 0-100 per
// dimension and maxScore = 100. The role taxonomy is v4 (10 ids).
export interface DimensionScoreSerializedV4 {
  readonly score: number;
  readonly maxScore: number;
  readonly label: string;
}

export interface InstitutionContext {
  readonly first_name?: string;
  readonly last_name?: string;
  readonly institution_name?: string;
  /** FDIC-style asset band: 'sub-300M' | '300M-1B' | '1B-10B' | '10B-plus' */
  readonly asset_band?: string;
  readonly asset_size_usd_millions?: number;
  /** 2-letter state code */
  readonly state?: string;
  /** Primary federal regulator: 'OCC' | 'FDIC' | 'FRB' | 'NCUA' | 'state' */
  readonly regulator?: string;
  /** FTE count in the respondent's department */
  readonly dept_fte?: number;
  readonly primary_core?: string;
  readonly primary_los?: string;
  readonly primary_marketing?: string;
  readonly primary_fraud?: string;
}

export interface AssessmentResponseLoadedV4 {
  readonly profileId: string;
  readonly email: string;
  readonly score: number;
  readonly maxScore: 100;
  readonly readinessAt: string;
  readonly role: RoleV4 | null;
  readonly version: 'v4';
  readonly band: MaturityBand;
  readonly bandId: MaturityBand['id'];
  readonly dimensionBreakdown: Record<DimensionV4, DimensionScoreSerializedV4>;
  readonly institutionContext: InstitutionContext | null;
  readonly actionPacketNotes: string | null;
}

export type AssessmentResponseLoaded =
  | AssessmentResponseLoadedV2
  | AssessmentResponseLoadedV3
  | AssessmentResponseLoadedV4;

export async function loadAssessmentResponse(
  id: string,
): Promise<AssessmentResponseLoaded | null> {
  if (!isSupabaseConfigured() || !isSupabaseServiceRoleConfigured()) return null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  // The id parameter is user_profiles.id, used as a bearer token.
  const client = createServiceRoleClient();
  // Core columns exist in every deployed schema. The optional columns ship in
  // later migrations (00044 action_packet_notes, 00045 institution_context).
  // Putting them in the SELECT is NOT fail-open: if prod runs code ahead of its
  // migrations, the query errors and EVERY result 404s — the 2026-06-18
  // incident where all assessments (free + paid) were unreachable while
  // 00044/00045 were unapplied. So we try the full select and, on any error
  // (typically "column does not exist"), retry with the core columns. The
  // optional fields are then read defensively (?? null) below.
  const CORE_COLUMNS =
    'id, email, readiness_score, readiness_max_score, readiness_tier_id, readiness_dimension_breakdown, readiness_version, readiness_at, role';
  const OPTIONAL_COLUMNS = 'institution_context, action_packet_notes';

  const selectProfile = async (column: 'id' | 'previous_id') => {
    const full = await client
      .from('user_profiles')
      .select(`${CORE_COLUMNS}, ${OPTIONAL_COLUMNS}`)
      .eq(column, id)
      .maybeSingle();
    if (!full.error) return full;
    console.warn(
      `[load-response] full select on ${column} failed (likely unapplied migration), retrying core columns:`,
      full.error.message,
    );
    return client
      .from('user_profiles')
      .select(CORE_COLUMNS)
      .eq(column, id)
      .maybeSingle();
  };

  const primary = await selectProfile('id');
  let data = primary.data;

  // Fallback: back-fill-profile re-keys user_profiles.id to the auth user id
  // when a lead converts, which orphaned previously-emailed /results/{oldId}
  // bearer links (journey audit 2026-06-10, F5). previous_id (migration
  // 00042) records the pre-conversion id; honor it so old links keep
  // resolving. Fail-open if the previous_id column doesn't exist yet.
  if (!primary.error && !data) {
    const fallback = await selectProfile('previous_id');
    if (!fallback.error && fallback.data) {
      data = fallback.data;
    }
  }

  if (primary.error || !data) return null;
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

  // v4 paid In-Depth: normalized 0-100 score, 5-band maturity, v4 dim keys.
  if (storedVersion === 'v4') {
    const band = getMaturityBand(score);
    return {
      profileId: data.id as string,
      email: data.email as string,
      score,
      maxScore: 100,
      readinessAt: (data.readiness_at as string) ?? new Date().toISOString(),
      role: parseRoleV4((data as { role?: unknown }).role),
      version: 'v4',
      band,
      bandId: band.id,
      dimensionBreakdown: data.readiness_dimension_breakdown as Record<
        DimensionV4,
        DimensionScoreSerializedV4
      >,
      institutionContext:
        (data as { institution_context?: InstitutionContext | null }).institution_context ?? null,
      actionPacketNotes:
        (data as { action_packet_notes?: string | null }).action_packet_notes ?? null,
    };
  }

  // v3 free funnel: stores 12-48 raw scores with v3 dimension keys.
  if (storedVersion === 'v3' && storedMax === 48) {
    const tier = getTierV3(score);
    const institutionContext =
      (data as { institution_context?: InstitutionContext | null }).institution_context ?? null;
    return {
      ...base,
      // Override base.role (v2-parsed) with the free-role normalization so
      // operations/retail-branch/it-infosec survive as distinct roles.
      role: normalizeStoredRoleToFreeRole((data as { role?: unknown }).role),
      version: 'v3',
      tier,
      tierId: tier.id,
      dimensionBreakdown: data.readiness_dimension_breakdown as Record<
        DimensionV3,
        DimensionScoreV3
      >,
      assetBandFree: parseFreeAssetBand(
        (institutionContext as { asset_band_free?: unknown } | null)?.asset_band_free,
      ),
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
