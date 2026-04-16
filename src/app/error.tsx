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
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-error)]">
          Something went wrong
        </p>
        <h1 className="font-serif text-5xl text-[color:var(--color-ink)] leading-tight">
          We hit an unexpected error.
        </h1>
        <p className="text-lg text-[color:var(--color-ink)]/70 leading-relaxed">
          Our end, not yours. The issue has been logged. Try reloading the page,
          or return to the home page and take the free assessment.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-[color:var(--color-slate)]">
            Reference: {error.digest}
          </p>
        )}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-block px-8 py-4 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
