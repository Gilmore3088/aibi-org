/* eslint-disable react/no-unescaped-entities */
'use client';

import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
  CtaBand,
  StickyMobileCta,
} from '@/components/mockup';
import { AdvisorsStrip } from '@/components/sections/AdvisorsStrip';
import { CoursePreviewDemos } from './_components/CoursePreviewDemos';

// ---------- Icons (inline SVG) ----------

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
const ChatIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const WorkflowIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h3a3 3 0 0 1 3 3v3" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const ClipboardIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="8" y="3" width="8" height="4" rx="1" /><path d="M16 5h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" /><polyline points="9 14 11 16 15 12" /></svg>);
const CheckCircleIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><polyline points="9 12 12 15 16 10" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);

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
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<GradCapIcon className="mk-ic" />}>
              AiBI-Foundation · self-paced
            </EyebrowChip>
            <h1>Learn AI by building reviewed banking workflows.</h1>
            <p className="mk-lede">
              A hands-on course for bankers who need safe practice, reusable artifacts, and a
              completion credential.
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

          <HeroPacketCard />
        </div>
      </section>

      {/* COURSE PREVIEW — concrete animated demos (replaces prior abstract preview 2026-05-28) */}
      <Section variant="std" surface="white">
        <div id="curriculum" />
        <SectionHead
          kicker="5 mileposts of the course"
          heading={<>From rough prompt to reviewed artifact.</>}
          lede={
            <>
              Pick a milepost on the left to see what learners actually do at that step. Each
              demo runs the real banking content the artifact is built from.
            </>
          }
        />
        <CoursePreviewDemos />
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
        hiddenOnMobile
        kicker="Not sure yet?"
        heading={<>See what a finished artifact looks like before you commit.</>}
        body={<>The gallery shows real completion work from the course — the exact kind of reviewed artifact you'd take to your next team meeting.</>}
        actions={[
          { label: 'Browse the artifact gallery', href: '/courses/foundation/gallery', variant: 'gold' },
          { label: 'Enroll · $295', href: '/courses/foundation/program/purchase', variant: 'ghost-dark' },
        ]}
      />

      <StickyMobileCta
        label="Enroll · $295"
        href="/courses/foundation/program/purchase"
        source="courses-sticky"
      />
    </div>
  );
}

// Course hero proof object — mirrors the .mk-hreport pattern used on Home
// and Assessment. Shows the artifact packet a learner walks away with so
// the hero answers "what do I get?", not just "what is this?". Audit
// 2026-05-28 hero-system feedback: Course was the biggest visual mismatch
// because it was text-only while every other primary hero had a right-side
// proof object.
function HeroPacketCard() {
  return (
    <div className="mk-hreport">
      <div className="mk-hreport-left">
        <div className="mk-k">Learner output packet</div>
        <div className="mk-v">4</div>
        <div className="mk-u">reusable artifacts</div>
        <div className="mk-tier">
          <CheckCircleIcon size={16} />
          Reviewed
        </div>
      </div>
      <div className="mk-hreport-right">
        <div className="mk-k">What you keep</div>
        <div className="mk-hresult">
          <div className="mk-hresult-row">
            <div className="mk-rk">01</div>
            <div className="mk-rv">Prompt Strategy Cheat Sheet</div>
          </div>
          <div className="mk-hresult-row">
            <div className="mk-rk">02</div>
            <div className="mk-rv">Saved Skill Template</div>
          </div>
          <div className="mk-hresult-row">
            <div className="mk-rk">03</div>
            <div className="mk-rv">AI Workflow SOP</div>
          </div>
          <div className="mk-hresult-row">
            <div className="mk-rk">04</div>
            <div className="mk-rv">Agent Review Checklist</div>
          </div>
        </div>
      </div>
    </div>
  );
}
