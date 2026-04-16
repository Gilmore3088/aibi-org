'use client';

import { useEffect, useState } from 'react';
import { questions } from '@content/assessments/v1/questions';
import { trackEvent } from '@/lib/analytics/plausible';
import { useAssessment, TOTAL_QUESTIONS } from './_lib/useAssessment';
import { QuestionCard } from './_components/QuestionCard';
import { ProgressBar } from './_components/ProgressBar';
import { TierPreview } from './_components/TierPreview';
import { EmailGate } from './_components/EmailGate';
import { ResultsView } from './_components/ResultsView';

// Note: score reveal is gated behind email capture (decision 2026-04-15).
// TierPreview shows only the tier label pre-email; full score + breakdown
// render via ResultsView after capture.

export default function AssessmentPage() {
  const state = useAssessment();
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);
  const emailCaptured = capturedEmail !== null;
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

        {state.phase === 'score' && state.tier && !emailCaptured && (
          <div className="max-w-3xl mx-auto space-y-12">
            <TierPreview
              tierLabel={state.tier.label}
              tierColorVar={state.tier.colorVar}
            />
            <EmailGate
              score={state.totalScore}
              tierId={state.tier.id}
              tierLabel={state.tier.label}
              answers={state.answers}
              onCaptured={(email) => {
                trackEvent('email_captured', { tier: state.tier?.id ?? 'unknown' });
                setCapturedEmail(email);
                state.advanceToResults();
              }}
            />
            <div className="text-center">
              <button
                type="button"
                onClick={state.restart}
                className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-terra)]"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {state.phase === 'results' && state.tier && capturedEmail && (
          <ResultsView
            score={state.totalScore}
            tier={state.tier}
            answers={state.answers}
            email={capturedEmail}
          />
        )}
      </div>
    </main>
  );
}
