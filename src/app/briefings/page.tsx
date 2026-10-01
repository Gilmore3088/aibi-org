// /briefings — the dated, newest-first feed of everything editorial:
// daily pulse briefings, weekly deep dives, and the six pre-briefings
// legacy essays (which keep their /resources/<slug> URLs).
//
// Succeeds /resources/archive (301'd here via next.config). The card markup
// and .mk-brief-* styles are the archive page's, plus a tier chip.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SiteHeader,
  Section,
  SectionHead,
  EyebrowChip,
} from '@/components/mockup';
import { listAllBriefings } from '@content/briefings/_lib/registry';

export const metadata: Metadata = {
  alternates: {
    canonical: '/briefings',
    types: { 'application/rss+xml': '/briefings/feed.xml' },
  },
  title: 'Briefings — The AI Banking Institute',
  description:
    'Daily pulse briefings and weekly deep dives on AI in banking: what regulators, banks, fintechs, and the AI companies are doing — and what it means for community institutions.',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const TIER_LABEL = { pulse: 'Pulse', 'deep-dive': 'Deep dive' } as const;

export default async function BriefingsPage() {
  const briefings = await listAllBriefings();

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/briefings" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <section className="mk-hero mk-hero-compact">
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>Briefings</EyebrowChip>
            <h1>What happened in AI and banking — and what it means for you.</h1>
            <p className="mk-lede">
              Daily pulse notes and weekly deep dives on regulators, banks, fintechs, and the AI
              companies themselves. Every claim cites a named source.
            </p>
          </div>
        </div>
      </section>

      <Section variant="std" surface="white">
        <SectionHead kicker="All briefings" heading={<>{briefings.length} published, newest first.</>} />
        <div className="mk-brief-latest">
          {briefings.map((b) => (
            <Link key={b.slug} href={b.href} className="mk-brief-card">
              <div className="mk-brief-meta">
                <span>
                  {b.category}
                  {b.tier && <span className="mk-brief-tier">{TIER_LABEL[b.tier]}</span>}
                </span>
                <span>{b.readMinutes} min read</span>
              </div>
              <h3>{b.title}</h3>
              {b.dek && <p>{b.dek}</p>}
              <div className="mk-brief-foot">
                <span>{formatDate(b.date)}</span>
                <span className="mk-brief-read">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
