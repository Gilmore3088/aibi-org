'use client';

// DownloadGate — inline email gate for /research library artifact downloads.
//
// Replaces direct <a download> links with a two-step flow:
//   1. "Get the PDF" button — matches existing mk-resource-card CTA style.
//   2. Inline email input + Submit — no modal, keeps the card grid intact.
//   3. On success: POST /api/capture-email, then trigger download via
//      window.location.href. Shows a brief confirmation message.
//   4. On error: inline error text, input stays open for retry.
//
// Note: the actual PDF/Markdown files at downloadHref do not need to exist
// for this component to compile. When the files land under /downloads/ or
// /artifacts/, this component works without any changes.

import { useEffect, useState, useId } from 'react';

// Session-scoped capture flag. Once a visitor submits their email on any
// /research download card, all subsequent cards in the same browser
// session skip the email form and go straight to the download. Audit
// 2026-05-28: per-card gates created friction stacks ("the same form 3
// times" on a 3-artifact tap path). Cleared when the tab closes.
const SESSION_KEY = 'aibi.research.email-captured';

interface DownloadGateProps {
  /** The artifact title shown in confirmation copy. */
  title: string;
  /** Absolute path or URL of the file to download (e.g. "/downloads/foo.pdf"). */
  downloadHref: string;
  /** Short slug derived from the filename — sent to the API as requested_artifact. */
  slug: string;
  /** Optional meta line (e.g. "PDF · Staff card") shown below the title. */
  meta?: string;
}

type GatePhase = 'idle' | 'form' | 'submitting' | 'done' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DownloadGate({ title, downloadHref, slug, meta }: DownloadGateProps) {
  const [phase, setPhase] = useState<GatePhase>('idle');
  const [captured, setCaptured] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputId = useId();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === '1') setCaptured(true);
    } catch {
      // sessionStorage can throw in private mode — fail open to the gated path.
    }
  }, []);

  function handleGetClick() {
    if (captured) {
      // Already captured this session — go straight to download.
      window.location.href = downloadHref;
      setPhase('done');
      return;
    }
    setPhase('form');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!EMAIL_RE.test(trimmed)) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    setPhase('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          lead_source: 'research-library',
          requested_artifact: slug,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      // Mark this browser session as already-captured so subsequent
      // DownloadGate instances on the page skip the form.
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // ignore — fail-open to next-card capture
      }
      setCaptured(true);

      // Trigger the download before showing success state.
      window.location.href = downloadHref;
      setPhase('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }

  // ── Idle: show the card footer CTA ────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="mk-resource-foot">
        {meta && <span>{meta}</span>}
        <button
          type="button"
          className="mk-download-gate-trigger"
          onClick={handleGetClick}
          aria-label={`Get the PDF for ${title}`}
        >
          Get the PDF &rarr;
        </button>
      </div>
    );
  }

  // ── Done: brief confirmation ───────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="mk-download-gate-confirm" role="status" aria-live="polite">
        <span className="mk-download-gate-ok">Opening {title}&hellip;</span>
      </div>
    );
  }

  // ── Form / Submitting / Error: inline email input ─────────────────────────
  return (
    <form
      className="mk-download-gate-form"
      onSubmit={handleSubmit}
      aria-label={`Enter your email to download ${title}`}
      noValidate
    >
      <div className="mk-download-gate-field">
        <label htmlFor={inputId} className="mk-download-gate-label">
          Work email
        </label>
        <div className="mk-download-gate-row">
          <input
            id={inputId}
            type="email"
            autoComplete="email"
            placeholder="you@yourbank.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            disabled={phase === 'submitting'}
            required
            aria-describedby={errorMsg ? `${inputId}-err` : undefined}
            className="mk-download-gate-input"
          />
          <button
            type="submit"
            disabled={phase === 'submitting'}
            className="mk-btn mk-btn-gold mk-download-gate-submit"
            aria-label={phase === 'submitting' ? 'Sending…' : 'Submit email and download'}
          >
            {phase === 'submitting' ? 'Sending…' : 'GET PDF'}
          </button>
        </div>
        {errorMsg && (
          <p id={`${inputId}-err`} className="mk-download-gate-error" role="alert">
            {errorMsg}
          </p>
        )}
      </div>
    </form>
  );
}
