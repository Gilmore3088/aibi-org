'use client';

// Guided artifact-finder layout (2026-05-28 audit Bucket B).
// Sticky left-rail FilterRail on desktop (≥1024px); collapsible <details>
// strip on mobile/tablet. Filters: Role, Format, Search. Sections filter
// themselves; their headings hide when 0 items match.

import { useMemo, useState } from 'react';
import {
  Button,
  CtaBand,
  Section,
  SectionHead,
  SiteHeader,
  StickyMobileCta,
} from '@/components/mockup';
import { FreeResourceDownloadGate } from '@/components/resources/FreeResourceDownloadGate';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Download,
  LockKeyhole,
  ShieldCheck,
  Users,
} from './icons';
import {
  type DeskCard as DeskCardData,
  type PaidPreview as PaidPreviewData,
  type ProblemPath as ProblemPathData,
  type RolePlaybook,
  type StarterKit,
  type Template as TemplateData,
  deskCards,
  paidPreviews,
  problemPaths,
  rolePlaybooks,
  starterKits,
  templates,
} from './data';

// ─── Filter taxonomy ─────────────────────────────────────────────────────
// Roles map 1:1 to RolePlaybook slugs. Formats are descriptive labels that
// span Template.format, DeskCard.type, and a synthetic "Playbook" / "Sample".
const ROLE_OPTIONS = [
  'Compliance',
  'Retail',
  'Marketing',
  'Lending',
  'BSA/AML',
  'IT/InfoSec',
  'Executive',
  'Operations',
  'Training/HR',
] as const;
type RoleFilter = (typeof ROLE_OPTIONS)[number];

const FORMAT_OPTIONS = ['Playbook', 'Template', 'Desk card', 'Sample'] as const;
type FormatFilter = (typeof FORMAT_OPTIONS)[number];

function requireProblemPath(title: ProblemPathData['title']): void {
  const path = problemPaths.find((entry) => entry.title === title);
  if (!path) throw new Error(`Missing problem path: ${title}`);
}

requireProblemPath('Set AI rules');
requireProblemPath('Brief leadership');
requireProblemPath('Train staff');
requireProblemPath('Preview paid output');

const START_HERE_CHOICES = [
  {
    label: 'I need rules',
    desc: 'Open the policy starter and use-case review path.',
    href: '/resources/templates/ai-use-policy-starter',
    icon: ShieldCheck,
  },
  {
    label: 'I need a role playbook',
    desc: 'Jump to the nine role-specific playbooks.',
    href: '#role-playbooks',
    icon: Users,
  },
  {
    label: 'I need a board artifact',
    desc: 'Open the leadership briefing checklist.',
    href: '/resources/templates/board-briefing-checklist',
    icon: BarChart3,
  },
  {
    label: 'I need staff training',
    desc: 'Start with the safe-use staff card.',
    href: '#desk-cards',
    icon: BookOpen,
  },
  {
    label: 'I just took the assessment',
    desc: 'Preview the report and next-step path.',
    href: '#preview-paid',
    icon: ClipboardCheck,
  },
] as const;

interface FilterState {
  readonly roles: ReadonlySet<RoleFilter>;
  readonly formats: ReadonlySet<FormatFilter>;
  readonly search: string;
}

const EMPTY_FILTERS: FilterState = {
  roles: new Set(),
  formats: new Set(),
  search: '',
};

const GOVERNANCE_LINKS = [
  {
    title: 'Security & governance',
    desc: 'The public boundary for approved tools, restricted data, human review, and evidence.',
    href: '/security',
    action: 'Open security page',
    tag: 'Guide',
    icon: ShieldCheck,
  },
  {
    title: 'LLM data handling',
    desc: 'Provider calls, retention posture, subprocessors, PII checks, and override handling.',
    href: '/security/data-handling',
    action: 'Review data path',
    tag: 'Data',
    icon: LockKeyhole,
  },
  {
    title: 'IT review packet',
    desc: 'Forwardable scope, support path, trust boundaries, and institution rollout questions.',
    href: '/security/it-approval',
    action: 'Forward packet',
    tag: 'Review',
    icon: ClipboardCheck,
  },
] as const;

function matchesSearch(text: string, search: string): boolean {
  if (!search) return true;
  return text.toLowerCase().includes(search.toLowerCase());
}

function playbookMatches(playbook: RolePlaybook, f: FilterState): boolean {
  if (f.formats.size && !f.formats.has('Playbook')) return false;
  if (f.roles.size && !roleMatchesPlaybook(playbook, f.roles)) return false;
  return matchesSearch(`${playbook.title} ${playbook.desc}`, f.search);
}

const ROLE_SLUG_MAP: Record<RoleFilter, string[]> = {
  Compliance: ['compliance'],
  Retail: ['retail'],
  Marketing: ['marketing'],
  Lending: ['lending'],
  'BSA/AML': ['bsa-aml'],
  'IT/InfoSec': ['infosec'],
  Executive: ['executive'],
  Operations: ['operations'],
  'Training/HR': ['training-hr'],
};

function roleMatchesPlaybook(p: RolePlaybook, roles: ReadonlySet<RoleFilter>): boolean {
  const selected = Array.from(roles);
  return selected.some((r) => ROLE_SLUG_MAP[r].includes(p.slug));
}

function templateMatches(template: TemplateData, f: FilterState): boolean {
  if (f.formats.size && !f.formats.has('Template')) return false;
  if (f.roles.size) {
    const selectedRoleSlugs = Array.from(f.roles).flatMap((role) => ROLE_SLUG_MAP[role]);
    const templateRoles = template.roles ?? [];
    if (templateRoles.length > 0) {
      if (!templateRoles.some((role) => selectedRoleSlugs.includes(role))) return false;
    } else if (!f.search) {
      // Generic templates are intentionally hidden on a role-only filter so
      // persona-driven visitors get a precise role artifact first. Search can
      // still cross-cut all template titles and descriptions.
      return false;
    }
  }
  return matchesSearch(`${template.title} ${template.desc} ${template.format}`, f.search);
}

function deskCardMatches(card: DeskCardData, f: FilterState): boolean {
  if (f.formats.size && !f.formats.has('Desk card')) return false;
  if (f.roles.size && !f.search) return false;
  return matchesSearch(`${card.title} ${card.desc} ${card.type}`, f.search);
}

function paidPreviewMatches(preview: PaidPreviewData, f: FilterState): boolean {
  if (f.formats.size && !f.formats.has('Sample')) return false;
  if (f.roles.size && !f.search) return false;
  return matchesSearch(`${preview.title} ${preview.desc}`, f.search);
}

function problemPathMatches(path: ProblemPathData, f: FilterState): boolean {
  if (f.formats.size && !f.formats.has(path.format)) return false;
  if (f.roles.size && !f.search) return false;
  return matchesSearch(`${path.title} ${path.artifact} ${path.format}`, f.search);
}

function slugFromApiDownloadHref(href: string): string | null {
  const match = href.match(/^\/api\/resources\/([^/]+)\/download$/);
  return match?.[1] ?? null;
}

function slugFromTemplateWordHref(href: string): string | null {
  const match = href.match(/^\/api\/resources\/templates\/([^/]+)\/word$/);
  return match ? `template-${match[1]}` : null;
}

function slugFromResourceWordHref(href: string): string | null {
  const match = href.match(/^\/api\/resources\/([^/]+)\/word$/);
  return match?.[1] ?? null;
}

function slugFromLargePrintHref(href: string): string | null {
  const match = href.match(/^\/api\/resources\/([^/]+)\/large-print$/);
  return match?.[1] ?? null;
}

function slugFromWordHref(href: string): string | null {
  return slugFromResourceWordHref(href) ?? slugFromTemplateWordHref(href);
}

export function ResourcesExperience() {
  const [selectedKit, setSelectedKit] = useState<StarterKit>(starterKits[0]);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const visiblePlaybooks = useMemo(
    () => rolePlaybooks.filter((p) => playbookMatches(p, filters)),
    [filters],
  );
  const visibleTemplates = useMemo(
    () => templates.filter((t) => templateMatches(t, filters)),
    [filters],
  );
  const visibleProblemPaths = useMemo(
    () => problemPaths.filter((p) => problemPathMatches(p, filters)),
    [filters],
  );
  const visibleDeskCards = useMemo(
    () => deskCards.filter((c) => deskCardMatches(c, filters)),
    [filters],
  );
  const visiblePaidPreviews = useMemo(
    () => paidPreviews.filter((p) => paidPreviewMatches(p, filters)),
    [filters],
  );
  const visibleResourceCount =
    visiblePlaybooks.length +
    visibleProblemPaths.length +
    visibleTemplates.length +
    visibleDeskCards.length +
    visiblePaidPreviews.length;

  return (
    <div className="mockup-scope" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
      <ResourceSkipLinks />
      <SiteHeader activePath="/resources" />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <h1>Start with the artifact, not a blank page.</h1>
            <p className="mk-lede">
              Policy starters, workflow SOPs, review checklists, and prompt cards built for
              banking teams.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#starter-kits">
                Browse kits <ArrowRight size={16} />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/assessment">
                Get readiness score
              </Button>
            </div>
          </div>

          <FeaturedKit selectedKit={selectedKit} setSelectedKit={setSelectedKit} />
        </div>
      </section>

      <StartHereChooser />

      {/* 2-col grid: sticky filter rail (left, desktop) + filtered content. */}
      <div className="rx-page-grid">
        <FilterRail filters={filters} setFilters={setFilters} />
        <div className="rx-page-main" id="resources-main">
          <p className="rx-sr-only" role="status" aria-live="polite" aria-atomic="true">
            {visibleResourceCount} filtered {visibleResourceCount === 1 ? 'artifact' : 'artifacts'} shown.
          </p>
      <Section variant="std" id="starter-kits">
        <SectionHead
          kicker="Featured starter kits"
          heading="Start with a bundle, not a blank page."
          lede="Each kit groups the practical artifacts a team needs for a specific job."
        />
        <div className="rx-grid rx-grid-4 rx-rail-mobile">
          {starterKits.map((kit) => (
            <StarterKitCard
              key={kit.id}
              kit={kit}
              selected={selectedKit.id === kit.id}
              onClick={() => setSelectedKit(kit)}
            />
          ))}
        </div>
      </Section>

      {visiblePlaybooks.length > 0 && (
        <Section variant="std" surface="white" id="role-playbooks">
          <SectionHead
            kicker="Role playbooks"
            heading={`${visiblePlaybooks.length} playbook${visiblePlaybooks.length === 1 ? '' : 's'} for the role you picked.`}
            lede="Open the role path, then download the gated templates and prompts that come with it."
          />
          <div className="rx-grid rx-grid-3 rx-grid-2col-mobile">
            {visiblePlaybooks.map((playbook) => (
              <RolePlaybookCard key={playbook.slug} playbook={playbook} />
            ))}
          </div>
        </Section>
      )}

      {visibleProblemPaths.length > 0 && (
        <Section variant="std" id="problem-paths">
          <SectionHead
            kicker="Problem paths"
            heading="Pick the job, then open the artifact."
            lede="Use these paths when you know the work to be done but not the resource name."
          />
          <div className="rx-grid rx-grid-3 rx-grid-2col-mobile">
            {visibleProblemPaths.map((path) => (
              <ProblemPathCard key={path.title} path={path} />
            ))}
          </div>
        </Section>
      )}

      {visibleTemplates.length > 0 && (
        <Section variant="std" id="templates">
          <SectionHead
            kicker="Templates"
            heading="Start your next meeting with these templates."
            lede="Starter documents for policy, workflow, board review, and AI use-case governance."
          />
          <div className="rx-grid rx-grid-4 rx-list-mobile">
            {visibleTemplates.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </div>
        </Section>
      )}

      <Section variant="std" surface="white" id="security-governance">
        <SectionHead
          kicker="Security and governance"
          heading="Need the review path before you download?"
          lede="If IT, risk, or compliance needs the boundary first, start with these public review pages."
        />
        <div className="rx-grid rx-grid-3 rx-grid-2col-mobile">
          {GOVERNANCE_LINKS.map((link) => (
            <GovernanceReviewCard key={link.href} link={link} />
          ))}
        </div>
      </Section>

      {visibleDeskCards.length > 0 && (
        <Section variant="std" surface="white" id="desk-cards">
          <div className="rx-desk-grid">
            <div>
              <SectionHead
                kicker="Desk cards"
                heading="One-page references your staff can use Monday."
                lede="Short, printable, and built for quick decisions before someone pastes work into an AI tool."
              />
              <Button variant="ink" href="/prompt-cards">
                Browse prompt cards <ArrowRight size={16} />
              </Button>
            </div>
            <div className="rx-grid rx-grid-2 rx-chips-mobile">
              {visibleDeskCards.map((card) => (
                <DeskCard key={card.slug} card={card} />
              ))}
            </div>
          </div>
        </Section>
      )}

      {visiblePaidPreviews.length > 0 && (
        <Section variant="std" id="preview-paid">
          <div className="rx-paid-grid">
            <div>
              <SectionHead
                kicker="Sample outputs"
                heading="See the deliverables before you choose."
                lede="Open the sample report or playbook, then start with the free score if you need a recommendation."
              />
              <div className="rx-grid rx-grid-2 rx-feature-mobile">
                {visiblePaidPreviews.map((preview) => (
                  <PaidPreviewCard key={preview.slug} preview={preview} />
                ))}
              </div>
            </div>
            <AssessmentCTA />
          </div>
        </Section>
      )}

      {/* Empty-state when every filter excludes everything. */}
      {visiblePlaybooks.length + visibleProblemPaths.length + visibleTemplates.length + visibleDeskCards.length + visiblePaidPreviews.length === 0 && (
        <Section variant="std" surface="white">
          <div className="rx-empty-state">
            <p className="mk-k">No matches</p>
            <h2>No artifacts match those filters.</h2>
            <p>Try clearing one filter, or browse all artifacts with no filter selected.</p>
            <Button variant="ink" onClick={() => setFilters(EMPTY_FILTERS)}>
              Reset filters
            </Button>
          </div>
        </Section>
      )}

        </div>{/* /.rx-page-main */}
      </div>{/* /.rx-page-grid */}

      <CtaBand
        hiddenOnMobile
        kicker="Not sure where to start?"
        heading={<>Get the recommended resource path.</>}
        body={<>The readiness assessment recommends a role path, top gap, and starter artifact.</>}
        actions={[
          { label: 'Get readiness score', href: '/assessment', variant: 'gold' },
          { label: 'Browse all downloads', href: '#templates', variant: 'ghost-dark' },
        ]}
      />

      <StickyMobileCta
        label="Get readiness score"
        href="/assessment"
        source="sticky-mobile-cta-resources"
      />
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function ResourceSkipLinks() {
  return (
    <nav className="rx-skip-links" aria-label="Resource page shortcuts">
      <a href="#start-here">Skip to start here</a>
      <a href="#resource-filters">Skip to filters</a>
      <a href="#resources-main">Skip to resources</a>
    </nav>
  );
}

function StartHereChooser() {
  return (
    <Section variant="std" surface="white" id="start-here">
      <div className="rx-start-grid" aria-labelledby="rx-start-here-heading">
        <div className="rx-start-copy">
          <div className="mk-k">Start here</div>
          <h2 id="rx-start-here-heading">Pick the work you need.</h2>
        </div>
        <div className="rx-start-cards">
          {START_HERE_CHOICES.map((choice) => {
            const Icon = choice.icon;
            return (
              <a key={choice.label} className="rx-mini-card" href={choice.href}>
                <Icon size={24} className="rx-mini-icon" />
                <div className="rx-mini-title">{choice.label}</div>
                <p className="rx-mini-sub">{choice.desc}</p>
              </a>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function FeaturedKit({
  selectedKit,
  setSelectedKit,
}: {
  selectedKit: StarterKit;
  setSelectedKit: (k: StarterKit) => void;
}) {
  const Icon = selectedKit.icon;
  return (
    <div className="rx-featured" data-testid="featured-kit">
      <div className="rx-featured-head">
        <div>
          <div className="mk-k">Recommended starter kit</div>
          <h3 data-testid="featured-kit-title">{selectedKit.title}</h3>
        </div>
        <Icon size={32} className="rx-featured-icon" />
      </div>
      <p className="rx-featured-desc">{selectedKit.desc}</p>
      <div className="rx-featured-body">
        <div className="rx-featured-pick">
          <div className="mk-k">Choose kit</div>
          <div className="rx-featured-list">
            {starterKits.map((kit) => (
              <button
                key={kit.id}
                type="button"
                onClick={() => setSelectedKit(kit)}
                aria-pressed={selectedKit.id === kit.id}
                className={`rx-kit-btn${selectedKit.id === kit.id ? ' rx-kit-btn-active' : ''}`}
              >
                {kit.title}
              </button>
            ))}
          </div>
        </div>
        <div className="rx-featured-items">
          <div className="mk-k">Includes</div>
          <ul className="rx-featured-items-list">
            {selectedKit.items.map((item) => (
              <li key={item.href}>
                <div className="rx-featured-item-row">
                  {slugFromApiDownloadHref(item.href) ? (
                    <FreeResourceDownloadGate
                      title={item.label}
                      href={item.href}
                      slug={slugFromApiDownloadHref(item.href)!}
                      source="resources-featured-kit-item"
                      actionLabel="Get PDF"
                      capturedLabel="Download PDF"
                      buttonClassName="rx-featured-item"
                    >
                      <CheckCircle size={20} className="rx-featured-item-check" />
                      <span>{item.label}</span>
                    </FreeResourceDownloadGate>
                  ) : (
                    <a className="rx-featured-item" href={item.href}>
                      <CheckCircle size={20} className="rx-featured-item-check" />
                      <span>{item.label}</span>
                    </a>
                  )}
                  {item.readHref && (
                    <a className="rx-featured-item-read" href={item.readHref}>
                      Read HTML
                    </a>
                  )}
                  {item.largePrint && (
                    <FreeResourceDownloadGate
                      title={`${item.label} large-print PDF`}
                      href={item.largePrint}
                      slug={slugFromLargePrintHref(item.largePrint) ?? slugFromApiDownloadHref(item.href) ?? item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      source="resources-featured-kit-large-print"
                      format="large-print PDF"
                      actionLabel="Get large print"
                      capturedLabel="Download large print"
                      buttonClassName="rx-featured-item-read"
                    >
                      Large print
                    </FreeResourceDownloadGate>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <FreeResourceDownloadGate
            title={selectedKit.title}
            href={selectedKit.zip}
            slug={slugFromApiDownloadHref(selectedKit.zip) ?? selectedKit.id}
            source="resources-featured-kit"
            format="ZIP"
            actionLabel="Get ZIP"
            capturedLabel="Download ZIP"
            buttonVariant="ink"
            buttonClassName="mk-btn mk-btn-ink rx-featured-cta"
          >
            Download kit <Download size={16} />
          </FreeResourceDownloadGate>
        </div>
      </div>
    </div>
  );
}

function StarterKitCard({
  kit,
  selected,
  onClick,
}: {
  kit: StarterKit;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = kit.icon;
  return (
    <article
      className={`rx-kit-card${selected ? ' rx-kit-card-active' : ''}`}
      data-kit-id={kit.id}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        aria-label={`Preview ${kit.title} in the featured panel`}
        className="rx-kit-card-body"
      >
        <div className="rx-kit-card-head">
          <Icon size={28} className="rx-kit-icon" />
          <span className="rx-pill">Kit</span>
        </div>
        <h3 className="rx-kit-title">{kit.title}</h3>
        <p className="rx-kit-desc">{kit.desc}</p>
        <p className="rx-kit-audience">{kit.audience}</p>
        <p className="rx-kit-audience" style={{ fontWeight: 600, color: 'var(--ink)' }}>
          {kit.items.length} {kit.items.length === 1 ? 'file' : 'files'} · click to preview contents
        </p>
      </button>
      <FreeResourceDownloadGate
        title={kit.title}
        href={kit.zip}
        slug={slugFromApiDownloadHref(kit.zip) ?? kit.id}
        source="resources-starter-kit-card"
        format="ZIP"
        actionLabel="Get ZIP"
        capturedLabel="Download ZIP"
        buttonClassName="rx-kit-card-zip"
        containerClassName="fr-download-gate-kit"
      >
        Download kit <Download size={14} />
      </FreeResourceDownloadGate>
    </article>
  );
}

function ProblemPathCard({ path }: { path: ProblemPathData }) {
  const Icon = path.icon;
  const downloadSlug = slugFromApiDownloadHref(path.href);

  return (
    <article className="rx-pb-card">
      <Icon size={28} className="rx-kit-icon" />
      <p className="rx-template-format">Problem path · {path.format}</p>
      <h3 className="rx-kit-title">{path.title}</h3>
      <p className="rx-kit-desc">{path.artifact}</p>
      <div className="rx-pb-actions">
        {downloadSlug ? (
          <FreeResourceDownloadGate
            title={path.artifact}
            href={path.href}
            slug={downloadSlug}
            source="resources-problem-path"
            format={path.format === 'Sample' ? 'PDF sample' : 'PDF'}
            actionLabel={path.format === 'Sample' ? 'Get sample' : 'Get PDF'}
            capturedLabel={path.format === 'Sample' ? 'Open sample' : 'Download PDF'}
            buttonVariant="ink"
          >
            {path.format === 'Sample' ? 'Open sample' : 'Download'} <ArrowRight size={16} />
          </FreeResourceDownloadGate>
        ) : (
          <Button variant="ink" href={path.href}>
            Open <ArrowRight size={16} />
          </Button>
        )}
        {path.readHref && (
          <Button variant="ghost-light" href={path.readHref}>
            Read HTML
          </Button>
        )}
        {path.largePrint && (
          <FreeResourceDownloadGate
            title={`${path.artifact} large-print PDF`}
            href={path.largePrint}
            slug={slugFromLargePrintHref(path.largePrint) ?? downloadSlug ?? path.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            source="resources-problem-path-large-print"
            format="large-print PDF"
            actionLabel="Get large print"
            capturedLabel="Download large print"
            buttonVariant="ghost-light"
          >
            Large print
          </FreeResourceDownloadGate>
        )}
      </div>
    </article>
  );
}

function GovernanceReviewCard({ link }: { link: (typeof GOVERNANCE_LINKS)[number] }) {
  const Icon = link.icon;
  return (
    <article className="rx-pb-card">
      <div className="rx-kit-card-head">
        <Icon size={28} className="rx-kit-icon" />
        <span className="rx-pill rx-pill-outline">{link.tag}</span>
      </div>
      <h3 className="rx-kit-title">{link.title}</h3>
      <p className="rx-kit-desc">{link.desc}</p>
      <div className="rx-pb-actions">
        <Button variant="ink" href={link.href}>
          {link.action} <ArrowRight size={16} />
        </Button>
      </div>
    </article>
  );
}

function RolePlaybookCard({ playbook }: { playbook: RolePlaybook }) {
  const Icon = playbook.icon;
  return (
    <article className="rx-pb-card">
      <div className="rx-kit-card-head">
        <Icon size={28} className="rx-kit-icon" />
        <span className="rx-pill rx-pill-outline">Playbook</span>
      </div>
      <h3 className="rx-kit-title">{playbook.title}</h3>
      <p className="rx-kit-desc">{playbook.desc}</p>
      <ul className="rx-pb-includes">
        {playbook.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="rx-pb-actions">
        <Button variant="ink" href={`/playbooks/${playbook.slug}`}>
          Open
        </Button>
        {playbook.readHref && (
          <Button variant="ghost-light" href={playbook.readHref}>
            Read HTML
          </Button>
        )}
        <FreeResourceDownloadGate
          title={`${playbook.title} Playbook`}
          href={playbook.pdf}
          slug={slugFromApiDownloadHref(playbook.pdf) ?? `${playbook.slug}-playbook`}
          source="resources-role-playbook-card"
          actionLabel="Get PDF"
          capturedLabel="Download PDF"
          buttonVariant="ghost-light"
        >
          PDF <Download size={16} />
        </FreeResourceDownloadGate>
        {playbook.word && (
          <FreeResourceDownloadGate
            title={`${playbook.title} Playbook`}
            href={playbook.word}
            slug={slugFromWordHref(playbook.word) ?? `${playbook.slug}-playbook`}
            source="resources-role-playbook-word"
            format="Word"
            actionLabel="Get Word"
            capturedLabel="Download Word"
            buttonVariant="ghost-light"
          >
            Word <Download size={16} />
          </FreeResourceDownloadGate>
        )}
      </div>
    </article>
  );
}

function TemplateCard({ template }: { template: TemplateData }) {
  const Icon = template.icon;
  return (
    <article className="rx-pb-card">
      <Icon size={28} className="rx-kit-icon" />
      <p className="rx-template-format">{template.format}</p>
      <h3 className="rx-kit-title">{template.title}</h3>
      <p className="rx-kit-desc">{template.desc}</p>
      <div className="rx-template-preview">
        {template.preview.map((item) => (
          <span key={item} className="rx-chip">{item}</span>
        ))}
      </div>
      <div className="rx-pb-actions">
        <Button variant="ink" href={template.href}>
          Open
        </Button>
        {template.download && (
          <FreeResourceDownloadGate
            title={template.title}
            href={template.download}
            slug={slugFromWordHref(template.download) ?? template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            source="resources-template-card"
            format="Word"
            actionLabel="Get Word"
            capturedLabel="Download Word"
            buttonVariant="ghost-light"
            buttonClassName="mk-btn mk-btn-ghost-light rx-download-icon-btn"
          >
            <Download size={18} />
          </FreeResourceDownloadGate>
        )}
      </div>
    </article>
  );
}

function DeskCard({ card }: { card: DeskCardData }) {
  const Icon = card.icon;
  return (
    <article className="rx-desk-card rx-desk-card-gated">
      <span className="rx-desk-icon"><Icon size={24} /></span>
      <div className="rx-desk-card-body">
        <p className="rx-template-format">{card.type}</p>
        <h3 className="rx-kit-title">{card.title}</h3>
        <p className="rx-kit-desc">{card.desc}</p>
        <FreeResourceDownloadGate
          title={card.title}
          href={card.href}
          slug={slugFromApiDownloadHref(card.href) ?? card.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          source="resources-desk-card"
          actionLabel="Get PDF"
          capturedLabel="Download PDF"
          buttonClassName="mk-download-gate-trigger"
          containerClassName="fr-download-gate-desk"
        />
        {card.word && (
          <FreeResourceDownloadGate
            title={card.title}
            href={card.word}
            slug={slugFromWordHref(card.word) ?? card.slug}
            source="resources-desk-card-word"
            format="Word"
            actionLabel="Get Word"
            capturedLabel="Download Word"
            buttonClassName="mk-download-gate-trigger"
            containerClassName="fr-download-gate-desk"
          />
        )}
        {card.readHref && (
          <a className="mk-download-gate-trigger rx-readable-card-link" href={card.readHref}>
            Read HTML
          </a>
        )}
        {card.largePrint && (
          <FreeResourceDownloadGate
            title={`${card.title} large-print PDF`}
            href={card.largePrint}
            slug={card.slug}
            source="resources-desk-card-large-print"
            format="large-print PDF"
            actionLabel="Get large print"
            capturedLabel="Download large print"
            buttonClassName="mk-download-gate-trigger"
            containerClassName="fr-download-gate-desk"
          />
        )}
      </div>
    </article>
  );
}

function PaidPreviewCard({ preview }: { preview: PaidPreviewData }) {
  const Icon = preview.icon;
  return (
    <article className="rx-pb-card">
      <Icon size={28} className="rx-kit-icon" />
      <h3 className="rx-kit-title">{preview.title}</h3>
      <p className="rx-kit-desc">{preview.desc}</p>
      <div className="rx-pb-actions">
        <FreeResourceDownloadGate
          title={preview.title}
          href={preview.href}
          slug={slugFromApiDownloadHref(preview.href) ?? preview.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          source="resources-paid-preview"
          actionLabel={preview.actionLabel}
          capturedLabel={preview.actionLabel}
          buttonVariant="ink"
        >
          {preview.actionLabel} <ArrowRight size={16} />
        </FreeResourceDownloadGate>
        {preview.readHref && (
          <Button variant="ghost-light" href={preview.readHref}>
            Read HTML
          </Button>
        )}
        {preview.word && (
          <FreeResourceDownloadGate
            title={preview.title}
            href={preview.word}
            slug={slugFromWordHref(preview.word) ?? preview.slug}
            source="resources-paid-preview-word"
            format="Word"
            actionLabel="Get Word"
            capturedLabel="Download Word"
            buttonVariant="ghost-light"
          >
            Word <Download size={16} />
          </FreeResourceDownloadGate>
        )}
      </div>
    </article>
  );
}

function AssessmentCTA() {
  return (
    <aside className="rx-assess-card">
      <div className="rx-assess-head">
        <div className="mk-k">Assess first</div>
        <h3>Not sure which artifact to use?</h3>
      </div>
      <div className="rx-assess-body">
        <p>Take the free assessment and get a recommended role path, top gap, and starter artifact.</p>
        <div className="rx-assess-tiers">
          <div className="rx-assess-tier">
            <p className="rx-assess-tier-k">Free assessment</p>
            <p className="rx-assess-tier-v">3 minutes · readiness score</p>
          </div>
          <div className="rx-assess-tier">
            <p className="rx-assess-tier-k">In-depth</p>
            <p className="rx-assess-tier-v">$99 · full report</p>
          </div>
        </div>
        <Button variant="gold" href="/assessment" className="rx-assess-cta">
          Get readiness score <ArrowRight size={16} />
        </Button>
      </div>
    </aside>
  );
}

/* ─── FilterRail ──────────────────────────────────────────────────────
   Sticky-left filter on desktop (≥1024px), collapsible <details> on
   smaller screens. Three groups: Role, Format, Search. Drives the
   per-section visibility on the right column. */
function FilterRail({
  filters,
  setFilters,
}: {
  readonly filters: FilterState;
  readonly setFilters: (f: FilterState) => void;
}) {
  function toggleRole(role: RoleFilter) {
    const next = new Set(filters.roles);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    setFilters({ ...filters, roles: next });
  }

  function toggleFormat(format: FormatFilter) {
    const next = new Set(filters.formats);
    if (next.has(format)) next.delete(format);
    else next.add(format);
    setFilters({ ...filters, formats: next });
  }

  const hasAny = filters.roles.size > 0 || filters.formats.size > 0 || filters.search.length > 0;

  const railBody = (
    <div className="rx-filter-rail-body">
      <label className="rx-filter-search" htmlFor="rx-filter-search-input">
        <span className="rx-filter-search-label">Search</span>
        <input
          id="rx-filter-search-input"
          type="search"
          placeholder="Search titles + descriptions"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="rx-filter-search-input"
        />
      </label>

      <div className="rx-filter-group">
        <div className="rx-filter-group-label">Role</div>
        <div className="rx-filter-chips">
          {ROLE_OPTIONS.map((role) => {
            const active = filters.roles.has(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                aria-pressed={active}
                className={`rx-filter-chip${active ? ' is-active' : ''}`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rx-filter-group">
        <div className="rx-filter-group-label">Format</div>
        <div className="rx-filter-chips">
          {FORMAT_OPTIONS.map((format) => {
            const active = filters.formats.has(format);
            return (
              <button
                key={format}
                type="button"
                onClick={() => toggleFormat(format)}
                aria-pressed={active}
                className={`rx-filter-chip${active ? ' is-active' : ''}`}
              >
                {format}
              </button>
            );
          })}
        </div>
      </div>

      {hasAny && (
        <button
          type="button"
          className="rx-filter-reset"
          onClick={() => setFilters(EMPTY_FILTERS)}
        >
          Reset all filters
        </button>
      )}
    </div>
  );

  return (
    <aside className="rx-filter-rail" id="resource-filters" aria-label="Filter artifacts">
      {/* Desktop view: static, sticky. */}
      <div className="rx-filter-rail-desktop">
        <h2 className="rx-filter-rail-title">Find an artifact</h2>
        {railBody}
      </div>
      {/* Mobile/tablet view: collapsible. */}
      <details className="rx-filter-rail-mobile">
        <summary className="rx-filter-rail-summary">
          {hasAny ? `${filters.roles.size + filters.formats.size + (filters.search ? 1 : 0)} filters active` : 'Filter artifacts'}
        </summary>
        {railBody}
      </details>
    </aside>
  );
}
