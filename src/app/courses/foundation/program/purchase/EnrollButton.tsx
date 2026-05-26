'use client';

// EnrollButton — wires the "Enroll · $295" CTA to /api/create-checkout.
//
// 2026-05-26: removed the signin wall. Forced account creation before
// payment is a documented checkout killer; Stripe collects the
// customer's email at checkout and the webhook handler
// (src/lib/stripe/provision-enrollment.ts:91) provisions the
// enrollment row by that email. If the buyer signs up later with the
// same address, the user_id binds to their pre-existing enrollment.
//
// userEmail is now an optional pre-fill (when the buyer is already
// signed in) — never a gate.

import { useState } from 'react';
import { trackPurchaseInitiated } from '@/lib/analytics/events';

interface EnrollButtonProps {
  /** Optional pre-fill for Stripe's customer_email field. */
  userEmail?: string;
}

interface CheckoutResponse {
  url?: string;
  error?: string;
}

export function EnrollButton({ userEmail }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    setLoading(true);
    setError(null);
    trackPurchaseInitiated({ product: 'foundation', mode: 'individual' });

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'individual',
          ...(userEmail ? { user_email: userEmail } : {}),
        }),
      });

      const data = (await res.json()) as CheckoutResponse;

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleEnroll}
        disabled={loading}
        aria-disabled={loading}
        className={[
          'w-full px-8 py-4 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2',
          loading
            ? 'bg-[color:var(--gold)]/60 text-[color:var(--cream)]/70 cursor-wait'
            : 'bg-[color:var(--gold)] text-[color:var(--cream)] hover:bg-[color:var(--gold-2)] cursor-pointer',
        ].join(' ')}
      >
        {loading ? 'Redirecting to checkout…' : 'Enroll · $295'}
      </button>

      {!userEmail && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--slate-500)] text-center">
          Stripe collects your email at checkout · no account required to enroll
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 font-mono text-[11px] text-[color:var(--gold-deep)] text-center"
        >
          {error}
        </p>
      )}
    </div>
  );
}
