// AiBI Readiness Assessment — v1 Scoring Rubric
// Score range: 8 (all 1s) to 32 (all 4s) across 8 questions.

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
    min: 8,
    max: 14,
    colorVar: 'var(--color-error)',
    headline: 'You are at the beginning of your AI journey.',
    summary:
      'Your institution has meaningful ground to cover before AI adoption produces operational value. The first priority is building staff literacy and identifying one to two repetitive workflows where a quick win is possible.',
  },
  {
    id: 'early-stage',
    label: 'Early Stage',
    min: 15,
    max: 21,
    colorVar: 'var(--color-terra)',
    headline: 'You are experimenting but not yet coordinated.',
    summary:
      'Early signals exist inside your institution, but adoption is uneven and governance is informal. The opportunity is to convert isolated experiments into a coordinated program with a written use policy and a prioritized automation backlog.',
  },
  {
    id: 'building-momentum',
    label: 'Building Momentum',
    min: 22,
    max: 27,
    colorVar: 'var(--color-terra-light)',
    headline: 'You have real traction. The next step is scale.',
    summary:
      'Multiple teams are using AI tools with leadership awareness and a working governance posture. The next move is disciplined scaling: documented use cases, measured outcomes, and a training function that can sustain the program.',
  },
  {
    id: 'ready-to-scale',
    label: 'Ready to Scale',
    min: 28,
    max: 32,
    colorVar: 'var(--color-sage)',
    headline: 'You are positioned to lead your peer group.',
    summary:
      'Your institution has the culture, governance, and leadership commitment to operate AI as a strategic capability. The opportunity is compounding — codify what works, train the next wave of builders, and convert capability into measurable efficiency gains.',
  },
] as const;

export function getTier(totalScore: number): Tier {
  const match = tiers.find((t) => totalScore >= t.min && totalScore <= t.max);
  if (!match) {
    throw new Error(`Score ${totalScore} is outside the valid range of 8-32.`);
  }
  return match;
}
