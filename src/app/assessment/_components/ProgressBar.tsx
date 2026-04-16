interface ProgressBarProps {
  readonly progress: number; // 0–1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <div
      className="w-full h-[2px] bg-[color:var(--color-ink)]/10"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-[color:var(--color-terra)] transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
