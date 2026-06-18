// ResubmissionBanner — Displays reviewer feedback and resubmission notice
// above the WorkProductForm when isResubmission=true.
//
// Ported to mockup design system 2026-05-27 (Inter, ink/cream/gold,
// emerald-700 for the "reviewed/saved" connotation).

interface ResubmissionBannerProps {
  readonly reviewFeedback: string | null;
}

export function ResubmissionBanner({ reviewFeedback }: ResubmissionBannerProps) {
  return (
    <>
      {reviewFeedback && (
        <div
          className="mb-8 rounded-[var(--r-lg)] p-5"
          style={{
            border: '1px solid var(--emerald-700)',
            background: 'var(--cream)',
          }}
          role="region"
          aria-label="Reviewer feedback"
        >
          <p
            className="mb-2"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--emerald-700)',
            }}
          >
            Reviewer Feedback
          </p>
          <p
            className="whitespace-pre-wrap"
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--ink)',
            }}
          >
            {reviewFeedback}
          </p>
        </div>
      )}

      <div className="mb-6">
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--slate-600)' }}>
          Address the reviewer&#39;s feedback above, then resubmit your updated work product below.
          You may resubmit once.
        </p>
      </div>
    </>
  );
}
