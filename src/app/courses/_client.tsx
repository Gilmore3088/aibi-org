'use client';

import { SiteHeader, Button, ArrowGlyph } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { PracticeReps } from './PracticeReps';

// /courses — AiBI Foundation overview, AI-native rebuild. The page shows the
// course working (real practice reps, a real planted-error practice file)
// instead of describing it with icon cards.

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

const ARTIFACTS = [
  { title: 'Communication artifacts', desc: 'Staff updates, recurring messages, and internal notes with clear action, owner, and review.' },
  { title: 'Reusable prompts + skills', desc: 'Templates with safe placeholders, source rules, output formats, and human review notes.' },
  { title: 'Workflow maps', desc: 'AI-supported steps, human handoffs, blocked decisions, tool choices, and source checks.' },
  { title: 'Safety proof', desc: 'Claim reviews, safe-use checklists, role cards, review notes, and final work-product evidence.' },
] as const;

const LEARNING_FLOW = [
  { n: '01', name: 'Set the target', p: 'Onboarding captures role context; each module starts with one safe work target.' },
  { n: '02', name: 'See the artifact', p: 'Every module shows what you are building, why it matters, and what you must prove.' },
  { n: '03', name: 'Use the builders', p: 'Prompt Builder, Skill Builder, and workflow tools turn sample banking tasks into structured drafts.' },
  { n: '04', name: 'Save it', p: 'Each output is saved with placeholders, a review note, and a first-use plan.' },
] as const;

const COURSE_EVIDENCE = [
  { title: 'Reusable prompt card', desc: 'Task, source, format, constraints, and reviewer are captured together.' },
  { title: 'Review note', desc: 'The learner marks what was checked and what still needs [VERIFY].' },
  { title: 'Packet artifact', desc: 'The finished card is saved for manager review and future reuse.' },
] as const;

// Verbatim planted error from public/sandbox-data/foundation-program/module-3/
// ai-output-with-errors.md. Quoted only to be struck: SR 11-7 was superseded by SR 26-2 (April 2026).
const PLANTED_CLAIM =
  'Section 7.3 of SR 11-7 specifically mandates that institutions using AI-based decision models must conduct quarterly bias audits and submit findings to their primary federal regulator within 30 calendar days.';

const LESSON_STEPS = [
  { n: '01', title: 'Start rough', desc: '"Rewrite this procedure for frontline branch staff."' },
  { n: '02', title: 'Add guardrails', desc: 'Audience, source, format, constraints, reviewer, and [VERIFY] rule.' },
  { n: '03', title: 'Save the card', desc: 'A reusable First Prompt Card with data boundary and manager review note.' },
] as const;

export default function CoursesIndexPage({ facts = DEFAULT_FACTS }: { readonly facts?: CoursesOverviewFacts }) {
  const pricingBullets = [
    `${facts.moduleCount} modules`,
    `${facts.artifactCount}-piece Foundation Packet`,
    'Prompt Builder, Skill Builder, and workflow-map practice',
    'Review notes and transfer plans in every module',
    'Final packet submission',
    'Ongoing access to purchased materials under current offer',
  ];

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader
        activePath="/courses"
        cta={{ label: `Enroll · ${facts.individualPriceLabel}`, href: '/courses/foundation/program/purchase' }}
      />

      <AxHero
        cmd={`course foundation --modules ${facts.moduleCount} --data synthetic`}
        title="Build reusable AI work products for banking."
        lede={
          <>
            AiBI Foundation is an {facts.moduleCount}-module course where bankers practice safe prompting,
            reusable skills, workflow mapping, and review discipline. Every module produces an artifact you
            save to your Foundation Packet.
          </>
        }
        actions={
          <>
            <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
              Enroll · {facts.individualPriceLabel} <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/courses/foundation/preview">
              Preview Module 1 free
            </Button>
          </>
        }
        aside={
          <AxWindow title="foundation-packet/" meta={`${facts.artifactCount} artifacts`}>
            <ul className="ax-packet">
              {facts.samplePacketSlots.map((slot) => (
                <li key={slot.moduleNumber}>
                  <span className="ax-k">m{String(slot.moduleNumber).padStart(2, '0')}</span>
                  <span>{slot.label}</span>
                  <span className="ax-gold" aria-label="saved">
                    ✓
                  </span>
                </li>
              ))}
              <li className="ax-packet-more">
                <span className="ax-k">…</span>
                <span className="ax-muted">
                  {facts.artifactCount - facts.samplePacketSlots.length} more, one per module
                </span>
              </li>
            </ul>
          </AxWindow>
        }
      />
      <div className="mk-container">
        <p className="ax-proofline">
          {facts.moduleCount} modules · {facts.durationLabel ?? 'self-paced'} · {facts.artifactCount}-piece Foundation
          Packet · reviewed work products
        </p>
      </div>

      <AxSection
        id="reps"
        kicker="Practice reps"
        title="Practice in a real AI tool. On synthetic data."
        lede="Every module has short reps like these. Pick one to see the starter prompt and the model answer the learner checks their work against."
      >
        <PracticeReps />
      </AxSection>

      {/* The planted-error practice file from Module 3 */}
      <section className="ax-section ax-fabrication" aria-labelledby="fabrication-title">
        <div className="mk-container ax-fabrication-inner">
          <div>
            <p className="ax-k ax-red">Module 3 · practice file</p>
            <h2 id="fabrication-title" className="ax-display">
              AI sounds sure. <span className="ax-red">You check.</span>
            </h2>
            <p className="ax-muted">
              This AI-written summary contains planted errors. Learners find them before anything leaves the
              building.
            </p>
          </div>
          <figure className="ax-paper">
            <figcaption className="ax-k">ai-output-with-errors.md</figcaption>
            <p className="ax-paper-title">Community Bank AI Compliance Summary</p>
            <p className="ax-paper-meta">
              <strong>Prepared by:</strong> AI Research Assistant
            </p>
            <p className="ax-paper-h">Model Risk Management Requirements</p>
            <p>
              Federal regulators have established clear expectations for AI model governance.{' '}
              <s className="hm-strike">{PLANTED_CLAIM}</s>
            </p>
            <p className="ax-paper-flag">
              <strong>Fabricated citation.</strong> SR 11-7 has no Section 7.3 and no such mandate — and SR 11-7
              itself was superseded by SR 26-2 in April 2026.
            </p>
          </figure>
        </div>
      </section>

      <AxSection
        id="build"
        kicker="What you will build"
        title={<>{countWord(facts.artifactCount)} artifacts. One Foundation Packet.</>}
        lede="Every module produces a practical work product the learner can review, save, and reuse. The completed packet is the proof of learning."
      >
        <dl className="ax-defs">
          {ARTIFACTS.map((a) => (
            <div key={a.title}>
              <dt>{a.title}</dt>
              <dd>{a.desc}</dd>
            </div>
          ))}
        </dl>
      </AxSection>

      <AxSection
        id="how"
        kicker="How the course works"
        title="Short lessons become saved work products."
        lede="Understand the concept, try it in the lab, build the artifact, then save it to your packet."
      >
        <ol className="ax-pipeline" style={{ ['--ax-steps' as string]: 4 }}>
          {LEARNING_FLOW.map((s, i) => (
            <li key={s.n} className={i === 0 ? 'is-first' : undefined}>
              <span className="ax-pipeline-node" aria-hidden="true" />
              <span className="ax-k">{s.n}</span>
              <h3>{s.name}</h3>
              <p>{s.p}</p>
            </li>
          ))}
        </ol>
      </AxSection>

      <AxSection id="lesson-preview" kicker="Course preview" title="One lesson. One saved artifact.">
        <div className="ax-lesson">
          <AxWindow title="Module 04 · Build a reusable prompt" meta="lesson">
            <h3 className="ax-lesson-title">Turn a loose request into a reusable prompt card.</h3>
            <ol className="ax-lesson-steps">
              {LESSON_STEPS.map((s) => (
                <li key={s.n}>
                  <span className="ax-k ax-gold">{s.n}</span>
                  <span>
                    <strong>{s.title}</strong>
                    <span className="ax-muted">{s.desc}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="ax-saved">✓ Saved to the Foundation Packet for review and reuse.</p>
          </AxWindow>

          <div className="ax-lesson-rules">
            <div>
              <p className="ax-k">Safe practice rule</p>
              <h3>Use sample facts. Keep sensitive data out.</h3>
              <ul className="ax-checklist">
                <li>Synthetic or sanitized examples are enough.</li>
                <li>No customer PII, account data, confidential records, or non-public exam material.</li>
                <li>Each saved artifact keeps the source, tool, reviewer, and reuse rule.</li>
              </ul>
            </div>
            <div>
              <p className="ax-k">What gets saved</p>
              <h3>The packet is the useful part.</h3>
              <dl className="ax-defs ax-defs-tight">
                {COURSE_EVIDENCE.map((e) => (
                  <div key={e.title}>
                    <dt>{e.title}</dt>
                    <dd>{e.desc}</dd>
                  </div>
                ))}
              </dl>
              <p className="ax-fineprint">
                AiBI Foundation is not a license, regulator approval, regulator recognition, or third-party
                endorsement.
              </p>
            </div>
          </div>
        </div>
      </AxSection>

      <AxSection id="enroll">
        <AxWindow title="foundation-enrollment" meta="one-time · no subscription">
          <div className="ax-enroll">
            <div>
              <h2 className="ax-display">Start with one course that produces real work.</h2>
              <p className="ax-muted">
                Individual access includes all modules, the Foundation Packet, final submission, and ongoing
                access to purchased materials.
              </p>
              <div className="ax-actions">
                <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                  Enroll in Foundation
                </Button>
                <Button variant="ghost-dark" size="lg" href="/for-institutions">
                  Ask about team enrollment
                </Button>
              </div>
            </div>
            <div>
              <p className="ax-enroll-price">{facts.individualPriceLabel}</p>
              <ul className="ax-checklist">
                {pricingBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </AxWindow>
      </AxSection>
    </div>
  );
}
