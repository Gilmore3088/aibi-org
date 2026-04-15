'use client';

import { useEffect, useState } from 'react';
import { questions } from '@content/assessments/v1/questions';
import { trackEvent } from '@/lib/analytics/plausible';
import { useAssessment, TOTAL_QUESTIONS } from './_lib/useAssessment';
import { QuestionCard } from './_components/QuestionCard';
import { ProgressBar } from './_components/ProgressBar';
import { ScoreRing } from './_components/ScoreRing';
import { EmailGate } from './_components/EmailGate';
import { ResultsView } from './_components/ResultsView';

export default function AssessmentPage() {
  const state = useAssessment();
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    trackEvent('assessment_start');
  }, []);

  useEffect(() => {
    if (state.isComplete && state.phase === 'score') {
      trackEvent('assessment_complete', {
        score: state.totalScore,
        tier: state.tier?.id ?? 'unknown',
      });
    }
  }, [state.isComplete, state.phase, state.totalScore, state.tier]);

  if (!mounted) {
    // Avoid SSR flash — we need sessionStorage-aware state on first paint.
    return null;
  }

  return (
    <main className="min-h-screen">
      <ProgressBar progress={state.phase === 'questions' ? state.progress : 1} />

      <div className="px-6 py-12 md:py-20">
        {state.phase === 'questions' && (
          <QuestionCard
            question={questions[state.currentQuestion]}
            questionNumber={state.currentQuestion + 1}
            totalQuestions={TOTAL_QUESTIONS}
            selectedPoints={state.answers[state.currentQuestion]}
            onAnswer={state.answer}
            onBack={state.back}
            canGoBack={state.currentQuestion > 0}
          />
        )}

        {state.phase === 'score' && state.tier && (
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex flex-col items-center">
              <ScoreRing
                score={state.totalScore}
                minScore={8}
                maxScore={32}
                colorVar={state.tier.colorVar}
                label={state.tier.label}
              />
              <h2 className="font-serif text-3xl md:text-4xl text-center mt-8 max-w-xl text-[color:var(--color-ink)]">
                {state.tier.headline}
              </h2>
            </div>

            {emailCaptured ? (
              <ResultsView
                score={state.totalScore}
                tier={state.tier}
                answers={state.answers}
              />
            ) : (
              <EmailGate
                score={state.totalScore}
                tierId={state.tier.id}
                tierLabel={state.tier.label}
                answers={state.answers}
                onCaptured={(email) => {
                  trackEvent('email_captured', { tier: state.tier?.id ?? 'unknown' });
                  setEmailCaptured(true);
                  state.advanceToResults();
                  void email;
                }}
              />
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={state.restart}
                className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)]"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {state.phase === 'results' && state.tier && (
          <ResultsView
            score={state.totalScore}
            tier={state.tier}
            answers={state.answers}
          />
        )}
      </div>
    </main>
  );
}
