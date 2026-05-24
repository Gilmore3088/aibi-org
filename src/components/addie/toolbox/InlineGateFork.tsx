'use client';

// InlineGateFork — compact, inline three-way fork rendered under
// SaveAsArtifactButton when the learner has no identity (lead nor
// authenticated user). Mirrors GateScreen's voice without sending the
// learner away from the lesson:
//   - Email-to-keep  → POSTs /api/addie/gate/capture-email inline
//   - Pay $295       → routes to /foundation/gate (full pay flow)
//   - Decline · $99  → routes to /foundation/gate#assessment
//
// The full gate fork lives at /foundation/gate; we link there for the
// commerce-driven doors so the learner sees full terms before any
// payment / route change. The email door is captured in-place since
// that is what allows the save they were trying to make.

import { useState } from 'react';
import Link from 'next/link';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerInput } from '@/components/addie/shared/LedgerInput';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

interface InlineGateForkProps {
  /** Called when the learner has successfully captured an email and we should retry the save. */
  readonly onRetry?: () => void;
  readonly onDismiss?: () => void;
}

export function InlineGateFork({ onRetry, onDismiss }: InlineGateForkProps) {
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || captured) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/addie/gate/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, marketing_opt_in: optIn }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }
      setCaptured(true);
      // Give the cookie a tick to settle, then retry the original save.
      setTimeout(() => onRetry?.(), 250);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
    } finally {
      setPending(false);
    }
  }

  if (captured) {
    return (
      <div className="border-l-[2px] border-l-[var(--ledger-ink)] bg-[var(--ledger-paper)] px-3 py-2">
        <p className="text-sm text-[var(--ledger-ink)]">
          Email saved. Saving your artifact…
        </p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Saving requires an identity"
      className="border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] rounded-[3px] p-4 space-y-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <KickerLabel tone="accent">Pick one to save</KickerLabel>
          <p className="mt-1 text-sm text-[var(--ledger-ink)]">
            Every save is tied to a person. Add an email, pay for the full course,
            or take the $99 Readiness Assessment.
          </p>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] min-h-[44px] px-2"
          >
            Close
          </button>
        ) : null}
      </header>

      <form onSubmit={submit} className="space-y-3">
        <LedgerInput
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={error}
        />
        <label className="flex items-start gap-2 text-xs text-[var(--ledger-ink-2)]">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-1"
          />
          <span>Send me the AI Banking Brief (monthly, unsubscribe any time).</span>
        </label>
        <LedgerButton type="submit" variant="primary" size="sm" loading={pending} disabled={pending}>
          Save with email
        </LedgerButton>
      </form>

      <div className="border-t border-[var(--ledger-rule)] pt-3 grid gap-2 sm:grid-cols-2">
        <Link href="/foundation/gate" className="block">
          <LedgerButton variant="secondary" size="sm" className="w-full">
            Pay $295 · keep everything
          </LedgerButton>
        </Link>
        <Link href="/foundation/gate#assessment" className="block">
          <LedgerButton variant="tertiary" size="sm" className="w-full">
            Take the $99 assessment
          </LedgerButton>
        </Link>
      </div>
    </div>
  );
}
