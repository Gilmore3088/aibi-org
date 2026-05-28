// Compact summary strip — wins count, hours saved, wins-to-go pip.

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
};

export function QuickWinsSummary({
  winsCount,
  totalQuarterlyHours,
  winsToGo,
}: {
  readonly winsCount: number;
  readonly totalQuarterlyHours: number;
  readonly winsToGo: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 24px',
        alignItems: 'baseline',
        marginBottom: 36,
        paddingBottom: 18,
        borderBottom: '1px solid var(--ink-a10)',
      }}
      aria-label="Logging summary"
    >
      <span style={{ ...labelStyle, color: 'var(--slate-500)' }}>
        {winsCount} {winsCount === 1 ? 'win' : 'wins'} logged
      </span>
      <span aria-hidden="true" style={{ fontSize: 11, color: 'var(--slate-400)' }}>
        ·
      </span>
      <span
        style={{
          ...labelStyle,
          color: 'var(--slate-500)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {totalQuarterlyHours.toFixed(1)} hrs / quarter saved
      </span>
      {winsToGo > 0 && (
        <>
          <span aria-hidden="true" style={{ fontSize: 11, color: 'var(--slate-400)' }}>
            ·
          </span>
          <span style={{ ...labelStyle, color: 'var(--gold-deep)' }}>
            {winsToGo} more to fill the template
          </span>
        </>
      )}
    </div>
  );
}
