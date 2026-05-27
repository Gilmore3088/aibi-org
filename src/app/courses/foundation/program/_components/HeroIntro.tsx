// HeroIntro — welcome marker + title + promise tagline + fetch-failure notice.
// Server component (no client-side state).

import Link from 'next/link';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

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
          fontFamily: FONT_INTER,
        }}
      >
        <span
          style={{
            fontFamily: FONT_INTER,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
          }}
        >
          {completedCount > 0 ? 'Welcome back' : 'Begin here'}
        </span>
        <span
          style={{
            flex: 1,
            height: 1,
            background: 'var(--ink-a10)',
          }}
        />
      </div>

      <h1
        style={{
          fontFamily: FONT_INTER,
          fontWeight: 800,
          fontSize: 'clamp(46px, 6vw, 76px)',
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          margin: '0 0 18px',
          color: 'var(--ink)',
        }}
      >
        AI Banking{' '}
        <span
          style={{
            color: 'var(--gold-deep)',
            fontWeight: 800,
          }}
        >
          Foundation.
        </span>
      </h1>
      <p
        style={{
          fontFamily: FONT_INTER,
          fontWeight: 400,
          fontSize: 22,
          lineHeight: 1.4,
          color: 'var(--slate-600)',
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
            borderLeft: '2px solid var(--gold-deep)',
            background: 'var(--cream-2)',
            borderRadius: 12,
            fontFamily: FONT_INTER,
            fontSize: 14,
            color: 'var(--ink)',
          }}
        >
          Couldn&rsquo;t load your progress right now.{' '}
          <Link
            href="/auth/login"
            style={{ textDecoration: 'underline', color: 'var(--ink)' }}
          >
            Sign in
          </Link>{' '}
          to resume, or refresh the page in a moment.
        </p>
      )}
    </>
  );
}
