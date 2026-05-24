'use client';

// InviteSeatsForm — multi-email input with dedup, validation, and budget gate.
// Calls /api/addie/team/seats/invite. PRD §6.7.

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface InviteSeatsFormProps {
  readonly teamId: string;
  readonly remainingSeats: number;
}

// Match the server-side validator (lib/addie/supabase/service.ts). Keep in sync.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ParseResult {
  readonly valid: string[];
  readonly invalid: string[];
  readonly duplicates: string[];
}

/** Exported for unit tests. Splits on commas, semicolons, whitespace, newlines. */
export function parseEmails(raw: string): ParseResult {
  const parts = raw
    .split(/[\s,;]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];

  for (const part of parts) {
    const normalized = part.toLowerCase();
    if (!EMAIL_RE.test(part) || part.length > 254) {
      invalid.push(part);
      continue;
    }
    if (seen.has(normalized)) {
      duplicates.push(part);
      continue;
    }
    seen.add(normalized);
    valid.push(normalized);
  }

  return { valid, invalid, duplicates };
}

export function InviteSeatsForm({ teamId, remainingSeats }: InviteSeatsFormProps) {
  const [raw, setRaw] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const parsed = useMemo(() => parseEmails(raw), [raw]);
  const exceedsBudget = parsed.valid.length > remainingSeats;
  const canSubmit =
    parsed.valid.length > 0 &&
    !exceedsBudget &&
    !isSubmitting &&
    remainingSeats > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/addie/team/seats/invite', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, emails: parsed.valid }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          detail?: string;
          error?: string;
        };
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      const body = (await res.json()) as {
        invited: { email: string }[];
        skipped: { email: string; reason: string }[];
      };
      const invitedCount = body.invited?.length ?? 0;
      const skippedCount = body.skipped?.length ?? 0;
      setSuccess(
        `${invitedCount} invitation${invitedCount === 1 ? '' : 's'} sent` +
          (skippedCount > 0 ? ` · ${skippedCount} skipped` : ''),
      );
      setRaw('');
      startTransition(() => router.refresh());
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="invite-emails"
          className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2"
        >
          INVITE TEAM MEMBERS
        </label>
        <textarea
          id="invite-emails"
          name="emails"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={4}
          placeholder="one.banker@example.com, two@example.com&#10;three@example.com"
          className={
            'block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] ' +
            'rounded-[2px] px-3 py-2 text-[var(--ledger-ink)] ' +
            'placeholder:text-[var(--ledger-muted)] ' +
            'transition-colors duration-[120ms] font-mono text-sm ' +
            'focus:outline-none focus:border-[var(--ledger-ink)] ' +
            'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]'
          }
          aria-describedby="invite-help"
        />
        <p id="invite-help" className="mt-2 text-xs text-[var(--ledger-muted)]">
          Comma, semicolon, space, or newline-separated. Duplicates and
          invalid addresses are filtered before sending.
        </p>
      </div>

      <SummaryLine parsed={parsed} remaining={remainingSeats} exceeds={exceedsBudget} />

      {submitError ? (
        <p role="alert" className="text-sm text-[var(--ledger-weak)]">
          {submitError}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-[var(--ledger-ink-2)]">
          {success}
        </p>
      ) : null}

      <LedgerButton
        type="submit"
        variant="primary"
        size="md"
        disabled={!canSubmit}
        loading={isSubmitting || pending}
      >
        {`SEND ${parsed.valid.length || ''} INVITE${parsed.valid.length === 1 ? '' : 'S'}`.trim()}
      </LedgerButton>
    </form>
  );
}

interface SummaryLineProps {
  readonly parsed: ParseResult;
  readonly remaining: number;
  readonly exceeds: boolean;
}

function SummaryLine({ parsed, remaining, exceeds }: SummaryLineProps) {
  return (
    <div className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums space-y-1">
      <div>
        <span className="text-[var(--ledger-ink-2)]">{parsed.valid.length}</span> valid ·{' '}
        {parsed.invalid.length > 0 ? (
          <>
            <span className="text-[var(--ledger-weak)]">{parsed.invalid.length}</span> invalid ·{' '}
          </>
        ) : null}
        {parsed.duplicates.length > 0 ? (
          <>
            <span className="text-[var(--ledger-muted)]">{parsed.duplicates.length}</span> duplicate
            {parsed.duplicates.length === 1 ? '' : 's'} ·{' '}
          </>
        ) : null}
        <span data-budget-remaining={remaining}>{remaining}</span> seats remaining
      </div>
      {exceeds ? (
        <p role="alert" className="text-[var(--ledger-weak)]">
          Selection exceeds available seats. Reduce the list or buy more seats.
        </p>
      ) : null}
    </div>
  );
}
