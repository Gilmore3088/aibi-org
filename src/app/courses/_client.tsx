/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import Link from 'next/link';
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
const PlayIcon = (p: IconProps) => (<svg {...sw(p)}><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" /></svg>);
const FlaskIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M10 2v7.31" /><path d="M14 9.3V2" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /></svg>);

// ---------- What you build (4 artifacts) ----------

const WHAT_YOU_BUILD: { title: string; body: string; icon: typeof CheckSquareIcon }[] = [
  { title: 'Prompt Card', body: 'A reviewed, reusable prompt with role, task, constraints, and a review checklist baked in.', icon: ChatIcon },
  { title: 'Saved Skill', body: 'A named, tagged skill with run history — promote a working prompt into a team asset.', icon: RectIcon },
  { title: 'Workflow SOP', body: 'Input, output, retention, and review documented as an examiner-readable workflow.', icon: FileIcon },
  { title: 'Review Checklist', body: 'A human-approval log attached to every AI-assisted artifact you produce.', icon: CheckIcon },
];

// ---------- Inside one lesson (the loop) ----------

const LESSON_STEPS: { step: string; title: string; body: string; icon: typeof CheckSquareIcon }[] = [
  { step: 'watch', title: 'Watch', body: '5–8 minute concept video. Why the technique works, where it fails.', icon: PlayIcon },
  { step: 'practice', title: 'Practice', body: 'Run a sandbox scenario with realistic synthetic banking data.', icon: FlaskIcon },
  { step: 'build', title: 'Build', body: 'Save the working output as a reusable asset to your Toolbox.', icon: RectIcon },
  { step: 'review', title: 'Review', body: 'Run the human-approval checklist before the artifact goes into real work.', icon: CheckIcon },
];

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
              AiBI-Foundation · $295 · Self-paced
            </EyebrowChip>
            <h1>Learn AI by building reviewed banking workflows.</h1>
            <p className="mk-lede">
              A self-paced course for bankers who need practical AI skills, safe practice, and reusable
              work products — not generic AI theory.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#curriculum">
                View curriculum <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#what-you-build">
                See what learners build
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

      {/* SMALL ASSESSMENT REDIRECT STRIP */}
      <div className="mk-strip">
        <div className="mk-container">
          <span>Not sure where to start? Take the free readiness check first.</span>
          <Link href="/assessment" className="mk-strip-link">
            Free Readiness Assessment <ArrowR className="mk-ic" />
          </Link>
        </div>
      </div>

      {/* WHAT YOU BUILD — 4 artifact cards */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="What you build"
          heading={<>Four artifacts you keep and reuse.</>}
        />
        <div id="what-you-build" className="mk-build4">
          {WHAT_YOU_BUILD.map(({ title, body, icon: Icon }) => (
            <div key={title} className="mk-build-card">
              <span className="mk-pic-ink-gold">
                <Icon size={22} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* INSIDE ONE LESSON */}
      <Section variant="std">
        <SectionHead
          kicker="Inside one lesson"
          heading={<>Watch → Practice → Build → Review.</>}
          lede={
            <>
              Every module follows the same loop. Short concept video, hands-on lab, saved artifact,
              human review checklist.
            </>
          }
        />
        <div className="mk-lesson">
          <div className="mk-lesson-steps">
            {LESSON_STEPS.map(({ step, title, body, icon: Icon }, i) => (
              <div key={step} className="mk-lesson-step">
                <span className="mk-pic">
                  <Icon size={20} />
                </span>
                <div className="mk-lesson-meta">Step {i + 1}</div>
                <div className="mk-lesson-name">{title}</div>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <div className="mk-lesson-card">
            <div className="mk-top">
              <div className="mk-k">Lesson preview · Module 2</div>
              <div className="mk-n">Prompt Foundations</div>
            </div>
            <div className="mk-lesson-row">
              <div className="mk-k">Prompt structure</div>
              <div className="mk-v">Role · Task · Context · Constraints · Output · Review</div>
            </div>
            <div className="mk-lesson-row">
              <div className="mk-k">Practice activity</div>
              <div className="mk-v">Rewrite a weak prompt until it passes the review checklist</div>
            </div>
            <div className="mk-lesson-row">
              <div className="mk-k">Saved to Toolbox</div>
              <div className="mk-v">Reviewed Prompt Card</div>
            </div>
          </div>
        </div>
      </Section>

      {/* MODULES */}
      <Section variant="std" surface="white">
        <div id="curriculum" />
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
              <h3>Full Toolbox access</h3>
              <p>
                Course completion opens the full Toolbox: 18 reusable assets, role playbooks, and
                the prompt library — yours to keep.
              </p>
              <div className="mk-meta">Lifetime access · No subscription</div>
            </div>
          </div>
        </div>
      </Section>

      {/* CREDENTIAL */}
      <Section variant="std">
        <SectionHead
          kicker="Credential"
          heading={<>Earn AiBI-Foundation by submitting reviewed work.</>}
          lede={
            <>
              Completion is not a multiple-choice quiz. You earn the credential by working through
              every module and submitting your reviewed artifacts.
            </>
          }
        />
        <div className="mk-credential">
          {[
            { k: 'Complete lessons', v: 'Watch and finish every module in the curriculum.' },
            { k: 'Pass review activity', v: 'Each lab requires a human-approval checklist on the output.' },
            { k: 'Submit artifacts', v: 'Three reviewed AI artifacts saved to your Toolbox.' },
            { k: 'Credential', v: 'AiBI-Foundation · The AI Banking Institute on completion.' },
          ].map(({ k, v }) => (
            <div key={k} className="mk-credential-row">
              <span className="mk-pic-ink-gold">
                <CheckSquareIcon size={18} />
              </span>
              <div>
                <div className="mk-k">{k}</div>
                <div className="mk-v">{v}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PRICING */}
      <Section variant="std" surface="white">
        <div className="mk-pricing">
          <div>
            <div className="mk-k">One-time · No subscription</div>
            <div className="mk-price">
              <div className="mk-v">$295</div>
              <div className="mk-u">individual</div>
            </div>
            <p>
              Includes course, sandbox practice, Toolbox assets, reviewed artifacts, and the
              AiBI-Foundation credential. Team pricing available at 10+ seats.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                Enroll in AiBI-Foundation
              </Button>
              <Button variant="ghost-dark" size="lg" href="/for-institutions">
                Ask about team enrollment <ArrowR className="mk-ic" />
              </Button>
            </div>
          </div>
          <ul>
            <li><CheckIcon className="mk-ic" />Self-paced · Lifetime access</li>
            <li><CheckIcon className="mk-ic" />Sandbox practice + Toolbox assets</li>
            <li><CheckIcon className="mk-ic" />Three reviewed artifacts you keep</li>
            <li><CheckIcon className="mk-ic" />AiBI-Foundation credential on completion</li>
          </ul>
        </div>
      </Section>

      {/* FINAL CTA */}
      <CtaBand
        heading={<>Ready to build your first reviewed AI workflow?</>}
        body={<>Three reviewed artifacts. One credential. No subscription.</>}
        actions={[
          { label: 'Enroll in AiBI-Foundation', href: '/courses/foundation/program/purchase', variant: 'gold' },
          { label: 'Ask about team enrollment', href: '/for-institutions', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
