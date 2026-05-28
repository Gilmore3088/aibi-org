// Three action cards shown below the credential document:
// LinkedIn placeholder, Download PDF, and the institutional CTA.

import { INTER_STACK, KICKER } from './certificateStyles';

const cardBase = {
  background: '#FFFFFF',
  border: '1px solid var(--ink-a10)',
  borderRadius: 'var(--r-lg)',
  padding: 24,
  boxShadow: 'var(--shadow-soft)',
} as const;

const ctaButton = {
  display: 'block',
  textAlign: 'center',
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '12px 16px',
  borderRadius: 'var(--r-md)',
  textDecoration: 'none',
} as const;

export function CertificateActions({
  enrollmentId,
  certificateId,
}: {
  readonly enrollmentId: string;
  readonly certificateId: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}
    >
      <LinkedInCard certificateId={certificateId} />
      <DownloadCard enrollmentId={enrollmentId} certificateId={certificateId} />
      <WhatsNextCard />
    </div>
  );
}

function LinkedInCard({ certificateId }: { readonly certificateId: string }) {
  return (
    <section style={cardBase}>
      <div
        style={{
          width: 36,
          height: 36,
          background: 'var(--ink)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            color: 'var(--gold-soft)',
            fontFamily: INTER_STACK,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          in
        </span>
      </div>
      <h3
        style={{
          fontFamily: INTER_STACK,
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 8px',
        }}
      >
        Add to LinkedIn
      </h3>
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: 13,
          lineHeight: 1.55,
          color: 'var(--slate-600)',
          margin: '0 0 14px',
        }}
      >
        LinkedIn badge integration is coming. In the meantime, reference your credential
        as:
      </p>
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.55,
          color: 'var(--ink)',
          background: 'var(--cream)',
          border: '1px solid var(--ink-a10)',
          borderRadius: 8,
          padding: 12,
          margin: 0,
        }}
      >
        AiBI-Foundation · The AI Banking Institute
        <br />
        Verified at aibankinginstitute.com/verify/{certificateId}
      </p>
    </section>
  );
}

function DownloadCard({
  enrollmentId,
  certificateId,
}: {
  readonly enrollmentId: string;
  readonly certificateId: string;
}) {
  return (
    <section
      style={{ ...cardBase, display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: 'var(--gold)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style={{ width: 18, height: 18, color: 'var(--ink)' }}
        >
          <path
            fillRule="evenodd"
            d="M10 3a.75.75 0 01.75.75v9.69l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V3.75A.75.75 0 0110 3z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M3 14.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3
        style={{
          fontFamily: INTER_STACK,
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 8px',
        }}
      >
        Download PDF
      </h3>
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: 13,
          lineHeight: 1.55,
          color: 'var(--slate-600)',
          margin: '0 0 16px',
          flex: 1,
        }}
      >
        High-resolution vector format, suitable for framing or sharing with your board.
      </p>
      <a
        href={`/api/courses/generate-certificate?enrollmentId=${enrollmentId}`}
        download={`AiBI-Foundation-Certificate-${certificateId}.pdf`}
        style={{ ...ctaButton, background: 'var(--ink)', color: '#FFFFFF' }}
      >
        Download Certificate
      </a>
    </section>
  );
}

function WhatsNextCard() {
  return (
    <section
      style={{
        background: 'var(--ink)',
        color: '#FFFFFF',
        borderRadius: 'var(--r-lg)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-feature)',
      }}
    >
      <div>
        <p style={{ ...KICKER, color: 'var(--gold-soft)', marginBottom: 12 }}>
          What&rsquo;s Next
        </p>
        <h3
          style={{
            fontFamily: INTER_STACK,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#FFFFFF',
            margin: '0 0 12px',
          }}
        >
          Bring it to your institution.
        </h3>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--on-dark-80)',
            margin: '0 0 18px',
          }}
        >
          Coached cohorts at $199 per seat for ten or more. Aggregate dashboard for your
          champion.
        </p>
      </div>
      <a
        href="/for-institutions"
        style={{ ...ctaButton, background: 'var(--gold)', color: 'var(--ink)' }}
      >
        See Institutional Engagement
      </a>
    </section>
  );
}
