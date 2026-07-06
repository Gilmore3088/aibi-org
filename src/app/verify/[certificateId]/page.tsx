// Public certificate-verification surface — /verify/[certificateId].
//
// Ported to mockup design system 2026-05-27 (Inter, ink/cream/gold). Mirrors
// the credential lockup from the on-screen certificate page (navy seal,
// gold landmark, middle-dot credential format).

import type { Metadata } from 'next';
import Link from 'next/link';

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getFoundationTrainingRecord } from '@content/courses/foundation-program/course-config';

interface CertificateVerificationResult {
  readonly holder_name: string;
  readonly designation: string;
  readonly issued_at: string;
}

interface PageProps {
  readonly params: Promise<{ readonly certificateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateId } = await params;
  return {
    title: 'Certificate Verification — The AI Banking Institute',
    description:
      'Confirm an AI Banking Institute certificate record. Verification is not regulator or third-party endorsement.',
    robots: { index: false, follow: false },
    alternates: { canonical: `/verify/${certificateId}` },
  };
}

async function fetchCertificate(
  certificateId: string,
): Promise<CertificateVerificationResult | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('certificates')
    .select('holder_name, designation, issued_at')
    .eq('certificate_id', certificateId)
    .single<CertificateVerificationResult>();

  if (error || !data) return null;
  return data;
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoString));
}

const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const META_LABEL: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.625rem',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: INTER_STACK,
      }}
    >
      {children}
    </main>
  );
}

function Seal() {
  return (
    <div
      aria-hidden
      style={{
        width: 56,
        height: 56,
        background: 'var(--ink)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 28, height: 28 }}
      >
        <path d="M3 10 L12 4 L21 10" />
        <path d="M5 10 V19" />
        <path d="M9 10 V19" />
        <path d="M15 10 V19" />
        <path d="M19 10 V19" />
        <path d="M3 20 H21" />
      </svg>
    </div>
  );
}

function DataRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        paddingBottom: 16,
        borderBottom: last ? 'none' : '1px solid var(--ink-a10)',
        marginBottom: last ? 0 : 16,
      }}
    >
      <p style={META_LABEL}>{label}</p>
      <p
        style={{
          margin: '6px 0 0',
          fontFamily: INTER_STACK,
          fontSize: '1.125rem',
          color: 'var(--ink)',
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          fontWeight: 600,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ── Pages ─────────────────────────────────────────────────────────────────────

function NotFoundContent() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={KICKER}>Verify · Not Found</p>
        <h1
          style={{
            fontFamily: INTER_STACK,
            fontSize: 'clamp(1.75rem, 4vw, 2.375rem)',
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Certificate not found.
        </h1>
      </div>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--ink-a10)',
          borderRadius: 'var(--r-lg)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: INTER_STACK,
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            textAlign: 'center',
          }}
        >
          The certificate ID you entered could not be verified. Check the ID and
          try again.
        </p>
      </div>
      <p
        style={{
          textAlign: 'center',
          fontFamily: INTER_STACK,
          fontSize: '0.8125rem',
          color: 'var(--slate-600)',
          margin: 0,
        }}
      >
        <Link
          href="/verify"
          style={{ color: 'var(--ink)', fontWeight: 600 }}
        >
          Try another certificate ID
        </Link>
      </p>
    </div>
  );
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  const { certificateId } = await params;
  const certificate = await fetchCertificate(certificateId);

  if (!certificate) {
    return (
      <Surface>
        <NotFoundContent />
      </Surface>
    );
  }

  const issuedDate = formatDate(certificate.issued_at);
  const trainingRecord = getFoundationTrainingRecord();
  const hoursLabel = Number.isInteger(trainingRecord.hours)
    ? String(trainingRecord.hours)
    : trainingRecord.hours.toFixed(1);
  const seatTimeLine = `~${hoursLabel} hours · ${trainingRecord.moduleCount} self-paced modules`;
  const topicsLine = trainingRecord.topics.join(', ');

  return (
    <Surface>
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <Seal />
          </div>
          <p style={KICKER}>Credential Verified</p>
          <h1
            style={{
              fontFamily: INTER_STACK,
              fontSize: 'clamp(1.75rem, 4vw, 2.375rem)',
              fontWeight: 700,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            This credential is authentic.
          </h1>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.875rem',
              color: 'var(--slate-600)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Issued by The AI Banking Institute · ID {certificateId}. This page
            verifies the certificate record only; it is not regulator or
            third-party endorsement.
          </p>
        </div>

        {/* Credential card */}
        <article
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--ink-a10)',
            borderRadius: 'var(--r-lg)',
            padding: '32px 28px',
            boxShadow: 'var(--shadow-feature)',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <p style={META_LABEL}>Holder</p>
            <h2
              style={{
                margin: '8px 0 0',
                fontFamily: INTER_STACK,
                fontSize: 'clamp(1.625rem, 3vw, 2rem)',
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                paddingBottom: 20,
                borderBottom: '1px solid var(--ink-a10)',
              }}
            >
              {certificate.holder_name}
            </h2>
          </div>

          <DataRow
            label="Designation"
            value={`${certificate.designation} · The AI Banking Institute`}
          />
          <DataRow label="Date Issued" value={issuedDate} />
          <DataRow label="Documented Seat Time" value={seatTimeLine} />
          <DataRow label="Topics Covered" value={topicsLine} />
          <DataRow label="Issuing Institution" value="The AI Banking Institute" last />
        </article>

        <p
          style={{
            textAlign: 'center',
            fontFamily: INTER_STACK,
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
            margin: 0,
          }}
        >
          The AI Banking Institute ·{' '}
          <a
            href="https://aibankinginstitute.com"
            style={{ color: 'var(--ink)', textDecoration: 'none' }}
          >
            AIBankingInstitute.com
          </a>
        </p>
      </div>
    </Surface>
  );
}
