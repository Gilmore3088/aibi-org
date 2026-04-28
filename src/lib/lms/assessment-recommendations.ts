import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';

export interface AssessmentGap {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

export interface AssessmentNextStep {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly cta: string;
}

export function getTopAssessmentGaps(
  dimensionBreakdown: Record<Dimension, DimensionScore>,
  limit = 3,
): readonly AssessmentGap[] {
  return (Object.entries(dimensionBreakdown) as [Dimension, DimensionScore][])
    .map(([id, data]) => ({
      id,
      label: DIMENSION_LABELS[id],
      score: data.score,
      maxScore: data.maxScore,
      pct: data.maxScore > 0 ? data.score / data.maxScore : 0,
    }))
    .sort((a, b) => a.pct - b.pct || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function getAssessmentNextStep(tierId: Tier['id']): AssessmentNextStep {
  switch (tierId) {
    case 'starting-point':
      return {
        title: 'Start the Practitioner Course',
        description:
          'Build safe daily AI habits before your institution invests in broader automation.',
        href: '/courses/aibi-p',
        cta: 'Start Practitioner Course',
      };
    case 'early-stage':
      return {
        title: 'Earn the Practitioner Credential',
        description:
          'Turn isolated experimentation into a shared staff baseline with practical exercises and artifacts.',
        href: '/courses/aibi-p',
        cta: 'Preview AiBI-P',
      };
    case 'building-momentum':
      return {
        title: 'Move From Usage to Measured Wins',
        description:
          'Your next step is documenting use cases, practice habits, and outcomes that leaders can trust.',
        href: '/coming-soon?interest=specialist',
        cta: 'Join Specialist Waitlist',
      };
    case 'ready-to-scale':
      return {
        title: 'Book an Executive Briefing',
        description:
          'Use your maturity to shape a bank-wide AI operating model, training cadence, and board story.',
        href: process.env.NEXT_PUBLIC_CALENDLY_URL ?? '/services',
        cta: 'Book Executive Briefing',
      };
  }
}

export function getFirstPracticeRecommendation(tierId: Tier['id']): string {
  switch (tierId) {
    case 'starting-point':
      return 'Start with: rewrite a messy internal email into a clear, professional message.';
    case 'early-stage':
      return 'Start with: convert a risky prompt into a safe prompt with placeholders.';
    case 'building-momentum':
      return 'Start with: spot unsupported claims in an AI-generated banking response.';
    case 'ready-to-scale':
      return 'Start with: classify proposed AI use cases as green, yellow, or red.';
  }
}
