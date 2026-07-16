import { type Dimension } from '@content/assessments/v4/types';
import { ACTION_FOR } from '@content/assessments/v4/action-plan';
import { INK, GOLD_DEEP } from '@/lib/brand/colors';
import { SLATE, LINE, pageStyle, sectionPad } from './constants';
import { Label } from './primitives';

// ── Section: Action Plan ────────────────────────────────────────────────────
// Root cause says what is wrong; this says what to do — one concrete, owned
// move per priority gap, sized by effort, impact, and timeline.
function ActionChip({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, border: `1px solid ${LINE}`, borderRadius: 10, padding: '6px 12px' }}>
      <span style={{ fontSize: '0.5938rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7A2F' }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: INK }}>{value}</span>
    </span>
  );
}

export function SectionActionPlan({
  protect,
  use,
}: {
  protect: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  use: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
}): JSX.Element {
  const items = [...protect, ...use];
  return (
    <section id="actionplan" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Action plan</Label>
        <h2
          style={{
            fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
            lineHeight: 1,
            letterSpacing: '-0.045em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          What to do, and who owns it.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58, maxWidth: 680 }}>
          Each priority gap becomes one concrete move — sized by effort, impact, and
          timeline, with an owner. Not advice; assignments.
        </p>
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {items.map((d, i) => {
            const a = ACTION_FOR[d.key];
            return (
              <div key={d.key} style={{ background: 'white', border: `1px solid ${LINE}`, borderRadius: 18, padding: 18 }}>
                <div style={{ fontSize: '0.6563rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD_DEEP }}>
                  Move {i + 1} · {d.label}
                </div>
                <b style={{ display: 'block', fontSize: '1.125rem', letterSpacing: '-0.01em', margin: '6px 0 0' }}>{a.what}</b>
                <p style={{ margin: '8px 0 0', color: SLATE, fontSize: '0.875rem', lineHeight: 1.5 }}>
                  <b style={{ color: INK }}>Why:</b> {a.why}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  <ActionChip label="Owner" value={a.owner} />
                  <ActionChip label="Effort" value={a.effort} />
                  <ActionChip label="Impact" value={a.impact} />
                  <ActionChip label="Timeline" value={a.timeline} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
