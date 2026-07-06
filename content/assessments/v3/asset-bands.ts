// Free-funnel asset-size bands — optional context, never scoring input.
//
// A $30M credit union with eight employees and a $900M bank with real
// departments are operationally different worlds; the free report should
// speak to the reader's staffing reality. The band is collected as an
// OPTIONAL field on the email gate (never a 13th question — the v3 flow
// enforces a strict 12-question invariant) and must never affect the score.
//
// Ids are deliberately distinct from the In-Depth assessment's
// institution_context asset_band enum so the two can evolve independently;
// storage merges into user_profiles.institution_context.asset_band_free.

export const FREE_ASSET_BANDS = ['under-150m', '150m-500m', '500m-1b-plus'] as const;

export type FreeAssetBand = (typeof FREE_ASSET_BANDS)[number];

export const FREE_ASSET_BAND_LABEL: Record<FreeAssetBand, string> = {
  'under-150m': 'Under $150M in assets',
  '150m-500m': '$150M–$500M in assets',
  '500m-1b-plus': '$500M–$1B+ in assets',
};

export function parseFreeAssetBand(input: unknown): FreeAssetBand | null {
  if (typeof input !== 'string') return null;
  const lowered = input.trim().toLowerCase();
  return (FREE_ASSET_BANDS as readonly string[]).includes(lowered)
    ? (lowered as FreeAssetBand)
    : null;
}
