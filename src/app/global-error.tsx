'use client';

// Last-resort error boundary — renders when even the root layout fails.
// Must include its own <html> and <body> tags.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '4rem 1.5rem',
          fontFamily: 'Georgia, serif',
          background: '#ECE9DF',
          color: '#0E1B2D',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: '36rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#8E3B2A',
              marginBottom: '1rem',
            }}
          >
            Critical Error
          </p>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            The page failed to load.
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.75, marginBottom: '2rem' }}>
            Something fundamental broke. The issue has been logged. Please reload
            the page or return shortly.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.75rem',
                opacity: 0.4,
                marginBottom: '2rem',
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '1rem 2rem',
              background: '#B5862A',
              color: '#ECE9DF',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
