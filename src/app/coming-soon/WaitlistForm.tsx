'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';

export type WaitlistInterest = 'assessment' | 'course' | 'institutional' | 'consulting';

const INTEREST_OPTIONS: ReadonlyArray<{
  readonly value: WaitlistInterest;
  readonly label: string;
}> = [
  { value: 'assessment', label: 'Readiness assessment' },
  { value: 'course', label: 'Education / course' },
  { value: 'institutional', label: 'Enterprise rollout' },
  { value: 'consulting', label: 'Advisory / consulting' },
];

const SELECTED_LABEL: Record<WaitlistInterest, string> = {
  assessment: 'the assessment',
  course: 'the course',
  institutional: 'enterprise rollout',
  consulting: 'advisory',
};

interface WaitlistFormProps {
  readonly initialInterest: WaitlistInterest;
}

export function WaitlistForm({ initialInterest }: WaitlistFormProps) {
  const headingId = useId();
  const emailId = useId();
  const firstNameId = useId();
  const institutionId = useId();
  const newsletterId = useId();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [interest, setInterest] = useState<WaitlistInterest>(initialInterest);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
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
        body: JSON.stringify({
          email,
          interest,
          firstName,
          institutionName,
          marketingOptIn,
        }),
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
      className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/15 p-6 md:p-7"
    >
      <h2
        id={headingId}
        className="font-serif-sc text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-terra)]"
      >
        Get notified
      </h2>

      <fieldset className="mt-5">
        <legend className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60">
          What are you looking for?
        </legend>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
          {INTEREST_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 py-2 min-h-[44px] cursor-pointer text-[14px] text-[color:var(--color-ink)]/85"
            >
              <input
                type="radio"
                name="interest"
                value={value}
                checked={interest === value}
                onChange={() => {
                  setInterest(value);
                  resetStatusOnEdit();
                }}
                className="shrink-0 accent-[color:var(--color-terra)]"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={firstNameId}
            className="block font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60"
          >
            First name <span className="text-[color:var(--color-ink)]/35 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id={firstNameId}
            type="text"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              resetStatusOnEdit();
            }}
            autoComplete="given-name"
            className="mt-2 w-full bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/15 px-3 py-2.5 text-[14px] text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]"
          />
        </div>
        <div>
          <label
            htmlFor={institutionId}
            className="block font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60"
          >
            Institution <span className="text-[color:var(--color-ink)]/35 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id={institutionId}
            type="text"
            value={institutionName}
            onChange={(event) => {
              setInstitutionName(event.target.value);
              resetStatusOnEdit();
            }}
            autoComplete="organization"
            className="mt-2 w-full bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/15 px-3 py-2.5 text-[14px] text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]"
          />
        </div>
      </div>

      <label
        htmlFor={emailId}
        className="mt-4 block font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60"
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
        autoComplete="email"
        placeholder="you@bank.com"
        className="mt-2 w-full bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/15 px-3 py-2.5 text-[14px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink)]/35 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]"
      />

      <label
        htmlFor={newsletterId}
        className="mt-4 flex items-start gap-2 text-[13px] text-[color:var(--color-ink)]/75 cursor-pointer leading-snug"
      >
        <input
          id={newsletterId}
          type="checkbox"
          checked={marketingOptIn}
          onChange={(event) => {
            setMarketingOptIn(event.target.checked);
            resetStatusOnEdit();
          }}
          className="mt-0.5 shrink-0 accent-[color:var(--color-terra)]"
        />
        <span>Also send the AI Banking Brief — weekly, short, easy to unsubscribe.</span>
      </label>

      <button
        type="submit"
        disabled={status === 'saving'}
        className="mt-6 w-full bg-[color:var(--color-terra)] text-[color:var(--color-linen)] disabled:opacity-50 px-5 py-3 font-sans text-[12px] font-semibold uppercase tracking-[1.2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
      >
        {status === 'saving' ? 'Saving…' : 'Notify me'}
      </button>

      <div role="status" aria-live="polite" className="mt-3 min-h-[1.25rem]">
        {status === 'saved' && (
          <p className="text-[13px] text-[color:var(--color-terra)]">
            Thanks. We will email you when {SELECTED_LABEL[interest]} opens.
          </p>
        )}
        {status === 'error' && (
          <p className="text-[13px] text-[color:var(--color-error)]">
            Could not save. Try again, or email{' '}
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
