'use client';

import { useEffect, useRef, useState } from 'react';
import { useAssessmentV2, QUESTIONS_PER_SESSION } from './_lib/useAssessmentV2';
import { QuestionCard } from './_components/QuestionCard';
import { ProgressBar } from './_components/ProgressBar';
import { EmailGate } from './_components/EmailGate';
import { ResultsViewV2 } from './_components/ResultsViewV2';
import { ScoreRing } from './_components/ScoreRing';

// If the Calendly URL is unset (e.g. preview/dev), fall back to the advisory
// page so the briefing CTA is never silently dead. Never use '#'.
const BRIEFING_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? '/for-institutions/advisory';

export default function AssessmentPage() {
  const state = useAssessmentV2();
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);
  const [capturedFirstName, setCapturedFirstName] = useState<string | null>(null);
  const [capturedInstitution, setCapturedInstitution] = useState<string | null>(null);
  const [capturedProfileId, setCapturedProfileId] = useState<string | null>(null);
  const emailCaptured = capturedEmail !== null;
  const [mounted, setMounted] = useState(false);
  const scoreHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.isComplete && state.phase === 'score') {
      // Move focus to the score heading so screen readers announce the
      // transition and keyboard users land somewhere meaningful instead of
      // on the now-unmounted last answer button.
      requestAnimationFrame(() => scoreHeadingRef.current?.focus());
    }
  }, [state.isComplete, state.phase, state.totalScore, state.tier]);

  if (!mounted) {
    // Pre-hydration skeleton — sessionStorage-aware state must be read client-
    // side, but a blank screen reads as broken on slow phones. Render a
    // shape-only placeholder that matches the question card layout.
    return <AssessmentSkeleton />;
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
            onBack={state.goBack}
            canGoBack={state.currentQuestion > 0}
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
              <h2
                ref={scoreHeadingRef}
                tabIndex={-1}
                className="font-serif text-3xl md:text-4xl text-center mt-8 max-w-xl text-[color:var(--color-ink)] focus:outline-none"
              >
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
                  href="/assessment/in-depth"
                  className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
                >
                  Take the In-Depth Assessment · $99
                </a>
              ) : (
                <a
                  href={BRIEFING_URL}
                  className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
                >
                  Book Your Executive Briefing
                </a>
              )}

              {/* Secondary navigation — always visible */}
              <nav aria-label="Related pages" className="flex flex-wrap items-center justify-center gap-6 mt-2">
                <a
                  href="/education"
                  className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-terra)] transition-colors"
                >
                  Browse education
                </a>
                <a
                  href="/dashboard"
                  className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-terra)] transition-colors"
                >
                  Go to dashboard
                </a>
              </nav>
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
                onCaptured={(email, extras) => {
                  setCapturedEmail(email);
                  setCapturedFirstName(extras.firstName ?? null);
                  setCapturedInstitution(extras.institutionName ?? null);
                  setCapturedProfileId(extras.profileId ?? null);
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
            firstName={capturedFirstName}
            institutionName={capturedInstitution}
            profileId={capturedProfileId}
          />
        )}
      </div>
    </main>
  );
}

// Pre-hydration skeleton — purely shape, no copy. Matches the QuestionCard
// layout (label row + heading + 4 option rows) so the layout doesn't jump
// when real content swaps in.
function AssessmentSkeleton() {
  return (
    <main className="min-h-screen" aria-hidden="true">
      <div className="h-1 bg-[color:var(--color-ink)]/10" />
      <div className="px-6 py-12 md:py-20">
        <div className="w-full max-w-2xl mx-auto animate-pulse">
          <div className="flex items-center justify-between mb-8">
            <div className="h-3 w-32 bg-[color:var(--color-ink)]/10 rounded-sm" />
            <div className="h-3 w-24 bg-[color:var(--color-ink)]/10 rounded-sm" />
          </div>
          <div className="h-10 w-full bg-[color:var(--color-ink)]/10 rounded-sm mb-3" />
          <div className="h-10 w-3/4 bg-[color:var(--color-ink)]/10 rounded-sm mb-10" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-full border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] rounded-sm"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
