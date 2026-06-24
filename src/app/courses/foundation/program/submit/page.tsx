// Work product submission page — /courses/foundation/program/submit
//
// Server Component: enrollment check + module completion check happen at render time.
// Delegates interactive form to WorkProductForm (client component).
//
// Layout (audit §9 redesign — 2026-05-27):
//   1. SubmissionArtifactHero — the final-packet work product the learner is
//      submitting, shown as concrete evidence (not abstract copy).
//   2. Status panel — gate, finalizing, approved, or "ready to submit" form.
//   3. RubricAccordion — quiet, opens to the five completion-gate checks.
//
// Access rules unchanged:
//   - Unauthenticated / not enrolled → redirect to /courses/foundation/program/purchase
//   - Enrolled but not all modules complete → show completion gate message
//   - Submission pending or under re-review → auto-approve and issue where possible
//   - Submission approved → ensure certificate exists and show certificate link
//   - Submission failed (no prior resubmission) → form in resubmission mode
//   - No submission → form in initial submission mode

import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { issueCertificateForEnrollment } from '@/lib/certificates/issue';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import { WorkProductForm } from '../_components/WorkProductForm';
import type { WorkSubmission } from '@/types/course';
import { SubmissionArtifactHero } from './_local/SubmissionArtifactHero';
import { RubricAccordion } from './_local/RubricAccordion';
import { modules } from '@content/courses/foundation-program';

export const metadata: Metadata = {
  title: 'Work Product Submission | AiBI-Foundation',
};

const ALL_MODULES = modules.map((module) => module.number);
function allModulesComplete(completedModules: readonly number[]): boolean {
  return ALL_MODULES.every((m) => completedModules.includes(m));
}

const kicker = {
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  padding: '6px 14px',
  borderRadius: 999,
  background: 'var(--gold-a10)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-deep)',
};

const kickerApproved = {
  ...kicker,
  background: 'var(--emerald-50)',
  color: 'var(--emerald-700)',
};

const statusPanel = {
  border: '1px solid var(--ink-a10)',
  borderLeft: '4px solid var(--gold)',
  background: 'var(--cream-2)',
  borderRadius: 24,
  padding: '22px 24px',
  boxShadow: 'var(--shadow-soft)',
};

const inlineCtaInk = {
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  padding: '10px 18px',
  borderRadius: 12,
  background: 'var(--ink)',
  color: 'var(--cream-2)',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
};

export default async function SubmitPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  // Check for existing submission
  let submission: WorkSubmission | null = null;
  let serviceClient: ReturnType<typeof createServiceRoleClient> | null = null;
  if (isSupabaseConfigured()) {
    serviceClient = createServiceRoleClient();
    const { data } = await serviceClient
      .from('work_submissions')
      .select(
        'id, enrollment_id, skill_file_url, input_text, raw_output_text, edited_output_text, annotation_text, submitted_at, reviewer_id, review_scores, review_feedback, review_status, reviewed_at',
      )
      .eq('enrollment_id', enrollment.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      submission = data as WorkSubmission;
    }
  }

  const modulesComplete = allModulesComplete(enrollment.completed_modules);
  let status = submission?.review_status ?? null;

  if (
    modulesComplete &&
    serviceClient &&
    submission &&
    (status === 'pending' || status === 'resubmitted' || status === 'approved')
  ) {
    if (status !== 'approved') {
      const reviewedAt = new Date().toISOString();
      const { error } = await serviceClient
        .from('work_submissions')
        .update({
          review_status: 'approved',
          reviewed_at: reviewedAt,
          review_feedback:
            'Auto-approved after completion of all Foundation modules and final packet submission.',
        })
        .eq('id', submission.id);

      if (!error) {
        submission = {
          ...submission,
          review_status: 'approved',
          reviewed_at: reviewedAt,
          review_feedback:
            'Auto-approved after completion of all Foundation modules and final packet submission.',
        };
        status = 'approved';
      }
    }

    if (status === 'approved') {
      await issueCertificateForEnrollment({
        serviceClient,
        enrollmentId: enrollment.id,
      }).catch((error) => {
        console.warn('[submit] certificate auto-issue skip', error);
      });
    }
  }

  const showForm = modulesComplete && (!submission || status === 'failed');

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Work Product']}>
      <SubmissionArtifactHero />

      <article>
        {!modulesComplete && (
          <div style={statusPanel}>
            <span style={{ ...kicker, marginBottom: 12 }}>Course incomplete</span>
            <p
              style={{
                fontSize: 16,
                color: 'var(--ink)',
                margin: '0 0 16px',
                lineHeight: 1.6,
              }}
            >
              Complete all {ALL_MODULES.length} modules before submitting your work product.
            </p>
            <Link href="/courses/foundation/program" style={inlineCtaInk}>
              Return to course
            </Link>
          </div>
        )}

        {modulesComplete && submission &&
          (status === 'pending' || status === 'resubmitted') && (
          <div style={statusPanel}>
            <span style={{ ...kicker, marginBottom: 12 }}>Your work is in review</span>
            <p
              style={{
                fontSize: 16,
                color: 'var(--ink)',
                margin: '0 0 6px',
                lineHeight: 1.6,
              }}
            >
              Your final packet is saved. The automatic completion gate will issue
              your credential as soon as the certificate service finishes processing.
            </p>
            <p
              style={{
                fontSize: 16,
                color: 'var(--slate-500)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Submitted{' '}
              {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              .
            </p>
          </div>
        )}

        {modulesComplete && submission && status === 'approved' && (
          <div
            style={{
              ...statusPanel,
              borderLeftColor: 'var(--emerald-700)',
            }}
          >
            <span style={{ ...kickerApproved, marginBottom: 12 }}>
              Approved
            </span>
            <p
              style={{
                fontSize: 16,
                color: 'var(--ink)',
                margin: '0 0 16px',
                lineHeight: 1.6,
              }}
            >
              Your work product has been approved. Your AiBI-Foundation credential has been issued.
            </p>
            <Link
              href="/courses/foundation/program/certificate"
              style={{
                ...inlineCtaInk,
                background: 'var(--emerald-700)',
                color: 'var(--cream)',
              }}
            >
              View certificate
            </Link>
          </div>
        )}

        {showForm && (
          <div style={{ marginTop: 8 }}>
            <WorkProductForm
              enrollmentId={enrollment.id}
              isResubmission={status === 'failed'}
              reviewFeedback={submission?.review_feedback ?? null}
            />
          </div>
        )}

        <RubricAccordion />
      </article>
    </CourseShellWrapper>
  );
}
