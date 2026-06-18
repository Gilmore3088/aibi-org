// Artifact-first contract card — rendered at the top of every module so the
// learner always sees the same four-line promise: what they're building, the
// real banking task it serves, what lands in their Foundation Packet, and the
// human-judgment bar they must clear. Driven by ARTIFACT_FIRST_BY_MODULE so the
// framing is identical across all 12 modules. Server component (presentational).

import type { ArtifactFirstMeta } from '@content/courses/foundation-program';

const MOCKUP_FONT =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const ROWS: ReadonlyArray<{ readonly label: string; readonly field: keyof ArtifactFirstMeta }> = [
  { label: 'You are building', field: 'building' },
  { label: 'You will use it for', field: 'usedFor' },
  { label: 'You will save', field: 'saved' },
  { label: 'You must prove', field: 'mustProve' },
];

export function ModuleArtifactHeader({ meta }: { meta: ArtifactFirstMeta }) {
  return (
    <section
      aria-label="What you are building in this module"
      style={{
        maxWidth: 1320,
        margin: '0 auto',
        padding: '0 36px',
      }}
    >
      <div
        style={{
          background: 'var(--cream-2)',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          borderLeft: '4px solid var(--gold)',
          padding: 'clamp(20px, 2.6vw, 28px)',
          marginTop: 20,
          display: 'grid',
          gap: 14,
        }}
      >
        {ROWS.map(({ label, field }) => (
          <div
            key={label}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(120px, 168px) 1fr',
              gap: 16,
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: MOCKUP_FONT,
                fontSize: 16,
                lineHeight: 1.6,
                fontWeight: field === 'building' ? 600 : 400,
                color: field === 'building' ? 'var(--ink)' : 'var(--slate-600)',
              }}
            >
              {meta[field] as string}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
