// /research — The AI Banking Brief
//
// 2026-05-26 rework: the page is the public face of the Brief.
// Sections: hero (Brief branding) → Signal Board → Featured Brief →
// Latest Briefs → newsletter CTA. The archive page itself stays as
// the entry point; "View all briefs" routes to a future /research/archive.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
  CtaBand,
} from '@/components/mockup';
import { listAllEssays } from '@content/essays/_lib/registry';

export const metadata: Metadata = {
  alternates: { canonical: '/research' },
  title: 'AI Banking Brief',
  description:
    'AI banking research, translated for community institutions. Sourced trends, regulatory signals, and practical takeaways for banks and credit unions adopting AI safely.',
  openGraph: {
    title: 'AI Banking Brief',
    description:
      'AI banking research, translated for community institutions. Sourced trends, regulatory signals, and practical takeaways.',
    url: '/research',
    type: 'website',
  },
  twitter: {
    title: 'AI Banking Brief',
    description:
      'AI banking research, translated for community institutions.',
  },
};

const SIGNALS: { signal: string; source: string; detail: string }[] = [
  {
    signal: 'Efficiency pressure',
    source: 'FDIC · Q4 2024',
    detail: 'Community-bank median efficiency ratio sits at ~65%.',
  },
  {
    signal: 'AI budget conversations',
    source: 'Bank Director 2024 · via Jack Henry',
    detail: '66% of banks are now discussing AI budget allocations.',
  },
  {
    signal: 'Consumer expectations',
    source: 'Personetics 2025 · via Apiture',
    detail: '84% would switch FIs for AI-driven financial insights.',
  },
  {
    signal: 'Regulatory uncertainty',
    source: 'GAO 25-107197 · May 2025',
    detail: 'No comprehensive AI-specific banking framework yet.',
  },
];

type ArtifactCategory = 'Governance' | 'Compliance' | 'Staff card' | 'Reference';
type ArtifactFormat = 'Markdown' | 'PDF';

interface PracticalArtifact {
  readonly title: string;
  readonly dek: string;
  readonly href: string;
  readonly category: ArtifactCategory;
  readonly format: ArtifactFormat;
}

const PRACTICAL_ARTIFACTS: readonly PracticalArtifact[] = [
  {
    title: 'AI Use-Case Inventory',
    dek: 'One-page register of every AI-touched workflow at your institution. The cheapest examiner-readiness move in community banking.',
    href: '/artifacts/ai-use-case-inventory.md',
    category: 'Governance',
    format: 'Markdown',
  },
  {
    title: 'Fair-Lending Review Checklist for AI-Assisted Processes',
    dek: 'Pre-deployment and recurring-review checklist for any AI process that touches credit decisions, pricing, or marketing eligibility.',
    href: '/artifacts/fair-lending-ai-review-checklist.md',
    category: 'Compliance',
    format: 'Markdown',
  },
  {
    title: 'Data Handling Reference Card',
    dek: 'Green / Yellow / Red data classes, the placeholder pattern, and the questions staff should ask before pasting anything into an AI tool.',
    href: '/artifacts/data-handling-reference-card.md',
    category: 'Staff card',
    format: 'Markdown',
  },
  {
    title: 'Red / Yellow / Green AI Use Card',
    dek: 'A short staff-facing classification of which AI uses are safe, which need approved tools, and which to avoid.',
    href: '/downloads/red-yellow-green-use-card.pdf',
    category: 'Staff card',
    format: 'PDF',
  },
  {
    title: 'Safe AI Use Checklist',
    dek: 'A reflex for the moment before staff paste anything into a chat tool. Strip data, ask clearly, fact-check, escalate the risky calls.',
    href: '/downloads/safe-ai-use-checklist.pdf',
    category: 'Staff card',
    format: 'PDF',
  },
  {
    title: 'Regulatory Cheatsheet',
    dek: 'One-page reference for the regulations community banks need to know when adopting AI: SR 11-7, ECOA / Reg B, TPRM, the AIEOG Lexicon.',
    href: '/downloads/regulatory-cheatsheet.pdf',
    category: 'Reference',
    format: 'PDF',
  },
  {
    title: 'Platform Feature Reference Card',
    dek: 'Quick reference for AI features baked into the platforms your institution likely already uses.',
    href: '/downloads/platform-feature-reference-card.pdf',
    category: 'Reference',
    format: 'PDF',
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ResearchArchivePage() {
  const essays = await listAllEssays();
  const featured = essays[0];
  const latest = essays.slice(1, 4);

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/research" cta={{ label: 'Subscribe to the Brief', href: '#subscribe' }} />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>The AI Banking Brief</EyebrowChip>
            <h1>AI banking research, translated for community institutions.</h1>
            <p className="mk-lede">
              Sourced trends, regulatory signals, and practical takeaways for banks and credit
              unions adopting AI safely.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#subscribe">
                Subscribe to the Brief
              </Button>
              <Button variant="ghost-dark" size="lg" href="#latest">
                Read the latest
              </Button>
            </div>
          </div>

          {featured && (
            <Link href={featured.href} className="mk-brief-featured-hero">
              <div className="mk-k">Featured Brief</div>
              <h2>{featured.title}</h2>
              {featured.dek && <p>{featured.dek}</p>}
              <div className="mk-brief-meta">
                <span>{featured.category}</span>
                <span>{formatDate(featured.date)}</span>
                <span>{featured.readMinutes} min read</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* SIGNAL BOARD */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="This month's signals"
          heading={<>What we&rsquo;re tracking right now.</>}
        />
        <div className="mk-signals">
          {SIGNALS.map((s) => (
            <div key={s.signal} className="mk-signal-card">
              <div className="mk-signal-name">{s.signal}</div>
              <div className="mk-signal-detail">{s.detail}</div>
              <div className="mk-signal-source">{s.source}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* LATEST BRIEFS */}
      <Section variant="std">
        <div id="latest" />
        <SectionHead
          kicker="Latest Briefs"
          heading={<>Recent essays from the Brief.</>}
        />
        <div className="mk-brief-latest">
          {latest.map((e) => (
            <Link key={e.slug} href={e.href} className="mk-brief-card">
              <div className="mk-brief-meta">
                <span>{e.category}</span>
                <span>{e.readMinutes} min read</span>
              </div>
              <h3>{e.title}</h3>
              {e.dek && <p>{e.dek}</p>}
              <div className="mk-brief-foot">
                <span>{formatDate(e.date)}</span>
                <span className="mk-brief-read">Read →</span>
              </div>
            </Link>
          ))}
        </div>
        {essays.length > 4 && (
          <div className="mk-brief-all">
            <Button variant="ink" href="/research/archive">
              View all briefs ({essays.length})
            </Button>
          </div>
        )}
      </Section>

      {/* NEWSLETTER CTA */}
      <div id="subscribe" />
      <CtaBand
        kicker="The AI Banking Brief"
        heading={<>Get the AI Banking Brief every other Friday.</>}
        body={
          <>
            One short email with sourced AI signals and what they mean for community banks and
            credit unions. No promotional copy.
          </>
        }
        actions={[
          { label: 'Subscribe to the Brief', href: '/assessment#newsletter', variant: 'gold' },
          { label: 'Take the readiness assessment', href: '/assessment', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
