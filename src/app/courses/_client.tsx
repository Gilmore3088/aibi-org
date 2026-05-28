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
import { AdvisorsStrip } from '@/components/sections/AdvisorsStrip';

// ---------- Icons (inline SVG, no lucide-react dep) ----------

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

const GradCapIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>);
const BookIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>);
const ChatIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const WorkflowIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h3a3 3 0 0 1 3 3v3" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const SparklesIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" /><path d="M5 17l.7 2.3L8 20l-2.3.7L5 23l-.7-2.3L2 20l2.3-.7z" /></svg>);
const ClipboardIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="8" y="3" width="8" height="4" rx="1" /><path d="M16 5h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" /><polyline points="9 14 11 16 15 12" /></svg>);
const ShieldIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const CheckCircleIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><polyline points="9 12 12 15 16 10" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);

// ---------- Modules ----------

type ModuleData = {
  title: string;
  lessons: string;
  time: string;
  desc: string;
  artifact: string;
  icon: (p: IconProps) => JSX.Element;
};

// PREVIEW_MODULES — 5 of the 12 modules wired to interactive demo visuals below.
// Full curriculum: modules 1–12 listed in ALL_MODULES.
const PREVIEW_MODULES: ModuleData[] = [
  {
    title: 'AI for Your Workday',
    lessons: '6 lessons',
    time: '50 min',
    desc: 'Understand where AI fits in daily banking work, what it cannot do, and the five regulatory frameworks every banker should know.',
    artifact: 'Regulatory Cheatsheet',
    icon: BookIcon,
  },
  {
    title: 'Prompting Fundamentals',
    lessons: '8 lessons',
    time: '75 min',
    desc: 'Learn one best-practice prompt structure for banking work: Role, Task, Context, Constraints, Output, and Review.',
    artifact: 'Prompt Strategy Cheat Sheet',
    icon: ChatIcon,
  },
  {
    title: 'Projects and Context',
    lessons: '7 lessons',
    time: '80 min',
    desc: 'Organise multi-step work inside AI Projects: write a Project Brief, pin source context, and reuse outputs across tasks.',
    artifact: 'Project Brief',
    icon: WorkflowIcon,
  },
  {
    title: 'Files and Document Workflows',
    lessons: '9 lessons',
    time: '90 min',
    desc: 'Upload, summarise, and redline documents using AI — with a review step built in before anything leaves your hands.',
    artifact: 'Document Workflow Prompt',
    icon: FileIcon,
  },
  {
    title: 'Agents and Workflow Thinking',
    lessons: '6 lessons',
    time: '70 min',
    desc: 'Map agentic workflows: trigger, input, AI draft, human review checkpoint, approval, and completion log.',
    artifact: 'AI Workflow Map',
    icon: SparklesIcon,
  },
];

// All 12 modules — used for the full curriculum list.
const ALL_MODULES: { title: string; number: number }[] = [
  { number: 1,  title: 'AI for Your Workday' },
  { number: 2,  title: 'What AI Is and Is Not' },
  { number: 3,  title: 'Prompting Fundamentals' },
  { number: 4,  title: 'Your AI Work Profile' },
  { number: 5,  title: 'Projects and Context' },
  { number: 6,  title: 'Files and Document Workflows' },
  { number: 7,  title: 'AI Tools Landscape' },
  { number: 8,  title: 'Agents and Workflow Thinking' },
  { number: 9,  title: 'Safe AI Use in Banking' },
  { number: 10, title: 'Role-Based Use Cases' },
  { number: 11, title: 'Personal Prompt Library' },
  { number: 12, title: 'Final Foundation Lab' },
];

// Keep the name MODULES pointing at the preview set so the interactive panel below compiles unchanged.
const MODULES = PREVIEW_MODULES;

const ARTIFACTS: { title: string; desc: string; icon: (p: IconProps) => JSX.Element }[] = [
  {
    title: 'Prompt Card',
    desc: 'A reusable prompt with role, task, context, constraints, output format, and review standard.',
    icon: ChatIcon,
  },
  {
    title: 'Saved Skill',
    desc: 'A tested prompt promoted into a named, tagged, versioned asset for repeat use.',
    icon: WorkflowIcon,
  },
  {
    title: 'Workflow SOP',
    desc: 'A reviewable workflow packet covering tool, data, output, reviewer, approval, and retention.',
    icon: FileIcon,
  },
  {
    title: 'Review Checklist',
    desc: 'A human approval checklist for accuracy, data handling, escalation, and final use.',
    icon: ClipboardIcon,
  },
];

const PRICING_BULLETS = [
  'Self-paced course',
  'Sandbox practice',
  'Toolbox assets',
  'Four reviewed artifacts',
  'Completion credential',
  'Lifetime access',
];

// ---------- Page ----------

export default function CoursesIndexPage() {
  const [activeModule, setActiveModule] = useState<ModuleData>(MODULES[1]);
  const ActiveIcon = activeModule.icon;

  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/courses"
        cta={{ label: 'Enroll · $295', href: '/courses/foundation/program/purchase' }}
      />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner mk-hero-inner-full">
          <div>
            <EyebrowChip icon={<GradCapIcon className="mk-ic" />}>
              AiBI-Foundation · self-paced
            </EyebrowChip>
            <h1>Learn AI by building reviewed banking workflows.</h1>
            <p className="mk-lede">
              A hands-on course for bankers who need safe practice, reusable work products, and a
              credential — not generic AI theory.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#curriculum">
                View curriculum <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/courses/foundation/program/purchase">
                Enroll · $295
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
        </div>
      </section>

      {/* COURSE PREVIEW — standalone section below the hero */}
      <Section variant="std" surface="white">
        <div id="curriculum" />
        <SectionHead
          kicker="12-module curriculum · 5 previewed below"
          heading={<>Prompt → Skill → Workflow.</>}
          lede={
            <>
              Pick a module on the left to see the learning visual on the right. Each module
              ends with a work product the learner keeps. All 12 modules are listed in the full
              curriculum below.
            </>
          }
        />
        <CoursePreview
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          ActiveIcon={ActiveIcon}
        />

        {/* Full 12-module list */}
        <div className="mk-full-curriculum">
          <p className="mk-k" style={{ marginBottom: '1rem' }}>Full curriculum — all 12 modules</p>
          <ol className="mk-curriculum-list">
            {ALL_MODULES.map((mod) => (
              <li key={mod.number} className="mk-curriculum-row">
                <span className="mk-curriculum-num">{mod.number}</span>
                <span className="mk-curriculum-title">{mod.title}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* WHAT LEARNERS BUILD — 4 cards */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="What learners build"
          heading={<>Four artifacts. One completion packet.</>}
          lede={
            <>
              Every module connects to a practical work product the learner can review, save, and
              reuse.
            </>
          }
        />
        <div className="mk-build4">
          {ARTIFACTS.map((art) => {
            const Icon = art.icon;
            return (
              <div key={art.title} className="mk-build-card">
                <span className="mk-pic-ink-gold">
                  <Icon size={22} />
                </span>
                <h3>{art.title}</h3>
                <p>{art.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* PRICING */}
      <Section variant="std">
        <div className="mk-pricing-wrap">
          <div className="mk-pricing-card">
            <header>
              <p className="mk-k">One-time · No subscription</p>
              <h3>AiBI-Foundation</h3>
            </header>
            <div className="mk-pricing-amount">
              <p className="mk-k">Individual enrollment</p>
              <p className="mk-pricing-value">$295</p>
              <p>Team pricing available at 10+ seats.</p>
            </div>
            <ul className="mk-pricing-bullets">
              {PRICING_BULLETS.map((item) => (
                <li key={item}>
                  <CheckCircleIcon size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mk-pricing-ctas">
              <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                Enroll in AiBI-Foundation
              </Button>
              <Button variant="ghost-light" size="lg" href="/for-institutions">
                Ask about team enrollment
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <AdvisorsStrip />

      {/* FINAL CTA */}
      <CtaBand
        kicker="Not sure yet?"
        heading={<>See what a finished artifact looks like before you commit.</>}
        body={<>The gallery shows real completion work from the course — the exact kind of reviewed artifact you'd take to your next team meeting.</>}
        actions={[
          { label: 'Browse the artifact gallery', href: '/courses/foundation/gallery', variant: 'gold' },
          { label: 'Enroll · $295', href: '/courses/foundation/program/purchase', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}

// ---------- Course preview (hero side) ----------

function CoursePreview({
  activeModule,
  setActiveModule,
  ActiveIcon,
}: {
  activeModule: ModuleData;
  setActiveModule: (m: ModuleData) => void;
  ActiveIcon: (p: IconProps) => JSX.Element;
}) {
  return (
    <div className="mk-cpv">
      <div className="mk-cpv-top">
        <div>
          <p className="mk-k">Course Preview</p>
          <h3>Prompt → Skill → Workflow</h3>
        </div>
        <span className="mk-cpv-tag">See what learners build</span>
      </div>
      <div className="mk-cpv-grid">
        <div className="mk-cpv-list">
          <p className="mk-k">Learning Path</p>
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            const active = activeModule.title === mod.title;
            return (
              <button
                key={mod.title}
                type="button"
                onClick={() => setActiveModule(mod)}
                className={`mk-cpv-mod${active ? ' is-active' : ''}`}
              >
                <span className="mk-cpv-mod-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="mk-cpv-mod-meta">Module {i + 1}</p>
                  <p className="mk-cpv-mod-name">{mod.title}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mk-cpv-detail">
          <span className="mk-pic-ink-gold mk-cpv-detail-icon">
            <ActiveIcon size={22} />
          </span>
          <p className="mk-k">Selected module</p>
          <h3>{activeModule.title}</h3>
          <p className="mk-cpv-detail-desc">{activeModule.desc}</p>
          <ModuleDemo activeModule={activeModule} />
        </div>
      </div>
    </div>
  );
}

// ---------- Module demo visuals (illustration-style, minimal text) ----------

function ModuleDemo({ activeModule }: { activeModule: ModuleData }) {
  if (activeModule.title === 'Prompting Fundamentals') return <PromptVisual artifact={activeModule.artifact} />;
  if (activeModule.title === 'Projects and Context') return <SkillVisual artifact={activeModule.artifact} />;
  if (activeModule.title === 'Files and Document Workflows') return <WorkflowVisual artifact={activeModule.artifact} />;
  if (activeModule.title === 'Agents and Workflow Thinking') return <AgentVisual artifact={activeModule.artifact} />;
  return <LandscapeVisual artifact={activeModule.artifact} />;
}

function PromptVisual({ artifact }: { artifact: string }) {
  return (
    <div className="mk-demo">
      <div className="mk-demo-inner">
        <div className="mk-demo-bar mk-demo-bar-lg" />
        <div className="mk-demo-grid6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mk-demo-pcard"
              style={{ animationDelay: `${i * 0.18}s` }}
            >
              <span className="mk-demo-pcard-edge" />
              <span className="mk-demo-pcard-h1" />
              <span className="mk-demo-pcard-h2" />
              <span className="mk-demo-pcard-h3" />
              <span className="mk-demo-pcard-h3 mk-w-50" />
            </div>
          ))}
        </div>
        <div className="mk-demo-cta">
          <span className="mk-demo-cta-h" />
          <span className="mk-demo-cta-sub" />
        </div>
      </div>
      <LeaveWith artifact={artifact} />
    </div>
  );
}

function SkillVisual({ artifact }: { artifact: string }) {
  return (
    <div className="mk-demo">
      <div className="mk-demo-inner mk-demo-skill">
        <div className="mk-demo-skill-l">
          <ChatIcon size={22} className="mk-demo-skill-icon" />
          <span className="mk-demo-bar" />
          <span className="mk-demo-bar mk-w-80" />
          <span className="mk-demo-bar mk-w-66" />
        </div>
        <div className="mk-demo-arrow">
          <ArrowR size={22} />
        </div>
        <div className="mk-demo-skill-r">
          <WorkflowIcon size={22} className="mk-demo-skill-icon" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="mk-demo-skill-row"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <span className="mk-demo-bar" />
              <span className="mk-demo-dot" />
            </div>
          ))}
        </div>
      </div>
      <LeaveWith artifact={artifact} />
    </div>
  );
}

function WorkflowVisual({ artifact }: { artifact: string }) {
  return (
    <div className="mk-demo">
      <div className="mk-demo-inner">
        <div className="mk-demo-wf">
          <svg className="mk-demo-wf-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M18 25 C32 14, 48 16, 55 26 S73 39, 82 26" className="mk-demo-wf-path" />
            <path d="M82 33 C78 51, 70 62, 63 69" className="mk-demo-wf-path mk-demo-wf-path-2" />
            <path d="M59 75 C47 88, 34 85, 27 71" className="mk-demo-wf-path mk-demo-wf-path-3" />
          </svg>
          {[
            { x: '8%', y: '14%', icon: <span className="mk-demo-dot mk-demo-dot-lg" /> },
            { x: '40%', y: '14%', icon: <FileIcon size={18} /> },
            { x: '70%', y: '14%', icon: <SparklesIcon size={18} /> },
            { x: '22%', y: '60%', icon: <ShieldIcon size={18} /> },
            { x: '58%', y: '60%', icon: <CheckCircleIcon size={18} /> },
          ].map((n, i) => (
            <div
              key={i}
              className="mk-demo-wf-node"
              style={{ left: n.x, top: n.y, animationDelay: `${i * 0.22}s` }}
            >
              <span className="mk-demo-wf-node-icon">{n.icon}</span>
              <span className="mk-demo-bar mk-w-80" />
              <span className="mk-demo-bar mk-w-50" />
            </div>
          ))}
          <div className="mk-demo-wf-foot">
            <span className="mk-demo-wf-foot-icon">
              <CheckCircleIcon size={18} />
            </span>
            <span className="mk-demo-wf-foot-bar" />
            <span className="mk-demo-wf-foot-pill" />
          </div>
        </div>
      </div>
      <LeaveWith artifact={artifact} />
    </div>
  );
}

function AgentVisual({ artifact }: { artifact: string }) {
  return (
    <div className="mk-demo">
      <div className="mk-demo-inner mk-demo-agent">
        <div className="mk-demo-agent-l">
          <div className="mk-demo-agent-stage">
            <div className="mk-demo-agent-bot">
              <SparklesIcon size={22} />
            </div>
            <span className="mk-demo-bar mk-w-66 mk-demo-agent-bar" />
            <span className="mk-demo-bar mk-w-50 mk-demo-agent-bar" />
            <div className="mk-demo-agent-grid">
              <div className="mk-demo-agent-tile" />
              <div className="mk-demo-agent-tile" />
              <div className="mk-demo-agent-tile" />
            </div>
            <div className="mk-demo-agent-track">
              <div className="mk-demo-agent-fill" />
            </div>
          </div>
        </div>
        <div className="mk-demo-agent-r">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="mk-demo-agent-task"
              style={{ animationDelay: `${i * 0.25}s` }}
            >
              <span className="mk-demo-agent-task-icon">
                {i === 3 ? <ShieldIcon size={14} /> : i === 4 ? <CheckCircleIcon size={14} /> : <span className="mk-demo-dot" />}
              </span>
              <div>
                <span className="mk-demo-bar mk-w-80" />
                <span className="mk-demo-bar mk-w-50" />
              </div>
              <span className={`mk-demo-agent-pill mk-demo-agent-pill-${i === 3 ? 'review' : i === 4 ? 'done' : 'go'}`} />
            </div>
          ))}
        </div>
      </div>
      <LeaveWith artifact={artifact} />
    </div>
  );
}

function LandscapeVisual({ artifact }: { artifact: string }) {
  const icons = [BookIcon, ShieldIcon, WorkflowIcon];
  return (
    <div className="mk-demo">
      <div className="mk-demo-inner mk-demo-land">
        {icons.map((Icon, i) => (
          <div
            key={i}
            className="mk-demo-land-card"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <Icon size={22} className="mk-demo-land-icon" />
            <span className="mk-demo-bar mk-w-80" />
            <span className="mk-demo-bar mk-w-50" />
          </div>
        ))}
      </div>
      <LeaveWith artifact={artifact} />
    </div>
  );
}

function LeaveWith({ artifact }: { artifact: string }) {
  return (
    <div className="mk-demo-leave">
      <p className="mk-k">Learner leaves with</p>
      <p>{artifact}</p>
    </div>
  );
}
