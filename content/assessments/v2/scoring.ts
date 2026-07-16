// AiBI Readiness Assessment — v2 Scoring Rubric
// Score range: 12 (all 1s across 12 questions) to 48 (all 4s across 12 questions).

import type { Dimension } from './types';
import type { AssessmentQuestion } from './types';
import { tiers } from '@content/assessments/shared/free-readiness';
import type { Tier } from '@content/assessments/shared/free-readiness';

// Re-exported so existing `import { tiers, type Tier } from '.../v2/scoring'`
// consumers keep working after the shared extraction.
export { tiers };
export type { Tier };

export function getTierV2(totalScore: number): Tier {
  const match = tiers.find((t) => totalScore >= t.min && totalScore <= t.max);
  if (!match) {
    throw new Error(`Score ${totalScore} is outside the valid range of 12-48.`);
  }
  return match;
}

// In-Depth tier mapping — handles the 48-question raw score (48–192 range,
// or any arbitrary max) by mapping a normalized percentage to the same
// four tier ids. Thresholds match the Briefing surface's phase rubric
// (Curious < 50% < Coordinated < 75% < Programmatic < 90% < Native) so
// the displayed phase and the stored tier id always reconcile.
//
// Tier id mapping (same string ids as getTierV2 so downstream consumers
// — dashboard, sequences, etc. — do not branch on assessment flavor):
//   starting-point   < 50%   → Curious
//   early-stage      50–74%  → Coordinated
//   building-momentum 75–89% → Programmatic
//   ready-to-scale   90–100% → Native
export function getTierInDepth(rawScore: number, maxScore: number): Tier {
  if (maxScore <= 0) {
    throw new Error('getTierInDepth: maxScore must be positive.');
  }
  const pct = Math.max(0, Math.min(100, (rawScore / maxScore) * 100));
  if (pct >= 90) return tiers[3];
  if (pct >= 75) return tiers[2];
  if (pct >= 50) return tiers[1];
  return tiers[0];
}

export type { DimensionScore } from '../shared/dimension-score';
import type { DimensionScore } from '../shared/dimension-score';

export function getDimensionScores(
  answers: readonly number[],
  sessionQuestions: readonly AssessmentQuestion[]
): Record<Dimension, DimensionScore> {
  const dimensionMap: Partial<Record<Dimension, { score: number; maxScore: number }>> = {};

  sessionQuestions.forEach((question, idx) => {
    const dim = question.dimension;
    const points = answers[idx] ?? 0;
    const existing = dimensionMap[dim] ?? { score: 0, maxScore: 0 };
    dimensionMap[dim] = {
      score: existing.score + points,
      maxScore: existing.maxScore + 4,
    };
  });

  // Fill in any dimensions not represented in this session with zeros
  const allDimensions: Dimension[] = [
    'current-ai-usage',
    'experimentation-culture',
    'ai-literacy-level',
    'quick-win-potential',
    'leadership-buy-in',
    'security-posture',
    'training-infrastructure',
    'builder-potential',
  ];

  const result = {} as Record<Dimension, DimensionScore>;
  for (const dim of allDimensions) {
    const entry = dimensionMap[dim] ?? { score: 0, maxScore: 4 };
    result[dim] = {
      score: entry.score,
      maxScore: entry.maxScore,
      label: dim
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    };
  }

  return result;
}
