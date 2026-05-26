import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';
import { PRINCIPLES } from '@content/copy';

export const metadata: Metadata = {
  title: 'About — The AI Banking Institute',
  description:
    'The AI Banking Institute exists for the community banks and credit unions that anchor towns and neighborhoods — not for the twenty largest banks. Here is why.',
  alternates: { canonical: '/about' },
};

const COL_STYLE: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--ink-a10)',
  borderRadius: 16,
  padding: 28,
};

const KICKER: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: '0 0 12px',
};

const HEADING: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  lineHeight: 1.25,
  color: 'var(--ink)',
  margin: '0 0 12px',
};

const BODY: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: 'var(--slate-600)',
  margin: 0,
};

export default function AboutPage() {
  return (
    <MockupShell
      activePath="/about"
      eyebrow="About · The AI Banking Institute"
      title={
        <>
          For the community banks and credit unions that{' '}
          <span style={{ color: 'var(--gold-soft)' }}>anchor towns</span> — not
          the twenty largest banks.
        </>
      }
      lede={
        <>
          <span style={{ display: 'block', marginBottom: 18 }}>
            We started The AI Banking Institute because the AI training community
            banks were being sold did not survive contact with an exam, a board
            meeting, or a teller line.
          </span>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 14px',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--gold-soft)',
              letterSpacing: '0.02em',
            }}
          >
            <li>Regulator-aligned criteria.</li>
            <li aria-hidden style={{ opacity: 0.4 }}>·</li>
            <li>Tuition published.</li>
            <li aria-hidden style={{ opacity: 0.4 }}>·</li>
            <li>Methodology published.</li>
          </ul>
        </>
      }
      heroActions={[
        { label: 'Take the assessment', href: '/assessment', variant: 'gold' },
        { label: 'Book a briefing', href: '/for-institutions/advisory', variant: 'ghost-dark' },
      ]}
      heroAside={
        <aside
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: 32,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              ...KICKER,
              color: 'var(--gold-soft)',
              textAlign: 'center',
              margin: '0 0 16px',
            }}
          >
            Who we serve
          </p>
          <p
            style={{
              fontSize: 'clamp(56px, 9vw, 96px)',
              fontWeight: 700,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              margin: '0 0 12px',
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            8,400
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.92)',
              margin: '0 0 6px',
            }}
          >
            Community banks &amp; credit unions
          </p>
          <p
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
            }}
          >
            FDIC + NCUA · 2025
          </p>
        </aside>
      }
      sections={[
        {
          kicker: 'Mission',
          heading: <>For the institutions that anchor towns.</>,
          lede: (
            <>
              We turn bankers into builders. Not efficiency ratios, though we
              improve those. Not compliance readiness, though we build that
              too. Those are the outcomes. The mission is something more
              human: giving people who care deeply about their work a new set
              of tools and watching what they build with them.
            </>
          ),
          body: (
            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                marginTop: 32,
              }}
            >
              <div style={COL_STYLE}>
                <p style={KICKER}>Not for</p>
                <h3 style={HEADING}>The twenty largest banks.</h3>
                <p style={BODY}>
                  They have the budgets, the teams, the consultants.
                </p>
              </div>
              <div style={COL_STYLE}>
                <p style={KICKER}>Built for</p>
                <h3 style={HEADING}>The institutions that anchor towns.</h3>
                <p style={BODY}>
                  Community banks and credit unions with passion, knowledge,
                  and relationships no technology can replicate.
                </p>
              </div>
              <div style={COL_STYLE}>
                <p style={KICKER}>What we built</p>
                <h3 style={HEADING}>A framework that puts AI in their hands.</h3>
                <p style={BODY}>
                  Not the vendor&rsquo;s. Not a hired expert&rsquo;s. Theirs.
                </p>
              </div>
            </div>
          ),
        },
        {
          kicker: 'How we work',
          heading: <>Six principles, applied without exception.</>,
          lede: <>Internal rules, made public.</>,
          surface: 'white',
          body: (
            <div
              style={{
                display: 'grid',
                gap: 24,
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                marginTop: 32,
              }}
            >
              {PRINCIPLES.map((p) => (
                <article
                  key={p.number}
                  style={{
                    background: 'var(--cream)',
                    border: '1px solid var(--ink-a10)',
                    borderRadius: 16,
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 16,
                    }}
                  >
                    <p style={{ ...KICKER, margin: 0 }}>{p.number}</p>
                  </div>
                  <h3 style={HEADING}>{p.title}</h3>
                  <p style={BODY}>{p.body}</p>
                </article>
              ))}
            </div>
          ),
        },
      ]}
      ctaBand={{
        kicker: 'The AI Banking Institute',
        heading: <>Start with the readiness assessment. Or book a briefing.</>,
        body: (
          <>
            Three minutes, zero commitment. The institutions that win with AI
            are the ones whose staff can use it safely Monday.
          </>
        ),
        actions: [
          { label: 'Take the assessment', href: '/assessment', variant: 'gold' },
          { label: 'Book a briefing', href: '/for-institutions/advisory', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
