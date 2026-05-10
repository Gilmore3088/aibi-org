'use client';

// TimeSavingsCard — shown after each activity completion.
// Displays per-activity time savings and a cumulative total across all
// completed modules. All numbers rendered in DM Mono per design system.
// CSS variables only — no hardcoded hex values.

// Time savings data keyed by module number.
// - annualHours: recurring annual savings (0 = one-time)
// - oneTimeMinutes: one-time savings in minutes (0 = recurring)
// - perUseMinutes: minutes saved per individual use
// - usageLabel: human-readable frequency description
type SavingsMode = 'recurring' | 'one-time' | 'ongoing';

interface ActivitySavings {
  readonly mode: SavingsMode;
  readonly perUseMinutes: number;
  readonly annualHours: number;
  readonly oneTimeMinutes: number;
  readonly usageLabel: string;
  readonly activityLabel: string;
}

const ACTIVITY_SAVINGS: Record<number, ActivitySavings> = {
  1: {
    mode: 'recurring',
    perUseMinutes: 15,
    annualHours: 6,
    oneTimeMinutes: 0,
    usageLabel: '2x/month',
    activityLabel: 'Regulatory cheatsheet reference',
  },
  2: {
    mode: 'one-time',
    perUseMinutes: 0,
    annualHours: 0,
    oneTimeMinutes: 30,
    usageLabel: 'One-time audit',
    activityLabel: 'Subscription inventory',
  },
  3: {
    mode: 'recurring',
    perUseMinutes: 10,
    annualHours: 43,
    oneTimeMinutes: 0,
    usageLabel: '5x/week',
    activityLabel: 'AI tool use (hallucination-aware)',
  },
  4: {
    mode: 'recurring',
    perUseMinutes: 20,
    annualHours: 52,
    oneTimeMinutes: 0,
    usageLabel: '3x/week',
    activityLabel: 'AI feature evaluation',
  },
  5: {
    mode: 'ongoing',
    perUseMinutes: 5,
    annualHours: 0,
    oneTimeMinutes: 0,
    usageLabel: 'Per data-handling decision',
    activityLabel: 'Data classification awareness',
  },
  // M5 Activity 5.2 — same module, represented in module-level display
  // Listed here as module 5 covers both 5.1 + 5.2 under a single card.
  6: {
    mode: 'ongoing',
    perUseMinutes: 10,
    annualHours: 0,
    oneTimeMinutes: 0,
    usageLabel: 'Per new skill build',
    activityLabel: 'Skill diagnosis before building',
  },
  7: {
    mode: 'recurring',
    perUseMinutes: 20,
    annualHours: 87,
    oneTimeMinutes: 0,
    usageLabel: '5x/week',
    activityLabel: 'Deployed AI skill in daily work',
  },
  8: {
    mode: 'ongoing',
    perUseMinutes: 5,
    annualHours: 0,
    oneTimeMinutes: 0,
    usageLabel: 'Per iteration cycle',
    activityLabel: 'Structured skill iteration',
  },
  9: {
    mode: 'ongoing',
    perUseMinutes: 0,
    annualHours: 0,
    oneTimeMinutes: 0,
    usageLabel: 'Varies by automation',
    activityLabel: 'Capstone automation',
  },
};

// Cumulative annual hours for all modules up to and including moduleNumber.
// One-time savings are excluded from annualisation (shown separately).
function getCumulativeAnnualHours(upToModule: number): number {
  let total = 0;
  for (let m = 1; m <= upToModule; m++) {
    const s = ACTIVITY_SAVINGS[m];
    if (s) total += s.annualHours;
  }
  return total;
}

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
      className="mt-4 p-5 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm"
      aria-label="Time savings estimate"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)] mb-3">
        Time savings estimate
      </p>

      {/* Per-activity savings */}
      <div className="mb-4">
        <p className="font-sans text-xs text-[color:var(--color-slate)] mb-1">
          {savings.activityLabel}
        </p>

        {savings.mode === 'recurring' && (
          <>
            <p className="font-sans text-sm text-[color:var(--color-ink)]">
              <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
                {savings.perUseMinutes}
              </span>
              {' '}min saved per use &middot;{' '}
              <span className="text-[color:var(--color-slate)]">{savings.usageLabel}</span>
            </p>
            <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] mt-1">
              <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
                {savings.annualHours}
              </span>
              {' '}hours saved per year
            </p>
          </>
        )}

        {savings.mode === 'one-time' && (
          <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)]">
            <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
              {savings.oneTimeMinutes}
            </span>
            {' '}minutes saved &middot; one-time
          </p>
        )}

        {savings.mode === 'ongoing' && savings.perUseMinutes > 0 && (
          <p className="font-sans text-sm text-[color:var(--color-ink)]">
            <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
              {savings.perUseMinutes}
            </span>
            {' '}min per use &middot;{' '}
            <span className="text-[color:var(--color-slate)]">{savings.usageLabel}</span>
          </p>
        )}

        {savings.mode === 'ongoing' && savings.perUseMinutes === 0 && (
          <p className="font-sans text-sm text-[color:var(--color-slate)]">
            {savings.usageLabel}
          </p>
        )}
      </div>

      {/* Cumulative total */}
      {showCumulative && (cumulativeHours > 0 || cumulativeOneTime > 0) && (
        <div
          className="pt-3 border-t border-[color:var(--color-parch-dark)]"
          aria-label="Cumulative savings to date"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2">
            Cumulative across completed modules
          </p>
          {cumulativeHours > 0 && (
            <p className="font-sans text-sm text-[color:var(--color-ink)]">
              <span
                className="font-mono text-base font-bold text-[color:var(--color-terra)]"
                style={{ fontFeatureSettings: '"tnum"' }}
              >
                {cumulativeHours}
              </span>
              {' '}hrs/year recurring savings
            </p>
          )}
          {cumulativeOneTime > 0 && (
            <p className="font-sans text-xs text-[color:var(--color-slate)] mt-0.5">
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
