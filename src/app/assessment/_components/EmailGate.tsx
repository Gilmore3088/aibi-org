'use client';

// EmailGate — post-Q12 surface before the full report renders.
//
// Operator framing (2026-05-29): this is NOT a paywall and not a trap.
// It is the receipt for completed work. The user just answered 12
// questions; respect that. Show enough value to prove the assessment
// worked, then ask for email so they can keep the result.
//
// Order of operations:
//   1. Preview value — score, tier, top gap, first move
//   2. Ask for email — single field, "Send my report" CTA
//   3. Light privacy microcopy
//   4. Progressive disclosure — optional first name + institution
//   5. "What your full result includes" — three short rows
//
// Source layout: /Users/jgmbp/Downloads/aibi-email-capture-result-gate.html

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { saveReadinessResult, type DimensionScoreSerialized } from '@/lib/user-data';
import { trackEmailCaptured } from '@/lib/analytics/events';
import { DIMENSION_LABELS, type Dimension } from '@content/assessments/v3/types';
import { GAP_CONTENT } from '@content/assessments/v3/personalization';
import {
  FREE_ROLES,
  FREE_ROLE_LABEL,
  type FreeRole,
} from '@content/assessments/v3/roles';
import {
  formatRoiCurrency,
  formatRoiNumber,
  type RoiAssessmentContext,
} from '@/lib/roi/assessment-context';

// Free-funnel role taxonomy (FREE_ROLES / FREE_ROLE_LABEL / FREE_ROLE_TO_V2)
// lives in @content/assessments/v3/roles, shared with /api/capture-email so
// the form, the DB write, and the results view stay in lockstep.

interface EmailGateProps {
  readonly score: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly answers: readonly number[];
  readonly version?: 'v1' | 'v2' | 'v3';
  readonly maxScore?: number;
  readonly dimensionBreakdown?: Record<string, DimensionScoreSerialized>;
  readonly onCaptured: (
    email: string,
    extras: {
      readonly firstName?: string;
      readonly institutionName?: string;
      readonly profileId?: string | null;
      readonly usedFreeEmail?: boolean;
      readonly magicLinkUrl?: string | null;
      readonly role?: FreeRole;
    },
  ) => void;
  readonly onSkip: (extras: {
    readonly firstName?: string;
    readonly institutionName?: string;
    readonly role?: FreeRole;
  }) => void;
  readonly roiContext?: RoiAssessmentContext | null;
}

type Status = 'idle' | 'submitting' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Free-mail providers — if one of these is used without an institution
// name, the gate softly asks the user to add the institution. With an
// institution provided, the submit proceeds and the post-capture surface
// shows a soft nudge. See #189 + 2026-05-18 product call.
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

interface FocusGap {
  readonly id: Dimension;
  readonly label: string;
}

function findFocusGap(
  breakdown: Record<string, DimensionScoreSerialized> | undefined,
): FocusGap | null {
  if (!breakdown) return null;
  const entries = Object.entries(breakdown) as readonly [Dimension, DimensionScoreSerialized][];
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => {
    const aPct = a[1].maxScore > 0 ? a[1].score / a[1].maxScore : 1;
    const bPct = b[1].maxScore > 0 ? b[1].score / b[1].maxScore : 1;
    return aPct - bPct;
  });
  const [id] = sorted[0];
  const label = DIMENSION_LABELS[id as Dimension] ?? id;
  return { id: id as Dimension, label };
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
  onSkip,
  roiContext,
}: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [role, setRole] = useState<FreeRole | ''>('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const focusGap = findFocusGap(dimensionBreakdown);
  const gapContent = focusGap ? GAP_CONTENT[focusGap.id] : null;
  const displayMax = maxScore ?? 48;

  // Auto-skip the gate if the visitor is already signed in. We re-use
  // their auth-session email instead of asking them for it again — the
  // most common UX complaint from logged-in users completing the
  // assessment. Hits the server endpoint instead of importing the
  // Supabase browser SDK (~64 KB savings).
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (autoSubmittedRef.current) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { user: { email: string | null } | null };
        const sessionEmail = data.user?.email;
        if (cancelled || autoSubmittedRef.current) return;
        if (!sessionEmail || !EMAIL_RE.test(sessionEmail)) return;
        autoSubmittedRef.current = true;
        setEmail(sessionEmail);
        void submit(sessionEmail);
      } catch {
        // Service down — fall through to the manual form.
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
          role: role || undefined,
          marketingOptIn,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        profileId?: string | null;
        mailerliteTagAdded?: boolean;
        magicLinkUrl?: string | null;
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
      trackEmailCaptured({ tier: tierId });
      onCaptured(emailToUse, {
        firstName: firstName.trim() || undefined,
        institutionName: institutionName.trim() || undefined,
        profileId: data.profileId ?? null,
        usedFreeEmail: isFreeEmailDomain(emailToUse),
        magicLinkUrl: data.magicLinkUrl ?? null,
        // Pass the un-collapsed free role so the inline results view resolves
        // the exact role → playbook (matches what the DB now stores).
        role: role || undefined,
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
      setMessage('Please enter a valid email.');
      return;
    }
    // Free-email soft-gate removed (was blocking gmail.com submissions
    // when institution field was collapsed). Institution and role are
    // now visible fields, so the user can fill them in directly. The
    // backend still records isFreeEmailDomain for the post-capture nudge.
    await submit(trimmedEmail);
  }

  function handleSkip(): void {
    onSkip({
      firstName: firstName.trim() || undefined,
      institutionName: institutionName.trim() || undefined,
      role: role || undefined,
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <section
        className="rounded-[28px] overflow-hidden grid grid-cols-1 lg:grid-cols-[0.86fr_1.14fr]"
        style={{ boxShadow: 'var(--shadow-hero)' }}
      >
        {/* LEFT — pitch / receipt framing */}
        <div className="bg-[color:var(--ink)] text-white p-8 md:p-10 lg:p-12 flex flex-col justify-center">
          <span className="inline-flex w-max items-center gap-2 px-3.5 py-2 rounded-full border border-[color:var(--gold)]/45 bg-[color:var(--gold)]/8 text-[color:var(--gold-soft)] text-[12px] font-semibold">
            12 of 12 complete
          </span>
          <h1 className="mt-5 text-[36px] md:text-[52px] font-semibold leading-[0.98] tracking-[-0.04em] text-white">
            Your AI readiness snapshot is ready.
          </h1>
          {/* Promise only what is actually delivered after email — the
              score, tier, and starting direction are visible to the right,
              so they're a receipt of completed work, not bait. */}
          <p className="mt-5 text-[16px] md:text-[17px] leading-[1.6] text-white/70">
            Your score and starting direction are to the right. Send the
            full result for the plain-English diagnosis, your copy-ready
            starter prompt, the AI working brief you can paste into any
            tool, and a 30-day action path.
          </p>
        </div>

        {/* RIGHT — score preview + form */}
        <div className="bg-white p-6 md:p-7 lg:p-7 flex flex-col gap-7">
          {/* SCORE + TOP GAP (no "first move" cell — that copy lives
              in the post-email report; here we show diagnosis + a real
              next-step sentence pulled from gapContent.nextStep). */}
          <div className="rounded-[22px] overflow-hidden border border-[color:var(--ink-a10)] grid grid-cols-1 sm:grid-cols-[180px_1fr]">
            <div className="bg-[color:var(--ink)] text-white p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Preview score
              </p>
              <p className="mt-3 text-[60px] font-bold leading-[0.88] tracking-[-0.04em] text-[color:var(--gold-soft)] tabular-nums">
                {score}
                <span className="text-[15px] text-white/55 font-normal tracking-normal ml-1">
                  / {displayMax}
                </span>
              </p>
              <div className="mt-5 px-3.5 py-3 rounded-[14px] bg-white/8 border border-white/12">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                  Tier
                </p>
                <p className="mt-1 text-[16px] font-semibold text-white">{tierLabel}</p>
              </div>
            </div>
            {focusGap && gapContent && (
              <div className="bg-[color:var(--cream)] p-6 flex flex-col gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                    Top gap
                  </p>
                  <h3 className="mt-1.5 text-[20px] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--ink)]">
                    {focusGap.label}
                  </h3>
                </div>
                <p className="text-[14px] leading-[1.55] text-[color:var(--slate-700)]">
                  {gapContent.oneLine}
                </p>
                <div className="bg-white border border-[color:var(--ink-a10)] rounded-[14px] p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                    Where to start
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.55] text-[color:var(--ink)]">
                    {gapContent.nextStep}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {roiContext && (
              <div className="rounded-[16px] border border-[color:var(--gold)]/35 bg-[color:var(--gold)]/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                  ROI context carried forward
                </p>
                <p className="mt-2 text-[14px] leading-[1.55] text-[color:var(--slate-700)]">
                  Your calculator scenario estimated{' '}
                  <strong className="text-[color:var(--ink)]">
                    {formatRoiCurrency(roiContext.mid)}
                  </strong>{' '}
                  in annual recaptured capacity across{' '}
                  {formatRoiNumber(roiContext.fte)} employees. This assessment
                  shows where that value is most likely to be unlocked first.
                </p>
              </div>
            )}

            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                Send the full result
              </p>
              <h2 className="mt-1.5 text-[26px] md:text-[32px] font-semibold leading-[1] tracking-[-0.03em] text-[color:var(--ink)]">
                Where should we send your report?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <label htmlFor="gate-email" className="sr-only">
                Email
              </label>
              <input
                id="gate-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="name@yourbank.com"
                value={email}
                aria-invalid={status === 'error' || undefined}
                aria-describedby={status === 'error' ? 'gate-email-error' : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setMessage(null);
                  }
                }}
                className="w-full px-4 py-3.5 border border-[color:var(--ink-a15)] rounded-[16px] bg-white text-[color:var(--ink)] text-[15px] font-semibold focus:outline-none focus:border-[color:var(--gold)]"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[16px] bg-[color:var(--gold)] text-[color:var(--ink)] text-[14px] font-bold hover:bg-[color:var(--gold-2)] transition-colors disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending…' : 'Send my report →'}
              </button>
            </div>

            {/* Personalize — first name, institution, role. All optional
                but visible (not collapsed) so users can fill them
                without finding the disclosure. Free-email soft gate is
                gone; institution is recommended, not required. */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3">
              <div>
                <label
                  htmlFor="gate-firstname"
                  className="block text-[12px] font-semibold text-[color:var(--slate-600)] mb-1.5"
                >
                  First name <span className="font-normal text-[color:var(--slate-500)]">· optional</span>
                </label>
                <input
                  id="gate-firstname"
                  type="text"
                  autoComplete="given-name"
                  maxLength={80}
                  placeholder="Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-[color:var(--ink-a15)] rounded-[14px] bg-white text-[color:var(--ink)] text-[14px] focus:outline-none focus:border-[color:var(--gold)]"
                />
              </div>
              <div>
                <label
                  htmlFor="gate-institution"
                  className="block text-[12px] font-semibold text-[color:var(--slate-600)] mb-1.5"
                >
                  Institution <span className="font-normal text-[color:var(--slate-500)]">· recommended</span>
                </label>
                <input
                  id="gate-institution"
                  type="text"
                  autoComplete="organization"
                  maxLength={120}
                  placeholder="First Federal Credit Union"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-4 py-3 border border-[color:var(--ink-a15)] rounded-[14px] bg-white text-[color:var(--ink)] text-[14px] focus:outline-none focus:border-[color:var(--gold)]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="gate-role"
                className="block text-[12px] font-semibold text-[color:var(--slate-600)] mb-1.5"
              >
                Your role <span className="font-normal text-[color:var(--slate-500)]">· optional</span>
              </label>
              <select
                id="gate-role"
                value={role}
                onChange={(e) => setRole(e.target.value as FreeRole | '')}
                className="w-full px-4 py-3 border border-[color:var(--ink-a15)] rounded-[14px] bg-white text-[color:var(--ink)] text-[14px] focus:outline-none focus:border-[color:var(--gold)]"
              >
                <option value="">Select your role</option>
                {FREE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {FREE_ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>

            {status === 'error' && message && (
              <p
                id="gate-email-error"
                role="alert"
                className="text-[13px] text-[#B42318] leading-[1.5]"
              >
                {message}
              </p>
            )}

            <p className="text-[13px] text-[color:var(--slate-600)] leading-[1.55]">
              No credit card. Work email recommended if you want the result
              tied to your institution.
            </p>

            <label className="flex items-start gap-3 rounded-[14px] border border-[color:var(--ink-a10)] bg-[color:var(--cream)] px-3.5 py-3">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(event) => setMarketingOptIn(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[color:var(--gold)]"
              />
              <span className="text-[13px] leading-[1.55] text-[color:var(--slate-700)]">
                Send a few follow-up ideas for this result. You can leave this
                unchecked and still receive the report email.
              </span>
            </label>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full rounded-[14px] border border-[color:var(--ink-a15)] bg-white px-4 py-3 text-[14px] font-semibold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)]"
            >
              View summary without email
            </button>

            {/* WHAT UNLOCKS — three rows the email genuinely delivers
                AND that aren't already shown above. */}
            <ul className="space-y-2.5 pt-2">
              <UnlockRow
                title="Full top-gap explanation"
                body="What it leads to · what good looks like · the deeper context."
              />
              <UnlockRow
                title="Three practical takeaways"
                body="Copy-ready prompt · helper tool · working artifact."
              />
              <UnlockRow
                title="30-day action path"
                body="A first-week and first-month plan you can actually use."
              />
            </ul>
          </form>
        </div>
      </section>
    </div>
  );
}

function UnlockRow({ title, body }: { readonly title: string; readonly body: string }) {
  return (
    <li className="flex items-start gap-3 bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[14px] px-3.5 py-3">
      <span
        aria-hidden
        className="grid place-items-center w-6 h-6 rounded-full bg-[color:var(--gold)] text-[color:var(--ink)] text-[12px] font-bold shrink-0"
      >
        ✓
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-[color:var(--ink)] leading-tight">{title}</p>
        <p className="mt-0.5 text-[12px] text-[color:var(--slate-600)] leading-[1.5]">{body}</p>
      </div>
    </li>
  );
}
