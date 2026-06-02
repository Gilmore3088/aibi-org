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
   *  the lower price at checkout doesn't read as inconsistent. */
  institutionRateApplies?: boolean;
}

export function PricingProof({
  enrollButton,
  institutionRateApplies = false,
}: PricingProofProps) {
  return (
    <section
      id="enroll"
      style={{
        marginBottom: 56,
        scrollMarginTop: 80,
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
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
            fontSize: 12,
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
              fontSize: 56,
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
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--gold-deep)',
              letterSpacing: '0.04em',
            }}
          >
            $199 per seat at 10+
          </span>
        </div>

        {institutionRateApplies && (
          <p
            role="status"
            style={{
              fontFamily: INTER_STACK,
              fontSize: 13,
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
            Your institution&rsquo;s team rate is applied &mdash; checkout will
            charge $199, not $295.
          </p>
        )}

        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 14.5,
            color: 'var(--slate-600)',
            lineHeight: 1.55,
            margin: 0,
            maxWidth: '46ch',
          }}
        >
          One-time payment. Lifetime access. Stripe checkout — no account
          required to enroll.
        </p>

        <div>{enrollButton}</div>
      </div>

      {/* Proof column — one quote + one stat */}
      <div style={{ display: 'grid', gap: 18 }}>
        {/* OPERATOR: replace with a real reviewer quote + attribution */}
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
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
            }}
          >
            From the reviewer
          </span>
          <blockquote
            style={{
              fontFamily: INTER_STACK,
              fontSize: 17,
              lineHeight: 1.45,
              color: '#fff',
              margin: '12px 0 0',
              fontWeight: 500,
            }}
          >
            {/* OPERATOR: replace */}
            &ldquo;We grade for the work that gets shown to an examiner.
            If a saved prompt cannot be defended, it does not pass.&rdquo;
          </blockquote>
          <figcaption
            style={{
              marginTop: 14,
              fontFamily: INTER_STACK,
              fontSize: 12.5,
              color: 'var(--gold-soft)',
              letterSpacing: '0.04em',
            }}
          >
            {/* OPERATOR: replace with real attribution */}
            Principal reviewer · The AI Banking Institute
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
              fontSize: 11,
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
              fontSize: 36,
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
              fontSize: 14,
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
              fontSize: 12,
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
