import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';
import { VerifyLookupForm } from './VerifyLookupForm';

export const metadata: Metadata = {
  title: 'Verify Certificate — The AI Banking Institute',
  description:
    'Look up an AI Banking Institute certificate by ID. Verification confirms the certificate record only, not regulator or third-party endorsement.',
  alternates: { canonical: '/verify' },
};

export default function VerifyCertificateLookupPage() {
  return (
    <MockupShell
      activePath="/verify"
      cta={{ label: 'Start free assessment', href: '/assessment/take' }}
      eyebrow="Certificate lookup"
      title={
        <>
          Verify an <strong>AiBI</strong> certificate.
        </>
      }
      lede={
        <>
          Enter the certificate ID printed on the credential. Verification
          confirms the Institute certificate record only; it is not regulator,
          examiner, or third-party endorsement.
        </>
      }
      heroAside={
        <aside
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: 26,
            color: '#fff',
            display: 'grid',
            gap: 14,
          }}
          aria-label="Verification boundaries"
        >
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-inter)',
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
            }}
          >
            What this confirms
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              display: 'grid',
              gap: 10,
              fontFamily: 'var(--font-inter)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.82)',
            }}
          >
            <li>The certificate ID exists.</li>
            <li>The holder name and issue date match the record.</li>
            <li>The credential was issued by The AI Banking Institute.</li>
          </ul>
        </aside>
      }
      sections={[
        {
          kicker: 'Lookup',
          heading: <>Enter the certificate ID</>,
          lede:
            'Certificate IDs use the AIBIP-year-code format. If the ID is not found, ask the certificate holder to confirm the exact ID printed on their credential.',
          body: <VerifyLookupForm />,
          surface: 'white',
        },
      ]}
    />
  );
}
