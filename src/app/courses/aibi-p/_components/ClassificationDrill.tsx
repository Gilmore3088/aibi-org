'use client';

// ClassificationDrill — M5 Activity 5.1 specialized component.
// Presents 20 timed scenarios (20s each) for data classification practice.
// State machine: 'ready' | 'active' | 'review' | 'submitted'
// A11Y-01: keyboard accessible radio groups; timer does not auto-advance mid-keyboard-navigation.
//          Keyboard shortcuts 1/2/3 available during active drill (announced via sr-only hint).
// A11Y-02: text labels for all correctness indicators (not color-only), timer urgency announced by text.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Activity } from '@content/courses/aibi-p';
import { DrillReadOnlyReview, tierToValue } from './DrillReadOnlyReview';
import { DrillActivePhase } from './DrillActivePhase';

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

export function ClassificationDrill({
  activity,
  enrollmentId,
  moduleNumber,
  scenarios,
  existingResponse,
  onSubmitSuccess,
}: ClassificationDrillProps) {
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

  const isNavigatingRef = useRef(false);
  const pendingAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRevealRef = useRef<HTMLDivElement>(null);
  const totalScenarios = scenarios.length;

  const advanceScenario = useCallback(
    (selected: string | null, remaining: number) => {
      const correctValue = tierToValue(scenarios[currentIndex]?.tier ?? '');
      const finalSelected = selected ?? 'no-answer';
      setAnswers((prev) => [
        ...prev,
        { scenarioIndex: currentIndex, selected: finalSelected, correct: correctValue, timeRemaining: remaining },
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

  useEffect(() => {
    if (phase !== 'active') return;
    if (timeLeft <= 0) {
      if (isNavigatingRef.current) return;
      advanceScenario(currentSelection, 0);
      return;
    }
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); return 0; }
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
      if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
      pendingAdvanceRef.current = setTimeout(() => advanceScenario(value, timeLeft), ADVANCE_DELAY_MS);
    },
    [advanceScenario, timeLeft],
  );

  const handleKeyFocus = useCallback(() => { isNavigatingRef.current = true; }, []);
  const handleKeyBlur = useCallback(() => { isNavigatingRef.current = false; }, []);

  useEffect(() => {
    if (phase === 'review' && scoreRevealRef.current) scoreRevealRef.current.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'active') return;
    const options = activity.fields[0]?.options ?? [];
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < options.length) {
        const opt = options[idx];
        if (opt) handleSelection(opt.value);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [phase, activity.fields, handleSelection]);

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
          enrollmentId, moduleNumber, activityId: activity.id,
          response: { answers, score, total: totalScenarios, timeElapsed },
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

  return (
    <div
      className="border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm p-6 bg-white/40 mb-8"
      style={{ borderLeftColor: 'var(--color-terra)' }}
    >
      {/* Activity header */}
      <div className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-1">
          Activity {activity.id}
        </p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-2">{activity.title}</h3>
          {phase === 'submitted' && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-[color:var(--color-sage)]/10 border border-[color:var(--color-sage)] rounded-sm font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)]">
              Submitted
            </span>
          )}
        </div>
        <p className="text-sm font-sans text-[color:var(--color-dust)] leading-relaxed">{activity.description}</p>
      </div>

      {phase === 'ready' && (
        <div className="text-center py-8">
          <p className="font-sans text-sm text-[color:var(--color-dust)] mb-2">
            {totalScenarios} scenarios · 20 seconds each · score shown at end
          </p>
          <p className="font-sans text-sm text-[color:var(--color-dust)] mb-4">
            Classify each scenario as Tier 1 (Public), Tier 2 (Internal Only), or Tier 3 (Highly Restricted).
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)] mb-8">
            Keyboard shortcut: press 1, 2, or 3 to select during the drill
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

      {phase === 'active' && (
        <DrillActivePhase
          activity={activity}
          scenarioText={scenarios[currentIndex]?.scenario ?? ''}
          currentIndex={currentIndex}
          totalScenarios={totalScenarios}
          timeLeft={timeLeft}
          currentSelection={currentSelection}
          onSelection={handleSelection}
          onKeyFocus={handleKeyFocus}
          onKeyBlur={handleKeyBlur}
        />
      )}

      {phase === 'review' && (
        <div
          ref={scoreRevealRef}
          tabIndex={-1}
          aria-live="polite"
          aria-label={`Drill complete. Your score: ${score} out of ${answers.length}`}
        >
          <DrillReadOnlyReview scenarios={scenarios} answers={answers} score={score} />
          {serverError && (
            <p className="mt-4 text-sm font-sans text-[color:var(--color-error)] bg-[color:var(--color-error)]/5 border border-[color:var(--color-error)]/20 rounded-sm px-3 py-2" role="alert">
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

      {phase === 'submitted' && existingAnswers && (
        <div>
          <DrillReadOnlyReview
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
