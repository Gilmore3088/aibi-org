// SubmissionQueue — server component.
// Renders a table of pending/resubmitted submissions for the reviewer.
// Each row links to /admin/reviewer/[id].

// Supabase returns related rows as an array even for to-one FK relations.
interface SubmissionRow {
  id: string;
  review_status: string;
  submitted_at: string;
  enrollment_id: string;
  course_enrollments: Array<{ email: string }> | null;
}

interface SubmissionQueueProps {
  readonly submissions: SubmissionRow[];
}

export function SubmissionQueue({ submissions }: SubmissionQueueProps) {
  if (submissions.length === 0) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 px-6 py-10 text-center">
        <p className="font-sans text-sm text-gray-500">No submissions awaiting review.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-gray-200">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Learner</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Submitted</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => {
            const isResubmission = submission.review_status === 'resubmitted';
            const submittedDate = new Date(submission.submitted_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const submittedTime = new Date(submission.submitted_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <tr
                key={submission.id}
                className={`border-b border-gray-100 last:border-b-0 ${
                  isResubmission ? 'border-l-2' : ''
                }`}
                style={
                  isResubmission
                    ? { borderLeftColor: 'var(--color-terra, #b5512e)' }
                    : undefined
                }
              >
                <td className="px-4 py-3">
                  {isResubmission ? (
                    <span
                      className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: 'var(--color-terra, #b5512e)' }}
                    >
                      Resubmitted
                    </span>
                  ) : (
                    <span className="inline-block rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {submission.course_enrollments?.[0]?.email ?? (
                    <span className="text-gray-400">Unknown</span>
                  )}
                </td>
                <td
                  className="px-4 py-3 text-gray-600"
                  style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '0.8125rem' }}
                >
                  {submittedDate} {submittedTime}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/admin/reviewer/${submission.id}`}
                    className="font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-terra, #b5512e)' }}
                  >
                    Review
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
