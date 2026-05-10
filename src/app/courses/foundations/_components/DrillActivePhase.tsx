'use client';

// DrillActivePhase — The timed scenario UI shown during an active ClassificationDrill.
// Renders the timer bar, scenario text, and classification radio options.

import type { Activity } from '@content/courses/foundations';

const SCENARIO_TIME_SECONDS = 20;

interface DrillActivePhaseProps {
  readonly activity: Activity;
  readonly scenarioText: string;
  readonly currentIndex: number;
  readonly totalScenarios: number;
  readonly timeLeft: number;
  readonly currentSelection: string | null;
  readonly onSelection: (value: string) => void;
  readonly onKeyFocus: () => void;
  readonly onKeyBlur: () => void;
}

export function DrillActivePhase({
  activity,
  scenarioText,
  currentIndex,
  totalScenarios,
  timeLeft,
  currentSelection,
  onSelection,
  onKeyFocus,
  onKeyBlur,
}: DrillActivePhaseProps) {
  const timerPct = (timeLeft / SCENARIO_TIME_SECONDS) * 100;
  const isUrgent = timeLeft <= 5;
  const timerColorStyle = isUrgent ? 'var(--color-terra)' : 'var(--color-sage)';

  return (
    <div>
      {/* Timer bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
            Scenario {currentIndex + 1} of {totalScenarios}
          </p>
          <p
            className="font-mono text-sm font-bold"
            style={{ color: timerColorStyle }}
            aria-live="polite"
            aria-atomic="true"
          >
            {isUrgent ? `Hurry! ${timeLeft}s remaining` : `Time remaining: ${timeLeft}s`}
          </p>
        </div>
        <div className="w-full h-1.5 bg-[color:var(--color-parch-dark)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, backgroundColor: timerColorStyle }}
            role="progressbar"
            aria-valuenow={timeLeft}
            aria-valuemin={0}
            aria-valuemax={SCENARIO_TIME_SECONDS}
            aria-label={`Time remaining: ${timeLeft} seconds`}
          />
        </div>
      </div>

      {/* Scenario text */}
      <div className="mb-6 p-5 bg-[color:var(--color-parch)] rounded-sm border border-[color:var(--color-parch-dark)]">
        <p className="font-sans text-base text-[color:var(--color-ink)] leading-relaxed">
          {scenarioText}
        </p>
      </div>

      {/* Classification options */}
      <fieldset className="border-0 m-0 p-0">
        <legend className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-3">
          Classify this scenario
          <span className="sr-only"> — Press 1, 2, or 3 to select</span>
        </legend>
        <div className="flex flex-col gap-3">
          {(activity.fields[0]?.options ?? []).map((opt) => (
            <label
              key={opt.value}
              className={[
                'flex items-center gap-3 cursor-pointer px-4 py-3 rounded-sm border transition-colors',
                currentSelection === opt.value
                  ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra)]/5'
                  : 'border-[color:var(--color-parch-dark)] hover:border-[color:var(--color-terra)]/40',
              ].join(' ')}
            >
              <input
                type="radio"
                name="drill-response"
                value={opt.value}
                checked={currentSelection === opt.value}
                onChange={() => onSelection(opt.value)}
                onFocus={onKeyFocus}
                onBlur={onKeyBlur}
                className="w-4 h-4 accent-[color:var(--color-terra)] focus:ring-2 focus:ring-[color:var(--color-terra)]"
              />
              <span className="text-sm font-sans text-[color:var(--color-ink)]">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
