// Public Module 1 preview — /courses/foundation/preview
//
// Try-before-buy: renders the REAL Understand content of Module 1 through
// the same LearnSection component the paid course uses, so buyers evaluate
// actual material instead of marketing copy. Deliberately a separate route
// from /courses/foundation/program/[module] — the enrollment gate there is
// untouched. Labs, guided practice, activities, and the Foundation Packet
// stay paid; LearnSection's 'preview' variant drops the in-course anchors.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, SiteHeader } from '@/components/mockup';
import { PillarMap } from '@/components/courses/PillarMap';
import {
  V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER,
  foundationCourseConfig,
  foundationDurationLabel,
  getArtifactFirst,
  getModuleByNumber,
} from '@content/courses/foundation-program';
import {
  getFoundationLabBrief,
  getFoundationWorkedExample,
} from '@content/courses/foundation-program/lab-first';
import { LearnSection } from '../program/_components/LearnSection';
import { KnowledgeCheck } from '../program/_components/KnowledgeCheck';

const PREVIEW_MODULE_NUMBER = 1;

export const metadata: Metadata = {
  alternates: { canonical: '/courses/foundation/preview' },
  title: 'Free Preview — Module 1 | AiBI Foundation',
  description:
    'Walk through Module 1 of the AiBI Foundation course free — the real Understand, Try, Build, and Save phases paid learners see, before you enroll.',
};

const PHASES = [
  { id: 'understand', n: '01', name: 'Understand', line: 'The concept, as the course teaches it.' },
  { id: 'try', n: '02', name: 'Try', line: 'The practice task, and a check you can take now.' },
  { id: 'build', n: '03', name: 'Build', line: 'Weak vs. better — the quality bar.' },
  { id: 'save', n: '04', name: 'Save', line: 'What you keep from this module.' },
] as const;

function PhaseAside({ id }: { readonly id: (typeof PHASES)[number]['id'] }) {
  const p = PHASES.find((x) => x.id === id)!;
  return (
    <header className="pv-aside">
      <span className="pv-num">{p.n}</span>
      <h2>{p.name}</h2>
      <p>{p.line}</p>
    </header>
  );
}

export default function FoundationPreviewPage() {
  const expandedModule = V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER.get(PREVIEW_MODULE_NUMBER);
  const mod = getModuleByNumber(PREVIEW_MODULE_NUMBER);
  const totalModules = foundationCourseConfig.modules.length;
  const labBrief = getFoundationLabBrief(PREVIEW_MODULE_NUMBER);
  const workedExample = getFoundationWorkedExample(PREVIEW_MODULE_NUMBER);
  const artifact = getArtifactFirst(PREVIEW_MODULE_NUMBER);

  return (
    <div
      className="mockup-scope ax-page pv-page"
      style={
        {
          // LearnSection's 12px eyebrow labels assume the course shell's
          // recolored canvas. On this public cream canvas the default
          // --gold-deep/--slate-500 fall below WCAG AA 4.5:1 at that size,
          // so darken both for this route (≥4.5:1 on cream, cream-2, white).
          '--gold-deep': '#7a5f1e',
          '--slate-500': '#475569',
        } as React.CSSProperties
      }
    >
      <SiteHeader
        activePath="/courses"
        cta={{ label: 'Enroll · $295', href: '/courses/foundation/program/purchase' }}
      />

      <section className="ax-hero pv-hero" aria-label="Preview scope">
        <div className="mk-container">
          <p className="ax-cmd">courses/foundation --preview module-01</p>
          <p className="ax-k ax-gold">Free preview · Module 1 of {totalModules} — the full module walkthrough</p>
          <h1 className="ax-display">{mod?.title ?? 'What AI Can and Cannot Do'}</h1>
          {expandedModule?.goal && <p className="ax-lede">{expandedModule.goal}</p>}
          <p className="pv-paid">
            What stays paid: the live AI labs, saving your work to the Foundation Packet, and the
            credential ({foundationDurationLabel()}).
          </p>
          <div className="pv-map">
            <PillarMap current={PREVIEW_MODULE_NUMBER} compact />
          </div>
          <nav className="pv-steps" aria-label="Module phases">
            {PHASES.map((p) => (
              <a key={p.id} href={`#pv-${p.id}`}>
                <span>{p.n}</span>
                {p.name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <main className="pv-main">
        <div className="mk-container pv-container">
          <section id="pv-understand" className="pv-phase" aria-label="Understand phase">
            <PhaseAside id="understand" />
            <div className="pv-body">
              <LearnSection
                sections={expandedModule?.sections ?? []}
                keyTakeaways={expandedModule?.takeaways}
                moduleNumber={PREVIEW_MODULE_NUMBER}
                variant="preview"
              />
            </div>
          </section>

          {labBrief && (
            <section id="pv-try" className="pv-phase" aria-label="Try phase preview" data-testid="preview-try">
              <PhaseAside id="try" />
              <div className="pv-body">
                <div className="pv-task">
                  <p className="pv-k">The task</p>
                  <p className="pv-task-text">{labBrief.labTask}</p>
                  <ol className="pv-flow" aria-label="The model you practice">
                    {labBrief.visualModel.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                {labBrief.decisionDrill && (
                  <KnowledgeCheck
                    prompt={labBrief.decisionDrill.prompt}
                    options={labBrief.decisionDrill.options}
                    kicker="Try it now — same drill as the course"
                  />
                )}
              </div>
            </section>
          )}

          {workedExample && (
            <section id="pv-build" className="pv-phase" aria-label="Build phase preview" data-testid="preview-build">
              <PhaseAside id="build" />
              <div className="pv-body">
                <figure className="hm-sheet pv-sheet">
                  <p className="hm-edit-label">{workedExample.weakLabel}</p>
                  <p className="hm-edit-weak">
                    <s>{workedExample.weak}</s>
                  </p>
                  <p className="hm-edit-label">{workedExample.strongLabel}</p>
                  <p className="hm-edit-strong">{workedExample.strong}</p>
                  <p className="hm-edit-why">{workedExample.why}</p>
                </figure>
              </div>
            </section>
          )}

          {artifact && (
            <section id="pv-save" className="pv-phase" aria-label="Save phase preview" data-testid="preview-save">
              <PhaseAside id="save" />
              <div className="pv-body">
                <figure className="hm-sheet pv-sheet pv-card">
                  <span className="pv-stamp">Saved · Foundation Packet 1/{totalModules}</span>
                  <p className="pv-card-title">{artifact.saved}</p>
                  <p>{artifact.building}</p>
                  <p className="pv-card-use">
                    <strong>Use it:</strong> {artifact.usedFor}
                  </p>
                </figure>
              </div>
            </section>
          )}
        </div>
      </main>

      <section className="ax-section ax-close" aria-label="Enroll in the full course">
        <div className="mk-container">
          <h2 className="ax-display">
            {totalModules - 1} more modules. <span className="ax-gold">One packet.</span>
          </h2>
          <p className="ax-muted">
            Labs, saved artifacts and the credential. {foundationDurationLabel()}.
          </p>
          <div className="ax-actions" style={{ justifyContent: 'center' }}>
            <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
              Enroll in Foundation · $295
            </Button>
            <Button variant="ghost-dark" size="lg" href="/courses">
              Back to course overview
            </Button>
          </div>
        </div>
      </section>

      <div data-testid="preview-sticky-enroll" className="pv-sticky">
        <span>Reading the free Module 1 preview</span>
        <Link href="/courses/foundation/program/purchase">Enroll · $295</Link>
      </div>
    </div>
  );
}
