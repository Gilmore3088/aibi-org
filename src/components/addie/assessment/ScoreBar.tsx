// ScoreBar — horizontal score bar for a single readiness dimension.
// CSS-only fill (no charting lib). Ledger tokens. Tabular-nums on the number.

import type { ReactNode } from 'react';

export interface ScoreBarProps {
  readonly label: string;
  readonly score: number;
  readonly max: number;
  readonly emphasis?: 'default' | 'focus';
  readonly footnote?: ReactNode;
}

export function ScoreBar({
  label,
  score,
  max,
  emphasis = 'default',
  footnote,
}: ScoreBarProps) {
  const pct =
    max > 0 ? Math.max(0, Math.min(100, Math.round((score / max) * 100))) : 0;
  const isFocus = emphasis === 'focus';
  const trackBorder = isFocus
    ? 'border-[var(--ledger-weak)]'
    : 'border-[var(--ledger-rule)]';
  const fillColor = isFocus
    ? 'bg-[var(--ledger-weak)]'
    : 'bg-[var(--ledger-accent)]';

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-[var(--ledger-ink)]">{label}</span>
        <span
          className="font-mono text-xs text-[var(--ledger-ink)] tabular-nums"
          aria-label={`Score ${score} of ${max}`}
        >
          {score}&nbsp;/&nbsp;{max}
        </span>
      </div>
      <div
        className={`relative h-2 rounded-[2px] border ${trackBorder} bg-[var(--ledger-parch)] overflow-hidden`}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`absolute inset-y-0 left-0 ${fillColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {footnote ? (
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ledger-weak)]">
          {footnote}
        </div>
      ) : null}
    </div>
  );
}
