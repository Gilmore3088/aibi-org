// Shared definitions for the free readiness funnel (v2 + v3).
//
// v2 and v3 intentionally share the same four tier ids (so downstream
// consumers — sequences, dashboards — never branch on assessment version)
// and the same generic activation content. Those definitions used to be
// copied byte-for-byte into both content/assessments/v2 and /v3; keeping a
// single copy here prevents the two from drifting.
//
// This module is dimension-agnostic on purpose: the per-version dimension
// taxonomies stay in their own types.ts, and only the tier + generic
// content shared by both funnels lives here.

export interface Tier {
  readonly id: 'starting-point' | 'early-stage' | 'building-momentum' | 'ready-to-scale';
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly colorVar: string;
  readonly headline: string;
  readonly summary: string;
}

export const tiers: readonly Tier[] = [
  {
    id: 'starting-point',
    label: 'Starting Point',
    min: 12,
    max: 22,
    colorVar: 'var(--ink)',
    headline: 'You are at the beginning of your AI journey.',
    summary:
      'Your institution has meaningful ground to cover before AI adoption produces operational value. The first priority is building foundational staff literacy and identifying one to two repetitive workflows where a quick win is achievable without significant infrastructure investment.',
  },
  {
    id: 'early-stage',
    label: 'Early Stage',
    min: 23,
    max: 32,
    colorVar: 'var(--gold)',
    headline: 'You are experimenting but not yet coordinated.',
    summary:
      'Early signals exist inside your institution, but adoption is uneven and governance is informal. The opportunity is to convert isolated experiments into a coordinated program with a written use policy, a prioritized automation backlog, and a clear owner for AI strategy.',
  },
  {
    id: 'building-momentum',
    label: 'Building Momentum',
    min: 33,
    max: 40,
    colorVar: 'var(--gold)',
    headline: 'You have real traction. The next step is scale.',
    summary:
      'Multiple teams are using AI tools with leadership awareness and a working governance posture. The next move is disciplined scaling: documented use cases, measured outcomes, and a training function that can sustain the program through turnover and expansion.',
  },
  {
    id: 'ready-to-scale',
    label: 'Ready to Scale',
    min: 41,
    max: 48,
    colorVar: 'var(--ink)',
    headline: 'You are positioned to lead your peer group.',
    summary:
      'Your institution has the culture, governance, and leadership commitment to operate AI as a strategic capability. The opportunity is compounding — codify what works, train the next wave of builders, and convert capability into measurable efficiency gains that compound over time.',
  },
] as const;

// Generic, tier-independent activation content shared by both free funnels.
export const SIGNATURE_INSIGHT =
  "Most institutions do not fail because employees refuse to use AI. They struggle because experimentation spreads faster than operational standards.";

export const SEVEN_DAY_PLAN: ReadonlyArray<{ readonly day: number; readonly action: string }> = [
  { day: 1, action: 'Choose one internal workflow to test (start with your recommended use case).' },
  { day: 2, action: 'Run the workflow manually using AI.' },
  { day: 3, action: 'Review the output for clarity, accuracy, and tone.' },
  { day: 4, action: 'Refine your prompt and test again.' },
  { day: 5, action: 'Measure time saved versus your current process.' },
  { day: 6, action: 'Share results with one colleague or manager.' },
  { day: 7, action: 'Decide whether to expand or formalize the workflow.' },
];

// ---------------------------------------------------------------------------
// CLOSING CTA — tier-keyed. Shared by both free funnels (v2 + v3): the same
// three-ranked-CTA strategy applies to every free-assessment taker, so the
// copy is identical and lives here once.
//
// Three ranked CTAs per tier. For tiers 1–3 the primary is always
// AiBI-Foundation ($295) — the next constraint for almost every free-
// assessment taker is structured capability, not another diagnostic.
// In-Depth ($99) sits as secondary for institutions that want a deeper
// read before committing. Tier 4 (Ready to Scale) inverts the order:
// they already have foundations, so the primary becomes Advisory.
// ---------------------------------------------------------------------------

export interface CtaOffer {
  readonly label: string;
  readonly href: string;
  readonly source: 'free-results-primary' | 'free-results-secondary' | 'free-results-tertiary';
}

export interface TierClosingCta {
  readonly eyebrow: string;
  readonly headline: string;
  readonly body: string;
  readonly primary: CtaOffer;
  readonly secondary: CtaOffer;
  readonly tertiary: CtaOffer;
}

export const TIER_CLOSING_CTA: Record<Tier['id'], TierClosingCta> = {
  'starting-point': {
    eyebrow: 'Your next move',
    headline: 'Start with AiBI-Foundation.',
    body:
      "Your score says AI is already being used inside your organization without consistent training or guardrails. The fastest way to fix that is to build internal capability — one workflow owner, one safe-use habit, one repeatable workflow at a time. AiBI-Foundation is twelve self-paced modules built for banking professionals.",
    primary: {
      label: 'Enroll in AiBI-Foundation · $295',
      href: '/courses/foundation/program',
      source: 'free-results-primary',
    },
    secondary: {
      label: 'Or take the In-Depth Assessment · $99',
      href: '/assessment/in-depth',
      source: 'free-results-secondary',
    },
    tertiary: {
      label: 'Request an Executive Briefing',
      href: '/for-institutions',
      source: 'free-results-tertiary',
    },
  },
  'early-stage': {
    eyebrow: 'Your next move',
    headline: 'Turn experimentation into capability.',
    body:
      "You have curiosity and a few early wins. The next constraint is not another tool — it is structured AI capability your team can replicate. AiBI-Foundation gives each staff member a safe-use checklist, a prompt builder, and reusable banking workflows. Take it as a team and codify what's already working.",
    primary: {
      label: 'Enroll in AiBI-Foundation · $295',
      href: '/courses/foundation/program',
      source: 'free-results-primary',
    },
    secondary: {
      label: 'Or take the In-Depth Assessment · $99',
      href: '/assessment/in-depth',
      source: 'free-results-secondary',
    },
    tertiary: {
      label: 'Request an Executive Briefing',
      href: '/for-institutions',
      source: 'free-results-tertiary',
    },
  },
  'building-momentum': {
    eyebrow: 'Your next move',
    headline: 'Standardize what is already working.',
    body:
      "Your teams are producing real value with AI. The risk now is that progress depends on a few motivated individuals. AiBI-Foundation turns those individual wins into a shared baseline — every staff member with the same safe-use habits, the same prompt patterns, the same reusable workflows. It is the cheapest path from fragile momentum to repeatable program.",
    primary: {
      label: 'Enroll in AiBI-Foundation · $295',
      href: '/courses/foundation/program',
      source: 'free-results-primary',
    },
    secondary: {
      label: 'Or take the In-Depth Assessment · $99',
      href: '/assessment/in-depth',
      source: 'free-results-secondary',
    },
    tertiary: {
      label: 'Request an Executive Briefing',
      href: '/for-institutions',
      source: 'free-results-tertiary',
    },
  },
  'ready-to-scale': {
    eyebrow: 'Your next move',
    headline: 'Talk to us about Leadership Advisory.',
    body:
      "Your institution has built real AI capability. The opportunity now is leadership judgment — what to prioritize next, how to measure outcomes, how to defend the program at the board level. Leadership Advisory is fractional Chief AI Officer work for institutions with internal momentum. AiBI-Foundation stays available as the onboarding path for every new hire.",
    primary: {
      label: 'Request a conversation',
      href: '/for-institutions',
      source: 'free-results-primary',
    },
    secondary: {
      label: 'Onboard new hires with AiBI-Foundation · $295',
      href: '/courses/foundation/program',
      source: 'free-results-secondary',
    },
    tertiary: {
      label: 'Take the In-Depth Assessment · $99',
      href: '/assessment/in-depth',
      source: 'free-results-tertiary',
    },
  },
};
