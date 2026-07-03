// Learner certificate page — /courses/foundation/program/certificate
// Server component. Authenticates the user, looks up their certificate,
// and renders download + credential-sharing sections.
// Per CERT-04: learner can download PDF from this page.
//
// Ported to the mockup design system 2026-05-27 (Inter, ink/cream/gold).
// PDF rendering is independent of this page: buildCertificatePdfBuffer
// (src/lib/certificates/pdf.ts) renders /verify/[certificateId]/print via
// Puppeteer/Chromium. There is no @react-pdf path in the certificate chain.

import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { issueCertificateForEnrollment } from '@/lib/certificates/issue';
import { CourseShellWrapper } from "@/components/lms/CourseShellWrapper";
import type { Certificate } from '@/types/course';
import { formatDate } from './_lib/formatDate';
import { CertificateCard } from './_components/CertificateCard';
import { CertificateMeta } from './_components/CertificateMeta';
import { CertificatePending } from './_components/CertificatePending';
import { TrainingRecordPanel } from './_components/TrainingRecordPanel';
import { foundationCourseConfig } from '@content/courses/foundation-program';

const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const TOTAL_MODULES = foundationCourseConfig.modules.length;
const PEER_REFERRAL_URL = 'https://www.aibankinginstitute.com/assessment/take?ref=foundation-certificate';

interface PendingState {
  readonly title: string;
  readonly body: string;
  readonly ctaHref: string;
  readonly ctaLabel: string;
  readonly progress: { readonly done: number; readonly total: number } | null;
}

// Honest copy for the "no certificate yet" state. The old page told every
// learner without a certificate that their "submission has been reviewed and
// approved" — false for anyone still working through the course (foundation-cx
// F3). Branch on real progress + Final Foundation Packet review state instead.
function derivePendingState(args: {
  readonly allModulesComplete: boolean;
  readonly completedCount: number;
  readonly submissionStatus: string | null;
}): PendingState {
  const { allModulesComplete, completedCount, submissionStatus } = args;
  const continueHref = '/courses/foundation/program';
  const submitHref = '/courses/foundation/program/submit';

  if (!allModulesComplete) {
    return {
      title: 'Finish the course to earn your credential',
      body: `Your AiBI-Foundation credential is issued once you complete all ${TOTAL_MODULES} modules and submit your Final Foundation Packet. Pick up where you left off — each module ends with a saved artifact you can use at work.`,
      ctaHref: continueHref,
      ctaLabel: 'Continue the course',
      progress: { done: completedCount, total: TOTAL_MODULES },
    };
  }

  if (submissionStatus === 'approved') {
    return {
      title: 'Your credential is being generated',
      body: 'Your Final Foundation Packet has been approved. The credential should appear here shortly - refresh this page in a moment.',
      ctaHref: '/courses/foundation/program/certificate',
      ctaLabel: 'Refresh page',
      progress: null,
    };
  }

  if (submissionStatus === 'pending' || submissionStatus === 'resubmitted') {
    return {
      title: 'Your Final Foundation Packet is being finalized',
      body: `You've completed all ${TOTAL_MODULES} modules and submitted your Final Foundation Packet. The automated completion gate issues your credential once the certificate service finishes processing.`,
      ctaHref: '/courses/foundation/program',
      ctaLabel: 'Back to the course',
      progress: { done: TOTAL_MODULES, total: TOTAL_MODULES },
    };
  }

  if (submissionStatus === 'failed') {
    return {
      title: 'Your Final Foundation Packet needs another pass',
      body: 'Your submission came back with reviewer feedback. Revise it against the notes and resubmit — the credential issues once the revised packet is approved.',
      ctaHref: submitHref,
      ctaLabel: 'Review feedback and resubmit',
      progress: { done: TOTAL_MODULES, total: TOTAL_MODULES },
    };
  }

  return {
    title: 'One step left: submit your Final Foundation Packet',
    body: `You've completed all ${TOTAL_MODULES} modules. Submit your Final Foundation Packet - the review-ready summary that pulls your saved artifacts together - to issue your AiBI-Foundation credential.`,
    ctaHref: submitHref,
    ctaLabel: 'Submit Final Packet',
    progress: { done: TOTAL_MODULES, total: TOTAL_MODULES },
  };
}

function ReferralPanel({
  certificateId,
  holderName,
}: {
  readonly certificateId: string;
  readonly holderName: string;
}) {
  const verifyUrl = `https://www.aibankinginstitute.com/verify/${certificateId}`;
  const mailBody = [
    'Hi,',
    '',
    `${holderName} completed the AiBI-Foundation credential and thought this might be useful for your team.`,
    '',
    `Start with the free AI readiness assessment: ${PEER_REFERRAL_URL}`,
    `Credential verification: ${verifyUrl}`,
    '',
    'The assessment takes about three minutes and does not require customer data.',
  ].join('\n');
  const mailtoHref = `mailto:?subject=${encodeURIComponent('AI readiness assessment referral')}&body=${encodeURIComponent(mailBody)}`;

  return (
    <section
      aria-labelledby="referral-panel-heading"
      style={{
        marginTop: 28,
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        background: '#fff',
        padding: 22,
        boxShadow: '0 18px 48px rgba(7, 26, 47, 0.06)',
      }}
    >
      <p style={{ ...KICKER, marginBottom: 10 }}>Referral</p>
      <h2
        id="referral-panel-heading"
        style={{
          margin: 0,
          color: 'var(--ink)',
          fontFamily: INTER_STACK,
          fontSize: 26,
          lineHeight: 1.12,
        }}
      >
        Refer a peer.
      </h2>
      <p
        style={{
          margin: '10px 0 18px',
          color: 'var(--slate-600)',
          fontFamily: INTER_STACK,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        Send a colleague the free three-minute assessment and your public
        credential verification link.
      </p>
      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <a
          href={PEER_REFERRAL_URL}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 46,
            borderRadius: 12,
            background: 'var(--ink)',
            color: 'var(--cream)',
            fontFamily: INTER_STACK,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Share assessment link
        </a>
        <a
          href={mailtoHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 46,
            borderRadius: 12,
            border: '1px solid var(--ink-a10)',
            color: 'var(--ink)',
            fontFamily: INTER_STACK,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Email referral
        </a>
      </div>
    </section>
  );
}

export const metadata = {
  title: 'Your Certificate — AiBI-Foundation | The AI Banking Institute',
  description: 'Download your AiBI-Foundation certificate.',
};

export default async function CertificatePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--cream)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: INTER_STACK,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: INTER_STACK,
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '0 0 12px',
              letterSpacing: '-0.01em',
            }}
          >
            Service Unavailable
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            The certificate service is not configured. Please contact support.
          </p>
        </div>
      </main>
    );
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

  let certificate = certData as Certificate | null;

  let pendingState: PendingState | null = null;
  if (!certificate) {
    const completedModules = enrollment.completed_modules ?? [];
    const allModulesComplete = Array.from({ length: TOTAL_MODULES }, (_, i) => i + 1).every((n) =>
      completedModules.includes(n),
    );

    let submissionStatus: string | null = null;
    const { data: sub } = await serviceClient
      .from('work_submissions')
      .select('review_status, status, created_at')
      .eq('enrollment_id', enrollment.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sub) {
      const row = sub as { review_status?: string | null; status?: string | null };
      submissionStatus = row.review_status ?? row.status ?? null;
    }

    if (
      allModulesComplete &&
      (submissionStatus === 'pending' ||
        submissionStatus === 'resubmitted' ||
        submissionStatus === 'approved')
    ) {
      if (submissionStatus !== 'approved') {
        const reviewedAt = new Date().toISOString();
        const { error } = await serviceClient
          .from('work_submissions')
          .update({
            review_status: 'approved',
            reviewed_at: reviewedAt,
            review_feedback:
              'Auto-approved after completion of all Foundation modules and final packet submission.',
          })
          .eq('enrollment_id', enrollment.id);

        if (!error) {
          submissionStatus = 'approved';
        }
      }

      if (submissionStatus === 'approved') {
        const issued = await issueCertificateForEnrollment({
          serviceClient,
          enrollmentId: enrollment.id,
        }).catch((error) => {
          console.warn('[certificate-page] certificate auto-issue skip', error);
          return null;
        });

        certificate = issued?.certificate as Certificate | null;
      }
    }

    pendingState = derivePendingState({
      allModulesComplete,
      completedCount: completedModules.length,
      submissionStatus,
    });
  }

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

        {certificate && verificationUrl ? (
          <>
            <CertificateCard
              holderName={certificate.holder_name}
              issuedAt={certificate.issued_at}
              certificateId={certificate.certificate_id}
              verificationUrl={verificationUrl}
            />
            <CertificateMeta
              certificateId={certificate.certificate_id}
              enrollmentId={enrollment.id}
              downloadFilename={`AiBI-Foundation-Certificate-${certificate.certificate_id}.pdf`}
              issuedAt={certificate.issued_at}
              verificationUrl={verificationUrl}
            />
            <TrainingRecordPanel
              holderName={certificate.holder_name}
              issuedAt={certificate.issued_at}
              verificationUrl={verificationUrl}
            />
            <ReferralPanel
              certificateId={certificate.certificate_id}
              holderName={certificate.holder_name}
            />
          </>
        ) : (
          pendingState && <CertificatePending pendingState={pendingState} />
        )}
      </div>
    </CourseShellWrapper>
  );
}
