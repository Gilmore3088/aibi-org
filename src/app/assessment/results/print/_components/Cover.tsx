import type { Tier } from '@content/assessments/v2/scoring';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';
import { PDF_COVER_SUBHEAD } from '@content/assessments/v2/pdf-content';
import { MATURITY_LADDER, TIER_TO_RUNG } from '@content/assessments/v2/personalization';

interface CoverProps {
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly score: number;
  readonly maxScore: number;
  readonly firstName: string | null;
  readonly institutionName: string | null;
  readonly generatedAt: Date;
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
}

interface RankedRow {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

function rankWeakest(
  breakdown: Record<Dimension, DimensionScore>,
): ReadonlyArray<RankedRow> {
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

export function Cover({
  tier,
  tierId,
  score,
  maxScore,
  firstName,
  institutionName,
  generatedAt,
  dimensionBreakdown,
}: CoverProps) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const subjectName = institutionName?.trim() || 'Your institution';
  const rungIndex = TIER_TO_RUNG[tierId];
  const rungLabel = MATURITY_LADDER[rungIndex]?.label ?? tier.label;
  const top3Weakest = rankWeakest(dimensionBreakdown).slice(0, 3);

  return (
    <article className="pdf-page" data-pdf-page="cover">
      <div style={{ marginTop: '1.1in' }}>
        <p className="pdf-eyebrow" style={{ marginBottom: '0.35in' }}>
          The AI Banking Institute
        </p>
        <h1 className="pdf-h1">AI Readiness Briefing</h1>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '17pt',
            lineHeight: 1.3,
            marginTop: '0.35in',
            color: 'var(--color-slate)',
            maxWidth: '6in',
          }}
        >
          {PDF_COVER_SUBHEAD[tierId]}
        </p>
      </div>

      {/* Report card — score, tier seal, rung position, weakest 3 */}
      <div
        style={{
          marginTop: '0.7in',
          border: '0.75pt solid var(--color-ink)',
          background: 'var(--color-parch)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2.5in 1fr',
          }}
        >
          {/* Left — score + tier seal */}
          <div
            style={{
              borderRight: '0.5pt solid var(--color-ink)',
              padding: '0.3in 0.3in 0.3in 0.35in',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.18in',
              alignItems: 'flex-start',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif-sc)',
                fontSize: '8pt',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-slate)',
                margin: 0,
              }}
            >
              Readiness score
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '42pt',
                lineHeight: 1,
                color: 'var(--color-ink)',
                margin: 0,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {score}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14pt',
                  color: 'var(--color-slate)',
                  marginLeft: '0.08in',
                }}
              >
                / {maxScore}
              </span>
            </p>
            <div
              style={{
                marginTop: '0.05in',
                border: '0.5pt solid var(--color-ink)',
                padding: '0.08in 0.18in',
                background: 'var(--color-linen)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8pt',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-slate)',
                  margin: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                Rung {rungIndex + 1} of 6
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13pt',
                  color: 'var(--gold)',
                  margin: '0.04in 0 0 0',
                  lineHeight: 1.1,
                }}
              >
                {rungLabel}
              </p>
            </div>
          </div>

          {/* Right — top 3 weakest dimensions */}
          <div style={{ padding: '0.3in 0.35in' }}>
            <p
              style={{
                fontFamily: 'var(--font-serif-sc)',
                fontSize: '8pt',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-slate)',
                margin: 0,
              }}
            >
              Where you&apos;re most exposed
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0.18in 0 0 0' }}>
              {top3Weakest.map((row, idx) => {
                const pctLabel = Math.round(row.pct * 100);
                const isCritical = row.pct < 0.5;
                return (
                  <li
                    key={row.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '0.3in 1fr auto',
                      gap: '0.15in',
                      alignItems: 'baseline',
                      paddingBottom: '0.1in',
                      paddingTop: idx === 0 ? 0 : '0.1in',
                      borderBottom:
                        idx === top3Weakest.length - 1
                          ? 'none'
                          : '0.25pt solid var(--color-ink)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11pt',
                        color: isCritical ? 'var(--color-error)' : 'var(--gold)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '11pt',
                        color: 'var(--color-ink)',
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9pt',
                        color: 'var(--color-slate)',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {row.score}/{row.maxScore} · {pctLabel}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer ribbon */}
        <div
          style={{
            borderTop: '0.5pt solid var(--color-ink)',
            padding: '0.14in 0.35in',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            background: 'var(--color-linen)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif-sc)',
              fontSize: '9pt',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-slate)',
            }}
          >
            {firstName ? `${firstName.trim()} · ${subjectName}` : subjectName}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9pt',
              color: 'var(--color-slate)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Issued {dateFormatter.format(generatedAt)}
          </span>
        </div>
      </div>

      <div className="pdf-page-footer">
        <span>aibankinginstitute.com</span>
        <span>Confidential — prepared for the named institution</span>
      </div>
    </article>
  );
}
