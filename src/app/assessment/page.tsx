'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics/plausible';
import { useAssessmentV2, QUESTIONS_PER_SESSION } from './_lib/useAssessmentV2';
import { QuestionCard } from './_components/QuestionCard';
import { ProgressBar } from './_components/ProgressBar';
import { EmailGate } from './_components/EmailGate';
import { ResultsViewV2 } from './_components/ResultsViewV2';
import { ScoreRing } from './_components/ScoreRing';

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '#';

export default function AssessmentPage() {
  const state = useAssessmentV2();
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
    // Avoid SSR flash — sessionStorage-aware state must be read client-side.
    return null;
  }

  const isLowerTier =
    state.tier?.id === 'starting-point' || state.tier?.id === 'early-stage';

  return (
    <main className="min-h-screen">
      <ProgressBar progress={state.phase === 'questions' ? state.progress : 1} />

      <div className="px-6 py-12 md:py-20">
        {state.phase === 'questions' && state.selectedQuestions.length > 0 && (
          <QuestionCard
            question={state.selectedQuestions[state.currentQuestion]}
            questionNumber={state.currentQuestion + 1}
            totalQuestions={QUESTIONS_PER_SESSION}
            selectedPoints={state.answers[state.currentQuestion]}
            onAnswer={state.answer}
          />
        )}

        {state.phase === 'score' && state.tier && (
          <div className="max-w-3xl mx-auto space-y-12">
            {/* ASMT-06: Score and tier visible immediately — no email gate */}
            <div className="flex flex-col items-center text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 mb-6">
                Your AI Readiness Score
              </p>
              <ScoreRing
                score={state.totalScore}
                minScore={12}
                maxScore={48}
                colorVar={state.tier.colorVar}
                label={state.tier.label}
              />
              <h2 className="font-serif text-3xl md:text-4xl text-center mt-8 max-w-xl text-[color:var(--color-ink)]">
                {state.tier.headline}
              </h2>
              <p className="text-lg text-[color:var(--color-ink)]/75 text-center mt-4 max-w-2xl leading-relaxed">
                {state.tier.summary}
              </p>
            </div>

            {/* ASMT-08: Tier-specific CTAs */}
            <div className="flex flex-col items-center gap-4">
              {isLowerTier ? (
                <a
                  href="/courses/aibi-p/purchase"
                  onClick={() =>
                    trackEvent('purchase_initiated', { product: 'aibi-p' })
                  }
                  className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
                >
                  Start Your AI Journey &mdash; AiBI-P Course $79
                </a>
              ) : (
                <a
                  href={CALENDLY_URL}
                  onClick={() =>
                    trackEvent('briefing_booked', { source: 'assessment' })
                  }
                  className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
                >
                  Book Your Executive Briefing
                </a>
              )}
            </div>

            {/* ASMT-07: Email gate only for dimension breakdown */}
            {!emailCaptured && (
              <EmailGate
                score={state.totalScore}
                tierId={state.tier.id}
                tierLabel={state.tier.label}
                answers={state.answers}
                version="v2"
                maxScore={48}
                dimensionBreakdown={state.getDimensionBreakdown()}
                onCaptured={(email) => {
                  trackEvent('email_captured', { tier: state.tier?.id ?? 'unknown' });
                  setCapturedEmail(email);
                  state.advanceToResults();
                }}
              />
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={state.restart}
                className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-terra)]"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {state.phase === 'results' && state.tier && capturedEmail && (
          <ResultsViewV2
            score={state.totalScore}
            tier={state.tier}
            dimensionBreakdown={state.getDimensionBreakdown()}
            email={capturedEmail}
            tierId={state.tier.id}
          />
        )}
      </div>
    </main>
  );
}
