// Learner certificate page — /courses/foundation/program/certificate
// Server component. Authenticates the user, looks up their certificate,
// and renders download + LinkedIn placeholder sections.
// Per CERT-04: learner can download PDF from this page.
//
// Ported to the mockup design system 2026-05-27 (Inter, ink/cream/gold).
// PDF rendering pathway is independent (src/lib/pdf/CertificateDocument)
// and intentionally unchanged.

import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import type { Certificate } from '@/types/course';
import { INTER_STACK, KICKER, formatDate } from './_local/certificateStyles';
import { CertificateDocument } from './_local/CertificateDocument';
import { CertificateActions } from './_local/CertificateActions';
import { CertificatePending } from './_local/CertificatePending';
import { ServiceUnavailable } from './_local/ServiceUnavailable';

export const metadata = {
  title: 'Your Certificate — AiBI-Foundation | The AI Banking Institute',
  description: 'Download your AiBI-Foundation certificate.',
};

export default async function CertificatePage() {
  if (!isSupabaseConfigured()) {
    return <ServiceUnavailable />;
  }

  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  const serviceClient = createServiceRoleClient();

  const { data: certData } = await serviceClient
    .from('certificates')
    .select('id, enrollment_id, certificate_id, holder_name, designation, issued_at')
    .eq('enrollment_id', enrollment.id)
    .maybeSingle();

  const certificate = certData as Certificate | null;

  const verificationUrl = certificate
    ? `https://aibankinginstitute.com/verify/${certificate.certificate_id}`
    : null;

  return (
    <CourseShellWrapper
      crumbs={['Education', 'AiBI-Foundation', 'Certificate']}
      contentMaxWidth={780}
    >
      <div style={{ fontFamily: INTER_STACK, color: 'var(--ink)' }}>
        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <p style={{ ...KICKER, marginBottom: 12 }}>The AI Banking Institute</p>
          <h1
            style={{
              fontFamily: INTER_STACK,
              fontWeight: 700,
              fontSize: 'clamp(34px, 4.5vw, 48px)',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              margin: '0 0 12px',
              color: 'var(--ink)',
            }}
          >
            {certificate ? 'Your Credential' : 'Credential Pending'}
          </h1>
          {certificate && (
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 14,
                color: 'var(--slate-600)',
                margin: 0,
              }}
            >
              Awarded to{' '}
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
                {certificate.holder_name}
              </span>{' '}
              on {formatDate(certificate.issued_at)}
            </p>
          )}
        </header>

        {certificate ? (
          <>
            <CertificateDocument
              certificate={certificate}
              verificationUrl={verificationUrl}
            />
            <CertificateActions
              enrollmentId={enrollment.id}
              certificateId={certificate.certificate_id}
            />
          </>
        ) : (
          <CertificatePending />
        )}
      </div>
    </CourseShellWrapper>
  );
}
