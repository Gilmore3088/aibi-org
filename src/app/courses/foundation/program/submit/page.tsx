// Work product submission page — /courses/foundation/program/submit
//
// Server Component: enrollment check + module completion check happen at render time.
// Delegates interactive form to WorkProductForm (client component).
//
// Access rules:
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

export const metadata: Metadata = {
  title: 'Work Product Submission | AiBI-Foundation',
};

const ALL_MODULES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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

  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Work Product']}>
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <span style={kicker}>AiBI-Foundation Credential</span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-a10)' }} />
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: 'clamp(36px, 4.6vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 16px',
            color: 'var(--ink)',
          }}
        >
          Work product submission
        </h1>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.45,
            color: 'var(--slate-600)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          Submit your four-item package to earn the AiBI-Foundation credential. A
          reviewer will assess your submission against the five-dimension rubric
          within five business days.
        </p>
      </header>

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
            <a
              href="/courses/foundation/program"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 18px',
                borderRadius: 12,
                background: 'var(--ink)',
                color: 'var(--cream-2)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Return to course
            </a>
          </div>
        )}

        {modulesComplete && submission &&
          (submission.review_status === 'pending' || submission.review_status === 'resubmitted') && (
          <div style={statusPanel}>
            <p style={{ ...kicker, margin: '0 0 8px' }}>Under review</p>
            <p
              style={{
                fontSize: 16,
                color: 'var(--ink)',
                margin: '0 0 6px',
                lineHeight: 1.55,
              }}
            >
              Your submission is under review.
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
              . You will receive feedback within five business days.
            </p>
          </div>
        )}

        {modulesComplete && submission && submission.review_status === 'approved' && (
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
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 18px',
                borderRadius: 12,
                background: 'var(--emerald-700)',
                color: 'var(--cream)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              View certificate
            </a>
          </div>
        )}

        {modulesComplete && (!submission || submission.review_status === 'failed') && (
          <WorkProductForm
            enrollmentId={enrollment.id}
            isResubmission={submission?.review_status === 'failed'}
            reviewFeedback={submission?.review_feedback ?? null}
          />
        )}
      </article>
    </CourseShellWrapper>
  );
}
