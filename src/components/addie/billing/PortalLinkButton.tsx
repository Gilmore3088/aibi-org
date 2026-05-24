'use client';

// PortalLinkButton — opens a Stripe Customer Portal session in a new tab.
// Posts to /api/addie/billing/portal-session, then follows the returned URL.
// Surfaces failures inline rather than silently swallowing them.

import { useState } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface PortalLinkButtonProps {
  readonly label?: string;
  readonly variant?: 'primary' | 'secondary' | 'tertiary';
}

export function PortalLinkButton({
  label = 'Manage payment method →',
  variant = 'primary',
}: PortalLinkButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/addie/billing/portal-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        const reason = json.error ?? `HTTP ${res.status}`;
        setError(
          reason === 'no_stripe_customer'
            ? 'No Stripe customer is associated with this account yet.'
            : `Could not open the portal (${reason}).`,
        );
        return;
      }
      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <LedgerButton variant={variant} size="md" onClick={open} disabled={busy}>
        {busy ? 'Opening…' : label}
      </LedgerButton>
      {error ? (
        <p className="mt-2 text-sm text-[var(--ledger-weak)]">{error}</p>
      ) : null}
    </div>
  );
}
