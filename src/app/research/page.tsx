// /research — AI Banking Resources hub.
//
// 2026-05-27 rework: the page is the public downloads library. Every
// practical artifact the Institute publishes — playbooks, cheatsheets,
// reference cards, checklists, inline templates — is listed here.
// The "AI Banking Brief" framing was retired on 2026-05-27; this page
// is downloads + templates only.

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
import { DownloadGate } from '@/components/research/DownloadGate';
import { PLAYBOOK_INDEX } from '@/app/playbooks/data';
import { TEMPLATES } from './templates/data';

/** Derive a short slug from a download href, e.g. "/downloads/foo.pdf" → "foo". */
function slugFromHref(href: string): string {
  return href.split('/').pop()?.replace(/\.[^.]+$/, '') ?? href;
}

export const metadata: Metadata = {
  alternates: { canonical: '/research' },
  title: 'Resources & downloads',
  description:
    'Role playbooks, cheatsheets, reference cards, and starter templates for community banks and credit unions adopting AI safely.',
  openGraph: {
    title: 'Resources & downloads',
    description:
      'Role playbooks, cheatsheets, reference cards, and starter templates for community banks and credit unions adopting AI safely.',
    url: '/research',
    type: 'website',
  },
  twitter: {
    title: 'Resources & downloads',
    description: 'Role playbooks, cheatsheets, and starter templates.',
  },
};

interface DownloadItem {
  readonly title: string;
  readonly desc: string;
  readonly href: string;
  readonly meta: string;
}

const REFERENCE_CARDS: readonly DownloadItem[] = [
  {
    title: 'Safe AI Use Checklist',
    desc: 'A reflex for the moment before staff paste anything into a chat tool. Strip data, ask clearly, fact-check, escalate.',
    href: '/downloads/safe-ai-use-checklist.pdf',
    meta: 'PDF · Staff card',
  },
  {
    title: 'Red / Yellow / Green AI Use Card',
    desc: 'Short staff-facing classification of which AI uses are safe, which need approved tools, and which to avoid.',
    href: '/downloads/red-yellow-green-use-card.pdf',
    meta: 'PDF · Staff card',
  },
  {
    title: 'Regulatory Cheatsheet',
    desc: 'One-page reference: SR 11-7, ECOA / Reg B, Interagency TPRM, and the AIEOG AI Lexicon.',
    href: '/downloads/regulatory-cheatsheet.pdf',
    meta: 'PDF · Reference',
  },
  {
    title: 'Platform Feature Reference Card',
    desc: 'Quick reference for the AI features baked into platforms your institution likely already uses.',
    href: '/downloads/platform-feature-reference-card.pdf',
    meta: 'PDF · Reference',
  },
  {
    title: 'Prompt Strategy Cheat Sheet',
    desc: 'A short guide to writing prompts that produce safe, on-brief, reviewable AI output.',
    href: '/downloads/prompt-strategy-cheat-sheet.pdf',
    meta: 'PDF · Staff card',
  },
];

const NEW_ARTIFACTS: readonly DownloadItem[] = [
  {
    title: 'AI Use-Case Inventory',
    desc: 'Register template for documenting every AI use case in your institution — purpose, data, owner, review cadence.',
    href: '/artifacts/ai-use-case-inventory.md',
    meta: 'Markdown · Register',
  },
  {
    title: 'Data Handling Reference Card',
    desc: 'Green / Yellow / Red staff card mapping common data types to allowed AI surfaces.',
    href: '/artifacts/data-handling-reference-card.md',
    meta: 'Markdown · Staff card',
  },
  {
    title: 'Fair-Lending AI Review Checklist',
    desc: 'Pre-deployment plus recurring review checklist for any AI used in lending decisions.',
    href: '/artifacts/fair-lending-ai-review-checklist.md',
    meta: 'Markdown · Checklist',
  },
];

const SAMPLES: readonly DownloadItem[] = [
  {
    title: 'Sample Readiness Report',
    desc: 'Example of the full PDF report buyers receive after the In-Depth Assessment — score, dimensions, role plan.',
    href: '/downloads/sample-readiness-report.pdf',
    meta: 'PDF · Sample',
  },
  {
    title: 'In-Depth Assessment Playbook',
    desc: 'What the $99 In-Depth Assessment covers, how to use the report, and what to bring to your AI committee.',
    href: '/downloads/in-depth-playbook.pdf',
    meta: 'PDF · Buyer guide',
  },
];

export default function ResourcesHubPage() {
  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/research" />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>Resources &middot; Free downloads</EyebrowChip>
            <h1>Practical artifacts for community banks and credit unions.</h1>
            <p className="mk-lede">
              Role playbooks, cheatsheets, reference cards, and starter templates.
              Every artifact is sourced, named, and adaptable.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#playbooks">
                Browse role playbooks
              </Button>
              <Button variant="ghost-dark" size="lg" href="#downloads">
                Jump to downloads
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE PLAYBOOKS */}
      <Section variant="std" surface="white">
        <div id="playbooks" />
        <SectionHead
          kicker="Role playbooks"
          heading={<>Six playbooks. One for each role that runs the bank.</>}
          lede={
            <>
              Each playbook lists role-specific AI use cases, the artifacts produced,
              the review path, and the Toolbox assets that ship with it. Open the
              detail page to read the playbook online or download the PDF.
            </>
          }
        />
        <div className="mk-resources-grid mk-resources-3up">
          {PLAYBOOK_INDEX.map((p) => (
            <Link
              key={p.slug}
              href={`/playbooks/${p.slug}`}
              className="mk-resource-card"
            >
              <div className="mk-resource-tag">Playbook</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="mk-resource-foot">
                <span>By role</span>
                <span>Open &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* DOWNLOADS — REFERENCE CARDS */}
      <Section variant="std">
        <div id="downloads" />
        <SectionHead
          kicker="Cheatsheets &amp; reference cards"
          heading={<>One-page references your staff can keep on their desk.</>}
          lede={
            <>
              Free downloads. Enter your work email to receive the file.
              Each one names a section your institution should adapt before adopting.
            </>
          }
        />
        <div className="mk-resources-grid mk-resources-3up">
          {REFERENCE_CARDS.map((d) => (
            <div key={d.href} className="mk-resource-card">
              <div className="mk-resource-tag">PDF</div>
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
              <DownloadGate
                title={d.title}
                downloadHref={d.href}
                slug={slugFromHref(d.href)}
                meta={d.meta}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* NEW ARTIFACTS (.md) */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Starter artifacts"
          heading={<>Editable templates you can adapt today.</>}
          lede={
            <>
              Markdown files you can copy into your own docs, edit, and circulate.
              Built around sourced regulation and named guidance.
            </>
          }
        />
        <div className="mk-resources-grid mk-resources-3up">
          {NEW_ARTIFACTS.map((d) => (
            <div key={d.href} className="mk-resource-card">
              <div className="mk-resource-tag">Markdown</div>
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
              <DownloadGate
                title={d.title}
                downloadHref={d.href}
                slug={slugFromHref(d.href)}
                meta={d.meta}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* INLINE TEMPLATES */}
      <Section variant="std">
        <SectionHead
          kicker="Inline templates"
          heading={<>Longer-form starter documents.</>}
          lede={
            <>
              Read these on the site, then adapt for your institution. Each cites the
              named regulation or guidance it&rsquo;s grounded in.
            </>
          }
        />
        <div className="mk-resources-grid mk-resources-2up">
          {TEMPLATES.map((t) => (
            <Link
              key={t.slug}
              href={`/research/templates/${t.slug}`}
              className="mk-resource-card"
            >
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

      {/* SAMPLES */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="See it before you buy"
          heading={<>Sample reports and buyer guides.</>}
        />
        <div className="mk-resources-grid mk-resources-2up">
          {SAMPLES.map((d) => (
            <div key={d.href} className="mk-resource-card">
              <div className="mk-resource-tag">PDF</div>
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
              <DownloadGate
                title={d.title}
                downloadHref={d.href}
                slug={slugFromHref(d.href)}
                meta={d.meta}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ASSESSMENTS CTA */}
      <CtaBand
        kicker="Measure where you stand"
        heading={<>Two assessments. One tier model, two depths.</>}
        body={
          <>
            The free assessment gives you a tier and your top gap in three minutes.
            The In-Depth assessment goes deep on eight dimensions and ships a
            reviewer-ready PDF.
          </>
        }
        actions={[
          { label: 'Free assessment', href: '/assessment', variant: 'gold' },
          { label: 'In-Depth ($99)', href: '/assessment/in-depth', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
