// ProgramStatsRow — four-column key/value grid (progress, time, price, format).

interface ProgramStatsRowProps {
  readonly completedCount: number;
  readonly totalModules: number;
  readonly totalMinutes: number;
}

export function ProgramStatsRow({
  completedCount,
  totalModules,
  totalMinutes,
}: ProgramStatsRowProps) {
  const pct = Math.round((completedCount / totalModules) * 100);

  const rows: ReadonlyArray<{ k: string; v: string; sub: string }> = [
    {
      k: 'Progress',
      v: `${pct}%`,
      sub: `${completedCount} of ${totalModules} modules`,
    },
    {
      k: 'Time committed',
      v: `${totalMinutes}m`,
      sub: 'across all modules',
    },
    {
      k: 'Per seat',
      v: '$295',
      sub: '$199 at 10+ seats',
    },
    {
      k: 'Format',
      v: 'Self-paced',
      sub: 'On your schedule',
    },
  ];

  return (
    <div
      style={{
        marginTop: 18,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid var(--ledger-rule-strong)',
        borderBottom: '1px solid var(--ledger-rule)',
      }}
    >
      {rows.map((r, i) => (
        <div
          key={r.k}
          style={{
            padding: '18px 22px',
            borderRight: i < 3 ? '1px solid var(--ledger-rule)' : 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 9.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
            }}
          >
            {r.k}
          </div>
          <div
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginTop: 6,
              color: 'var(--ledger-ink)',
            }}
          >
            {r.v}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--ledger-slate)',
              marginTop: 4,
            }}
          >
            {r.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
