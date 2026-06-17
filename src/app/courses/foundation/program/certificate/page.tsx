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
import { CourseShellWrapper } from "@/components/lms/CourseShellWrapper";
import type { Certificate } from '@/types/course';
import { formatDate } from './_lib/formatDate';
import { CertificateCard } from './_components/CertificateCard';
import { CertificateMeta } from './_components/CertificateMeta';
import { CertificatePending } from './_components/CertificatePending';

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

const TOTAL_MODULES = 12;

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
// F3). Branch on real progress + Final Foundation Lab review state instead.
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
      body: `Your AiBI-Foundation credential is issued once you complete all ${TOTAL_MODULES} modules and submit your Final Foundation Lab. Pick up where you left off — each module ends with a saved artifact you can use at work.`,
      ctaHref: continueHref,
      ctaLabel: 'Continue the course',
      progress: { done: completedCount, total: TOTAL_MODULES },
    };
  }

  if (submissionStatus === 'approved') {
    return {
      title: 'Your credential is being generated',
      body: 'Your Final Foundation Lab has been reviewed and approved. The credential will appear here shortly — refresh this page in a moment.',
      ctaHref: '/courses/foundation/program/certificate',
      ctaLabel: 'Refresh page',
      progress: null,
    };
  }

  if (submissionStatus === 'pending' || submissionStatus === 'resubmitted') {
    return {
      title: 'Your Final Foundation Lab is under review',
      body: "You've completed all 12 modules and submitted your Final Foundation Lab. We review submissions within a few business days; your credential appears here as soon as it's approved.",
      ctaHref: '/courses/foundation/program',
      ctaLabel: 'Back to the course',
      progress: { done: TOTAL_MODULES, total: TOTAL_MODULES },
    };
  }

  if (submissionStatus === 'failed') {
    return {
      title: 'Your Final Foundation Lab needs another pass',
      body: 'Your submission came back with reviewer feedback. Revise it against the notes and resubmit — the credential issues once the revised lab is approved.',
      ctaHref: submitHref,
      ctaLabel: 'Review feedback and resubmit',
      progress: { done: TOTAL_MODULES, total: TOTAL_MODULES },
    };
  }

  return {
    title: 'One step left: submit your Final Foundation Lab',
    body: "You've completed all 12 modules. Submit your Final Foundation Lab — the capstone that pulls your saved artifacts together — to earn your AiBI-Foundation credential.",
    ctaHref: submitHref,
    ctaLabel: 'Submit Final Lab',
    progress: { done: TOTAL_MODULES, total: TOTAL_MODULES },
  };
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

  const certificate = certData as Certificate | null;

  const verificationUrl = certificate
    ? `https://aibankinginstitute.com/verify/${certificate.certificate_id}`
    : null;

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

    pendingState = derivePendingState({
      allModulesComplete,
      completedCount: completedModules.length,
      submissionStatus,
    });
  }

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
            />
          </>
        ) : (
          pendingState && <CertificatePending pendingState={pendingState} />
        )}
      </div>
    </CourseShellWrapper>
  );
}
