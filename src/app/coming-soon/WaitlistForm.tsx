'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';

export type WaitlistInterest = 'assessment' | 'course' | 'institutional' | 'consulting';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InterestOption {
  readonly value: WaitlistInterest;
  readonly label: string;
  readonly preview: string;
}

const INTEREST_OPTIONS: ReadonlyArray<InterestOption> = [
  {
    value: 'assessment',
    label: 'Readiness assessment',
    preview:
      'A free three-minute diagnostic that scores your institution across eight dimensions, with a tailored starter artifact you can take to your team.',
  },
  {
    value: 'course',
    label: 'Education / course',
    preview:
      'Twelve self-paced modules on practical AI use for daily banking work — hands-on practice, role-applied artifacts, regulatory boundaries built in.',
  },
  {
    value: 'institutional',
    label: 'Enterprise rollout',
    preview:
      'A structured program for bringing AI capability across a whole branch network or back office, with cohort enrollment and measurable readiness milestones.',
  },
  {
    value: 'consulting',
    label: 'Advisory / consulting',
    preview:
      'Direct counsel for executives building AI capability — leadership advisory, regulator-ready artifacts, and a defensible program your board can sign off on.',
  },
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
  const emailErrorId = useId();
  const firstNameId = useId();
  const institutionId = useId();
  const newsletterId = useId();
  const previewId = useId();

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [interest, setInterest] = useState<WaitlistInterest>(initialInterest);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const emailInvalid = email.length > 0 && !EMAIL_RE.test(email);
  const showEmailError = emailTouched && emailInvalid;
  const selectedOption = INTEREST_OPTIONS.find((option) => option.value === interest)!;

  function resetStatusOnEdit() {
    if (status === 'error') {
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

  if (status === 'saved') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/15 p-6 md:p-7"
      >
        <p className="font-serif-sc text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-terra)]">
          On the list
        </p>
        <h2 className="mt-3 font-serif text-[24px] leading-[1.15] text-[color:var(--color-ink)]">
          Thanks{firstName ? `, ${firstName.trim()}` : ''}.
        </h2>
        <p className="mt-3 text-[15px] leading-[1.55] text-[color:var(--color-ink)]/80">
          We will email <span className="font-serif italic">{email}</span> when{' '}
          {SELECTED_LABEL[interest]} opens. No drip sequence, no list rental.
        </p>
        <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/65">
          If something is urgent, write to{' '}
          <a
            href="mailto:hello@aibankinginstitute.com"
            className="text-[color:var(--color-terra)] underline decoration-[color:var(--color-terra)]/40 underline-offset-2 hover:decoration-[color:var(--color-terra)]"
          >
            hello@aibankinginstitute.com
          </a>
          {' '}and a real person will reply.
        </p>
        <div className="mt-6 pt-5 border-t border-[color:var(--color-ink)]/10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/50">
            What happens next
          </p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-[color:var(--color-ink)]/70 leading-[1.55]">
            <li>1 — We email you only when {SELECTED_LABEL[interest]} actually opens.</li>
            <li>2 — You get first access. No queue, no sales call.</li>
            {marketingOptIn && <li>3 — The AI Banking Brief starts arriving weekly.</li>}
          </ul>
        </div>
      </div>
    );
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
        <div
          role="radiogroup"
          aria-describedby={previewId}
          className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1"
        >
          {INTEREST_OPTIONS.map(({ value, label }) => {
            const checked = interest === value;
            return (
              <label
                key={value}
                className={`flex items-center gap-2 px-2 py-2 min-h-[44px] cursor-pointer text-[14px] rounded-[2px] transition-colors ${
                  checked
                    ? 'bg-[color:var(--color-terra-pale)]/40 text-[color:var(--color-ink)]'
                    : 'text-[color:var(--color-ink)]/85 hover:bg-[color:var(--color-linen)]'
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
                  className="shrink-0 accent-[color:var(--color-terra)]"
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
        <p
          id={previewId}
          aria-live="polite"
          className="mt-3 text-[13px] leading-[1.55] text-[color:var(--color-ink)]/70 italic font-serif"
        >
          {selectedOption.preview}
        </p>
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
            className="mt-2 w-full bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/15 px-3 py-3 text-[14px] text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:border-[color:var(--color-terra)]"
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
            className="mt-2 w-full bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/15 px-3 py-3 text-[14px] text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:border-[color:var(--color-terra)]"
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
        onBlur={() => setEmailTouched(true)}
        aria-invalid={showEmailError}
        aria-describedby={showEmailError ? emailErrorId : undefined}
        autoComplete="email"
        placeholder="you@bank.com"
        className={`mt-2 w-full bg-[color:var(--color-linen)] border px-3 py-3 text-[14px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink)]/35 focus:outline-none focus:ring-2 ${
          showEmailError
            ? 'border-[color:var(--color-error)] focus:ring-[color:var(--color-error)] focus:border-[color:var(--color-error)]'
            : 'border-[color:var(--color-ink)]/15 focus:ring-[color:var(--color-terra)] focus:border-[color:var(--color-terra)]'
        }`}
      />
      {showEmailError && (
        <p id={emailErrorId} className="mt-1.5 text-[12px] text-[color:var(--color-error)]">
          That does not look like a valid email address.
        </p>
      )}

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
        <span>Also send the AI Banking Brief — weekly, short.</span>
      </label>

      <p className="mt-5 text-[12px] leading-[1.5] text-[color:var(--color-ink)]/60">
        A real person reads this list. We do not share your email.
      </p>

      <button
        type="submit"
        disabled={status === 'saving' || emailInvalid}
        className="mt-3 w-full bg-[color:var(--color-terra)] text-[color:var(--color-linen)] disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 font-sans text-[12px] font-semibold uppercase tracking-[1.2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
      >
        {status === 'saving' ? 'Saving…' : 'Notify me'}
      </button>

      <div role="status" aria-live="polite" className="mt-3 min-h-[1.25rem]">
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
