// Work product submission page — /courses/aibi-p/submit
//
// Server Component: enrollment check + module completion check happen at render time.
// Delegates interactive form to WorkProductForm (client component).
//
// Access rules:
//   - Unauthenticated / not enrolled → redirect to /courses/aibi-p/purchase
//   - Enrolled but not all 12 modules complete → show completion gate message
//   - Submission pending or under re-review → show "under review" message
//   - Submission approved → show "approved" message with certificate link
//   - Submission failed (no prior resubmission) → form in resubmission mode
//   - No submission → form in initial submission mode

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { WorkProductForm } from '../_components/WorkProductForm';
import type { WorkSubmission } from '@/types/course';

export const metadata: Metadata = {
  title: 'Work Product Submission | AiBI-Practitioner',
};

const ALL_MODULES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function allModulesComplete(completedModules: readonly number[]): boolean {
  return ALL_MODULES.every((m) => completedModules.includes(m));
}

export default async function SubmitPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/courses/aibi-p/purchase');
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
    <>
      {/* Terra-colored header band matching module page pattern */}
      <div className="bg-[color:var(--color-terra)] text-[color:var(--color-linen)] py-10 px-6">
        <div className="mx-auto px-8 lg:px-16">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra-pale)] mb-2">
            AiBI-Practitioner Certification
          </p>
          <h1 className="font-serif text-3xl font-bold mb-2">Work Product Submission</h1>
          <p className="font-sans text-sm text-[color:var(--color-terra-pale)] leading-relaxed max-w-2xl">
            Submit your four-item work product package to earn the AiBI-Practitioner credential.
            A reviewer will assess your submission against the five-dimension rubric
            within five business days.
          </p>
        </div>
      </div>

      <article className="mx-auto px-8 lg:px-16 px-6 lg:px-8 py-10">

        {/* Module completion gate */}
        {!modulesComplete && (
          <div className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm p-6 bg-[color:var(--color-parch)]"
               style={{ borderLeftColor: 'var(--color-terra)' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
              Course Incomplete
            </p>
            <p className="font-sans text-base text-[color:var(--color-ink)] mb-4">
              Complete all 12 modules before submitting your work product.
            </p>
            <a
              href="/courses/aibi-p"
              className="inline-block px-5 py-2 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
            >
              Return to Course
            </a>
          </div>
        )}

        {/* Submission status — pending or resubmitted */}
        {modulesComplete && submission &&
          (submission.review_status === 'pending' || submission.review_status === 'resubmitted') && (
          <div className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm p-6 bg-[color:var(--color-parch)]"
               style={{ borderLeftColor: 'var(--color-cobalt)' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)] mb-2">
              Under Review
            </p>
            <p className="font-sans text-base text-[color:var(--color-ink)] mb-2">
              Your submission is under review.
            </p>
            <p className="font-sans text-sm text-[color:var(--color-slate)]">
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

        {/* Submission status — approved */}
        {modulesComplete && submission && submission.review_status === 'approved' && (
          <div className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm p-6 bg-[color:var(--color-parch)]"
               style={{ borderLeftColor: 'var(--color-sage)' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)] mb-2">
              Approved
            </p>
            <p className="font-sans text-base text-[color:var(--color-ink)] mb-4">
              Your work product has been approved. Your AiBI-Practitioner credential has been issued.
            </p>
            <a
              href="/courses/aibi-p/certificate"
              className="inline-block px-5 py-2 bg-[color:var(--color-sage)] hover:opacity-90 text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2"
            >
              View Certificate
            </a>
          </div>
        )}

        {/* Submission form — initial or resubmission */}
        {modulesComplete && (!submission || submission.review_status === 'failed') && (
          <WorkProductForm
            enrollmentId={enrollment.id}
            isResubmission={submission?.review_status === 'failed'}
            reviewFeedback={submission?.review_feedback ?? null}
          />
        )}

      </article>
    </>
  );
}
