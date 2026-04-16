// /admin/reviewer/ — Reviewer queue page.
// Server component. Shows pending + resubmitted submissions, resubmissions first.
// Auth is handled by layout.tsx — by the time this renders, reviewer is verified.

import { createServiceRoleClient } from '@/lib/supabase/client';
import { SubmissionQueue } from './_components/SubmissionQueue';

interface SubmissionRow {
  id: string;
  review_status: string;
  submitted_at: string;
  enrollment_id: string;
  course_enrollments: {
    email: string;
  } | null;
}

interface ReviewedCountRow {
  review_status: string;
}

export default async function ReviewerQueuePage() {
  const serviceClient = createServiceRoleClient();

  // Fetch pending + resubmitted submissions, resubmissions first, oldest first within each group.
  // Supabase doesn't support ORDER BY CASE directly, so we fetch all and sort in JS.
  const { data: rawSubmissions, error: queueError } = await serviceClient
    .from('work_submissions')
    .select('id, review_status, submitted_at, enrollment_id, course_enrollments(email)')
    .in('review_status', ['pending', 'resubmitted'])
    .order('submitted_at', { ascending: true });

  const submissions = (rawSubmissions ?? []) as SubmissionRow[];

  // Sort: resubmitted first, then pending; within each group: oldest first (already ascending).
  const sorted = [...submissions].sort((a, b) => {
    if (a.review_status === b.review_status) return 0;
    return a.review_status === 'resubmitted' ? -1 : 1;
  });

  // Count reviewed submissions for summary line.
  const { data: reviewedData, error: reviewedError } = await serviceClient
    .from('work_submissions')
    .select('review_status')
    .in('review_status', ['approved', 'failed']);

  const reviewedCount = reviewedError ? 0 : (reviewedData ?? []).length;

  const hasErrors = queueError !== null;

  return (
    <div>
      {hasErrors && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error loading queue. Please refresh.
        </p>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2
          className="font-serif text-xl text-gray-900"
          style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)' }}
        >
          Pending Reviews
        </h2>
        <p className="font-sans text-sm text-gray-500">
          {reviewedCount} submission{reviewedCount !== 1 ? 's' : ''} reviewed to date
        </p>
      </div>

      <SubmissionQueue submissions={sorted} />
    </div>
  );
}
