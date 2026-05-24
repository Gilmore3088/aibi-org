'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  saveReadinessResult,
  saveProfileIdentity,
  type DimensionScoreSerialized,
} from '@/lib/user-data';
import { trackEmailCaptured } from '@/lib/analytics/events';

interface EmailGateProps {
  readonly score: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly answers: readonly number[];
  readonly version?: 'v1' | 'v2';
  readonly maxScore?: number;
  readonly dimensionBreakdown?: Record<string, DimensionScoreSerialized>;
  readonly onCaptured: (
    email: string,
    extras: {
      readonly firstName?: string;
      readonly institutionName?: string;
      readonly profileId?: string | null;
      /** True when the captured email is from a known free-mail provider.
          Lets the post-capture surface show a soft nudge to re-submit with
          a work email. See #189 + 2026-05-18 product call. */
      readonly usedFreeEmail?: boolean;
      /** True when /api/capture-email provisioned a fresh auth user
       *  AND issued a session for this visitor. The page-level handler
       *  uses this to redirect into /auth/passkey/enroll so the new
       *  session gets a real credential attached. */
      readonly autoSignedIn?: boolean;
    },
  ) => void;
}

type Status = 'idle' | 'submitting' | 'error';
type ErrorField = 'email' | 'institution' | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Free-mail providers. When an email matches one of these AND institution
// is empty, the gate blocks submit with an inline message asking for the
// institution. When institution IS provided, the submit proceeds and the
// post-capture surface shows a soft nudge. See #189 + 2026-05-18 product
// call (DECISIONS.md).
const FREE_EMAIL_DOMAINS = new Set<string>([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'live.com', 'live.co.uk', 'msn.com',
  'outlook.com', 'outlook.co.uk',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'mail.com', 'gmx.com', 'gmx.us',
  'zoho.com',
  'yandex.com', 'yandex.ru',
  'fastmail.com', 'fastmail.fm',
  'tutanota.com', 'tuta.io',
]);

function isFreeEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return domain ? FREE_EMAIL_DOMAINS.has(domain) : false;
}

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
  const [firstName, setFirstName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<ErrorField>(null);
  // Stays true until the /api/auth/me check has either resolved or
  // failed. We hide the form during this window so a logged-in user
  // doesn't see an empty gate flash before the auto-submit fires.
  const [authChecking, setAuthChecking] = useState(true);
  const institutionInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // Prefill from localStorage on mount — if the visitor already gave us
  // identity at a prior EmailGate (returning to retake, or completing
  // the assessment after browsing other surfaces), don't make them type
  // it all again. Reads run client-side only; SSR paint shows empty
  // fields, then the post-mount setState populates.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('aibi-user');
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        email?: unknown;
        fullName?: unknown;
        firstName?: unknown;
        institutionName?: unknown;
      };
      if (typeof parsed.email === 'string' && EMAIL_RE.test(parsed.email)) {
        setEmail((current) => current || parsed.email as string);
      }
      const storedName =
        typeof parsed.fullName === 'string'
          ? parsed.fullName
          : typeof parsed.firstName === 'string'
            ? parsed.firstName
            : null;
      if (storedName) {
        setFirstName((current) => current || storedName);
      }
      if (typeof parsed.institutionName === 'string' && parsed.institutionName) {
        setInstitutionName((current) => current || (parsed.institutionName as string));
      }
    } catch {
      /* malformed JSON — ignore, render empty form */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-skip the gate if the visitor is already signed in. We re-use their
  // auth-session email instead of asking them for it again — the most common
  // UX complaint from logged-in users completing the assessment.
  //
  // Hits the server endpoint instead of importing the Supabase browser SDK,
  // which would balloon the assessment route's First Load JS by ~64 KB.
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (autoSubmittedRef.current) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setAuthChecking(false);
          return;
        }
        const data = (await res.json()) as { user: { email: string | null } | null };
        const sessionEmail = data.user?.email;
        if (cancelled || autoSubmittedRef.current) return;
        if (!sessionEmail || !EMAIL_RE.test(sessionEmail)) {
          setAuthChecking(false);
          return;
        }
        autoSubmittedRef.current = true;
        setEmail(sessionEmail);
        // Stay in authChecking state through submit so we render a
        // single "Preparing your report…" instead of flashing the form
        // and then the success state.
        void submit(sessionEmail);
      } catch {
        // Service down or offline — fall through to the manual form. The
        // gate still works; the user just has to type their email.
        if (!cancelled) setAuthChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(emailToUse: string): Promise<void> {
    setStatus('submitting');
    setMessage(null);
    setErrorField(null);
    try {
      const res = await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          score,
          tier: tierId,
          tierLabel,
          answers,
          version,
          maxScore,
          dimensionBreakdown,
          firstName: firstName.trim() || undefined,
          institutionName: institutionName.trim() || undefined,
          marketingOptIn,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        profileId?: string | null;
        mailerliteTagAdded?: boolean;
        autoSignedIn?: boolean;
      };
      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }
      saveReadinessResult(emailToUse, {
        score,
        tierId,
        tierLabel,
        answers,
        ...(version ? { version } : {}),
        ...(maxScore !== undefined ? { maxScore } : {}),
        ...(dimensionBreakdown ? { dimensionBreakdown } : {}),
      });
      // Persist firstName + institutionName separately so downstream
      // surfaces (Stripe Checkout name field, /auth/signup form,
      // dashboard greeting) can prefill from one source of truth.
      saveProfileIdentity(emailToUse, {
        firstName: firstName.trim() || null,
        institutionName: institutionName.trim() || null,
      });
      trackEmailCaptured({ tier: tierId });
      onCaptured(emailToUse, {
        firstName: firstName.trim() || undefined,
        institutionName: institutionName.trim() || undefined,
        profileId: data.profileId ?? null,
        usedFreeEmail: isFreeEmailDomain(emailToUse),
        autoSignedIn: Boolean(data.autoSignedIn),
      });
    } catch (err) {
      setStatus('error');
      setErrorField('email');
      setMessage(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setStatus('error');
      setErrorField('email');
      setMessage('Please enter a valid work email.');
      requestAnimationFrame(() => emailInputRef.current?.focus());
      return;
    }
    // Soft-gate on free-email providers: accept the personal email, but
    // only after the user provides an institution name. Without that
    // context, the report can't be tailored. Error attaches to the
    // institution field — that is the missing input — and focus moves
    // there so the user can fix the actual problem.
    if (isFreeEmailDomain(trimmedEmail) && !institutionName.trim()) {
      setStatus('error');
      setErrorField('institution');
      setMessage(
        'Add your institution name so we can tailor your report — or retake with a work email.',
      );
      requestAnimationFrame(() => institutionInputRef.current?.focus());
      return;
    }
    await submit(trimmedEmail);
  }

  // Hide the gate during the initial auth check + auto-submit so a
  // signed-in visitor never sees the empty form flash. Once we know
  // they're not signed in (or the check failed), authChecking flips
  // and the form renders normally.
  if (authChecking || status === 'submitting') {
    return (
      <div
        className="w-full max-w-5xl mx-auto py-16 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/65">
          Preparing your report&hellip;
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-0 border border-[color:var(--color-ink)]/10 rounded-[3px] overflow-hidden">
        <DeliverablePanel />

        <div className="bg-[color:var(--color-parch)] p-8 md:p-10 lg:p-12">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            See your full results
          </p>
          <h3 className="font-serif text-3xl leading-tight text-[color:var(--color-ink)]">
            Where should we send your breakdown?
          </h3>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <FormField
              id="gate-email"
              label="Work email"
              required
              error={errorField === 'email' ? message : null}
            >
              <input
                id="gate-email"
                ref={emailInputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="name@yourbank.com"
                value={email}
                aria-invalid={errorField === 'email' || undefined}
                aria-describedby={errorField === 'email' ? 'gate-email-error' : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setMessage(null);
                    setErrorField(null);
                  }
                }}
                className="w-full px-4 py-3 border border-[color:var(--color-ink)]/20 rounded-[2px] bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans text-base focus:outline-none focus:border-[color:var(--color-terra)]"
              />
            </FormField>

            <FormField
              id="gate-fullname"
              label="Full name"
              hint="Optional — so we can address you correctly"
            >
              <input
                id="gate-fullname"
                type="text"
                autoComplete="name"
                maxLength={80}
                placeholder="Sarah Reynolds"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-[color:var(--color-ink)]/20 rounded-[2px] bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans text-base focus:outline-none focus:border-[color:var(--color-terra)]"
              />
            </FormField>

            <FormField
              id="gate-institution"
              label="Institution name"
              hint="Optional — helps us tailor recommendations"
              error={errorField === 'institution' ? message : null}
            >
              <input
                id="gate-institution"
                ref={institutionInputRef}
                type="text"
                autoComplete="organization"
                maxLength={120}
                placeholder="First Federal Credit Union"
                value={institutionName}
                aria-invalid={errorField === 'institution' || undefined}
                aria-describedby={errorField === 'institution' ? 'gate-institution-error' : undefined}
                onChange={(e) => {
                  setInstitutionName(e.target.value);
                  if (errorField === 'institution') {
                    setStatus('idle');
                    setMessage(null);
                    setErrorField(null);
                  }
                }}
                className="w-full px-4 py-3 border border-[color:var(--color-ink)]/20 rounded-[2px] bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans text-base focus:outline-none focus:border-[color:var(--color-terra)]"
              />
            </FormField>

            <label className="flex gap-3 cursor-pointer text-sm text-[color:var(--color-ink)]/80 leading-relaxed">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-1 shrink-0 h-4 w-4 accent-[color:var(--color-terra)]"
              />
              <span>
                Also subscribe me to{' '}
                <span className="text-[color:var(--color-ink)]">The AI Banking Brief</span>
                {' '}— twice-monthly research notes for community-bank executives. Unsubscribe anytime.
              </span>
            </label>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors disabled:opacity-60"
            >
              Show my full results
            </button>
          </form>
        </div>
      </div>

      <TrustStrip />
    </div>
  );
}

// Left column — visual proof of what they're getting.
function DeliverablePanel() {
  return (
    <div className="bg-[color:var(--color-linen)] p-8 md:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-[color:var(--color-ink)]/10">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
        What you get
      </p>
      <h3 className="font-serif text-3xl leading-tight text-[color:var(--color-ink)]">
        A working diagnostic, not a teaser.
      </h3>

      <div
        className="mt-6 border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-4 rounded-[2px]"
        aria-hidden="true"
      >
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-slate)]">
            Readiness breakdown
          </p>
          <p className="font-mono text-[10px] tabular-nums text-[color:var(--color-slate)]">
            8 dimensions
          </p>
        </div>
        <div className="space-y-2">
          {([
            ['Awareness', 0.65],
            ['Use cases', 0.50],
            ['Governance', 0.40],
            ['Data', 0.35],
            ['Skills', 0.55],
            ['Vendor', 0.70],
            ['Comms', 0.45],
            ['Roadmap', 0.30],
          ] as const).map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] w-20 shrink-0">
                {label}
              </span>
              <div className="flex-1 h-1.5 bg-[color:var(--color-ink)]/10 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-[color:var(--color-terra)]"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-slate)]">
          Sample only — yours will reflect your actual answers
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {[
          ['Score across 8 dimensions', 'Where you stand on awareness, governance, skills, data, and four more.'],
          ['Tailored starter artifact', 'A copy-paste-ready Markdown deliverable for your weakest dimension.'],
          ['Email copy of both', 'Yours to share with your team, your board, or your examiners.'],
        ].map(([title, body]) => (
          <li key={title} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
            <div>
              <p className="font-serif text-base text-[color:var(--color-ink)]">{title}</p>
              <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustStrip() {
  return (
    <div className="mt-6 grid sm:grid-cols-3 gap-x-6 gap-y-3 px-2">
      {[
        ['Where this goes', 'Our records and your newsletter list only if you opt in. Never sold.'],
        ['What we store', 'Your email, answers, and score. Removable on request — email hello@aibankinginstitute.com.'],
        ['No surprise sales calls', 'Briefings happen by request only. We will not cold-call your line.'],
      ].map(([title, body]) => (
        <div key={title} className="border-l-2 border-[color:var(--color-terra)]/40 pl-3">
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">
            {title}
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-slate)] leading-relaxed">{body}</p>
        </div>
      ))}
    </div>
  );
}

function FormField({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly error?: string | null;
  readonly children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]"
        >
          {label}
          {required && <span className="ml-1 text-[color:var(--color-terra)]">*</span>}
        </label>
        {hint && !error && (
          <span className="text-xs text-[color:var(--color-slate)]">{hint}</span>
        )}
      </div>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-[color:var(--color-error)] flex items-start gap-1.5"
          role="alert"
        >
          <span aria-hidden="true" className="font-mono leading-tight">!</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
