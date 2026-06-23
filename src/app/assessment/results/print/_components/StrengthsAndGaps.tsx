import type { DimensionScore } from '@content/assessments/v2/scoring';
import type { PrintPack } from '../_content/print-pack';

interface StrengthsAndGapsProps {
  readonly pack: PrintPack;
  readonly dimensionBreakdown: Record<string, DimensionScore>;
}

interface RankedDim {
  readonly id: string;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

function rankDimensions(
  breakdown: Record<string, DimensionScore>,
  labels: Readonly<Record<string, string>>,
): ReadonlyArray<RankedDim> {
  return Object.entries(breakdown)
    .filter(([, d]) => d.maxScore > 0)
    .map(([id, d]) => ({
      id,
      label: labels[id],
      score: d.score,
      maxScore: d.maxScore,
      pct: d.score / d.maxScore,
    }))
    .sort((a, b) => a.pct - b.pct);
}

function bandColor(pct: number): string {
  if (pct < 0.5) return '#9b2226';
  if (pct < 0.75) return 'var(--gold)';
  return 'var(--ink)';
}

export function StrengthsAndGaps({ pack, dimensionBreakdown }: StrengthsAndGapsProps) {
  const dims = rankDimensions(dimensionBreakdown, pack.DIMENSION_LABELS);

  return (
    <article className="pdf-page" data-pdf-page="strengths-and-gaps">
      <p className="pdf-eyebrow">Strengths and gaps</p>
      <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
        Where you&rsquo;re strong vs exposed.
      </h2>

      <p className="pdf-body" style={{ marginTop: '0.2in', fontSize: '10pt', color: 'var(--slate-600)' }}>
        Ordered weakest to strongest. Red bars indicate critical gaps; terra indicates developing areas; neutral indicates strengths.
      </p>

      <div style={{ marginTop: '0.4in', display: 'flex', flexDirection: 'column', gap: '0.18in' }}>
        {dims.map((dim) => (
          <div key={dim.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.05in' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '12pt' }}>{dim.label}</span>
              <span
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '10pt',
                  color: 'var(--slate-600)',
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
        <span>Page 5</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
