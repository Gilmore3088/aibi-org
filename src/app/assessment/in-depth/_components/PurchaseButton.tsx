'use client';

// Client component for the /assessment/in-depth "Buy now" CTA.
// Calls /api/checkout/in-depth and redirects to the returned Stripe URL.

import { useState } from 'react';
import { trackPurchaseInitiated } from '@/lib/analytics/events';

export function PurchaseButton(): React.ReactElement {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(): Promise<void> {
    setPending(true);
    setError(null);
    trackPurchaseInitiated({ product: 'in-depth-assessment', mode: 'individual' });
    try {
      const response = await fetch('/api/checkout/in-depth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'individual' }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? 'Could not start checkout. Please try again.');
        setPending(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-block bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-8 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-terra-light)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-fit"
      >
        {pending ? 'Starting checkout…' : 'Buy now — $99'}
      </button>
      {error && (
        <p className="text-sm text-[color:var(--color-error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
