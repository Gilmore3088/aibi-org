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
          accent: 'var(--ink-2)',
          primary: true,
        },
        {
          label: 'Train your team',
          title: 'Start the Foundation course',
          description:
            'Twelve self-paced modules that build hands-on AI proficiency for every staff member. Lifetime access to modules, artifacts, and the prompt library. Earn the AiBI-Foundation credential on reviewed work.',
          href: '/courses/foundation/program',
          cta: 'Explore AiBI-Foundation',
          accent: 'var(--gold)',
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
          accent: 'var(--ink-2)',
          primary: true,
        },
        {
          label: 'Train your team',
          title: 'Earn the Foundation credential',
          description:
            'Give your early adopters governed, repeatable AI skills. Twelve self-paced modules with practice reps and artifacts. Lifetime access. AiBI-Foundation credential on reviewed work.',
          href: '/courses/foundation/program',
          cta: 'Explore AiBI-Foundation',
          accent: 'var(--gold)',
        },
      ];

    case 'building-momentum':
      return [
        {
          label: 'Recommended',
          title: 'Start the AiBI-Foundation course',
          description:
            'You have traction. Twelve self-paced modules to build the prompts, agents, and AI workflows your daily banking work demands — and walk away with documented workflows your examiner can read.',
          href: '/courses/foundation/program/purchase',
          cta: 'Enroll · $295',
          accent: 'var(--ink-2)',
          primary: true,
        },
        {
          label: 'Enroll your team',
          title: 'Run a coached cohort',
          description:
            'Ten seats over eight weeks. Shared kickoff, group reporting, and institutional pricing at $199/seat. Leave with reviewed AI artifacts your team owns.',
          href: '/for-institutions',
          cta: 'See enrollment options',
          accent: 'var(--gold)',
        },
      ];

    case 'ready-to-scale':
      return [
        {
          label: 'Recommended',
          title: 'Book an executive briefing',
          description:
            'Bring your leadership. The Institute walks your team through what governance, examiner-readiness, and institution-wide rollout actually look like — with the regulatory references named.',
          href: '/for-institutions/advisory',
          cta: 'Book a briefing',
          accent: 'var(--ink-2)',
          primary: true,
        },
        {
          label: 'Build enduring capability',
          title: 'Institution-wide capability program',
          description:
            'A coached cohort, an aggregate dashboard for your champion, and a defensible posture. Leadership Advisory available alongside for your AI leader.',
          href: '/for-institutions',
          cta: 'See enrollment options',
          accent: 'var(--gold)',
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
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--ink)]/70 mb-6">
        Choose your next step
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <article
            key={step.title}
            className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-[3px] p-6 md:p-8 flex flex-col hover:border-[color:var(--gold)]/30 transition-all duration-200"
          >
            <p
              className="font-serif-sc text-[11px] uppercase tracking-[0.2em] mb-4"
              style={{ color: step.accent }}
            >
              {step.label}
            </p>
            <h3 className="font-serif text-2xl text-[color:var(--ink)] leading-tight mb-4">
              {step.title}
            </h3>
            <p className="text-sm text-[color:var(--ink)]/75 leading-relaxed mb-6 flex-1">
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
                    ? 'bg-[color:var(--gold)] text-[color:var(--cream)] hover:bg-[color:var(--gold-2)]'
                    : 'border border-[color:var(--ink)]/30 text-[color:var(--ink)] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]')
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
                    ? 'bg-[color:var(--gold)] text-[color:var(--cream)] hover:bg-[color:var(--gold-2)]'
                    : 'border border-[color:var(--ink)]/30 text-[color:var(--ink)] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]')
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
          href="/courses"
          className="py-2 px-1 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)] border-b border-[color:var(--gold)] hover:opacity-70 transition-opacity"
        >
          Browse education
        </Link>
        <Link
          href="/dashboard"
          className="py-2 px-1 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink)]/60 border-b border-[color:var(--ink)]/20 hover:text-[color:var(--gold)] hover:border-[color:var(--gold)] transition-colors"
        >
          Go to your dashboard
        </Link>
      </div>
    </section>
  );
}
