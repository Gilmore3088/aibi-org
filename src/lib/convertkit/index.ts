// ConvertKit adapter stub — real implementation added when CONVERTKIT_API_KEY is set.
// All calls are suppressed in staging via SKIP_CONVERTKIT=true.

export interface ConvertKitSubscribePayload {
  email: string;
  firstName?: string;
  tags?: readonly string[];
}

export async function subscribeToAssessmentForm(
  _payload: ConvertKitSubscribePayload
): Promise<{ skipped: true } | { ok: true }> {
  if (process.env.SKIP_CONVERTKIT === 'true') return { skipped: true };
  if (!process.env.CONVERTKIT_API_KEY) return { skipped: true };
  throw new Error('ConvertKit adapter not yet implemented.');
}
