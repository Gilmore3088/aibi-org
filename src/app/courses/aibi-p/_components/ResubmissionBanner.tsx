// ResubmissionBanner — Displays reviewer feedback and resubmission notice
// above the WorkProductForm when isResubmission=true.

interface ResubmissionBannerProps {
  readonly reviewFeedback: string | null;
}

export function ResubmissionBanner({ reviewFeedback }: ResubmissionBannerProps) {
  return (
    <>
      {reviewFeedback && (
        <div
          className="mb-8 border border-[color:var(--color-cobalt)] rounded-sm p-5 bg-[color:var(--color-parch)]"
          role="region"
          aria-label="Reviewer feedback"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)] mb-2">
            Reviewer Feedback
          </p>
          <p className="font-sans text-sm text-[color:var(--color-ink)] whitespace-pre-wrap leading-relaxed">
            {reviewFeedback}
          </p>
        </div>
      )}

      <div className="mb-6">
        <p className="font-sans text-sm text-[color:var(--color-dust)] italic">
          Address the reviewer&#39;s feedback above, then resubmit your updated work product below.
          You may resubmit once.
        </p>
      </div>
    </>
  );
}
