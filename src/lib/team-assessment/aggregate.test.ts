import { describe, expect, it } from 'vitest';
import { DIMENSION_LABELS, type Dimension } from '@content/assessments/v4/types';
import {
  aggregateTeamAssessment,
  canShowTeamSlice,
  isLowConfidenceTeamSlice,
  type CompletedTeamAssessmentResponse,
} from './aggregate';

const dims = Object.keys(DIMENSION_LABELS) as Dimension[];

function response(
  index: number,
  score: number,
  department: string,
  role = 'operations',
): CompletedTeamAssessmentResponse {
  const dimension_breakdown = {} as CompletedTeamAssessmentResponse['dimension_breakdown'];
  dims.forEach((id, dimIndex) => {
    dimension_breakdown[id] = {
      score: Math.max(0, Math.min(100, score - dimIndex)),
      maxScore: 100,
      label: DIMENSION_LABELS[id],
    };
  });
  return {
    id: `response-${index}`,
    participant_email: `person-${index}@bank.test`,
    department,
    role,
    score,
    maturity_band_id: 'building-momentum',
    maturity_band_label: 'Building Momentum',
    dimension_breakdown,
    completed_at: new Date(2026, 0, index + 1).toISOString(),
  };
}

describe('team assessment aggregation', () => {
  it('shows non-empty slices and marks small samples as directional', () => {
    expect(canShowTeamSlice(0)).toBe(false);
    expect(canShowTeamSlice(1)).toBe(true);
    expect(isLowConfidenceTeamSlice(4)).toBe(true);
    expect(isLowConfidenceTeamSlice(5)).toBe(false);
  });

  it('unlocks at 10 completions and keeps small slices visible with a low-confidence flag', () => {
    const responses = [
      response(1, 50, 'operations'),
      response(2, 55, 'operations'),
      response(3, 60, 'operations'),
      response(4, 65, 'operations'),
      response(5, 70, 'operations'),
      response(6, 75, 'executive'),
      response(7, 80, 'executive'),
      response(8, 85, 'executive'),
      response(9, 90, 'executive'),
      response(10, 95, 'it-infosec'),
    ];

    const aggregate = aggregateTeamAssessment(responses);

    expect(aggregate.unlocked).toBe(true);
    expect(aggregate.completionCount).toBe(10);
    expect(aggregate.overall?.median).toBe(73);
    expect(aggregate.departments.find((d) => d.id === 'operations')?.hidden).toBe(false);
    expect(aggregate.departments.find((d) => d.id === 'operations')?.lowConfidence).toBe(false);
    expect(aggregate.departments.find((d) => d.id === 'executive')?.hidden).toBe(false);
    expect(aggregate.departments.find((d) => d.id === 'executive')?.lowConfidence).toBe(true);
    expect(aggregate.departments.find((d) => d.id === 'it-infosec')?.hidden).toBe(false);
    expect(aggregate.departments.find((d) => d.id === 'it-infosec')?.lowConfidence).toBe(true);
    expect(aggregate.departments.find((d) => d.id === 'it-infosec')?.weakest).not.toBeNull();
  });
});
