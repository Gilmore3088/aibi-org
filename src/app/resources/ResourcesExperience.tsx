'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  CtaBand,
  EyebrowChip,
  Section,
  SectionHead,
  SiteHeader,
} from '@/components/mockup';
import {
  ArrowRight,
  CheckCircle,
  Download,
  Layers,
  Library,
} from './icons';
import {
  type ChooserTab,
  type DeskCard as DeskCardData,
  type PaidPreview as PaidPreviewData,
  type ProblemPath,
  type RolePlaybook,
  type StarterKit,
  type Template as TemplateData,
  chooserTabs,
  deskCards,
  paidPreviews,
  problemPaths,
  rolePlaybooks,
  starterKits,
  templates,
} from './data';

export function ResourcesExperience() {
  const [activeTab, setActiveTab] = useState<ChooserTab>('By role');
  const [selectedKit, setSelectedKit] = useState<StarterKit>(starterKits[0]);

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
            <EyebrowChip icon={<Library size={16} />}>Artifact library</EyebrowChip>
            <h1>Find the AI artifact your team needs next.</h1>
            <p className="mk-lede">
              Playbooks, checklists, templates, and prompt cards for banks and credit unions
              moving from AI curiosity to governed practice.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#starter-kits">
                Browse starter kits <ArrowRight size={16} />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/assessment">
                Get readiness score
              </Button>
            </div>
          </div>

          <FeaturedKit selectedKit={selectedKit} setSelectedKit={setSelectedKit} />
        </div>
      </section>

      <Section variant="std">
        <div className="rx-chooser">
          <div className="rx-chooser-rail">
            <div className="mk-k">Choose your starting point</div>
            <h2>Tell us what you need.</h2>
            <div className="rx-chooser-tabs">
              {chooserTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                  className={`rx-tab${activeTab === tab ? ' rx-tab-active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <ChooserPanel activeTab={activeTab} />
        </div>
      </Section>

      <Section variant="std" id="starter-kits">
        <SectionHead
          kicker="Featured starter kits"
          heading="Start with a bundle, not a blank page."
          lede="Each kit groups the practical artifacts a team needs for a specific job."
        />
        <div className="rx-grid rx-grid-4">
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

      <Section variant="std" surface="white" id="role-playbooks">
        <SectionHead
          kicker="Role playbooks"
          heading="Six playbooks. Built around the work each role actually owns."
          lede="Open the role path, then copy the templates and prompts that come with it."
        />
        <div className="rx-grid rx-grid-3">
          {rolePlaybooks.map((playbook) => (
            <RolePlaybookCard key={playbook.slug} playbook={playbook} />
          ))}
        </div>
      </Section>

      <Section variant="std" id="templates">
        <SectionHead
          kicker="Templates"
          heading="Copy these into your next meeting."
          lede="Starter documents for policy, workflow, board review, and AI use-case governance."
        />
        <div className="rx-grid rx-grid-4">
          {templates.map((template) => (
            <TemplateCard key={template.title} template={template} />
          ))}
        </div>
      </Section>

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
          <div className="rx-grid rx-grid-2">
            {deskCards.map((card) => (
              <DeskCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </Section>

      <Section variant="std" id="preview-paid">
        <div className="rx-paid-grid">
          <div>
            <SectionHead
              kicker="Preview paid outputs"
              heading="See what the assessments produce before you buy."
              lede="Use sample reports and buyer guides to decide whether the free snapshot or in-depth assessment is the right next step."
            />
            <div className="rx-grid rx-grid-2">
              {paidPreviews.map((preview) => (
                <PaidPreviewCard key={preview.title} preview={preview} />
              ))}
            </div>
          </div>
          <AssessmentCTA />
        </div>
      </Section>

      <CtaBand
        kicker="Not sure where to start?"
        heading={<>Get the recommended resource path.</>}
        body={<>The readiness assessment recommends a role path, top gap, and starter artifact.</>}
        actions={[
          { label: 'Get readiness score', href: '/assessment', variant: 'gold' },
          { label: 'Browse all downloads', href: '#templates', variant: 'ghost-dark' },
        ]}
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
          <Button variant="ink" href={selectedKit.zip} className="rx-featured-cta">
            Download kit ZIP · {selectedKit.zipSize} <Download size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChooserPanel({ activeTab }: { activeTab: ChooserTab }) {
  if (activeTab === 'By problem') {
    return (
      <div className="rx-chooser-panel">
        {problemPaths.map((path) => (
          <ProblemCard key={path.title} path={path} />
        ))}
      </div>
    );
  }
  if (activeTab === 'By format') {
    const formats: { label: string; href: string }[] = [
      { label: 'Playbook', href: '#role-playbooks' },
      { label: 'Checklist', href: '#desk-cards' },
      { label: 'Template', href: '#templates' },
      { label: 'Prompt card', href: '/prompt-cards' },
      { label: 'Report sample', href: '/downloads/sample-readiness-report.pdf' },
      { label: 'Markdown', href: '#templates' },
    ];
    return (
      <div className="rx-chooser-panel">
        {formats.map((f) => (
          <a key={f.label} href={f.href} className="rx-mini-card">
            <Layers size={24} className="rx-mini-icon" />
            <p className="rx-mini-title">{f.label}</p>
            <p className="rx-mini-sub">Browse by artifact type</p>
          </a>
        ))}
      </div>
    );
  }
  return (
    <div className="rx-chooser-panel">
      {rolePlaybooks.map((role) => {
        const Icon = role.icon;
        return (
          <a key={role.slug} href={`/playbooks/${role.slug}`} className="rx-mini-card">
            <Icon size={24} className="rx-mini-icon" />
            <p className="rx-mini-title">{role.title}</p>
            <p className="rx-mini-sub">Open role path</p>
          </a>
        );
      })}
    </div>
  );
}

function ProblemCard({ path }: { path: ProblemPath }) {
  const Icon = path.icon;
  return (
    <a className="rx-mini-card" href={path.href} target={path.href.startsWith('/') ? '_self' : undefined}>
      <Icon size={24} className="rx-mini-icon" />
      <p className="rx-mini-title">{path.title}</p>
      <p className="rx-mini-sub">{path.artifact}</p>
    </a>
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
      </button>
      <a className="rx-kit-card-zip" href={kit.zip}>
        Download kit ZIP · {kit.zipSize} <Download size={14} />
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
        {template.pdf && (
          <Button variant="ghost-light" href={template.pdf}>
            PDF <Download size={16} />
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
      <Button variant="ghost-light" href={preview.href}>
        Preview <ArrowRight size={16} />
      </Button>
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
