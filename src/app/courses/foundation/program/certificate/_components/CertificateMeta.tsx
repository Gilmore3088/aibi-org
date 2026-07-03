import type { CSSProperties } from 'react';
import { buildLinkedInAddToProfileUrl } from '../_lib/linkedin';

const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

interface CertificateMetaProps {
  readonly certificateId: string;
  readonly enrollmentId: string;
  readonly downloadFilename: string;
  readonly issuedAt: string;
  readonly verificationUrl: string;
}

export function CertificateMeta({
  certificateId,
  enrollmentId,
  downloadFilename,
  issuedAt,
  verificationUrl,
}: CertificateMetaProps) {
  const linkedInUrl = buildLinkedInAddToProfileUrl({
    name: 'AiBI-Foundation',
    organizationName: 'The AI Banking Institute',
    issuedAt,
    certUrl: verificationUrl,
    certId: certificateId,
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}
    >
      {/* Credential sharing */}
      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--ink-a10)',
          borderRadius: 'var(--r-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-soft)',
        }}
      >
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
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 8px',
          }}
        >
          Share the credential
        </h3>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            margin: '0 0 14px',
          }}
        >
          Use this language on LinkedIn, in an internal profile,
          or when sharing completion with your manager:
        </p>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 13,
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
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 14,
            background: 'var(--ink)',
            color: '#FFFFFF',
            fontFamily: INTER_STACK,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '12px 16px',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          Add to LinkedIn profile
        </a>
      </section>

      {/* Download PDF */}
      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--ink-a10)',
          borderRadius: 'var(--r-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
        }}
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
            fontSize: 16,
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
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            margin: '0 0 16px',
            flex: 1,
          }}
        >
          High-resolution vector format, suitable for your manager,
          HR record, or internal training file.
        </p>
        <a
          href={`/api/courses/generate-certificate?enrollmentId=${enrollmentId}`}
          download={downloadFilename}
          style={{
            display: 'block',
            textAlign: 'center',
            background: 'var(--ink)',
            color: '#FFFFFF',
            fontFamily: INTER_STACK,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            textDecoration: 'none',
          }}
        >
          Download Certificate
        </a>
      </section>

      {/* What&rsquo;s next — institutional CTA, on-dark + gold accent */}
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
          <p
            style={{
              ...KICKER,
              color: 'var(--gold-soft)',
              marginBottom: 12,
            }}
          >
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
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--on-dark-80)',
              margin: '0 0 18px',
            }}
          >
            Coached cohorts at $199 per seat for ten or more. Aggregate
            dashboard for your champion.
          </p>
        </div>
        <a
          href="/for-institutions"
          style={{
            display: 'block',
            textAlign: 'center',
            background: 'var(--gold)',
            color: 'var(--ink)',
            fontFamily: INTER_STACK,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            textDecoration: 'none',
          }}
        >
          See Institutional Engagement
        </a>
      </section>
    </div>
  );
}
