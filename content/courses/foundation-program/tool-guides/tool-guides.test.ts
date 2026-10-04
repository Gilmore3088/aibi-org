import { describe, expect, it } from 'vitest';
import { ALL_TOOL_GUIDES } from '.';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Names and claims that were true once and are not now. A guide that brings
// one back has not been re-checked against the vendor's own pages.
const RETIRED = [
  /GPT-[34]/,
  /DALL-E/,
  /Code Interpreter/,
  /BizChat|Business Chat/,
  /Gemini Advanced/,
  /AI Premium/,
  /Gemini \d/,
  /ChatGPT Team|Plus\/Team/,
  /\bCollections?\b/,
  /\bBAA\b/,
  /no (dedicated )?mobile app/i,
  /cannot (access the internet or )?hallucinate/i,
];

describe('tool guides', () => {
  it.each(ALL_TOOL_GUIDES.map((g) => [g.platformId, g] as const))('%s is dated and in date', (_id, guide) => {
    expect(guide.verifiedOn).toMatch(ISO_DATE);
    expect(guide.reviewBy).toMatch(ISO_DATE);
    expect(guide.reviewBy > guide.verifiedOn).toBe(true);
    const today = new Date().toISOString().slice(0, 10);
    expect(guide.reviewBy >= today, `${guide.platformId} guide needs re-checking (reviewBy ${guide.reviewBy})`).toBe(true);
    expect(guide.pricingUrl).toMatch(/^https:\/\//);
  });

  it.each(ALL_TOOL_GUIDES.map((g) => [g.platformId, g] as const))('%s carries no retired product names', (_id, guide) => {
    const text = JSON.stringify(guide);
    for (const pattern of RETIRED) {
      expect(text, `${guide.platformId} matches ${pattern}`).not.toMatch(pattern);
    }
  });
});
