'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging. Wire to Sentry or similar later.
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center space-y-6">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--ledger-weak)]">
          Something went wrong
        </p>
        <h1 className="font-serif text-5xl text-[color:var(--ledger-ink)] leading-tight">
          We hit an unexpected error.
        </h1>
        <p className="text-lg text-[color:var(--ledger-ink)]/70 leading-relaxed">
          Our end, not yours. The issue has been logged. Try reloading the page,
          or return to the home page and take the free assessment.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-[color:var(--ledger-muted)]">
            Reference: {error.digest}
          </p>
        )}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-block px-8 py-4 bg-[color:var(--ledger-accent)] text-[color:var(--ledger-bg)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--ledger-accent-light)] active:scale-[0.98] transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-block px-8 py-4 border border-[color:var(--ledger-ink)]/30 text-[color:var(--ledger-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--ledger-accent)] hover:text-[color:var(--ledger-accent)] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
