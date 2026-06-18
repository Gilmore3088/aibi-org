'use client';

import { useState } from 'react';
import { trackPurchaseInitiated } from '@/lib/analytics/events';
import { TEAM_ASSESSMENT_MIN_SEATS } from '@/lib/team-assessment/constants';

interface CheckoutResponse {
  readonly url?: string;
  readonly error?: string;
}

export function TeamCheckoutForm(): JSX.Element {
  const [institutionName, setInstitutionName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [quantity, setQuantity] = useState(TEAM_ASSESSMENT_MIN_SEATS);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<void> {
    setPending(true);
    setError(null);
    trackPurchaseInitiated({ product: 'team-assessment', mode: 'institution' });

    try {
      const response = await fetch('/api/checkout/team-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_name: institutionName,
          buyer_email: buyerEmail,
          quantity,
        }),
      });
      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok || !data.url) {
        setError(data.error ?? 'Could not start checkout.');
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
    <div className="team-checkout" aria-label="Start team assessment checkout">
      <div className="team-checkout-head">
        <p className="team-checkout-k">Start checkout</p>
        <p>Creates the admin dashboard and one participant link.</p>
      </div>
      <label>
        Institution
        <input
          value={institutionName}
          onChange={(event) => setInstitutionName(event.target.value)}
          placeholder="First Community Bank"
        />
      </label>
      <label>
        Buyer email
        <input
          value={buyerEmail}
          onChange={(event) => setBuyerEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="leader@institution.com"
        />
      </label>
      <label>
        Seats
        <input
          value={quantity}
          onChange={(event) => setQuantity(Number.parseInt(event.target.value, 10) || 0)}
          type="number"
          min={TEAM_ASSESSMENT_MIN_SEATS}
          step={1}
        />
      </label>
      {error && <p role="alert" className="team-checkout-error">{error}</p>}
      <button type="button" disabled={pending} onClick={submit}>
        {pending ? 'Starting checkout...' : 'Start secure checkout'}
      </button>
      <p className="team-checkout-note">
        {TEAM_ASSESSMENT_MIN_SEATS}+ seats. Aggregate report unlocks at 10
        completed responses.
      </p>

      <style jsx>{`
        .team-checkout {
          display: grid;
          gap: 16px;
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 24px 70px rgba(7, 26, 47, 0.1);
        }
        .team-checkout-head {
          display: grid;
          gap: 4px;
        }
        .team-checkout-k {
          margin: 0;
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .team-checkout-head p:last-child {
          margin: 0;
          color: var(--slate-600);
          font-size: 14px;
          line-height: 1.45;
        }
        label {
          display: grid;
          gap: 8px;
          color: var(--ink);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        input {
          width: 100%;
          border: 1px solid var(--ink-a15);
          border-radius: 12px;
          background: var(--cream);
          color: var(--ink);
          font: 600 16px/1.3 Inter, ui-sans-serif, system-ui, sans-serif;
          letter-spacing: 0;
          padding: 14px;
          text-transform: none;
        }
        input:focus {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }
        button {
          min-height: 52px;
          border: 0;
          border-radius: 12px;
          background: var(--ink);
          color: var(--cream);
          padding: 0 20px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .team-checkout-error {
          margin: 0;
          color: #9b2226;
          font-size: 14px;
          font-weight: 700;
        }
        .team-checkout-note {
          margin: 0;
          color: var(--slate-600);
          font-size: 13px;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}
