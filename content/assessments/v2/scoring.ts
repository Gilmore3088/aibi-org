// AiBI Readiness Assessment — v2 Scoring Rubric
// Score range: 12 (all 1s across 12 questions) to 48 (all 4s across 12 questions).

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
    max: 22,
    colorVar: 'var(--color-error)',
    headline: 'You are at the beginning of your AI journey.',
    summary:
      'Your institution has meaningful ground to cover before AI adoption produces operational value. The first priority is building foundational staff literacy and identifying one to two repetitive workflows where a quick win is achievable without significant infrastructure investment.',
  },
  {
    id: 'early-stage',
    label: 'Early Stage',
    min: 23,
    max: 32,
    colorVar: 'var(--color-terra)',
    headline: 'You are experimenting but not yet coordinated.',
    summary:
      'Early signals exist inside your institution, but adoption is uneven and governance is informal. The opportunity is to convert isolated experiments into a coordinated program with a written use policy, a prioritized automation backlog, and a clear owner for AI strategy.',
  },
  {
    id: 'building-momentum',
    label: 'Building Momentum',
    min: 33,
    max: 40,
    colorVar: 'var(--color-terra-light)',
    headline: 'You have real traction. The next step is scale.',
    summary:
      'Multiple teams are using AI tools with leadership awareness and a working governance posture. The next move is disciplined scaling: documented use cases, measured outcomes, and a training function that can sustain the program through turnover and expansion.',
  },
  {
    id: 'ready-to-scale',
    label: 'Ready to Scale',
    min: 41,
    max: 48,
    colorVar: 'var(--color-sage)',
    headline: 'You are positioned to lead your peer group.',
    summary:
      'Your institution has the culture, governance, and leadership commitment to operate AI as a strategic capability. The opportunity is compounding — codify what works, train the next wave of builders, and convert capability into measurable efficiency gains that compound over time.',
  },
] as const;

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
