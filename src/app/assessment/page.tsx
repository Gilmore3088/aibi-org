'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAssessmentV2, QUESTIONS_PER_SESSION } from './_lib/useAssessmentV2';
import { QuestionCard } from './_components/QuestionCard';
import { ProgressBar } from './_components/ProgressBar';
import { EmailGate } from './_components/EmailGate';

// ResultsViewV2 is a ~25 KB source component (drags in PdfDownloadButton +
// SignupModal + result-rendering helpers). It only renders after the user
// completes questions AND captures email. Defer the chunk until then so
// the initial page bundle stays light — the user has spent ~2 minutes
// answering questions by the time this is needed.
const ResultsViewV2 = dynamic(
  () => import('./_components/ResultsViewV2').then((mod) => mod.ResultsViewV2),
  { ssr: false },
);

export default function AssessmentPage() {
  const state = useAssessmentV2();
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);
  const [capturedFirstName, setCapturedFirstName] = useState<string | null>(null);
  const [capturedInstitution, setCapturedInstitution] = useState<string | null>(null);
  const [capturedProfileId, setCapturedProfileId] = useState<string | null>(null);
  const [usedFreeEmail, setUsedFreeEmail] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scoreHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.isComplete && state.phase === 'score') {
      // Move focus to the score-phase heading so screen readers announce
      // the transition and keyboard users land somewhere meaningful
      // instead of on the now-unmounted last answer button.
      requestAnimationFrame(() => scoreHeadingRef.current?.focus());
    }
  }, [state.isComplete, state.phase, state.totalScore, state.tier]);

  // After email capture, the page transitions from the email-gate view to
  // the full report (ResultsViewV2). The user's scroll position is wherever
  // they tapped the submit button — usually near the bottom of the gate
  // form on mobile. Without this, the report appears to "start" from
  // wherever the form ended, which reads as broken.
  useEffect(() => {
    if (state.phase === 'results' && capturedEmail) {
      requestAnimationFrame(() => {
        // Legacy two-arg form (always synchronous, always typed across lib
        // versions). The newer { behavior: 'instant' } option may not be
        // in ScrollBehavior on older lib.dom.d.ts versions used by CI.
        window.scrollTo(0, 0);
      });
    }
  }, [state.phase, capturedEmail]);

  if (!mounted) {
    // Pre-hydration skeleton — sessionStorage-aware state must be read client-
    // side, but a blank screen reads as broken on slow phones. Render a
    // shape-only placeholder that matches the question card layout.
    return <AssessmentSkeleton />;
  }

  return (
    <main className="min-h-screen">
      <h1 className="sr-only">AI Readiness Assessment</h1>
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
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Email gate is now the entire score-phase view. Score, tier,
                dimension breakdown, and starter artifact are all gated
                behind email capture. Reverses the 2026-04-27 decision —
                see DECISIONS.md entry from 2026-05-18 and issue #189.

                The 12-question assessment (vs the original 8) gives users
                more sunk cost, so an email gate at the score reveal has
                materially lower bounce risk than it did at 8 questions. */}
            <header className="text-center space-y-4">
              <p
                className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70"
              >
                12 of 12 · Diagnostic complete
              </p>
              <h2
                ref={scoreHeadingRef}
                tabIndex={-1}
                className="font-serif text-3xl md:text-5xl leading-tight text-[color:var(--color-ink)] focus:outline-none"
              >
                Your readiness report is <em className="text-[color:var(--color-terra)]">ready.</em>
              </h2>
              <p className="font-serif italic text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
                Enter your work email to see your score, tier, eight-dimension breakdown, and a starter artifact keyed to your weakest area.
              </p>
            </header>

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
                setUsedFreeEmail(extras.usedFreeEmail ?? false);
                // Update the URL bar to the bookmarkable per-profile path
                // (`/results/${profileId}`). Uses replaceState so the
                // component stays mounted — no flicker, no remount, no
                // navigation. Users can now copy the URL, share it with
                // a colleague, or bookmark it for return-later access.
                // The /results/[id] route renders the same ResultsViewV2
                // server-side via loadAssessmentResponse. See #189 PR-B.
                if (extras.profileId) {
                  try {
                    window.history.replaceState({}, '', `/results/${extras.profileId}`);
                  } catch {
                    // History API failed (very old browser or sandboxed
                    // iframe) — fall through. Report still renders inline;
                    // user just can't bookmark the per-profile URL.
                  }
                }
                state.advanceToResults();
              }}
            />

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
          <>
            {usedFreeEmail && (
              <aside
                className="max-w-3xl mx-auto mb-8 border border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] px-5 py-4 rounded-[2px] text-sm leading-relaxed text-[color:var(--color-ink)]/85"
                aria-label="Personal email notice"
              >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] mb-1.5">
                  Note
                </p>
                <p>
                  You submitted a personal email. The report below is tailored
                  using the institution you provided. If you’d prefer follow-up
                  emails to land at your work address, just retake the
                  assessment with your work email and we’ll merge the records.
                </p>
              </aside>
            )}
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
          </>
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
