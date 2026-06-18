import { getMaturityBand } from '@content/assessments/v4/scoring';
import { DIMENSION_LABELS, type Dimension, type MaturityBand } from '@content/assessments/v4/types';
import {
  TEAM_ASSESSMENT_SLICE_MIN,
  TEAM_ASSESSMENT_UNLOCK_COMPLETIONS,
  labelForDepartment,
  labelForRole,
} from './constants';

export interface StoredDimensionScore {
  readonly score: number;
  readonly maxScore: number;
  readonly label: string;
}

export interface CompletedTeamAssessmentResponse {
  readonly id: string;
  readonly participant_email?: string;
  readonly department: string;
  readonly department_other?: string | null;
  readonly role: string;
  readonly score: number;
  readonly maturity_band_id: string;
  readonly maturity_band_label: string;
  readonly dimension_breakdown: Record<Dimension, StoredDimensionScore>;
  readonly completed_at: string;
}

export interface ScoreDistribution {
  readonly median: number;
  readonly p25: number;
  readonly p75: number;
  readonly count: number;
}

export interface DimensionAggregate extends ScoreDistribution {
  readonly id: Dimension;
  readonly label: string;
}

export interface SliceAggregate extends ScoreDistribution {
  readonly id: string;
  readonly label: string;
  readonly hidden: boolean;
  readonly lowConfidence: boolean;
  readonly dimensions: readonly DimensionAggregate[];
  readonly strongest: DimensionAggregate | null;
  readonly weakest: DimensionAggregate | null;
}

export interface TeamAssessmentAggregate {
  readonly completionCount: number;
  readonly unlocked: boolean;
  readonly overall: (ScoreDistribution & { readonly band: MaturityBand }) | null;
  readonly dimensions: readonly DimensionAggregate[];
  readonly departments: readonly SliceAggregate[];
  readonly roles: readonly SliceAggregate[];
  readonly strongestDimensions: readonly DimensionAggregate[];
  readonly weakestDimensions: readonly DimensionAggregate[];
}

export function canShowTeamSlice(count: number): boolean {
  return count > 0;
}

export function isLowConfidenceTeamSlice(count: number): boolean {
  return count < TEAM_ASSESSMENT_SLICE_MIN;
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function percentile(values: readonly number[], pct: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.round((sorted.length - 1) * pct)));
  return sorted[idx];
}

function distribution(values: readonly number[]): ScoreDistribution {
  return {
    median: median(values),
    p25: percentile(values, 0.25),
    p75: percentile(values, 0.75),
    count: values.length,
  };
}

function aggregateDimensions(
  responses: readonly CompletedTeamAssessmentResponse[],
): readonly DimensionAggregate[] {
  return (Object.keys(DIMENSION_LABELS) as Dimension[]).map((id) => {
    const values = responses
      .map((r) => r.dimension_breakdown?.[id]?.score)
      .filter((score): score is number => typeof score === 'number');
    return {
      id,
      label: DIMENSION_LABELS[id],
      ...distribution(values),
    };
  });
}

function buildSlices(
  responses: readonly CompletedTeamAssessmentResponse[],
  key: 'department' | 'role',
): readonly SliceAggregate[] {
  const groups = new Map<string, CompletedTeamAssessmentResponse[]>();
  for (const response of responses) {
    const id = response[key];
    const group = groups.get(id) ?? [];
    group.push(response);
    groups.set(id, group);
  }

  return [...groups.entries()]
    .map(([id, rows]) => {
      const hidden = !canShowTeamSlice(rows.length);
      const lowConfidence = isLowConfidenceTeamSlice(rows.length);
      const dims = hidden ? [] : aggregateDimensions(rows);
      const sortedDims = [...dims].sort((a, b) => a.median - b.median);
      return {
        id,
        label:
          key === 'department'
            ? labelForDepartment(id, rows[0]?.department_other)
            : labelForRole(id),
        hidden,
        lowConfidence,
        ...distribution(rows.map((r) => r.score)),
        dimensions: dims,
        weakest: sortedDims[0] ?? null,
        strongest: sortedDims[sortedDims.length - 1] ?? null,
      };
    })
    .sort((a, b) => {
      if (a.hidden !== b.hidden) return a.hidden ? 1 : -1;
      if (a.lowConfidence !== b.lowConfidence) return a.lowConfidence ? 1 : -1;
      return a.median - b.median;
    });
}

export function aggregateTeamAssessment(
  responses: readonly CompletedTeamAssessmentResponse[],
): TeamAssessmentAggregate {
  const completionCount = responses.length;
  const unlocked = completionCount >= TEAM_ASSESSMENT_UNLOCK_COMPLETIONS;
  const dimensions = aggregateDimensions(responses);
  const sortedDimensions = [...dimensions].sort((a, b) => a.median - b.median);
  const overallScores = responses.map((r) => r.score);
  const overallDistribution = overallScores.length > 0 ? distribution(overallScores) : null;

  return {
    completionCount,
    unlocked,
    overall: overallDistribution
      ? {
          ...overallDistribution,
          band: getMaturityBand(overallDistribution.median),
        }
      : null,
    dimensions,
    departments: buildSlices(responses, 'department'),
    roles: buildSlices(responses, 'role'),
    strongestDimensions: sortedDimensions.slice(-3).reverse(),
    weakestDimensions: sortedDimensions.slice(0, 3),
  };
}
