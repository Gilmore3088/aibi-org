// Work product submission page — /courses/foundation/program/submit
//
// Server Component: enrollment check + module completion check happen at render time.
// Delegates interactive form to WorkProductForm (client component).
//
// Layout (audit §9 redesign — 2026-05-27):
//   1. SubmissionArtifactHero — the four-item package the learner is submitting,
//      shown as the artifact (not abstract copy). Sets the promise.
//   2. Status panel — gate, under-review, approved, or "ready to submit" form.
//   3. RubricAccordion — quiet, opens to the five reviewer checks.
//
// Access rules unchanged:
//   - Unauthenticated / not enrolled → redirect to /courses/foundation/program/purchase
//   - Enrolled but not all 12 modules complete → show completion gate message
//   - Submission pending or under re-review → show "under review" message
//   - Submission approved → show "approved" message with certificate link
//   - Submission failed (no prior resubmission) → form in resubmission mode
//   - No submission → form in initial submission mode

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import { WorkProductForm } from '../_components/WorkProductForm';
import type { WorkSubmission } from '@/types/course';
import { SubmissionArtifactHero } from './_local/SubmissionArtifactHero';
import { RubricAccordion } from './_local/RubricAccordion';

export const metadata: Metadata = {
  title: 'Work Product Submission | AiBI-Foundation',
};

const ALL_MODULES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const REVIEW_TURNAROUND_BUSINESS_DAYS = 5;

function allModulesComplete(completedModules: readonly number[]): boolean {
  return ALL_MODULES.every((m) => completedModules.includes(m));
}

const kicker = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-deep)',
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
  fontSize: 11,
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
  if (isSupabaseConfigured()) {
    const serviceClient = createServiceRoleClient();
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
  const status = submission?.review_status ?? null;
  const showForm = modulesComplete && (!submission || status === 'failed');

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Work Product']}>
      <SubmissionArtifactHero />

      <article>
        {!modulesComplete && (
          <div style={statusPanel}>
            <p style={{ ...kicker, margin: '0 0 8px' }}>Course incomplete</p>
            <p
              style={{
                fontSize: 16,
                color: 'var(--ink)',
                margin: '0 0 16px',
                lineHeight: 1.55,
              }}
            >
              Complete all 12 modules before submitting your work product.
            </p>
            <a href="/courses/foundation/program" style={inlineCtaInk}>
              Return to course
            </a>
          </div>
        )}

        {modulesComplete && submission &&
          (status === 'pending' || status === 'resubmitted') && (
          <div style={statusPanel}>
            <p style={{ ...kicker, margin: '0 0 8px' }}>Your work is in review</p>
            <p
              style={{
                fontSize: 16,
                color: 'var(--ink)',
                margin: '0 0 6px',
                lineHeight: 1.55,
              }}
            >
              Typical turnaround is {REVIEW_TURNAROUND_BUSINESS_DAYS} business days.
              You will receive an email when your score is issued — no need to refresh this page.
            </p>
            <p
              style={{
                fontSize: 14,
                color: 'var(--slate-500)',
                margin: 0,
                lineHeight: 1.55,
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
            <p
              style={{
                ...kicker,
                color: 'var(--emerald-700)',
                margin: '0 0 8px',
              }}
            >
              Approved
            </p>
            <p
              style={{
                fontSize: 16,
                color: 'var(--ink)',
                margin: '0 0 16px',
                lineHeight: 1.55,
              }}
            >
              Your work product has been approved. Your AiBI-Foundation credential has been issued.
            </p>
            <a
              href="/courses/foundation/program/certificate"
              style={{
                ...inlineCtaInk,
                background: 'var(--emerald-700)',
                color: 'var(--cream)',
              }}
            >
              View certificate
            </a>
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
