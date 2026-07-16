import { DIMENSION_LABELS, type Dimension, type MaturityBand } from '@content/assessments/v4/types';
import { DIMENSION_BRIEF } from '@content/assessments/v4/exec-summary';
import { INK, GOLD_DEEP, GOLD } from '@/lib/brand/colors';
import type { DimensionScoreSerializedV4 } from '@/lib/assessment/load-response';
import { SLATE, LINE, pageStyle, sectionPad } from './constants';
import { Label } from './primitives';

function dimTier(score: number): { tier: string; target: string } {
  if (score < 40) return { tier: 'Nascent', target: 'Target 60+' };
  if (score < 60) return { tier: 'Emerging', target: 'Target 75+' };
  if (score < 80) return { tier: 'Developing', target: 'Target 90+' };
  return { tier: 'Established', target: 'Maintain 90+' };
}

export function Section5ScoreAppendix({
  score,
  band,
  dimensionBreakdown,
}: {
  score: number;
  band: MaturityBand;
  dimensionBreakdown: Record<Dimension, DimensionScoreSerializedV4>;
}): JSX.Element {
  return (
    <section id="score" style={pageStyle}>
      <div style={sectionPad}>
        <Label>Score appendix</Label>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 2.6vw, 2.375rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            margin: '6px 0 14px',
            fontWeight: 800,
          }}
        >
          Your eight-dimension scorecard.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58 }}>
          You scored <b>{score} / 100</b> — {band.label}. Use this view when the
          person across the table asks for the score; use the rest of the report
          when you need to act on it.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 12,
            marginTop: 18,
          }}
        >
          {(Object.entries(dimensionBreakdown) as [Dimension, DimensionScoreSerializedV4][]).map(
            ([key, dim]) => {
              const t = dimTier(dim.score);
              return (
                <div
                  key={key}
                  style={{
                    background: 'white',
                    border: `1px solid ${LINE}`,
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: GOLD_DEEP,
                      }}
                    >
                      {DIMENSION_LABELS[key]}
                    </div>
                    <span style={{ fontSize: '0.6563rem', fontWeight: 800, color: SLATE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {t.tier}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                    <span
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: '1.625rem',
                        fontWeight: 800,
                        color: INK,
                      }}
                    >
                      {dim.score}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: SLATE }}>/ 100 · {t.target}</span>
                  </div>
                  <div style={{ height: 6, background: '#EEF1F5', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(0, Math.min(100, dim.score))}%`,
                        background: dim.score < 60 ? GOLD : INK,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <p style={{ margin: '10px 0 0', color: SLATE, fontSize: '0.7813rem', lineHeight: 1.45 }}>
                    <b style={{ color: INK }}>Business impact:</b> {DIMENSION_BRIEF[key].risk}
                  </p>
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
