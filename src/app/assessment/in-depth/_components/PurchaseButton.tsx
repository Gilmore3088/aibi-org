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
import { EMAIL_RE } from '@/lib/email/validate';

type Size = 'card' | 'hero' | 'compact';

interface PurchaseButtonProps {
  readonly userEmail?: string;
  readonly label?: string;
  readonly pendingLabel?: string;
  readonly size?: Size;
  readonly className?: string;
}


// Inline-style size map — mockup-system pill buttons with consistent
// padding + font scale across hero / card / compact surfaces.
const SIZE_STYLE: Record<Size, React.CSSProperties> = {
  card: { padding: '14px 26px', fontSize: '0.8125rem' },
  hero: { padding: '16px 32px', fontSize: '0.875rem' },
  compact: { padding: '12px 22px', fontSize: '0.75rem' },
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
        className="inline-flex items-center justify-center w-fit"
        style={{
          background: 'var(--gold)',
          color: 'var(--ink)',
          borderRadius: 12,
          border: 'none',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.6 : 1,
          transition: 'background-color 120ms',
          ...SIZE_STYLE[size],
        }}
        onMouseEnter={(e) => {
          if (!pending) e.currentTarget.style.background = 'var(--gold-2)';
        }}
        onMouseLeave={(e) => {
          if (!pending) e.currentTarget.style.background = 'var(--gold)';
        }}
      >
        {pending ? pendingLabel : label}
      </button>
      <p
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: '0.75rem',
          lineHeight: 1.4,
          color: 'var(--slate-500)',
          margin: 0,
          maxWidth: 320,
        }}
      >
        7-day refund if unused: assessment not submitted and no report generated.
      </p>
      {error && (
        <p
          role="alert"
          style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '0.875rem',
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
