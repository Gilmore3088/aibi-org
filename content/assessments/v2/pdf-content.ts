// PDF-specific content. Spec 1 cut FUTURE_VISION, FOOTER_CLOSE,
// RECOMMENDED_PATH_INTRO, TIER_INSIGHTS from personalization.ts because
// they were no longer used by the on-screen brief; Spec 2's PDF surface
// re-introduces them as PDF-only content with PDF-tuned phrasing.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import type { Tier } from './scoring';

// Restored from Spec 1's git deletion. Page 10 of the PDF.
export const PDF_FUTURE_VISION: ReadonlyArray<string> = [
  'Staff use AI for internal workflows daily',
  'Prompts follow consistent, reusable patterns',
  'Outputs are reviewed before use',
  'Sensitive data is never exposed',
  'At least 1–3 workflows produce measurable time savings',
];

// Restored from Spec 1's git deletion. Back cover.
export const PDF_FOOTER_CLOSE = {
  headline: 'AI adoption is not a technology problem.',
  body:
    "It's a training and workflow problem. The institutions that move early—and safely—create a measurable advantage.",
};

// Restored from Spec 1's git deletion. Used in the Next Steps trio (page 11).
export const PDF_RECOMMENDED_PATH_INTRO: Record<Tier['id'], string> = {
  'starting-point':
    'Most institutions at your stage make the same mistake: they explore tools before training their team. The fastest path forward is building staff capability first.',
  'early-stage':
    'Most institutions at your stage make the same mistake: they let isolated experiments stay isolated. The fastest path forward is converting those wins into a coordinated program with shared prompt patterns and a documented review step.',
  'building-momentum':
    'Most institutions at your stage make the same mistake: they assume the program will sustain itself. The fastest path forward is measuring outcomes rigorously and codifying the patterns that already work, so the program survives staff turnover.',
  'ready-to-scale':
    "Most institutions at your stage make the same mistake: they slow down because the early wins are visible. The fastest path forward is replicating capability across every new hire — turning today's advantage into a compounding one.",
};

// New for Spec 2. Page 12: governance & citations.
// All citations carry named source per CLAUDE.md brand rules.
export interface RegulatoryCitation {
  readonly source: string;
  readonly year: string;
  readonly relevance: string;
}

export const PDF_REGULATORY_CITATIONS: ReadonlyArray<RegulatoryCitation> = [
  {
    source: 'SR 11-7 — Guidance on Model Risk Management',
    year: 'Federal Reserve, 2011 (re-affirmed 2024)',
    relevance:
      "AI-driven decisioning models fall within the Fed's definition of a \"model\" requiring documented validation, ongoing monitoring, and governance.",
  },
  {
    source: 'Interagency Guidance on Third-Party Risk Management',
    year: 'OCC / FDIC / Federal Reserve, 2023',
    relevance:
      'AI vendors providing tools, models, or hosted inference services are third parties — your institution remains responsible for the customer-facing outcomes.',
  },
  {
    source: 'Equal Credit Opportunity Act (Reg B)',
    year: '12 CFR §1002 — current',
    relevance:
      'AI models touching credit decisions must produce explainable adverse-action notices. Black-box generative outputs in the credit pipeline are non-compliant.',
  },
  {
    source: 'AI Executive Order Group AI Lexicon',
    year: 'US Treasury / FBIIC / FSSCC, February 2026',
    relevance:
      'Establishes the standard vocabulary regulators use when assessing AI programs: "AI use case inventory", "human in the loop", "third-party AI risk", "explainability".',
  },
];

// Tier-specific PDF cover sub-headline. The on-screen brief uses
// PERSONAS[tierId].oneLine; the PDF has a slightly more formal lead.
export const PDF_COVER_SUBHEAD: Record<Tier['id'], string> = {
  'starting-point':
    'Where to begin when AI is on the agenda but not yet on the floor.',
  'early-stage':
    'How to convert isolated experiments into a coordinated program.',
  'building-momentum':
    'How to defend, measure, and scale a program that is already working.',
  'ready-to-scale':
    'How to compound an existing advantage as the next wave of AI capability arrives.',
};

// PDF page 11 — restored Next Steps trio content (cut from on-screen
// in Spec 1). Reformatted for PDF context — no CTAs, since the PDF is
// a static artifact. The "Outcome" line replaces the on-screen CTA.
export interface PdfNextStep {
  readonly number: string;
  readonly category: string;
  readonly title: string;
  readonly body: string;
  readonly bullets: ReadonlyArray<string>;
  readonly outcome: string;
}

export const PDF_NEXT_STEPS_TRIO: ReadonlyArray<PdfNextStep> = [
  {
    number: '01',
    category: 'Training',
    title: 'AiBI-P Practitioner',
    body: 'Enroll relevant staff to build foundational skills inside a safe, repeatable framework.',
    bullets: [
      '12 short modules focused on real work',
      'Reusable prompt systems',
      'SAFE framework',
    ],
    outcome: 'Outcome: your team can safely use AI in daily work within 2 weeks.',
  },
  {
    number: '02',
    category: 'Strategic planning',
    title: 'Executive Briefing',
    body: 'Align leadership on priorities and define a roadmap for scaling AI responsibly across the institution.',
    bullets: [
      'Walk through your results with leadership',
      'Define a phased adoption roadmap',
      'Identify the right first cohort',
    ],
    outcome: 'Outcome: a documented 90-day plan with named owners.',
  },
  {
    number: '03',
    category: 'Governance',
    title: 'AI Use Policy',
    body: 'Document tool usage, data handling, and accountability so your audit team can defend the program.',
    bullets: [
      'Approved tools and data classes',
      'Mandatory human review steps',
      'Retention and incident procedures',
    ],
    outcome: 'Aligned with SR 11-7 model risk guidance and the AIEOG AI Lexicon.',
  },
];
