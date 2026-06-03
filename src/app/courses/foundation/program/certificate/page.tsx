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
import { Monogram } from '@/components/brand';
import type { Certificate } from '@/types/course';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

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

  // All modules complete, but no lab submitted yet.
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

// Shared inline styles — kept here rather than a CSS module so this file
// stays self-contained and matches the per-page sketch convention.
const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const META_LABEL: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
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
          <p style={{ color: 'var(--slate-600)', fontSize: 15, margin: 0 }}>
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

  // Look up certificate
  const { data: certData } = await serviceClient
    .from('certificates')
    .select('id, enrollment_id, certificate_id, holder_name, designation, issued_at')
    .eq('enrollment_id', enrollment.id)
    .maybeSingle();

  const certificate = certData as Certificate | null;

  const verificationUrl = certificate
    ? `https://aibankinginstitute.com/verify/${certificate.certificate_id}`
    : null;

  // Build an honest "not issued yet" state from real progress + Final
  // Foundation Lab review status (foundation-cx F3).
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
        {/* Page header */}
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
            {/* The credential document itself */}
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

              {/* Brand v1 (2026-05-28) — bracketed [Ai] mark inside a
                  navy rounded-square. Replaces the retired landmark seal. */}
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

                {/* Hairline divider */}
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

            {/* Action grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginBottom: 32,
              }}
            >
              {/* LinkedIn placeholder */}
              <section
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 'var(--r-lg)',
                  padding: 24,
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--ink)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--gold-soft)',
                      fontFamily: INTER_STACK,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    in
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    margin: '0 0 8px',
                  }}
                >
                  Add to LinkedIn
                </h3>
                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--slate-600)',
                    margin: '0 0 14px',
                  }}
                >
                  LinkedIn badge integration is coming. In the meantime,
                  reference your credential as:
                </p>
                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 12,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: 'var(--ink)',
                    background: 'var(--cream)',
                    border: '1px solid var(--ink-a10)',
                    borderRadius: 8,
                    padding: 12,
                    margin: 0,
                  }}
                >
                  AiBI-Foundation · The AI Banking Institute
                  <br />
                  Verified at aibankinginstitute.com/verify/{certificate.certificate_id}
                </p>
              </section>

              {/* Download PDF */}
              <section
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 'var(--r-lg)',
                  padding: 24,
                  boxShadow: 'var(--shadow-soft)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--gold)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                  aria-hidden
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ width: 18, height: 18, color: 'var(--ink)' }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a.75.75 0 01.75.75v9.69l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V3.75A.75.75 0 0110 3z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M3 14.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    margin: '0 0 8px',
                  }}
                >
                  Download PDF
                </h3>
                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--slate-600)',
                    margin: '0 0 16px',
                    flex: 1,
                  }}
                >
                  High-resolution vector format, suitable for framing
                  or sharing with your board.
                </p>
                <a
                  href={`/api/courses/generate-certificate?enrollmentId=${enrollment.id}`}
                  download={`AiBI-Foundation-Certificate-${certificate.certificate_id}.pdf`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: 'var(--ink)',
                    color: '#FFFFFF',
                    fontFamily: INTER_STACK,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '12px 16px',
                    borderRadius: 'var(--r-md)',
                    textDecoration: 'none',
                  }}
                >
                  Download Certificate
                </a>
              </section>

              {/* What's next — institutional CTA, on-dark + gold accent */}
              <section
                style={{
                  background: 'var(--ink)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--r-lg)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-feature)',
                }}
              >
                <div>
                  <p
                    style={{
                      ...KICKER,
                      color: 'var(--gold-soft)',
                      marginBottom: 12,
                    }}
                  >
                    What&rsquo;s Next
                  </p>
                  <h3
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      color: '#FFFFFF',
                      margin: '0 0 12px',
                    }}
                  >
                    Bring it to your institution.
                  </h3>
                  <p
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: 'var(--on-dark-80)',
                      margin: '0 0 18px',
                    }}
                  >
                    Coached cohorts at $199 per seat for ten or more. Aggregate
                    dashboard for your champion.
                  </p>
                </div>
                <a
                  href="/for-institutions"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: 'var(--gold)',
                    color: 'var(--ink)',
                    fontFamily: INTER_STACK,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '12px 16px',
                    borderRadius: 'var(--r-md)',
                    textDecoration: 'none',
                  }}
                >
                  See Institutional Engagement
                </a>
              </section>
            </div>
          </>
        ) : (
          /* Certificate not yet issued */
          <div
            style={{
              textAlign: 'center',
              background: 'var(--cream)',
              border: '1px solid var(--ink-a10)',
              borderRadius: 'var(--r-xl)',
              padding: '56px 32px',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: 'var(--gold-a20)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ width: 32, height: 32, color: 'var(--gold-deep)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2
              style={{
                fontFamily: INTER_STACK,
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '-0.01em',
                margin: '0 0 12px',
              }}
            >
              {pendingState?.title}
            </h2>
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--slate-600)',
                maxWidth: 460,
                margin: '0 auto 24px',
              }}
            >
              {pendingState?.body}
            </p>
            {pendingState?.progress && (
              <div style={{ maxWidth: 320, margin: '0 auto 28px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    ...META_LABEL,
                    marginBottom: 6,
                  }}
                >
                  <span>Course progress</span>
                  <span>
                    {pendingState.progress.done} / {pendingState.progress.total} modules
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={pendingState.progress.done}
                  aria-valuemin={0}
                  aria-valuemax={pendingState.progress.total}
                  aria-label="Modules completed"
                  style={{
                    height: 8,
                    background: 'var(--ink-a10)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((pendingState.progress.done / pendingState.progress.total) * 100)}%`,
                      background: 'var(--gold)',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            )}
            <a
              href={pendingState?.ctaHref ?? '/courses/foundation/program'}
              style={{
                display: 'inline-block',
                background: 'var(--ink)',
                color: '#FFFFFF',
                fontFamily: INTER_STACK,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '12px 24px',
                borderRadius: 'var(--r-md)',
                textDecoration: 'none',
              }}
            >
              {pendingState?.ctaLabel ?? 'Back to the course'}
            </a>
          </div>
        )}
      </div>
    </CourseShellWrapper>
  );
}

/**
 * Brand v1 (2026-05-28) — navy rounded-square containing the bracketed
 * `[Ai]` mark. Mirrors `public/brand/aibi-app-icon.svg` at React component
 * sizing. Stands in for the retired landmark-seal lockup; the credential
 * body still names the Institute in full so the symbol carries the brand
 * without duplication.
 */
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
