'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { saveReadinessResult, type DimensionScoreSerialized } from '@/lib/user-data';
import { createBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

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
    },
  ) => void;
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
  const [firstName, setFirstName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // Auto-skip the gate if the visitor is already signed in. We re-use their
  // auth-session email instead of asking them for it again — the most common
  // UX complaint from logged-in users completing the assessment.
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (autoSubmittedRef.current) return;
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserClient();
    let cancelled = false;
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || autoSubmittedRef.current) return;
      const sessionEmail = user?.email;
      if (!sessionEmail || !EMAIL_RE.test(sessionEmail)) return;
      autoSubmittedRef.current = true;
      setEmail(sessionEmail);
      void submit(sessionEmail);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(emailToUse: string): Promise<void> {
    setStatus('submitting');
    setMessage(null);
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
      onCaptured(emailToUse, {
        firstName: firstName.trim() || undefined,
        institutionName: institutionName.trim() || undefined,
        profileId: data.profileId ?? null,
      });
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setStatus('error');
      setMessage('Please enter a valid work email.');
      return;
    }
    await submit(trimmedEmail);
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
              error={status === 'error' ? message : null}
            >
              <input
                id="gate-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="name@yourbank.com"
                value={email}
                aria-invalid={status === 'error' || undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setMessage(null);
                  }
                }}
                className="w-full px-4 py-3 border border-[color:var(--color-ink)]/20 rounded-[2px] bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans text-base focus:outline-none focus:border-[color:var(--color-terra)]"
              />
            </FormField>

            <FormField
              id="gate-firstname"
              label="First name"
              hint="Optional — so we can address you correctly"
            >
              <input
                id="gate-firstname"
                type="text"
                autoComplete="given-name"
                maxLength={80}
                placeholder="Sarah"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-[color:var(--color-ink)]/20 rounded-[2px] bg-[color:var(--color-linen)] text-[color:var(--color-ink)] font-sans text-base focus:outline-none focus:border-[color:var(--color-terra)]"
              />
            </FormField>

            <FormField
              id="gate-institution"
              label="Institution name"
              hint="Optional — helps us tailor recommendations"
            >
              <input
                id="gate-institution"
                type="text"
                autoComplete="organization"
                maxLength={120}
                placeholder="First Federal Credit Union"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
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
              disabled={status === 'submitting'}
              className="w-full px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending…' : 'Show my full results'}
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
        ['Where this goes', 'HubSpot for our records and ConvertKit only if you opt in. Never sold.'],
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
          <span className="text-xs text-[color:var(--color-slate)]/80">{hint}</span>
        )}
      </div>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-[color:var(--color-error)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
