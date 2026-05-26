// /research — AI Banking Resources hub.
//
// 2026-05-26 rework: the page is the public Resources hub, not just
// the Brief archive. It surfaces every practical thing the Institute
// publishes — templates, playbooks, the Brief, assessments, downloads.

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
import { PLAYBOOK_INDEX } from '@/app/playbooks/data';
import { TEMPLATES } from './templates/data';

export const metadata: Metadata = {
  alternates: { canonical: '/research' },
  title: 'AI Banking Resources',
  description:
    'Templates, playbooks, briefs, and practical artifacts for community banks and credit unions adopting AI safely.',
  openGraph: {
    title: 'AI Banking Resources',
    description:
      'Templates, playbooks, briefs, and practical artifacts for community banks and credit unions adopting AI safely.',
    url: '/research',
    type: 'website',
  },
  twitter: {
    title: 'AI Banking Resources',
    description: 'Templates, playbooks, briefs, and practical artifacts.',
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

const DOWNLOADS: { title: string; desc: string; href: string; meta: string }[] = [
  {
    title: 'Regulatory cheatsheet',
    desc: 'One-page reference: SR 11-7, Interagency TPRM, ECOA/Reg B, AIEOG AI Lexicon.',
    href: '/artifacts/regulatory-cheatsheet.pdf',
    meta: 'PDF · 1 page',
  },
  {
    title: 'Platform feature reference card',
    desc: 'Quick reference for AiBI capabilities, assessment dimensions, and credential paths.',
    href: '/artifacts/platform-feature-reference-card.pdf',
    meta: 'PDF · 1 page',
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ResourcesHubPage() {
  const essays = await listAllEssays();
  const featured = essays[0];
  const latest = essays.slice(1, 4);

  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/research"
        cta={{ label: 'Subscribe to the Brief', href: '#subscribe' }}
      />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>AI Banking Resources</EyebrowChip>
            <h1>Practical AI resources for community banks and credit unions.</h1>
            <p className="mk-lede">
              Templates, role playbooks, sourced briefs, and downloadable references. Adapt before
              adopting — every starter names a section your institution should change.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#templates">
                Browse templates
              </Button>
              <Button variant="ghost-dark" size="lg" href="#subscribe">
                Subscribe to the Brief
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

      {/* TEMPLATES */}
      <Section variant="std">
        <div id="templates" />
        <SectionHead
          kicker="Templates & checklists"
          heading={<>Starter documents your team can adapt today.</>}
          lede={
            <>
              Each template names a section to change. Bring it to your committee, your auditor,
              and your examiner before adoption.
            </>
          }
        />
        <div className="mk-resources-grid">
          {TEMPLATES.map((t) => (
            <Link key={t.slug} href={`/research/templates/${t.slug}`} className="mk-resource-card">
              <div className="mk-resource-tag">Template</div>
              <h3>{t.title}</h3>
              <p>{t.dek}</p>
              <div className="mk-resource-foot">
                <span>{t.audience}</span>
                <span>{t.readMinutes} min</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* PLAYBOOKS */}
      <Section variant="std" surface="white">
        <div id="playbooks" />
        <SectionHead
          kicker="Role playbooks"
          heading={<>Use cases and artifacts by role.</>}
          lede={
            <>
              Six role playbooks covering compliance, retail, marketing, lending, BSA/AML, and
              IT/InfoSec. Each lists role-specific AI use cases, the artifacts produced, and the
              review path.
            </>
          }
        />
        <div className="mk-resources-grid mk-resources-3up">
          {PLAYBOOK_INDEX.map((p) => (
            <Link key={p.slug} href={`/playbooks/${p.slug}`} className="mk-resource-card">
              <div className="mk-resource-tag">Playbook</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="mk-resource-foot">
                <span>By role</span>
                <span>Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ASSESSMENTS */}
      <Section variant="std">
        <SectionHead
          kicker="Assessments"
          heading={<>Measure where you stand.</>}
        />
        <div className="mk-resources-grid mk-resources-2up">
          <Link href="/assessment" className="mk-resource-card">
            <div className="mk-resource-tag">Free</div>
            <h3>Free AI Readiness Assessment</h3>
            <p>Three minutes. Score, tier, top gap, and a starter artifact you can take to your team this week.</p>
            <div className="mk-resource-foot">
              <span>12 questions · 3 min</span>
              <span>Take it →</span>
            </div>
          </Link>
          <Link href="/assessment/in-depth" className="mk-resource-card">
            <div className="mk-resource-tag">$99</div>
            <h3>In-Depth Assessment</h3>
            <p>The 48-question maturity assessment. Role-specific plan and a reviewer-ready PDF report.</p>
            <div className="mk-resource-foot">
              <span>48 questions · 20 min</span>
              <span>Go deeper →</span>
            </div>
          </Link>
        </div>
      </Section>

      {/* DOWNLOADS */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Downloads"
          heading={<>One-page references.</>}
        />
        <div className="mk-resources-grid mk-resources-2up">
          {DOWNLOADS.map((d) => (
            <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer" className="mk-resource-card">
              <div className="mk-resource-tag">PDF</div>
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
              <div className="mk-resource-foot">
                <span>{d.meta}</span>
                <span>Download →</span>
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* LATEST BRIEFS */}
      <Section variant="std">
        <div id="latest" />
        <SectionHead
          kicker="The AI Banking Brief"
          heading={<>Recent essays.</>}
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
