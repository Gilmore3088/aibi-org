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
