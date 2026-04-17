'use client';

import { useState, type FormEvent } from 'react';
import { saveReadinessResult, type DimensionScoreSerialized } from '@/lib/user-data';

interface EmailGateProps {
  readonly score: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly answers: readonly number[];
  readonly version?: 'v1' | 'v2';
  readonly maxScore?: number;
  readonly dimensionBreakdown?: Record<string, DimensionScoreSerialized>;
  readonly onCaptured: (email: string) => void;
}

type Status = 'idle' | 'submitting' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGate({
  score,
  tierId,
  tierLabel,
  answers,
  version,
  maxScore,
  dimensionBreakdown,
  onCaptured,
}: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid work email.');
      return;
    }
    setStatus('submitting');
    setMessage(null);
    try {
      const res = await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          score,
          tier: tierId,
          tierLabel,
          answers,
          version,
          maxScore,
          dimensionBreakdown,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }
      saveReadinessResult(trimmed, {
        score,
        tierId,
        tierLabel,
        answers,
        ...(version ? { version } : {}),
        ...(maxScore !== undefined ? { maxScore } : {}),
        ...(dimensionBreakdown ? { dimensionBreakdown } : {}),
      });
      onCaptured(trimmed);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10">
      <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)] mb-4">
        See your full results
      </p>
      <h3 className="font-serif text-3xl leading-tight mb-4 text-[color:var(--color-ink)]">
        Where should we send your score and breakdown?
      </h3>
      <p className="text-[color:var(--color-ink)]/70 mb-6 text-base leading-relaxed">
        We will show your exact score, an 8-dimension breakdown, and email you a
        brief interpretation of what your tier means for the next 90 days. No
        marketing spam, and you can unsubscribe with one click.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email-gate" className="sr-only">
            Work email address
          </label>
          <input
            id="email-gate"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="name@yourbank.com"
            value={email}
            aria-describedby={message ? 'email-gate-error' : undefined}
            aria-invalid={status === 'error' ? true : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') {
                setStatus('idle');
                setMessage(null);
              }
            }}
            className="w-full px-4 py-3 border border-[color:var(--color-ink)]/20 rounded-[2px] bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans text-base focus:outline-none focus:border-[color:var(--color-terra)]"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending\u2026' : 'Show my full results'}
        </button>
        {message && (
          <p id="email-gate-error" className="text-sm text-[color:var(--color-error)]" role="alert">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
