// MailerLite Connect API adapter — subscribe + group assign.
//
// Used by /api/capture-email (assessment) and /api/subscribe-newsletter
// (AI Banking Brief). Replaces the prior ConvertKit adapter.
//
// API: https://connect.mailerlite.com/api  (auth: Bearer)
// All MailerLite calls are best-effort, non-blocking, and no-op when env
// vars are unset — keeps capture flows fast and resilient.
//
// MailerLite groups map 1:1 to ConvertKit's combined "form + tag" concept.
// Assigning a subscriber to a group can trigger an Automation that fires
// a sequence of emails. See sequences.ts for the per-tier routing.

const ML_API_BASE = 'https://connect.mailerlite.com/api';

export interface MailerLiteSubscribePayload {
  readonly email: string;
  readonly firstName?: string;
  /** Group IDs to add the subscriber to. Triggers any group-add automations. */
  readonly groupIds?: readonly string[];
  /** Custom fields to set on the subscriber. */
  readonly fields?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface SubscribeResult {
  readonly status: 'subscribed' | 'skipped' | 'failed';
  readonly reason?: string;
  /** The MailerLite subscriber id (only present on success). */
  readonly subscriberId?: string;
}

function isStaging(): boolean {
  return process.env.SKIP_MAILERLITE === 'true';
}

function getApiKey(): string | null {
  return process.env.MAILERLITE_API_KEY ?? null;
}

/**
 * MailerLite's POST /subscribers is upsert-shaped — creates if the email
 * doesn't exist, updates if it does. Returning subscriber id either way.
 */
async function postSubscriber(
  payload: MailerLiteSubscribePayload,
): Promise<SubscribeResult> {
  if (isStaging()) {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }

  const body: Record<string, unknown> = {
    email: payload.email,
    ...(payload.fields ? { fields: payload.fields } : {}),
    ...(payload.firstName
      ? { fields: { ...(payload.fields ?? {}), name: payload.firstName } }
      : {}),
    ...(payload.groupIds && payload.groupIds.length > 0
      ? { groups: payload.groupIds }
      : {}),
  };

  try {
    const res = await fetch(`${ML_API_BASE}/subscribers`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[mailerlite] subscribe failed: ${res.status} ${detail.slice(0, 300)}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    const json = (await res.json().catch(() => ({}))) as {
      data?: { id?: string };
    };
    return {
      status: 'subscribed',
      ...(json.data?.id ? { subscriberId: json.data.id } : {}),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[mailerlite] subscribe error:', message);
    return { status: 'failed', reason: message };
  }
}

/**
 * Subscribe an assessment-completer to the assessment group. The group is
 * configured in MailerLite to fire the welcome / nurture automation.
 * No-op when MAILERLITE_GROUP_ID_ASSESSMENT is unset.
 */
export async function subscribeToAssessmentForm(
  payload: Omit<MailerLiteSubscribePayload, 'groupIds'> & { tags?: readonly string[] },
): Promise<SubscribeResult> {
  const groupId = process.env.MAILERLITE_GROUP_ID_ASSESSMENT;
  if (!groupId) {
    return { status: 'skipped', reason: 'no-group-id' };
  }
  return postSubscriber({
    email: payload.email,
    firstName: payload.firstName,
    fields: payload.fields,
    groupIds: [groupId],
  });
}

/**
 * Subscribe a visitor to the AI Banking Brief newsletter group.
 * No-op when MAILERLITE_GROUP_ID_NEWSLETTER is unset.
 */
export async function subscribeToNewsletterForm(
  payload: Omit<MailerLiteSubscribePayload, 'groupIds'>,
): Promise<SubscribeResult> {
  const groupId = process.env.MAILERLITE_GROUP_ID_NEWSLETTER;
  if (!groupId) {
    return { status: 'skipped', reason: 'no-group-id' };
  }
  return postSubscriber({
    email: payload.email,
    firstName: payload.firstName,
    fields: payload.fields,
    groupIds: [groupId],
  });
}
