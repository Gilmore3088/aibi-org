'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';

export type WaitlistInterest = 'assessment' | 'course' | 'newsletter' | 'institutional';

const INTEREST_OPTIONS: ReadonlyArray<{
  readonly value: WaitlistInterest;
  readonly label: string;
  readonly hint: string;
}> = [
  { value: 'assessment', label: 'Readiness assessment', hint: 'Free 3-min diagnostic' },
  { value: 'course', label: 'Practitioner education', hint: 'Twelve self-paced modules' },
  { value: 'newsletter', label: 'AI Banking Brief', hint: 'Weekly editorial' },
  { value: 'institutional', label: 'Institutional counsel', hint: 'For our whole team' },
];

interface WaitlistFormProps {
  readonly initialInterest: WaitlistInterest;
}

export function WaitlistForm({ initialInterest }: WaitlistFormProps) {
  const emailId = useId();
  const headingId = useId();
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState<WaitlistInterest>(initialInterest);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  function resetStatusOnEdit() {
    if (status === 'saved' || status === 'error') {
      setStatus('idle');
    }
  }

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
      aria-labelledby={headingId}
      aria-busy={status === 'saving'}
      className="relative bg-[color:var(--color-parch)] border-t-[3px] border-t-[color:var(--color-terra)] border-x border-b border-[color:var(--color-ink)]/15 p-6 md:p-7 shadow-[0_1px_0_rgba(30,26,20,0.04)]"
    >
      {/* Editorial top line */}
      <div className="flex items-baseline justify-between mb-5">
        <h2
          id={headingId}
          className="font-serif-sc text-[11px] tracking-[0.28em] uppercase text-[color:var(--color-terra)]"
        >
          Reserve Your Place
        </h2>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/50">
          No. 01
        </span>
      </div>

      <p className="font-serif italic text-[15px] leading-snug text-[color:var(--color-ink)]/85 mb-5">
        We will write only when there is something real to share — the moment your
        track opens, and not before.
      </p>

      <fieldset>
        <legend className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 mb-3">
          What you are looking for
        </legend>
        <ul className="divide-y divide-[color:var(--color-ink)]/10 border-y border-[color:var(--color-ink)]/10">
          {INTEREST_OPTIONS.map(({ value, label, hint }, idx) => {
            const checked = interest === value;
            return (
              <li key={value}>
                <label
                  className={`flex items-baseline gap-3 py-3 cursor-pointer min-h-[44px] transition-colors ${
                    checked
                      ? 'bg-[color:var(--color-terra-pale)]/30'
                      : 'hover:bg-[color:var(--color-linen)]/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="interest"
                    value={value}
                    checked={checked}
                    onChange={() => {
                      setInterest(value);
                      resetStatusOnEdit();
                    }}
                    className="sr-only peer"
                  />
                  <span
                    aria-hidden
                    className={`font-mono text-[11px] tracking-[0.18em] tabular-nums shrink-0 w-6 ${
                      checked ? 'text-[color:var(--color-terra)]' : 'text-[color:var(--color-ink)]/45'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1">
                    <span className="block font-serif text-[16px] leading-tight text-[color:var(--color-ink)]">
                      {label}
                    </span>
                    <span className="block mt-0.5 font-sans text-[12px] text-[color:var(--color-ink)]/60">
                      {hint}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`shrink-0 mt-1 h-3 w-3 rounded-full border transition ${
                      checked
                        ? 'bg-[color:var(--color-terra)] border-[color:var(--color-terra)]'
                        : 'bg-transparent border-[color:var(--color-ink)]/35'
                    }`}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <label
        htmlFor={emailId}
        className="mt-5 block font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55"
      >
        Work email
      </label>
      <input
        id={emailId}
        type="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          resetStatusOnEdit();
        }}
        placeholder="you@bank.com"
        className="mt-2 w-full bg-transparent border-0 border-b-2 border-[color:var(--color-ink)]/25 px-0 py-3 font-serif text-[18px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink)]/35 focus:outline-none focus:border-[color:var(--color-terra)] transition-colors"
      />

      <button
        type="submit"
        disabled={status === 'saving'}
        className="group mt-6 w-full flex items-center justify-between bg-[color:var(--color-ink)] text-[color:var(--color-linen)] disabled:opacity-50 px-5 py-4 font-serif-sc text-[12px] uppercase tracking-[0.24em] hover:bg-[color:var(--color-terra)] transition-colors duration-300"
      >
        <span>{status === 'saving' ? 'Reserving…' : 'Notify me when it opens'}</span>
        <span aria-hidden className="font-mono text-[14px] transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </button>

      <div role="status" aria-live="polite" className="mt-3 min-h-[1.25rem]">
        {status === 'saved' && (
          <p className="font-serif italic text-[14px] text-[color:var(--color-terra)]">
            Reserved. We will write when it opens.
          </p>
        )}
        {status === 'error' && (
          <p className="text-[13px] text-[color:var(--color-error)]">
            Could not save. Try again, or write{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              className="underline decoration-[color:var(--color-error)]/40 underline-offset-2"
            >
              hello@aibankinginstitute.com
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
