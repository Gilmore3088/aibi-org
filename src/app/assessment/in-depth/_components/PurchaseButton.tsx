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
//
// Used in three surfaces on /assessment/in-depth — hero, recommended card,
// and bottom compare table — so label and size are configurable.

import { useState } from 'react';
import { trackPurchaseInitiated } from '@/lib/analytics/events';

type Size = 'card' | 'hero' | 'compact';

interface PurchaseButtonProps {
  readonly userEmail?: string;
  readonly label?: string;
  readonly pendingLabel?: string;
  readonly size?: Size;
  readonly className?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SIZE_CLASS: Record<Size, string> = {
  card: 'px-8 py-3 text-[10px]',
  hero: 'px-10 py-4 text-[11px]',
  compact: 'px-5 py-3 text-[10px]',
};

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

export function PurchaseButton({
  userEmail,
  label = 'Buy now — $99',
  pendingLabel = 'Starting checkout…',
  size = 'card',
  className = '',
}: PurchaseButtonProps = {}): React.ReactElement {
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
    <div className={`flex flex-col gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`inline-flex items-center justify-center bg-[color:var(--gold)] text-[color:var(--cream)] rounded-sm font-mono uppercase tracking-[0.15em] hover:bg-[color:var(--gold-2)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-fit ${SIZE_CLASS[size]}`}
      >
        {pending ? pendingLabel : label}
      </button>
      {error && (
        <p className="text-sm text-[color:#9b2226]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
