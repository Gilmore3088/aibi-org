// ProgressIndicator — horizontal row of dots showing module completion.
// Server Component: pure display, no interactivity.
// Mockup chrome: gold filled dot for complete, ink hairline ring for pending,
// slate metadata text.

interface ProgressIndicatorProps {
  readonly completedModules: readonly number[];
  readonly totalModules: number;
}

export function ProgressIndicator({ completedModules, totalModules }: ProgressIndicatorProps) {
  const completedCount = completedModules.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
      <div
        role="progressbar"
        aria-valuenow={completedCount}
        aria-valuemin={0}
        aria-valuemax={totalModules}
        aria-label={`${completedCount} of ${totalModules} modules complete`}
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {Array.from({ length: totalModules }, (_, i) => {
          const moduleNumber = i + 1;
          const isComplete = completedModules.includes(moduleNumber);
          return (
            <span
              key={moduleNumber}
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: isComplete ? 'var(--gold)' : 'transparent',
                border: isComplete
                  ? '1px solid var(--gold)'
                  : '1px solid var(--ink-a15)',
                transition: 'background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
              }}
            />
          );
        })}
      </div>

      <span
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--slate-500)',
        }}
      >
        {completedCount} of {totalModules} modules complete
      </span>
    </div>
  );
}
