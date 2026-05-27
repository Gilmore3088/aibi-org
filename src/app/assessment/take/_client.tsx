'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { SiteHeader } from '@/components/mockup';
import { useAssessmentV2, QUESTIONS_PER_SESSION } from '../_lib/useAssessmentV2';
import { QuestionCard } from '../_components/QuestionCard';
import { ProgressBar } from '../_components/ProgressBar';
import { EmailGate } from '../_components/EmailGate';

// ResultsViewV2 is a ~25 KB source component (drags in PdfDownloadButton +
// SignupModal + result-rendering helpers). It only renders after the user
// completes questions AND captures email. Defer the chunk until then so
// the initial page bundle stays light — the user has spent ~2 minutes
// answering questions by the time this is needed.
const ResultsViewV2 = dynamic(
  () => import('../_components/ResultsViewV2').then((mod) => mod.ResultsViewV2),
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
      requestAnimationFrame(() => scoreHeadingRef.current?.focus());
    }
  }, [state.isComplete, state.phase, state.totalScore, state.tier]);

  useEffect(() => {
    if (state.phase === 'results' && capturedEmail) {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }
  }, [state.phase, capturedEmail]);

  if (!mounted) {
    return <AssessmentSkeleton />;
  }

  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/assessment"
        cta={{ label: 'Back to assessments', href: '/assessment' }}
      />
      <main className="mk-take">
        <h1 className="sr-only">AI Readiness Assessment</h1>
        <ProgressBar progress={state.phase === 'questions' ? state.progress : 1} />

        <div className="mk-take-inner">
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
            <div className="mk-take-score">
              <header className="mk-take-score-head">
                <p className="mk-k">12 of 12 · Diagnostic complete</p>
                <h2
                  ref={scoreHeadingRef}
                  tabIndex={-1}
                  className="mk-take-score-h"
                >
                  Your readiness report is ready.
                </h2>
                <p className="mk-take-score-lede">
                  Enter your work email to see your score, tier, eight-dimension breakdown, and a
                  starter artifact keyed to your weakest area.
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
                  if (extras.profileId) {
                    try {
                      window.history.replaceState({}, '', `/results/${extras.profileId}`);
                    } catch {
                      // ignore
                    }
                  }
                  state.advanceToResults();
                }}
              />

              <div className="mk-take-restart">
                <button type="button" onClick={state.restart} className="mk-take-restart-btn">
                  Start over
                </button>
              </div>
            </div>
          )}

          {state.phase === 'results' && state.tier && capturedEmail && (
            <>
              {usedFreeEmail && (
                <aside className="mk-take-note" aria-label="Personal email notice">
                  <p className="mk-k">Note</p>
                  <p>
                    You submitted a personal email. The report below is tailored using the
                    institution you provided. If you&rsquo;d prefer follow-up emails to land at
                    your work address, just retake the assessment with your work email and
                    we&rsquo;ll merge the records.
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
    </div>
  );
}

// Pre-hydration skeleton — purely shape, no copy. Matches the QuestionCard
// layout (label row + heading + 4 option rows) so the layout doesn't jump
// when real content swaps in.
function AssessmentSkeleton() {
  return (
    <div className="mockup-scope">
      <main className="mk-take" aria-hidden="true">
        <div className="mk-take-progress-skeleton" />
        <div className="mk-take-inner">
          <div className="mk-take-skeleton">
            <div className="mk-take-skeleton-row">
              <div className="mk-take-skeleton-bar mk-w-32" />
              <div className="mk-take-skeleton-bar mk-w-24" />
            </div>
            <div className="mk-take-skeleton-bar mk-h-10" />
            <div className="mk-take-skeleton-bar mk-h-10 mk-w-75" />
            <div className="mk-take-skeleton-options">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="mk-take-skeleton-opt" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
