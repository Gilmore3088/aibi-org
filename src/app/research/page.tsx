// /research — Research and field notes for practical banking AI.
//
// 2026-05-28 hero-system reframe: the hero is now research-framed (essays,
// field notes, templates) since the artifact-library lives at /resources.
// The downstream catalog sections (playbooks, reference cards, samples)
// are kept here for now; a future PR will split research-flavored content
// (essays + briefings + research templates) from artifact downloads.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
  CtaBand,
  StickyMobileCta,
} from '@/components/mockup';
import { DownloadGate } from '@/components/research/DownloadGate';
import { ResearchPageClient } from '@/components/research/ResearchPageClient';
import { FilteredCard, FilteredSection } from '@/components/research/FilteredSection';
import { TEMPLATES } from './templates/data';
import type { ArtifactTags } from '@/components/research/GuidedFilter';

/** Derive a short slug from a download href. Handles both the current
 * API form "/api/resources/foo/download" (→ "foo") and legacy
 * "/downloads/foo.pdf" or "/artifacts/foo.md" (→ "foo"). */
function slugFromHref(href: string): string {
  const apiMatch = href.match(/^\/api\/resources\/([^/]+)\/download/);
  if (apiMatch) return apiMatch[1];
  return href.split('/').pop()?.replace(/\.[^.]+$/, '') ?? href;
}

export const metadata: Metadata = {
  alternates: { canonical: '/research' },
  title: 'Research & field notes',
  description:
    'Plain-language essays, field notes, and templates on AI governance, training, productivity, and risk in community banking and credit unions.',
  openGraph: {
    title: 'Research & field notes',
    description:
      'Plain-language essays, field notes, and templates on AI governance, training, productivity, and risk in community banking and credit unions.',
    url: '/research',
    type: 'website',
  },
  twitter: {
    title: 'Research & field notes',
    description: 'Essays, field notes, and templates on practical banking AI.',
  },
};

interface DownloadItem {
  readonly title: string;
  readonly desc: string;
  readonly href: string;
  readonly meta: string;
  readonly tags: ArtifactTags;
}

interface PlaybookItem {
  readonly slug: string;
  readonly title: string;
  readonly desc: string;
  readonly tags: ArtifactTags;
}

interface TemplateItem {
  readonly slug: string;
  readonly title: string;
  readonly dek: string;
  readonly audience: string;
  readonly readMinutes: number;
  readonly tags: ArtifactTags;
}

// ─── Tagged artifact data ────────────────────────────────────────────────────

const REFERENCE_CARDS: readonly DownloadItem[] = [
  {
    title: 'Safe AI Use Checklist',
    desc: 'A reflex for the moment before staff paste anything into a chat tool. Strip data, ask clearly, fact-check, escalate.',
    href: '/api/resources/safe-ai-use-checklist/download',
    meta: 'PDF · Staff card',
    tags: {
      roles: ['Compliance', 'Operations', 'BSA'],
      problems: ['Write safer staff comms', 'Decide which AI tools to allow'],
      format: 'Cheatsheet',
    },
  },
  {
    title: 'Red / Yellow / Green AI Use Card',
    desc: 'Short staff-facing classification of which AI uses are safe, which need approved tools, and which to avoid.',
    href: '/api/resources/red-yellow-green-use-card/download',
    meta: 'PDF · Staff card',
    tags: {
      roles: ['Compliance', 'Operations', 'IT/Executive'],
      problems: ['Decide which AI tools to allow', 'Write safer staff comms'],
      format: 'Reference card',
    },
  },
  {
    title: 'Regulatory Cheatsheet',
    desc: 'One-page reference: SR 11-7, ECOA / Reg B, Interagency TPRM, and the AIEOG AI Lexicon.',
    href: '/api/resources/regulatory-cheatsheet/download',
    meta: 'PDF · Reference',
    tags: {
      roles: ['Compliance', 'IT/Executive', 'BSA'],
      problems: ['Prep for an audit', 'Get an AI policy started'],
      format: 'Cheatsheet',
    },
  },
  {
    title: 'Platform Feature Reference Card',
    desc: 'Quick reference for the AI features baked into platforms your institution likely already uses.',
    href: '/api/resources/platform-feature-reference-card/download',
    meta: 'PDF · Reference',
    tags: {
      roles: ['IT/Executive', 'Operations'],
      problems: ['Decide which AI tools to allow'],
      format: 'Reference card',
    },
  },
  {
    title: 'Prompt Strategy Cheat Sheet',
    desc: 'A short guide to writing prompts that produce safe, on-brief, reviewable AI output.',
    href: '/api/resources/prompt-strategy-cheat-sheet/download',
    meta: 'PDF · Staff card',
    tags: {
      roles: ['Operations', 'Marketing', 'Lending', 'Compliance'],
      problems: ['Write safer staff comms', 'Improve customer comms'],
      format: 'Cheatsheet',
    },
  },
];

const NEW_ARTIFACTS: readonly DownloadItem[] = [
  {
    title: 'AI Use-Case Inventory',
    desc: 'Register template for documenting every AI use case in your institution — purpose, data, owner, review cadence.',
    href: '/artifacts/ai-use-case-inventory.md',
    meta: 'Markdown · Register',
    tags: {
      roles: ['Compliance', 'IT/Executive'],
      problems: ['Get an AI policy started', 'Prep for an audit'],
      format: 'Policy starter',
    },
  },
  {
    title: 'Data Handling Reference Card',
    desc: 'Green / Yellow / Red staff card mapping common data types to allowed AI surfaces.',
    href: '/artifacts/data-handling-reference-card.md',
    meta: 'Markdown · Staff card',
    tags: {
      roles: ['Compliance', 'IT/Executive', 'BSA'],
      problems: ['Decide which AI tools to allow', 'Write safer staff comms'],
      format: 'Reference card',
    },
  },
  {
    title: 'Fair-Lending AI Review Checklist',
    desc: 'Pre-deployment plus recurring review checklist for any AI used in lending decisions.',
    href: '/artifacts/fair-lending-ai-review-checklist.md',
    meta: 'Markdown · Checklist',
    tags: {
      roles: ['Lending', 'Compliance'],
      problems: ['Speed up loan-file review', 'Prep for an audit'],
      format: 'Cheatsheet',
    },
  },
];

const SAMPLES: readonly DownloadItem[] = [
  {
    title: 'Sample Readiness Report',
    desc: 'Example of the full PDF report buyers receive after the In-Depth Assessment — score, dimensions, role plan.',
    href: '/api/resources/sample-readiness-report/download',
    meta: 'PDF · Sample',
    tags: {
      roles: ['IT/Executive', 'Compliance'],
      problems: ['Get an AI policy started', 'Prep for an audit'],
      format: 'Sample report',
    },
  },
  {
    title: 'In-Depth Assessment Playbook',
    desc: 'What the $99 In-Depth Assessment covers, how to use the report, and what to bring to your AI committee.',
    href: '/api/resources/in-depth-playbook/download',
    meta: 'PDF · Buyer guide',
    tags: {
      roles: ['IT/Executive'],
      problems: ['Get an AI policy started'],
      format: 'Sample report',
    },
  },
];

// 2026-05-28 audit: surface 3 featured essays above GuidedFilter — one per
// buyer persona (governance / operator / executive). Revise by editing this
// array; visible above the filter on every viewport.
const FEATURED_ESSAYS = [
  {
    slug: 'ai-governance-without-the-jargon',
    title: 'AI Governance Without the Jargon',
    dek: 'A plain-language guide to AI governance for community bankers — SR 11-7, TPRM, ECOA, and the AIEOG lexicon, translated.',
    persona: 'Governance',
    readMinutes: 12,
  },
  {
    slug: 'the-skill-not-the-prompt',
    title: 'The Skill, Not the Prompt',
    dek: 'Why community bankers need a different frame for AI — workflow craft beats prompt cleverness when the work is reviewed by examiners.',
    persona: 'Operator',
    readMinutes: 9,
  },
  {
    slug: 'what-your-efficiency-ratio-is-hiding',
    title: "What Your Efficiency Ratio Is Hiding",
    dek: "Community bank median efficiency ratio sits ~10 points above the industry — where AI actually moves it and where it doesn't.",
    persona: 'Executive',
    readMinutes: 11,
  },
] as const;

const TAGGED_PLAYBOOKS: readonly PlaybookItem[] = [
  {
    slug: 'compliance',
    title: 'Compliance',
    desc: 'Procedure cleanup, audit prep, exam-ready summaries.',
    tags: {
      roles: ['Compliance'],
      problems: ['Prep for an audit', 'Get an AI policy started', 'Write safer staff comms'],
      format: 'Playbook',
    },
  },
  {
    slug: 'retail',
    title: 'Branch / Retail',
    desc: 'Coaching scripts, service recovery, frontline reference cards.',
    tags: {
      roles: ['Operations'],
      problems: ['Write safer staff comms', 'Improve customer comms'],
      format: 'Playbook',
    },
  },
  {
    slug: 'marketing',
    title: 'Marketing',
    desc: 'Campaign drafts, disclosure flags, brand-safe variations.',
    tags: {
      roles: ['Marketing'],
      problems: ['Improve customer comms', 'Write safer staff comms'],
      format: 'Playbook',
    },
  },
  {
    slug: 'lending',
    title: 'Lending',
    desc: 'Adverse-action tuner, denial summaries, fair-lending checks.',
    tags: {
      roles: ['Lending'],
      problems: ['Speed up loan-file review', 'Prep for an audit'],
      format: 'Playbook',
    },
  },
  {
    slug: 'bsa-aml',
    title: 'BSA / AML',
    desc: 'SAR decision tree, structuring patterns, CDD baseline drift.',
    tags: {
      roles: ['BSA'],
      problems: ['Prep for an audit', 'Write safer staff comms'],
      format: 'Playbook',
    },
  },
  {
    slug: 'infosec',
    title: 'IT / InfoSec',
    desc: 'Data classification matrix, allowed-tools verdicts, NPI rules.',
    tags: {
      roles: ['IT/Executive'],
      problems: ['Decide which AI tools to allow', 'Get an AI policy started'],
      format: 'Playbook',
    },
  },
];

const TAGGED_TEMPLATES: readonly TemplateItem[] = TEMPLATES.map((t) => {
  const tagMap: Record<string, ArtifactTags> = {
    'ai-use-policy-starter': {
      roles: ['Compliance', 'IT/Executive'],
      problems: ['Get an AI policy started', 'Prep for an audit'],
      format: 'Template',
    },
    'ai-workflow-sop': {
      roles: ['Operations', 'Compliance', 'Lending'],
      problems: ['Write safer staff comms', 'Prep for an audit'],
      format: 'Template',
    },
    'board-briefing-checklist': {
      roles: ['IT/Executive', 'Compliance'],
      problems: ['Get an AI policy started', 'Decide which AI tools to allow'],
      format: 'Template',
    },
    'gtm-plan': {
      roles: ['Marketing', 'Operations'],
      problems: ['Improve customer comms', 'Write safer staff comms'],
      format: 'Template',
    },
  };
  return {
    slug: t.slug,
    title: t.title,
    dek: t.dek,
    audience: t.audience,
    readMinutes: t.readMinutes,
    tags: tagMap[t.slug] ?? { roles: [], problems: [], format: 'Template' },
  };
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesHubPage() {
  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/research" />

      {/* HERO — research framing. Audit 2026-05-28 hero-system feedback:
          /research's title used to read like a downloads catalog while
          /resources lives at /resources for that. Research is now research:
          essays, field notes, templates on AI in community banking. The
          right-side card surfaces three featured reads as the proof object. */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>Research &middot; field notes</EyebrowChip>
            <h1>Plain-language research for practical banking AI.</h1>
            <p className="mk-lede">
              Essays, field notes, and templates on AI governance, training,
              productivity, and risk.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#featured-essays">
                Read the latest
              </Button>
              <Button variant="ghost-dark" size="lg" href="#templates">
                Browse templates
              </Button>
            </div>
          </div>

          <ResearchHeroFeaturedCard />
        </div>
      </section>

      {/* FEATURED ESSAYS — three picks across compliance / operator / executive
          buyer personas. Renders ABOVE the GuidedFilter so mobile visitors see
          curated content before being asked to filter (audit 2026-05-28).
          To revise: swap slugs/copy in FEATURED_ESSAYS below. */}
      <Section variant="std" surface="white">
        <span id="featured-essays" />
        <SectionHead
          kicker="Featured essays"
          heading={<>Three reads to start with.</>}
          lede={<>If you only read three pieces, start here — one each for governance, operator skill, and executive ROI.</>}
        />
        <div className="mk-resources-grid mk-resources-3up">
          {FEATURED_ESSAYS.map((e) => (
            <Link key={e.slug} href={`/research/${e.slug}`} className="mk-resource-card">
              <div className="mk-resource-tag">{e.persona}</div>
              <h3>{e.title}</h3>
              <p>{e.dek}</p>
              <div className="mk-resource-foot">
                <span>{e.readMinutes} min read</span>
                <span>Read &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/*
        Client shell: GuidedFilterProvider + GuidedFilter selector.
        All catalog sections below are inside this provider.
      */}
      <ResearchPageClient>

        {/* ROLE PLAYBOOKS */}
        <FilteredSection
          sectionName="Role playbooks"
          artifactTags={Object.fromEntries(TAGGED_PLAYBOOKS.map((p) => [p.slug, p.tags]))}
        >
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
              {TAGGED_PLAYBOOKS.map((p) => (
                <FilteredCard key={p.slug} tags={p.tags}>
                  <Link href={`/playbooks/${p.slug}`} className="mk-resource-card">
                    <div className="mk-resource-tag">Playbook</div>
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                    <div className="mk-resource-foot">
                      <span>By role</span>
                      <span>Open &rarr;</span>
                    </div>
                  </Link>
                </FilteredCard>
              ))}
            </div>
          </Section>
        </FilteredSection>

        {/* DOWNLOADS — REFERENCE CARDS */}
        <FilteredSection
          sectionName="Cheatsheets & reference cards"
          artifactTags={Object.fromEntries(REFERENCE_CARDS.map((d) => [d.href, d.tags]))}
        >
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
                <FilteredCard key={d.href} tags={d.tags}>
                  <div className="mk-resource-card">
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
                </FilteredCard>
              ))}
            </div>
          </Section>
        </FilteredSection>

        {/* NEW ARTIFACTS (.md) */}
        <FilteredSection
          sectionName="Starter artifacts"
          artifactTags={Object.fromEntries(NEW_ARTIFACTS.map((d) => [d.href, d.tags]))}
        >
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
                <FilteredCard key={d.href} tags={d.tags}>
                  <div className="mk-resource-card">
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
                </FilteredCard>
              ))}
            </div>
          </Section>
        </FilteredSection>

        {/* INLINE TEMPLATES */}
        <FilteredSection
          sectionName="Inline templates"
          artifactTags={Object.fromEntries(TAGGED_TEMPLATES.map((t) => [t.slug, t.tags]))}
        >
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
              {TAGGED_TEMPLATES.map((t) => (
                <FilteredCard key={t.slug} tags={t.tags}>
                  <Link href={`/research/templates/${t.slug}`} className="mk-resource-card">
                    <div className="mk-resource-tag">Template</div>
                    <h3>{t.title}</h3>
                    <p>{t.dek}</p>
                    <div className="mk-resource-foot">
                      <span>{t.audience}</span>
                      <span>{t.readMinutes} min</span>
                    </div>
                  </Link>
                </FilteredCard>
              ))}
            </div>
          </Section>
        </FilteredSection>

        {/* SAMPLES */}
        <FilteredSection
          sectionName="Sample reports & buyer guides"
          artifactTags={Object.fromEntries(SAMPLES.map((d) => [d.href, d.tags]))}
        >
          <Section variant="std" surface="white">
            <SectionHead
              kicker="See it before you buy"
              heading={<>Sample reports and buyer guides.</>}
            />
            <div className="mk-resources-grid mk-resources-2up">
              {SAMPLES.map((d) => (
                <FilteredCard key={d.href} tags={d.tags}>
                  <div className="mk-resource-card">
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
                </FilteredCard>
              ))}
            </div>
          </Section>
        </FilteredSection>

      </ResearchPageClient>

      {/* ASSESSMENTS CTA */}
      <CtaBand
        hiddenOnMobile
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

      <StickyMobileCta
        label="Take the free assessment"
        href="/assessment"
        source="research-sticky"
      />
    </div>
  );
}

// Hero proof card — three featured reads, mirrors the .mk-hreport pattern
// used on Home and Courses so the research hero matches the rest of the
// design system. Slugs/copy must stay in sync with FEATURED_ESSAYS above.
function ResearchHeroFeaturedCard() {
  return (
    <div className="mk-hreport">
      <div className="mk-hreport-left">
        <div className="mk-k">Start here</div>
        <div className="mk-v">3</div>
        <div className="mk-u">featured reads</div>
        <div className="mk-tier">
          <span aria-hidden="true">★</span>
          Hand-picked
        </div>
      </div>
      <div className="mk-hreport-right">
        <div className="mk-k">One per persona</div>
        <div className="mk-hresult">
          {FEATURED_ESSAYS.map((e) => (
            <Link key={e.slug} href={`/research/${e.slug}`} className="mk-hresult-row mk-hresult-row-link">
              <div className="mk-rk">{e.persona}</div>
              <div className="mk-rv">{e.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
