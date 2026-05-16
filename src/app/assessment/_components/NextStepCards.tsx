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

function getStepsForTier(tierId: Tier['id']): readonly NextStep[] {
  switch (tierId) {
    case 'starting-point':
      return [
        {
          label: 'Go deeper · $99',
          title: 'Take the In-Depth Assessment',
          description:
            'Forty-eight questions across eight readiness dimensions. A consulting-grade report with peer-band comparison and a starting playbook keyed to your lowest-scoring areas.',
          href: '/assessment/in-depth',
          cta: 'See the In-Depth Assessment',
          accent: 'var(--color-cobalt)',
          primary: true,
        },
        {
          label: 'Train your team',
          title: 'Start the Foundation course',
          description:
            'Twelve self-paced modules that build hands-on AI proficiency for every staff member. Lifetime access to modules, artifacts, and the prompt library. Earn the AiBI-Foundation credential on reviewed work.',
          href: '/courses/foundation/program',
          cta: 'Explore AiBI-Foundation',
          accent: 'var(--color-terra)',
        },
      ];

    case 'early-stage':
      return [
        {
          label: 'Go deeper · $99',
          title: 'Take the In-Depth Assessment',
          description:
            'Forty-eight questions across eight readiness dimensions. Diagnose where momentum is real and where you are still relying on heroics — with an anonymized rollup if your team takes it too.',
          href: '/assessment/in-depth',
          cta: 'See the In-Depth Assessment',
          accent: 'var(--color-cobalt)',
          primary: true,
        },
        {
          label: 'Train your team',
          title: 'Earn the Foundation credential',
          description:
            'Give your early adopters governed, repeatable AI skills. Twelve self-paced modules with practice reps and artifacts. Lifetime access. AiBI-Foundation credential on reviewed work.',
          href: '/courses/foundation/program',
          cta: 'Explore AiBI-Foundation',
          accent: 'var(--color-terra)',
        },
      ];

    case 'building-momentum':
      return [
        {
          label: 'Recommended',
          title: 'Join the Specialist waitlist',
          description:
            'You have traction. AiBI-S will focus on workflow automation, agents, internal AI systems, and team-level rollout after Foundation is validated.',
          href: '/coming-soon?interest=specialist',
          cta: 'Join AiBI-S Waitlist',
          accent: 'var(--color-cobalt)',
          primary: true,
        },
        {
          label: 'Enroll your team',
          title: 'Run a Specialist cohort with your department',
          description:
            'Five to 25 managers from one institution go through the Specialist track together. Shared kickoff, group reporting, and team pricing. Leave with a prioritized automation roadmap your team owns.',
          href: '/for-institutions',
          cta: 'See enrollment options',
          accent: 'var(--color-terra)',
        },
      ];

    case 'ready-to-scale':
      return [
        {
          label: 'Recommended',
          title: 'Join the Leader waitlist',
          description:
            'AiBI-L will focus on executive confidence, governance, rollout, and institution-level AI leadership after the Foundation loop is validated.',
          href: '/coming-soon?interest=leader',
          cta: 'Join AiBI-L Waitlist',
          accent: 'var(--color-sage)',
          primary: true,
        },
        {
          label: 'Build enduring capability',
          title: 'Institution-wide capability program',
          description:
            'A recurring cohort cadence — Foundation, Specialist, and Leader — scheduled so every banker, new or tenured, has a path to proficiency. Leadership Advisory available alongside for your AI leader.',
          href: '/for-institutions',
          cta: 'See enrollment options',
          accent: 'var(--color-terra)',
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
