// AiBI Readiness Assessment — v2 Scoring Rubric
//
// Two products draw from the same 48-question pool but score against
// different totals:
//   - Free assessment: 12 questions × 1-4 points = 12-48 range
//   - In-Depth Assessment: all 48 questions × 1-4 points = 48-192 range
//
// Tier bands are defined on the canonical 12-48 scale. Callers with a
// different max pass `maxScore`; the function normalizes proportionally
// before bucketing.

import type { Dimension } from './types';
import type { AssessmentQuestion } from './types';

export interface Tier {
  readonly id: 'starting-point' | 'early-stage' | 'building-momentum' | 'ready-to-scale';
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly colorVar: string;
  readonly headline: string;
  readonly summary: string;
}

export const tiers: readonly Tier[] = [
  {
    id: 'starting-point',
    label: 'Starting Point',
    min: 12,
    max: 20,
    colorVar: 'var(--color-error)',
    headline: 'You are at the beginning of your AI journey.',
    summary:
      'Your institution has meaningful ground to cover before AI adoption produces operational value. The first priority is building foundational staff literacy and identifying one to two repetitive workflows where a quick win is achievable without significant infrastructure investment.',
  },
  {
    id: 'early-stage',
    label: 'Early Stage',
    min: 21,
    max: 29,
    colorVar: 'var(--color-terra)',
    headline: 'You are experimenting but not yet coordinated.',
    summary:
      'Early signals exist inside your institution, but adoption is uneven and governance is informal. The opportunity is to convert isolated experiments into a coordinated program with a written use policy, a prioritized automation backlog, and a clear owner for AI strategy.',
  },
  {
    id: 'building-momentum',
    label: 'Building Momentum',
    min: 30,
    max: 38,
    colorVar: 'var(--color-terra-light)',
    headline: 'You have real traction. The next step is scale.',
    summary:
      'Multiple teams are using AI tools with leadership awareness and a working governance posture. The next move is disciplined scaling: documented use cases, measured outcomes, and a training function that can sustain the program through turnover and expansion.',
  },
  {
    id: 'ready-to-scale',
    label: 'Ready to Scale',
    min: 39,
    max: 48,
    colorVar: 'var(--color-sage)',
    headline: 'You are positioned to lead your peer group.',
    summary:
      'Your institution has the culture, governance, and leadership commitment to operate AI as a strategic capability. The opportunity is compounding — codify what works, train the next wave of builders, and convert capability into measurable efficiency gains that compound over time.',
  },
] as const;

/**
 * Returns the tier for a given total score.
 *
 * For the free 12-question assessment, call `getTierV2(score)` — the default
 * `maxScore=48` matches that range and the score is bucketed directly.
 *
 * For the In-Depth 48-question assessment, call `getTierV2(score, 192)` —
 * the score is proportionally normalized to the 12-48 scale before bucketing
 * so a 75% score on either product lands in the same tier.
 *
 * Throws if the score is outside `[maxScore/4, maxScore]` (the achievable
 * range given each question contributes 1-4 points).
 */
export function getTierV2(totalScore: number, maxScore: number = 48): Tier {
  const minPossible = maxScore / 4;
  if (totalScore < minPossible || totalScore > maxScore) {
    throw new Error(
      `Score ${totalScore} is outside the valid range ${minPossible}-${maxScore}.`,
    );
  }

  // Normalize to the 12-48 scale on which tier bands are defined.
  // For maxScore=48 this is the identity transform (no rounding noise).
  const normalizedScore =
    maxScore === 48
      ? totalScore
      : Math.round(12 + ((totalScore - minPossible) / (maxScore - minPossible)) * 36);

  const match = tiers.find((t) => normalizedScore >= t.min && normalizedScore <= t.max);
  if (!match) {
    throw new Error(
      `Normalized score ${normalizedScore} (from ${totalScore}/${maxScore}) did not match any tier.`,
    );
  }
  return match;
}

export interface DimensionScore {
  readonly score: number;
  readonly maxScore: number;
  readonly label: string;
}

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
