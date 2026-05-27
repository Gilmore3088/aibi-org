'use client';

import { useEffect, useState, useRef, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PlaybookDownloadModalProps {
  readonly role: string;
  readonly roleTitle: string;
  readonly pdfHref: string;
  readonly pdfFilename: string;
  readonly onClose: () => void;
}

export function PlaybookDownloadModal({
  role,
  roleTitle,
  pdfHref,
  pdfFilename,
  onClose,
}: PlaybookDownloadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function triggerPdfDownload() {
    const link = document.createElement('a');
    link.href = pdfHref;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedInstitution = institution.trim();

    if (!EMAIL_RE.test(trimmedEmail)) {
      setStatus('error');
      setMessage('Please enter a valid work email.');
      return;
    }
    if (trimmedName.length === 0 || trimmedInstitution.length === 0) {
      setStatus('error');
      setMessage('Name and institution are required.');
      return;
    }

    setStatus('submitting');
    setMessage(null);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          institution: trimmedInstitution,
          track: `${role}-playbook`,
          notes: `Requested ${roleTitle} playbook PDF via /playbooks/${role}.`,
          type: 'playbook-request',
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Something went wrong.');
      }
      setStatus('success');
      triggerPdfDownload();
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="playbook-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7, 26, 47, 0.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg"
        style={{
          background: 'var(--cream)',
          borderRadius: 16,
          boxShadow: '0 30px 60px -20px rgba(0,0,0,.45)',
          padding: 32,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'success' ? (
          <>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                marginBottom: 12,
              }}
            >
              Downloading now
            </p>
            <h2
              id="playbook-modal-title"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            >
              Your {roleTitle} playbook is on its way.
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--slate-600)',
                marginBottom: 20,
              }}
            >
              The PDF should be downloading now. If it didn&rsquo;t start
              automatically, use the button below.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={triggerPdfDownload}
                className="mk-btn mk-btn-gold"
              >
                Download playbook
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mk-btn mk-btn-ghost-light"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                marginBottom: 12,
              }}
            >
              {roleTitle} Playbook · PDF
            </p>
            <h2
              id="playbook-modal-title"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              Where should we send your playbook?
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--slate-600)',
                marginBottom: 20,
              }}
            >
              We&rsquo;ll start the PDF download immediately and email a
              copy you can forward to your team.
            </p>

            <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
              <label style={{ display: 'block' }}>
                <span style={fieldLabel}>Your name</span>
                <input
                  ref={firstFieldRef}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={fieldInput}
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={fieldLabel}>Work email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={fieldInput}
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={fieldLabel}>Institution</span>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  style={fieldInput}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mk-btn mk-btn-gold"
                style={{ opacity: status === 'submitting' ? 0.6 : 1 }}
              >
                {status === 'submitting' ? 'Sending…' : 'Email me the playbook'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mk-btn mk-btn-ghost-light"
                disabled={status === 'submitting'}
              >
                Cancel
              </button>
            </div>

            {message && status === 'error' && (
              <p
                role="alert"
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: '#b91c1c',
                }}
              >
                {message}
              </p>
            )}

            <p
              style={{
                marginTop: 16,
                fontSize: 11,
                lineHeight: 1.5,
                color: 'var(--slate-500)',
              }}
            >
              We&rsquo;ll send occasional follow-ups about the playbook and
              the AiBI Foundations course. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const fieldLabel = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--slate-600)',
  marginBottom: 6,
} as const;

const fieldInput = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  fontFamily: 'inherit',
  color: 'var(--ink)',
  background: '#fff',
  border: '1px solid var(--slate-200)',
  borderRadius: 8,
  outline: 'none',
} as const;
