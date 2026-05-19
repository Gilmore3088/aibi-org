'use client';

// TimeSavingsCard — shown after each activity completion.
// Displays per-activity time savings and a cumulative total across all
// completed modules. All numbers rendered in DM Mono per design system.
// CSS variables only — no hardcoded hex values.
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
      className="mt-4 p-5 bg-[color:var(--ledger-paper)] border border-[color:var(--ledger-parch)] rounded-sm"
      aria-label="Time savings estimate"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-accent-2)] mb-3">
        Time savings estimate
      </p>

      {/* Per-activity savings */}
      <div className="mb-4">
        <p className="font-sans text-xs text-[color:var(--ledger-muted)] mb-1">
          {savings.activityLabel}
        </p>

        {savings.mode === 'recurring' && (
          <>
            <p className="font-sans text-sm text-[color:var(--ledger-ink)]">
              <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
                {savings.perUseMinutes}
              </span>
              {' '}min saved per use &middot;{' '}
              <span className="text-[color:var(--ledger-muted)]">{savings.usageLabel}</span>
            </p>
            <p className="font-sans text-sm font-semibold text-[color:var(--ledger-ink)] mt-1">
              <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
                {savings.annualHours}
              </span>
              {' '}hours saved per year
            </p>
          </>
        )}

        {savings.mode === 'one-time' && (
          <p className="font-sans text-sm font-semibold text-[color:var(--ledger-ink)]">
            <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
              {savings.oneTimeMinutes}
            </span>
            {' '}minutes saved &middot; one-time
          </p>
        )}

        {savings.mode === 'ongoing' && savings.perUseMinutes > 0 && (
          <p className="font-sans text-sm text-[color:var(--ledger-ink)]">
            <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
              {savings.perUseMinutes}
            </span>
            {' '}min per use &middot;{' '}
            <span className="text-[color:var(--ledger-muted)]">{savings.usageLabel}</span>
          </p>
        )}

        {savings.mode === 'ongoing' && savings.perUseMinutes === 0 && (
          <p className="font-sans text-sm text-[color:var(--ledger-muted)]">
            {savings.usageLabel}
          </p>
        )}
      </div>

      {/* Cumulative total */}
      {showCumulative && (cumulativeHours > 0 || cumulativeOneTime > 0) && (
        <div
          className="pt-3 border-t border-[color:var(--ledger-parch)]"
          aria-label="Cumulative savings to date"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-muted)] mb-2">
            Cumulative across completed modules
          </p>
          {cumulativeHours > 0 && (
            <p className="font-sans text-sm text-[color:var(--ledger-ink)]">
              <span
                className="font-mono text-base font-bold text-[color:var(--ledger-accent)]"
                style={{ fontFeatureSettings: '"tnum"' }}
              >
                {cumulativeHours}
              </span>
              {' '}hrs/year recurring savings
            </p>
          )}
          {cumulativeOneTime > 0 && (
            <p className="font-sans text-xs text-[color:var(--ledger-muted)] mt-0.5">
              +{' '}
              <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
                {cumulativeOneTime}
              </span>
              {' '}min in one-time savings
            </p>
          )}
        </div>
      )}
    </div>
  );
}
