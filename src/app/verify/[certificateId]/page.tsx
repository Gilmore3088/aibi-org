import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

import {
  LedgerCard,
  LedgerEyebrow,
  LedgerH1,
  LedgerLede,
  LedgerSurface,
} from '@/components/ledger';

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
    description: 'Verify the authenticity of an AI Banking Institute credential.',
    robots: { index: false, follow: false },
    alternates: { canonical: `/verify/${certificateId}` },
  };
}

async function fetchCertificate(
  certificateId: string,
): Promise<CertificateVerificationResult | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

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

// ── Sub-components ────────────────────────────────────────────────────────────

function DataRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        paddingBottom: 18,
        borderBottom: last ? 'none' : '1px solid var(--rule)',
        marginBottom: last ? 0 : 18,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--mono)',
          fontSize: 9.5,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: '6px 0 0',
          fontFamily: 'var(--serif)',
          fontSize: 22,
          color: 'var(--ink)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          fontWeight: 500,
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
    <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <LedgerEyebrow>Verify · not found</LedgerEyebrow>
        <LedgerH1>Certificate <em>not found.</em></LedgerH1>
      </div>
      <LedgerCard variant="strong">
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 17,
            lineHeight: 1.5,
            color: 'var(--ink-2)',
            textAlign: 'center',
          }}
        >
          The certificate ID you entered could not be verified. Check the ID and
          try again.
        </p>
      </LedgerCard>
      <p
        style={{
          textAlign: 'center',
          fontFamily: 'var(--serif)',
          fontSize: 15,
          color: 'var(--ink-2)',
          margin: 0,
        }}
      >
        <a href="https://aibankinginstitute.com" className="ledger-link">
          Return to The AI Banking Institute
        </a>
      </p>
    </div>
  );
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  const { certificateId } = await params;
  const certificate = await fetchCertificate(certificateId);

  if (!certificate) {
    return (
      <LedgerSurface>
        <NotFoundContent />
      </LedgerSurface>
    );
  }

  const issuedDate = formatDate(certificate.issued_at);

  return (
    <LedgerSurface>
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LedgerEyebrow>Credential verified</LedgerEyebrow>
          <LedgerH1>This credential is <em>authentic.</em></LedgerH1>
          <LedgerLede>
            Issued by The AI Banking Institute · ID {certificateId}
          </LedgerLede>
        </div>

        <LedgerCard variant="strong">
          <div style={{ marginBottom: 22 }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--mono)',
                fontSize: 9.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              Holder
            </p>
            <h2
              style={{
                margin: '6px 0 0',
                fontFamily: 'var(--serif)',
                fontSize: 36,
                fontWeight: 500,
                color: 'var(--ink)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                paddingBottom: 18,
                borderBottom: '1px solid var(--rule)',
              }}
            >
              {certificate.holder_name}
            </h2>
          </div>

          <DataRow label="Designation" value={certificate.designation} />
          <DataRow label="Date issued" value={issuedDate} />
          <DataRow label="Issuing institution" value="The AI Banking Institute" last />
        </LedgerCard>

        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            margin: 0,
          }}
        >
          The AI Banking Institute ·{' '}
          <a href="https://aibankinginstitute.com" className="ledger-link">
            AIBankingInstitute.com
          </a>
        </p>
      </div>
    </LedgerSurface>
  );
}
