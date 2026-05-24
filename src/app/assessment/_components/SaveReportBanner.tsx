'use client';

// "Save this report to your account" banner on the results surface.
// Renders only when the visitor is NOT signed in. Pushes them to
// /auth/signup with email + name + institution prefilled via the
// IdentityHandoff sessionStorage path (no PII in the URL).
//
// Why this exists: a visitor finishes the EmailGate, lands on /results
// /[id], and the nav still says "Sign in." That's confusing — they
// just typed their email three times. The capture-email route DID
// provision a Supabase auth row for them, but they have no password
// (or passkey) yet, so they can't actually sign in. This banner makes
// the next step obvious: claim the account they implicitly started.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IdentityHandoff } from '@/components/auth/IdentityHandoff';

interface SaveReportBannerProps {
  readonly email: string | null;
  readonly fullName?: string | null;
  readonly institutionName?: string | null;
}

export function SaveReportBanner({
  email,
  fullName,
  institutionName,
}: SaveReportBannerProps): React.ReactElement | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (cancelled) return;
        if (!res.ok) {
          setSignedIn(false);
          return;
        }
        const data = (await res.json()) as { user: { email: string | null } | null };
        setSignedIn(Boolean(data.user?.email));
      } catch {
        if (!cancelled) setSignedIn(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Don't render until we know the auth state — keeps the banner from
  // flashing for signed-in users.
  if (signedIn === null) return null;
  if (signedIn) return null;
  if (!email) return null;

  return (
    <>
      <IdentityHandoff
        identity={{ email, fullName, institutionName }}
      />
      <aside
        aria-label="Save this report to your account"
        className="max-w-4xl mx-auto mb-10 border border-[color:var(--color-terra)]/40 bg-[color:var(--color-parch)] rounded-[3px] p-5 md:p-6 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 md:gap-x-6"
      >
        <div className="min-w-0 md:flex-1">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-2">
            Save your report
          </p>
          <p className="font-serif text-[16px] md:text-[17px] leading-[1.5] text-[color:var(--color-ink)]">
            Create your account to keep this briefing on your dashboard,
            retake the assessment later, and unlock the In-Depth report.
          </p>
        </div>
        <Link
          href="/auth/signup?next=/dashboard"
          className="self-stretch md:self-auto md:shrink-0 inline-flex items-center justify-center bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-6 py-3 rounded-[2px] font-mono text-[11px] uppercase tracking-[0.18em] hover:bg-[color:var(--color-terra-light)] transition-colors"
        >
          Create my account →
        </Link>
      </aside>
    </>
  );
}
