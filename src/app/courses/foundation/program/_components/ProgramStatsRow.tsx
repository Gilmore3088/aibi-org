// ProgramStatsRow — four-column key/value grid (progress, time, price, format).

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

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
      sub: 'Institutional rollout by request',
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
        borderTop: '1px solid var(--ink-a15)',
        borderBottom: '1px solid var(--ink-a10)',
        fontFamily: FONT_INTER,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={r.k}
          style={{
            padding: '18px 22px',
            borderRight: i < 3 ? '1px solid var(--ink-a10)' : 'none',
          }}
        >
          <div
            style={{
              fontFamily: FONT_INTER,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            {r.k}
          </div>
          <div
            style={{
              fontFamily: FONT_INTER,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginTop: 6,
              color: 'var(--ink)',
            }}
          >
            {r.v}
          </div>
          <div
            style={{
              fontFamily: FONT_INTER,
              fontSize: 13,
              color: 'var(--slate-600)',
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
