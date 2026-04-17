// AiBI-L Workshop Content — Barrel Export
// Usage: import { sessions, workshop, getSessionByNumber } from '@content/courses/aibi-l'

export * from './types';
export { session1 } from './sessions/session-1';
export { session2 } from './sessions/session-2';
export { session3 } from './sessions/session-3';
export { session4 } from './sessions/session-4';

import type { WorkshopSession, WorkshopOverview, WorkshopDeliverable } from './types';
import { session1 } from './sessions/session-1';
import { session2 } from './sessions/session-2';
import { session3 } from './sessions/session-3';
import { session4 } from './sessions/session-4';

export const sessions: readonly WorkshopSession[] = [
  session1, session2, session3, session4,
] as const;

export function getSessionByNumber(n: number): WorkshopSession | undefined {
  return sessions.find((s) => s.number === n);
}

export const WORKSHOP_DELIVERABLES: readonly WorkshopDeliverable[] = [
  {
    id: 'maturity-scorecard',
    title: 'AI Maturity Scorecard',
    description:
      'Institution-specific scorecard covering six dimensions of AI readiness, completed during the workshop with your leadership team.',
    producedInSession: 1,
    format: 'Scored worksheet with dimension-level results and total',
  },
  {
    id: 'governance-framework',
    title: 'AI Governance Framework Draft',
    description:
      'Structured outline covering governance ownership, policy scope, approval workflows, risk classification, monitoring cadence, and board reporting format.',
    producedInSession: 2,
    format: 'Framework outline ready for compliance team development',
  },
  {
    id: 'roadmap',
    title: '3-Year AI Roadmap with ROI Projections',
    description:
      'Phased implementation plan with department-by-department ROI projections using your institution\'s actual financial data.',
    producedInSession: 3,
    format: 'Board-ready document with timeline, investment, and projected returns',
  },
  {
    id: 'board-deck',
    title: 'Board Presentation Deck',
    description:
      'Strategy presentation assembled from workshop deliverables, customized with your numbers, and practiced with facilitator challenge questions.',
    producedInSession: 4,
    format: 'Presentation deck ready for board meeting delivery',
  },
  {
    id: 'checkin-schedule',
    title: 'Quarterly Check-in Schedule',
    description:
      'Four 30-minute virtual sessions over 12 months to review roadmap progress, address obstacles, and adjust the plan.',
    producedInSession: 4,
    format: 'Confirmed calendar of 4 quarterly sessions',
  },
  {
    id: 'credential',
    title: 'AiBI-L Credential',
    description:
      'Banking AI Leader credential issued within 5 business days. Valid for 2 years with renewal through governance update submission.',
    producedInSession: 4,
    format: 'Unique credential ID, verifiable online, LinkedIn badge',
  },
] as const;

export const workshop: WorkshopOverview = {
  id: 'aibi-l',
  name: 'AiBI-L',
  fullName: 'Banking AI Leader',
  credentialDisplay: 'AiBI-L -- The AI Banking Institute',
  tagline: 'Strategy, governance, and efficiency modeling for the executives who sign the checks.',
  audience: 'C-suite executives and board members at community banks and credit unions',
  format: '1-day in-person workshop, facilitator-led',
  duration: '1 day (6 hours of facilitated content across 4 sessions)',
  priceIndividual: '$2,800+',
  priceTeam: '$12,000 for team of 8',
  prerequisite: 'Institutional relationship (booked through sales conversation)',
  accent: 'var(--color-sage)',
  sessions: [session1, session2, session3, session4],
  deliverables: WORKSHOP_DELIVERABLES,
  maturityDimensions: [
    {
      id: 'strategic-clarity',
      label: 'Strategic Clarity',
      description: 'Does leadership have a stated AI vision and prioritized use cases?',
      minScore: 1,
      maxScore: 5,
    },
    {
      id: 'governance-readiness',
      label: 'Governance Readiness',
      description:
        'Does the institution have AI policies, a use case inventory, and examiner-ready documentation?',
      minScore: 1,
      maxScore: 5,
    },
    {
      id: 'talent-skills',
      label: 'Talent and Skills',
      description: 'Has staff been trained? Are there internal AI champions?',
      minScore: 1,
      maxScore: 5,
    },
    {
      id: 'technology-foundation',
      label: 'Technology Foundation',
      description: 'Is the technology stack AI-ready? Are integrations possible?',
      minScore: 1,
      maxScore: 5,
    },
    {
      id: 'data-readiness',
      label: 'Data Readiness',
      description: 'Is data classified, accessible, and governed?',
      minScore: 1,
      maxScore: 5,
    },
    {
      id: 'culture-change',
      label: 'Culture and Change Management',
      description: 'Is leadership supportive? Is there appetite for experimentation?',
      minScore: 1,
      maxScore: 5,
    },
  ],
  maturityLevels: [
    {
      label: 'Advanced',
      minScore: 25,
      maxScore: 30,
      implication:
        'Ready to scale AI across the institution. Focus on governance and measurement.',
    },
    {
      label: 'Developing',
      minScore: 19,
      maxScore: 24,
      implication:
        'Foundation in place. Prioritize governance framework and pilot programs.',
    },
    {
      label: 'Early',
      minScore: 13,
      maxScore: 18,
      implication:
        'Awareness exists but infrastructure and skills are lacking. Start with staff training.',
    },
    {
      label: 'Starting',
      minScore: 6,
      maxScore: 12,
      implication:
        'Minimal AI engagement. Begin with executive education and strategic visioning.',
    },
  ],
} as const;
