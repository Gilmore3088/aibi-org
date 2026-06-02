// /resources/archive — full Brief archive
//
// The /resources landing surfaces featured + latest only; this page
// lists every published essay, newest first. Linked from the
// "View all briefs" button on /resources.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SiteHeader,
  Section,
  SectionHead,
  EyebrowChip,
} from '@/components/mockup';
import { listAllEssays } from '@content/essays/_lib/registry';

export const metadata: Metadata = {
  alternates: { canonical: '/resources/archive' },
  title: 'Essay archive — The AI Banking Institute',
  description: 'Every published essay, newest first.',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ResearchArchiveFullPage() {
  const essays = await listAllEssays();

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/resources" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <section className="mk-hero mk-hero-compact">
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>Essays · Archive</EyebrowChip>
            <h1>Every published essay, newest first.</h1>
            <p className="mk-lede">
              Sourced AI research, field notes, and practical artifacts for community banks and
              credit unions. Every claim cites a named source.
            </p>
          </div>
        </div>
      </section>

      <Section variant="std" surface="white">
        <SectionHead kicker="Archive" heading={<>{essays.length} briefs published.</>} />
        <div className="mk-brief-latest">
          {essays.map((e) => (
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
      </Section>
    </div>
  );
}
