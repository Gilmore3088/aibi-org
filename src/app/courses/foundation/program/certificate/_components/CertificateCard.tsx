import type { CSSProperties } from 'react';
import { Monogram } from '@/components/brand';
import { formatDate } from '../_lib/formatDate';

const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const META_LABEL: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};

interface CertificateCardProps {
  readonly holderName: string;
  readonly issuedAt: string;
  readonly certificateId: string;
  readonly verificationUrl: string | null;
}

function CertificateSeal() {
  return (
    <div
      aria-hidden
      style={{
        width: 64,
        height: 64,
        background: 'var(--ink)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-soft)',
        color: 'var(--cream)',
      }}
    >
      <Monogram tone="light" size={26} />
    </div>
  );
}

export function CertificateCard({
  holderName,
  issuedAt,
  certificateId,
  verificationUrl,
}: CertificateCardProps) {
  return (
    <article
      aria-label="AiBI-Foundation credential"
      style={{
        position: 'relative',
        background: 'var(--cream)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-xl)',
        padding: 'clamp(40px, 6vw, 64px) clamp(28px, 5vw, 56px)',
        marginBottom: 32,
        boxShadow: 'var(--shadow-feature)',
        overflow: 'hidden',
      }}
    >
      {/* Inner ruling — a single hairline frame keeps the document feel
          without resorting to ornament. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 14,
          border: '1px solid var(--ink-a10)',
          borderRadius: 'calc(var(--r-xl) - 8px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 28,
          zIndex: 1,
        }}
      >
        <CertificateSeal />
      </div>

      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <p style={{ ...KICKER, marginBottom: 18 }}>
          Certificate of Completion
        </p>

        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--slate-600)',
            margin: '0 0 10px',
          }}
        >
          This certifies that
        </p>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 'clamp(1.75rem, 4vw, 2.375rem)',
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '-0.015em',
            margin: '0 0 18px',
          }}
        >
          {holderName}
        </p>

        <div
          aria-hidden
          style={{
            width: 72,
            height: 1,
            background: 'var(--gold)',
            opacity: 0.6,
            margin: '0 auto 18px',
          }}
        />

        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--slate-600)',
            margin: '0 0 10px',
          }}
        >
          has completed the curriculum of
        </p>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 'clamp(1.25rem, 2.4vw, 1.5rem)',
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '0.01em',
            margin: 0,
          }}
        >
          AiBI-Foundation
        </p>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--slate-600)',
            letterSpacing: '0.02em',
            margin: '6px 0 0',
          }}
        >
          · The AI Banking Institute ·
        </p>
      </div>

      {/* Issue + ID metadata strip */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 36,
          paddingTop: 24,
          borderTop: '1px solid var(--ink-a10)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <p style={{ ...META_LABEL, marginBottom: 6 }}>Issued</p>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            {formatDate(issuedAt)}
          </p>
        </div>
        <div>
          <p style={{ ...META_LABEL, marginBottom: 6 }}>Credential ID</p>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--ink)',
              letterSpacing: '0.04em',
              margin: 0,
              wordBreak: 'break-all',
            }}
          >
            {certificateId}
          </p>
        </div>
      </div>

      {verificationUrl && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          <a
            href={verificationUrl}
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--slate-500)',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
            }}
          >
            Verify at {verificationUrl}
          </a>
        </div>
      )}
    </article>
  );
}
