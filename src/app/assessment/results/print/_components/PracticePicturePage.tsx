import type { Tier } from '@content/assessments/v2/scoring';
import { PRACTICE_PICTURE, SIGNATURE_INSIGHT } from '@content/assessments/v2/personalization';

interface PracticePicturePageProps {
  readonly tierId: Tier['id'];
}

/**
 * "What this looks like in practice" PDF page. Sits between
 * ExecSummary and LensedImplications. Four-row grid keyed by internal
 * role — operations, compliance/risk, managers, executives — so a
 * banker scanning the page meets their own role first.
 */
export function PracticePicturePage({ tierId }: PracticePicturePageProps) {
  const rows = PRACTICE_PICTURE[tierId];

  return (
    <article className="pdf-page" data-pdf-page="practice-picture">
      <p className="pdf-eyebrow">What this looks like in practice</p>

      <figure
        style={{
          marginTop: '0.25in',
          borderTop: '0.5pt solid var(--color-ink)',
          borderBottom: '0.5pt solid var(--color-ink)',
          padding: '0.22in 0',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
                        fontSize: '13.5pt',
            lineHeight: 1.45,
            color: 'var(--color-ink)',
            margin: 0,
            maxWidth: '6in',
          }}
        >
          {SIGNATURE_INSIGHT}
        </p>
      </figure>

      <h2 className="pdf-h2" style={{ marginTop: '0.3in' }}>
        How this shows up inside the bank.
      </h2>
      <p
        className="pdf-body"
        style={{ marginTop: '0.18in', fontSize: '10.5pt', maxWidth: '6in' }}
      >
        Most institutions at your stage share a few patterns by role.
        Find your role first — the rest of the report is keyed to the
        operating reality of that work.
      </p>

      <div
        style={{
          marginTop: '0.35in',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {rows.map((row, idx) => (
          <div
            key={row.role}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6in 1fr',
              gap: '0.3in',
              borderTop: '0.5pt solid var(--color-ink)',
              borderBottom:
                idx === rows.length - 1 ? '0.5pt solid var(--color-ink)' : 'none',
              paddingTop: '0.18in',
              paddingBottom: '0.18in',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif-sc)',
                fontSize: '9.5pt',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-terra)',
                margin: 0,
                paddingTop: '0.04in',
              }}
            >
              {row.role}
            </p>
            <p
              className="pdf-body"
              style={{ margin: 0, fontSize: '10.5pt', maxWidth: '4.7in' }}
            >
              {row.body}
            </p>
          </div>
        ))}
      </div>

      <div className="pdf-page-footer">
        <span>Page 3</span>
        <span>AI Readiness Briefing</span>
      </div>
    </article>
  );
}
