// PricingProof — pricing block paired with one reviewer quote and one
// sourced statistic. Operator swaps quote text + attribution later;
// the statistic is the Gartner-via-Jack-Henry 57% AI skills gap stat
// from the CLAUDE.md sourced-statistics table.

import type { ReactNode } from 'react';

const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

interface PricingProofProps {
  enrollButton: ReactNode;
  /** When true, the buyer's institution has a locked team rate that
   *  create-checkout applies automatically (PAY-03). Surfaced as a note so
   *  the adjusted price at checkout doesn't read as inconsistent. */
  institutionRateApplies?: boolean;
}

export function PricingProof({
  enrollButton,
  institutionRateApplies = false,
}: PricingProofProps) {
  return (
    <section
      id="enroll"
      className="aibi-grid aibi-grid--2"
      style={{
        marginBottom: 56,
        scrollMarginTop: 80,
        gap: 22,
      }}
    >
      {/* Pricing card */}
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
          borderRadius: 28,
          padding: '32px 34px',
          boxShadow: 'var(--shadow-feature)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <span
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            fontWeight: 700,
          }}
        >
          Enroll
        </span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: INTER_STACK,
              fontWeight: 700,
              fontSize: '3.5rem',
              letterSpacing: '-0.025em',
              lineHeight: 1,
              color: 'var(--ink)',
            }}
          >
            $295
          </span>
          <span
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--gold-deep)',
              letterSpacing: '0.04em',
            }}
          >
            volume seats by request
          </span>
        </div>

        {institutionRateApplies && (
          <p
            role="status"
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--gold-deep)',
              background: 'var(--cream-2)',
              border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
              borderRadius: 12,
              padding: '10px 14px',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            Your institution&rsquo;s team rate is applied at checkout.
          </p>
        )}

        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.9063rem',
            color: 'var(--slate-600)',
            lineHeight: 1.55,
            margin: 0,
            maxWidth: '46ch',
          }}
        >
          One-time individual payment. Stripe checkout — no account required
          to enroll. Volume seats are scoped by request.
        </p>

        <div>{enrollButton}</div>
      </div>

      {/* Proof column — one review standard + one stat */}
      <div style={{ display: 'grid', gap: 18 }}>
        <figure
          style={{
            margin: 0,
            background: 'var(--ink)',
            color: 'var(--cream-2)',
            borderRadius: 24,
            padding: '26px 28px',
            boxShadow: 'var(--shadow-feature)',
          }}
        >
          <span
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
            }}
          >
            Review standard
          </span>
          <blockquote
            style={{
              fontFamily: INTER_STACK,
              fontSize: '1.0625rem',
              lineHeight: 1.45,
              color: '#fff',
              margin: '12px 0 0',
              fontWeight: 500,
            }}
          >
            The passing bar is a saved work product with a named human review
            step, a clear source boundary, and a reuse rule. If the learner and
            manager cannot defend how it should be used, it is not ready for work.
          </blockquote>
          <figcaption
            style={{
              marginTop: 14,
              fontFamily: INTER_STACK,
              fontSize: '0.7813rem',
              color: 'var(--gold-soft)',
              letterSpacing: '0.04em',
            }}
          >
            Institute completion standard
          </figcaption>
        </figure>

        {/* Sourced statistic */}
        <div
          style={{
            background: 'var(--cream-2)',
            border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
            borderRadius: 24,
            padding: '24px 26px',
          }}
        >
          <div
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
              marginBottom: 10,
            }}
          >
            Why this credential matters
          </div>
          <div
            style={{
              fontFamily: INTER_STACK,
              fontWeight: 700,
              fontSize: '2.25rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              color: 'var(--ink)',
            }}
          >
            57%
          </div>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.875rem',
              color: 'var(--ink)',
              lineHeight: 1.5,
              margin: '8px 0 6px',
              maxWidth: '40ch',
            }}
          >
            of financial institutions report struggling with AI skill gaps in
            their workforce.
          </p>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.75rem',
              color: 'var(--slate-500)',
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            Gartner Peer Community, via Jack Henry &amp; Associates, 2025.
          </p>
        </div>
      </div>
    </section>
  );
}
