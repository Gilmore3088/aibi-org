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

export function PdfDownloadButton({ profileId, email }: PdfDownloadButtonProps) {
  const [state, setState] = useState<State>({ kind: 'warming' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/assessment/pdf/warm', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profileId }),
        });
        const body = await res.json();
        if (cancelled) return;
        if (res.ok && body.status === 'ready') {
          setState({ kind: 'ready' });
        } else if (body.status === 'skipped') {
          setState({
            kind: 'error',
            message: 'PDF generation suppressed in this environment.',
          });
        } else {
          setState({ kind: 'error', message: body.error ?? 'warm-failed' });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'warm-failed',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const handleDownload = async () => {
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
      const res = await fetch(
        `/api/assessment/pdf/download?profileId=${encodeURIComponent(profileId)}`,
      );
      const body = await res.json();
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
        {state.kind === 'warming' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55">
            Preparing your brief&hellip;
          </p>
        )}
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
        <SignupModal email={email} onClose={() => setState({ kind: 'ready' })} />
      )}
    </>
  );
}
