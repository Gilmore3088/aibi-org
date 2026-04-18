// AiBI-L Session 2: Governance and Examiner Readiness
// 90 minutes | Deliverable: AI Governance Framework Draft

import type { WorkshopSession } from '../types';

export const session2: WorkshopSession = {
  number: 2,
  title: 'Governance and Examiner Readiness',
  durationMinutes: 90,
  startTime: '10:45 AM',
  coreQuestion:
    'What governance framework do we need, and what will examiners ask?',
  purpose:
    'Participants leave with a working AI governance framework draft, an understanding of examiner expectations for AI, and a started AI use case inventory.',
  keyTakeaways: [
    'Draft an AI governance framework with ownership, approval workflow, and monitoring cadence',
    'Build an AI use case inventory with risk classification and data tier for each tool',
    'Prepare responses for the six categories of examiner questions about AI governance',
  ],
  sections: [
    {
      id: '2.1',
      title: 'The Regulatory Landscape for AI in Banking',
      content:
        'There is no comprehensive AI-specific banking regulatory framework yet (GAO-25-107197, US GAO, May 2025). Instead, existing frameworks apply: SR 11-7 (Model Risk Management) for AI models in decision-making, Interagency Third-Party Risk Management Guidance for AI vendors, ECOA/Reg B for AI in credit decisions, and the AIEOG AI Lexicon (US Treasury / FBIIC / FSSCC, Feb 2026) for official definitions of AI governance terms.',
      subsections: [
        {
          id: '2.1.1',
          title: 'SR 11-7: Model Risk Management',
          content:
            'Applies to AI models used in decision-making. Requires model validation, ongoing monitoring, and documentation. Any AI tool that influences a credit, pricing, or risk decision falls under SR 11-7 oversight.',
        },
        {
          id: '2.1.2',
          title: 'Third-Party Risk Management',
          content:
            'Applies to AI vendors. Requires due diligence at onboarding, ongoing monitoring, and concentration risk assessment. The guidance does not distinguish between AI vendors and other third parties — the same rigor applies.',
        },
        {
          id: '2.1.3',
          title: 'Fair Lending and Consumer Protection',
          content:
            'ECOA/Reg B applies to any AI used in credit decisions. Requires fair lending analysis, adverse action notice capability, and documentation of how the AI model was validated for disparate impact.',
        },
        {
          id: '2.1.4',
          title: 'AIEOG AI Lexicon',
          content:
            'The AIEOG AI Lexicon (US Treasury / FBIIC / FSSCC, Feb 2026) provides official definitions for key AI governance terms: hallucination, AI governance, AI use case inventory, human-in-the-loop (HITL), third-party AI risk, and explainability. Using consistent terminology with examiners demonstrates governance maturity.',
        },
      ],
    },
    {
      id: '2.2',
      title: 'Examiner Expectations: What They Will Ask',
      content:
        'Examiners are not AI experts, but they are increasingly asking about AI governance. Their questions fall into predictable categories: inventory (what tools are in use), governance (who oversees deployment), risk (how AI risk is assessed), data (how data is classified), third-party (vendor evaluation and concentration), and compliance (fair lending and consumer protection for AI-assisted decisions).',
    },
    {
      id: '2.3',
      title: 'AI Use Case Inventory',
      content:
        'A facilitated exercise to identify and document AI tools currently in use or planned at the institution. Each tool is documented with: tool name, department, use case, data tier (Tier 1 public, Tier 2 internal, Tier 3 restricted), risk classification (Low/Medium/High), owner, status (Active/Pilot/Planned), and governance status (Governed/Ungoverned).',
    },
    {
      id: '2.4',
      title: 'Vendor Evaluation and Concentration Risk',
      content:
        'When a single AI vendor provides critical services across multiple departments, concentration risk increases. The evaluation framework covers: capability, security, regulatory alignment, financial viability, and concentration (what percentage of AI capabilities depend on this vendor, and what is the exit plan).',
    },
    {
      id: '2.5',
      title: 'Data Classification at the Board Level',
      content:
        'Board members need to understand data classification at the fiduciary level. Tier 1 (Public): no AI-related data risk. Tier 2 (Internal): requires enterprise-grade AI platforms with acceptable terms. Tier 3 (Restricted): PII, account data, examination findings — never in external AI platforms. The board ensures a data classification policy exists, is enforced, and is reviewed annually.',
    },
  ],
  activity: {
    id: 'activity-2',
    title: 'AI Governance Framework Draft',
    description:
      'Draft the outline of an AI governance framework covering: governance owner, policy scope, approval workflow for new AI use cases, risk classification criteria, monitoring cadence, board reporting format, and incident response procedures.',
    estimatedMinutes: 30,
    deliverable: 'AI Governance Framework Draft (structured outline)',
    facilitationNotes:
      'This is an outline, not a full policy document. The institution\'s compliance team will develop it into a formal policy after the workshop. Focus on decisions (who owns governance? how are new use cases approved?) rather than drafting policy language. If the institution already has governance documents, start from those and identify gaps.',
  },
  deliverable: 'AI Governance Framework Draft',
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
