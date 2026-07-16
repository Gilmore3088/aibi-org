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
    'The fastest path forward at your stage is building staff capability first. Tools without trained staff produce inconsistent results and unnecessary risk. Start with one course, one team.',
  'early-stage':
    'The fastest path forward at your stage is turning isolated experiments into a coordinated program. Train your team on the same safe-use habits and reusable workflows so wins compound instead of staying local.',
  'building-momentum':
    'The fastest path forward at your stage is standardizing what already works. Codify the prompt patterns and review steps your strongest teams use, then teach them to everyone else.',
  'ready-to-scale':
    "The fastest path forward at your stage is leadership judgment on what to prioritize next, paired with a reliable onboarding path for every new hire. Compound the advantage you've already built.",
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

// PDF page 11 — Next Steps trio. Tier-keyed so the printed report
// reflects the same ranked CTA hierarchy as the on-screen brief:
// tiers 1–3 lead with AiBI-Foundation ($295); tier 4 (Ready to Scale)
// leads with Leadership Advisory. The "rank" line gives the printed
// page a visible primary card and two visually subordinate stacks.
export interface PdfNextStep {
  readonly number: string;
  readonly rank: 'primary' | 'secondary' | 'tertiary';
  readonly category: string;
  readonly title: string;
  readonly price?: string;
  readonly body: string;
  readonly bullets: ReadonlyArray<string>;
  readonly outcome: string;
}

const FOUNDATION_STEP: PdfNextStep = {
  number: '01',
  rank: 'primary',
  category: 'Build internal capability',
  title: 'AiBI-Foundation',
  price: '$295 · self-paced',
  body:
    'Eighteen bite-sized modules built for banking professionals. Every learner finishes with a safe-use checklist, a prompt builder, and reusable workflows they can run in real work the same week.',
  bullets: [
    'AI safe-use checklist + prompt builder',
    'Copilot, ChatGPT, Claude, Perplexity workflows',
    'Local-vs-hosted decision guide + governance starter',
  ],
  outcome:
    'Outcome: every staff member shares the same safe-use habits and the same banking-specific workflow patterns.',
};

const IN_DEPTH_STEP: PdfNextStep = {
  number: '02',
  rank: 'secondary',
  category: 'Individual diagnostic',
  title: 'In-Depth Assessment',
  price: '$99 · 30 minutes',
  body:
    'Eight readiness dimensions for one banking professional, with a personal report, per-dimension root causes, and a starting playbook keyed to the weakest dimensions.',
  bullets: [
    'Eight dimensions of individual AI readiness',
    'Per-dimension root-cause analysis of your weakest areas',
    'Personal action register keyed to the weakest areas',
  ],
  outcome:
    'Outcome: a clear personal readiness readout and next-step plan for the learner’s role.',
};

const EXEC_BRIEFING_STEP: PdfNextStep = {
  number: '03',
  rank: 'tertiary',
  category: 'Leadership conversation',
  title: 'Executive Briefing',
  body:
    'A working session that translates this report into a phased adoption roadmap with leadership at the table — first cohort, first workflows, first measurement gates.',
  bullets: [
    'Walk through results with leadership',
    'Define a phased adoption roadmap',
    'Identify the right first cohort',
  ],
  outcome: 'Outcome: a documented 90-day plan with named owners.',
};

const ADVISORY_STEP_PRIMARY: PdfNextStep = {
  number: '01',
  rank: 'primary',
  category: 'Leadership judgment',
  title: 'Leadership Advisory',
  body:
    'Fractional Chief AI Officer engagement for institutions with internal momentum. Ongoing leadership judgment on what to prioritize, how to measure outcomes, and how to defend the program at the board level.',
  bullets: [
    'Monthly cadence with the leadership team',
    'Outcome measurement + board-level reporting',
    'Phased roadmap that compounds existing capability',
  ],
  outcome:
    "Outcome: AI judgment at the leadership level — without a full-time hire.",
};

const FOUNDATION_STEP_SECONDARY: PdfNextStep = {
  ...FOUNDATION_STEP,
  number: '02',
  rank: 'secondary',
  body:
    'Use AiBI-Foundation as the onboarding path for every new hire. Eighteen bite-sized modules give each new staff member the same safe-use habits and workflow patterns as the rest of your team.',
  outcome:
    'Outcome: a single, reliable onboarding path that compounds your existing AI advantage.',
};

const IN_DEPTH_STEP_TERTIARY: PdfNextStep = {
  ...IN_DEPTH_STEP,
  number: '03',
  rank: 'tertiary',
};

export const PDF_NEXT_STEPS_TRIO: Record<Tier['id'], ReadonlyArray<PdfNextStep>> = {
  'starting-point': [FOUNDATION_STEP, IN_DEPTH_STEP, EXEC_BRIEFING_STEP],
  'early-stage': [FOUNDATION_STEP, IN_DEPTH_STEP, EXEC_BRIEFING_STEP],
  'building-momentum': [FOUNDATION_STEP, IN_DEPTH_STEP, EXEC_BRIEFING_STEP],
  'ready-to-scale': [
    ADVISORY_STEP_PRIMARY,
    FOUNDATION_STEP_SECONDARY,
    IN_DEPTH_STEP_TERTIARY,
  ],
};
