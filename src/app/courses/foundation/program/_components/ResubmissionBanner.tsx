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
          className="mb-8 border border-[color:var(--ledger-accent-2)] rounded-sm p-5 bg-[color:var(--ledger-paper)]"
          role="region"
          aria-label="Reviewer feedback"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-accent-2)] mb-2">
            Reviewer Feedback
          </p>
          <p className="font-sans text-sm text-[color:var(--ledger-ink)] whitespace-pre-wrap leading-relaxed">
            {reviewFeedback}
          </p>
        </div>
      )}

      <div className="mb-6">
        <p className="font-sans text-sm text-[color:var(--ledger-muted)]">
          Address the reviewer&#39;s feedback above, then resubmit your updated work product below.
          You may resubmit once.
        </p>
      </div>
    </>
  );
}
