'use client';

// ContactSalesForm — client form for /foundation/contact-sales.
// Local validation mirrors the server route; on success we render the
// thank-you state inline rather than navigating away.

import { useId, useState } from 'react';
import Link from 'next/link';
import { LedgerInput } from '@/components/addie/shared/LedgerInput';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

interface ContactSalesFormProps {
  readonly calendlyUrl?: string | undefined;
}

interface FieldErrors {
  fi_name?: string;
  fi_type?: string;
  asset_size?: string;
  seats?: string;
  timeline?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  _form?: string;
}

const FI_TYPES = [
  { v: 'community_bank', l: 'Community bank' },
  { v: 'credit_union', l: 'Credit union' },
  { v: 'consulting_firm', l: 'Consulting firm' },
  { v: 'other', l: 'Other' },
] as const;

const ASSET_SIZES = [
  { v: 'under_500m', l: 'Under $500M' },
  { v: '500m_to_1b', l: '$500M – $1B' },
  { v: '1b_to_5b', l: '$1B – $5B' },
  { v: '5b_to_10b', l: '$5B – $10B' },
  { v: 'over_10b', l: 'Over $10B' },
  { v: 'na', l: 'Not applicable' },
] as const;

const TIMELINES = [
  { v: 'this_quarter', l: 'This quarter' },
  { v: 'next_quarter', l: 'Next quarter' },
  { v: 'exploring', l: 'Exploring' },
  { v: 'not_yet', l: 'Not yet' },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SELECT_BASE =
  'block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] ' +
  'rounded-[2px] px-3 py-2 min-h-[44px] text-[var(--ledger-ink)] ' +
  'transition-colors duration-[120ms] focus:outline-none focus:border-[var(--ledger-ink)] ' +
  'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]';

const TEXTAREA_BASE =
  'block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] ' +
  'rounded-[2px] px-3 py-2 min-h-[110px] text-[var(--ledger-ink)] ' +
  'placeholder:text-[var(--ledger-muted)] ' +
  'transition-colors duration-[120ms] focus:outline-none focus:border-[var(--ledger-ink)] ' +
  'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]';

const LABEL_BASE =
  'block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2';

export function ContactSalesForm({ calendlyUrl }: ContactSalesFormProps) {
  const id = useId();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [fiName, setFiName] = useState('');
  const [fiType, setFiType] = useState<string>('');
  const [assetSize, setAssetSize] = useState<string>('');
  const [seats, setSeats] = useState<string>('10');
  const [timeline, setTimeline] = useState<string>('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!fiName.trim()) e.fi_name = 'Institution name is required.';
    if (!fiType) e.fi_type = 'Pick an institution type.';
    if (!assetSize) e.asset_size = 'Pick an asset-size band.';
    const seatsNum = Number(seats);
    if (!Number.isInteger(seatsNum) || seatsNum < 1) {
      e.seats = 'Enter a whole number (1 or more).';
    }
    if (!timeline) e.timeline = 'Pick a timeline.';
    if (!contactName.trim()) e.contact_name = 'Your name is required.';
    if (!email.trim() || !EMAIL_RE.test(email.trim())) e.email = 'A valid work email is required.';
    return e;
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/addie/contact-sales', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fi_name: fiName.trim(),
          fi_type: fiType,
          asset_size: assetSize,
          seats: Number(seats),
          timeline,
          contact_name: contactName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      if (res.status === 429) {
        setErrors({ _form: 'Too many submissions from this network. Please try again in an hour or email us directly.' });
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: { field: string; message: string }[];
        };
        if (data.issues) {
          const next: FieldErrors = {};
          for (const issue of data.issues) {
            (next as Record<string, string>)[issue.field] = issue.message;
          }
          setErrors(next);
          return;
        }
        setErrors({ _form: 'Something went wrong on our end. Please try again or email us directly.' });
        return;
      }
      setSubmitted(true);
    } catch {
      setErrors({ _form: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-[3px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-8 sm:p-10"
        role="status"
        aria-live="polite"
      >
        <KickerLabel tone="accent">Received</KickerLabel>
        <h2 className="mt-4 font-serif text-[2rem] sm:text-[2.5rem] leading-[1.1] tracking-[-0.01em] text-[var(--ledger-ink)]">
          Thank you. We will be in touch within one business day.
        </h2>
        <p className="mt-5 text-[var(--ledger-ink-2)] leading-[1.6]">
          Your note is on the desk of a human, not a queue. You will hear
          back from someone at the Institute by the next business
          morning with next steps and a short scoping call invite.
        </p>
        {calendlyUrl ? (
          <div className="mt-7 pt-6 border-t border-[var(--ledger-rule)]">
            <KickerLabel>Or skip the back-and-forth</KickerLabel>
            <p className="mt-3 text-[var(--ledger-ink-2)] leading-[1.6]">
              Pick a time on the calendar and we will come prepared.
            </p>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[2px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms]"
            >
              Pick a time on the calendar
              <span aria-hidden>→</span>
            </a>
          </div>
        ) : (
          <p className="mt-7 pt-6 border-t border-[var(--ledger-rule)] text-sm text-[var(--ledger-muted)]">
            A calendar link will be in your reply email.
          </p>
        )}
        <div className="mt-7 pt-6 border-t border-[var(--ledger-rule)] flex flex-wrap gap-4">
          <Link
            href="/foundation/for-community-banks"
            className="font-mono uppercase tracking-[0.14em] text-xs text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
          >
            ← Back to overview
          </Link>
          <Link
            href="/foundation"
            className="font-mono uppercase tracking-[0.14em] text-xs text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
          >
            See the course →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[3px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-7 sm:p-9 space-y-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <LedgerInput
          label="Institution name"
          value={fiName}
          onChange={(e) => setFiName(e.target.value)}
          autoComplete="organization"
          required
          error={errors.fi_name ?? null}
        />
        <div>
          <label htmlFor={`${id}-fi-type`} className={LABEL_BASE}>
            Institution type
          </label>
          <select
            id={`${id}-fi-type`}
            value={fiType}
            onChange={(e) => setFiType(e.target.value)}
            className={SELECT_BASE}
            required
            aria-invalid={errors.fi_type ? true : undefined}
          >
            <option value="">— Select —</option>
            {FI_TYPES.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
          {errors.fi_type ? (
            <p role="alert" className="mt-2 text-sm text-[var(--ledger-weak)]">
              {errors.fi_type}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-asset-size`} className={LABEL_BASE}>
            Asset size
          </label>
          <select
            id={`${id}-asset-size`}
            value={assetSize}
            onChange={(e) => setAssetSize(e.target.value)}
            className={SELECT_BASE}
            required
            aria-invalid={errors.asset_size ? true : undefined}
          >
            <option value="">— Select —</option>
            {ASSET_SIZES.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
          {errors.asset_size ? (
            <p role="alert" className="mt-2 text-sm text-[var(--ledger-weak)]">
              {errors.asset_size}
            </p>
          ) : null}
        </div>
        <LedgerInput
          label="Estimated seats"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          required
          help="Team SKU minimum is 10. Estimate is fine — we can refine in scoping."
          error={errors.seats ?? null}
        />
      </div>

      <div>
        <label htmlFor={`${id}-timeline`} className={LABEL_BASE}>
          Timeline
        </label>
        <select
          id={`${id}-timeline`}
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          className={SELECT_BASE}
          required
          aria-invalid={errors.timeline ? true : undefined}
        >
          <option value="">— Select —</option>
          {TIMELINES.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        {errors.timeline ? (
          <p role="alert" className="mt-2 text-sm text-[var(--ledger-weak)]">
            {errors.timeline}
          </p>
        ) : null}
      </div>

      <hr className="border-t border-[var(--ledger-rule)]" />

      <div className="grid gap-6 sm:grid-cols-2">
        <LedgerInput
          label="Your name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          autoComplete="name"
          required
          error={errors.contact_name ?? null}
        />
        <LedgerInput
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          error={errors.email ?? null}
        />
      </div>

      <LedgerInput
        label="Phone (optional)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
        error={errors.phone ?? null}
      />

      <div>
        <label htmlFor={`${id}-notes`} className={LABEL_BASE}>
          Notes (optional)
        </label>
        <textarea
          id={`${id}-notes`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={TEXTAREA_BASE}
          placeholder="Anything we should know before the call — current vendors, governance posture, target launch date."
          maxLength={2000}
          aria-invalid={errors.notes ? true : undefined}
        />
        {errors.notes ? (
          <p role="alert" className="mt-2 text-sm text-[var(--ledger-weak)]">
            {errors.notes}
          </p>
        ) : null}
      </div>

      {errors._form ? (
        <p role="alert" className="text-sm text-[var(--ledger-weak)]">
          {errors._form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <LedgerButton type="submit" variant="primary" size="lg" loading={submitting} disabled={submitting}>
          {submitting ? 'Sending…' : 'Send to the team'}
        </LedgerButton>
        <p className="text-sm text-[var(--ledger-muted)]">
          We reply within one business day. Your details are not sold or shared.
        </p>
      </div>
    </form>
  );
}
