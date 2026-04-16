'use client';

// ClassificationDrill — M5 Activity 5.1 specialized component.
// Presents 20 timed scenarios (20s each) for data classification practice.
// State machine: 'ready' | 'active' | 'review' | 'submitted'
// A11Y-01: keyboard accessible radio groups; timer does not auto-advance mid-keyboard-navigation.
// A11Y-02: text labels for all correctness indicators (not color-only), timer urgency announced by text.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Activity } from '@content/courses/aibi-p';

interface DrillScenario {
  readonly scenario: string;
  readonly tier: string;
  readonly reasoning: string;
}

export interface ClassificationDrillProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly scenarios: readonly DrillScenario[];
  readonly existingResponse?: Record<string, unknown> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

interface DrillAnswer {
  readonly scenarioIndex: number;
  readonly selected: string | null;
  readonly correct: string;
  readonly timeRemaining: number;
}

type DrillPhase = 'ready' | 'active' | 'review' | 'submitted';

const SCENARIO_TIME_SECONDS = 20;
const ADVANCE_DELAY_MS = 300;

// Map scenario tier text to drill-response option value
function tierToValue(tier: string): string {
  if (tier.startsWith('Tier 1')) return 'tier-1';
  if (tier.startsWith('Tier 2')) return 'tier-2';
  if (tier.startsWith('Tier 3')) return 'tier-3';
  return 'tier-1';
}

// Map drill-response value to human-readable label
function valueToLabel(value: string | null): string {
  if (value === 'tier-1') return 'Tier 1 — Public Information';
  if (value === 'tier-2') return 'Tier 2 — Internal Only';
  if (value === 'tier-3') return 'Tier 3 — Highly Restricted';
  if (value === 'no-answer') return 'Time expired — no answer';
  return '—';
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ReadOnlyReview({
  scenarios,
  answers,
  score,
}: {
  readonly scenarios: readonly DrillScenario[];
  readonly answers: readonly DrillAnswer[];
  readonly score: number;
}) {
  const pct = Math.round((score / answers.length) * 100);
  const tier1 = { correct: 0, total: 0 };
  const tier2 = { correct: 0, total: 0 };
  const tier3 = { correct: 0, total: 0 };

  for (const a of answers) {
    const sc = scenarios[a.scenarioIndex];
    if (!sc) continue;
    const tier = tierToValue(sc.tier);
    if (tier === 'tier-1') {
      tier1.total++;
      if (a.selected === tier) tier1.correct++;
    } else if (tier === 'tier-2') {
      tier2.total++;
      if (a.selected === tier) tier2.correct++;
    } else {
      tier3.total++;
      if (a.selected === tier) tier3.correct++;
    }
  }

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="text-center py-6 bg-[color:var(--color-parch)] rounded-sm">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)] mb-1">
          Drill Score
        </p>
        <p className="font-serif text-5xl font-bold text-[color:var(--color-ink)]">
          {score}/{answers.length}
        </p>
        <p className="font-mono text-sm text-[color:var(--color-dust)] mt-1">{pct}% correct</p>
      </div>

      {/* Tier breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tier 1 — Public', ...tier1 },
          { label: 'Tier 2 — Internal', ...tier2 },
          { label: 'Tier 3 — Restricted', ...tier3 },
        ].map((t) => (
          <div
            key={t.label}
            className="text-center py-3 px-2 bg-[color:var(--color-parch)] rounded-sm border border-[color:var(--color-parch-dark)]"
          >
            <p className="font-mono text-[10px] text-[color:var(--color-dust)] mb-1 leading-tight">
              {t.label}
            </p>
            <p className="font-mono text-xl font-bold text-[color:var(--color-ink)]">
              {t.correct}/{t.total}
            </p>
          </div>
        ))}
      </div>

      {/* Per-scenario annotations */}
      <div className="space-y-3">
        {answers.map((a, i) => {
          const sc = scenarios[a.scenarioIndex];
          if (!sc) return null;
          const correctValue = tierToValue(sc.tier);
          const isCorrect = a.selected === correctValue;
          const isTimeout = a.selected === 'no-answer' || a.selected === null;

          return (
            <div
              key={i}
              className={[
                'p-4 rounded-sm border',
                isCorrect
                  ? 'border-[color:var(--color-sage)]/40 bg-[color:var(--color-sage)]/5'
                  : isTimeout
                    ? 'border-amber-400/40 bg-amber-50'
                    : 'border-[color:var(--color-error)]/30 bg-[color:var(--color-error)]/5',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    'mt-0.5 shrink-0 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest',
                    isCorrect
                      ? 'text-[color:var(--color-sage)]'
                      : isTimeout
                        ? 'text-amber-600'
                        : 'text-[color:var(--color-error)]',
                  ].join(' ')}
                >
                  {isCorrect ? (
                    <>
                      <CheckIcon />
                      Correct
                    </>
                  ) : isTimeout ? (
                    <>
                      <ClockIcon />
                      Time expired
                    </>
                  ) : (
                    <>
                      <XIcon />
                      Incorrect
                    </>
                  )}
                </div>
                <p className="text-[10px] font-mono text-[color:var(--color-dust)] leading-tight">
                  Scenario {a.scenarioIndex + 1} of {answers.length}
                </p>
              </div>

              <p className="mt-2 text-sm font-sans text-[color:var(--color-ink)] leading-relaxed">
                {sc.scenario}
              </p>

              {!isCorrect && (
                <div className="mt-3 pt-3 border-t border-current/10 space-y-1">
                  <p className="text-xs font-mono text-[color:var(--color-dust)]">
                    Your answer:{' '}
                    <span className="text-[color:var(--color-ink)]">
                      {valueToLabel(a.selected)}
                    </span>
                  </p>
                  <p className="text-xs font-mono text-[color:var(--color-dust)]">
                    Correct answer:{' '}
                    <span className="font-semibold text-[color:var(--color-ink)]">
                      {valueToLabel(correctValue)}
                    </span>
                  </p>
                  <p className="text-xs font-sans text-[color:var(--color-dust)] mt-2">
                    {sc.reasoning}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClassificationDrill({
  activity,
  enrollmentId,
  moduleNumber,
  scenarios,
  existingResponse,
  onSubmitSuccess,
}: ClassificationDrillProps) {
  // Determine initial phase from existing response
  const existingAnswers = existingResponse?.answers as DrillAnswer[] | undefined;
  const existingScore = existingResponse?.score as number | undefined;
  const initialPhase: DrillPhase = existingAnswers ? 'submitted' : 'ready';

  const [phase, setPhase] = useState<DrillPhase>(initialPhase);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<DrillAnswer[]>(existingAnswers ?? []);
  const [currentSelection, setCurrentSelection] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(SCENARIO_TIME_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [drillStartEpoch, setDrillStartEpoch] = useState<number>(0);

  // Track whether user is mid-keyboard-navigation so timer doesn't auto-advance
  const isNavigatingRef = useRef(false);
  const pendingAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalScenarios = scenarios.length;

  // Advance to the next scenario or move to review
  const advanceScenario = useCallback(
    (selected: string | null, remaining: number) => {
      const correctValue = tierToValue(scenarios[currentIndex]?.tier ?? '');
      const finalSelected = selected ?? 'no-answer';

      setAnswers((prev) => [
        ...prev,
        {
          scenarioIndex: currentIndex,
          selected: finalSelected,
          correct: correctValue,
          timeRemaining: remaining,
        },
      ]);

      setCurrentSelection(null);

      if (currentIndex + 1 >= totalScenarios) {
        setPhase('review');
      } else {
        setCurrentIndex((i) => i + 1);
        setTimeLeft(SCENARIO_TIME_SECONDS);
      }
    },
    [currentIndex, scenarios, totalScenarios],
  );

  // Timer effect — only runs when phase === 'active'
  useEffect(() => {
    if (phase !== 'active') return;

    if (timeLeft <= 0) {
      // If user is mid-navigation, give them a brief grace period
      if (isNavigatingRef.current) {
        return;
      }
      advanceScenario(currentSelection, 0);
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [phase, timeLeft, currentSelection, advanceScenario]);

  const handleStartDrill = useCallback(() => {
    setAnswers([]);
    setCurrentIndex(0);
    setCurrentSelection(null);
    setTimeLeft(SCENARIO_TIME_SECONDS);
    setDrillStartEpoch(Date.now());
    setPhase('active');
  }, []);

  const handleSelection = useCallback(
    (value: string) => {
      setCurrentSelection(value);
      // Clear any pending auto-advance
      if (pendingAdvanceRef.current) {
        clearTimeout(pendingAdvanceRef.current);
      }
      // Advance after short delay so learner sees their selection registered
      pendingAdvanceRef.current = setTimeout(() => {
        advanceScenario(value, timeLeft);
      }, ADVANCE_DELAY_MS);
    },
    [advanceScenario, timeLeft],
  );

  const handleKeyFocus = useCallback(() => {
    isNavigatingRef.current = true;
  }, []);

  const handleKeyBlur = useCallback(() => {
    isNavigatingRef.current = false;
  }, []);

  const handleSubmitDrill = useCallback(async () => {
    const score = answers.filter((a) => a.selected === a.correct).length;
    const timeElapsed = Date.now() - drillStartEpoch;

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/courses/submit-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          moduleNumber,
          activityId: activity.id,
          response: {
            answers,
            score,
            total: totalScenarios,
            timeElapsed,
          },
        }),
      });

      if (res.ok || res.status === 409) {
        setPhase('submitted');
        setSubmitting(false);
        onSubmitSuccess?.(activity.id);
        return;
      }

      const data = (await res.json()) as { error?: string };

      if (res.status === 401 || res.status === 403) {
        setServerError('Your session has expired. Please refresh the page and try again.');
        setSubmitting(false);
        return;
      }

      setServerError(data.error ?? 'Submission failed. Please try again.');
      setSubmitting(false);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }, [answers, drillStartEpoch, enrollmentId, moduleNumber, activity.id, totalScenarios, onSubmitSuccess]);

  const score = answers.filter((a) => a.selected === a.correct).length;
  const timerPct = (timeLeft / SCENARIO_TIME_SECONDS) * 100;
  const isUrgent = timeLeft <= 5;
  const timerColorStyle = isUrgent
    ? 'var(--color-terra)'
    : 'var(--color-sage)';

  // Activity header shared across all phases
  const ActivityHeader = (
    <div className="mb-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-1">
        Activity {activity.id}
      </p>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-2">
          {activity.title}
        </h3>
        {phase === 'submitted' && (
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-[color:var(--color-sage)]/10 border border-[color:var(--color-sage)] rounded-sm font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)]">
            Submitted
          </span>
        )}
      </div>
      <p className="text-sm font-sans text-[color:var(--color-dust)] leading-relaxed">
        {activity.description}
      </p>
    </div>
  );

  return (
    <div
      className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm p-6 bg-white/40 mb-8"
      style={{ borderLeftColor: 'var(--color-terra)' }}
    >
      {ActivityHeader}

      {/* READY phase */}
      {phase === 'ready' && (
        <div className="text-center py-8">
          <p className="font-sans text-sm text-[color:var(--color-dust)] mb-2">
            {totalScenarios} scenarios · 20 seconds each · score shown at end
          </p>
          <p className="font-sans text-sm text-[color:var(--color-dust)] mb-8">
            Classify each scenario as Tier 1 (Public), Tier 2 (Internal Only), or Tier 3 (Highly Restricted).
          </p>
          <button
            type="button"
            onClick={handleStartDrill}
            className="px-8 py-3 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
          >
            Start Drill
          </button>
        </div>
      )}

      {/* ACTIVE phase */}
      {phase === 'active' && (
        <div>
          {/* Timer bar at top */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)]">
                Scenario {currentIndex + 1} of {totalScenarios}
              </p>
              <p
                className="font-mono text-sm font-bold"
                style={{ color: timerColorStyle }}
                aria-live="polite"
                aria-atomic="true"
              >
                {isUrgent
                  ? `Hurry! ${timeLeft}s remaining`
                  : `Time remaining: ${timeLeft}s`}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[color:var(--color-parch-dark)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${timerPct}%`,
                  backgroundColor: timerColorStyle,
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
          <div className="mb-6 p-5 bg-[color:var(--color-parch)] rounded-sm border border-[color:var(--color-parch-dark)]">
            <p className="font-sans text-base text-[color:var(--color-ink)] leading-relaxed">
              {scenarios[currentIndex]?.scenario}
            </p>
          </div>

          {/* Classification options */}
          <fieldset className="border-0 m-0 p-0">
            <legend className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)] mb-3">
              Classify this scenario
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
                    onChange={() => handleSelection(opt.value)}
                    onFocus={handleKeyFocus}
                    onBlur={handleKeyBlur}
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
      )}

      {/* REVIEW phase */}
      {phase === 'review' && (
        <div>
          <ReadOnlyReview scenarios={scenarios} answers={answers} score={score} />

          {serverError && (
            <p
              className="mt-4 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2"
              role="alert"
            >
              {serverError}
            </p>
          )}

          <div className="mt-6 pt-4 border-t border-[color:var(--color-parch-dark)]">
            <button
              type="button"
              onClick={handleSubmitDrill}
              disabled={submitting}
              className="px-6 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] disabled:bg-[color:var(--color-parch-dark)] disabled:text-[color:var(--color-dust)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
            >
              {submitting ? 'Submitting…' : 'Submit Results'}
            </button>
          </div>
        </div>
      )}

      {/* SUBMITTED phase — read-only from saved data */}
      {phase === 'submitted' && existingAnswers && (
        <div>
          <ReadOnlyReview
            scenarios={scenarios}
            answers={existingAnswers}
            score={existingScore ?? existingAnswers.filter((a) => a.selected === a.correct).length}
          />
          <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)] text-center">
            Drill results saved
          </p>
        </div>
      )}
    </div>
  );
}
