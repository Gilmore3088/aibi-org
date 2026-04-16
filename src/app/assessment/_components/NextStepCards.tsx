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
          title: 'Start with AI Foundations',
          description:
            'The $97 self-paced course that builds baseline AI literacy across your entire staff. Five modules, five universal templates, and the safe-use guidelines every banker needs before touching a production workflow.',
          href: '/foundations',
          cta: 'Explore AI Foundations',
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
          title: 'Book an Executive Briefing',
          description:
            'Your institution is experimenting but not yet coordinated. A free 45-minute briefing will show you how to convert isolated experiments into a structured program with governance and measured outcomes.',
          href: CALENDLY_URL,
          cta: 'Request Executive Briefing',
          accent: 'var(--color-terra)',
          primary: true,
        },
        {
          label: 'Build the foundation',
          title: 'Explore certifications',
          description:
            'Give your early adopters the Practitioner credential so they can lead with confidence. Give your managers the Specialist track so they can scale what works.',
          href: '/certifications',
          cta: 'See certification tracks',
          accent: 'var(--color-ink)',
        },
      ];

    case 'building-momentum':
      return [
        {
          label: 'Recommended',
          title: 'Explore the Operational Quick Win Sprint',
          description:
            'You have traction. The next step is proof. A Quick Win Sprint implements three automations in 4\u20136 weeks with a documented ROI report and a 90-day guarantee. $5,000\u2013$15,000.',
          href: '/services',
          cta: 'See engagement details',
          accent: 'var(--color-terra)',
          primary: true,
        },
        {
          label: 'Strengthen your governance',
          title: 'Download the Safe AI Use Guide',
          description:
            'Six chapters your compliance officer will actually read. Maps directly to SR 11-7 and the AIEOG AI Lexicon. Free.',
          href: '/security',
          cta: 'Get the guide',
          accent: 'var(--color-cobalt)',
        },
      ];

    case 'ready-to-scale':
      return [
        {
          label: 'Recommended',
          title: 'Talk to us about the AiBI fCAIO program',
          description:
            'Your institution is ready for a structured monthly operating system. The AI Transformation engagement installs a 90-day rolling roadmap with capability transfer built in. Your team drives it independently when the engagement ends.',
          href: '/services',
          cta: 'See how we work',
          accent: 'var(--color-terra)',
          primary: true,
        },
        {
          label: 'Credential your leaders',
          title: 'Explore the Leader certification',
          description:
            'A 1-day in-person workshop for C-suite and board. Efficiency ratio modeling with your numbers, a 3-year AI roadmap, and examiner readiness. $2,800+ individual or $12,000 for a team of 8.',
          href: '/certifications',
          cta: 'See certification details',
          accent: 'var(--color-sage)',
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
            className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 flex flex-col"
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
                  'block text-center px-6 py-3 font-sans text-sm font-medium tracking-wide transition-colors ' +
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
                  'block text-center px-6 py-3 font-sans text-sm font-medium tracking-wide transition-colors ' +
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
    </section>
  );
}
