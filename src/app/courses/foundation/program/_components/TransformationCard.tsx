'use client';

// TransformationCard — summary card shown after post-course assessment completion.
// Displays score delta, tier change, skills built, and hours saved/year.
// Includes a share-result CTA (copies summary text to clipboard).
//
// Ported to mockup design system 2026-05-27 (Inter, ink/cream/gold,
// tabular-nums via fontVariantNumeric).

import { useState, useCallback } from 'react';

interface TransformationCardProps {
  readonly preScore: number | null;
  readonly postScore: number;
  readonly preTierLabel: string | null;
  readonly postTierLabel: string;
  readonly postTierColorVar: string;
  readonly skillsBuilt: number;
  readonly annualHoursSaved: number;
  readonly enrollmentId?: string;
}

function DownloadIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const TNUM: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
const KICKER: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

export function TransformationCard({
  preScore,
  postScore,
  preTierLabel,
  postTierLabel,
  postTierColorVar,
  skillsBuilt,
  annualHoursSaved,
  enrollmentId,
}: TransformationCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const url = enrollmentId
        ? `/api/courses/generate-transformation-report?enrollmentId=${encodeURIComponent(enrollmentId)}`
        : '/api/courses/generate-transformation-report';
      const res = await fetch(url);
      if (!res.ok) {
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'AiBI-Foundation-Transformation-Report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // network failure — silently skip
    } finally {
      setDownloading(false);
    }
  }, [enrollmentId, downloading]);

  const scoreImprovement =
    preScore !== null && preScore > 0
      ? `+${Math.round(((postScore - preScore) / preScore) * 100)}%`
      : null;

  const tierChanged = preTierLabel !== null && preTierLabel !== postTierLabel;

  const shareSummary = [
    'AiBI-Foundation — Course Complete',
    '',
    scoreImprovement
      ? `AI Readiness: ${preScore} → ${postScore} (${scoreImprovement})`
      : `AI Readiness Score: ${postScore} / 48`,
    tierChanged ? `Tier: ${preTierLabel} → ${postTierLabel}` : `Tier: ${postTierLabel}`,
    `Skills Built: ${skillsBuilt}`,
    `Estimated Annual Savings: ${annualHoursSaved} hrs/year`,
    '',
    'The AI Banking Institute — aibankinginstitute.com',
  ].join('\n');

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable — silently fail
    }
  }, [shareSummary]);

  const primaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    background: 'var(--ink)',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    borderRadius: 'var(--r-md)',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const secondaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    background: '#FFFFFF',
    color: 'var(--ink)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    borderRadius: 'var(--r-md)',
    border: '1px solid var(--ink-a15)',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        background: 'var(--cream)',
        border: '1px solid var(--ink-a10)',
        borderLeft: `4px solid ${postTierColorVar}`,
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(24px, 4vw, 32px)',
        boxShadow: 'var(--shadow-soft)',
      }}
      aria-label="Transformation summary"
    >
      <p style={{ ...KICKER, color: 'var(--gold-deep)', margin: '0 0 16px' }}>
        AiBI-Foundation Complete
      </p>

      {/* Stat grid */}
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: 24,
          rowGap: 20,
          marginBottom: 28,
        }}
        aria-label="Course outcomes"
      >
        {/* Score */}
        <div>
          <dt style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>Score</dt>
          <dd style={{ ...TNUM, fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            {preScore !== null ? (
              <>
                <span style={{ color: 'var(--slate-500)' }}>{preScore}</span>{' '}
                <span style={{ fontSize: 16, color: 'var(--slate-500)' }}>→</span>{' '}
                <span style={{ color: postTierColorVar }}>{postScore}</span>
              </>
            ) : (
              <span style={{ color: postTierColorVar }}>{postScore}</span>
            )}
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--slate-500)' }}>
              {' '}/ 48
            </span>
          </dd>
          {scoreImprovement && (
            <dd
              style={{
                ...TNUM,
                fontSize: 12,
                fontWeight: 600,
                color: postTierColorVar,
                margin: '2px 0 0',
              }}
            >
              {scoreImprovement}
            </dd>
          )}
        </div>

        {/* Tier */}
        <div>
          <dt style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>Tier</dt>
          <dd
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: postTierColorVar,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {tierChanged && preTierLabel && (
              <span
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 400,
                  letterSpacing: 0,
                  textTransform: 'none',
                  color: 'var(--slate-500)',
                  marginBottom: 2,
                }}
              >
                {preTierLabel} →
              </span>
            )}
            {postTierLabel}
          </dd>
        </div>

        {/* Skills built */}
        <div>
          <dt style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>
            Skills Built
          </dt>
          <dd style={{ ...TNUM, fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            {skillsBuilt}
          </dd>
        </div>

        {/* Hours saved */}
        <div>
          <dt style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>
            Hrs Saved / Year
          </dt>
          <dd style={{ ...TNUM, fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            {annualHoursSaved}
          </dd>
        </div>
      </dl>

      {/* Action row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 20,
          borderTop: '1px solid var(--ink-a10)',
        }}
      >
        <a href="/courses/foundation/program/certificate" style={primaryBtn}>
          View Certificate
          <ArrowIcon />
        </a>

        <button
          type="button"
          onClick={handleCopy}
          style={secondaryBtn}
          aria-live="polite"
          aria-label={copied ? 'Result copied to clipboard' : 'Copy result summary to clipboard'}
        >
          {copied ? (
            <>
              <CheckIcon />
              Copied
            </>
          ) : (
            'Copy Result'
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            void handleDownloadReport();
          }}
          disabled={downloading}
          style={{
            ...secondaryBtn,
            opacity: downloading ? 0.5 : 1,
            cursor: downloading ? 'not-allowed' : 'pointer',
          }}
          aria-label="Download Transformation Report PDF"
        >
          {downloading ? (
            'Generating...'
          ) : (
            <>
              <DownloadIcon />
              Download Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
