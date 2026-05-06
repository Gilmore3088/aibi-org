'use client';

// BuyForMyTeamCard — institution-volume $79/seat × N (min 10).
// Posts to /api/create-checkout with product=indepth-assessment, mode=institution.

import { useState, type FormEvent } from 'react';

interface CheckoutResponse {
  url?: string;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRICE_PER_SEAT = 79;
const MIN_SEATS = 10;

interface BuyForMyTeamCardProps {
  readonly defaultEmail?: string | null;
}

export default function BuyForMyTeamCard({
  defaultEmail,
}: BuyForMyTeamCardProps = {}) {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [institution, setInstitution] = useState('');
  const [quantity, setQuantity] = useState<number>(MIN_SEATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = quantity * PRICE_PER_SEAT;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (institution.trim().length === 0) {
      setError('Please enter your institution name.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < MIN_SEATS) {
      setError(`Team purchases require at least ${MIN_SEATS} seats.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'indepth-assessment',
          mode: 'institution',
          leader_email: email.trim(),
          institution_name: institution.trim(),
          quantity,
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
        Institution
      </p>
      <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-2">
        Buy for my team
      </h3>
      <p className="font-mono text-sm text-[color:var(--color-slate)] tabular-nums mb-5">
        $79 / seat &middot; minimum 10 seats
      </p>
      <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed mb-6">
        Map your team&rsquo;s readiness across all eight dimensions. Individual
        responses stay private; you receive an aggregate report with patterns
        and anonymized distributions.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-auto" noValidate>
        <div>
          <label
            htmlFor="indepth-team-email"
            className="block font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/70 mb-2"
          >
            Your email (the leader&rsquo;s email)
          </label>
          <input
            id="indepth-team-email"
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

        <div>
          <label
            htmlFor="indepth-team-institution"
            className="block font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/70 mb-2"
          >
            Institution name
          </label>
          <input
            id="indepth-team-institution"
            type="text"
            required
            autoComplete="organization"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="First Community Bank"
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-[2px] border border-[color:var(--color-ink)]/20 bg-[color:var(--color-linen)] font-sans text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:border-transparent disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="indepth-team-quantity"
            className="block font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/70 mb-2"
          >
            Number of seats
          </label>
          <input
            id="indepth-team-quantity"
            type="number"
            required
            min={MIN_SEATS}
            step={1}
            value={quantity}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              setQuantity(Number.isFinite(next) ? next : MIN_SEATS);
            }}
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-[2px] border border-[color:var(--color-ink)]/20 bg-[color:var(--color-linen)] font-mono text-sm tabular-nums text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:border-transparent disabled:opacity-60"
          />
          <p className="mt-2 font-mono text-[12px] tabular-nums text-[color:var(--color-slate)]">
            {quantity} &times; ${PRICE_PER_SEAT} = ${total}
          </p>
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
          {loading ? 'Redirecting to checkout…' : `Buy for my team — $${total}`}
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
