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
const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export const metadata: Metadata = {
  alternates: { canonical: '/courses/foundation/preview' },
  title: 'Free Preview — Module 1 | AiBI Foundation',
  description:
    'Walk through Module 1 of the AiBI Foundation course free — the real Understand, Try, Build, and Save phases paid learners see, before you enroll.',
};

const PHASE_EYEBROW: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

function PhaseHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header style={{ margin: '40px 0 16px' }}>
      <p style={PHASE_EYEBROW}>{eyebrow}</p>
      <h2
        style={{
          margin: 0,
          fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
          lineHeight: 1.12,
          letterSpacing: '-0.01em',
          fontWeight: 800,
        }}
      >
        {title}
      </h2>
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
      className="mockup-scope"
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
      <main style={{ background: 'var(--cream)', fontFamily: INTER_STACK, color: 'var(--ink)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 20px 120px' }}>
          <section
            aria-label="Preview scope"
            style={{
              border: '1px solid var(--gold-a40, rgba(197,160,40,0.4))',
              background: 'var(--cream-2)',
              borderRadius: 18,
              padding: '18px 22px',
              marginBottom: 28,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              Free preview · Module 1 of {totalModules} — the full module walkthrough
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: '0.875rem',
                lineHeight: 1.55,
                color: 'var(--slate-600)',
              }}
            >
              This is the real module — the same Understand, Try, Build, and Save
              phases paid learners work through, not a summary. What stays paid:
              the live AI labs, saving your work to the Foundation Packet, and the
              credential ({foundationDurationLabel()}).
            </p>
          </section>

          <header style={{ marginBottom: 24 }}>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              Module 01 · {expandedModule?.goal ?? 'Understand'}
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                fontWeight: 800,
              }}
            >
              {mod?.title ?? 'What AI Can and Cannot Do'}
            </h1>
          </header>

          <PhaseHeading eyebrow="Phase 1 · Understand" title="The concept, exactly as the course teaches it." />
          <LearnSection
            sections={expandedModule?.sections ?? []}
            keyTakeaways={expandedModule?.takeaways}
            moduleNumber={PREVIEW_MODULE_NUMBER}
            variant="preview"
          />

          {labBrief && (
            <section aria-label="Try phase preview" data-testid="preview-try">
              <PhaseHeading eyebrow="Phase 2 · Try" title="The practice task, and a real check you can take now." />
              <div
                style={{
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 18,
                  background: '#fff',
                  padding: '20px 22px',
                  marginBottom: 14,
                }}
              >
                <p style={{ ...PHASE_EYEBROW, marginBottom: 8 }}>The task</p>
                <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.5, fontWeight: 700 }}>
                  {labBrief.labTask}
                </p>
                <p style={{ ...PHASE_EYEBROW, margin: '16px 0 8px' }}>The model you practice</p>
                <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--slate-600)' }}>
                  {labBrief.visualModel.join(' → ')}
                </p>
              </div>
              {labBrief.decisionDrill && (
                <KnowledgeCheck
                  prompt={labBrief.decisionDrill.prompt}
                  options={labBrief.decisionDrill.options}
                  kicker="Try it now — same drill as the course"
                />
              )}
            </section>
          )}

          {workedExample && (
            <section aria-label="Build phase preview" data-testid="preview-build">
              <PhaseHeading eyebrow="Phase 3 · Build" title="Weak vs. better — the quality bar you build against." />
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                }}
              >
                <div style={{ border: '1px solid var(--ink-a10)', borderRadius: 18, background: '#fff', padding: '18px 20px' }}>
                  <p style={{ ...PHASE_EYEBROW, color: 'var(--slate-500)' }}>{workedExample.weakLabel}</p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--slate-600)' }}>
                    {workedExample.weak}
                  </p>
                </div>
                <div style={{ border: '1px solid var(--gold-a40, rgba(197,160,40,0.4))', borderRadius: 18, background: 'var(--cream-2)', padding: '18px 20px' }}>
                  <p style={{ ...PHASE_EYEBROW }}>{workedExample.strongLabel}</p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.55, fontWeight: 650 }}>
                    {workedExample.strong}
                  </p>
                </div>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--slate-600)' }}>
                <strong style={{ color: 'var(--ink)' }}>Why the better version works:</strong>{' '}
                {workedExample.why}
              </p>
            </section>
          )}

          {artifact && (
            <section aria-label="Save phase preview" data-testid="preview-save">
              <PhaseHeading eyebrow="Phase 4 · Save" title="What you keep from this module." />
              <div
                style={{
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 18,
                  background: '#fff',
                  padding: '20px 22px',
                }}
              >
                <p style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800 }}>{artifact.saved}</p>
                <p style={{ margin: '8px 0 0', fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--slate-600)' }}>
                  {artifact.building}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--slate-600)' }}>
                  <strong style={{ color: 'var(--ink)' }}>Where it earns its keep:</strong>{' '}
                  {artifact.usedFor} In the paid course this saves into your 18-piece
                  Foundation Packet with review evidence attached.
                </p>
              </div>
            </section>
          )}

          <section
            aria-label="Enroll in the full course"
            style={{
              marginTop: 36,
              border: '1px solid var(--ink-a10)',
              borderRadius: 18,
              background: 'var(--ink)',
              color: 'var(--cream)',
              padding: '28px 26px',
              display: 'grid',
              gap: 14,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.375rem, 2.6vw, 1.875rem)',
                lineHeight: 1.12,
                letterSpacing: '-0.01em',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              The other {totalModules - 1} modules add the labs, saved artifacts,
              and the credential.
            </h2>
            <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.55, color: 'rgba(247,243,234,0.8)' }}>
              Every module ends with a reviewed work product saved to your Foundation
              Packet. {foundationDurationLabel()}.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                Enroll in Foundation · $295
              </Button>
              <Button variant="ghost-light" size="lg" href="/courses">
                Back to course overview
              </Button>
            </div>
          </section>
        </div>
      </main>

      <div
        data-testid="preview-sticky-enroll"
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 30,
          background: 'rgba(7, 26, 47, 0.97)',
          borderTop: '1px solid var(--gold-a40, rgba(197,160,40,0.4))',
          padding: '12px 20px',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          fontFamily: INTER_STACK,
        }}
      >
        <span style={{ color: 'rgba(247,243,234,0.85)', fontSize: '0.875rem', fontWeight: 600 }}>
          Reading the free Module 1 preview
        </span>
        <Link
          href="/courses/foundation/program/purchase"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 42,
            padding: '0 18px',
            borderRadius: 999,
            background: 'var(--gold)',
            color: 'var(--ink)',
            fontSize: '0.8125rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Enroll · $295
        </Link>
      </div>
    </div>
  );
}
