'use client';

// /resources — simplified hub (2026-06-25).
// Previously this page stacked nine sections (featured-kit selector, a
// "Start here" chooser, starter kits, role playbooks, problem paths, templates,
// security links, desk cards, sample outputs) behind a sticky 2-column filter
// rail — too much, with redundant navigation and a cramped mobile layout.
//
// Now: a clean hero, one inline filter (role chips + search), and a short list
// of grouped resource grids that each stack to a single column on mobile.

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
  ClipboardCheck,
  Download,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
} from './icons';
import {
  type DeskCard as DeskCardData,
  type PaidPreview as PaidPreviewData,
  type RolePlaybook,
  type StarterKit,
  type Template as TemplateData,
  deskCards,
  paidPreviews,
  rolePlaybooks,
  starterKits,
  templates,
} from './data';

// ─── Filter taxonomy ─────────────────────────────────────────────────────
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

interface FilterState {
  readonly roles: ReadonlySet<RoleFilter>;
  readonly search: string;
}

const EMPTY_FILTERS: FilterState = { roles: new Set(), search: '' };

// "Start here" — task-based quick picks. Distinct from the role filter: this
// answers "what am I trying to do?" and jumps straight to the artifact/section.
const START_HERE_CHOICES = [
  {
    label: 'I need AI rules',
    desc: 'Open the policy starter and use-case review path.',
    href: '/resources/templates/ai-use-policy-starter',
    icon: ShieldCheck,
  },
  {
    label: 'I need a safe prompt',
    desc: 'Build a banker prompt with placeholders and review rules.',
    href: '/resources/prompting-foundation',
    icon: Sparkles,
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
    desc: 'Start with the safe-use desk cards.',
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

function roleMatchesPlaybook(p: RolePlaybook, roles: ReadonlySet<RoleFilter>): boolean {
  return Array.from(roles).some((r) => ROLE_SLUG_MAP[r].includes(p.slug));
}

function playbookMatches(playbook: RolePlaybook, f: FilterState): boolean {
  if (f.roles.size && !roleMatchesPlaybook(playbook, f.roles)) return false;
  return matchesSearch(`${playbook.title} ${playbook.desc}`, f.search);
}

function templateMatches(template: TemplateData, f: FilterState): boolean {
  if (f.roles.size) {
    const selectedRoleSlugs = Array.from(f.roles).flatMap((role) => ROLE_SLUG_MAP[role]);
    const templateRoles = template.roles ?? [];
    if (templateRoles.length > 0) {
      if (!templateRoles.some((role) => selectedRoleSlugs.includes(role))) return false;
    } else if (!f.search) {
      // Generic templates hide on a role-only filter so persona visitors get a
      // precise role artifact first. Search still cross-cuts everything.
      return false;
    }
  }
  return matchesSearch(`${template.title} ${template.desc} ${template.format}`, f.search);
}

function deskCardMatches(card: DeskCardData, f: FilterState): boolean {
  if (f.roles.size && !f.search) return false;
  return matchesSearch(`${card.title} ${card.desc} ${card.type}`, f.search);
}

function paidPreviewMatches(preview: PaidPreviewData, f: FilterState): boolean {
  if (f.roles.size && !f.search) return false;
  return matchesSearch(`${preview.title} ${preview.desc}`, f.search);
}

function kitMatches(kit: StarterKit, f: FilterState): boolean {
  // Kits aren't role-tagged; on a role-only filter they step aside so the role
  // artifacts lead. Search still cross-cuts them.
  if (f.roles.size && !f.search) return false;
  return matchesSearch(`${kit.title} ${kit.desc} ${kit.audience}`, f.search);
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
function slugFromWordHref(href: string): string | null {
  return slugFromResourceWordHref(href) ?? slugFromTemplateWordHref(href);
}

export function ResourcesExperience() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const visiblePlaybooks = useMemo(
    () => rolePlaybooks.filter((p) => playbookMatches(p, filters)),
    [filters],
  );
  const visibleTemplates = useMemo(
    () => templates.filter((t) => templateMatches(t, filters)),
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
  const visibleKits = useMemo(
    () => starterKits.filter((k) => kitMatches(k, filters)),
    [filters],
  );
  const visibleResourceCount =
    visiblePlaybooks.length +
    visibleTemplates.length +
    visibleDeskCards.length +
    visiblePaidPreviews.length +
    visibleKits.length;

  const nothingMatches = visibleResourceCount === 0;

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
              Policy starters, role playbooks, workflow SOPs, review checklists, and desk cards —
              built for banking teams. Filter by your role, or search.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#resources-main">
                Browse resources <ArrowRight size={16} />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/assessment">
                Get readiness score
              </Button>
            </div>
          </div>
        </div>
      </section>

      <StartHereChooser />

      <FilterBar filters={filters} setFilters={setFilters} resultCount={visibleResourceCount} />

      <div id="resources-main">
        <p className="rx-sr-only" role="status" aria-live="polite" aria-atomic="true">
          {visibleResourceCount} {visibleResourceCount === 1 ? 'artifact' : 'artifacts'} shown.
        </p>

        {visibleKits.length > 0 && (
          <Section variant="std" id="starter-kits">
            <SectionHead
              kicker="Starter kits"
              heading="Grab a bundle, not a blank page."
              lede="Each kit groups the artifacts a team needs for one job — download the whole set as a ZIP."
            />
            <div className="rx-grid rx-grid-3">
              {visibleKits.map((kit) => (
                <StarterKitCard key={kit.id} kit={kit} />
              ))}
            </div>
          </Section>
        )}

        {visiblePlaybooks.length > 0 && (
          <Section variant="std" surface="white" id="role-playbooks">
            <SectionHead
              kicker="Role playbooks"
              heading={`${visiblePlaybooks.length} role playbook${visiblePlaybooks.length === 1 ? '' : 's'}`}
              lede="Open the role path, then download the templates and prompts that come with it."
            />
            <div className="rx-grid rx-grid-3">
              {visiblePlaybooks.map((playbook) => (
                <RolePlaybookCard key={playbook.slug} playbook={playbook} />
              ))}
            </div>
          </Section>
        )}

        {visibleTemplates.length > 0 && (
          <Section variant="std" id="templates">
            <SectionHead
              kicker="Templates & checklists"
              heading="Adopt-and-adapt starter documents."
              lede="Policy, workflow, board review, fair-lending, and AI use-case governance — ready to fill in."
            />
            <div className="rx-grid rx-grid-3">
              {visibleTemplates.map((template) => (
                <TemplateCard key={template.slug} template={template} />
              ))}
            </div>
          </Section>
        )}

        {visibleDeskCards.length > 0 && (
          <Section variant="std" surface="white" id="desk-cards">
            <SectionHead
              kicker="Desk cards"
              heading="One-page references your staff can use Monday."
              lede="Short, printable, built for a quick decision before someone pastes work into an AI tool."
            />
            <div className="rx-grid rx-grid-3">
              {visibleDeskCards.map((card) => (
                <DeskCard key={card.slug} card={card} />
              ))}
            </div>
            <div className="rx-section-foot">
              <Button variant="ink" href="/prompt-cards">
                Browse prompt cards <ArrowRight size={16} />
              </Button>
            </div>
          </Section>
        )}

        {visiblePaidPreviews.length > 0 && (
          <Section variant="std" id="preview-paid">
            <SectionHead
              kicker="Sample outputs"
              heading="See the deliverables before you choose."
              lede="Open a sample report or playbook, then start with the free score if you need a recommendation."
            />
            <div className="rx-grid rx-grid-3">
              {visiblePaidPreviews.map((preview) => (
                <PaidPreviewCard key={preview.slug} preview={preview} />
              ))}
            </div>
          </Section>
        )}

        {nothingMatches && (
          <Section variant="std" surface="white">
            <div className="rx-empty-state">
              <p className="mk-k">No matches</p>
              <h2>No artifacts match those filters.</h2>
              <p>Try clearing the filter, or browse everything with no role selected.</p>
              <Button variant="ink" onClick={() => setFilters(EMPTY_FILTERS)}>
                Reset filters
              </Button>
            </div>
          </Section>
        )}

        {/* Governance review paths — for IT / risk / compliance who need the
            boundary before downloading. Kept compact, at the end. */}
        <Section variant="std" surface="white" id="security-governance">
          <SectionHead
            kicker="Security and governance"
            heading="Need the review path before you download?"
            lede="If IT, risk, or compliance needs the boundary first, start with these public review pages."
          />
          <div className="rx-grid rx-grid-3">
            {GOVERNANCE_LINKS.map((link) => (
              <GovernanceReviewCard key={link.href} link={link} />
            ))}
          </div>
        </Section>
      </div>

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

/* Inline filter — role chips + search. Replaces the sticky 2-col rail.
   Stacks cleanly and stays usable on mobile. */
function FilterBar({
  filters,
  setFilters,
  resultCount,
}: {
  readonly filters: FilterState;
  readonly setFilters: (f: FilterState) => void;
  readonly resultCount: number;
}) {
  function toggleRole(role: RoleFilter) {
    const next = new Set(filters.roles);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    setFilters({ ...filters, roles: next });
  }
  const hasAny = filters.roles.size > 0 || filters.search.length > 0;

  return (
    <div className="rx-filterbar" id="resource-filters" aria-label="Filter resources">
      <div className="mk-container rx-filterbar-inner">
        <label className="rx-filterbar-search" htmlFor="rx-filter-search-input">
          <span className="rx-sr-only">Search resources</span>
          <input
            id="rx-filter-search-input"
            type="search"
            placeholder="Search resources…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="rx-filterbar-input"
          />
        </label>
        <div className="rx-filterbar-chips" role="group" aria-label="Filter by role">
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
          {hasAny && (
            <button
              type="button"
              className="rx-filterbar-reset"
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Reset ({resultCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StarterKitCard({ kit }: { kit: StarterKit }) {
  const Icon = kit.icon;
  return (
    <article className="rx-pb-card">
      <div className="rx-kit-card-head">
        <Icon size={28} className="rx-kit-icon" />
        <span className="rx-pill">Kit</span>
      </div>
      <h3 className="rx-kit-title">{kit.title}</h3>
      <p className="rx-kit-desc">{kit.desc}</p>
      <ul className="rx-pb-includes">
        {kit.items.map((item) => (
          <li key={item.href}>{item.label}</li>
        ))}
      </ul>
      <div className="rx-pb-actions">
        <FreeResourceDownloadGate
          title={kit.title}
          href={kit.zip}
          slug={slugFromApiDownloadHref(kit.zip) ?? kit.id}
          source="resources-starter-kit-card"
          format="ZIP"
          actionLabel="Get ZIP"
          capturedLabel="Download ZIP"
          buttonVariant="ink"
        >
          Download kit <Download size={16} />
        </FreeResourceDownloadGate>
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
    <article className="rx-pb-card">
      <Icon size={28} className="rx-kit-icon" />
      <p className="rx-template-format">{card.type}</p>
      <h3 className="rx-kit-title">{card.title}</h3>
      <p className="rx-kit-desc">{card.desc}</p>
      <div className="rx-pb-actions">
        <FreeResourceDownloadGate
          title={card.title}
          href={card.href}
          slug={slugFromApiDownloadHref(card.href) ?? card.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          source="resources-desk-card"
          actionLabel="Get PDF"
          capturedLabel="Download PDF"
          buttonVariant="ink"
        >
          PDF <Download size={16} />
        </FreeResourceDownloadGate>
        {card.word && (
          <FreeResourceDownloadGate
            title={card.title}
            href={card.word}
            slug={slugFromWordHref(card.word) ?? card.slug}
            source="resources-desk-card-word"
            format="Word"
            actionLabel="Get Word"
            capturedLabel="Download Word"
            buttonVariant="ghost-light"
          >
            Word <Download size={16} />
          </FreeResourceDownloadGate>
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
            buttonVariant="ghost-light"
          >
            Large print
          </FreeResourceDownloadGate>
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
