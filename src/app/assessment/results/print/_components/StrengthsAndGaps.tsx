import type { DimensionScore } from '@content/assessments/v2/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';

interface StrengthsAndGapsProps {
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
}

interface RankedDim {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

function rankDimensions(
  breakdown: Record<Dimension, DimensionScore>,
): ReadonlyArray<RankedDim> {
  return (Object.entries(breakdown) as [Dimension, DimensionScore][])
    .filter(([, d]) => d.maxScore > 0)
    .map(([id, d]) => ({
      id,
      label: DIMENSION_LABELS[id],
      score: d.score,
      maxScore: d.maxScore,
      pct: d.score / d.maxScore,
    }))
    .sort((a, b) => a.pct - b.pct);
}

function bandColor(pct: number): string {
  if (pct < 0.5) return 'var(--color-error)';
  if (pct < 0.75) return 'var(--color-terra)';
  return 'var(--color-ink)';
}

export function StrengthsAndGaps({ dimensionBreakdown }: StrengthsAndGapsProps) {
  const dims = rankDimensions(dimensionBreakdown);

  return (
    <article className="pdf-page" data-pdf-page="strengths-and-gaps">
      <p className="pdf-eyebrow">Strengths and gaps</p>
      <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
        Where you&rsquo;re strong vs exposed.
      </h2>

      <p className="pdf-body" style={{ marginTop: '0.2in', fontSize: '10pt', color: 'var(--color-slate)' }}>
        Ordered weakest to strongest. Red bars indicate critical gaps; terra indicates developing areas; neutral indicates strengths.
      </p>

      <div style={{ marginTop: '0.4in', display: 'flex', flexDirection: 'column', gap: '0.18in' }}>
        {dims.map((dim) => (
          <div key={dim.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.05in' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '12pt' }}>{dim.label}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '10pt',
                  color: 'var(--color-slate)',
                }}
              >
                {dim.score} / {dim.maxScore}
              </span>
            </div>
            <div
              style={{
                height: '0.12in',
                background: 'rgba(0,0,0,0.08)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.round(dim.pct * 100)}%`,
                  background: bandColor(dim.pct),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pdf-page-footer">
        <span>Page 4</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
