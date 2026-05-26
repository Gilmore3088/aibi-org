import type { Metadata } from 'next';
import Link from 'next/link';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Education | The AI Banking Institute',
  description:
    'Free classes and three certification tracks for community banks and credit unions. Start with the AI Readiness Assessment, then earn AiBI-Foundation, AiBI-S, or AiBI-L credentials.',
  alternates: { canonical: '/education' },
};

interface CatalogTile {
  tag: string;
  tagTone: 'free' | 'paid';
  title: string;
  subtitle: string;
  facts: { label: string; value: string }[];
  cta: string;
  href: string;
}

const ASSESSMENTS: CatalogTile[] = [
  {
    tag: 'Free',
    tagTone: 'free',
    title: 'Free AI Readiness Assessment',
    subtitle:
      'A quick diagnostic for your institution. Score, tier, and a tailored starter artifact you can take to your team this week.',
    facts: [
      { label: 'Questions', value: '12' },
      { label: 'Time', value: '3 min' },
      { label: 'Format', value: 'Self-serve · mobile-ready' },
      { label: 'Cost', value: 'Free' },
    ],
    cta: 'Take the free assessment →',
    href: '/assessment',
  },
  {
    tag: '$99 · $79 at 10+ by request',
    tagTone: 'paid',
    title: 'In-Depth Assessment',
    subtitle:
      'Forty-eight questions across eight readiness dimensions. Individual report, plus an anonymized aggregate dashboard for institution leaders.',
    facts: [
      { label: 'Questions', value: '48' },
      { label: 'Time', value: '20 min' },
      { label: 'Format', value: 'Individual + institution rollup' },
      { label: 'Cost', value: '$99 · $79/seat at 10+' },
    ],
    cta: 'Begin the In-Depth Assessment →',
    href: '/assessment/in-depth',
  },
];

const COURSES: CatalogTile[] = [
  {
    tag: '$295 · $199 at 10+ · lifetime access',
    tagTone: 'paid',
    title: 'AiBI-Foundation',
    subtitle:
      'Twelve self-paced modules. Three reviewed AI artifacts per practitioner. Earn the AiBI-Foundation credential your examiner respects.',
    facts: [
      { label: 'Modules', value: '12' },
      { label: 'Artifacts', value: '3 reviewed' },
      { label: 'Format', value: 'Self-paced, scored on reviewed work' },
      { label: 'Cost', value: '$295 · $199/seat at 10+' },
    ],
    cta: 'View the curriculum →',
    href: '/courses/foundation/program',
  },
];

const TILE: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--ink-a10)',
  borderRadius: 16,
  padding: 28,
  display: 'flex',
  flexDirection: 'column',
};

const TAG_FREE: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  border: '1px solid var(--gold-deep)',
  padding: '4px 10px',
  borderRadius: 999,
  marginBottom: 20,
};

const TAG_PAID: React.CSSProperties = {
  ...TAG_FREE,
  background: 'var(--cream-2)',
};

const TITLE_STYLE: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  lineHeight: 1.2,
  color: 'var(--ink)',
  margin: '0 0 12px',
};

const SUB_STYLE: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: 'var(--slate-600)',
  margin: '0 0 20px',
};

const DL_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  borderTop: '1px solid var(--ink-a10)',
  borderBottom: '1px solid var(--ink-a10)',
  margin: '0 0 20px',
};

const CTA_STYLE: React.CSSProperties = {
  marginTop: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--ink)',
  textDecoration: 'none',
  borderBottom: '2px solid var(--gold)',
  paddingBottom: 2,
  alignSelf: 'flex-start',
};

function CatalogTileCard({ tile }: { tile: CatalogTile }) {
  return (
    <article style={TILE}>
      <span style={tile.tagTone === 'free' ? TAG_FREE : TAG_PAID}>{tile.tag}</span>
      <h3 style={TITLE_STYLE}>{tile.title}</h3>
      <p style={SUB_STYLE}>{tile.subtitle}</p>
      <dl style={DL_STYLE}>
        {tile.facts.map((f, i) => {
          const isLeft = i % 2 === 0;
          const isTopRow = i < 2;
          return (
            <div
              key={f.label}
              style={{
                padding: '14px 0',
                paddingRight: isLeft ? 20 : 0,
                paddingLeft: isLeft ? 0 : 20,
                borderLeft: !isLeft ? '1px solid var(--ink-a10)' : undefined,
                borderBottom: isTopRow ? '1px solid var(--ink-a10)' : undefined,
              }}
            >
              <dt
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--slate-500)',
                  margin: '0 0 6px',
                }}
              >
                {f.label}
              </dt>
              <dd
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {f.value}
              </dd>
            </div>
          );
        })}
      </dl>
      <Link href={tile.href} style={CTA_STYLE}>
        {tile.cta}
      </Link>
    </article>
  );
}

export default function EducationPage() {
  return (
    <MockupShell
      activePath="/courses"
      eyebrow="Education · Free + paid · Self-paced"
      title={<>Use our assessments to measure you or your team&rsquo;s readiness.</>}
      lede={
        <>
          Free classes and three certification tracks for community banks and credit
          unions. Start with the AI Readiness Assessment, then earn AiBI-Foundation,
          AiBI-S, or AiBI-L credentials. Tuition published. Methodology published.
        </>
      }
      heroActions={[
        { label: 'Take the assessment', href: '/assessment', variant: 'gold' },
        { label: 'View the curriculum', href: '/courses/foundation/program', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'Assessments',
          heading: <>Measure where you stand. Before you spend.</>,
          lede: (
            <>
              Most learners start here. The free assessment surfaces the gap; the
              In-Depth Assessment quantifies it and hands you a written report with
              peer-band comparison.
            </>
          ),
          body: (
            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                marginTop: 32,
              }}
            >
              {ASSESSMENTS.map((tile) => (
                <CatalogTileCard key={tile.title} tile={tile} />
              ))}
            </div>
          ),
        },
        {
          kicker: 'Course',
          heading: <>Build the credential your examiner respects.</>,
          lede: (
            <>
              The AiBI-Foundation course is twelve self-paced modules ending in three
              reviewed AI artifacts per practitioner. Self-paced, scored on reviewed
              work — not a multiple-choice quiz.
            </>
          ),
          surface: 'white',
          body: (
            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                marginTop: 32,
                maxWidth: 720,
              }}
            >
              {COURSES.map((tile) => (
                <CatalogTileCard key={tile.title} tile={tile} />
              ))}
            </div>
          ),
        },
        {
          kicker: 'Next credentials',
          heading: <>AiBI-S Specialist and AiBI-L Leader.</>,
          lede: (
            <>
              Specialist and Leader credentials ship after the Foundation is validated
              with real learners. Join the waitlist from the dashboard or request a
              briefing for institutional cohorts.
            </>
          ),
        },
      ]}
      ctaBand={{
        kicker: 'Team & institutional enrollment',
        heading: <>Need team certification or executive workshops?</>,
        body: (
          <>
            AiBI-Foundation team pricing starts at 10 seats ($199/seat) with lifetime
            access. Institution-wide rollouts include a coached cohort and an
            aggregate dashboard for your champion.
          </>
        ),
        actions: [
          { label: 'See institutional engagement', href: '/for-institutions', variant: 'gold' },
          { label: 'Book a briefing', href: '/for-institutions/advisory', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
