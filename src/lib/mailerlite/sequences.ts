// MailerLite tier-routing — assigns / unassigns the per-tier group so the
// matching Automation triggers (welcome → Day 0/3/7 / etc).
//
// MailerLite's API needs the subscriber id to add or remove a group. We
// resolve email→id with a GET /subscribers/{email} (idempotent lookup),
// then call POST /subscribers/{id}/groups/{groupId} or DELETE.
//
// All operations are best-effort, non-throwing — the calling capture
// route never blocks on MailerLite outcomes.

const ML_API_BASE = 'https://connect.mailerlite.com/api';

export type TierId =
  | 'starting-point'
  | 'early-stage'
  | 'building-momentum'
  | 'ready-to-scale';

export const TIER_TO_GROUP_ENV: Record<TierId, string> = {
  'starting-point': 'MAILERLITE_GROUP_ID_STARTING_POINT',
  'early-stage': 'MAILERLITE_GROUP_ID_EARLY_STAGE',
  'building-momentum': 'MAILERLITE_GROUP_ID_BUILDING_MOMENTUM',
  'ready-to-scale': 'MAILERLITE_GROUP_ID_READY_TO_SCALE',
};

export interface TagResult {
  readonly status: 'tagged' | 'skipped' | 'failed';
  readonly reason?: string;
}

function isStaging(): boolean {
  return process.env.SKIP_MAILERLITE === 'true';
}

function getApiKey(): string | null {
  return process.env.MAILERLITE_API_KEY ?? null;
}

function getGroupIdForTier(tier: TierId): string | null {
  const envName = TIER_TO_GROUP_ENV[tier];
  return process.env[envName] ?? null;
}

async function findSubscriberId(
  apiKey: string,
  email: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `${ML_API_BASE}/subscribers/${encodeURIComponent(email)}`,
      {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json().catch(() => ({}))) as {
      data?: { id?: string };
    };
    return json.data?.id ?? null;
  } catch {
    return null;
  }
}

export interface TagInput {
  readonly email: string;
  readonly tierId: TierId;
  readonly firstName?: string;
  /** Supabase user_profiles.id — used by the email merge tag for /results/{id}. */
  readonly profileId?: string;
  /** Numeric score (1–48 scale on v2). */
  readonly score?: number;
  /** Human-readable tier (e.g. "Starting Point"). */
  readonly tierLabel?: string;
  /** Lowest-scoring dimension id (e.g. "current-ai-usage"). */
  readonly lowestDimension?: string;
}

/**
 * Add the per-tier group for this email. Triggers the Automation whose
 * "When subscriber joins group X" trigger matches.
 *
 * Two-step: ensure subscriber exists (POST /subscribers acts as upsert
 * and accepts groups in one call) → done. We use the POST upsert path
 * with the group inline, which handles the create-or-update + group-add
 * atomically.
 */
export async function tagAssessmentTier(input: TagInput): Promise<TagResult> {
  if (isStaging()) {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }
  const groupId = getGroupIdForTier(input.tierId);
  if (!groupId) {
    return { status: 'skipped', reason: `no-group-id-for-${input.tierId}` };
  }

  // Build the fields object once. Only set keys whose values are present so
  // we never overwrite existing per-banker data with undefined on retake.
  const fields: Record<string, string | number> = {};
  if (input.firstName) fields.name = input.firstName;
  if (input.profileId) fields.profile_id = input.profileId;
  if (typeof input.score === 'number') fields.score = input.score;
  if (input.tierLabel) fields.tier_label = input.tierLabel;
  if (input.lowestDimension) fields.lowest_dimension = input.lowestDimension;

  try {
    const res = await fetch(`${ML_API_BASE}/subscribers`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: input.email,
        groups: [groupId],
        ...(Object.keys(fields).length > 0 ? { fields } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[mailerlite/sequences] tagAssessmentTier failed: ${res.status} ${detail.slice(0, 300)}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    return { status: 'tagged' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[mailerlite/sequences] tagAssessmentTier error:', message);
    return { status: 'failed', reason: message };
  }
}

/**
 * Remove the per-tier group from this email. Used on retake when the
 * new tier differs from the prior one. Requires resolving email→id first
 * because DELETE needs the subscriber id, then DELETE /subscribers/{id}/groups/{groupId}.
 */
export async function removeAssessmentTier(input: TagInput): Promise<TagResult> {
  if (isStaging()) {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }
  const groupId = getGroupIdForTier(input.tierId);
  if (!groupId) {
    return { status: 'skipped', reason: `no-group-id-for-${input.tierId}` };
  }

  const subscriberId = await findSubscriberId(apiKey, input.email);
  if (!subscriberId) {
    return { status: 'skipped', reason: 'subscriber-not-found' };
  }

  try {
    const res = await fetch(
      `${ML_API_BASE}/subscribers/${subscriberId}/groups/${groupId}`,
      {
        method: 'DELETE',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[mailerlite/sequences] removeAssessmentTier failed: ${res.status} ${detail.slice(0, 300)}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    return { status: 'tagged' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[mailerlite/sequences] removeAssessmentTier error:', message);
    return { status: 'failed', reason: message };
  }
}
