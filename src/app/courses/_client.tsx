'use client';

import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  CtaBand,
  StickyMobileCta,
} from '@/components/mockup';
import { AdvisorsStrip } from '@/components/sections/AdvisorsStrip';
import { CoursePreviewDemos } from './_components/CoursePreviewDemos';

// ---------- Icons (inline SVG) ----------

type IconProps = { className?: string; size?: number };
export interface CoursesOverviewFacts {
  readonly moduleCount: number;
  readonly artifactCount: number;
  readonly totalMinutes: number;
  readonly totalHoursLabel: string;
  readonly individualPriceLabel: string;
  readonly samplePacketSlots: readonly {
    readonly moduleNumber: number;
    readonly label: string;
  }[];
}

const DEFAULT_FACTS: CoursesOverviewFacts = {
  moduleCount: 18,
  artifactCount: 18,
  totalMinutes: 182,
  totalHoursLabel: '3',
  individualPriceLabel: '$295',
  samplePacketSlots: [
    { moduleNumber: 1, label: 'AI Limits Card' },
    { moduleNumber: 4, label: 'First Prompt Card' },
    { moduleNumber: 13, label: 'Skill Template' },
    { moduleNumber: 18, label: 'Foundation Packet Summary' },
  ],
};

function countWord(count: number) {
  if (count === 18) return 'Eighteen';
  return String(count);
}

function buildPricingBullets(facts: CoursesOverviewFacts) {
  return [
    `${facts.moduleCount} bite-sized modules · ${facts.totalMinutes} minutes`,
    'Onboarding, role context, and work-target selection',
    'Prompt Builder, Skill Builder, and workflow-map practice',
    `${facts.artifactCount}-piece Foundation Packet`,
    'Review notes and transfer plans in every module',
    '5+ certificate practice reps',
    'Final packet submission + certificate',
    'Ongoing access to purchased materials under current offer',
  ];
}

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

const ChatIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const WorkflowIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h3a3 3 0 0 1 3 3v3" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const ClipboardIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="8" y="3" width="8" height="4" rx="1" /><path d="M16 5h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" /><polyline points="9 14 11 16 15 12" /></svg>);
const CheckCircleIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><polyline points="9 12 12 15 16 10" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);

const ARTIFACTS: { title: string; desc: string; icon: (p: IconProps) => JSX.Element }[] = [
  {
    title: 'Communication Artifacts',
    desc: 'Rewrite rushed notes, staff updates, and recurring messages with clear action, owner, and review.',
    icon: ChatIcon,
  },
  {
    title: 'Reusable Prompts + Skills',
    desc: 'Use the Prompt Builder and Skill Builder to save templates with placeholders and review rules.',
    icon: WorkflowIcon,
  },
  {
    title: 'Workflow Maps',
    desc: 'Map AI-supported steps, human handoffs, blocked decisions, tool choices, and source checks.',
    icon: FileIcon,
  },
  {
    title: 'Safety Proof',
    desc: 'Keep claim reviews, safe-use checklists, role use-case cards, and final work-product evidence.',
    icon: ClipboardIcon,
  },
];

const LEARNING_FLOW: { step: string; title: string; desc: string; icon: (p: IconProps) => JSX.Element }[] = [
  {
    step: '01',
    title: 'Set role and work target',
    desc: 'Onboarding captures role context; each module asks for one safe work target before the learner opens the lab.',
    icon: ChatIcon,
  },
  {
    step: '02',
    title: 'See the artifact first',
    desc: 'Every module begins with what you are building, why it matters, what you will save, and what you must prove.',
    icon: ClipboardIcon,
  },
  {
    step: '03',
    title: 'Use the builders',
    desc: 'Prompt Builder, Skill Builder, and workflow-map tools turn sample banking tasks into structured drafts.',
    icon: WorkflowIcon,
  },
  {
    step: '04',
    title: 'Save reusable templates',
    desc: 'Each output is saved with placeholders, a review note, and a first-use plan in My Foundation Packet.',
    icon: FileIcon,
  },
];

// ---------- Page ----------

export default function CoursesIndexPage({ facts = DEFAULT_FACTS }: { readonly facts?: CoursesOverviewFacts }) {
  const pricingBullets = buildPricingBullets(facts);

  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/courses"
        cta={{ label: `Enroll · ${facts.individualPriceLabel}`, href: '/courses/foundation/program/purchase' }}
      />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <p className="mk-kicker-gold-soft">Learn</p>
            <h1>Build reusable AI skills.</h1>
            <p className="mk-lede">
              18 short labs. Prompts, skills, workflows, and safety proof save to your packet.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="#curriculum">
                Preview builders <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/courses/foundation/program/purchase">
                Enroll {facts.individualPriceLabel}
              </Button>
            </div>
          </div>

          <HeroPacketCard facts={facts} />
        </div>
      </section>

      <Section variant="std" surface="white">
        <SectionHead
          kicker="How the course works"
          heading={<>Start small. Save real work.</>}
          lede={
            <>
              Understand the concept, try it in the lab, build the artifact, then save it to your packet.
            </>
          }
        />
        <div className="mk-flow4">
          {LEARNING_FLOW.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="mk-flow4-card">
                <div className="mk-flow4-top">
                  <span className="mk-pic-ink-gold">
                    <Icon size={22} />
                  </span>
                  <span className="mk-flow4-step">{item.step}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* COURSE PREVIEW — representative animated demos, not the full curriculum */}
      <Section variant="std" surface="white">
        <div id="curriculum" />
        <SectionHead
          kicker={`${facts.moduleCount}-module curriculum · Builder preview`}
          heading={<>Preview the builders. Save the outputs.</>}
          lede={
            <>
              Prompt Builder and Skill Builder are working course tools. Workflow mapping shows
              human checkpoints for agent-shaped work without implying a technical agent build.
            </>
          }
        />
        <CoursePreviewDemos />
      </Section>

      {/* WHAT LEARNERS BUILD — 4 work modes across the Foundation Packet */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="What learners build"
          heading={<>{countWord(facts.artifactCount)} artifacts. One Foundation Packet.</>}
          lede={
            <>
              Every module produces a practical work product the learner can review, save, and
              reuse. The completed packet is the proof of learning.
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
              <p className="mk-pricing-value">{facts.individualPriceLabel}</p>
              <p>Volume seat pricing is scoped by request before rollout.</p>
            </div>
            <ul className="mk-pricing-bullets">
              {pricingBullets.map((item) => (
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
        body={<>The gallery shows synthetic, anonymized examples in the same structure learners use for saved course artifacts.</>}
        actions={[
          { label: 'Browse the artifact gallery', href: '/courses/foundation/gallery', variant: 'gold' },
          { label: `Enroll · ${facts.individualPriceLabel}`, href: '/courses/foundation/program/purchase', variant: 'ghost-dark' },
        ]}
      />

      <StickyMobileCta
        label={`Enroll · ${facts.individualPriceLabel}`}
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
function HeroPacketCard({ facts }: { readonly facts: CoursesOverviewFacts }) {
  return (
    <div className="mk-hreport mk-course-hreport">
      <div className="mk-hreport-left">
        <div className="mk-k">Foundation Packet</div>
        <div className="mk-v">{facts.artifactCount}</div>
        <div className="mk-u">saved artifacts</div>
        <div className="mk-tier">
          <CheckCircleIcon size={16} />
          {facts.individualPriceLabel} · {facts.totalHoursLabel} hrs
        </div>
      </div>
      <div className="mk-hreport-right">
        <div className="mk-k">Includes</div>
        <div className="mk-hresult">
          {facts.samplePacketSlots.map((slot) => (
            <div key={slot.moduleNumber} className="mk-hresult-row">
              <div className="mk-rk">{String(slot.moduleNumber).padStart(2, '0')}</div>
              <div className="mk-rv">{slot.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
