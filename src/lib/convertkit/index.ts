// ConvertKit form-subscribe adapter — real implementation.
//
// Used by /api/capture-email for assessment captures and by
// /api/subscribe-newsletter for the AI Banking Brief newsletter signups.
// All calls are suppressed in staging via SKIP_CONVERTKIT=true.
//
// For tag-add / tag-remove (Spec 3 tier sequences) see ./sequences.ts.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md

const CK_API_BASE = 'https://api.convertkit.com/v3';

export interface ConvertKitSubscribePayload {
  readonly email: string;
  readonly firstName?: string;
  readonly tags?: readonly string[];
}

export interface SubscribeResult {
  readonly status: 'subscribed' | 'skipped' | 'failed';
  readonly reason?: string;
}

function isStaging(): boolean {
  return process.env.SKIP_CONVERTKIT === 'true';
}

function getApiKey(): string | null {
  return process.env.CONVERTKIT_API_KEY ?? null;
}

async function postFormSubscribe(
  formId: string,
  payload: ConvertKitSubscribePayload,
): Promise<SubscribeResult> {
  if (isStaging()) {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }

  try {
    const res = await fetch(`${CK_API_BASE}/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        email: payload.email,
        ...(payload.firstName ? { first_name: payload.firstName } : {}),
        ...(payload.tags && payload.tags.length > 0 ? { tags: payload.tags } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[convertkit/forms] subscribe failed: ${res.status} ${detail}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    return { status: 'subscribed' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[convertkit/forms] subscribe error:', message);
    return { status: 'failed', reason: message };
  }
}

/**
 * Subscribe an assessment-completer to the assessment-tagged form.
 * No-op when CONVERTKIT_ASSESSMENT_FORM_ID is unset.
 */
export async function subscribeToAssessmentForm(
  payload: ConvertKitSubscribePayload,
): Promise<SubscribeResult> {
  const formId = process.env.CONVERTKIT_ASSESSMENT_FORM_ID;
  if (!formId) {
    return { status: 'skipped', reason: 'no-form-id' };
  }
  return postFormSubscribe(formId, payload);
}

/**
 * Subscribe a visitor to the AI Banking Brief newsletter.
 * No-op when CONVERTKIT_NEWSLETTER_FORM_ID is unset.
 */
export async function subscribeToNewsletterForm(
  payload: ConvertKitSubscribePayload,
): Promise<SubscribeResult> {
  const formId = process.env.CONVERTKIT_NEWSLETTER_FORM_ID;
  if (!formId) {
    return { status: 'skipped', reason: 'no-form-id' };
  }
  return postFormSubscribe(formId, payload);
}
