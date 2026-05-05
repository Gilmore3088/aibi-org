import type { Tier } from '@content/assessments/v2/scoring';
import { PDF_COVER_SUBHEAD } from '@content/assessments/v2/pdf-content';

interface CoverProps {
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly score: number;
  readonly maxScore: number;
  readonly firstName: string | null;
  readonly institutionName: string | null;
  readonly generatedAt: Date;
}

export function Cover({
  tier,
  tierId,
  score,
  maxScore,
  firstName,
  institutionName,
  generatedAt,
}: CoverProps) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const subjectName = institutionName?.trim() || 'Your institution';

  return (
    <article className="pdf-page" data-pdf-page="cover">
      <div style={{ marginTop: '1.5in' }}>
        <p className="pdf-eyebrow" style={{ marginBottom: '0.5in' }}>
          The AI Banking Institute
        </p>
        <h1 className="pdf-h1">AI Readiness Briefing</h1>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '18pt',
            lineHeight: 1.3,
            marginTop: '0.5in',
            color: 'var(--color-slate)',
          }}
        >
          {PDF_COVER_SUBHEAD[tierId]}
        </p>
      </div>

      <div
        style={{
          marginTop: '1.5in',
          borderTop: '1pt solid var(--color-ink)',
          paddingTop: '0.4in',
        }}
      >
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5in 1fr',
            rowGap: '0.2in',
            fontFamily: 'var(--font-sans)',
            fontSize: '11pt',
            margin: 0,
          }}
        >
          <dt
            style={{
              color: 'var(--color-slate)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '9pt',
            }}
          >
            Prepared for
          </dt>
          <dd style={{ margin: 0, color: 'var(--color-ink)' }}>
            {firstName ? `${firstName.trim()} · ${subjectName}` : subjectName}
          </dd>

          <dt
            style={{
              color: 'var(--color-slate)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '9pt',
            }}
          >
            Tier
          </dt>
          <dd style={{ margin: 0, color: tier.colorVar, fontWeight: 600 }}>
            {tier.label}
          </dd>

          <dt
            style={{
              color: 'var(--color-slate)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '9pt',
            }}
          >
            Score
          </dt>
          <dd
            style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {score} / {maxScore}
          </dd>

          <dt
            style={{
              color: 'var(--color-slate)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '9pt',
            }}
          >
            Issued
          </dt>
          <dd style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>
            {dateFormatter.format(generatedAt)}
          </dd>
        </dl>
      </div>

      <div className="pdf-page-footer">
        <span>aibankinginstitute.com</span>
        <span>Confidential — prepared for the named institution</span>
      </div>
    </article>
  );
}
