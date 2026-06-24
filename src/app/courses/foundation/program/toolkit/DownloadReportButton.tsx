'use client';

// DownloadReportButton — triggers a fetch to generate-transformation-report
// and initiates a browser PDF download. Used on the toolkit page (Server Component).

import { useState } from 'react';

interface DownloadReportButtonProps {
  readonly enrollmentId: string;
}

export function DownloadReportButton({ enrollmentId }: DownloadReportButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (downloading) return;
    const url = `/api/courses/generate-transformation-report?enrollmentId=${encodeURIComponent(enrollmentId)}`;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        setError('The report PDF did not generate. Try again, or contact support if it keeps happening.');
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
      setError('The report PDF could not be downloaded. Try again, or contact support if it keeps happening.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <button
        type="button"
        onClick={() => { void handleDownload(); }}
        disabled={downloading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          border: '1px solid var(--ink-a10)',
          background: 'var(--cream)',
          color: 'var(--ink)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          borderRadius: 12,
          cursor: downloading ? 'not-allowed' : 'pointer',
          opacity: downloading ? 0.6 : 1,
          transition: 'background-color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
        }}
        aria-label="Download AiBI-Foundation Transformation Report PDF"
      >
        <svg style={{ width: 12, height: 12 }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        {downloading ? 'GENERATING...' : 'DOWNLOAD REPORT'}
      </button>
      {error ? (
        <p
          role="alert"
          style={{
            maxWidth: 360,
            margin: 0,
            color: 'var(--slate-600)',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {error}{' '}
          <a href="/support/purchase-help" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
            Contact support
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}
