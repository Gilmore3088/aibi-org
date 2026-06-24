import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatCertificateDate } from '@/lib/certificates/issue';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface PageProps {
  readonly params: Promise<{ readonly certificateId: string }>;
}

interface CertificatePrintRow {
  readonly certificate_id: string;
  readonly holder_name: string;
  readonly designation: string;
  readonly issued_at: string;
}

export const metadata: Metadata = {
  title: 'Certificate Print',
  robots: { index: false, follow: false },
};

async function fetchCertificate(certificateId: string): Promise<CertificatePrintRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('certificate_id, holder_name, designation, issued_at')
    .eq('certificate_id', certificateId)
    .maybeSingle();

  if (error || !data) return null;
  return data as CertificatePrintRow;
}

function BracketMark() {
  return (
    <span className="mark" aria-hidden>
      <span>[</span>
      <strong>A</strong>
      <em>i</em>
      <span>]</span>
    </span>
  );
}

export default async function CertificatePrintPage({ params }: PageProps) {
  const { certificateId } = await params;
  const certificate = await fetchCertificate(certificateId);
  if (!certificate) notFound();

  const verificationUrl = `https://aibankinginstitute.com/verify/${certificate.certificate_id}`;
  const designation = certificate.designation.includes('·')
    ? certificate.designation
    : `${certificate.designation} · The AI Banking Institute`;

  return (
    <main className="certificate-print">
      <style>{`
        @page {
          size: Letter landscape;
          margin: 0;
        }
        html,
        body {
          margin: 0;
          background: #f7f3ea;
        }
        .certificate-print {
          box-sizing: border-box;
          width: 11in;
          height: 8.5in;
          background: #f7f3ea;
          color: #071a2f;
          padding: 0.38in;
          font-family: var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif;
          display: flex;
        }
        .frame {
          position: relative;
          width: 100%;
          border: 1px solid rgba(7, 26, 47, 0.14);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 0.46in;
          box-sizing: border-box;
        }
        .frame::before {
          content: "";
          position: absolute;
          inset: 0.08in;
          border: 1px solid rgba(7, 26, 47, 0.10);
          pointer-events: none;
        }
        .header,
        .recipient,
        .bottom,
        .footer {
          position: relative;
          z-index: 1;
        }
        .header {
          text-align: center;
          display: grid;
          justify-items: center;
          gap: 0.14in;
        }
        .seal {
          width: 0.82in;
          height: 0.82in;
          border-radius: 0.18in;
          background: #071a2f;
          display: grid;
          place-items: center;
          color: #f7f3ea;
        }
        .mark {
          display: inline-flex;
          align-items: baseline;
          color: #c8a24a;
          font-family: var(--font-newsreader-heavy), Georgia, serif;
          font-size: 0.3in;
          line-height: 1;
        }
        .mark strong {
          color: #f7f3ea;
          font-weight: 700;
        }
        .mark em {
          color: #f7f3ea;
          font-family: var(--font-newsreader-hero), Georgia, serif;
          font-size: 1.08em;
          font-style: italic;
        }
        .kicker,
        .label,
        .note,
        .verify {
          font-family: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .kicker {
          margin: 0;
          color: #9a7a2f;
          font-size: 0.1in;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }
        h1 {
          margin: 0;
          font-family: var(--font-newsreader-heavy), Georgia, serif;
          font-size: 0.42in;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }
        .divider {
          width: 1.1in;
          height: 1px;
          background: #c8a24a;
        }
        .recipient {
          text-align: center;
          display: grid;
          justify-items: center;
          gap: 0.12in;
        }
        .honors,
        .curriculum {
          margin: 0;
          color: #475569;
          font-size: 0.13in;
        }
        .name {
          margin: 0;
          font-family: var(--font-newsreader-heavy), Georgia, serif;
          font-size: 0.5in;
          font-weight: 700;
          line-height: 1.04;
        }
        .designation {
          margin: 0;
          font-family: var(--font-newsreader-heavy), Georgia, serif;
          font-size: 0.26in;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .bottom {
          width: 100%;
          border-top: 1px solid rgba(7, 26, 47, 0.12);
          padding-top: 0.22in;
          display: grid;
          grid-template-columns: 1fr 0.7fr 1fr;
          align-items: end;
          gap: 0.25in;
        }
        .metadata {
          display: grid;
          gap: 0.1in;
        }
        .label {
          margin: 0 0 0.04in;
          color: #64748b;
          font-size: 0.075in;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .value {
          margin: 0;
          font-size: 0.12in;
          font-weight: 700;
        }
        .small-seal {
          justify-self: center;
          width: 0.5in;
          height: 0.5in;
          border-radius: 0.11in;
          background: #071a2f;
          display: grid;
          place-items: center;
        }
        .small-seal .mark {
          font-size: 0.19in;
        }
        .signature {
          justify-self: end;
          text-align: right;
          min-width: 1.8in;
        }
        .signature-name {
          margin: 0 0 0.06in;
          font-family: var(--font-newsreader-heavy), Georgia, serif;
          font-size: 0.18in;
          font-weight: 700;
        }
        .signature-line {
          width: 1.75in;
          height: 1px;
          background: rgba(7, 26, 47, 0.24);
          margin-left: auto;
          margin-bottom: 0.05in;
        }
        .signature-title,
        .footer {
          color: #64748b;
          font-family: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.08in;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .footer {
          position: absolute;
          left: 0.5in;
          right: 0.5in;
          bottom: 0.18in;
          text-align: center;
          text-transform: none;
          letter-spacing: 0.04em;
        }
        .verify {
          margin: 0 0 0.04in;
          color: #64748b;
          font-size: 0.09in;
        }
        .note {
          margin: 0;
          color: #64748b;
          font-size: 0.075in;
        }
      `}</style>
      <section className="frame" aria-label="Certificate of completion">
        <header className="header">
          <div className="seal"><BracketMark /></div>
          <p className="kicker">The AI Banking Institute</p>
          <h1>Certificate of Completion</h1>
          <div className="divider" />
        </header>

        <section className="recipient">
          <p className="honors">This certifies that</p>
          <p className="name">{certificate.holder_name}</p>
          <p className="curriculum">has completed the curriculum of</p>
          <p className="designation">{designation}</p>
        </section>

        <section className="bottom">
          <div className="metadata">
            <div>
              <p className="label">Issue Date</p>
              <p className="value">{formatCertificateDate(certificate.issued_at)}</p>
            </div>
            <div>
              <p className="label">Certificate ID</p>
              <p className="value">{certificate.certificate_id}</p>
            </div>
          </div>
          <div className="small-seal"><BracketMark /></div>
          <div className="signature">
            <p className="signature-name">The Digital Curator</p>
            <div className="signature-line" />
            <p className="signature-title">The AI Banking Institute</p>
          </div>
        </section>

        <footer className="footer">
          <p className="verify">{verificationUrl}</p>
          <p className="note">Issued after course completion and final packet submission - not a test score</p>
        </footer>
      </section>
    </main>
  );
}
