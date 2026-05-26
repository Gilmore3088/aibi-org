/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
  CtaBand,
} from '@/components/mockup';

// ---------- Icons ----------

type IconProps = { className?: string; size?: number };
const sw = (p: IconProps) => ({
  className: p.className,
  width: p.size,
  height: p.size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

const LayersIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>);
const LayersOnlyIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /></svg>);
const ChatIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const RectIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 12h4M14 12h4" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const StarIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 3l1.9 5.8L20 10l-4.6 3.4L17.2 20 12 16.6 6.8 20l1.8-6.6L4 10l6.1-1.2z" /></svg>);
const StackIcon = (p: IconProps) => (<svg {...sw(p)}><polyline points="22 12 12 17 2 12" /><polygon points="12 2 22 7 12 12 2 7" /></svg>);
const CheckIcon = (p: IconProps) => (<svg {...sw(p)}><polyline points="20 6 9 17 4 12" /></svg>);
const CheckSquareIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);

// ---------- Module data ----------

type ModuleIcon = typeof LayersOnlyIcon;

const MODULES: { title: string; desc: string; activity: string; artifact: string; icon: ModuleIcon; meta: string }[] = [
  {
    title: 'AI Landscape',
    desc: "Models, tools, limits, and fit. What's available, what it does well, where it fails.",
    activity: 'Map three AI tools to a banking task and rate fit/risk.',
    artifact: 'AI tool-fit decision sheet (saved to your Pack).',
    icon: LayersOnlyIcon,
    meta: '6 lessons · 50 min',
  },
  {
    title: 'Prompt Foundations',
    desc: 'Clear instructions with built-in review standards. The way bankers should write to a model.',
    activity: 'Rewrite a vague prompt three times until the output passes the review checklist.',
    artifact: 'Reviewed prompt template (saved to your Pack).',
    icon: ChatIcon,
    meta: '8 lessons · 75 min',
  },
  {
    title: 'Skills',
    desc: 'Turn prompts into repeatable assets. Saved, named, tagged, owned.',
    activity: 'Promote two working prompts into named, tagged Skills with run histories.',
    artifact: 'Two saved Skills with metadata + owner.',
    icon: RectIcon,
    meta: '7 lessons · 80 min',
  },
  {
    title: 'Workflows',
    desc: 'Document input, output, review, and retention. The unit examiners actually look at.',
    activity: 'Document a real banking workflow as an SOP with retention + review attached.',
    artifact: 'Workbench Pack workflow SOP (the unit examiners look at).',
    icon: FileIcon,
    meta: '9 lessons · 90 min · Pack lab',
  },
  {
    title: 'Agents',
    desc: "Triggers, controls, and escalation. Where automation is appropriate and where it isn't.",
    activity: 'Decide for three scenarios whether to ship an agent or keep it human-in-the-loop.',
    artifact: 'Agent fit/risk worksheet (kept in your Pack).',
    icon: StarIcon,
    meta: '6 lessons · 70 min',
  },
];

// ---------- Page ----------

export default function CoursesIndexPage() {
  const [active, setActive] = useState(0);
  const m = MODULES[active];
  const ActiveIcon = m.icon;

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/courses" cta={{ label: 'Enroll · $295', href: '/courses/foundation/program/purchase' }} />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<LayersIcon className="mk-ic" />}>
              Foundation Course · $295 · Self-paced
            </EyebrowChip>
            <h1>A practical course for bankers who need to build safely.</h1>
            <p className="mk-lede">
              Short lessons, guided practice, and work products that go straight into your toolkit.
              Built for one banker at a time — no cohorts, no calendars.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                Enroll Now · $295 <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/courses/foundation-preview">
                Preview Module 1 (Free)
              </Button>
            </div>
          </div>

          <div className="mk-cmp">
            <div className="mk-cmp-top">
              <div>
                <div className="mk-cmp-k">Course Preview</div>
                <div className="mk-cmp-t">Prompt → Skill → Workflow</div>
              </div>
              <div className="mk-cmp-price">$295</div>
            </div>
            <div className="mk-cmp-grid">
              <div className="mk-cmp-list">
                <div className="mk-cmp-list-k">Learning Path</div>
                {MODULES.map((mod, i) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.title}
                      type="button"
                      onClick={() => setActive(i)}
                      className={`mk-cmp-mod${active === i ? ' is-active' : ''}`}
                    >
                      <span className="mk-cmp-icon">
                        <Icon size={20} />
                      </span>
                      <div>
                        <div className="mk-cmp-meta">Module {i + 1}</div>
                        <div className="mk-cmp-name">{mod.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mk-cmp-detail">
                <span className="mk-cmp-icon">
                  <ActiveIcon size={24} />
                </span>
                <div className="mk-cmp-k">Selected · {m.meta}</div>
                <h3>{m.title}</h3>
                <p className="mk-cmp-desc">{m.desc}</p>
                <div className="mk-cmp-info">
                  <div className="mk-cmp-k">Practice activity</div>
                  <div className="mk-cmp-v">{m.activity}</div>
                </div>
                <div className="mk-cmp-info mk-line">
                  <div className="mk-cmp-k">Learner leaves with</div>
                  <div className="mk-cmp-v">{m.artifact}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL BUILD */}
      <Section variant="std">
        <SectionHead
          kicker="What you'll build"
          heading={<>A reusable Workbench Pack you can hand to a manager Monday.</>}
        />
        <div className="mk-build">
          <div className="mk-left">
            <div className="mk-k">Artifact preview</div>
            <h3>The Workbench Pack</h3>
            <p>
              Every module ends with a saved artifact. By the end of the course you've built a
              complete Pack — your prompts, your workflow SOPs, your risk checklists, your role
              playbooks. It travels with you, not us.
            </p>
            <ul>
              <li>4 substantive lab exercises (Data, Compliance, Loan, Ops)</li>
              <li>Banker-contextual review tags on every output</li>
              <li>Realistic synthetic scenarios — never real banking material</li>
              <li>Exports as PDF, docx, or copy-to-clipboard prompt blocks</li>
            </ul>
            <span className="mk-stamp">
              <CheckSquareIcon className="mk-ic" />
              Examiner-ready format
            </span>
          </div>
          <div className="mk-pack">
            <div className="mk-top">
              <div className="mk-k">Workbench Pack · v1</div>
              <div className="mk-n">CB · Compliance</div>
            </div>
            {[
              ['Lab 1', 'Data summarization — Branch deposits Q3'],
              ['Lab 2', 'Procedure cleanup — KYC refresh SOP'],
              ['Lab 3', 'Loan review — Decline letter draft'],
              ['Lab 4', 'Ops playbook — Incident response runbook'],
              ['Review', 'Human approval log attached'],
              ['Owner', 'Lisa M. · Compliance Lead'],
            ].map(([k, v]) => (
              <div key={k} className="mk-row">
                <div className="mk-k">{k}</div>
                <div className="mk-v">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* MODULES */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Curriculum"
          heading={<>Five modules. Each one ends with something useful.</>}
          lede={
            <>
              Lessons are short (15–30 min). Every module pairs concept video with a hands-on lab
              and saves work to your Pack.
            </>
          }
        />
        <div className="mk-modules">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <div key={mod.title} className="mk-mod">
                <div className="mk-bar" />
                <div className="mk-body">
                  <div className="mk-top">
                    <span className="mk-pic-ink-gold">
                      <Icon size={24} />
                    </span>
                    <span className="mk-num">0{i + 1}</span>
                  </div>
                  <h3>{mod.title}</h3>
                  <p>{mod.desc}</p>
                  <div className="mk-meta">
                    {mod.meta}
                    {i === 0 && ' · Free preview'}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mk-mod" style={{ background: 'var(--cream)' }}>
            <div className="mk-bar" />
            <div className="mk-body">
              <div className="mk-top">
                <span className="mk-pic-gold-ink">
                  <StackIcon size={24} />
                </span>
                <span className="mk-num" style={{ color: 'var(--ink)' }}>Bonus</span>
              </div>
              <h3>Toolbox unlocked</h3>
              <p>
                Course completion unlocks the full Toolbox: 18 reusable assets, role playbooks, and
                the prompt library — yours to keep.
              </p>
              <div className="mk-meta">Lifetime access · No subscription</div>
            </div>
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section variant="std">
        <div className="mk-pricing">
          <div>
            <div className="mk-k">One-time · No subscription</div>
            <div className="mk-price">
              <div className="mk-v">$295</div>
              <div className="mk-u">/ seat</div>
            </div>
            <p>
              Lifetime access to course, Workbench Pack, and the unlocked Toolbox. Institution
              seats available at volume pricing.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                Enroll Now
              </Button>
              <Button variant="ghost-dark" size="lg" href="/for-institutions">
                Team Pricing <ArrowR className="mk-ic" />
              </Button>
            </div>
          </div>
          <ul>
            <li><CheckIcon className="mk-ic" />5 modules + bonus Toolbox</li>
            <li><CheckIcon className="mk-ic" />4 substantive lab exercises</li>
            <li><CheckIcon className="mk-ic" />Workbench Pack you keep</li>
            <li><CheckIcon className="mk-ic" />Foundation Certificate on completion</li>
            <li><CheckIcon className="mk-ic" />Self-paced · No cohorts</li>
          </ul>
        </div>
      </Section>

      {/* CTA */}
      <CtaBand
        kicker="Foundation Course"
        heading={<>Build the skill. Keep the artifact.</>}
        body={
          <>
            Six hours, five modules, one Workbench Pack you can show your team. Start with the
            free preview — no email gate.
          </>
        }
        actions={[
          { label: 'Enroll · $295', href: '/courses/foundation/program/purchase', variant: 'gold' },
          { label: 'Preview Module 1', href: '/courses/foundation-preview', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
