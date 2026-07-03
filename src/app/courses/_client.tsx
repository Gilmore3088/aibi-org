'use client';

import { SiteHeader, Section, SectionHead, Button } from '@/components/mockup';

type IconProps = { className?: string; size?: number };

export interface CoursesOverviewFacts {
  readonly moduleCount: number;
  readonly artifactCount: number;
  readonly individualPriceLabel: string;
  readonly durationLabel?: string;
  readonly samplePacketSlots: readonly {
    readonly moduleNumber: number;
    readonly label: string;
  }[];
}

const DEFAULT_FACTS: CoursesOverviewFacts = {
  moduleCount: 18,
  artifactCount: 18,
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
    `${facts.moduleCount} modules`,
    `${facts.artifactCount}-piece Foundation Packet`,
    'Prompt Builder, Skill Builder, and workflow-map practice',
    'Review notes and transfer plans in every module',
    'Final packet submission',
    'Ongoing access to purchased materials under current offer',
    'Manager-readable packet evidence',
  ];
}

function buildOutcomeStats(facts: CoursesOverviewFacts) {
  return [
    { value: String(facts.moduleCount), label: 'modules' },
    { value: String(facts.artifactCount), label: 'packet artifacts' },
    { value: '4', label: 'builder modes' },
    { value: '1', label: 'Foundation Packet' },
    { value: 'Review', label: 'notes + reuse rules' },
    { value: 'Access', label: 'purchased materials' },
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
    desc: 'Staff updates, recurring messages, and internal notes with clear action, owner, and review.',
    icon: ChatIcon,
  },
  {
    title: 'Reusable Prompts + Skills',
    desc: 'Templates with safe placeholders, source rules, output formats, and human review notes.',
    icon: WorkflowIcon,
  },
  {
    title: 'Workflow Maps',
    desc: 'AI-supported steps, human handoffs, blocked decisions, tool choices, and source checks.',
    icon: FileIcon,
  },
  {
    title: 'Safety Proof',
    desc: 'Claim reviews, safe-use checklists, role cards, review notes, and final work-product evidence.',
    icon: ClipboardIcon,
  },
];

const LEARNING_FLOW: { step: string; title: string; desc: string; icon: (p: IconProps) => JSX.Element }[] = [
  {
    step: '01',
    title: 'Set role and work target',
    desc: 'Onboarding captures role context; each module starts with one safe work target.',
    icon: ChatIcon,
  },
  {
    step: '02',
    title: 'See the artifact first',
    desc: 'Every module shows what you are building, why it matters, and what you must prove.',
    icon: ClipboardIcon,
  },
  {
    step: '03',
    title: 'Use the builders',
    desc: 'Prompt Builder, Skill Builder, and workflow tools turn sample banking tasks into structured drafts.',
    icon: WorkflowIcon,
  },
  {
    step: '04',
    title: 'Save reusable templates',
    desc: 'Each output is saved with placeholders, a review note, and a first-use plan.',
    icon: FileIcon,
  },
];

const COURSE_EVIDENCE: { title: string; desc: string; icon: (p: IconProps) => JSX.Element }[] = [
  {
    title: 'Reusable prompt card',
    desc: 'Task, source, format, constraints, and reviewer are captured together.',
    icon: CheckCircleIcon,
  },
  {
    title: 'Review note',
    desc: 'The learner marks what was checked and what still needs [VERIFY].',
    icon: FileIcon,
  },
  {
    title: 'Packet artifact',
    desc: 'The finished card is saved for manager review and future reuse.',
    icon: ClipboardIcon,
  },
];

export default function CoursesIndexPage({ facts = DEFAULT_FACTS }: { readonly facts?: CoursesOverviewFacts }) {
  const pricingBullets = buildPricingBullets(facts);
  const outcomeStats = buildOutcomeStats(facts);

  return (
    <div className="mockup-scope mk-learn-page">
      <SiteHeader
        activePath="/courses"
        cta={{ label: `Enroll · ${facts.individualPriceLabel}`, href: '/courses/foundation/program/purchase' }}
      />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <p className="mk-kicker-gold-soft">AiBI Foundation</p>
            <h1>Build reusable AI work products for banking.</h1>
            <p className="mk-lede">
              AiBI Foundation is an {facts.moduleCount}-module course where bankers practice
              safe prompting, reusable skills, workflow mapping, and review discipline. Every
              module produces an artifact you save to your Foundation Packet.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                Enroll · {facts.individualPriceLabel} <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#lesson-preview">
                Preview a lesson
              </Button>
            </div>
            <p className="mk-course-proofline">
              {facts.moduleCount} modules · {facts.durationLabel ?? 'self-paced'} · {facts.artifactCount}-piece Foundation Packet · reviewed work products
            </p>
          </div>

          <HeroOutcomeCard facts={facts} />
        </div>
      </section>

      <Section variant="tight" surface="white" className="mk-course-outcomes-section">
        <div className="mk-course-outcomes" aria-label="AiBI Foundation outcomes">
          {outcomeStats.map((outcome) => (
            <div key={`${outcome.value}-${outcome.label}`} className="mk-course-outcome">
              <strong>{outcome.value}</strong>
              <span>{outcome.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="std" surface="white">
        <SectionHead
          kicker="What you will build"
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

      <Section variant="std">
        <SectionHead
          kicker="How the course works"
          heading={<>Short lessons become saved work products.</>}
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

      <Section variant="std" surface="white" id="lesson-preview" className="mk-course-bottom">
        <div className="mk-course-bottom-head">
          <div>
            <p className="mk-course-bottom-kicker">Course preview</p>
            <h2>One lesson. One saved artifact.</h2>
          </div>
          <p>
            A module starts with one rough banking task, adds safe-use rules, and saves
            a reusable work product to the Foundation Packet.
          </p>
        </div>

        <div className="mk-course-bottom-grid">
          <LessonPreview />

          <aside className="mk-course-trust-panel" aria-label="Course data and packet rules">
            <div className="mk-course-trust-block">
              <p className="mk-k">Safe practice rule</p>
              <h3>Use sample facts. Keep sensitive data out.</h3>
              <ul className="mk-course-trust-list">
                <li>Synthetic or sanitized examples are enough.</li>
                <li>No customer PII, account data, confidential records, or non-public exam material.</li>
                <li>Each saved artifact keeps the source, tool, reviewer, and reuse rule.</li>
              </ul>
            </div>

            <div className="mk-course-trust-block">
              <p className="mk-k">What gets saved</p>
              <h3>The packet is the useful part.</h3>
              <ul className="mk-course-proof-list">
                {COURSE_EVIDENCE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title}>
                      <Icon size={18} />
                      <span>
                        <strong>{item.title}</strong>
                        <em>{item.desc}</em>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mk-course-claim-note">
                AiBI Foundation is not a license, regulator approval, regulator recognition,
                or third-party endorsement.
              </p>
            </div>
          </aside>
        </div>

        <div className="mk-course-enroll-panel">
          <div className="mk-course-enroll-copy">
            <p className="mk-k">Foundation enrollment</p>
            <h2>Start with one course that produces real work.</h2>
            <p>
              Individual access includes all modules, the Foundation Packet, final
              submission, and ongoing access to purchased materials.
            </p>
          </div>

          <div className="mk-course-enroll-price">
            <span>One-time</span>
            <strong>{facts.individualPriceLabel}</strong>
            <em>No subscription</em>
          </div>

          <ul className="mk-course-enroll-list">
            {pricingBullets.slice(0, 6).map((item) => (
              <li key={item}>
                <CheckCircleIcon size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mk-course-enroll-actions">
            <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
              Enroll in Foundation
            </Button>
            <Button variant="ghost-light" size="lg" href="/for-institutions">
              Ask about team enrollment
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function HeroOutcomeCard({ facts }: { readonly facts: CoursesOverviewFacts }) {
  const outcomes = [
    `${facts.artifactCount} saved artifacts`,
    'Prompt Builder practice',
    'Skill Builder practice',
    'Workflow map practice',
    'Foundation Packet',
    'Review and transfer notes',
  ];

  return (
    <div className="mk-course-outcome-card" aria-label="AiBI Foundation course outcomes">
      <p className="mk-k">You leave with</p>
      <ul>
        {outcomes.map((outcome) => (
          <li key={outcome}>
            <CheckCircleIcon size={18} />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>
      <div className="mk-course-outcome-foot">
        <span>{facts.individualPriceLabel}</span>
        <span>{facts.moduleCount} modules</span>
        <span>{facts.artifactCount} artifacts</span>
      </div>
    </div>
  );
}

function LessonPreview() {
  const sampleSteps = [
    {
      step: '01',
      title: 'Start rough',
      desc: '"Rewrite this procedure for frontline branch staff."',
    },
    {
      step: '02',
      title: 'Add guardrails',
      desc: 'Audience, source, format, constraints, reviewer, and [VERIFY] rule.',
    },
    {
      step: '03',
      title: 'Save the card',
      desc: 'A reusable First Prompt Card with data boundary and manager review note.',
    },
  ] as const;

  return (
    <div className="mk-lesson-simple" aria-label="Course lesson preview">
      <div className="mk-lesson-simple-head">
        <p className="mk-k">Module 04 · Build a reusable prompt</p>
        <h3>Turn a loose request into a reusable prompt card.</h3>
      </div>
      <div className="mk-lesson-simple-steps">
        {sampleSteps.map((item) => (
          <div key={item.step} className="mk-lesson-simple-step">
            <span>{item.step}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mk-lesson-simple-save">
        <CheckCircleIcon size={18} />
        <span>Saved to the Foundation Packet for review and reuse.</span>
      </div>
    </div>
  );
}
