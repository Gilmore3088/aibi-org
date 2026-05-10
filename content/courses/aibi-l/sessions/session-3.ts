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
    'Participants leave with a 3-year AI roadmap that includes department-by-department ROI projections using their institution\'s actual financial data. This is the business case the board can approve, defend in the audit committee, and revisit at every quarterly review.',
  sections: [
    {
      id: '3.1',
      title: 'Live Efficiency Ratio Modeling',
      content:
        'The efficiency ratio is the single number that compresses an institution\'s entire operating story into a percentage point. It is the number examiners reference, the number analysts model, and the number boards lose patience over. AI investment that does not eventually move this number will not survive a budget cycle. This session begins with the institution\'s actual efficiency ratio (collected during the pre-workshop planning call) and models it against the community bank median of approximately 65% (FDIC CEIC data, 1992-2025) and the industry-wide average of approximately 55.7% (FDIC Quarterly Banking Profile, Q4 2024). From there, we model what targeted AI deployment could realistically achieve over a 3-year horizon.',
      subsections: [
        {
          id: '3.1.1',
          title: 'Current State Assessment',
          content:
            'The exercise begins with the institution\'s trailing-four-quarter efficiency ratio plotted against peer institutions of similar charter type and asset size, using FDIC BankFind Suite data. Most leadership teams have an internal narrative about why their ratio sits where it does — branch density, deposit mix, technology spend, talent investment. Surfacing that narrative explicitly is the first step in deciding which operational levers AI can actually move and which it cannot. Be specific: name the cost categories that drive the gap.',
        },
        {
          id: '3.1.2',
          title: 'Opportunity Sizing',
          content:
            'Three scenarios are modeled side by side: a 2% reduction in non-interest expense (conservative — back-office automation only), a 5% reduction (moderate — multiple departments), and an 8% reduction (aggressive — enterprise-wide transformation across 3 years). Each scenario is converted into efficiency ratio improvement using the institution\'s revenue base. The goal is not to predict an outcome but to bracket the possible outcomes so the board can choose its risk appetite consciously rather than by default. Conservative scenarios protect credibility; aggressive scenarios test the institution\'s tolerance for ambition.',
        },
        {
          id: '3.1.3',
          title: 'Realistic Targets',
          content:
            'Targets are calibrated to the maturity level produced by the Session 1 scorecard, not to peer-pressure benchmarks. Starting-level institutions target 1-2% improvement in Year 1, with most of the gain in Year 3. Developing-level institutions target 2-4% with a steeper Year 2 ramp. Advanced-level institutions target 4-6% and can credibly promise enterprise-wide measurement infrastructure by Year 1. Targets that exceed the maturity level fail in execution; targets below it leave value on the table and signal a lack of seriousness to the board.',
        },
      ],
    },
    {
      id: '3.2',
      title: 'Department-by-Department Opportunity Sizing',
      content:
        'For each major department — Operations, Lending, Compliance, Finance, and Retail — we estimate three numbers: FTE count, average hours per week per FTE spent on automatable tasks, and projected time savings from AI deployment over Years 1 and 3. The FTE data comes from the pre-workshop planning call. The automatable-hours estimates are calibrated to the institution\'s technology stack and maturity level, drawing on use-case data from the Cornerstone Advisors AI Playbook for Banks and Credit Unions (2025). Operations typically shows the highest near-term opportunity (meeting summarization, exception report processing, document routing); Lending and Compliance show the highest medium-term opportunity once governance is in place.',
    },
    {
      id: '3.3',
      title: 'ROI Projection Methodology',
      content:
        'The model is intentionally simple so that any board member can audit it. Hourly Rate equals Annual Cost per FTE divided by 2,080 hours. Annual Savings per Department equals FTEs multiplied by Automatable Hours per Week multiplied by Hourly Rate multiplied by 50 weeks. Total Annual Savings is the sum across departments. Three-Year Cumulative Savings applies an adoption ramp — 40% in Year 1, 70% in Year 2, 100% in Year 3 — to acknowledge that capability does not arrive on a switch. ROI equals Total Savings divided by Total Investment (training, tools, consulting). Crucially, savings are framed as capacity reclaimed (hours and efficiency-ratio points), not as headcount reduction. Boards in community banking respond to capacity; they react against headcount narratives that put their charter culture at risk.',
    },
    {
      id: '3.4',
      title: 'Building the Business Case',
      content:
        'The business case document assembles the model into a board-defensible narrative with five components. First, investment required: AiBI Foundations at $295 per seat for staff, AiBI-S at $1,495 per seat for managers, AI tools and platform licenses, and consulting if applicable. Second, projected returns by department, with the Year 1 number deliberately conservative to set up an early credibility win. Third, risk factors: implementation risk, adoption risk, regulatory risk, and vendor concentration risk — each paired with the mitigation that the governance framework from Session 2 already addresses. Fourth, a 3-year phased timeline aligned to the maturity level. Fifth, success metrics that the board can track at every meeting: efficiency ratio, time savings by department, governed AI use case count, and governance compliance status.',
    },
  ],
  activity: {
    id: 'activity-3',
    title: '3-Year AI Roadmap',
    description:
      'Build a 3-year AI roadmap with three phases. Foundation (months 1-6): staff AiBI Foundations training, governance framework approval, three to five pilot use cases deployed under governance. Build (months 7-18): department manager AiBI-S training, departmental automation, measurement infrastructure. Scale (months 19-36): enterprise-wide adoption, advanced use cases, continuous improvement. Each phase carries explicit milestones, named owners, and ROI projections built from the institution\'s actual FTE and cost-per-FTE data.',
    estimatedMinutes: 40,
    deliverable: '3-Year AI Roadmap with ROI Projections (board-ready)',
    facilitationNotes:
      'Pre-populate the efficiency model with the institution\'s data before the session — participants should never see a blank template. Walk through the model line by line so participants own the assumptions, not just the conclusions. When a participant pushes back on an automatable-hours estimate, adjust live and re-run the model; the willingness to adjust is itself the credibility-building moment. The CEO must be able to present the roadmap to the board with confidence the next morning, so any number that cannot survive a CFO challenge gets revised before the deliverable is finalized.',
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
    {
      value: '57% of FIs struggle with AI skill gaps',
      source: 'Gartner Peer Community (via Jack Henry)',
      year: '2025',
    },
    {
      value: '48% lack clarity on AI business impacts',
      source: 'Gartner (via Jack Henry)',
      year: '2025',
    },
  ],
} as const;
