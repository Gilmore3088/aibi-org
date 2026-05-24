'use client';

// Branded error boundary for the (addie) route group. Caught by Next
// when a server/route component throws; offers a retry and surfaces a
// readable error id so the operator can correlate with logs.

import Link from 'next/link';
import { useEffect } from 'react';

interface AddieErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function AddieError({ error, reset }: AddieErrorProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('[addie] route error:', error);
    }
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16 lg:py-24 text-center">
      <div className="font-mono uppercase tracking-[0.2em] text-[0.65rem] text-[var(--ledger-weak)] mb-4">
        Something went sideways
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl text-[var(--ledger-ink)] leading-[1.05]">
        We hit an unexpected error.
      </h1>
      <p className="mt-5 text-[var(--ledger-ink-2)] text-lg leading-relaxed">
        The page you were on couldn&apos;t render. Your progress and saved
        artifacts are safe. Try again, or head back to a known page.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-3 rounded-[3px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms]"
        >
          Try again
        </button>
        <Link
          href="/foundation"
          className="font-mono font-semibold uppercase tracking-[0.14em] text-xs px-5 py-3 rounded-[3px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] transition-colors duration-[160ms]"
        >
          Back to Foundation
        </Link>
      </div>
    </main>
  );
}
