'use client';

// TestOutCard — prior-experience recognition for early-ramp modules.
//
// "Already comfortable with this? Take the 3-question check to mark this
// module complete." Grading happens server-side at /api/courses/test-out;
// this card only collects answers and refreshes the page on a pass so the
// server unlocks the next module. Styling follows KnowledgeCheck.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TestOutCheck } from '@content/courses/foundation-program/test-out';
import { INK } from '@/lib/brand/colors';
import { GOLD_DEEP_VAR as GOLD_DEEP } from '@/lib/brand/colors';

const SLATE = '#475569';
const LINE = 'rgba(7,26,47,.12)';
const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface TestOutCardProps {
  readonly check: TestOutCheck;
  readonly enrollmentId: string;
}

type Status =
  | { readonly kind: 'idle' }
  | { readonly kind: 'submitting' }
  | { readonly kind: 'failed'; readonly correctCount: number; readonly total: number }
  | { readonly kind: 'passed' }
  | { readonly kind: 'error'; readonly message: string };

export function TestOutCard({ check, enrollmentId }: TestOutCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const allAnswered = check.questions.every((question) => answers[question.id]);
  const busy = status.kind === 'submitting' || status.kind === 'passed';

  async function submit() {
    if (!allAnswered || busy) return;
    setStatus({ kind: 'submitting' });
    try {
      const response = await fetch('/api/courses/test-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          moduleNumber: check.moduleNumber,
          answers,
        }),
      });
      const data = (await response.json()) as {
        passed?: boolean;
        correctCount?: number;
        total?: number;
        error?: string;
      };
      if (!response.ok) {
        setStatus({ kind: 'error', message: data.error ?? 'Something went wrong. Try again.' });
        return;
      }
      if (data.passed) {
        setStatus({ kind: 'passed' });
        router.refresh();
        return;
      }
      setStatus({
        kind: 'failed',
        correctCount: data.correctCount ?? 0,
        total: data.total ?? check.questions.length,
      });
    } catch {
      setStatus({ kind: 'error', message: 'Network error. Check your connection and try again.' });
    }
  }

  return (
    <section
      aria-labelledby={`test-out-m${check.moduleNumber}-heading`}
      data-testid="foundation-test-out"
      style={{
        background: '#fff',
        border: `1px solid ${LINE}`,
        borderRadius: 18,
        overflow: 'hidden',
        margin: '0 0 18px',
        fontFamily: FONT_INTER,
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          gap: 14,
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          background: 'var(--cream-2)',
          borderBottom: open ? `1px solid ${LINE}` : 'none',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: GOLD_DEEP,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}
          >
            Already comfortable with this?
          </p>
          <h3
            id={`test-out-m${check.moduleNumber}-heading`}
            style={{ margin: '6px 0 0', color: INK, fontSize: '1.0625rem', fontWeight: 800, lineHeight: 1.35 }}
          >
            Take the {check.questions.length}-question check to mark this module complete.
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          style={{
            minHeight: 42,
            border: `1px solid ${open ? LINE : INK}`,
            borderRadius: 999,
            background: open ? '#fff' : INK,
            color: open ? INK : '#fff',
            padding: '0 16px',
            fontFamily: FONT_INTER,
            fontSize: '0.8125rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {open ? 'Hide the check' : 'Start the check'}
        </button>
      </div>

      {open && (
        <div style={{ padding: 20, display: 'grid', gap: 18 }}>
          {check.questions.map((question, questionIndex) => (
            <fieldset
              key={question.id}
              style={{ border: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}
            >
              <legend
                style={{
                  color: INK,
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  lineHeight: 1.4,
                  marginBottom: 8,
                  padding: 0,
                }}
              >
                {questionIndex + 1}. {question.prompt}
              </legend>
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      border: `1px solid ${selected ? INK : LINE}`,
                      borderRadius: 12,
                      background: selected ? 'var(--cream-2)' : '#fff',
                      padding: '11px 13px',
                      cursor: 'pointer',
                      color: INK,
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      fontWeight: 650,
                    }}
                  >
                    <input
                      type="radio"
                      name={`test-out-${check.moduleNumber}-${question.id}`}
                      value={option.id}
                      checked={selected}
                      onChange={() =>
                        setAnswers((current) => ({ ...current, [question.id]: option.id }))
                      }
                      style={{ marginTop: 3 }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </fieldset>
          ))}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={submit}
              disabled={!allAnswered || busy}
              style={{
                minHeight: 44,
                border: '1px solid',
                borderColor: allAnswered && !busy ? INK : LINE,
                borderRadius: 999,
                background: allAnswered && !busy ? INK : 'var(--cream-2)',
                color: allAnswered && !busy ? '#fff' : SLATE,
                padding: '0 18px',
                fontFamily: FONT_INTER,
                fontSize: '0.8125rem',
                fontWeight: 850,
                cursor: allAnswered && !busy ? 'pointer' : 'not-allowed',
              }}
            >
              {status.kind === 'submitting'
                ? 'Checking…'
                : status.kind === 'passed'
                  ? 'Passed — unlocking next module'
                  : 'Submit answers'}
            </button>
            <span style={{ color: SLATE, fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: 650 }}>
              All {check.questions.length} correct marks the module complete. You can retry, or
              just work through the module below.
            </span>
          </div>

          <div aria-live="polite">
            {status.kind === 'failed' && (
              <p style={{ margin: 0, color: SLATE, fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 650 }}>
                {status.correctCount} of {status.total} correct. Worth working through this module —
                adjust your answers and retry any time.
              </p>
            )}
            {status.kind === 'passed' && (
              <p style={{ margin: 0, color: GOLD_DEEP, fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 750 }}>
                Module marked complete. The next module is unlocked.
              </p>
            )}
            {status.kind === 'error' && (
              <p style={{ margin: 0, color: '#8A1F1F', fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 650 }}>
                {status.message}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
