import Link from 'next/link';
import { Section, SectionHead, ArrowGlyph } from '@/components/mockup';

// One connected path that replaces the old value-path tabs AND the pricing
// cards. Every stage shows a genuinely different real output — score, report,
// work product, dashboard — so the ladder reads as "here is what each step
// produces," not another feature grid.

type PreviewRow = readonly [label: string, value: string];

interface Stage {
  n: string;
  eyebrow: string;
  price: string;
  name: string;
  output: string;
  cta: string;
  href: string;
  anchor?: boolean;
  preview: {
    label: string;
    title: string;
    rows: readonly PreviewRow[];
  };
}

const STAGES: readonly Stage[] = [
  {
    n: '1',
    eyebrow: 'Start here',
    price: 'Free · 3 min',
    name: 'AI Readiness Snapshot',
    output: 'Your score, biggest gap, and a starter template you can use this week.',
    cta: 'Get my score',
    href: '/assessment/take',
    anchor: true,
    preview: {
      label: 'Your starter artifact',
      title: 'AI Recordkeeping Template',
      rows: [
        ['Kind', 'Reusable template'],
        ['Owner', 'You + your manager'],
        ['Ready', 'This week'],
      ],
    },
  },
  {
    n: '2',
    eyebrow: 'Deep dive',
    price: '$99',
    name: 'In-Depth Assessment',
    output: 'A written report, eight scored dimensions, and a prioritized action plan.',
    cta: 'View the report',
    href: '/assessment/in-depth',
    preview: {
      label: 'Sample in-depth report',
      title: 'Eight dimensions scored',
      rows: [
        ['Governance', 'Building'],
        ['Data handling', 'Strong'],
        ['Root cause', 'Named per dimension'],
        ['Plan', '90-day action register'],
      ],
    },
  },
  {
    n: '3',
    eyebrow: 'Capability',
    price: '$295',
    name: 'AiBI-Foundation',
    output: 'Eighteen modules and eighteen reusable work products.',
    cta: 'Explore Foundation',
    href: '/courses',
    preview: {
      label: 'Saved work product',
      title: 'Campaign review prompt',
      rows: [
        ['Type', 'Reusable prompt'],
        ['Owner', 'Marketing + Compliance'],
        ['Status', 'Reviewed v1.1'],
        ['Packet', '1 of 18 work products'],
      ],
    },
  },
  {
    n: '4',
    eyebrow: 'Teams',
    price: 'Custom',
    name: 'For Institutions',
    output: 'Team baselines, seats, reporting, and assisted rollout.',
    cta: 'See team options',
    href: '/for-institutions',
    preview: {
      label: 'Team readiness view',
      title: 'Readiness by department',
      rows: [
        ['Retail', 'Building'],
        ['Lending', 'Early stage'],
        ['Operations', 'Building'],
        ['Compliance', 'Ready to scale'],
      ],
    },
  },
];

export function ProductProgression(): JSX.Element {
  return (
    <Section variant="std" surface="white">
      <SectionHead
        kicker="The path"
        heading={<>Start free. Go deeper only when you need to.</>}
        lede={
          <>
            Each step produces a starter work product — a template, checklist, or
            workflow you can use this week.
          </>
        }
      />
      <ol className="mk-progression">
        {STAGES.map((stage) => (
          <li
            key={stage.name}
            className={`mk-prog-step${stage.anchor ? ' is-anchor' : ''}`}
          >
            <span className="mk-prog-marker" aria-hidden="true">
              {stage.n}
            </span>
            <div className="mk-prog-body">
              <div className="mk-prog-copy">
                <p className="mk-prog-eyebrow">
                  <span>{stage.eyebrow}</span>
                  <span className="mk-prog-price">{stage.price}</span>
                </p>
                <h3>{stage.name}</h3>
                <p className="mk-prog-output">{stage.output}</p>
                <Link href={stage.href} className="mk-prog-cta">
                  {stage.cta} <ArrowGlyph />
                </Link>
              </div>
              <div className="mk-prog-preview">
                <p className="mk-prog-preview-k">{stage.preview.label}</p>
                <p className="mk-prog-preview-title">{stage.preview.title}</p>
                <div className="mk-prog-preview-rows">
                  {stage.preview.rows.map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mk-prog-compare">
        <Link href="/pricing">
          Compare all pricing <ArrowGlyph />
        </Link>
      </p>
    </Section>
  );
}
