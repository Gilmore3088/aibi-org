// HeroIntro — welcome marker + title + promise tagline + fetch-failure notice.
// Server component (no client-side state).

import Link from 'next/link';

interface HeroIntroProps {
  readonly completedCount: number;
  readonly promise: string;
  readonly fetchFailed: boolean;
}

export function HeroIntro({ completedCount, promise, fetchFailed }: HeroIntroProps) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 10.5,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--ledger-accent)',
          }}
        >
          {completedCount > 0 ? 'Welcome back' : 'Begin here'}
        </span>
        <span
          style={{
            flex: 1,
            height: 1,
            background: 'var(--ledger-rule)',
          }}
        />
      </div>

      <h1
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontWeight: 500,
          fontSize: 'clamp(46px, 6vw, 76px)',
          lineHeight: 0.98,
          letterSpacing: '-0.035em',
          margin: '0 0 18px',
          color: 'var(--ledger-ink)',
        }}
      >
        AI Banking{' '}
        <em
          style={{
            color: 'var(--ledger-accent)',
            fontStyle: 'normal',
            fontWeight: 500,
          }}
        >
          Foundation.
        </em>
      </h1>
      <p
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontStyle: 'italic',
          fontSize: 22,
          lineHeight: 1.4,
          color: 'var(--ledger-ink-2)',
          margin: '0 0 12px',
          maxWidth: '62ch',
        }}
      >
        {promise}
      </p>

      {fetchFailed && (
        <p
          style={{
            marginTop: 24,
            padding: '12px 16px',
            borderLeft: '2px solid var(--ledger-weak)',
            background: 'rgba(142,59,42,0.06)',
            fontSize: 14,
            color: 'var(--ledger-ink)',
          }}
        >
          Couldn&rsquo;t load your progress right now.{' '}
          <Link
            href="/auth/login"
            style={{ textDecoration: 'underline', color: 'var(--ledger-ink)' }}
          >
            Sign in
          </Link>{' '}
          to resume, or refresh the page in a moment.
        </p>
      )}
    </>
  );
}
