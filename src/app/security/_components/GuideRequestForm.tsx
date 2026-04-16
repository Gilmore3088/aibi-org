'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (name.trim().length === 0 || institution.trim().length === 0) {
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
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-[color:var(--color-linen)]/30 bg-[color:var(--color-linen)]/10 p-8 text-center">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)] mb-3">
          Guide requested
        </p>
        <h3 className="font-serif text-3xl text-[color:var(--color-linen)] mb-3">
          Check your inbox.
        </h3>
        <p className="text-[color:var(--color-linen)]/80 leading-relaxed">
          We will email the Safe AI Use Guide to you within the next few
          minutes, along with a brief on how it maps to SR 11-7 and the AIEOG
          AI Lexicon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-linen)]/70">
            Your name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-[color:var(--color-linen)]/30 bg-transparent text-[color:var(--color-linen)] font-sans focus:outline-none focus:border-[color:var(--color-terra-pale)]"
          />
        </label>
        <label className="block">
          <span className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-linen)]/70">
            Work email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-[color:var(--color-linen)]/30 bg-transparent text-[color:var(--color-linen)] font-sans focus:outline-none focus:border-[color:var(--color-terra-pale)]"
          />
        </label>
      </div>
      <label className="block">
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-linen)]/70">
          Institution
        </span>
        <input
          type="text"
          required
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          className="mt-1 w-full px-4 py-3 border border-[color:var(--color-linen)]/30 bg-transparent text-[color:var(--color-linen)] font-sans focus:outline-none focus:border-[color:var(--color-terra-pale)]"
        />
      </label>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending guide…' : 'Email me the guide'}
      </button>
      {message && status === 'error' && (
        <p className="text-sm text-[color:var(--color-terra-pale)]" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
