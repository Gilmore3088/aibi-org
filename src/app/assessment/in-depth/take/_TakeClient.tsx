'use client';

// 48-question take UI for the In-Depth Assessment. One question at a time,
// localStorage-backed so a refresh / tab kill doesn't lose progress. On
// final submit, posts to /api/indepth/submit-answers and redirects to the
// results page.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AssessmentQuestion, Dimension } from '@content/assessments/v2/types';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';

interface TakeClientProps {
  readonly takerId: string;
  readonly questions: readonly AssessmentQuestion[];
  readonly inviteToken: string;
}

interface PersistedState {
  readonly answers: Record<string, number>;
  readonly currentIndex: number;
}

function storageKey(takerId: string): string {
  return `aibi-indepth-${takerId}`;
}

export default function TakeClient({ takerId, questions, inviteToken }: TakeClientProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitPanelRef = useRef<HTMLDivElement | null>(null);

  // Restore on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(takerId));
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed && typeof parsed === 'object') {
          if (parsed.answers && typeof parsed.answers === 'object') {
            setAnswers(parsed.answers);
          }
          if (
            typeof parsed.currentIndex === 'number' &&
            parsed.currentIndex >= 0 &&
            parsed.currentIndex < questions.length
          ) {
            setCurrentIndex(parsed.currentIndex);
          }
        }
      }
    } catch {
      // ignore — start fresh
    }
    setHydrated(true);
  }, [takerId, questions.length]);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: PersistedState = { answers, currentIndex };
      localStorage.setItem(storageKey(takerId), JSON.stringify(payload));
    } catch {
      // localStorage may be unavailable; degrade to in-memory state
    }
  }, [hydrated, takerId, answers, currentIndex]);

  // Scroll the submit panel into view the first time the user finishes
  // every question, so they don't miss the submit button.
  useEffect(() => {
    if (!hydrated) return;
    const allAnswered = Object.keys(answers).length === questions.length;
    if (allAnswered && submitPanelRef.current) {
      submitPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [hydrated, answers, questions.length]);

  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  );
  const allAnswered = answeredCount === totalQuestions;
  const currentQuestion = questions[currentIndex];
  const currentSelected = currentQuestion ? answers[currentQuestion.id] : undefined;

  function selectAnswer(points: number) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: points }));
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function jumpTo(index: number) {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
    }
  }

  async function handleSubmit() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/indepth/submit-answers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ takerId, answers }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Submit failed (${res.status})`);
      }
      try {
        localStorage.removeItem(storageKey(takerId));
      } catch {
        // ignore
      }
      window.location.href = `/results/in-depth/${takerId}?t=${encodeURIComponent(inviteToken)}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submit failed';
      setSubmitError(message);
      setSubmitting(false);
    }
  }

  if (!currentQuestion) return null;

  const dimensionLabel = DIMENSION_LABELS[currentQuestion.dimension as Dimension] ??
    currentQuestion.dimension;

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] px-6 py-12 md:py-16">
      <div className="w-full max-w-2xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <span className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70">
            Question{' '}
            <span className="font-mono tabular-nums">{currentIndex + 1}</span>
            {' of '}
            <span className="font-mono tabular-nums">{totalQuestions}</span>
          </span>
          <span className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            {dimensionLabel}
          </span>
        </header>

        <div
          className="h-1 w-full bg-[color:var(--color-ink)]/10 mb-10"
          aria-hidden="true"
        >
          <div
            className="h-full bg-[color:var(--color-terra)] transition-all"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <h1
          key={currentQuestion.id}
          className="font-serif text-3xl md:text-4xl leading-tight mb-10 text-[color:var(--color-ink)]"
        >
          {currentQuestion.prompt}
        </h1>

        <div
          className="space-y-3"
          role="radiogroup"
          aria-label={currentQuestion.prompt}
        >
          {currentQuestion.options.map((option, idx) => {
            const selected = currentSelected === option.points;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => selectAnswer(option.points)}
                className={
                  'w-full text-left px-5 py-4 border-l-4 border-y border-r transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-terra)] flex items-start gap-3 ' +
                  (selected
                    ? 'border-l-[color:var(--color-terra)] border-y-[color:var(--color-terra)] border-r-[color:var(--color-terra)] bg-[color:var(--color-terra-pale)]/40 text-[color:var(--color-ink)]'
                    : 'border-l-transparent border-y-[color:var(--color-ink)]/15 border-r-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] hover:border-l-[color:var(--color-terra)]/40 hover:border-y-[color:var(--color-terra)] hover:border-r-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-pale)]/20 text-[color:var(--color-ink)]')
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    'font-mono text-base leading-snug shrink-0 ' +
                    (selected
                      ? 'text-[color:var(--color-terra)]'
                      : 'text-[color:var(--color-ink)]/30')
                  }
                >
                  {selected ? '✓' : '○'}
                </span>
                <span className="font-sans text-base md:text-lg leading-snug">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={goBack}
            disabled={currentIndex === 0}
            className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-terra)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &larr; Back
          </button>
          <span className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60">
            <span className="font-mono tabular-nums">{answeredCount}</span>
            {' / '}
            <span className="font-mono tabular-nums">{totalQuestions}</span>
            {' answered'}
          </span>
        </div>

        {allAnswered && (
          <div
            ref={submitPanelRef}
            className="mt-12 border-t border-[color:var(--color-ink)]/15 pt-10"
          >
            <h2 className="font-serif text-2xl text-[color:var(--color-ink)] mb-4">
              You have answered all {totalQuestions} questions.
            </h2>
            <p className="font-sans text-base text-[color:var(--color-ink)]/80 mb-6">
              Submit your responses to generate your full diagnostic.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit my answers'}
              </button>
              <button
                type="button"
                onClick={() => jumpTo(0)}
                className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-terra)]"
              >
                Review from start
              </button>
            </div>
            {submitError && (
              <p
                role="alert"
                className="mt-4 font-sans text-sm text-[color:var(--color-error)]"
              >
                {submitError}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
