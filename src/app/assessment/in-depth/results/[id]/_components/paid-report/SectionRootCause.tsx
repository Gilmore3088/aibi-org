import { type Dimension } from '@content/assessments/v4/types';
import { rootCauseFor } from '@content/assessments/v4/root-causes';
import { GOLD } from '@/lib/brand/colors';
import { SLATE, LINE, pageStyle, sectionPad } from './constants';
import { Label } from './primitives';

// ── Section: Root Cause Analysis ────────────────────────────────────────────
// A score is a symptom. For each priority gap, show the structural reasons
// behind it — what is missing, not just what is low — plus a confidence.
export function SectionRootCause({
  protect,
  use,
}: {
  protect: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  use: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
}): JSX.Element {
  const items = [...protect, ...use];
  return (
    <section id="rootcause" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Root cause analysis</Label>
        <h2
          style={{
            fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
            lineHeight: 1,
            letterSpacing: '-0.045em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          Why these scores exist.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58 }}>
          A score is a symptom. Each priority gap below is broken down into the
          structural reasons behind it — what is missing, not just what is low.
          That is the difference between a report and a diagnosis.
        </p>
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {items.map((d) => {
            const rc = rootCauseFor(d.key, d.score);
            return (
              <div
                key={d.key}
                style={{
                  background: 'white',
                  border: `1px solid ${LINE}`,
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <b style={{ fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
                    {d.label} scored {d.score}/100 because:
                  </b>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: rc.confidence === 'High' ? '#047857' : '#9A7A2F',
                    }}
                  >
                    Confidence: {rc.confidence}
                  </span>
                </div>
                <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 9 }}>
                  {rc.reasons.map((r) => (
                    <li
                      key={r}
                      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: SLATE, fontSize: '0.875rem', lineHeight: 1.5 }}
                    >
                      <span style={{ color: GOLD, fontWeight: 900, flex: 'none' }}>—</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
