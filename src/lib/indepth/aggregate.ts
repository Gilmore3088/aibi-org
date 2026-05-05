// computeAggregate — pure logic for the institution leader's anonymized
// aggregate report. Runs server-side from /api/indepth/aggregate. No I/O.
//
// Privacy contract:
//   - Under MIN_RESPONSES (3) completed takers → unlocked: false, no
//     score data of any kind returned.
//   - Once unlocked: only aggregate stats (means, ranges, low/mid/high
//     bucket counts) leave this function. Individual score_total and
//     answers are NEVER included in the output.
//   - Champions are an explicit, narrow exception: emails are exposed
//     because the leader supplied them (as invitees), and only when a
//     taker scored at or above CHAMPION_THRESHOLD. The taker's own
//     overall score is exposed inside their champion entry — that is
//     the value of the "champion" callout.

import { DIMENSION_LABELS, type Dimension } from '@content/assessments/v2/types';
import { getTierV2, tiers } from '@content/assessments/v2/scoring';

export const MIN_RESPONSES = 3;
export const CHAMPION_THRESHOLD = 39;
export const CHAMPION_LIMIT = 2;
export const MAX_PER_DIMENSION = 24; // 6 questions per dimension × 4 points
export const WEAKEST_STRONGEST_COUNT = 2;

const ALL_DIMENSIONS: readonly Dimension[] = [
  'current-ai-usage',
  'experimentation-culture',
  'ai-literacy-level',
  'quick-win-potential',
  'leadership-buy-in',
  'security-posture',
  'training-infrastructure',
  'builder-potential',
];

export interface AggregateTakerInput {
  readonly invite_email: string;
  readonly invite_consumed_at?: string | null;
  readonly completed_at: string | null;
  readonly score_total: number | null;
  readonly score_per_dimension: Record<string, number> | null;
}

export interface AggregateInput {
  readonly institutionName: string;
  readonly seatsPurchased: number;
  readonly takers: ReadonlyArray<AggregateTakerInput>;
}

export interface DimensionAggregate {
  readonly dimension_id: Dimension;
  readonly dimension_label: string;
  readonly average: number;
  readonly range: { readonly min: number; readonly max: number };
  readonly distribution: {
    readonly low: number;
    readonly mid: number;
    readonly high: number;
  };
  readonly weakest_areas: boolean;
  readonly strongest_areas: boolean;
}

export interface ChampionEntry {
  readonly email: string;
  readonly overall_score: number;
  readonly strongest_dimension: string;
}

export interface AggregateOverall {
  readonly average_score: number;
  readonly distribution: Record<string, number>;
  readonly tier_label: string;
}

export interface Aggregate {
  readonly unlocked: boolean;
  readonly institutionName: string;
  readonly seatsPurchased: number;
  readonly responsesReceived: number;
  readonly responsesInProgress: number;
  readonly responsesPending: number;
  readonly overall?: AggregateOverall;
  readonly dimensions?: ReadonlyArray<DimensionAggregate>;
  readonly champions: ReadonlyArray<ChampionEntry>;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function bucketThird(value: number, max: number): 'low' | 'mid' | 'high' {
  const lowCutoff = max / 3;
  const midCutoff = (max * 2) / 3;
  if (value < lowCutoff) return 'low';
  if (value < midCutoff) return 'mid';
  return 'high';
}

export function computeAggregate(input: AggregateInput): Aggregate {
  const { institutionName, seatsPurchased, takers } = input;

  const completed = takers.filter(
    (t): t is AggregateTakerInput & {
      completed_at: string;
      score_total: number;
      score_per_dimension: Record<string, number>;
    } =>
      t.completed_at != null &&
      t.score_total != null &&
      t.score_per_dimension != null
  );

  const responsesReceived = completed.length;
  const responsesInProgress = takers.length - responsesReceived;
  const responsesPending = Math.max(0, seatsPurchased - takers.length);

  if (responsesReceived < MIN_RESPONSES) {
    return {
      unlocked: false,
      institutionName,
      seatsPurchased,
      responsesReceived,
      responsesInProgress,
      responsesPending,
      champions: [],
    };
  }

  // Overall
  const totals = completed.map((t) => t.score_total);
  const averageScore = round1(
    totals.reduce((a, b) => a + b, 0) / totals.length
  );

  const distribution: Record<string, number> = {};
  for (const tier of tiers) distribution[tier.id] = 0;
  for (const total of totals) {
    distribution[getTierV2(total).id] += 1;
  }
  const overallTier = getTierV2(Math.round(averageScore));

  // Dimensions: compute average per dim
  const dimAverages = new Map<Dimension, number>();
  const dimAggregatesUnsorted: Array<{
    dim: Dimension;
    average: number;
    min: number;
    max: number;
    distribution: { low: number; mid: number; high: number };
  }> = [];

  for (const dim of ALL_DIMENSIONS) {
    const values = completed.map((t) => t.score_per_dimension[dim] ?? 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = round1(sum / values.length);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const dist = { low: 0, mid: 0, high: 0 };
    for (const v of values) {
      dist[bucketThird(v, MAX_PER_DIMENSION)] += 1;
    }

    dimAverages.set(dim, avg);
    dimAggregatesUnsorted.push({
      dim,
      average: avg,
      min,
      max,
      distribution: dist,
    });
  }

  // Determine weakest/strongest area sets (lowest 2 / highest 2 by average)
  const sortedByAvg = [...dimAggregatesUnsorted].sort(
    (a, b) => a.average - b.average
  );
  const weakestSet = new Set(
    sortedByAvg.slice(0, WEAKEST_STRONGEST_COUNT).map((d) => d.dim)
  );
  const strongestSet = new Set(
    sortedByAvg.slice(-WEAKEST_STRONGEST_COUNT).map((d) => d.dim)
  );

  const dimensions: DimensionAggregate[] = dimAggregatesUnsorted.map((d) => ({
    dimension_id: d.dim,
    dimension_label: DIMENSION_LABELS[d.dim],
    average: d.average,
    range: { min: d.min, max: d.max },
    distribution: d.distribution,
    weakest_areas: weakestSet.has(d.dim),
    strongest_areas: strongestSet.has(d.dim),
  }));

  // Champions: sort by score_total desc, take up to CHAMPION_LIMIT,
  // filter to score >= CHAMPION_THRESHOLD.
  const championCandidates = [...completed]
    .sort((a, b) => b.score_total - a.score_total)
    .slice(0, CHAMPION_LIMIT)
    .filter((t) => t.score_total >= CHAMPION_THRESHOLD);

  const champions: ChampionEntry[] = championCandidates.map((t) => {
    let strongestDim: Dimension = ALL_DIMENSIONS[0];
    let strongestScore = -Infinity;
    for (const dim of ALL_DIMENSIONS) {
      const v = t.score_per_dimension[dim] ?? 0;
      if (v > strongestScore) {
        strongestScore = v;
        strongestDim = dim;
      }
    }
    return {
      email: t.invite_email,
      overall_score: t.score_total,
      strongest_dimension: DIMENSION_LABELS[strongestDim],
    };
  });

  return {
    unlocked: true,
    institutionName,
    seatsPurchased,
    responsesReceived,
    responsesInProgress,
    responsesPending,
    overall: {
      average_score: averageScore,
      distribution,
      tier_label: overallTier.label,
    },
    dimensions,
    champions,
  };
}
