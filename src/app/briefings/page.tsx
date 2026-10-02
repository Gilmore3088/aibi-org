// /briefings — the dated, newest-first feed of everything editorial:
// daily pulse briefings, weekly deep dives, and the six pre-briefings
// legacy essays (which keep their /resources/<slug> URLs).
//
// Succeeds /resources/archive (301'd here via next.config). Layout: the
// newest piece as a cited document window, then the archive as a log.

import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow, CopyPrompt } from '@/components/ax';
import { listAllBriefings } from '@content/briefings/_lib/registry';
import { BriefingsArchive } from './BriefingsArchive';

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

      <AxHero
        cmd="briefings --sources primary --audience community-banks"
        title="What happened in AI and banking — and what it means for you."
        lede="Pulse notes daily. Deep dives weekly. Every claim cites a named primary source."
        actions={
          <Link href="/briefings/feed.xml" className="ax-link-mono">
            rss feed →
          </Link>
        }
      />

      {lead && (
        <section className="ax-section" aria-label="Latest briefing">
          <div className="mk-container">
            <AxWindow
              title={lead.href.startsWith('/briefings/') ? `${lead.date}-${lead.slug}.mdx` : lead.slug}
              meta={
                <>
                  {lead.tier && <span className="ax-gold">{TIER_LABEL[lead.tier]}</span>}
                  {lead.tier ? ' · ' : ''}
                  {lead.category.toLowerCase()} · {lead.readMinutes} min
                  {lead.author ? ` · ${lead.author}` : ''}
                </>
              }
              flush
            >
              <div className="ax-lead">
                <div className="ax-lead-main">
                  <Link href={lead.href} className="ax-lead-title">
                    {lead.title}
                  </Link>
                  {lead.dek && <p className="ax-lead-dek">{lead.dek}</p>}
                  <Link href={lead.href} className="ax-link-mono">
                    read the briefing →
                  </Link>
                </div>
                <aside className="ax-lead-aside">
                  {sources.length > 0 && (
                    <div>
                      <p className="ax-k">Sources</p>
                      <ol className="ax-sources">
                        {sources.map((s, i) => (
                          <li key={s.label}>
                            <span className="ax-gold">[{i + 1}]</span>
                            <span>
                              {s.url ? (
                                <a href={s.url} rel="noopener noreferrer" target="_blank">
                                  {s.label}
                                </a>
                              ) : (
                                s.label
                              )}
                              {hostOf(s.url) && <small>{hostOf(s.url)}</small>}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <CopyPrompt label="Take it to your approved AI tool" prompt={BOARD_PROMPT} />
                </aside>
              </div>
            </AxWindow>
          </div>
        </section>
      )}

      <AxSection>
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
            }))}
          />
        </div>
      </AxSection>
    </div>
  );
}
