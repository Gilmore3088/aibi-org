import { describe, expect, it } from 'vitest';
import {
  FREE_ASSET_BANDS,
  FREE_ASSET_BAND_LABEL,
  parseFreeAssetBand,
} from './asset-bands';
import { STAFFING_REALITY } from './personalization';

describe('free asset bands', () => {
  it('labels every band and gives every band a staffing-reality block', () => {
    for (const band of FREE_ASSET_BANDS) {
      expect(FREE_ASSET_BAND_LABEL[band]).toBeTruthy();
      expect(STAFFING_REALITY[band].headline.length).toBeGreaterThan(0);
      expect(STAFFING_REALITY[band].body.length).toBeGreaterThan(0);
    }
  });

  it('parses known bands case-insensitively and drops everything else', () => {
    expect(parseFreeAssetBand('under-150m')).toBe('under-150m');
    expect(parseFreeAssetBand('  150M-500M ')).toBe('150m-500m');
    expect(parseFreeAssetBand('500m-1b-plus')).toBe('500m-1b-plus');
    expect(parseFreeAssetBand('')).toBeNull();
    expect(parseFreeAssetBand('10b-plus')).toBeNull();
    expect(parseFreeAssetBand(42)).toBeNull();
    expect(parseFreeAssetBand(undefined)).toBeNull();
    // Distinct from the In-Depth institution_context enum on purpose.
    expect(parseFreeAssetBand('sub-300M')).toBeNull();
  });
});
