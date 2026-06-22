import type { ToolboxMaturity } from '@/lib/toolbox/types';

const QUALITY_LADDER: readonly {
  readonly key: ToolboxMaturity;
  readonly label: string;
  readonly title: string;
  readonly body: string;
}[] = [
  {
    key: 'draft',
    label: 'Draft',
    title: 'Saved from course or library.',
    body: 'Needs a fabricated-data run and human review.',
  },
  {
    key: 'pilot',
    label: 'Pilot',
    title: 'Tested in the AiBI Lab.',
    body: 'Ready for a limited internal scenario.',
  },
  {
    key: 'production',
    label: 'Production',
    title: 'Reviewed and reusable.',
    body: 'Owner, guardrails, and use case are clear.',
  },
] as const;

export function ToolboxQualityLadder({
  counts,
  total,
  className = '',
}: {
  readonly counts?: Readonly<Record<ToolboxMaturity, number>>;
  readonly total?: number;
  readonly className?: string;
}): JSX.Element {
  const hasCounts = counts !== undefined && typeof total === 'number';

  return (
    <section
      aria-label="Saved asset quality"
      className={`border border-[color:var(--ink-a15)] bg-white ${className}`}
    >
      <div className="grid gap-0 md:grid-cols-[220px_repeat(3,minmax(0,1fr))]">
        <div className="border-b border-[color:var(--ink-a10)] bg-[color:var(--ink)] px-5 py-4 text-[color:var(--cream)] md:border-b-0 md:border-r">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--gold)]">
            Asset quality
          </p>
          <p className="mt-2 text-xl font-black leading-tight tracking-[-0.02em]">
            Saved is not the finish line.
          </p>
          <p className="mt-2 text-xs font-bold leading-relaxed text-white/70">
            Move assets from saved draft to reviewed reuse.
          </p>
        </div>
        {QUALITY_LADDER.map((step, index) => {
          const count = counts?.[step.key] ?? 0;
          const marker = hasCounts ? String(count) : String(index + 1).padStart(2, '0');
          const isEmpty = hasCounts && count === 0;
          return (
            <div
              key={step.key}
              className="grid min-h-[128px] grid-cols-[52px_minmax(0,1fr)] gap-4 border-b border-[color:var(--ink-a10)] bg-[color:var(--cream)] px-5 py-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <span
                aria-label={
                  hasCounts
                    ? `${count} ${step.label.toLowerCase()} assets`
                    : `Quality step ${index + 1}: ${step.label}`
                }
                className={`grid h-12 w-12 place-items-center rounded-full text-lg font-black tabular-nums ${
                  step.key === 'production'
                    ? 'bg-[color:var(--gold-deep)] text-[color:var(--cream)]'
                    : 'bg-white text-[color:var(--ink)]'
                } ${isEmpty ? 'opacity-55' : ''}`}
              >
                {marker}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
                  {step.label}
                </p>
                <p className="mt-2 text-sm font-black leading-snug text-[color:var(--ink)]">
                  {step.title}
                </p>
                <p className="mt-1 text-xs font-bold leading-relaxed text-[color:var(--slate-500)]">
                  {step.body}
                </p>
                {hasCounts && (
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--slate-500)]">
                    {total === 0 ? '0%' : `${Math.round((count / total) * 100)}%`} of toolbox
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
