// JourneyBanner — contextual "next in your journey" banner for cross-course navigation.
// Used at course completion points to guide learners to the next certification level.
// Color-coded to the destination course's accent color.

import Link from 'next/link';

interface JourneyBannerProps {
  readonly from: 'aibi-p' | 'aibi-s' | 'aibi-l';
}

interface JourneyStep {
  readonly label: string;
  readonly heading: string;
  readonly body: string;
  readonly href: string;
  readonly cta: string;
  readonly accent: string;
  readonly accentBg: string;
}

const JOURNEY_STEPS: Record<string, JourneyStep> = {
  'aibi-p': {
    label: 'Next in your journey',
    heading: 'Ready to scale your skills across a department?',
    body: 'AiBI-S is coming after Practitioner is validated. It will focus on workflow automation, agents, internal AI systems, and team-level rollout.',
    href: '/coming-soon?interest=specialist',
    cta: 'Join AiBI-S Waitlist',
    accent: 'var(--color-amber)',
    accentBg: 'var(--color-terra-pale)',
  },
  'aibi-s': {
    label: 'Next in your journey',
    heading: 'Ready to lead your institution\'s AI strategy?',
    body: 'AiBI-L is coming after Practitioner is validated. It will focus on executive confidence, governance, rollout, and institution-level AI leadership.',
    href: '/coming-soon?interest=leader',
    cta: 'Join AiBI-L Waitlist',
    accent: 'var(--color-cobalt)',
    accentBg: 'var(--color-cobalt-pale)',
  },
  'aibi-l': {
    label: 'Full certification ladder complete',
    heading: 'You are equipped to lead AI transformation.',
    body: 'AiBI-Foundation, AiBI-S, and AiBI-L earned. View your complete certification journey and cumulative impact metrics on your dashboard.',
    href: '/dashboard/progression',
    cta: 'View your journey',
    accent: 'var(--color-terra)',
    accentBg: 'var(--color-terra-pale)',
  },
} as const;

export function JourneyBanner({ from }: JourneyBannerProps) {
  const step = JOURNEY_STEPS[from];
  if (!step) return null;

  return (
    <div
      className="rounded-[3px] border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      style={{ borderColor: step.accentBg, backgroundColor: step.accentBg }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="font-serif-sc text-[11px] uppercase tracking-[0.2em] mb-2"
          style={{ color: step.accent }}
        >
          {step.label}
        </p>
        <h3 className="font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-snug mb-2">
          {step.heading}
        </h3>
        <p className="text-sm text-[color:var(--color-slate)] leading-relaxed max-w-xl">
          {step.body}
        </p>
      </div>
      <Link
        href={step.href}
        className="shrink-0 inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3.5 md:py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] text-[color:var(--color-linen)] hover:opacity-90 active:scale-[0.98] transition-all"
        style={{ backgroundColor: step.accent }}
      >
        {step.cta}
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
}
