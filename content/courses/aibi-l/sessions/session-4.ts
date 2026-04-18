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
    'Participants leave with a board-ready AI strategy presentation assembled from Sessions 1-3, practiced in a simulated board and examiner scenario, and ready to deliver at their next board meeting. The session converts the day\'s analytical work into a defensible institutional decision.',
  sections: [
    {
      id: '4.1',
      title: 'Assembling the Board Deck',
      content:
        'The deck follows a six-section structure that mirrors how community bank boards already evaluate strategic decisions. The Opportunity (drawn from Session 1) frames industry data and peer benchmarks in language the board recognizes from its existing strategic plan. Where We Stand presents the AI Maturity Scorecard results from Session 1 as an honest current-state snapshot, not a marketing artifact. The Governance Framework section translates the Session 2 framework draft into the language of the institution\'s existing risk committee charter. The Financial Case presents the efficiency ratio modeling and ROI projections from Session 3 in the same format the CFO uses for capital decisions. The Roadmap shows the 3-year phased approach with explicit decision gates. The Ask states exactly what board approval is being requested — a budget line, a policy adoption, a pilot authorization, or all three.',
    },
    {
      id: '4.2',
      title: 'Practice Presentation',
      content:
        'Each participant or team presents a condensed version of the board deck (5-10 minutes) while the facilitator plays the role of a skeptical board member or examiner. The facilitator deliberately escalates: questions begin polite, become technical, and end with the kind of fiduciary challenge that lands in board minutes. Sample questions include: What happens if the AI tool produces an incorrect lending decision and we have to explain it to a regulator? How do we know this is not another technology project that absorbs budget without delivering ROI? What are the regulatory risks, and what is our concrete mitigation plan? What is our exit plan if our primary AI vendor is acquired or changes terms? The objective is not to defeat the participant but to surface the weakest assumption in the deck so it can be reinforced before the actual board meeting.',
    },
    {
      id: '4.3',
      title: 'Q&A Preparation',
      content:
        'The facilitator distributes the ten most common board and examiner questions about AI, with a suggested response framework for each. Every framework follows the same structure: acknowledge the concern, reference the specific provision in the governance framework that addresses it, cite the concrete mitigation already in place or scheduled, and state the monitoring plan that will surface problems early. This structure matters — board members and examiners are reassured by procedural completeness more than by enthusiasm or technical depth. A confident, structured answer to a hard question demonstrates governance maturity in a way that a polished slide cannot.',
    },
    {
      id: '4.4',
      title: 'Post-Workshop Support Plan',
      content:
        'The final segment converts the workshop\'s momentum into a sustained relationship. Quarterly check-ins are 30-minute virtual sessions at months 3, 6, 9, and 12, structured around roadmap progress, regulatory developments, and obstacle removal. The annual governance framework review evaluates the framework against evolving regulatory guidance — the AIEOG Lexicon will be updated, SR 11-7 interpretive letters will continue to issue, and the framework must keep pace. The AiBI-L credential is valid for 2 years and renewed through a governance update submission at the 24-month mark. The escalation path to consulting or fCAIO engagement is named explicitly so the institution knows what is available without feeling pitched.',
    },
  ],
  activity: {
    id: 'activity-4',
    title: 'Board Deck Assembly and Practice',
    description:
      'Assemble the board presentation by stitching the three deliverables from Sessions 1-3 into the six-section structure. Then deliver a condensed version (5-10 minutes) with the facilitator playing skeptical board member and examiner. Confirm the 4-quarter check-in schedule on calendars before participants leave the room.',
    estimatedMinutes: 35,
    deliverable: 'Board-Ready AI Strategy Presentation + Quarterly Check-in Schedule',
    facilitationNotes:
      'The practice presentation is the single most valuable artifact of the entire workshop. Push hard on questions — the participant\'s actual board will push harder, and the room is the safe place to discover weak assumptions. For team workshops, have the CEO present and other participants field functional questions (CFO on ROI, CCO on regulatory risk, CTO on vendor concentration). End the workshop on a high note: name what was accomplished in a single day (a maturity baseline, a governance framework, a 3-year financial case, a board deck), name the concrete next two actions, and confirm the first quarterly check-in on the calendar before anyone leaves the room.',
  },
  deliverable: 'Board-Ready AI Strategy Presentation',
  statistics: [
    {
      value: 'No comprehensive AI-specific banking framework yet',
      source: 'GAO-25-107197, US GAO',
      year: 'May 2025',
    },
    {
      value: '55% have no AI governance framework yet',
      source: 'Gartner (via Jack Henry)',
      year: '2025',
    },
  ],
} as const;
