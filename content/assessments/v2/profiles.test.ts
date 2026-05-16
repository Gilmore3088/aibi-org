import { describe, it, expect } from 'vitest';
import { detectProfile, PROFILE_META } from './profiles';
import type { Dimension } from './types';
import type { DimensionScore } from './scoring';

// Helper — builds a Record<Dimension, DimensionScore> from a record of
// "percentage of max" values (0–100). Each dimension has 6 questions × 4
// points = 24 maxScore in the In-Depth assessment.
function buildScores(pcts: Record<Dimension, number>): Record<Dimension, DimensionScore> {
  const out = {} as Record<Dimension, DimensionScore>;
  for (const [dim, pct] of Object.entries(pcts) as [Dimension, number][]) {
    const maxScore = 24;
    const score = Math.round((pct / 100) * maxScore);
    out[dim] = { score, maxScore, label: dim };
  }
  return out;
}

// The five named test profiles from issue #97 §12. Each must produce a
// distinct, named profile detection.

describe('detectProfile — five named test profiles produce distinct outputs', () => {
  it('Profile A — high experimentation, low security → governance-priority', () => {
    const scores = buildScores({
      'current-ai-usage': 70,
      'experimentation-culture': 80,
      'ai-literacy-level': 50,
      'quick-win-potential': 60,
      'leadership-buy-in': 50,
      'security-posture': 20, // weakest
      'training-infrastructure': 40,
      'builder-potential': 50,
    });
    expect(detectProfile(scores)).toBe('governance-priority');
  });

  it('Profile B — high leadership, low training → capability-priority', () => {
    const scores = buildScores({
      'current-ai-usage': 50,
      'experimentation-culture': 50,
      'ai-literacy-level': 50,
      'quick-win-potential': 50,
      'leadership-buy-in': 85, // strongest
      'security-posture': 60,
      'training-infrastructure': 15, // weakest
      'builder-potential': 50,
    });
    expect(detectProfile(scores)).toBe('capability-priority');
  });

  it('Profile C — low usage, high literacy → adoption-priority', () => {
    const scores = buildScores({
      'current-ai-usage': 15, // weakest
      'experimentation-culture': 40,
      'ai-literacy-level': 85, // strongest
      'quick-win-potential': 50,
      'leadership-buy-in': 50,
      'security-posture': 60,
      'training-infrastructure': 55,
      'builder-potential': 50,
    });
    expect(detectProfile(scores)).toBe('adoption-priority');
  });

  it('Profile D — low leadership, high experimentation → visibility-priority', () => {
    const scores = buildScores({
      'current-ai-usage': 60,
      'experimentation-culture': 85, // strongest
      'ai-literacy-level': 60,
      'quick-win-potential': 55,
      'leadership-buy-in': 15, // weakest
      'security-posture': 60,
      'training-infrastructure': 50,
      'builder-potential': 50,
    });
    expect(detectProfile(scores)).toBe('visibility-priority');
  });

  it('Profile E — strong security, low quick-win → use-case-priority', () => {
    const scores = buildScores({
      'current-ai-usage': 50,
      'experimentation-culture': 40,
      'ai-literacy-level': 60,
      'quick-win-potential': 15, // weakest
      'leadership-buy-in': 55,
      'security-posture': 85, // strongest
      'training-infrastructure': 60,
      'builder-potential': 50,
    });
    expect(detectProfile(scores)).toBe('use-case-priority');
  });
});

describe('detectProfile — returns null when no clear pattern', () => {
  it('uniformly low scores → no profile', () => {
    const scores = buildScores({
      'current-ai-usage': 20,
      'experimentation-culture': 20,
      'ai-literacy-level': 20,
      'quick-win-potential': 20,
      'leadership-buy-in': 20,
      'security-posture': 20,
      'training-infrastructure': 20,
      'builder-potential': 20,
    });
    expect(detectProfile(scores)).toBeNull();
  });

  it('uniformly high scores → no profile', () => {
    const scores = buildScores({
      'current-ai-usage': 80,
      'experimentation-culture': 80,
      'ai-literacy-level': 80,
      'quick-win-potential': 80,
      'leadership-buy-in': 80,
      'security-posture': 80,
      'training-infrastructure': 80,
      'builder-potential': 80,
    });
    expect(detectProfile(scores)).toBeNull();
  });
});

describe('PROFILE_META — every detected profile has distinct copy', () => {
  it('all five profiles have unique labels', () => {
    const labels = Object.values(PROFILE_META).map((m) => m.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('all five profiles have unique diagnoses', () => {
    const diagnoses = Object.values(PROFILE_META).map((m) => m.diagnosis);
    expect(new Set(diagnoses).size).toBe(diagnoses.length);
  });

  it('all five profiles have unique Foundation emphasis', () => {
    const emphases = Object.values(PROFILE_META).map((m) => m.foundationEmphasis);
    expect(new Set(emphases).size).toBe(emphases.length);
  });
});
