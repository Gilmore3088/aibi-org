// ProgressRing — SVG progress ring. Tabular-nums for the percentage label.

interface ProgressRingProps {
  readonly value: number; // 0..1
  readonly label?: string;
  readonly size?: number;
}

export function ProgressRing({ value, label, size = 80 }: ProgressRingProps) {
  const v = Math.max(0, Math.min(1, value));
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v);
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={label ?? `Progress ${Math.round(v * 100)}%`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ledger-rule)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ledger-accent)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--ledger-mono)"
          fontSize={size / 5}
          fill="var(--ledger-ink)"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {Math.round(v * 100)}%
        </text>
      </svg>
      {label ? (
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
          {label}
        </span>
      ) : null}
    </div>
  );
}
