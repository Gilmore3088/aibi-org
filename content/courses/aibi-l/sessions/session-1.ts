// AiBI-L Session 1: The Strategic Landscape
// 90 minutes | Deliverable: AI Maturity Scorecard

import type { WorkshopSession } from '../types';

export const session1: WorkshopSession = {
  number: 1,
  title: 'The Strategic Landscape',
  durationMinutes: 90,
  startTime: '9:00 AM',
  coreQuestion:
    'Where is AI heading in community banking, and where does our institution stand?',
  purpose:
    'Participants leave with a data-driven understanding of the AI opportunity in community banking and a completed AI Maturity Scorecard that quantifies their current position.',
  sections: [
    {
      id: '1.1',
      title: 'The Efficiency Ratio Opportunity',
      content:
        'Community banks operate at a median efficiency ratio of approximately 65%, compared to an industry-wide average of approximately 55.7% (FDIC Quarterly Banking Profile, Q4 2024). That gap represents the operational cost structure of community banking. Targeted AI deployment in high-frequency, high-standardization workflows can meaningfully improve the ratio over a 3-year horizon.',
    },
    {
      id: '1.2',
      title: 'What Peer Institutions Are Doing',
      content:
        'The majority of community banks are aware of AI, budgeting for it, but lack the skills, governance, and clarity to deploy it effectively. This is an opportunity window — not a crisis — but the window is closing as larger institutions and fintechs move faster.',
      subsections: [
        {
          id: '1.2.1',
          title: 'Industry Readiness Data',
          content:
            '66% of banks are discussing AI budget allocation (Bank Director 2024 Technology Survey, via Jack Henry). 57% of financial institutions report struggling with AI skill gaps (Gartner Peer Community, via Jack Henry). 55% have no AI governance framework yet (Gartner, via Jack Henry). 48% lack clarity on AI business impacts (Gartner, via Jack Henry).',
        },
        {
          id: '1.2.2',
          title: 'Consumer Expectation Shift',
          content:
            '84% of consumers would switch financial institutions for AI-driven financial insights (Personetics 2025, via Apiture). 62% are open to AI-powered fee alerts (2025 consumer survey, via Apiture). 76% would switch for a better digital experience (Motley Fool, via Apiture). These numbers represent member and customer expectations that community banks must meet to retain relationships.',
        },
      ],
    },
    {
      id: '1.3',
      title: 'Case Studies: Community Banks That Moved First',
      content:
        'Real-world AI deployments at community banks and credit unions, drawn from the Cornerstone Advisors AI Playbook for Banks and Credit Unions (2025). Covers back-office automation, lending workflow, compliance, and member experience use cases.',
      subsections: [
        {
          id: '1.3.1',
          title: 'AI Use Cases by Department',
          content:
            'Operations: meeting summarization, exception report processing, document routing (Fathom, Zoom AI Companion, Power Automate). Lending: loan file completeness checks, covenant monitoring, pipeline reporting. Compliance: regulatory change monitoring, policy gap analysis. Finance: variance analysis, board reporting, ALCO support. Retail: member communications, FAQ automation, service optimization.',
        },
      ],
    },
  ],
  activity: {
    id: 'activity-1',
    title: 'AI Maturity Scorecard',
    description:
      'Complete an institutional AI Maturity Scorecard covering six dimensions: Strategic Clarity, Governance Readiness, Talent and Skills, Technology Foundation, Data Readiness, and Culture and Change Management. Each dimension scored 1-5.',
    estimatedMinutes: 30,
    deliverable: 'Completed AI Maturity Scorecard with dimension-level scores and total',
    facilitationNotes:
      'Guide participants through each dimension with probing questions. Encourage honest scoring — the scorecard is a diagnostic tool, not a performance review. Reference the maturity levels (Advanced 25-30, Developing 19-24, Early 13-18, Starting 6-12) after scoring.',
  },
  deliverable: 'AI Maturity Scorecard (institution-specific)',
  statistics: [
    {
      value: 'Community bank median efficiency ratio ~65%',
      source: 'FDIC CEIC data, 1992-2025',
      year: 'Ongoing',
    },
    {
      value: 'Industry-wide efficiency ratio ~55.7%',
      source: 'FDIC Quarterly Banking Profile Q4 2024',
      year: '2024',
    },
    {
      value: '66% of banks discussing AI budget',
      source: 'Bank Director 2024 Technology Survey (via Jack Henry)',
      year: '2024',
    },
    {
      value: '57% of FIs struggle with AI skill gaps',
      source: 'Gartner Peer Community (via Jack Henry)',
      year: '2025',
    },
    {
      value: '55% have no AI governance framework yet',
      source: 'Gartner (via Jack Henry)',
      year: '2025',
    },
    {
      value: '48% lack clarity on AI business impacts',
      source: 'Gartner (via Jack Henry)',
      year: '2025',
    },
    {
      value: '84% would switch FIs for AI-driven insights',
      source: 'Personetics 2025 (via Apiture)',
      year: '2025',
    },
    {
      value: '62% open to AI-powered fee alerts',
      source: '2025 consumer survey (via Apiture)',
      year: '2025',
    },
    {
      value: '76% would switch for better digital experience',
      source: 'Motley Fool (via Apiture)',
      year: '2025',
    },
  ],
} as const;
