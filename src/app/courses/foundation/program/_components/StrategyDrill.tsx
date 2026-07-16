'use client';

// StrategyDrill — Module 3 Activity 3.1.
//
// Quick-fire reps on the strategy shelf: a banking task appears, the learner
// picks the strategy, and gets instant feedback plus a one-line "why". Eight
// rounds, untimed, no penalty — the drill is the lesson. Comes before the
// Prompt Wizard (3.2): learn which kind of prompt to reach for, then build one.
//
// House style: mockup tokens, Inter, sentence-case, UPPERCASE buttons, status
// never color-only.

import { useCallback, useState, type CSSProperties } from 'react';
import type { Activity } from '@content/courses/foundation-program';
import { STRATEGIES, STRATEGY_DEFINITIONS, STRATEGY_ROUNDS, type Strategy } from '../_lib/strategyDrillData';
import { INTER_STACK_SHORT as INTER } from '@/lib/ui/fonts';
import { INK } from '@/lib/brand/colors';
import { GOLD_DEEP_VAR as GOLD_DEEP } from '@/lib/brand/colors';

const CREAM = 'var(--cream)'; // inherits the course soft-slate override (CourseShell)
const LINE = 'rgba(7,26,47,.12)';
const SLATE = '#475569';
const EMERALD = '#047857';
const RED = '#B91C1C';

export interface StrategyDrillProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

export function StrategyDrill({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: StrategyDrillProps) {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<Strategy | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(Boolean(existingResponse));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const round = STRATEGY_ROUNDS[idx];
  const total = STRATEGY_ROUNDS.length;

  const choose = useCallback(
    (s: Strategy) => {
      if (pick) return; // already answered this round
      setPick(s);
      if (s === round.answer) setScore((n) => n + 1);
    },
    [pick, round],
  );

  const next = useCallback(() => {
    if (idx + 1 >= total) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setPick(null);
  }, [idx, total]);

  const submit = useCallback(async () => {
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
          response: { strategy_drill_result: `Matched ${score} of ${total} tasks to the right strategy.` },
        }),
      });
      if (res.ok || res.status === 409) {
        setSubmitted(true);
        onSubmitSuccess?.(activity.id);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setServerError(data.error ?? 'Submission failed. Please try again.');
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [enrollmentId, moduleNumber, activity.id, score, total, onSubmitSuccess]);

  if (submitted) {
    return (
      <div style={card}>
        <div style={eyebrow}>Strategy drill · complete</div>
        <p style={{ color: INK, fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.6, margin: '10px 0 4px' }}>
          You can name the kind of work before you write. ✓
        </p>
        <p style={{ color: SLATE, fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
          Structured for new work, transformation to reshape, analysis to review, thinking to
          plan, template to repeat, sanitisation to protect. Next, build one in the Prompt
          Wizard below.
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <div style={card}>
        <div style={eyebrow}>Strategy drill · {score}/{total}</div>
        <p style={{ color: INK, fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.6, margin: '10px 0 4px' }}>
          {score === total ? 'Clean sweep.' : `You matched ${score} of ${total}.`}
        </p>
        <p style={{ color: SLATE, fontSize: '1rem', lineHeight: 1.6, margin: '0 0 14px' }}>
          Naming the kind of work is half of getting a clean result. Save this and move on to
          the Prompt Wizard.
        </p>
        <button type="button" onClick={submit} disabled={submitting} style={primaryBtn}>
          {submitting ? 'Saving…' : 'Save & continue'}
        </button>
        {serverError && <p style={{ color: RED, fontSize: '0.875rem', marginTop: 10 }}>{serverError}</p>}
      </div>
    );
  }

  const answered = pick !== null;

  return (
    <div style={card}>
      <div style={eyebrow}>Strategy drill · {activity.title}</div>
      <p style={{ color: SLATE, fontSize: '0.8125rem', margin: '6px 0 12px' }}>
        Task {idx + 1} of {total} · score {score}
      </p>

      <p style={{ color: INK, fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, margin: '0 0 14px' }}>
        {round.task}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
        {STRATEGIES.map((s) => {
          const isAnswer = s === round.answer;
          const isPick = s === pick;
          const reveal = answered && (isAnswer || isPick);
          const bg = reveal ? (isAnswer ? '#D1FAE5' : '#FEE2E2') : 'white';
          const bd = reveal ? (isAnswer ? EMERALD : RED) : LINE;
          return (
            <button
              key={s}
              type="button"
              onClick={() => choose(s)}
              disabled={answered}
              style={{
                fontFamily: INTER,
                fontSize: '1rem',
                fontWeight: 700,
                color: INK,
                background: bg,
                border: `1px solid ${bd}`,
                borderRadius: 12,
                padding: '12px 10px',
                cursor: answered ? 'default' : 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'block' }}>
                {reveal && (isAnswer ? '✓ ' : isPick ? '✗ ' : '')}
                {s}
              </span>
              <span style={{ display: 'block', marginTop: 4, fontSize: '0.75rem', fontWeight: 500, color: '#475569', lineHeight: 1.3 }}>
                {STRATEGY_DEFINITIONS[s]}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div aria-live="polite" style={{ marginTop: 14 }}>
          <p
            style={{
              color: INK,
              fontSize: '1rem',
              lineHeight: 1.6,
              background: CREAM,
              borderLeft: `3px solid ${pick === round.answer ? EMERALD : GOLD_DEEP}`,
              padding: '10px 12px',
              borderRadius: 8,
              margin: 0,
            }}
          >
            <strong>{round.answer}.</strong> {round.why}
          </p>
          <button type="button" onClick={next} style={{ ...primaryBtn, marginTop: 12 }}>
            {idx + 1 >= total ? 'See your score' : 'Next task'}
          </button>
        </div>
      )}
    </div>
  );
}

const card: CSSProperties = {
  background: 'white',
  border: `1px solid ${LINE}`,
  borderRadius: 18,
  padding: 22,
  margin: '28px 0',
};
const eyebrow: CSSProperties = {
  fontFamily: INTER,
  fontSize: '0.75rem',
  fontWeight: 800,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: GOLD_DEEP,
};
const primaryBtn: CSSProperties = {
  fontFamily: INTER,
  fontSize: '0.75rem',
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: CREAM,
  background: INK,
  border: 'none',
  borderRadius: 12,
  padding: '11px 20px',
  cursor: 'pointer',
};
