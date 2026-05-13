'use client';

// Client component for the paid 48-question In-Depth Assessment UI.
// Reuses QuestionCard / ProgressBar / ScoreRing from the free flow but
// drives them via useAssessmentInDepth (full 48-question pool, separate
// sessionStorage key) and posts to /api/assessment/in-depth/submit on
// completion (auth + entitlement enforced server-side).

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentInDepth } from '../../_lib/useAssessmentInDepth';
import { QuestionCard } from '@/app/assessment/_components/QuestionCard';
import { ProgressBar } from '@/app/assessment/_components/ProgressBar';
import { ScoreRing } from '@/app/assessment/_components/ScoreRing';

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string };

export function InDepthRunner(): React.ReactElement {
  const state = useAssessmentInDepth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' });
  const scoreHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Destructure the exact fields we depend on so the dependency list is
  // explicit and the linter is satisfied. Server now recomputes score,
  // maxScore, tier, and dimensionBreakdown — the client only sends what
  // the user picked (answers) and in what order (questionIds). This keeps
  // the trust boundary at the server.
  const { isComplete, tier, answers, selectedQuestions } = state;

  useEffect(() => {
    if (!isComplete || !tier || submittedRef.current) return;
    submittedRef.current = true;
    setSubmit({ kind: 'submitting' });

    void (async () => {
      try {
        const response = await fetch('/api/assessment/in-depth/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            questionIds: selectedQuestions.map((q) => q.id),
          }),
        });
        const data = (await response.json()) as { profileId?: string; error?: string };
        if (!response.ok) {
          setSubmit({
            kind: 'error',
            message: data.error ?? 'Could not save your assessment.',
          });
          submittedRef.current = false;
          return;
        }
        // Redirect into the In-Depth Briefing surface — the dedicated
        // rich-report page for the paid 48-question assessment.
        if (data.profileId) {
          router.replace(`/assessment/in-depth/results/${data.profileId}`);
        } else {
          setSubmit({ kind: 'error', message: 'Saved, but no result ID returned.' });
        }
      } catch {
        setSubmit({
          kind: 'error',
          message: 'Network error. Try clicking "Retry" below.',
        });
        submittedRef.current = false;
      }
    })();
  }, [isComplete, tier, answers, selectedQuestions, router]);

  useEffect(() => {
    if (state.phase === 'score') {
      requestAnimationFrame(() => scoreHeadingRef.current?.focus());
    }
  }, [state.phase]);

  if (!mounted || state.questionCount === 0) {
    return (
      <main className="min-h-screen" aria-hidden="true">
        <div className="h-1 bg-[color:var(--color-ink)]/10" />
        <div className="px-6 py-20 max-w-2xl mx-auto animate-pulse">
          <div className="h-10 w-3/4 bg-[color:var(--color-ink)]/10 rounded-sm mb-3" />
          <div className="h-10 w-1/2 bg-[color:var(--color-ink)]/10 rounded-sm mb-10" />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] rounded-sm mb-3"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <ProgressBar progress={state.phase === 'questions' ? state.progress : 1} />

      <div className="px-6 py-12 md:py-20">
        {state.phase === 'questions' && state.selectedQuestions.length > 0 && (
          <QuestionCard
            question={state.selectedQuestions[state.currentQuestion]}
            questionNumber={state.currentQuestion + 1}
            totalQuestions={state.questionCount}
            selectedPoints={state.answers[state.currentQuestion]}
            onAnswer={state.answer}
            onBack={state.goBack}
            canGoBack={state.currentQuestion > 0}
          />
        )}

        {state.phase === 'score' && state.tier && (
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="flex flex-col items-center text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 mb-6">
                Your In-Depth Readiness Score
              </p>
              <ScoreRing
                score={state.totalScore}
                minScore={state.questionCount}
                maxScore={state.maxScore}
                colorVar={state.tier.colorVar}
                label={state.tier.label}
              />
              <h2
                ref={scoreHeadingRef}
                tabIndex={-1}
                className="font-serif text-3xl md:text-4xl mt-8 max-w-xl text-[color:var(--color-ink)] focus:outline-none"
              >
                {state.tier.headline}
              </h2>
              <p className="text-lg text-[color:var(--color-ink)]/75 mt-4 max-w-2xl leading-relaxed">
                {state.tier.summary}
              </p>
            </div>

            <div className="text-center">
              {submit.kind === 'submitting' && (
                <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70">
                  Saving your full breakdown&hellip;
                </p>
              )}
              {submit.kind === 'error' && (
                <div className="space-y-3">
                  <p className="text-sm text-[color:var(--color-error)]" role="alert">
                    {submit.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      submittedRef.current = false;
                      setSubmit({ kind: 'idle' });
                      // Re-trigger via a no-op state change.
                      state.advanceToResults();
                    }}
                    className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)] hover:opacity-80"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
