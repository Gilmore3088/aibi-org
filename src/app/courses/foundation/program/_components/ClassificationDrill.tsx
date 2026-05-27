'use client';

// ClassificationDrill — M5 Activity 5.1 specialized component.
// Presents 20 timed scenarios (20s each) for data classification practice.
// State machine: 'ready' | 'active' | 'review' | 'submitted'
// A11Y-01: keyboard accessible radio groups; timer does not auto-advance mid-keyboard-navigation.
//          Keyboard shortcuts 1/2/3 available during active drill (announced via sr-only hint).
// A11Y-02: text labels for all correctness indicators (not color-only), timer urgency announced by text.
// Ported to mockup tokens 2026-05-27: ink/cream/gold/slate, Inter only, sentence-case headings,
// UPPER CASE button labels, no italics.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Activity } from '@content/courses/foundation-program';
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

const INTER_STACK = 'Inter, ui-sans-serif, system-ui, sans-serif';

const eyebrowStyle: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const ctaButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 28px',
  background: 'var(--ink)',
  color: 'var(--cream)',
  border: '1px solid var(--ink)',
  borderRadius: 12,
  fontFamily: INTER_STACK,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'background var(--t-fast) var(--ease), color var(--t-fast) var(--ease)',
};

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
      style={{
        border: '1px solid var(--ink-a10)',
        borderLeft: '4px solid var(--gold)',
        borderRadius: 16,
        padding: 24,
        background: 'var(--cream)',
        boxShadow: 'var(--shadow-soft)',
        marginBottom: 32,
      }}
    >
      {/* Activity header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ ...eyebrowStyle, marginBottom: 6 }}>
          Activity {activity.id}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <h3
            style={{
              fontFamily: INTER_STACK,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              margin: '0 0 8px 0',
              lineHeight: 1.3,
            }}
          >
            {activity.title}
          </h3>
          {phase === 'submitted' && (
            <span
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                background: 'var(--emerald-50)',
                border: '1px solid var(--emerald-700)',
                borderRadius: 999,
                fontFamily: INTER_STACK,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--emerald-800)',
              }}
            >
              Submitted
            </span>
          )}
        </div>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 14,
            color: 'var(--slate-600)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {activity.description}
        </p>
      </div>

      {phase === 'ready' && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 14,
              color: 'var(--slate-600)',
              margin: '0 0 8px 0',
            }}
          >
            {totalScenarios} scenarios · 20 seconds each · score shown at end
          </p>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 14,
              color: 'var(--slate-600)',
              margin: '0 0 16px 0',
            }}
          >
            Classify each scenario as Tier 1 (Public), Tier 2 (Internal Only), or Tier 3 (Highly Restricted).
          </p>
          <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 32 }}>
            Keyboard shortcut: press 1, 2, or 3 to select during the drill
          </p>
          <button
            type="button"
            onClick={handleStartDrill}
            style={ctaButtonStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ink-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ink)'; }}
          >
            START DRILL
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
            <p
              style={{
                marginTop: 16,
                fontFamily: INTER_STACK,
                fontSize: 14,
                color: '#B91C1C',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 12,
                padding: '8px 14px',
              }}
              role="alert"
            >
              {serverError}
            </p>
          )}
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--ink-a10)',
            }}
          >
            <button
              type="button"
              onClick={handleSubmitDrill}
              disabled={submitting}
              style={{
                ...ctaButtonStyle,
                padding: '10px 24px',
                opacity: submitting ? 0.55 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--ink-2)'; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--ink)'; }}
            >
              {submitting ? 'SUBMITTING…' : 'SUBMIT RESULTS'}
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
          <p
            style={{
              ...eyebrowStyle,
              marginTop: 24,
              color: 'var(--emerald-700)',
              textAlign: 'center',
            }}
          >
            Drill results saved
          </p>
        </div>
      )}
    </div>
  );
}
