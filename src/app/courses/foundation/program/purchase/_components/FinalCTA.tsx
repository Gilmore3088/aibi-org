// FinalCTA — closing call-to-action for the foundation purchase landing.
// Renders an editorial sign-off plus a single enroll button.  The button
// scrolls back up to the enroll strip rather than starting a new Stripe
// session, so the EnrollButton at the top of the page remains the single
// source for checkout state.

import Link from 'next/link';

export function FinalCTA() {
  return (
    <section
      style={{
        margin: '64px 0 0',
        padding: '64px 36px',
        background: 'var(--ink)',
        color: 'var(--cream-2)',
        borderRadius: 3,
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
          fontWeight: 500,
          fontSize: 'clamp(28px, 3.4vw, 42px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 auto 28px',
          maxWidth: '24ch',
        }}
      >
        The shortest path to using AI at your{' '}
        <em
          style={{
            color: 'var(--gold)',
            fontStyle: 'normal',
            fontWeight: 500,
          }}
        >
          financial institution.
        </em>
      </h2>
      <div
        style={{
          display: 'inline-flex',
          gap: 14,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Link
          href="#enroll"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 26px',
            background: 'var(--gold)',
            color: 'var(--cream-2)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: 2,
          }}
        >
          Enroll — $295
          <span
            aria-hidden="true"
            style={{
              fontFamily: 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
              fontSize: 16,
              lineHeight: 0,
            }}
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
