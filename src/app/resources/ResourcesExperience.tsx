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
import {
  ArrowRight,
  CheckCircle,
  Download,
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
// Roles map 1:1 to RolePlaybook slugs. Formats are descriptive labels that
// span Template.format, DeskCard.type, and a synthetic "Playbook" / "Sample".
const ROLE_OPTIONS = ['Compliance', 'Retail', 'Marketing', 'Lending', 'BSA/AML', 'IT/InfoSec'] as const;
type RoleFilter = (typeof ROLE_OPTIONS)[number];

const FORMAT_OPTIONS = ['Playbook', 'Template', 'Desk card', 'Sample'] as const;
type FormatFilter = (typeof FORMAT_OPTIONS)[number];

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
};

function roleMatchesPlaybook(p: RolePlaybook, roles: ReadonlySet<RoleFilter>): boolean {
  const selected = Array.from(roles);
  return selected.some((r) => ROLE_SLUG_MAP[r].includes(p.slug));
}

function templateMatches(template: TemplateData, f: FilterState): boolean {
  if (f.formats.size && !f.formats.has('Template')) return false;
  // Templates aren't role-scoped — only honor role filter when search is
  // also empty to avoid hiding the entire grid on a role-only filter.
  if (f.roles.size && !f.search) return false;
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
  const visibleDeskCards = useMemo(
    () => deskCards.filter((c) => deskCardMatches(c, filters)),
    [filters],
  );
  const visiblePaidPreviews = useMemo(
    () => paidPreviews.filter((p) => paidPreviewMatches(p, filters)),
    [filters],
  );

  return (
    <div className="mockup-scope" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
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

      {/* 2-col grid: sticky filter rail (left, desktop) + filtered content. */}
      <div className="rx-page-grid">
        <FilterRail filters={filters} setFilters={setFilters} />
        <div className="rx-page-main">
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
            lede="Open the role path, then copy the templates and prompts that come with it."
          />
          <div className="rx-grid rx-grid-3 rx-grid-2col-mobile">
            {visiblePlaybooks.map((playbook) => (
              <RolePlaybookCard key={playbook.slug} playbook={playbook} />
            ))}
          </div>
        </Section>
      )}

      {visibleTemplates.length > 0 && (
        <Section variant="std" id="templates">
          <SectionHead
            kicker="Templates"
            heading="Copy these into your next meeting."
            lede="Starter documents for policy, workflow, board review, and AI use-case governance."
          />
          <div className="rx-grid rx-grid-4 rx-list-mobile">
            {visibleTemplates.map((template) => (
              <TemplateCard key={template.title} template={template} />
            ))}
          </div>
        </Section>
      )}

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
                <DeskCard key={card.title} card={card} />
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
                  <PaidPreviewCard key={preview.title} preview={preview} />
                ))}
              </div>
            </div>
            <AssessmentCTA />
          </div>
        </Section>
      )}

      {/* Empty-state when every filter excludes everything. */}
      {visiblePlaybooks.length + visibleTemplates.length + visibleDeskCards.length + visiblePaidPreviews.length === 0 && (
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
                <a className="rx-featured-item" href={item.href} target="_blank" rel="noopener">
                  <CheckCircle size={20} className="rx-featured-item-check" />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <Button
            variant="ink"
            href={selectedKit.zip}
            className="rx-featured-cta"
            aria-label={`Download ${selectedKit.title} kit`}
          >
            Download kit <Download size={16} />
          </Button>
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
      <a
        className="rx-kit-card-zip"
        href={kit.zip}
        aria-label={`Download ${kit.title} kit`}
      >
        Download kit <Download size={14} />
      </a>
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
        <Button variant="ghost-light" href={playbook.pdf}>
          PDF <Download size={16} />
        </Button>
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
          <Button
            variant="ghost-light"
            href={template.download}
            className="rx-download-icon-btn"
            aria-label={`Download ${template.title}`}
            title={`Download ${template.title}`}
          >
            <Download size={18} />
          </Button>
        )}
      </div>
    </article>
  );
}

function DeskCard({ card }: { card: DeskCardData }) {
  const Icon = card.icon;
  return (
    <a className="rx-desk-card" href={card.href} target="_blank" rel="noopener">
      <span className="rx-desk-icon"><Icon size={24} /></span>
      <div>
        <p className="rx-template-format">{card.type}</p>
        <h3 className="rx-kit-title">{card.title}</h3>
        <p className="rx-kit-desc">{card.desc}</p>
      </div>
    </a>
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
        <Button variant="ink" href={preview.href}>
          {preview.actionLabel} <ArrowRight size={16} />
        </Button>
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
    <aside className="rx-filter-rail" aria-label="Filter artifacts">
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
