'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

export type WaitlistInterest = 'specialist' | 'leader';

interface WaitlistFormProps {
  readonly initialInterest: WaitlistInterest;
}

export function WaitlistForm({ initialInterest }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState<WaitlistInterest>(initialInterest);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interest }),
      });

      setStatus(response.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-5 md:p-6 text-left"
    >
      <label className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Join the waitlist
      </label>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 mt-4">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@bank.com"
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/15 bg-[color:var(--color-linen)] px-4 py-3 text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]"
        />
        <button
          type="submit"
          disabled={status === 'saving'}
          className="px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] disabled:opacity-50 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
        >
          {status === 'saving' ? 'Saving...' : 'Join'}
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {[
          ['specialist', 'AiBI-S Specialist'],
          ['leader', 'AiBI-L Leader'],
        ].map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 text-xs text-[color:var(--color-ink)]/75">
            <input
              type="radio"
              name="interest"
              value={value}
              checked={interest === value}
              onChange={() => setInterest(value as WaitlistInterest)}
              className="accent-[color:var(--color-terra)]"
            />
            {label}
          </label>
        ))}
      </div>
      {status === 'saved' && (
        <p className="mt-3 text-xs text-[color:var(--color-sage)]">
          You are on the list.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-xs text-[color:var(--color-error)]">
          Could not save right now. Please try again.
        </p>
      )}
    </form>
  );
}
