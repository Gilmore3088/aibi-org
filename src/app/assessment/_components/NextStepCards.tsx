'use client';

import Link from 'next/link';
import type { Tier } from '@content/assessments/v1/scoring';

interface NextStep {
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly cta: string;
  readonly accent: string;
  readonly primary?: boolean;
}

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

function getStepsForTier(tierId: Tier['id']): readonly NextStep[] {
  switch (tierId) {
    case 'starting-point':
      return [
        {
          label: 'Recommended',
          title: 'Start with the Practitioner course',
          description:
            'Nine self-paced modules that build hands-on AI proficiency for every staff member. Earn the AiBI-P credential with a real work product — not a multiple-choice test.',
          href: '/courses/aibi-p',
          cta: 'Explore AiBI-P',
          accent: 'var(--color-terra)',
          primary: true,
        },
        {
          label: 'When you are ready',
          title: 'Request an Executive Briefing',
          description:
            'A free 45-minute conversation where we walk through what your score means, share peer benchmarks from FDIC data, and outline what the first 90 days would look like.',
          href: CALENDLY_URL,
          cta: 'Request Executive Briefing',
          accent: 'var(--color-ink)',
        },
      ];

    case 'early-stage':
      return [
        {
          label: 'Recommended',
          title: 'Earn the Practitioner credential',
          description:
            'Your institution has early adopters. Give them the tools to lead with confidence. The AiBI-P course builds governed, repeatable AI skills across nine self-paced modules.',
          href: '/courses/aibi-p',
          cta: 'Explore AiBI-P',
          accent: 'var(--color-terra)',
          primary: true,
        },
        {
          label: 'Get guidance',
          title: 'Book an Executive Briefing',
          description:
            'A free 45-minute conversation to convert scattered experiments into a coordinated program with governance and measured outcomes.',
          href: CALENDLY_URL,
          cta: 'Request Executive Briefing',
          accent: 'var(--color-ink)',
        },
      ];

    // 2026-05-05: AiBI-S and AiBI-L hidden pending readiness. Higher tiers
    // now point at Practitioner + institutional enrollment until Task 18
    // wires the In-Depth Assessment CTA.
    case 'building-momentum':
      return [
        {
          label: 'Recommended',
          title: 'Earn the Practitioner credential',
          description:
            'You have traction. The AiBI-P course gives your team a shared foundation of governed, repeatable AI skills before you scale to workflow automation and team-level rollout.',
          href: '/courses/aibi-p',
          cta: 'Explore AiBI-P',
          accent: 'var(--color-terra)',
          primary: true,
        },
        {
          label: 'Enroll your team',
          title: 'Institutional enrollment options',
          description:
            'Bring AiBI-P to your department or institution with team pricing, shared kickoff, and group reporting. Leave with a coordinated path to AI proficiency your team owns.',
          href: '/for-institutions',
          cta: 'See enrollment options',
          accent: 'var(--color-ink)',
        },
      ];

    case 'ready-to-scale':
      return [
        {
          label: 'Recommended',
          title: 'Institution-wide capability program',
          description:
            'A recurring Practitioner cohort cadence scheduled so every banker, new or tenured, has a path to proficiency. Custom advisory available alongside for your AI leader.',
          href: '/for-institutions',
          cta: 'See enrollment options',
          accent: 'var(--color-terra)',
          primary: true,
        },
        {
          label: 'Talk to us',
          title: 'Request an Executive Briefing',
          description:
            'A free 45-minute conversation to design the right rollout cadence for your institution and identify where AI can deliver measured outcomes first.',
          href: CALENDLY_URL,
          cta: 'Request Executive Briefing',
          accent: 'var(--color-ink)',
        },
      ];
  }
}

interface NextStepCardsProps {
  readonly tierId: Tier['id'];
}

export function NextStepCards({ tierId }: NextStepCardsProps) {
  const steps = getStepsForTier(tierId);
  const isExternal = (href: string) => href.startsWith('http');

  return (
    <section data-print-hide="true">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
        Choose your next step
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <article
            key={step.title}
            className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 md:p-8 flex flex-col hover:border-[color:var(--color-terra)]/30 transition-all duration-200"
          >
            <p
              className="font-serif-sc text-[11px] uppercase tracking-[0.2em] mb-4"
              style={{ color: step.accent }}
            >
              {step.label}
            </p>
            <h3 className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight mb-4">
              {step.title}
            </h3>
            <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed mb-6 flex-1">
              {step.description}
            </p>
            {isExternal(step.href) ? (
              <a
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  'block text-center px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] transition-colors ' +
                  (step.primary
                    ? 'bg-[color:var(--color-terra)] text-[color:var(--color-linen)] hover:bg-[color:var(--color-terra-light)]'
                    : 'border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]')
                }
              >
                {step.cta}
              </a>
            ) : (
              <Link
                href={step.href}
                className={
                  'block text-center px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] transition-colors ' +
                  (step.primary
                    ? 'bg-[color:var(--color-terra)] text-[color:var(--color-linen)] hover:bg-[color:var(--color-terra-light)]'
                    : 'border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]')
                }
              >
                {step.cta}
              </Link>
            )}
          </article>
        ))}
      </div>

      {/* Secondary navigation */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
        <Link
          href="/education"
          className="py-2 px-1 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] hover:opacity-70 transition-opacity"
        >
          Browse education
        </Link>
        <Link
          href="/dashboard"
          className="py-2 px-1 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/60 border-b border-[color:var(--color-ink)]/20 hover:text-[color:var(--color-terra)] hover:border-[color:var(--color-terra)] transition-colors"
        >
          Go to your dashboard
        </Link>
      </div>
    </section>
  );
}
