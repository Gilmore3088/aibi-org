import { describe, it, expect } from 'vitest';
import {
  composeScore,
  getDimensionScores,
  getTierInDepth,
  percentOfMax,
  phaseFromPct,
  PHASE_BY_TIER,
  TIER_BY_PHASE,
  tierFromPct,
  tiers,
} from './scoring';
import { SCORE_AUTHORITY } from './scoring-authority';

describe('SCORE_AUTHORITY.thresholdLogic stays consistent with tiers', () => {
  it('mentions every tier band literal from the canonical tiers definition', () => {
    for (const tier of tiers) {
      const expectedBand = `${tier.min}–${tier.max}`; // en dash U+2013
      expect(
        SCORE_AUTHORITY.thresholdLogic,
        `tier ${tier.id} band ${expectedBand} not mentioned in thresholdLogic copy`
      ).toContain(expectedBand);
    }
  });
});

// ── A1 equivalence guarantees ───────────────────────────────────────────────
// The audit (foundation-comprehensive-audit-2026-05-24) called the
// existence of three scoring functions a structural risk: stored
// readiness_tier_id could disagree with the displayed Briefing phase.
// These tests prove that the in-depth submit path (which now stores
// tier via composeScore) and the legacy getTierInDepth helper produce
// identical tier ids for any (sum, max) pair — so any consumer that
// still imports getTierInDepth gets the same answer as composeScore.

describe('A19 — reverse-scored items', () => {
  // Build a tiny synthetic question pool to test the scoring transform
  // in isolation, without depending on the full 48-item pool.
  function makeQuestion(
    id: string,
    dimension:
      | 'current-ai-usage' | 'experimentation-culture' | 'ai-literacy-level'
      | 'quick-win-potential' | 'leadership-buy-in' | 'security-posture'
      | 'training-infrastructure' | 'builder-potential',
    reverseScored = false,
  ) {
    return {
      id,
      dimension,
      prompt: 'x',
      options: [
        { label: 'a', points: 1 as const },
        { label: 'b', points: 2 as const },
        { label: 'c', points: 3 as const },
        { label: 'd', points: 4 as const },
      ] as const,
      reverseScored,
    };
  }

  it('forward-scored points pass through unchanged', () => {
    const q = makeQuestion('q1', 'current-ai-usage', false);
    const res = getDimensionScores([3], [q]);
    expect(res['current-ai-usage'].score).toBe(3);
    expect(res['current-ai-usage'].maxScore).toBe(4);
  });

  it('reverse-scored points are flipped: 1→4, 2→3, 3→2, 4→1', () => {
    const q = makeQuestion('q1', 'current-ai-usage', true);
    expect(getDimensionScores([1], [q])['current-ai-usage'].score).toBe(4);
    expect(getDimensionScores([2], [q])['current-ai-usage'].score).toBe(3);
    expect(getDimensionScores([3], [q])['current-ai-usage'].score).toBe(2);
    expect(getDimensionScores([4], [q])['current-ai-usage'].score).toBe(1);
  });

  it('unanswered (0 points) stays 0 even when reverse-scored', () => {
    const q = makeQuestion('q1', 'current-ai-usage', true);
    expect(getDimensionScores([0], [q])['current-ai-usage'].score).toBe(0);
  });
});

describe('A1 — scoring engine equivalence', () => {
  it('tierFromPct + composeScore + getTierInDepth all agree at boundaries', () => {
    const max = 192;
    const boundaries = [0, 47, 48, 95, 96, 143, 144, 172, 173, 192];
    for (const raw of boundaries) {
      const breakdown = { d1: { score: raw, maxScore: max } };
      const composed = composeScore(breakdown);
      const direct = getTierInDepth(raw, max);
      const pct = percentOfMax(raw, max);
      const fromPct = tierFromPct(pct);
      expect(composed.tier.id, `composed vs direct at raw=${raw}`).toBe(direct.id);
      expect(fromPct.id, `tierFromPct vs direct at raw=${raw}`).toBe(direct.id);
      expect(PHASE_BY_TIER[composed.tier.id]).toBe(composed.phase);
    }
  });

  it('phase ↔ tier id round-trips losslessly', () => {
    for (const tier of tiers) {
      const phase = PHASE_BY_TIER[tier.id];
      expect(TIER_BY_PHASE[phase]).toBe(tier.id);
    }
  });

  it('composeScore against a multi-dimension breakdown matches getTierInDepth on the sum', () => {
    const breakdown = {
      a: { score: 18, maxScore: 24 },
      b: { score: 12, maxScore: 24 },
      c: { score: 21, maxScore: 24 },
      d: { score: 9,  maxScore: 24 },
      e: { score: 16, maxScore: 24 },
      f: { score: 14, maxScore: 24 },
      g: { score: 22, maxScore: 24 },
      h: { score: 11, maxScore: 24 },
    };
    const composed = composeScore(breakdown);
    expect(composed.rawScore).toBe(123);
    expect(composed.rawMax).toBe(192);
    expect(composed.tier.id).toBe(getTierInDepth(123, 192).id);
  });

  it('phaseFromPct uses 50/75/90 thresholds', () => {
    expect(phaseFromPct(0)).toBe('Curious');
    expect(phaseFromPct(49.9)).toBe('Curious');
    expect(phaseFromPct(50)).toBe('Coordinated');
    expect(phaseFromPct(74.9)).toBe('Coordinated');
    expect(phaseFromPct(75)).toBe('Programmatic');
    expect(phaseFromPct(89.9)).toBe('Programmatic');
    expect(phaseFromPct(90)).toBe('Native');
    expect(phaseFromPct(100)).toBe('Native');
  });
});
