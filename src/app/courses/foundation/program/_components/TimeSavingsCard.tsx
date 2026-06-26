'use client';

// TimeSavingsCard — shown after each activity completion.
// Shows a modest, per-task time-savings cue only. Annualized and cumulative
// "hours saved per year" projections were removed (2026-06-25): they were
// designer estimates with no source, which violates the Citations Always rule.
// Keep this qualitative and per-task — never extrapolate to annual totals.
//
// Data lives in _lib/activitySavings.ts.

import { ACTIVITY_SAVINGS } from '../_lib/activitySavings';

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
          Saves a few minutes each time you reuse it &middot;{' '}
          <span style={{ color: 'var(--slate-500)' }}>{savings.usageLabel}</span>
        </p>
      )}

      {savings.mode === 'one-time' && (
        <p style={{ fontSize: 16, color: 'var(--ink)', margin: 0 }}>
          A one-time setup you reuse later &middot;{' '}
          <span style={{ color: 'var(--slate-500)' }}>{savings.usageLabel}</span>
        </p>
      )}

      {savings.mode === 'ongoing' && (
        <p style={{ fontSize: 16, color: 'var(--ink)', margin: 0 }}>
          A habit you apply as needed &middot;{' '}
          <span style={{ color: 'var(--slate-500)' }}>{savings.usageLabel}</span>
        </p>
      )}
    </div>
  );
}
