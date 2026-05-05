// ConvertKit tier-sequence tag adapter.
// Adds and removes per-tier tags so the user lands in the right ConvertKit
// Sequence (one Sequence per tier, triggered by tag-add).
//
// Spec 3 only calls the Tag API. The form-subscribe path lives in
// ./index.ts and remains a stub until that work ships.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md

const CK_API_BASE = 'https://api.convertkit.com/v3';

export type TierId =
  | 'starting-point'
  | 'early-stage'
  | 'building-momentum'
  | 'ready-to-scale';

// Maps each tierId to the env var that holds that tier's CK tag id.
// The dashboard step (one-time) creates the four tags and the operator
// pastes their numeric ids into .env.local (and Vercel env).
export const TIER_TO_TAG_ENV: Record<TierId, string> = {
  'starting-point': 'CONVERTKIT_TAG_ID_STARTING_POINT',
  'early-stage': 'CONVERTKIT_TAG_ID_EARLY_STAGE',
  'building-momentum': 'CONVERTKIT_TAG_ID_BUILDING_MOMENTUM',
  'ready-to-scale': 'CONVERTKIT_TAG_ID_READY_TO_SCALE',
};

export interface TagResult {
  readonly status: 'tagged' | 'skipped' | 'failed';
  readonly reason?: string;
}

function isStaging(): boolean {
  return process.env.SKIP_CONVERTKIT === 'true';
}

function getApiKey(): string | null {
  return process.env.CONVERTKIT_API_KEY ?? null;
}

function getTagIdForTier(tier: TierId): string | null {
  const envName = TIER_TO_TAG_ENV[tier];
  return process.env[envName] ?? null;
}

export interface TagInput {
  readonly email: string;
  readonly tierId: TierId;
  readonly firstName?: string;
}

/**
 * Add the per-tier ConvertKit tag for this email. Triggers the Sequence
 * whose "When subscriber is added to tag X" automation matches.
 *
 * Returns 'skipped' (not an error) when:
 *   - SKIP_CONVERTKIT=true (staging)
 *   - CONVERTKIT_API_KEY missing
 *   - the tier's tag id env var is unset
 *
 * Returns 'failed' (logs warn) when the API call returns non-2xx.
 * Never throws — capture-email's success path must not block on CK.
 */
export async function tagAssessmentTier(input: TagInput): Promise<TagResult> {
  if (isStaging()) {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }
  const tagId = getTagIdForTier(input.tierId);
  if (!tagId) {
    return { status: 'skipped', reason: `no-tag-id-for-${input.tierId}` };
  }

  try {
    const res = await fetch(`${CK_API_BASE}/tags/${tagId}/subscribe`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        email: input.email,
        ...(input.firstName ? { first_name: input.firstName } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[convertkit/sequences] tagAssessmentTier failed: ${res.status} ${detail}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    return { status: 'tagged' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[convertkit/sequences] tagAssessmentTier error:', message);
    return { status: 'failed', reason: message };
  }
}

/**
 * Remove the per-tier ConvertKit tag from this email. Used on retake when
 * the new tier differs from the old. ConvertKit's tag-unsubscribe endpoint
 * is `POST /v3/tags/:tag_id/unsubscribe` with the email in the body.
 *
 * Returns 'skipped' on the same conditions as tagAssessmentTier. Never throws.
 */
export async function removeAssessmentTier(input: TagInput): Promise<TagResult> {
  if (isStaging()) {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }
  const tagId = getTagIdForTier(input.tierId);
  if (!tagId) {
    return { status: 'skipped', reason: `no-tag-id-for-${input.tierId}` };
  }

  try {
    const res = await fetch(`${CK_API_BASE}/tags/${tagId}/unsubscribe`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_secret: apiKey,
        email: input.email,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[convertkit/sequences] removeAssessmentTier failed: ${res.status} ${detail}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    return { status: 'tagged' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[convertkit/sequences] removeAssessmentTier error:', message);
    return { status: 'failed', reason: message };
  }
}
