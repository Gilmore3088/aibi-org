// AiBI In-Depth Diagnostic — v4 Scoring
//
// Raw score: 48-192 (48 questions × 1-4 points).
// Normalized: 0-100 (round((raw - 48) / 144 * 100)).
// Maturity bands: Unstructured / Emerging / Building Momentum /
// Controlled Scale / Advanced. Source: spec Section 2.

import type {
  AssessmentQuestion,
  Dimension,
  MaturityBand,
} from './types';
import { DIMENSION_LABELS, MATURITY_BANDS } from './types';

export const TOTAL_QUESTIONS = 48;
export const RAW_MIN = TOTAL_QUESTIONS; // 48
export const RAW_MAX = TOTAL_QUESTIONS * 4; // 192

export function normalize(raw: number): number {
  if (raw <= RAW_MIN) return 0;
  if (raw >= RAW_MAX) return 100;
  return Math.round(((raw - RAW_MIN) / (RAW_MAX - RAW_MIN)) * 100);
}

export function getMaturityBand(normalizedScore: number): MaturityBand {
  const match = MATURITY_BANDS.find(
    (b) => normalizedScore >= b.min && normalizedScore <= b.max,
  );
  if (!match) {
    throw new Error(
      `Normalized score ${normalizedScore} is outside the valid 0-100 range.`,
    );
  }
  return match;
}

export interface DimensionScore {
  readonly dimension: Dimension;
  readonly label: string;
  readonly raw: number; // sum of points across 6 questions
  readonly max: number; // 24 (6 questions × 4)
  readonly normalized: number; // 0-100 for the dimension alone
  readonly band: MaturityBand;
}

export function getDimensionScores(
  answers: readonly number[],
  sessionQuestions: readonly AssessmentQuestion[],
): Record<Dimension, DimensionScore> {
  const buckets: Partial<Record<Dimension, { raw: number; count: number }>> = {};

  for (const dim of Object.keys(DIMENSION_LABELS) as Dimension[]) {
    buckets[dim] = { raw: 0, count: 0 };
  }

  sessionQuestions.forEach((question, idx) => {
    const points = answers[idx] ?? 0;
    const bucket = buckets[question.dimension]!;
    bucket.raw += points;
    bucket.count += 1;
  });

  const result = {} as Record<Dimension, DimensionScore>;
  for (const dim of Object.keys(DIMENSION_LABELS) as Dimension[]) {
    const bucket = buckets[dim]!;
    const max = bucket.count * 4;
    const normalized =
      max === 0
        ? 0
        : Math.round(((bucket.raw - bucket.count) / (max - bucket.count)) * 100);
    const safeNormalized = Math.max(0, Math.min(100, normalized));
    result[dim] = {
      dimension: dim,
      label: DIMENSION_LABELS[dim],
      raw: bucket.raw,
      max,
      normalized: safeNormalized,
      band: getMaturityBand(safeNormalized),
    };
  }
  return result;
}

export function rankDimensions(
  scores: Record<Dimension, DimensionScore>,
): { strongest: DimensionScore; weakest: DimensionScore; sorted: readonly DimensionScore[] } {
  const sorted = Object.values(scores).slice().sort((a, b) => a.normalized - b.normalized);
  return {
    weakest: sorted[0],
    strongest: sorted[sorted.length - 1],
    sorted,
  };
}
