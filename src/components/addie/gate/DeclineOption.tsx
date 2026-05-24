'use client';

// DeclineOption — the "Maybe later" door. Routes to the $99 In-Depth
// Readiness Assessment via /api/addie/checkout/assessment.
//
// Audit A22 (2026-05-24): the audit's Tommy persona walked the Decline
// path and found no nurture address captured — the Day-11 follow-up
// email assumed an address the path never collected. Now the option
// surfaces an optional "remind me in a few weeks" field that POSTs to
// /api/addie/gate/decline with the email; the existing decline-logging
// route forwards the address to MailerLite when present so the
// nurture sequence has somewhere to land.

import { useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export function DeclineOption() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminderEmail, setReminderEmail] = useState('');

  async function decline() {
    setPending(true);
    setError(null);
    try {
      // 1. Log the decline so the funnel attributes the fork correctly.
      //    Pass the optional reminder address — the API can forward it
      //    to MailerLite for the Day-11 nurture if provided.
      await fetch('/api/addie/gate/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remindEmail: reminderEmail.trim() || undefined,
        }),
      }).catch(() => {
        /* best-effort */
      });
      // 2. Send the learner into the $99 In-Depth assessment checkout.
      const res = await fetch('/api/addie/checkout/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        setError(body.message ?? body.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError('Checkout returned no redirect URL.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setPending(false);
    }
  }

  return (
    <LedgerCard className="p-6 flex flex-col h-full">
      <KickerLabel tone="muted">Maybe later</KickerLabel>
      <h2 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">
        Find out where you stand
      </h2>
      <p className="mt-3 text-sm text-[var(--ledger-ink-2)] flex-1">
        The $99 Readiness Assessment scores 48 questions across 8 dimensions and returns four
        deliverables: scorecard, plan, ideas + prompts, and next-step CTAs.
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--ledger-weak)]">{error}</p>
      ) : null}
      {/* A22 (audit 2026-05-24): optional remind-me address. Captures
          to MailerLite for the Day-11 nurture so the Decline path is
          not a black hole. Skip to walk away clean. */}
      <div className="mt-4">
        <label
          htmlFor="decline-remind-email"
          className="block font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-1"
        >
          Optional · remind me in a few weeks
        </label>
        <input
          id="decline-remind-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@yourbank.com"
          value={reminderEmail}
          onChange={(e) => setReminderEmail(e.target.value)}
          disabled={pending}
          className="w-full px-3 py-2 text-sm bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] rounded-[2px] focus:outline-none focus:border-[var(--ledger-ink)]"
        />
        <p className="mt-1 text-[11px] text-[var(--ledger-muted)] leading-snug">
          One email in ~11 days. No marketing. Leave blank to walk away clean.
        </p>
      </div>
      <div className="mt-4">
        <LedgerButton variant="secondary" onClick={decline} loading={pending} disabled={pending}>
          Take the assessment · $99
        </LedgerButton>
      </div>
    </LedgerCard>
  );
}
