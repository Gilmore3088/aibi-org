'use client';

import { useEffect, useState } from 'react';

type State =
  | { kind: 'warming' }
  | { kind: 'ready' }
  | { kind: 'downloading' }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

interface PdfDownloadButtonProps {
  readonly profileId: string;
}

async function warmPdf(profileId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch('/api/assessment/pdf/warm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    const body = await res.json();
    if (res.ok && body.status === 'ready') return { ok: true };
    if (body.status === 'skipped')
      return { ok: false, message: 'PDF generation suppressed in this environment.' };
    return { ok: false, message: body.error ?? 'warm-failed' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'warm-failed' };
  }
}

export function PdfDownloadButton({ profileId }: PdfDownloadButtonProps) {
  const [state, setState] = useState<State>({ kind: 'warming' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await warmPdf(profileId);
      if (cancelled) return;
      setState(result.ok ? { kind: 'ready' } : { kind: 'error', message: result.message });
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
          setState({ kind: 'error', message: rewarm.message });
          return;
        }
        setState({ kind: 'downloading' });
        res = await fetch(
          `/api/assessment/pdf/download?profileId=${encodeURIComponent(profileId)}`,
        );
        body = await res.json();
      }
      if (!res.ok || !body.url) {
        setState({ kind: 'error', message: body.error ?? 'download-failed' });
        return;
      }

      const a = document.createElement('a');
      a.href = body.url;
      a.download = 'AI-Readiness-Briefing.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setState({ kind: 'done' });
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'download-failed',
      });
    }
  };

  return (
    <>
      <div className="mt-12 text-center" data-print-hide="true">
        {state.kind === 'warming' && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink)]/55">
            Preparing your brief&hellip;
          </p>
        )}
        {state.kind === 'ready' && (
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-[color:var(--gold)] text-[color:var(--cream)] font-sans text-[12px] font-semibold uppercase tracking-[1.2px] rounded-xl hover:bg-[color:var(--gold-2)] transition-colors"
          >
            Download PDF
          </button>
        )}
        {state.kind === 'downloading' && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink)]/55">
            Downloading&hellip;
          </p>
        )}
        {state.kind === 'done' && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
            Downloaded
          </p>
        )}
        {state.kind === 'error' && (
          <p className="text-[10px] text-[color:#9b2226]">
            Could not prepare PDF: {state.message}
          </p>
        )}
      </div>
    </>
  );
}
