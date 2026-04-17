// ProgressIndicator — horizontal row of dots showing module completion
// Server Component: pure display, no interactivity

interface ProgressIndicatorProps {
  readonly completedModules: readonly number[];
  readonly totalModules: number;
}

export function ProgressIndicator({ completedModules, totalModules }: ProgressIndicatorProps) {
  const completedCount = completedModules.length;

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Dot row */}
      <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={totalModules} aria-label={`${completedCount} of ${totalModules} modules complete`}>
        {Array.from({ length: totalModules }, (_, i) => {
          const moduleNumber = i + 1;
          const isComplete = completedModules.includes(moduleNumber);
          return (
            <div
              key={moduleNumber}
              className={`w-2 h-2 rounded-full transition-colors ${
                isComplete
                  ? 'bg-[color:var(--color-terra)]'
                  : 'border border-[color:var(--color-terra)]/30 bg-transparent'
              }`}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* Count label */}
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-dust)]">
        {completedCount} of {totalModules} modules complete
      </span>
    </div>
  );
}
