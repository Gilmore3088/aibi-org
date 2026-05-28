// Already-enrolled state for /courses/foundation/program/purchase.
// Replaces the marketing surface with a "you're in" confirmation.

import Link from 'next/link';
import { INTER_STACK } from './purchaseConstants';

export function EnrolledHero({ currentModule }: { readonly currentModule: number }) {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 36px 80px' }}>
      <section
        style={{
          background: 'var(--ink)',
          color: '#fff',
          padding: 'clamp(36px, 5vw, 56px) clamp(28px, 4vw, 48px)',
          borderRadius: 32,
          boxShadow: 'var(--shadow-hero)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--gold-a20)',
            color: 'var(--gold-soft)',
            fontFamily: INTER_STACK,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 22,
          }}
        >
          Already enrolled
        </span>
        <h1
          style={{
            fontFamily: INTER_STACK,
            fontWeight: 700,
            fontSize: 'clamp(36px, 4.5vw, 52px)',
            lineHeight: 1.04,
            letterSpacing: '-0.028em',
            margin: '0 0 18px',
            color: '#fff',
          }}
        >
          You&rsquo;re in the{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>AiBI-Foundation</span>{' '}
          program.
        </h1>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 17,
            lineHeight: 1.55,
            color: 'var(--on-dark-80)',
            margin: '0 0 28px',
            maxWidth: '58ch',
          }}
        >
          Your enrollment is active and your access is permanent. Pick up where you left
          off, or jump back to the course overview.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link
            href={`/courses/foundation/program/${currentModule}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--gold)',
              color: 'var(--ink)',
              padding: '14px 26px',
              borderRadius: 12,
              fontFamily: INTER_STACK,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Continue the course →
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              color: 'var(--on-dark-80)',
              border: '1px solid var(--on-dark-20)',
              padding: '12px 22px',
              borderRadius: 12,
              cursor: 'pointer',
              fontFamily: INTER_STACK,
              fontSize: 13,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
