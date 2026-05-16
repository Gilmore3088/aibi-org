'use client';

// Client component for the /assessment/in-depth "Buy now" CTA.
// Calls /api/checkout/in-depth and redirects to the returned Stripe URL.
//
// Email pre-fill: passes user_email so Stripe Checkout opens with the
// email pre-filled and the buyer doesn't have to type it again. Sources,
// in priority order:
//   1. userEmail prop (set server-side from supabase.auth.getUser())
//   2. localStorage 'aibi-user' (set when the buyer captured email on the
//      free 12-question assessment's EmailGate)
// Falls back to no pre-fill silently if neither is available.

import { useState } from 'react';
import { trackPurchaseInitiated } from '@/lib/analytics/events';

interface PurchaseButtonProps {
  readonly userEmail?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readLocalEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('aibi-user');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: unknown };
    if (typeof parsed.email === 'string' && EMAIL_RE.test(parsed.email)) {
      return parsed.email;
    }
  } catch {
    /* malformed JSON — ignore */
  }
  return null;
}

export function PurchaseButton({ userEmail }: PurchaseButtonProps = {}): React.ReactElement {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(): Promise<void> {
    setPending(true);
    setError(null);
    trackPurchaseInitiated({ product: 'in-depth-assessment', mode: 'individual' });

    const emailToPass = userEmail ?? readLocalEmail() ?? undefined;

    try {
      const response = await fetch('/api/checkout/in-depth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'individual',
          ...(emailToPass ? { user_email: emailToPass } : {}),
        }),
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
