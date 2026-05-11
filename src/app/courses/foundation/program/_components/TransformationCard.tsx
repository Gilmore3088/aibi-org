'use client';

// TransformationCard — summary card shown after post-course assessment completion.
// Displays score delta, tier change, skills built, and hours saved/year.
// Includes a share-result CTA (copies summary text to clipboard).
// CSS variables only. DM Mono for all numbers. Institutional, not gamified.

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
        // Silently fail — don't block the results page with an error modal
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
      // Network error — silently fail
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
      // Clipboard API unavailable — silently fail.
    }
  }, [shareSummary]);

  return (
    <div
      className="border-l-4 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-sm p-6 sm:p-8"
      style={{ borderLeftColor: postTierColorVar }}
      aria-label="Transformation summary"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-4">
        AiBI-Foundation Complete
      </p>

      {/* Stat grid */}
      <dl
        className="grid grid-cols-2 gap-x-6 gap-y-5 mb-8"
        aria-label="Course outcomes"
      >
        {/* Score */}
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
            Score
          </dt>
          <dd className="font-mono text-2xl tabular-nums" style={{ color: 'var(--color-ink)' }}>
            {preScore !== null ? (
              <>
                <span className="text-[color:var(--color-slate)]">{preScore}</span>
                {' '}<span className="text-base text-[color:var(--color-slate)]">→</span>{' '}
                <span style={{ color: postTierColorVar }}>{postScore}</span>
              </>
            ) : (
              <span style={{ color: postTierColorVar }}>{postScore}</span>
            )}
            <span className="text-sm font-normal text-[color:var(--color-slate)]"> / 48</span>
          </dd>
          {scoreImprovement && (
            <dd
              className="font-mono text-xs tabular-nums mt-0.5"
              style={{ color: postTierColorVar }}
            >
              {scoreImprovement}
            </dd>
          )}
        </div>

        {/* Tier */}
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
            Tier
          </dt>
          <dd
            className="font-mono text-sm uppercase tracking-wide font-semibold leading-snug"
            style={{ color: postTierColorVar }}
          >
            {tierChanged && preTierLabel && (
              <span className="text-[color:var(--color-slate)] text-xs block normal-case tracking-normal font-normal mb-0.5">
                {preTierLabel} →
              </span>
            )}
            {postTierLabel}
          </dd>
        </div>

        {/* Skills built */}
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
            Skills Built
          </dt>
          <dd className="font-mono text-2xl tabular-nums text-[color:var(--color-ink)]">
            {skillsBuilt}
          </dd>
        </div>

        {/* Hours saved */}
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
            Hrs Saved / Year
          </dt>
          <dd className="font-mono text-2xl tabular-nums text-[color:var(--color-ink)]">
            {annualHoursSaved}
          </dd>
        </div>
      </dl>

      {/* Action row */}
      <div className="flex flex-wrap gap-3 pt-5 border-t border-[color:var(--color-ink)]/10">
        <a
          href="/courses/foundation/program/certificate"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
        >
          View Certificate
          <ArrowIcon />
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[color:var(--color-terra)]/30 hover:border-[color:var(--color-terra)] text-[color:var(--color-ink)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2 bg-transparent"
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
          onClick={() => { void handleDownloadReport(); }}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[color:var(--color-terra)]/30 hover:border-[color:var(--color-terra)] text-[color:var(--color-ink)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
