interface ProgressBarProps {
  readonly progress: number; // 0–1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const pct = clamped * 100;
  return (
    <div
      className="w-full h-[2px] bg-[color:var(--color-ink)]/10 overflow-hidden"
      role="progressbar"
      aria-label="Assessment progress"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full w-full origin-left bg-[color:var(--color-terra)] transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${clamped})` }}
      />
    </div>
  );
}
