import type { Tier } from '@content/assessments/v2/scoring';
import { MATURITY_LADDER, TIER_TO_RUNG } from '@content/assessments/v2/personalization';

interface MaturityLadderPageProps {
  readonly tierId: Tier['id'];
}

/**
 * Six-rung maturity ladder PDF page with a "you are here" pin on the
 * reader's current rung. Lives after the two GapDetail pages (page 8)
 * so the reader has just seen what's weakest and now sees where the
 * arc leads.
 */
export function MaturityLadderPage({ tierId }: MaturityLadderPageProps) {
  const currentRung = TIER_TO_RUNG[tierId];

  return (
    <article className="pdf-page" data-pdf-page="maturity-ladder">
      <p className="pdf-eyebrow">Maturity ladder</p>
      <h2 className="pdf-h2" style={{ marginTop: '0.2in' }}>
        Where you are. Where this leads.
      </h2>
      <p
        className="pdf-body"
        style={{ marginTop: '0.2in', fontSize: '10.5pt', maxWidth: '6in' }}
      >
        Six stages describe the arc from individual experimentation to
        institutional advantage. Your current rung is pinned below; the
        rungs above it are the trajectory.
      </p>

      <ol
        style={{
          marginTop: '0.4in',
          paddingLeft: '0.5in',
          borderLeft: '0.75pt solid var(--ink)',
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.22in',
        }}
      >
        {MATURITY_LADDER.map((rung, idx) => {
          const isCurrent = idx === currentRung;
          const isBelow = idx < currentRung;
          return (
            <li key={rung.label} style={{ position: 'relative' }}>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '-0.78in',
                  top: '0.02in',
                  width: '0.4in',
                  height: '0.4in',
                  borderRadius: '50%',
                  fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                  fontSize: '10pt',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCurrent
                    ? 'var(--gold)'
                    : isBelow
                      ? 'var(--ink)'
                      : 'var(--cream)',
                  color: isCurrent || isBelow ? 'var(--cream)' : 'var(--ink)',
                  border: isCurrent
                    ? '2pt solid var(--gold)'
                    : isBelow
                      ? '0.5pt solid var(--ink)'
                      : '0.5pt solid var(--ink)',
                }}
              >
                {idx + 1}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.18in', flexWrap: 'wrap' }}>
                <h3
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: '13pt',
                    margin: 0,
                    color: isCurrent ? 'var(--gold)' : 'var(--ink)',
                  }}
                >
                  {rung.label}
                </h3>
                {isCurrent ? (
                  <span
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: '8pt',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                    }}
                  >
                    You are here
                  </span>
                ) : null}
              </div>
              <p
                className="pdf-body"
                style={{
                  marginTop: '0.06in',
                  fontSize: '10pt',
                  maxWidth: '5.6in',
                  color: isBelow ? 'var(--slate-600)' : 'var(--ink)',
                }}
              >
                {rung.description}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="pdf-page-footer">
        <span>Page 8</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
