'use client';

// DrillActivePhase — The timed scenario UI shown during an active ClassificationDrill.
// Renders the timer bar, scenario text, and classification radio options.
// Ported to mockup tokens 2026-05-27.

import type { Activity } from '@content/courses/foundation-program';

const SCENARIO_TIME_SECONDS = 20;
const INTER_STACK = 'Inter, ui-sans-serif, system-ui, sans-serif';

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

const eyebrowStyle: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  margin: 0,
};

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
  // Urgent: gold accent; normal: ink — restrained two-tone, single accent for emphasis.
  const timerColor = isUrgent ? 'var(--gold-deep)' : 'var(--ink)';
  const timerFill = isUrgent ? 'var(--gold)' : 'var(--ink)';

  const options = activity.fields[0]?.options ?? [];

  return (
    <div>
      {/* Timer bar */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <p style={{ ...eyebrowStyle, color: 'var(--slate-500)' }}>
            Scenario {currentIndex + 1} of {totalScenarios}
          </p>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 14,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: timerColor,
              margin: 0,
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {isUrgent ? `Hurry — ${timeLeft}s remaining` : `Time remaining: ${timeLeft}s`}
          </p>
        </div>
        <div
          style={{
            width: '100%',
            height: 6,
            background: 'var(--ink-a10)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${timerPct}%`,
              background: timerFill,
              borderRadius: 999,
              transition: 'width 1s linear, background var(--t-fast) var(--ease)',
            }}
            role="progressbar"
            aria-valuenow={timeLeft}
            aria-valuemin={0}
            aria-valuemax={SCENARIO_TIME_SECONDS}
            aria-label={`Time remaining: ${timeLeft} seconds`}
          />
        </div>
      </div>

      {/* Scenario text */}
      <div
        style={{
          marginBottom: 24,
          padding: 20,
          background: 'var(--cream-2)',
          borderRadius: 16,
          border: '1px solid var(--ink-a10)',
        }}
      >
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 16,
            color: 'var(--ink)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {scenarioText}
        </p>
      </div>

      {/* Classification options */}
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 12 }}>
          Classify this scenario
          <span className="sr-only"> — Press 1, 2, or 3 to select</span>
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map((opt) => {
            const selected = currentSelection === opt.value;
            return (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid',
                  borderColor: selected ? 'var(--gold)' : 'var(--ink-a10)',
                  background: selected ? 'var(--gold-a10)' : 'var(--cream)',
                  transition:
                    'background var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
                }}
              >
                <input
                  type="radio"
                  name="drill-response"
                  value={opt.value}
                  checked={selected}
                  onChange={() => onSelection(opt.value)}
                  onFocus={onKeyFocus}
                  onBlur={onKeyBlur}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: 'var(--gold)',
                  }}
                />
                <span
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 16,
                    color: 'var(--ink)',
                  }}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
