// /admin/reviewer/[id] — Individual submission review page.
// Server component. Shows all 4 submission items + RubricForm.
// Auth is handled by layout.tsx. Fetches submission by ID using service role.

import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { getPublicUrl } from '@/lib/supabase/storage';
import { RubricForm } from '../_components/RubricForm';
import type { WorkSubmission } from '@/types/course';

interface ReviewDetailPageProps {
  params: { id: string };
}

interface SubmissionWithEmail extends WorkSubmission {
  course_enrollments: {
    email: string;
    id: string;
  } | null;
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { id } = params;

  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from('work_submissions')
    .select(
      'id, enrollment_id, skill_file_url, input_text, raw_output_text, edited_output_text, annotation_text, submitted_at, reviewer_id, review_scores, review_feedback, review_status, reviewed_at, course_enrollments(id, email)',
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const submission = data as SubmissionWithEmail;
  const alreadyReviewed =
    submission.review_status !== 'pending' && submission.review_status !== 'resubmitted';

  const submittedDate = new Date(submission.submitted_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build a download URL for the skill file. Because the bucket is private,
  // getPublicUrl may not work in production — this serves as a best-effort URL.
  // Phase 8 can switch to signed URLs with expiry if needed.
  const skillFileDownloadUrl = getPublicUrl(submission.skill_file_url);
  const skillFilename = submission.skill_file_url.split('/').pop() ?? 'skill-file';

  return (
    <div>
      {/* Back link */}
      <a
        href="/admin/reviewer"
        className="mb-6 inline-flex items-center gap-1 font-sans text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
      >
        &larr; Back to queue
      </a>

      {/* Submission header */}
      <div className="mb-8 mt-4">
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="font-serif text-xl text-gray-900"
              style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)' }}
            >
              {submission.course_enrollments?.email ?? 'Unknown Learner'}
            </h2>
            <p className="mt-1 font-sans text-sm text-gray-500">
              Submitted {submittedDate} &middot; Status:{' '}
              <span className="font-medium capitalize">{submission.review_status}</span>
            </p>
          </div>

          {submission.review_status === 'resubmitted' && (
            <span
              className="rounded px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--color-terra, #b5512e)' }}
            >
              Resubmission
            </span>
          )}
        </div>
      </div>

      {/* Already reviewed message */}
      {alreadyReviewed && (
        <div className="mb-8 rounded border border-gray-200 bg-gray-50 px-4 py-3 font-sans text-sm text-gray-600">
          This submission has already been reviewed (status:{' '}
          <span className="font-medium capitalize">{submission.review_status}</span>).
          {submission.reviewed_at && (
            <span>
              {' '}
              Reviewed on{' '}
              {new Date(submission.reviewed_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              .
            </span>
          )}
        </div>
      )}

      {/* Submission content */}
      <div className="space-y-6">
        {/* Item 1: Skill file */}
        <section>
          <h3 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wider text-gray-500">
            1. Skill File
          </h3>
          <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3">
            <a
              href={skillFileDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm font-medium underline underline-offset-2"
              style={{ color: 'var(--color-terra, #b5512e)' }}
            >
              {skillFilename}
            </a>
            <p className="mt-1 font-sans text-xs text-gray-400">
              Opens in new tab via Supabase Storage
            </p>
          </div>
        </section>

        {/* Item 2: Input text */}
        <section>
          <h3 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wider text-gray-500">
            2. Input (Prompt)
          </h3>
          <pre
            className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded border border-gray-200 px-4 py-3 font-mono text-sm text-gray-800"
            style={{ backgroundColor: 'var(--color-parch, #f5f0e6)' }}
          >
            {submission.input_text}
          </pre>
        </section>

        {/* Item 3: Raw AI output */}
        <section>
          <h3 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wider text-gray-500">
            3. Raw AI Output
          </h3>
          <pre
            className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded border border-gray-200 px-4 py-3 font-mono text-sm text-gray-800"
            style={{ backgroundColor: 'var(--color-parch, #f5f0e6)' }}
          >
            {submission.raw_output_text}
          </pre>
        </section>

        {/* Item 4: Edited output + annotation */}
        <section>
          <h3 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wider text-gray-500">
            4. Edited Output + Annotation
          </h3>
          <pre
            className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded border border-gray-200 px-4 py-3 font-mono text-sm text-gray-800"
            style={{ backgroundColor: 'var(--color-parch, #f5f0e6)' }}
          >
            {submission.edited_output_text}
          </pre>
          {submission.annotation_text && (
            <pre
              className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded border border-gray-200 px-4 py-3 font-mono text-sm text-gray-700 italic"
              style={{ backgroundColor: 'var(--color-parch, #f5f0e6)' }}
            >
              {submission.annotation_text}
            </pre>
          )}
        </section>
      </div>

      {/* Prior review feedback (resubmission case) */}
      {submission.review_status === 'resubmitted' && submission.review_feedback && (
        <div className="mt-8 rounded border border-blue-200 bg-blue-50 px-4 py-4">
          <h3 className="mb-2 font-sans text-sm font-semibold text-blue-800">
            Prior Review Feedback
          </h3>
          <p className="font-sans text-sm text-blue-700 whitespace-pre-wrap">
            {submission.review_feedback}
          </p>
        </div>
      )}

      {/* Rubric form — only shown when submission is reviewable */}
      {!alreadyReviewed && (
        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2
            className="mb-6 font-serif text-xl text-gray-900"
            style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)' }}
          >
            Score This Submission
          </h2>
          <RubricForm submissionId={submission.id} />
        </div>
      )}
    </div>
  );
}
