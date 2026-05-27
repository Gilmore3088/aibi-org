'use client';

// Linear module body template — AiBI-S pattern.
//
// Sequential steps with progress dots. Steps render one at a time;
// previous-completed steps remain reachable via the dot rail. The
// page is responsible for the module header — this component owns
// only the step body region + progression UI.
//
// Step navigation is free by default: a learner can revisit any
// step. To gate progression (e.g., "must run the simulation before
// reviewing the grade"), pass `gatedAt` with the highest step the
// learner has reached. Steps after `gatedAt` are disabled in the
// rail until earned.

import { useState, useEffect, useRef, type ReactNode } from 'react';

export interface LinearStep {
  readonly id: string;
  readonly label: string;
  readonly sublabel?: string;
  readonly content: ReactNode;
}

interface LinearProps {
  readonly storagePrefix: string;
  readonly moduleId: string;
  readonly steps: readonly LinearStep[];
  readonly accentColor?: string;
  /** Index of the highest step the learner has reached. Steps beyond
   *  this are disabled in the rail. Defaults to steps.length - 1
   *  (no gating). */
  readonly gatedAt?: number;
  readonly onStepChange?: (stepId: string) => void;
}

export function Linear({
  storagePrefix,
  moduleId,
  steps,
  accentColor = 'var(--gold)',
  gatedAt,
  onStepChange,
}: LinearProps) {
  const storageKey = `${storagePrefix}${moduleId}-step`;
  const [activeStepId, setActiveStepId] = useState(steps[0]?.id ?? '');
  const maxReachable = gatedAt ?? steps.length - 1;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved && steps.some((s) => s.id === saved)) {
      setActiveStepId(saved);
    }
  }, [storageKey, steps]);

  function selectStep(stepId: string, index: number) {
    if (index > maxReachable) return;
    setActiveStepId(stepId);
    sessionStorage.setItem(storageKey, stepId);
    onStepChange?.(stepId);
    // Scroll the step rail to the top of the viewport. `scroll-margin-top`
    // (set on the container) accounts for any sticky chrome above without
    // requiring a hardcoded pixel offset.
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const activeStep = steps.find((s) => s.id === activeStepId) ?? steps[0];
  const activeIndex = steps.findIndex((s) => s.id === activeStep.id);

  return (
    <div ref={containerRef} style={{ scrollMarginTop: 96 }}>
      <nav aria-label="Module progression" style={{ marginBottom: 32 }}>
        <ol
          style={{
            display: 'flex',
            gap: 0,
            padding: 0,
            margin: 0,
            listStyle: 'none',
            borderBottom: '1px solid var(--ink-a10)',
          }}
        >
          {steps.map((step, i) => {
            const isActive = step.id === activeStep.id;
            const isReachable = i <= maxReachable;
            const isPast = i < activeIndex;
            return (
              <li key={step.id} style={{ flex: 1 }}>
                <button
                  type="button"
                  onClick={() => selectStep(step.id, i)}
                  disabled={!isReachable}
                  aria-current={isActive ? 'step' : undefined}
                  style={{
                    width: '100%',
                    padding: '14px 12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive
                      ? `2px solid ${accentColor}`
                      : '2px solid transparent',
                    cursor: isReachable ? 'pointer' : 'not-allowed',
                    opacity: isReachable ? 1 : 0.4,
                    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
                    fontSize: 13,
                    textAlign: 'left',
                    color: isActive
                      ? 'var(--ink)'
                      : isPast
                        ? 'var(--ink-2)'
                        : 'var(--slate-500)',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--slate-500)',
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Step {i + 1}
                    {isPast && ' · Done'}
                  </span>
                  <span style={{ fontWeight: 500 }}>{step.label}</span>
                  {step.sublabel && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: 12,
                        color: 'var(--slate-500)',
                        marginTop: 2,
                      }}
                    >
                      {step.sublabel}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div>{activeStep.content}</div>
    </div>
  );
}
