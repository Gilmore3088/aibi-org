'use client';

// GuideRequestForm — email-capture form for the Safe AI Use guide.
//
// 2026-05-27: Ported to the mockup design system. Sits on a dark navy
// section, so inputs use on-dark borders, cream input fill, and the
// gold CTA. Voice is matter-of-fact — no "powered by" marketing.

import { useState, type CSSProperties, type FormEvent } from 'react';
import {
  buildFreeResourceDownloadHref,
  rememberFreeResourceCapture,
} from '@/lib/resources/freeResourceCapture';

type Status = 'idle' | 'submitting' | 'success' | 'error';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GUIDE_DOWNLOAD_PATH = '/api/guides/safe-ai-use';
const GUIDE_FILENAME = 'AiBI-Safe-AI-Use-Guide.pdf';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const kickerStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-soft)',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontFamily: INTER_STACK,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--on-dark-70)',
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid var(--on-dark-20)',
  background: 'var(--on-dark-08)',
  color: 'var(--cream)',
  fontFamily: INTER_STACK,
  fontSize: '0.9063rem',
  fontWeight: 500,
  outline: 'none',
};

const submitButtonStyle: CSSProperties = {
  width: '100%',
  padding: '14px 22px',
  background: 'var(--gold)',
  color: 'var(--ink)',
  fontFamily: INTER_STACK,
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  transition: 'background 120ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export function GuideRequestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid work email.');
      return;
    }
    if (name.trim().length === 0) {
      setStatus('error');
      setMessage('Name is required.');
      return;
    }
    setStatus('submitting');
    setMessage(null);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          institution: institution.trim(),
          track: 'Safe AI Use Guide',
          notes: 'Requested via /security guide download.',
          type: 'guide-request',
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Something went wrong.');
      }
      await triggerPdfDownload();
      rememberFreeResourceCapture({
        email: email.trim(),
        source: 'security-safe-ai-guide',
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  async function triggerPdfDownload() {
    const response = await fetch(buildFreeResourceDownloadHref(GUIDE_DOWNLOAD_PATH, {
      source: 'security-safe-ai-guide',
    }));
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? 'Guide download unavailable. Please try again.');
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Guide download unavailable. Please try again.');
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = GUIDE_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function retryPdfDownload() {
    setMessage(null);
    triggerPdfDownload().catch((err) => {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Guide download unavailable. Please try again.');
    });
  }

  if (status === 'success') {
    return (
      <div
        style={{
          border: '1px solid var(--on-dark-20)',
          background: 'var(--on-dark-08)',
          padding: 32,
          borderRadius: 24,
          textAlign: 'center',
        }}
      >
        <p style={{ ...kickerStyle, margin: '0 0 12px' }}>Opening download</p>
        <h3
          style={{
            fontFamily: INTER_STACK,
            fontWeight: 700,
            fontSize: '1.75rem',
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
            color: 'var(--cream)',
          }}
        >
          Your guide is ready.
        </h3>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.9375rem',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--on-dark-80)',
            margin: '0 0 18px',
          }}
        >
          The Safe AI Use Guide should open as a browser download or tab, and
          we&rsquo;ve also emailed you a copy. If the download does not start, use
          the button below.
        </p>
        <button
          type="button"
          onClick={retryPdfDownload}
          style={{ ...submitButtonStyle, width: 'auto', padding: '12px 22px' }}
        >
          DOWNLOAD GUIDE
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <label style={{ display: 'block' }}>
          <span style={labelStyle}>Your name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'block' }}>
          <span style={labelStyle}>Work email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>
      <label style={{ display: 'block' }}>
        <span style={labelStyle}>Institution · optional</span>
        <input
          type="text"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          style={inputStyle}
        />
      </label>
      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{ ...submitButtonStyle, opacity: status === 'submitting' ? 0.6 : 1 }}
      >
        {status === 'submitting' ? 'SENDING GUIDE…' : 'EMAIL ME THE GUIDE'}
      </button>
      {message && status === 'error' && (
        <p
          role="alert"
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--gold-soft)',
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
