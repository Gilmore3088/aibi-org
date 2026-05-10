'use client';

// DownloadReportButton — triggers a fetch to generate-transformation-report
// and initiates a browser PDF download. Used on the toolkit page (Server Component).

interface DownloadReportButtonProps {
  readonly enrollmentId: string;
}

export function DownloadReportButton({ enrollmentId }: DownloadReportButtonProps) {
  async function handleDownload() {
    const url = `/api/courses/generate-transformation-report?enrollmentId=${encodeURIComponent(enrollmentId)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'AiBI Foundations-Transformation-Report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Network error — silently fail; user can retry
    }
  }

  return (
    <button
      type="button"
      onClick={() => { void handleDownload(); }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] text-[10px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
      aria-label="Download AiBI Foundations Transformation Report PDF"
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      Download Report
    </button>
  );
}
