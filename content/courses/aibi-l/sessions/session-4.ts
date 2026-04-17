// AiBI-L Session 4: The Board Presentation
// 60 minutes | Deliverable: Board-Ready AI Strategy Presentation

import type { WorkshopSession } from '../types';

export const session4: WorkshopSession = {
  number: 4,
  title: 'The Board Presentation',
  durationMinutes: 60,
  startTime: '2:45 PM',
  coreQuestion: 'How do we present this to our board?',
  purpose:
    'Participants leave with a board-ready AI strategy presentation assembled from Sessions 1-3, practiced in a simulated board/examiner scenario, and ready to deliver at their next board meeting.',
  sections: [
    {
      id: '4.1',
      title: 'Assembling the Board Deck',
      content:
        'The facilitator guides participants through assembling a board presentation from the three deliverables produced in Sessions 1-3. The deck follows a six-section structure: The Opportunity (industry data and peer benchmarks from Session 1), Where We Stand (AI Maturity Scorecard results from Session 1), Governance Framework (governance structure and examiner readiness from Session 2), The Financial Case (efficiency ratio modeling and ROI projections from Session 3), The Roadmap (3-year phased approach from Session 3), and The Ask (specific board approval requested).',
    },
    {
      id: '4.2',
      title: 'Practice Presentation',
      content:
        'Each participant or team presents a condensed version of the board deck (5-10 minutes). The facilitator plays the role of a skeptical board member or examiner, challenging assumptions and testing readiness. Sample questions: What happens if the AI tool produces an incorrect lending decision? How do we know this will not become another technology project that does not deliver ROI? What are the regulatory risks? What is the exit plan if our primary AI vendor changes terms?',
    },
    {
      id: '4.3',
      title: 'Q&A Preparation',
      content:
        'The facilitator provides the 10 most common board and examiner questions about AI with suggested response frameworks. Each response framework follows the structure: acknowledge the concern, reference the governance framework, cite the specific mitigation, and state the monitoring plan.',
    },
    {
      id: '4.4',
      title: 'Post-Workshop Support Plan',
      content:
        'The final segment covers the ongoing relationship: quarterly check-ins (30-minute virtual sessions at months 3, 6, 9, and 12), annual governance framework review against evolving regulatory guidance, AiBI-L credential maintenance (valid for 2 years, renewed through governance update submission), and escalation path to consulting or fCAIO engagement if needed.',
    },
  ],
  activity: {
    id: 'activity-4',
    title: 'Board Deck Assembly and Practice',
    description:
      'Assemble the board presentation from Sessions 1-3 deliverables, then present a condensed version with facilitator challenge questions. Confirm the quarterly check-in schedule.',
    estimatedMinutes: 35,
    deliverable: 'Board-Ready AI Strategy Presentation + Quarterly Check-in Schedule',
    facilitationNotes:
      'The practice presentation is the most valuable part of this session. Push participants with difficult questions — they will face harder ones from their actual board. For team workshops, have the CEO present and other participants field questions. End on a high note: affirm what was accomplished in a single day and the concrete next steps.',
  },
  deliverable: 'Board-Ready AI Strategy Presentation',
} as const;
