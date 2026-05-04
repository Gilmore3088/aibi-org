'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

export type WaitlistInterest = 'assessment' | 'course' | 'newsletter' | 'institutional';

const INTEREST_OPTIONS: ReadonlyArray<{ readonly value: WaitlistInterest; readonly label: string }> = [
  { value: 'assessment', label: 'Free readiness assessment' },
  { value: 'course', label: 'Practitioner course (AiBI-P)' },
  { value: 'newsletter', label: 'AI Banking Brief newsletter' },
  { value: 'institutional', label: 'Rollout for our team' },
];

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
        Tell us what you&apos;re looking for
      </label>

      <fieldset className="mt-4">
        <legend className="sr-only">What are you interested in?</legend>
        <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2">
          {INTEREST_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-start gap-2 text-sm text-[color:var(--color-ink)]/85 cursor-pointer leading-snug"
            >
              <input
                type="radio"
                name="interest"
                value={value}
                checked={interest === value}
                onChange={() => setInterest(value)}
                className="mt-0.5 shrink-0 accent-[color:var(--color-terra)]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 mt-5">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@bank.com"
          aria-label="Work email"
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/15 bg-[color:var(--color-linen)] px-4 py-3 text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]"
        />
        <button
          type="submit"
          disabled={status === 'saving'}
          className="px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] disabled:opacity-50 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
        >
          {status === 'saving' ? 'Saving...' : 'Notify me'}
        </button>
      </div>

      {status === 'saved' && (
        <p className="mt-3 text-xs text-[color:var(--color-terra)]">
          You are on the list. We will be in touch.
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
