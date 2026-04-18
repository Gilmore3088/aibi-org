// AiBI-L Session 3: Efficiency Modeling with Your Numbers
// 90 minutes | Deliverable: 3-Year AI Roadmap with ROI Projections

import type { WorkshopSession } from '../types';

export const session3: WorkshopSession = {
  number: 3,
  title: 'Efficiency Modeling with Your Numbers',
  durationMinutes: 90,
  startTime: '1:00 PM',
  coreQuestion:
    'What is the financial case for AI at our institution?',
  purpose:
    'Participants leave with a 3-year AI roadmap that includes department-by-department ROI projections using their institution\'s actual financial data. This is the business case the board can approve.',
  keyTakeaways: [
    'Model efficiency ratio improvement scenarios using your institution\'s actual financial data',
    'Calculate department-by-department ROI projections with FTE counts and automatable hours',
    'Build a phased 3-year AI roadmap calibrated to your maturity scorecard level',
  ],
  sections: [
    {
      id: '3.1',
      title: 'Live Efficiency Ratio Modeling',
      content:
        'Using the institution\'s actual efficiency ratio (collected during the pre-workshop planning call), model the current state versus the community bank median of approximately 65% (FDIC CEIC data, 1992-2025) and the industry-wide average of approximately 55.7% (FDIC Quarterly Banking Profile, Q4 2024). Then model efficiency ratio impact scenarios: 2%, 5%, and 8% reduction in non-interest expense through targeted AI deployment.',
      subsections: [
        {
          id: '3.1.1',
          title: 'Current State Assessment',
          content:
            'Where is the institution\'s efficiency ratio today? How does it trend over the trailing 4 quarters? How does it compare to peers of similar size and charter type? Use FDIC BankFind Suite data for peer benchmarking.',
        },
        {
          id: '3.1.2',
          title: 'Opportunity Sizing',
          content:
            'Model three scenarios of non-interest expense reduction through AI deployment. A 2% reduction represents conservative adoption (back-office automation only). A 5% reduction represents moderate adoption (multiple departments). An 8% reduction represents aggressive adoption (enterprise-wide transformation over 3 years). Map each scenario to efficiency ratio improvement.',
        },
        {
          id: '3.1.3',
          title: 'Realistic Targets',
          content:
            'Calibrate the target to the institution\'s maturity level from the Session 1 scorecard. Starting-level institutions target 1-2% improvement in Year 1. Developing-level institutions target 2-4%. Advanced-level institutions target 4-6%. These are achievable targets, not aspirational projections.',
        },
      ],
    },
    {
      id: '3.2',
      title: 'Department-by-Department Opportunity Sizing',
      content:
        'For each major department (Operations, Lending, Compliance, Finance, Retail), estimate the number of FTEs, the average hours per week spent on automatable tasks, and the projected time savings from AI deployment. Use the institution\'s actual FTE data from the pre-workshop planning call. Automatable hours estimates are calibrated to the institution\'s maturity level and technology stack.',
    },
    {
      id: '3.3',
      title: 'ROI Projection Methodology',
      content:
        'Hourly Rate = Annual Cost per FTE / 2,080 hours. Annual Savings per Department = FTEs x Automatable Hours/Week x Hourly Rate x 50 weeks. Total Annual Savings = Sum across departments. 3-Year Cumulative Savings = Year 1 (40% adoption) + Year 2 (70% adoption) + Year 3 (100% adoption). ROI = Total Savings / Total Investment (training + tools + consulting). Frame savings as capacity reclaimed (hours and efficiency ratio points), not headcount reduction.',
    },
    {
      id: '3.4',
      title: 'Building the Business Case',
      content:
        'The business case document includes: investment required (AiBI-P at $295/seat for staff, AiBI-S at $1,495/seat for managers, AI tools and platform licenses, consulting if applicable), projected returns by department, risk factors (implementation, adoption, regulatory, vendor), a 3-year phased timeline aligned with maturity level, and success metrics (efficiency ratio, time savings, AI use case count, governance compliance).',
    },
  ],
  activity: {
    id: 'activity-3',
    title: '3-Year AI Roadmap',
    description:
      'Build a 3-year AI roadmap with three phases: Foundation (months 1-6: staff training, governance framework, pilot use cases), Build (months 7-18: manager training, departmental automation, measurement), and Scale (months 19-36: enterprise-wide adoption, advanced use cases, continuous improvement). Include ROI projections using the institution\'s actual numbers.',
    estimatedMinutes: 40,
    deliverable: '3-Year AI Roadmap with ROI Projections (board-ready)',
    facilitationNotes:
      'Pre-populate the efficiency model with the institution\'s data before the session. Walk participants through the model step by step — they need to understand and own the numbers, not just receive them. Adjust automatable hours estimates based on participant feedback about their actual workflows. The roadmap must be realistic enough that the CEO would present it to the board with confidence.',
  },
  deliverable: '3-Year AI Roadmap with ROI Projections',
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
  ],
} as const;
