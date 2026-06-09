// Foundation Packet tracker — the learner's portfolio of the twelve work
// products the course produces. Each module's artifact (Module.keyOutput) is a
// packet slot; completion state is derived from the enrollment's
// completed_modules. This is the "1/12 … 12/12" portfolio view: the course's
// value made visible.
//
// State is keyed off module completion because a module's artifact is saved at
// the same Submit step that marks the module complete — so "module complete"
// and "artifact saved" are the same event. No per-artifact table is invented.

import Link from 'next/link';
import { modules } from '@content/courses/foundation-program';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

type SlotState = 'saved' | 'current' | 'upcoming';

interface YourWorkStripProps {
  readonly completedModules: readonly number[];
  readonly currentModule?: number;
}

function stateOf(
  moduleNumber: number,
  completed: readonly number[],
  current: number | undefined,
): SlotState {
  if (completed.includes(moduleNumber)) return 'saved';
  if (current != null && moduleNumber === current) return 'current';
  return 'upcoming';
}

const STATE_LABEL: Record<SlotState, string> = {
  saved: 'Saved',
  current: 'In progress',
  upcoming: 'Upcoming',
};

function pillStyle(state: SlotState): React.CSSProperties {
  if (state === 'saved') return { background: 'rgba(4,120,87,0.10)', color: 'var(--emerald-700)' };
  if (state === 'current') return { background: 'var(--gold-a20)', color: 'var(--gold-deep)' };
  return { background: 'var(--slate-100)', color: 'var(--slate-500)' };
}

export function YourWorkStrip({ completedModules, currentModule }: YourWorkStripProps) {
  const total = modules.length;
  const savedCount = modules.filter((m) => completedModules.includes(m.number)).length;

  return (
    <section style={{ marginBottom: 40, fontFamily: FONT_INTER }} aria-labelledby="packet-heading">
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            marginBottom: 8,
          }}
        >
          Your Foundation Packet
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <h2
            id="packet-heading"
            style={{
              margin: 0,
              fontSize: 'clamp(22px, 2.4vw, 28px)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}
          >
            Twelve modules. Twelve work products.
          </h2>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate-600)' }}>
            {savedCount} of {total} saved
          </span>
        </div>
        {/* Aggregate progress bar */}
        <div
          role="progressbar"
          aria-valuenow={savedCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Foundation Packet artifacts saved"
          style={{
            marginTop: 12,
            height: 8,
            background: 'var(--slate-200)',
            borderRadius: 999,
            overflow: 'hidden',
            maxWidth: 420,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.round((savedCount / total) * 100)}%`,
              background: 'var(--gold)',
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 10,
        }}
      >
        {modules.map((m) => {
          const state = stateOf(m.number, completedModules, currentModule);
          const clickable = state !== 'upcoming';
          const inner = (
            <>
              <span
                style={{
                  fontFamily: FONT_INTER,
                  fontSize: 12,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--slate-500)',
                  flex: 'none',
                  width: 44,
                }}
              >
                {m.number} / {total}
              </span>
              <span
                style={{
                  fontFamily: FONT_INTER,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  lineHeight: 1.35,
                  flex: 1,
                }}
              >
                {m.keyOutput}
              </span>
              <span
                style={{
                  flex: 'none',
                  padding: '3px 9px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  ...pillStyle(state),
                }}
              >
                {STATE_LABEL[state]}
              </span>
            </>
          );

          const rowStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: '#FFFFFF',
            border: '1px solid var(--slate-200)',
            borderLeft: `3px solid ${
              state === 'saved'
                ? 'var(--emerald-700)'
                : state === 'current'
                  ? 'var(--gold)'
                  : 'var(--slate-200)'
            }`,
            borderRadius: 12,
            boxShadow: 'var(--shadow-soft)',
            textDecoration: 'none',
            opacity: state === 'upcoming' ? 0.72 : 1,
          };

          return (
            <li key={m.number}>
              {clickable ? (
                <Link href={`/courses/foundation/program/${m.number}`} style={rowStyle}>
                  {inner}
                </Link>
              ) : (
                <div style={rowStyle}>{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
