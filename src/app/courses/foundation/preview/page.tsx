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
  getModuleByNumber,
} from '@content/courses/foundation-program';
import { LearnSection } from '../program/_components/LearnSection';

const PREVIEW_MODULE_NUMBER = 1;
const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export const metadata: Metadata = {
  alternates: { canonical: '/courses/foundation/preview' },
  title: 'Free Preview — Module 1 | AiBI Foundation',
  description:
    'Read the full Understand section of Module 1 of the AiBI Foundation course free — the same material paid learners see, before you enroll.',
};

export default function FoundationPreviewPage() {
  const expandedModule = V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER.get(PREVIEW_MODULE_NUMBER);
  const mod = getModuleByNumber(PREVIEW_MODULE_NUMBER);
  const totalModules = foundationCourseConfig.modules.length;

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
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              Free preview · Module 1 of {totalModules} — Understand section
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 14,
                lineHeight: 1.55,
                color: 'var(--slate-600)',
              }}
            >
              This is the same Understand material paid learners see, not a summary.
              The guided labs, practice sandbox, saved artifacts, and the Foundation
              Packet are part of the paid course ({foundationDurationLabel()}).
            </p>
          </section>

          <header style={{ marginBottom: 24 }}>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 12,
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
                fontSize: 'clamp(30px, 4vw, 44px)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                fontWeight: 800,
              }}
            >
              {mod?.title ?? 'What AI Can and Cannot Do'}
            </h1>
          </header>

          <LearnSection
            sections={expandedModule?.sections ?? []}
            keyTakeaways={expandedModule?.takeaways}
            moduleNumber={PREVIEW_MODULE_NUMBER}
            variant="preview"
          />

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
                fontSize: 'clamp(22px, 2.6vw, 30px)',
                lineHeight: 1.12,
                letterSpacing: '-0.01em',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              The other {totalModules - 1} modules add the labs, saved artifacts,
              and the credential.
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'rgba(247,243,234,0.8)' }}>
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
        <span style={{ color: 'rgba(247,243,234,0.85)', fontSize: 14, fontWeight: 600 }}>
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
            fontSize: 13,
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
