import Link from 'next/link';
import { READINESS_SCORE_CTA } from './siteCtas';

const GUIDED_PATH_STEPS = [
  {
    key: 'score',
    label: 'Score',
    title: READINESS_SCORE_CTA.label,
    body: 'Free readiness score, top gap, and starter artifact.',
    href: READINESS_SCORE_CTA.href,
  },
  {
    key: 'gaps',
    label: 'Gaps',
    title: 'Understand gaps',
    body: 'Use the report path to see risks, root causes, and next work.',
    href: '/assessment/in-depth',
  },
  {
    key: 'skills',
    label: 'Skills',
    title: 'Build skills',
    body: 'Practice with Foundation modules and reusable work products.',
    href: '/courses',
  },
  {
    key: 'rollout',
    label: 'Team',
    title: 'Roll out team',
    body: 'Scope seats, cohorts, reporting, and executive briefing needs.',
    href: '/for-institutions',
  },
] as const;

type GuidedPathStepKey = (typeof GUIDED_PATH_STEPS)[number]['key'];

export interface GuidedPathStripProps {
  readonly className?: string;
  readonly currentStep?: GuidedPathStepKey;
  readonly tone?: 'light' | 'dark';
}

export function GuidedPathStrip({
  className,
  currentStep = 'score',
  tone = 'light',
}: GuidedPathStripProps) {
  const classes = [
    'mk-guided-path',
    tone === 'dark' ? 'mk-guided-path--dark' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-label="Guided public site path">
      <div className="mk-guided-path-intro">
        <p className="mk-guided-path-k">Guided path</p>
        <p className="mk-guided-path-title">
          Score first. Close gaps. Build skills. Roll out the team.
        </p>
      </div>
      <ol className="mk-guided-path-steps">
        {GUIDED_PATH_STEPS.map((step, index) => (
          <li
            key={step.key}
            className={step.key === currentStep ? 'is-current' : undefined}
          >
            <Link href={step.href}>
              <span className="mk-guided-path-num">{index + 1}</span>
              <span>
                <strong>{step.title}</strong>
                <em>{step.body}</em>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
