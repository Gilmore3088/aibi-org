// /research — The AI Banking Brief (archive)
//
// 2026-05-26 rewrite: dropped the 866-line bespoke magazine-cover
// prototype + its 1230-line stylesheet. The archive now renders as
// a clean MockupShell-based listing of every published essay, on
// the same design system as the rest of the marketing surface.
// Bespoke `aibi-research` / `ticker` / `dot` classes retired.

import type { Metadata } from 'next';
import Link from 'next/link';
import { MockupShell } from '@/components/mockup';
import { listAllEssays } from '@content/essays/_lib/registry';

export const metadata: Metadata = {
  alternates: { canonical: '/research' },
  title: 'Research — The AI Banking Brief',
  description:
    'Sourced AI research, field notes, and practical artifacts for community banks and credit unions adopting AI safely.',
};

const TICKER: { kicker: string; text: string }[] = [
  { kicker: 'FDIC', text: 'Community-bank median efficiency ratio ~65% · Q4 2024 QBP' },
  { kicker: 'Gartner', text: '66% of banks discussing AI budget · Bank Director 2024 (via Jack Henry)' },
  { kicker: 'Personetics', text: '84% would switch FIs for AI-driven financial insights · 2025 (via Apiture)' },
  { kicker: 'GAO', text: 'GAO 25-107197 · no AI-specific banking framework yet · May 2025' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ResearchArchivePage() {
  const essays = await listAllEssays();

  return (
    <MockupShell
      activePath="/research"
      eyebrow="The AI Banking Brief · sourced research"
      title={<>What the Institute is reading. What it means for your bank.</>}
      lede={
        <>
          Sourced AI research, field notes, and practical artifacts for community banks
          and credit unions adopting AI safely. Every claim cites a named source.
        </>
      }
      heroActions={[
        { label: 'Take the assessment', href: '/assessment', variant: 'gold' },
        { label: 'View the curriculum', href: '/education', variant: 'ghost-dark' },
      ]}
      heroAside={
        <aside
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: 28,
            color: '#fff',
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
              margin: '0 0 16px',
            }}
          >
            Sourced data, named publishers
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {TICKER.map((t) => (
              <li
                key={t.kicker}
                style={{
                  padding: '12px 0',
                  borderTop: '1px solid rgba(255,255,255,0.10)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-soft)',
                    marginRight: 8,
                    fontWeight: 700,
                  }}
                >
                  {t.kicker}
                </span>
                {t.text}
              </li>
            ))}
          </ul>
        </aside>
      }
      sections={[
        {
          kicker: 'Archive',
          heading: <>Every published essay, newest first.</>,
          body: (
            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                marginTop: 32,
              }}
            >
              {essays.map((e) => (
                <Link
                  key={e.slug}
                  href={e.href}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--ink-a10)',
                    borderRadius: 16,
                    padding: 28,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 120ms, box-shadow 120ms',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: 11,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--gold-deep)',
                        fontWeight: 700,
                      }}
                    >
                      {e.category}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--slate-500)' }}>
                      {e.readMinutes} min read
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      lineHeight: 1.25,
                      color: 'var(--ink)',
                      margin: '0 0 12px',
                    }}
                  >
                    {e.title}
                  </h3>
                  {e.dek && (
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.55,
                        color: 'var(--slate-600)',
                        margin: '0 0 20px',
                        flex: 1,
                      }}
                    >
                      {e.dek}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: 16,
                      borderTop: '1px solid var(--ink-a10)',
                      fontSize: 13,
                      color: 'var(--slate-500)',
                    }}
                  >
                    <span>{formatDate(e.date)}</span>
                    <span
                      style={{
                        color: 'var(--ink)',
                        fontWeight: 600,
                        borderBottom: '2px solid var(--gold)',
                        paddingBottom: 2,
                      }}
                    >
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ),
        },
      ]}
      ctaBand={{
        kicker: 'Want the Brief?',
        heading: <>Sourced AI research, every other Friday.</>,
        body: (
          <>
            One short email. Sourced statistics, named publishers, and what each finding
            means for community banks and credit unions. No promotional copy.
          </>
        ),
        actions: [
          { label: 'Take the assessment first', href: '/assessment', variant: 'gold' },
          { label: 'See the curriculum', href: '/education', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
