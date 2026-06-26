'use client';

// TimeSavingsCard — shown after each activity completion.
// Shows a per-task time-savings ESTIMATE with its derivation, plus a running
// cumulative estimate across completed modules. Every hours figure is shown
// with its math (minutes per use × weekly reuse × ~50 working weeks) and is
// labelled a modeled estimate — never presented as a measured guarantee
// (Citations Always rule).
//
// Data + the annual-hours derivation live in _lib/activitySavings.ts.

import {
  ACTIVITY_SAVINGS,
  WEEKS_PER_YEAR,
  getAnnualHours,
  getCumulativeAnnualHours,
} from '../_lib/activitySavings';

const TNUM: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
const KICKER: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

interface TimeSavingsCardProps {
  readonly moduleNumber: number;
}

export function TimeSavingsCard({ moduleNumber }: TimeSavingsCardProps) {
  const savings = ACTIVITY_SAVINGS[moduleNumber];
  if (!savings) return null;

  const annualHours = getAnnualHours(moduleNumber);
  const cumulativeHours = getCumulativeAnnualHours(moduleNumber);
  const showCumulative = moduleNumber > 1 && cumulativeHours > 0;

  return (
    <div
      style={{
        marginTop: 16,
        padding: 20,
        background: 'var(--cream)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-md)',
      }}
      aria-label="Time savings estimate"
    >
      <p style={{ ...KICKER, color: 'var(--gold-deep)', margin: '0 0 12px' }}>
        Where this saves time
      </p>

      <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: '0 0 4px' }}>
        {savings.activityLabel}
      </p>

      {savings.mode === 'recurring' && (
        <p style={{ fontSize: 16, color: 'var(--ink)', margin: 0 }}>
          <span style={TNUM}>{savings.perUseMinutes}</span> min/use ×{' '}
          <span style={TNUM}>{savings.runsPerWeek}</span>/week ×{' '}
          <span style={TNUM}>{WEEKS_PER_YEAR}</span> wks ≈{' '}
          <span style={{ fontWeight: 600 }}>
            <span style={TNUM}>{annualHours}</span> hrs/yr
          </span>
        </p>
      )}

      {savings.mode === 'one-time' && (
        <p style={{ fontSize: 16, color: 'var(--ink)', margin: 0 }}>
          <span style={TNUM}>{savings.oneTimeMinutes}</span> min saved &middot;{' '}
          <span style={{ color: 'var(--slate-500)' }}>
            a one-time setup you reuse later
          </span>
        </p>
      )}

      {savings.mode === 'ongoing' && (
        <p style={{ fontSize: 16, color: 'var(--ink)', margin: 0 }}>
          A habit you apply as needed &middot;{' '}
          <span style={{ color: 'var(--slate-500)' }}>{savings.usageLabel}</span>
        </p>
      )}

      {showCumulative && (
        <div
          style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ink-a10)' }}
          aria-label="Cumulative estimate across completed modules"
        >
          <p style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>
            Cumulative across completed modules
          </p>
          <p style={{ fontSize: 16, color: 'var(--ink)', margin: 0 }}>
            <span style={{ ...TNUM, fontWeight: 700, color: 'var(--gold-deep)' }}>
              {cumulativeHours}
            </span>{' '}
            hrs/yr modeled
          </p>
        </div>
      )}

      {(savings.mode === 'recurring' || showCumulative) && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--slate-500)',
            margin: '10px 0 0',
            lineHeight: 1.5,
          }}
        >
          Modeled estimate based on typical reuse (~{WEEKS_PER_YEAR} working weeks) — not a
          guarantee.
        </p>
      )}
    </div>
  );
}
