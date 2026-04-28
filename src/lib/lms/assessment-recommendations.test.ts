import { describe, expect, it } from 'vitest';
import {
  getAssessmentNextStep,
  getFirstPracticeRecommendation,
  getTopAssessmentGaps,
} from './assessment-recommendations';
import type { Dimension } from '@content/assessments/v2/types';
import type { DimensionScore } from '@content/assessments/v2/scoring';

const breakdown: Record<Dimension, DimensionScore> = {
  'current-ai-usage': { score: 4, maxScore: 4, label: 'Current AI Usage' },
  'experimentation-culture': { score: 2, maxScore: 4, label: 'Experimentation Culture' },
  'ai-literacy-level': { score: 1, maxScore: 4, label: 'AI Literacy Level' },
  'quick-win-potential': { score: 3, maxScore: 4, label: 'Quick Win Potential' },
  'leadership-buy-in': { score: 4, maxScore: 4, label: 'Leadership Buy-In' },
  'security-posture': { score: 1, maxScore: 4, label: 'Security Posture' },
  'training-infrastructure': { score: 2, maxScore: 4, label: 'Training Infrastructure' },
  'builder-potential': { score: 4, maxScore: 4, label: 'Builder Potential' },
};

describe('getTopAssessmentGaps', () => {
  it('returns the lowest scoring dimensions first', () => {
    const gaps = getTopAssessmentGaps(breakdown);
    expect(gaps).toHaveLength(3);
    expect(gaps.map((gap) => gap.id)).toEqual([
      'ai-literacy-level',
      'security-posture',
      'experimentation-culture',
    ]);
  });
});

describe('assessment next steps', () => {
  it('routes lower tiers to AiBI-P', () => {
    expect(getAssessmentNextStep('starting-point').href).toBe('/courses/aibi-p');
    expect(getAssessmentNextStep('early-stage').href).toBe('/courses/aibi-p');
  });

  it('returns a concrete practice recommendation', () => {
    expect(getFirstPracticeRecommendation('building-momentum')).toContain('unsupported claims');
  });
});
