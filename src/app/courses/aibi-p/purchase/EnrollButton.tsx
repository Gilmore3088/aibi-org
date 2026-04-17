'use client';

// EnrollButton — wires the "Enroll Now" CTA to /api/create-checkout.
// Shows sign-in prompt for unauthenticated visitors.
// Handles loading and error states inline.

import Link from 'next/link';
import { useState } from 'react';

interface EnrollButtonProps {
  userEmail?: string;
}

interface CheckoutResponse {
  url?: string;
  error?: string;
}

export function EnrollButton({ userEmail }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userEmail) {
    return (
      <div className="text-center">
        <p className="font-mono text-[11px] text-[color:var(--color-slate)] mb-3">
          You must be signed in to enroll.
        </p>
        <Link
          href="/auth/login?next=/courses/aibi-p/purchase"
          className="inline-block w-full bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-8 py-4 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] text-center hover:bg-[color:var(--color-terra-light)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
        >
          Sign in to enroll
        </Link>
      </div>
    );
  }

  async function handleEnroll() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'individual', user_email: userEmail }),
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
          'focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2',
          loading
            ? 'bg-[color:var(--color-terra)]/60 text-[color:var(--color-linen)]/70 cursor-wait'
            : 'bg-[color:var(--color-terra)] text-[color:var(--color-linen)] hover:bg-[color:var(--color-terra-light)] cursor-pointer',
        ].join(' ')}
      >
        {loading ? 'Redirecting to checkout\u2026' : 'Enroll Now \u2014 $79'}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 font-mono text-[11px] text-[color:var(--color-error)] text-center"
        >
          {error}
        </p>
      )}
    </div>
  );
}
