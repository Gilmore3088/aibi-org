'use client';

// When the buyer hits /assessment/in-depth on a shared device, localStorage
// may hold identity captured by someone else at the free EmailGate. That
// stale identity then rides forward into Stripe Checkout (email pre-fill)
// and the post-payment signup URL. This banner surfaces the active
// identity so the next visitor can spot the leak and start fresh.
//
// Visible only when local identity exists. Clearing wipes the
// localStorage `aibi-user` key entirely — score / readiness history goes
// with it. The buyer can always retake the free assessment to rebuild.

import { useEffect, useState } from 'react';

interface LocalIdentitySnapshot {
  readonly email: string | null;
  readonly fullName: string | null;
  readonly institutionName: string | null;
}

const STORAGE_KEY = 'aibi-user';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readIdentity(): LocalIdentitySnapshot {
  if (typeof window === 'undefined') {
    return { email: null, fullName: null, institutionName: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { email: null, fullName: null, institutionName: null };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const stringField = (key: string): string | null => {
      const value = parsed[key];
      return typeof value === 'string' && value.length > 0 ? value : null;
    };
    const email = stringField('email');
    return {
      email: email && EMAIL_RE.test(email) ? email : null,
      // Reads both `fullName` (new) and `firstName` (legacy) keys for
      // backward compatibility with localStorage written before the
      // EmailGate field rename.
      fullName: stringField('fullName') ?? stringField('firstName'),
      institutionName: stringField('institutionName'),
    };
  } catch {
    return { email: null, fullName: null, institutionName: null };
  }
}

export function IdentityFreshnessBanner(): React.ReactElement | null {
  const [identity, setIdentity] = useState<LocalIdentitySnapshot>({
    email: null,
    fullName: null,
    institutionName: null,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIdentity(readIdentity());
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!identity.email && !identity.fullName && !identity.institutionName) {
    return null;
  }

  const handleClear = (): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem('aibi-signup-prefill');
      window.sessionStorage.removeItem('aibi-assessment');
    } catch {
      /* ignore */
    }
    setIdentity({ email: null, fullName: null, institutionName: null });
  };

  // Display label — prefer the name, fall back to email, never both
  // (avoid feeling like a re-pitch of every captured field).
  const displayLabel = identity.fullName ?? identity.email ?? 'Someone';
  const displayInstitution = identity.institutionName;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] rounded-[2px] px-5 py-3 mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/80">
        Reading as{' '}
        <span className="text-[color:var(--color-ink)]">{displayLabel}</span>
        {displayInstitution ? (
          <>
            {' · '}
            <span className="text-[color:var(--color-ink)]">
              {displayInstitution}
            </span>
          </>
        ) : null}
      </p>
      <button
        type="button"
        onClick={handleClear}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] hover:text-[color:var(--color-ink)] underline underline-offset-4 decoration-[color:var(--color-terra)]/40 hover:decoration-[color:var(--color-ink)]/40 transition-colors"
      >
        Not you? Start fresh →
      </button>
    </div>
  );
}
