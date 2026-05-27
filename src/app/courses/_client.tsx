/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState } from 'react';
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
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const PlayIcon = (p: IconProps) => (<svg {...sw(p)}><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" /></svg>);
const FlaskIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M10 2v7.31" /><path d="M14 9.3V2" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /></svg>);

// ---------- Artifact reel (auto-cycling) ----------

type Artifact = {
  title: string;
  kicker: string;
  icon: (p: IconProps) => JSX.Element;
  inputLabel: string;
  input: string;
  outputLabel: string;
  output: string;
  meta: string;
};

const ARTIFACTS: Artifact[] = [
  {
    title: 'Prompt Card',
    kicker: 'Output of Module 2 · Prompt Foundations',
    icon: ChatIcon,
    inputLabel: 'You write',
    input: 'A weak prompt: "Help me with this procedure."',
    outputLabel: 'You leave with',
    output: 'A reviewed prompt with role, task, constraints, and review checklist — ready to reuse.',
    meta: 'Saved to your Toolbox',
  },
  {
    title: 'Saved Skill',
    kicker: 'Output of Module 3 · Skills',
    icon: RectIcon,
    inputLabel: 'You promote',
    input: 'A working prompt you ran three times with the same banker context.',
    outputLabel: 'You leave with',
    output: 'A named, tagged Skill with run history — promote a prompt into a team asset.',
    meta: 'Owner attached · Versioned',
  },
  {
    title: 'Workflow SOP',
    kicker: 'Output of Module 4 · Workflows',
    icon: FileIcon,
    inputLabel: 'You document',
    input: 'A real banking workflow that uses AI somewhere in the chain.',
    outputLabel: 'You leave with',
    output: 'Input, output, retention, and review documented — the unit examiners actually read.',
    meta: 'Examiner-readable format',
  },
  {
    title: 'Review Checklist',
    kicker: 'Output of every module',
    icon: CheckIcon,
    inputLabel: 'You attach',
    input: 'A named reviewer to each AI-assisted artifact before it goes into real work.',
    outputLabel: 'You leave with',
    output: 'A human-approval log on every output — what got reviewed, by whom, when.',
    meta: 'Audit-trail ready',
  },
];

// ---------- Inside one lesson (auto-cycling loop) ----------

type LessonStep = { step: string; title: string; body: string; icon: (p: IconProps) => JSX.Element };
const LESSON_STEPS: LessonStep[] = [
  { step: 'watch', title: 'Watch', body: '5–8 minute concept video. Why the technique works, where it fails.', icon: PlayIcon },
  { step: 'practice', title: 'Practice', body: 'Run a sandbox scenario with realistic synthetic banking data.', icon: FlaskIcon },
  { step: 'build', title: 'Build', body: 'Save the working output as a reusable asset to your Toolbox.', icon: RectIcon },
  { step: 'review', title: 'Review', body: 'Run the human-approval checklist before the artifact goes into real work.', icon: CheckIcon },
];

const ARTIFACT_MS = 5000;
const LESSON_STEP_MS = 1500;

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

  // Artifact reel — auto-cycle every 5s through ARTIFACTS, hover pauses
  const [artIdx, setArtIdx] = useState(0);
  const [artPaused, setArtPaused] = useState(false);
  useEffect(() => {
    if (artPaused) return;
    const t = setTimeout(() => setArtIdx((i) => (i + 1) % ARTIFACTS.length), ARTIFACT_MS);
    return () => clearTimeout(t);
  }, [artIdx, artPaused]);
  const art = ARTIFACTS[artIdx];
  const ArtIcon = art.icon;

  // Lesson loop — each of Watch/Practice/Build/Review lights up for 1.5s
  const [lessonIdx, setLessonIdx] = useState(0);
  const [lessonPaused, setLessonPaused] = useState(false);
  useEffect(() => {
    if (lessonPaused) return;
    const t = setTimeout(() => setLessonIdx((i) => (i + 1) % LESSON_STEPS.length), LESSON_STEP_MS);
    return () => clearTimeout(t);
  }, [lessonIdx, lessonPaused]);

  // Curriculum module expand — click a module to reveal its artifact inline
  const [openMod, setOpenMod] = useState<number | null>(null);

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
            <p className="mk-hero-foot">
              Not sure where to start?{' '}
              <a href="/assessment" className="mk-hero-foot-link">
                Take the free readiness check first
              </a>
              .
            </p>
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

      {/* ARTIFACT REEL — auto-cycling */}
      <Section variant="std" surface="white">
        <div id="what-you-build" />
        <SectionHead
          kicker="What you build"
          heading={<>Four artifacts. One Toolbox.</>}
        />
        <div
          className="mk-reel"
          onMouseEnter={() => setArtPaused(true)}
          onMouseLeave={() => setArtPaused(false)}
        >
          <div className="mk-reel-dots">
            {ARTIFACTS.map((a, i) => (
              <button
                key={a.title}
                type="button"
                onClick={() => setArtIdx(i)}
                className={`mk-reel-dot${i === artIdx ? ' is-active' : ''}`}
                aria-label={`Show ${a.title}`}
              />
            ))}
          </div>

          <div key={artIdx} className="mk-reel-card is-animated">
            <div className="mk-reel-head">
              <span className="mk-pic-ink-gold">
                <ArtIcon size={22} />
              </span>
              <div>
                <div className="mk-k">{art.kicker}</div>
                <h3>{art.title}</h3>
              </div>
            </div>
            <div className="mk-reel-flow">
              <div className="mk-reel-step">
                <div className="mk-k">{art.inputLabel}</div>
                <div className="mk-reel-text">{art.input}</div>
              </div>
              <div className="mk-reel-arrow" aria-hidden="true">→</div>
              <div className="mk-reel-step mk-reel-step-out">
                <div className="mk-k">{art.outputLabel}</div>
                <div className="mk-reel-text">{art.output}</div>
                <div className="mk-reel-meta">
                  <CheckIcon size={14} /> {art.meta}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* LESSON LOOP — auto-cycling */}
      <Section variant="std">
        <SectionHead
          kicker="Inside one lesson"
          heading={<>Watch → Practice → Build → Review.</>}
        />
        <div
          className="mk-loop"
          onMouseEnter={() => setLessonPaused(true)}
          onMouseLeave={() => setLessonPaused(false)}
        >
          <div className="mk-loop-track">
            <div
              className="mk-loop-fill"
              style={{ width: `${((lessonIdx + 1) / LESSON_STEPS.length) * 100}%` }}
            />
          </div>
          <div className="mk-loop-steps">
            {LESSON_STEPS.map(({ step, title, body, icon: Icon }, i) => {
              const state = i === lessonIdx ? 'is-active' : i < lessonIdx ? 'is-done' : '';
              return (
                <div key={step} className={`mk-loop-step ${state}`}>
                  <span className="mk-pic">
                    <Icon size={20} />
                  </span>
                  <div className="mk-loop-name">{title}</div>
                  <p>{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* CURRICULUM — tight, click to expand */}
      <Section variant="std" surface="white">
        <div id="curriculum" />
        <SectionHead
          kicker="Curriculum"
          heading={<>Five modules. Tap to see what you build.</>}
        />
        <div className="mk-curr">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            const isOpen = openMod === i;
            return (
              <button
                key={mod.title}
                type="button"
                className={`mk-curr-row${isOpen ? ' is-open' : ''}`}
                onClick={() => setOpenMod(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="mk-curr-num">0{i + 1}</span>
                <span className="mk-pic-ink-gold mk-curr-icon">
                  <Icon size={20} />
                </span>
                <div className="mk-curr-main">
                  <div className="mk-curr-title">{mod.title}</div>
                  <div className="mk-curr-meta">
                    {mod.meta}
                    {i === 0 && ' · Free preview'}
                  </div>
                </div>
                <span className="mk-curr-chev" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                {isOpen && (
                  <div className="mk-curr-detail">
                    <div className="mk-k">You leave with</div>
                    <div className="mk-curr-art">{mod.artifact}</div>
                  </div>
                )}
              </button>
            );
          })}
          <div className="mk-curr-bonus">
            <span className="mk-pic-gold-ink mk-curr-icon">
              <StackIcon size={20} />
            </span>
            <div className="mk-curr-main">
              <div className="mk-curr-title">Bonus · Full Toolbox access</div>
              <div className="mk-curr-meta">Lifetime · 18 reusable assets, role playbooks, prompt library</div>
            </div>
          </div>
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
