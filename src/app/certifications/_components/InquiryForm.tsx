'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRACKS = [
  'Banking AI Practitioner (AiBI-P)',
  'Banking AI Specialist (AiBI-S)',
  'Banking AI Leader (AiBI-L)',
  'Not sure yet',
] as const;

export function InquiryForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [track, setTrack] = useState<(typeof TRACKS)[number]>('Not sure yet');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setStatus('error');
      setMessage('Please enter a valid email.');
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
          email: trimmedEmail,
          institution: institution.trim(),
          track,
          notes: notes.trim(),
          type: 'certification',
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
      <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-10 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-sage)] mb-3">
          Inquiry received
        </p>
        <h3 className="font-serif text-3xl text-[color:var(--color-ink)] mb-4">
          Thank you. We will be in touch within two business days.
        </h3>
        <p className="text-[color:var(--color-ink)]/70 leading-relaxed">
          We will reach out to discuss cohort timing, confirm the right track
          for your team, and walk you through what the engagement looks like.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10">
      <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)] mb-3">
        Request cohort information
      </p>
      <h3 className="font-serif text-3xl text-[color:var(--color-ink)] mb-4">
        Tell us about your institution.
      </h3>
      <p className="text-[color:var(--color-ink)]/70 mb-6 leading-relaxed">
        Phase 1 enrollments are handled by inquiry so we can confirm the right
        track for your team and walk you through cohort timing.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]/70">
              Your name
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-[color:var(--color-ink)]/20 bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans focus:outline-none focus:border-[color:var(--color-terra)]"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]/70">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-[color:var(--color-ink)]/20 bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans focus:outline-none focus:border-[color:var(--color-terra)]"
            />
          </label>
        </div>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]/70">
            Institution
          </span>
          <input
            type="text"
            required
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-[color:var(--color-ink)]/20 bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans focus:outline-none focus:border-[color:var(--color-terra)]"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]/70">
            Interested in
          </span>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value as (typeof TRACKS)[number])}
            aria-label="Certification track"
            className="mt-1 w-full px-4 py-3 border border-[color:var(--color-ink)]/20 bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans focus:outline-none focus:border-[color:var(--color-terra)]"
          >
            {TRACKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]/70">
            Anything else we should know (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full px-4 py-3 border border-[color:var(--color-ink)]/20 bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans focus:outline-none focus:border-[color:var(--color-terra)] resize-none"
          />
        </label>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : 'Submit inquiry'}
        </button>
        {message && status === 'error' && (
          <p className="text-sm text-[color:var(--color-error)]" role="alert">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
