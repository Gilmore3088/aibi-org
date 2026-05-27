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
    <main
      className="min-h-[60vh] flex items-center justify-center px-6 py-24"
      style={{
        background: 'var(--cream)',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="max-w-xl text-center space-y-6">
        <p
          className="text-xs uppercase"
          style={{
            color: 'var(--gold-deep)',
            fontWeight: 600,
            letterSpacing: '0.2em',
          }}
        >
          Something went wrong
        </p>
        <h1
          className="text-5xl leading-tight"
          style={{
            color: 'var(--ink)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          We hit an unexpected error.
        </h1>
        <p
          className="text-lg leading-relaxed"
          style={{ color: 'var(--slate-600)' }}
        >
          Our end, not yours. The issue has been logged. Try reloading the page,
          or return to the home page and take the free assessment.
        </p>
        {error.digest && (
          <p
            className="text-xs"
            style={{
              color: 'var(--slate-500)',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            Reference: {error.digest}
          </p>
        )}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-block px-8 py-4 text-[11px] uppercase transition-all active:scale-[0.98]"
            style={{
              background: 'var(--ink)',
              color: 'var(--cream)',
              fontWeight: 600,
              letterSpacing: '1.2px',
              borderRadius: '12px',
            }}
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="inline-block px-8 py-4 text-[11px] uppercase transition-colors"
            style={{
              border: '1px solid var(--ink-a15)',
              color: 'var(--ink)',
              fontWeight: 600,
              letterSpacing: '1.2px',
              borderRadius: '12px',
            }}
          >
            BACK TO HOME
          </Link>
        </div>
      </div>
    </main>
  );
}
