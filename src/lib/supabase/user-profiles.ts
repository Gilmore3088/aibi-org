// Server-side helpers for the user_profiles table.
//
// All writes use the service role client (bypasses RLS) because:
//   1. Email-only users have no Supabase Auth session.
//   2. These endpoints are protected by input validation in the Route Handlers.
//
// Reads use the service role client too — the dashboard fetches via a
// server-side API route that validates the email from the request.
//
// Never import this module in Client Components — it uses the service role key.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ReadinessResult, ProficiencyResult } from '@/lib/user-data';
import type { Role } from '@content/assessments/v2/role';

// ── Dev bypass ──────────────────────────────────────────────────────────────
// Set SKIP_SUPABASE_PROFILES=true in .env.local to disable all Supabase writes
// without needing a live project (mirrors SKIP_CONVERTKIT pattern).
const SKIP = process.env.SKIP_SUPABASE_PROFILES === 'true';

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserProfileRow {
  readonly email: string;
  readonly readiness?: ReadinessResult;
  readonly proficiency?: ProficiencyResult;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Upsert the readiness assessment result for the given email.
 * Called from POST /api/capture-email after MailerLite sync.
 *
 * No-op if Supabase is not configured or SKIP_SUPABASE_PROFILES is set.
 */
export async function upsertReadinessResult(
  email: string,
  result: ReadinessResult,
  options: { role?: Role | null } = {},
): Promise<{ id: string | null }> {
  if (SKIP || !isSupabaseConfigured()) return { id: null };

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('user_profiles')
    .upsert(
      {
        email,
        readiness_score: result.score,
        readiness_tier_id: result.tierId,
        readiness_tier_label: result.tierLabel,
        readiness_answers: result.answers,
        readiness_at: result.completedAt,
        // v2 additions — guarded so existing rows do not lose data on rewrite.
        ...(result.version ? { readiness_version: result.version } : {}),
        ...(result.maxScore !== undefined ? { readiness_max_score: result.maxScore } : {}),
        ...(result.dimensionBreakdown
          ? { readiness_dimension_breakdown: result.dimensionBreakdown }
          : {}),
        // Role is set only when the caller supplies it. Omitted entirely on
        // free-flow submits so we never overwrite a previously-captured role
        // with null on a retake.
        ...(options.role !== undefined ? { role: options.role } : {}),
      },
      { onConflict: 'email' },
    )
    .select('id')
    .single();

  if (error) {
    throw new Error(`[user-profiles] upsertReadinessResult failed: ${error.message}`);
  }
  return { id: (data?.id as string | undefined) ?? null };
}

/**
 * Upsert the proficiency exam result for the given email.
 * Called from POST /api/save-proficiency.
 *
 * No-op if Supabase is not configured or SKIP_SUPABASE_PROFILES is set.
 */
export async function upsertProficiencyResult(
  email: string,
  result: ProficiencyResult,
): Promise<void> {
  if (SKIP || !isSupabaseConfigured()) return;

  const client = createServiceRoleClient();
  const { error } = await client.from('user_profiles').upsert(
    {
      email,
      proficiency_pct: result.pctCorrect,
      proficiency_level_id: result.levelId,
      proficiency_level_label: result.levelLabel,
      proficiency_topic_scores: result.topicScores,
      proficiency_at: result.completedAt,
    },
    { onConflict: 'email' },
  );

  if (error) {
    throw new Error(`[user-profiles] upsertProficiencyResult failed: ${error.message}`);
  }
}

/**
 * Fetch the full profile for an email address.
 * Returns null if not found or if Supabase is not configured.
 *
 * Callers should fall back to localStorage when this returns null.
 */
export async function getProfileByEmail(email: string): Promise<UserProfileRow | null> {
  if (SKIP || !isSupabaseConfigured()) return null;

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('user_profiles')
    .select(
      [
        'email',
        'readiness_score',
        'readiness_tier_id',
        'readiness_tier_label',
        'readiness_answers',
        'readiness_at',
        'readiness_version',
        'readiness_max_score',
        'readiness_dimension_breakdown',
        'proficiency_pct',
        'proficiency_level_id',
        'proficiency_level_label',
        'proficiency_topic_scores',
        'proficiency_at',
      ].join(','),
    )
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw new Error(`[user-profiles] getProfileByEmail failed: ${error.message}`);
  }
  if (!data) return null;

  const row = data as unknown as Record<string, unknown>;

  const readiness: ReadinessResult | undefined =
    typeof row.readiness_score === 'number' &&
    typeof row.readiness_tier_id === 'string' &&
    typeof row.readiness_tier_label === 'string' &&
    Array.isArray(row.readiness_answers) &&
    typeof row.readiness_at === 'string'
      ? {
          score: row.readiness_score,
          tierId: row.readiness_tier_id,
          tierLabel: row.readiness_tier_label,
          answers: row.readiness_answers as number[],
          completedAt: row.readiness_at,
          ...(typeof row.readiness_version === 'string' &&
          (row.readiness_version === 'v1' || row.readiness_version === 'v2')
            ? { version: row.readiness_version as 'v1' | 'v2' }
            : {}),
          ...(typeof row.readiness_max_score === 'number'
            ? { maxScore: row.readiness_max_score }
            : {}),
          ...(row.readiness_dimension_breakdown &&
          typeof row.readiness_dimension_breakdown === 'object'
            ? {
                dimensionBreakdown:
                  row.readiness_dimension_breakdown as ReadinessResult['dimensionBreakdown'],
              }
            : {}),
        }
      : undefined;

  const proficiency: ProficiencyResult | undefined =
    typeof row.proficiency_pct === 'number' &&
    typeof row.proficiency_level_id === 'string' &&
    typeof row.proficiency_level_label === 'string' &&
    Array.isArray(row.proficiency_topic_scores) &&
    typeof row.proficiency_at === 'string'
      ? {
          pctCorrect: row.proficiency_pct,
          levelId: row.proficiency_level_id,
          levelLabel: row.proficiency_level_label,
          topicScores: row.proficiency_topic_scores as ProficiencyResult['topicScores'],
          completedAt: row.proficiency_at,
        }
      : undefined;

  return {
    email: row.email as string,
    readiness,
    proficiency,
  };
}

/**
 * Read just the prior readiness_tier_id for an email. Used by capture-email
 * BEFORE the upsert overwrites the row, so retake re-routing knows which
 * old tier tag to remove from ConvertKit.
 *
 * Returns null when no row exists, when SKIP_SUPABASE_PROFILES=true,
 * or when Supabase is not configured.
 */
export async function getReadinessTierByEmail(
  email: string,
): Promise<string | null> {
  if (SKIP || !isSupabaseConfigured()) return null;

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('user_profiles')
    .select('readiness_tier_id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.warn('[user-profiles] getReadinessTierByEmail failed:', error.message);
    return null;
  }
  return (data?.readiness_tier_id as string | null) ?? null;
}

/**
 * Stamp the user_profiles row to record when the ConvertKit tier-sequence
 * tag was added. Best-effort — capture-email logs and continues on failure.
 */
export async function markConvertKitTagged(profileId: string): Promise<void> {
  if (SKIP || !isSupabaseConfigured()) return;

  const client = createServiceRoleClient();
  const { error } = await client
    .from('user_profiles')
    .update({ readiness_convertkit_tier_tagged_at: new Date().toISOString() })
    .eq('id', profileId);

  if (error) {
    console.warn('[user-profiles] markConvertKitTagged failed:', error.message);
  }
}
