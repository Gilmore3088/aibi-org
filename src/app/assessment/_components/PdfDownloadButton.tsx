'use client';

import { useEffect, useState } from 'react';

type State =
  | { kind: 'warming' }
  | { kind: 'ready' }
  | { kind: 'downloading' }
  | { kind: 'done' }
  | { kind: 'fallback' };

interface PdfDownloadButtonProps {
  readonly profileId: string;
  readonly label?: string;
  readonly compact?: boolean;
  readonly className?: string;
}

async function warmPdf(profileId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch('/api/assessment/pdf/warm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.status === 'ready') return { ok: true };
    if (body.status === 'skipped')
      return { ok: false, message: 'PDF generation suppressed in this environment.' };
    return { ok: false, message: body.error ?? 'warm-failed' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'warm-failed' };
  }
}

export function PdfDownloadButton({
  profileId,
  label = 'Download PDF',
  compact = false,
  className = '',
}: PdfDownloadButtonProps) {
  const [state, setState] = useState<State>({ kind: 'warming' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await warmPdf(profileId);
      if (cancelled) return;
      setState(result.ok ? { kind: 'ready' } : { kind: 'fallback' });
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const handleDownload = async () => {
    // No session check: the profileId rendered into this page is the
    // credential, matching the /results/[id] bearer-token model. The
    // download endpoint validates the profile row server-side.
    setState({ kind: 'downloading' });
    try {
      let res = await fetch(
        `/api/assessment/pdf/download?profileId=${encodeURIComponent(profileId)}`,
      );
      let body = await res.json();
      // Returning visitor past 30-day retention: PDF was cleaned up.
      // Re-warm once and retry the download before giving up.
      if (res.status === 404 && body.error === 'pdf-not-ready') {
        setState({ kind: 'warming' });
        const rewarm = await warmPdf(profileId);
        if (!rewarm.ok) {
          setState({ kind: 'fallback' });
          return;
        }
        setState({ kind: 'downloading' });
        res = await fetch(
          `/api/assessment/pdf/download?profileId=${encodeURIComponent(profileId)}`,
        );
        body = await res.json();
      }
      if (!res.ok || !body.url) {
        setState({ kind: 'fallback' });
        return;
      }

      const a = document.createElement('a');
      a.href = body.url;
      a.download = 'AI-Readiness-Briefing.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setState({ kind: 'done' });
    } catch {
      setState({ kind: 'fallback' });
    }
  };

  const shellClass = compact
    ? `inline-flex items-center ${className}`
    : `mt-12 text-center ${className}`;

  const buttonClass = compact
    ? 'inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--gold)] px-5 py-2.5 text-[0.875rem] font-bold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--gold-2)]'
    : 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[color:var(--gold)] px-6 py-3 font-sans text-[0.875rem] font-semibold uppercase tracking-[1.2px] text-[color:var(--cream)] transition-colors hover:bg-[color:var(--gold-2)]';

  const fallbackClass = compact
    ? 'inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--ink-a15)] bg-white px-5 py-2.5 text-[0.875rem] font-bold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)]'
    : 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[color:var(--ink-a15)] bg-white px-6 py-3 font-sans text-[0.875rem] font-semibold uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)]';

  return (
    <>
      <div className={shellClass} data-print-hide="true">
        {state.kind === 'warming' && (
          <p
            className={
              compact
                ? 'text-[0.875rem] font-semibold text-[color:var(--slate-600)]'
                : 'text-[0.8125rem] uppercase tracking-[0.18em] text-[color:var(--ink)]/55'
            }
          >
            Preparing PDF&hellip;
          </p>
        )}
        {state.kind === 'ready' && (
          <button
            onClick={handleDownload}
            className={buttonClass}
          >
            {label}
          </button>
        )}
        {state.kind === 'downloading' && (
          <p className="text-[0.875rem] font-semibold text-[color:var(--ink)]/55">
            Downloading&hellip;
          </p>
        )}
        {state.kind === 'done' && (
          <p className="text-[0.875rem] font-semibold text-[color:var(--gold-deep)]">
            Downloaded
          </p>
        )}
        {state.kind === 'fallback' && (
          <a
            href={`/assessment/results/print/${encodeURIComponent(profileId)}`}
            className={fallbackClass}
          >
            Open printable report
          </a>
        )}
      </div>
    </>
  );
}
