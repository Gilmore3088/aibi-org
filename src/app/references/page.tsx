import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';
import { BRAND } from '@content/copy';
import { REGULATIONS } from '@content/regulations';
import { REFERENCE_SOURCES } from '@content/references';
import { CITATIONS } from '@content/citations';

export const metadata: Metadata = {
  title: 'Sources & references',
  description:
    'Every regulation, standard, government report, and statistic the Institute cites — with links to the original source. Curriculum copy links here instead of restating citations.',
  alternates: { canonical: '/references' },
};

const REVIEW_DATE = 'June 25, 2026';

const listStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid var(--slate-200)',
  borderRadius: 'var(--r-lg)',
  padding: '16px 18px',
  boxShadow: 'var(--shadow-soft)',
  scrollMarginTop: '96px',
};

const shortStyle: CSSProperties = {
  display: 'block',
  color: 'var(--ink)',
  fontSize: '0.9375rem',
  fontWeight: 800,
  lineHeight: 1.3,
};

const longStyle: CSSProperties = {
  margin: '4px 0 0',
  color: 'var(--slate-700)',
  fontSize: '0.8438rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

const metaStyle: CSSProperties = {
  margin: '8px 0 0',
  color: 'var(--slate-500)',
  fontSize: '0.7813rem',
  fontWeight: 500,
  lineHeight: 1.45,
};

const linkStyle: CSSProperties = {
  display: 'inline-block',
  marginTop: 10,
  color: 'var(--gold-deep)',
  fontWeight: 800,
  fontSize: '0.8125rem',
};

type RefEntry = {
  slug: string;
  short: string;
  long: string;
  issuer: string;
  note?: string;
  url?: string;
};

function ReferenceList({ entries }: { entries: RefEntry[] }) {
  return (
    <ul style={listStyle}>
      {entries.map((entry) => (
        <li key={entry.slug} id={entry.slug} style={cardStyle}>
          <strong style={shortStyle}>{entry.short}</strong>
          <p style={longStyle}>{entry.long}</p>
          <p style={metaStyle}>
            <span style={{ fontWeight: 700, color: 'var(--slate-600)' }}>{entry.issuer}</span>
            {entry.note ? <> — {entry.note}</> : null}
          </p>
          {entry.url ? (
            <a href={entry.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              View source ↗
            </a>
          ) : (
            <p style={{ ...metaStyle, fontStyle: 'italic' }}>
              Proprietary / licensed source — citation provided above.
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

const FRAMEWORKS: RefEntry[] = REGULATIONS.map((r) => ({
  slug: r.slug,
  short: r.short,
  long: r.long,
  issuer: r.issuer,
  url: r.url,
}));

const SOURCES: RefEntry[] = REFERENCE_SOURCES.map((s) => ({
  slug: s.slug,
  short: s.short,
  long: s.long,
  issuer: s.issuer,
  note: s.note,
  url: s.url,
}));

const STATS: RefEntry[] = CITATIONS.map((c) => ({
  slug: `stat-${c.slug}`,
  short: `${c.value} — ${c.claim}`,
  long: `${c.publication}`,
  issuer: `${c.publisher}, ${c.year}`,
  url: c.url,
}));

export default function ReferencesPage() {
  return (
    <MockupShell
      activePath="/references"
      eyebrow="Sources & references"
      title={<>Where our claims come from.</>}
      lede={
        <>
          Everything the Institute cites — regulations, standards, government
          reports, and every statistic on the site — lives here with a link to
          the original source. Where our copy mentions a specific framework or
          figure, it links back to this page instead of restating the citation.
        </>
      }
      heroActions={[
        { label: 'Get readiness score', href: '/assessment/take', variant: 'gold' },
        { label: 'Security & governance', href: '/security', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'Regulatory alignment',
          heading: <>Supervisory &amp; regulatory frameworks</>,
          lede: (
            <>
              The published guidance the curriculum maps to. These are public
              references for bank and credit-union review — the Institute is not a
              regulator and does not certify compliance.
            </>
          ),
          body: <ReferenceList entries={FRAMEWORKS} />,
        },
        {
          kicker: 'Standards & reports',
          heading: <>Standards, frameworks &amp; government reports</>,
          lede: (
            <>
              Additional sources cited in the Institute&apos;s educational
              articles, templates, and security guidance.
            </>
          ),
          body: <ReferenceList entries={SOURCES} />,
          surface: 'white',
        },
        {
          kicker: 'Data',
          heading: <>Statistics &amp; research</>,
          lede: (
            <>
              Every figure shown on the public site, with its publication,
              publisher, and year. Some industry research is licensed and links to
              the publisher rather than a free document.
            </>
          ),
          body: <ReferenceList entries={STATS} />,
        },
        {
          kicker: 'How to read this',
          heading: <>Public references, not a compliance opinion.</>,
          lede: (
            <>
              Citations were last reviewed on {REVIEW_DATE}. Regulations and
              guidance change; always confirm the current text with the issuing
              agency. The Institute aligns its curriculum to these sources as a
              teaching aid — it does not provide legal, regulatory, or compliance
              advice, and nothing here certifies your institution.
            </>
          ),
          surface: 'white',
        },
      ]}
      ctaBand={{
        heading: <>Spotted a citation that needs updating?</>,
        body: (
          <>
            Email {BRAND.emails.contact} and we&apos;ll review the source. We keep
            this page current so reviewers can trust every number on the site.
          </>
        ),
        actions: [
          { label: 'Security & governance', href: '/security', variant: 'gold' },
          { label: 'For institutions', href: '/for-institutions', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
