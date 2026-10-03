// /briefings — the dated, newest-first feed of everything editorial:
// daily pulse briefings, weekly deep dives, and the six pre-briefings
// legacy essays (which keep their /resources/<slug> URLs).
//
// Succeeds /resources/archive (301'd here via next.config). Layout: a
// masthead, the newest piece as a feature beside its primary sources, then
// the rest as a card grid.

import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';
import { AxSection, CopyPrompt } from '@/components/ax';
import { listAllBriefings } from '@content/briefings/_lib/registry';
import { BriefingsArchive } from './BriefingsArchive';
import { formatDate } from './covers';

export const metadata: Metadata = {
  alternates: {
    canonical: '/briefings',
    types: { 'application/rss+xml': '/briefings/feed.xml' },
  },
  title: 'Briefings — The AI Banking Institute',
  description:
    'Daily pulse briefings and weekly deep dives on AI in banking: what regulators, banks, fintechs, and the AI companies are doing — and what it means for community institutions.',
};

const TIER_LABEL = { pulse: 'pulse', 'deep-dive': 'deep dive' } as const;

const BOARD_PROMPT =
  'Summarize this briefing for our board in five bullets. Flag anything our compliance officer should review. Use only the text I paste — do not add outside facts.';

function hostOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export default async function BriefingsPage() {
  const briefings = await listAllBriefings();
  const [lead, ...rest] = briefings;
  const sources = lead?.sources ?? [];

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/briefings" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <header className="ax-masthead">
        <div className="mk-container">
          <p className="ax-cmd">
            briefings --sources primary --audience community-banks
          </p>
          <div className="ax-masthead-row">
            <h1 className="ax-display">Briefings</h1>
            <p className="ax-masthead-lede">
              What happened in AI and banking — and what it means for you. Every claim cites a named primary
              source.{' '}
              <Link href="/briefings/feed.xml" className="ax-link-mono">
                rss feed →
              </Link>
            </p>
          </div>
        </div>
      </header>

      {lead && (
        <section className="ax-section ax-feature-section" aria-label="Latest briefing">
          <div className="mk-container">
            <article className="ax-feature">
              <div className="ax-feature-main">
                <p className="ax-card-meta">
                  <span className="ax-gold">latest{lead.tier ? ` · ${TIER_LABEL[lead.tier]}` : ''}</span> ·{' '}
                  {formatDate(lead.date)} · {lead.readMinutes} min{lead.author ? ` · ${lead.author}` : ''}
                </p>
                <Link href={lead.href} className="ax-lead-title">
                  {lead.title}
                </Link>
                {lead.dek && <p className="ax-lead-dek">{lead.dek}</p>}
                <div className="ax-actions">
                  <Link href={lead.href} className="ax-tier-cta ax-feature-cta">
                    Read the briefing <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <CopyPrompt label="Take it to your approved AI tool" prompt={BOARD_PROMPT} />
              </div>
              {sources.length > 0 && (
                <aside className="ax-feature-docs" aria-label="Primary sources">
                  <p className="ax-k">Read against</p>
                  <ol className="ax-docstack">
                    {sources.map((s, i) => (
                      <li key={s.label} style={{ ['--i' as string]: i }}>
                        <span className="ax-doc-host">{hostOf(s.url) ?? 'source'}</span>
                        {s.url ? (
                          <a href={s.url} rel="noopener noreferrer" target="_blank">
                            {s.label}
                          </a>
                        ) : (
                          <span>{s.label}</span>
                        )}
                        <span className="ax-doc-n">[{i + 1}]</span>
                      </li>
                    ))}
                  </ol>
                </aside>
              )}
            </article>
          </div>
        </section>
      )}

      <AxSection light>
        <div aria-labelledby="archive-title" role="region">
          <BriefingsArchive
            entries={rest.map((b) => ({
              slug: b.slug,
              href: b.href,
              title: b.title,
              dek: b.dek,
              date: b.date,
              category: b.category,
              readMinutes: b.readMinutes,
              tier: b.tier,
              sourceHost: hostOf(b.sources?.[0]?.url) ?? undefined,
            }))}
          />
        </div>
      </AxSection>
    </div>
  );
}
