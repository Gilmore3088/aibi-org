'use client';

// BuyForMyselfCard — single-seat $99 In-Depth Assessment purchase.
// Posts to /api/create-checkout with product=indepth-assessment, mode=individual.

import { useState, type FormEvent } from 'react';

interface CheckoutResponse {
  url?: string;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BuyForMyselfCardProps {
  readonly defaultEmail?: string | null;
}

export default function BuyForMyselfCard({ defaultEmail }: BuyForMyselfCardProps = {}) {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'indepth-assessment',
          mode: 'individual',
          leader_email: email.trim(),
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
    <article className="rounded-[3px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-6 md:p-8 flex flex-col">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
        Individual
      </p>
      <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-2">
        Buy for myself
      </h3>
      <p className="font-mono text-sm text-[color:var(--color-slate)] tabular-nums mb-5">
        $99 &middot; one seat
      </p>
      <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed mb-6">
        Take the full diagnostic yourself. Receive your eight-dimension breakdown
        and a 30-day action plan keyed to your weakest dimensions.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-auto" noValidate>
        <div>
          <label
            htmlFor="indepth-individual-email"
            className="block font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/70 mb-2"
          >
            Your email
          </label>
          <input
            id="indepth-individual-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbank.com"
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-[2px] border border-[color:var(--color-ink)]/20 bg-[color:var(--color-linen)] font-sans text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:border-transparent disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          className={[
            'w-full px-6 py-3 rounded-[2px] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2',
            loading
              ? 'bg-[color:var(--color-terra)]/60 text-[color:var(--color-linen)]/70 cursor-wait'
              : 'bg-[color:var(--color-terra)] text-[color:var(--color-linen)] hover:bg-[color:var(--color-terra-light)] cursor-pointer',
          ].join(' ')}
        >
          {loading ? 'Redirecting to checkout…' : 'Buy for myself — $99'}
        </button>

        {error && (
          <p
            role="alert"
            className="font-mono text-[11px] text-[color:var(--color-error)]"
          >
            {error}
          </p>
        )}
      </form>
    </article>
  );
}
