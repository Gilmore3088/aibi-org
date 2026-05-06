'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics/plausible';
import { useAssessmentV2, QUESTIONS_PER_SESSION } from './_lib/useAssessmentV2';
import { QuestionCard } from './_components/QuestionCard';
import { ProgressBar } from './_components/ProgressBar';
import { EmailGate } from './_components/EmailGate';
import { ResultsViewV2 } from './_components/ResultsViewV2';
import { ScoreRing } from './_components/ScoreRing';

// If the Calendly URL is unset (e.g. preview/dev), fall back to the
// /for-institutions page so the briefing CTA is never silently dead.
// Never use '#'. (2026-05-05: /for-institutions/advisory retired.)
const BRIEFING_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? '/for-institutions';

export default function AssessmentPage() {
  const state = useAssessmentV2();
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);
  const [capturedFirstName, setCapturedFirstName] = useState<string | null>(null);
  const [capturedInstitution, setCapturedInstitution] = useState<string | null>(null);
  const [capturedProfileId, setCapturedProfileId] = useState<string | null>(null);
  const emailCaptured = capturedEmail !== null;
  const [mounted, setMounted] = useState(false);
  // Whether the user has explicitly chosen to start the free assessment.
  // Combined with hydrated state below to decide between chooser vs runtime.
  const [chooserDismissed, setChooserDismissed] = useState(false);
  const scoreHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Returning visitors with in-flight progress skip the chooser and
  // resume their take. Detected client-side after sessionStorage hydration.
  const hasInflightState =
    state.answers.length > 0 || state.phase !== 'questions';
  const showChooser = !chooserDismissed && !hasInflightState;

  useEffect(() => {
    setMounted(true);
    if (!showChooser) {
      trackEvent('assessment_start');
    }
    // The chooser fires its own event on click instead of assessment_start
    // — see the chooser onClick handler below.
  }, [showChooser]);

  useEffect(() => {
    if (state.isComplete && state.phase === 'score') {
      trackEvent('assessment_complete', {
        score: state.totalScore,
        tier: state.tier?.id ?? 'unknown',
      });
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

  if (showChooser) {
    return (
      <main className="min-h-screen px-6 py-14 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12 text-center">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              Assess
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
              See where you stand.
            </h1>
            <p className="mt-4 text-base md:text-lg text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
              Two assessments — one short, one in depth. Most bankers start
              with the free 12-question version.
            </p>
          </header>

          {/* Two cards */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Free card */}
            <article className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 md:p-8 flex flex-col">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                Free · 3 minutes
              </p>
              <h2 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-3">
                Free Readiness Assessment
              </h2>
              <p className="font-mono text-sm text-[color:var(--color-slate)] tabular-nums mb-5">
                12 questions · no signup
              </p>
              <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed mb-6 flex-1">
                Get your readiness score and a tailored next-step
                recommendation. Your score is yours immediately — email is
                requested after, only if you want the full dimension breakdown.
              </p>
              <button
                type="button"
                onClick={() => {
                  trackEvent('assessment_start');
                  setChooserDismissed(true);
                }}
                className="w-full px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
              >
                Begin
              </button>
            </article>

            {/* In-Depth card */}
            <article className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/15 rounded-[3px] p-6 md:p-8 flex flex-col">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                Paid · 15–20 minutes
              </p>
              <h2 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-3">
                In-Depth Assessment
              </h2>
              <p className="font-mono text-sm text-[color:var(--color-slate)] tabular-nums mb-5">
                48 questions · $99 individual · $79 / seat at 10+
              </p>
              <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed mb-6 flex-1">
                The full diagnostic across all 8 dimensions. For yourself,
                or for your team — institution leaders see an anonymized
                aggregate report once 3+ team members complete.
              </p>
              <Link
                href="/assessment/in-depth"
                className="w-full inline-block text-center px-6 py-3 bg-transparent border border-[color:var(--color-terra)] text-[color:var(--color-terra)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] active:scale-[0.98] transition-all"
              >
                See the In-Depth Assessment
              </Link>
            </article>
          </div>

          <p className="mt-10 text-center font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/55">
            Not sure? Start with the free version. It takes 3 minutes.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <ProgressBar progress={state.phase === 'questions' ? state.progress : 1} />

      <div className="px-6 py-12 md:py-20">
        {state.phase === 'questions' && state.selectedQuestions.length > 0 && (
          <>
            <QuestionCard
              question={state.selectedQuestions[state.currentQuestion]}
              questionNumber={state.currentQuestion + 1}
              totalQuestions={QUESTIONS_PER_SESSION}
              selectedPoints={state.answers[state.currentQuestion]}
              onAnswer={state.answer}
              onBack={state.goBack}
              canGoBack={state.currentQuestion > 0}
            />
            {state.answers.length > 0 && (
              <div className="max-w-3xl mx-auto mt-8 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Discard your current answers and start a fresh assessment?',
                      )
                    ) {
                      state.restart();
                    }
                  }}
                  className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/55 hover:text-[color:var(--color-terra)] transition-colors"
                >
                  Start over
                </button>
              </div>
            )}
          </>
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
                  href="/courses/aibi-p"
                  onClick={() =>
                    trackEvent('purchase_initiated', { product: 'aibi-p' })
                  }
                  className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
                >
                  Explore the Practitioner Course
                </a>
              ) : (
                <a
                  href={BRIEFING_URL}
                  onClick={() =>
                    trackEvent('briefing_booked', { source: 'assessment' })
                  }
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
                  trackEvent('email_captured', { tier: state.tier?.id ?? 'unknown' });
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
