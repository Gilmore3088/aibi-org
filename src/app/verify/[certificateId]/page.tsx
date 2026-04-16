import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CertificateVerificationResult {
  readonly holder_name: string;
  readonly designation: string;
  readonly issued_at: string;
}

interface PageProps {
  readonly params: Promise<{ readonly certificateId: string }>;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateId } = await params;
  return {
    title: 'Certificate Verification — The AI Banking Institute',
    description: 'Verify the authenticity of an AI Banking Institute credential.',
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/verify/${certificateId}`,
    },
  };
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchCertificate(
  certificateId: string,
): Promise<CertificateVerificationResult | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from('certificates')
    .select('holder_name, designation, issued_at')
    .eq('certificate_id', certificateId)
    .single<CertificateVerificationResult>();

  if (error || !data) {
    return null;
  }

  return data;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoString));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CheckmarkIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '32px', height: '32px', color: 'var(--color-sage)' }}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function DataField({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--color-parch-dark)',
        paddingBottom: '1rem',
        marginBottom: '1rem',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-slate)',
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
          color: 'var(--color-ink)',
          lineHeight: 1.3,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        background: 'var(--color-linen)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: 'var(--color-parch)',
          border: '1px solid var(--color-parch-dark)',
          borderRadius: '4px',
          padding: '2.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '24px', height: '24px', color: 'var(--color-error)' }}
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: 600,
            color: 'var(--color-ink)',
            marginBottom: '0.75rem',
          }}
        >
          Certificate Not Found
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'var(--color-slate)',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}
        >
          The certificate ID you entered could not be verified. Please check the ID and try again.
        </p>

        <a
          href="https://aibankinginstitute.com"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            color: 'var(--color-terra)',
            textDecoration: 'underline',
          }}
        >
          Return to The AI Banking Institute
        </a>
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CertificateVerificationPage({ params }: PageProps) {
  const { certificateId } = await params;
  const certificate = await fetchCertificate(certificateId);

  if (!certificate) {
    return <NotFoundPage />;
  }

  const issuedDate = formatDate(certificate.issued_at);

  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        background: 'var(--color-linen)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-serif-sc)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: 'var(--color-slate)',
              textTransform: 'uppercase',
            }}
          >
            The AI Banking Institute
          </p>
        </div>

        {/* Verification card */}
        <div
          style={{
            background: 'var(--color-parch)',
            border: '1px solid var(--color-parch-dark)',
            borderRadius: '4px',
            padding: '2.5rem',
          }}
        >
          {/* Verified badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--color-parch-dark)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#f0faf0',
                border: '1px solid #c3e6cb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckmarkIcon />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--color-terra)',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Certificate Verified
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  color: 'var(--color-slate)',
                  margin: '0.25rem 0 0',
                }}
              >
                This credential is authentic.
              </p>
            </div>
          </div>

          {/* Holder name — most prominent */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-slate)',
                marginBottom: '0.25rem',
              }}
            >
              Holder Name
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: 600,
                color: 'var(--color-ink)',
                lineHeight: 1.2,
                margin: 0,
                borderBottom: '1px solid var(--color-parch-dark)',
                paddingBottom: '1rem',
              }}
            >
              {certificate.holder_name}
            </h2>
          </div>

          {/* Remaining three fields */}
          <DataField label="Designation" value={certificate.designation} />
          <DataField label="Date Issued" value={issuedDate} />

          {/* Issuing institution — last field, no bottom border */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-slate)',
                marginBottom: '0.25rem',
              }}
            >
              Issuing Institution
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                color: 'var(--color-ink)',
                lineHeight: 1.3,
              }}
            >
              The AI Banking Institute
            </p>
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            color: 'var(--color-slate)',
            marginTop: '1.5rem',
          }}
        >
          The AI Banking Institute &mdash;{' '}
          <a
            href="https://aibankinginstitute.com"
            style={{ color: 'var(--color-terra)', textDecoration: 'underline' }}
          >
            AIBankingInstitute.com
          </a>
        </p>
      </div>
    </main>
  );
}
