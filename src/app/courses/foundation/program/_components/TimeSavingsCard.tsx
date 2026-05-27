'use client';

// TimeSavingsCard — shown after each activity completion.
// Displays per-activity time savings and a cumulative total across all
// completed modules.
//
// Ported to mockup design system 2026-05-27 (Inter, ink/cream/gold,
// tabular-nums for numerics).
//
// Data lives in _lib/activitySavings.ts so the post-course assessment
// can derive its headline number from the same source.

import {
  ACTIVITY_SAVINGS,
  getCumulativeAnnualHours,
} from '../_lib/activitySavings';

function getCumulativeOneTimeMinutes(upToModule: number): number {
  let total = 0;
  for (let m = 1; m <= upToModule; m++) {
    const s = ACTIVITY_SAVINGS[m];
    if (s) total += s.oneTimeMinutes;
  }
  return total;
}

const TNUM: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
const KICKER: React.CSSProperties = {
  fontSize: 10,
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

  const cumulativeHours = getCumulativeAnnualHours(moduleNumber);
  const cumulativeOneTime = getCumulativeOneTimeMinutes(moduleNumber);
  const showCumulative = moduleNumber > 1;

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
        Time savings estimate
      </p>

      {/* Per-activity savings */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 4px' }}>
          {savings.activityLabel}
        </p>

        {savings.mode === 'recurring' && (
          <>
            <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0 }}>
              <span style={TNUM}>{savings.perUseMinutes}</span>{' '}
              min saved per use &middot;{' '}
              <span style={{ color: 'var(--slate-500)' }}>{savings.usageLabel}</span>
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--ink)',
                margin: '4px 0 0',
              }}
            >
              <span style={TNUM}>{savings.annualHours}</span> hours saved per year
            </p>
          </>
        )}

        {savings.mode === 'one-time' && (
          <p
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}
          >
            <span style={TNUM}>{savings.oneTimeMinutes}</span>{' '}
            minutes saved &middot; one-time
          </p>
        )}

        {savings.mode === 'ongoing' && savings.perUseMinutes > 0 && (
          <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0 }}>
            <span style={TNUM}>{savings.perUseMinutes}</span>{' '}
            min per use &middot;{' '}
            <span style={{ color: 'var(--slate-500)' }}>{savings.usageLabel}</span>
          </p>
        )}

        {savings.mode === 'ongoing' && savings.perUseMinutes === 0 && (
          <p style={{ fontSize: 14, color: 'var(--slate-500)', margin: 0 }}>
            {savings.usageLabel}
          </p>
        )}
      </div>

      {/* Cumulative total */}
      {showCumulative && (cumulativeHours > 0 || cumulativeOneTime > 0) && (
        <div
          style={{ paddingTop: 12, borderTop: '1px solid var(--ink-a10)' }}
          aria-label="Cumulative savings to date"
        >
          <p style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 8px' }}>
            Cumulative across completed modules
          </p>
          {cumulativeHours > 0 && (
            <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0 }}>
              <span
                style={{
                  ...TNUM,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--gold-deep)',
                }}
              >
                {cumulativeHours}
              </span>{' '}
              hrs/year recurring savings
            </p>
          )}
          {cumulativeOneTime > 0 && (
            <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '2px 0 0' }}>
              + <span style={TNUM}>{cumulativeOneTime}</span> min in one-time savings
            </p>
          )}
        </div>
      )}
    </div>
  );
}
