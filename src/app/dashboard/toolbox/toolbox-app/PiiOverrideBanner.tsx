'use client';

export function PiiOverrideBanner(props: {
  readonly reason: string;
  readonly onOverride: () => void;
  readonly onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="border border-[color:var(--ink)]/40 bg-white p-4"
    >
      <p className="text-[0.625rem] uppercase tracking-widest text-[color:var(--ink)]">
        Possible real-member data detected
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink)]">{props.reason}</p>
      <p className="mt-2 text-xs leading-relaxed text-[color:var(--slate-500)]">
        If this is a fabricated scenario you can send anyway. The override is
        logged so the team can see how often the detector fires on
        intentional test data.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={props.onOverride}
          className="border border-[color:var(--ink)]/60 px-3 py-1.5 text-[0.625rem] uppercase tracking-widest text-[color:var(--ink)] hover:bg-[color:var(--ink)]/10"
        >
          Send anyway · fabricated
        </button>
        <button
          type="button"
          onClick={props.onDismiss}
          className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
        >
          Edit my input
        </button>
      </div>
    </div>
  );
}
