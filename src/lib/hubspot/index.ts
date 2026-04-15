// HubSpot adapter stub — real implementation added when HUBSPOT_API_KEY is set.
// Custom properties must be pre-created in HubSpot dashboard (see CLAUDE.md).

export interface HubSpotContactPayload {
  email: string;
  assessmentScore: number;
  scoreTier: string;
  institutionName?: string;
  assetSize?: string;
}

export async function upsertContact(
  _payload: HubSpotContactPayload
): Promise<{ skipped: true } | { ok: true }> {
  if (!process.env.HUBSPOT_API_KEY) return { skipped: true };
  throw new Error('HubSpot adapter not yet implemented.');
}
