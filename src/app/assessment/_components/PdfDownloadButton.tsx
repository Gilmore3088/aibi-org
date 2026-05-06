'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { SignupModal } from './SignupModal';

type State =
  | { kind: 'warming' }
  | { kind: 'ready' }
  | { kind: 'auth-prompt' }
  | { kind: 'downloading' }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

interface PdfDownloadButtonProps {
  readonly profileId: string;
  readonly email: string;
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

export function PdfDownloadButton({ profileId, email }: PdfDownloadButtonProps) {
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
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible('pdf_download_clicked', { props: { profileId } });
    }
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setState({ kind: 'auth-prompt' });
      return;
    }

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
      if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
        window.plausible('pdf_downloaded', { props: { profileId } });
      }
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
        {/* warming: render nothing — the button quietly appears once the
            PDF is ready, instead of advertising background work the
            visitor did not ask about. */}
        {state.kind === 'ready' && (
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[12px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Download PDF
          </button>
        )}
        {state.kind === 'downloading' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55">
            Downloading&hellip;
          </p>
        )}
        {state.kind === 'done' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">
            Downloaded
          </p>
        )}
        {state.kind === 'error' && (
          <p className="font-mono text-[10px] text-[color:var(--color-error)]">
            Could not prepare PDF: {state.message}
          </p>
        )}
      </div>
      {state.kind === 'auth-prompt' && (
        <SignupModal
          email={email}
          profileId={profileId}
          onClose={() => setState({ kind: 'ready' })}
        />
      )}
    </>
  );
}
