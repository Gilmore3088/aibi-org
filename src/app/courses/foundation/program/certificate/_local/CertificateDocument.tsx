// The credential document — single rendering surface combining the
// hairline frame, seal, recipient + course block, and the issue / ID
// metadata strip with verification link.

import type { Certificate } from '@/types/course';
import { Seal } from './Seal';
import { INTER_STACK, KICKER, META_LABEL, formatDate } from './certificateStyles';

export function CertificateDocument({
  certificate,
  verificationUrl,
}: {
  readonly certificate: Certificate;
  readonly verificationUrl: string | null;
}) {
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
        <Seal />
      </div>

      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <p style={{ ...KICKER, marginBottom: 18 }}>Certificate of Completion</p>

        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 13,
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
            fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '-0.015em',
            margin: '0 0 18px',
          }}
        >
          {certificate.holder_name}
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
            fontSize: 13,
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
            fontSize: 'clamp(20px, 2.4vw, 24px)',
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
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--slate-600)',
            letterSpacing: '0.02em',
            margin: '6px 0 0',
          }}
        >
          · The AI Banking Institute ·
        </p>
      </div>

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
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            {formatDate(certificate.issued_at)}
          </p>
        </div>
        <div>
          <p style={{ ...META_LABEL, marginBottom: 6 }}>Credential ID</p>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--ink)',
              letterSpacing: '0.04em',
              margin: 0,
              wordBreak: 'break-all',
            }}
          >
            {certificate.certificate_id}
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
              fontSize: 11,
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
