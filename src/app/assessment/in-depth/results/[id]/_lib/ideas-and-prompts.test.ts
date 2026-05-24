import { describe, it, expect } from 'vitest';
import { buildIdeaCard } from './ideas-and-prompts';
import type { DimRow } from './derive';

// Smoke-test extraction against the eight real starter artifacts. Each
// must yield at least one "this week" item and a non-empty starter
// prompt; the Briefing chapter renders empty state if either is missing,
// so this test guards the wiring.

const DIMENSIONS = [
  'current-ai-usage',
  'experimentation-culture',
  'ai-literacy-level',
  'quick-win-potential',
  'leadership-buy-in',
  'security-posture',
  'training-infrastructure',
  'builder-potential',
] as const;

function fakeRow(id: (typeof DIMENSIONS)[number]): DimRow {
  return {
    id,
    code: 'D01',
    label: id,
    subhead: '',
    pillar: 'Strategy',
    raw: 12,
    max: 24,
    pct: 50,
    terrain: 'mid',
  };
}

describe('A6 — ideas+prompts extraction', () => {
  for (const dim of DIMENSIONS) {
    it(`extracts non-empty thisWeek and starterPrompt for ${dim}`, () => {
      const card = buildIdeaCard(fakeRow(dim));
      expect(card.thisWeek.length).toBeGreaterThan(0);
      expect(card.thisWeek.length).toBeLessThanOrEqual(4);
      expect(card.starterPrompt.length).toBeGreaterThan(20);
      // No raw markdown markers in the extracted strings.
      for (const item of card.thisWeek) {
        expect(item).not.toMatch(/^\d+\.\s/);
      }
      expect(card.starterPrompt).not.toMatch(/^>/);
    });
  }
});
