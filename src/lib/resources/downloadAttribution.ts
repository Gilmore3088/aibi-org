export interface DownloadAttribution {
  readonly source_surface?: string;
  readonly assessment_role?: string;
  readonly assessment_tier_id?: string;
  readonly assessment_tier_label?: string;
  readonly assessment_top_gap?: string;
}

const ATTRIBUTION_MAX_LENGTHS = {
  source_surface: 64,
  assessment_role: 64,
  assessment_tier_id: 64,
  assessment_tier_label: 80,
  assessment_top_gap: 128,
} as const;

function normalizeAttributionValue(value: string | null, maxLength: number): string | null {
  if (value === null) return null;
  const normalized = value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

export function parseDownloadAttribution(input: string | URL): DownloadAttribution {
  let url: URL;
  try {
    url = input instanceof URL ? input : new URL(input, 'https://www.aibankinginstitute.com');
  } catch {
    return {};
  }

  const attribution: { -readonly [K in keyof DownloadAttribution]?: string } = {};
  for (const key of Object.keys(ATTRIBUTION_MAX_LENGTHS) as Array<keyof typeof ATTRIBUTION_MAX_LENGTHS>) {
    const value = normalizeAttributionValue(url.searchParams.get(key), ATTRIBUTION_MAX_LENGTHS[key]);
    if (value) attribution[key] = value;
  }
  return attribution;
}
