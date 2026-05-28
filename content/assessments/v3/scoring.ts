// AiBI Readiness Assessment — v3 Scoring Rubric
// Score range: 12 (all 1s across 12 questions) to 48 (all 4s across 12 questions).
// Tier bands are identical to v2 — same four ids so any downstream consumer
// that has already keyed on the tier id (sequences, dashboards) continues
// to work without branching on assessment version.

import type { Dimension, AssessmentQuestion } from './types';
import { DIMENSION_LABELS } from './types';

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
    colorVar: 'var(--ink)',
    headline: 'You are at the beginning of your AI journey.',
    summary:
      'Your institution has meaningful ground to cover before AI adoption produces operational value. The first priority is building foundational staff literacy and identifying one to two repetitive workflows where a quick win is achievable without significant infrastructure investment.',
  },
  {
    id: 'early-stage',
    label: 'Early Stage',
    min: 23,
    max: 32,
    colorVar: 'var(--gold)',
    headline: 'You are experimenting but not yet coordinated.',
    summary:
      'Early signals exist inside your institution, but adoption is uneven and governance is informal. The opportunity is to convert isolated experiments into a coordinated program with a written use policy, a prioritized automation backlog, and a clear owner for AI strategy.',
  },
  {
    id: 'building-momentum',
    label: 'Building Momentum',
    min: 33,
    max: 40,
    colorVar: 'var(--gold)',
    headline: 'You have real traction. The next step is scale.',
    summary:
      'Multiple teams are using AI tools with leadership awareness and a working governance posture. The next move is disciplined scaling: documented use cases, measured outcomes, and a training function that can sustain the program through turnover and expansion.',
  },
  {
    id: 'ready-to-scale',
    label: 'Ready to Scale',
    min: 41,
    max: 48,
    colorVar: 'var(--ink)',
    headline: 'You are positioned to lead your peer group.',
    summary:
      'Your institution has the culture, governance, and leadership commitment to operate AI as a strategic capability. The opportunity is compounding — codify what works, train the next wave of builders, and convert capability into measurable efficiency gains that compound over time.',
  },
] as const;

export function getTierV3(totalScore: number): Tier {
  const match = tiers.find((t) => totalScore >= t.min && totalScore <= t.max);
  if (!match) {
    throw new Error(`Score ${totalScore} is outside the valid range of 12-48.`);
  }
  return match;
}

export interface DimensionScore {
  readonly score: number;
  readonly maxScore: number;
  readonly label: string;
}

// In v3 each dimension has exactly one question, so getDimensionScores
// returns 12 single-question entries. Kept for shape-compatibility with the
// v2 hook contract; the output surface that will read this is scheduled
// for replacement.
export function getDimensionScores(
  answers: readonly number[],
  sessionQuestions: readonly AssessmentQuestion[],
): Record<Dimension, DimensionScore> {
  const result = {} as Record<Dimension, DimensionScore>;

  for (const dim of Object.keys(DIMENSION_LABELS) as Dimension[]) {
    result[dim] = { score: 0, maxScore: 4, label: DIMENSION_LABELS[dim] };
  }

  sessionQuestions.forEach((question, idx) => {
    const points = answers[idx] ?? 0;
    result[question.dimension] = {
      score: points,
      maxScore: 4,
      label: DIMENSION_LABELS[question.dimension],
    };
  });

  return result;
}
