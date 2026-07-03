'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wordmark } from '@/components/brand';
import { SiteHeader } from '@/components/mockup';
import { useAssessmentV3, QUESTIONS_PER_SESSION } from '../_lib/useAssessmentV3';
import { ProgressBar } from '../_components/ProgressBar';
import { EmailGate } from '../_components/EmailGate';
import type { FreeRole } from '@content/assessments/v3/roles';
import type { FreeAssetBand } from '@content/assessments/v3/asset-bands';
import {
  appendRoiSearchParams,
  parseRoiAssessmentContext,
  type RoiAssessmentContext,
} from '@/lib/roi/assessment-context';

// ResultsViewV3 is a ~25 KB source component (drags in PdfDownloadButton +
// result-rendering helpers). It only renders after the user
// completes questions AND captures email. Defer the chunk until then so
// the initial page bundle stays light — the user has spent ~2 minutes
// answering questions by the time this is needed.
const ResultsViewV3 = dynamic(
  () => import('../_components/ResultsViewV3').then((mod) => mod.ResultsViewV3),
  { ssr: false },
);

type ResumeStatus = 'idle' | 'sending' | 'sent' | 'error' | 'restoring';

export default function AssessmentPage() {
  const router = useRouter();
  const state = useAssessmentV3();
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);
  const [capturedFirstName, setCapturedFirstName] = useState<string | null>(null);
  const [capturedInstitution, setCapturedInstitution] = useState<string | null>(null);
  const [capturedProfileId, setCapturedProfileId] = useState<string | null>(null);
  const [capturedRole, setCapturedRole] = useState<FreeRole | null>(null);
  const [capturedAssetBand, setCapturedAssetBand] = useState<FreeAssetBand | null>(null);
  const [usedFreeEmail, setUsedFreeEmail] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumeStatus, setResumeStatus] = useState<ResumeStatus>('idle');
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);
  const [roiContext, setRoiContext] = useState<RoiAssessmentContext | null>(null);
  const scoreHeadingRef = useRef<HTMLDivElement | null>(null);
  const resumeAttemptedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    setRoiContext(parseRoiAssessmentContext(new URLSearchParams(window.location.search)));
  }, []);

  useEffect(() => {
    if (!mounted || resumeAttemptedRef.current || state.selectedQuestions.length === 0) return;
    const token = new URLSearchParams(window.location.search).get('resume');
    if (!token) return;

    resumeAttemptedRef.current = true;
    setResumeStatus('restoring');
    setResumeMessage('Restoring your saved assessment.');

    void (async () => {
      try {
        const response = await fetch(`/api/assessment/drafts/${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
          draft?: {
            selectedQuestionIds: string[];
            answers: number[];
            currentQuestion: number;
            phase?: 'questions' | 'score' | 'results';
          };
        };
        if (!response.ok || !data.draft) {
          throw new Error(data.error ?? 'That resume link could not be opened.');
        }
        const restored = state.restoreDraft({
          selectedQuestionIds: data.draft.selectedQuestionIds,
          answers: data.draft.answers,
          currentQuestion: data.draft.currentQuestion,
          phase: data.draft.phase ?? 'questions',
        });
        if (!restored) throw new Error('That resume link no longer matches this assessment.');
        window.history.replaceState(null, '', '/assessment/take');
        setResumeStatus('sent');
        setResumeMessage('Your saved assessment is restored.');
      } catch (error) {
        setResumeStatus('error');
        setResumeMessage(error instanceof Error ? error.message : 'That resume link could not be opened.');
      }
    })();
  }, [mounted, state, state.selectedQuestions.length]);

  useEffect(() => {
    if (state.isComplete && state.phase === 'score') {
      requestAnimationFrame(() => scoreHeadingRef.current?.focus());
    }
  }, [state.isComplete, state.phase, state.totalScore, state.tier]);

  useEffect(() => {
    if (state.phase === 'results') {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }
  }, [state.phase]);

  async function sendResumeLink(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const email = resumeEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResumeStatus('error');
      setResumeMessage('Enter a valid email address.');
      return;
    }

    setResumeStatus('sending');
    setResumeMessage(null);

    try {
      const response = await fetch('/api/assessment/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          selectedQuestionIds: state.selectedQuestions.map((question) => question.id),
          answers: state.answers,
          currentQuestion: state.currentQuestion,
          phase: state.phase,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Resume link could not be sent.');
      }
      setResumeStatus('sent');
      setResumeMessage(data.message ?? 'Check your email for a resume link.');
    } catch (error) {
      setResumeStatus('error');
      setResumeMessage(error instanceof Error ? error.message : 'Resume link could not be sent.');
    }
  }

  if (!mounted) {
    return <AssessmentSkeleton />;
  }

  const inQuestionsPhase = state.phase === 'questions';
  const inResultsPhase = state.phase === 'results';
  const showAssessmentShellHeader = !inQuestionsPhase && !inResultsPhase;

  return (
    <div className="mockup-scope">
      {inQuestionsPhase ? (
        <AssessmentFlowHeader
          progress={state.progress}
          questionNumber={state.currentQuestion + 1}
          answeredCount={state.answers.length}
          totalQuestions={QUESTIONS_PER_SESSION}
        />
      ) : showAssessmentShellHeader ? (
        <SiteHeader
          activePath="/assessment"
          cta={{ label: 'Restart', href: '#restart' }}
        />
      ) : null}
      <main className="mk-take">
        <h1 className="sr-only">AI Readiness Assessment</h1>
        {showAssessmentShellHeader && (
          <ProgressBar progress={1} />
        )}

        {inQuestionsPhase && state.selectedQuestions.length > 0 && (() => {
          const q = state.selectedQuestions[state.currentQuestion];
          const selected = state.answers[state.currentQuestion];
          return (
            <>
              <section className="mk-take-q-panel" aria-label="Question">
                <div className="mk-take-q-prompt">
                  <p className="mk-k">{q.dimension}</p>
                  <h2>{q.prompt}</h2>
                  {state.currentQuestion > 0 && (
                    <button
                      type="button"
                      className="mk-take-q-back"
                      onClick={state.goBack}
                    >
                      ← Back
                    </button>
                  )}
                </div>
                <div className="mk-take-q-options">
                  {q.options.map((opt) => {
                    const isSelected = selected === opt.points;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => state.answer(opt.points)}
                        className={`mk-take-q-option${isSelected ? ' is-selected' : ''}`}
                      >
                        <span className="mk-take-q-option-label">{opt.label}</span>
                        <span className="mk-take-q-option-mark" aria-hidden="true">
                          {isSelected ? '✓' : '→'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <ResumeLinkForm
                  email={resumeEmail}
                  status={resumeStatus}
                  message={resumeMessage}
                  onEmailChange={setResumeEmail}
                  onSubmit={sendResumeLink}
                />
              </section>
            </>
          );
        })()}

        {inResultsPhase && state.tier ? (
          <ResultsViewV3
            score={state.totalScore}
            tier={state.tier}
            dimensionBreakdown={state.getDimensionBreakdown()}
            email={capturedEmail ?? undefined}
            tierId={state.tier.id}
            firstName={capturedFirstName}
            institutionName={capturedInstitution}
            profileId={capturedProfileId}
            role={capturedRole}
            assetBand={capturedAssetBand}
            showPersonalEmailNote={usedFreeEmail}
            roiContext={roiContext}
          />
        ) : (
          <div className="mk-take-inner">
            {state.phase === 'score' && state.tier && (() => {
            const breakdown = state.getDimensionBreakdown();
            return (
              <div
                className="mk-take-score"
                ref={scoreHeadingRef as React.RefObject<HTMLDivElement>}
                tabIndex={-1}
              >
                {/* The EmailGate is the entire post-Q12 surface.
                    The previous "score-reveal + insight + send" three-stack
                    surrounded the gate with content that already lived
                    inside the gate (score, tier, top gap, first move) —
                    violating "preview value first, then ask" by showing
                    everything before the form. The redesigned EmailGate
                    owns its own preview. */}
                <section aria-label="Send the full report">
                  <div>
                    <EmailGate
                      score={state.totalScore}
                      tierId={state.tier.id}
                      tierLabel={state.tier.label}
                      answers={state.answers}
                      version="v3"
                      maxScore={48}
                      dimensionBreakdown={breakdown}
                      roiContext={roiContext}
                      onCaptured={(email, extras) => {
                        // Single render path: when the profile persisted, hand
                        // off to the canonical server-rendered /results/[id].
                        // The first name + personal-email note are not stored
                        // server-side, so carry them as transient query params
                        // (the bearer-token id is already in the URL).
                        if (extras.profileId) {
                          const params = new URLSearchParams({ from: 'assessment' });
                          if (extras.firstName) params.set('name', extras.firstName);
                          if (extras.usedFreeEmail) params.set('personal', '1');
                          if (roiContext) appendRoiSearchParams(params, roiContext);
                          router.replace(`/results/${extras.profileId}?${params.toString()}`);
                          return;
                        }
                        // Fallback (Supabase down / no row): render inline from
                        // client state since there is no server row to visit.
                        setCapturedEmail(email);
                        setCapturedFirstName(extras.firstName ?? null);
                        setCapturedInstitution(extras.institutionName ?? null);
                        setCapturedProfileId(null);
                        setCapturedRole(extras.role ?? null);
                        setCapturedAssetBand(extras.assetBand ?? null);
                        setUsedFreeEmail(extras.usedFreeEmail ?? false);
                        state.advanceToResults();
                      }}
                      onSkip={(extras) => {
                        setCapturedEmail(null);
                        setCapturedFirstName(extras.firstName ?? null);
                        setCapturedInstitution(extras.institutionName ?? null);
                        setCapturedProfileId(null);
                        setCapturedRole(extras.role ?? null);
                        setCapturedAssetBand(extras.assetBand ?? null);
                        setUsedFreeEmail(false);
                        state.advanceToResults();
                      }}
                    />
                  </div>
                </section>

                <div id="restart" className="mk-take-restart">
                  <button type="button" onClick={state.goBack} className="mk-take-restart-btn">
                    Review answers
                  </button>
                  <button type="button" onClick={state.restart} className="mk-take-restart-btn">
                    Start over
                  </button>
                </div>
              </div>
            );
          })()}
          </div>
        )}
      </main>
    </div>
  );
}

function ResumeLinkForm({
  email,
  status,
  message,
  onEmailChange,
  onSubmit,
}: {
  email: string;
  status: ResumeStatus;
  message: string | null;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const busy = status === 'sending' || status === 'restoring';

  return (
    <form id="assessment-resume-link" className="mk-take-resume" onSubmit={onSubmit}>
      <label htmlFor="assessment-resume-email">Email yourself a resume link</label>
      <div className="mk-take-resume-row">
        <input
          id="assessment-resume-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="you@bank.com"
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Sending...' : 'Send'}
        </button>
      </div>
      {message ? (
        <p className={`mk-take-resume-message is-${status === 'error' ? 'error' : 'success'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

// Compact in-flow header for the questions phase. The full marketing
// SiteHeader (Home · Assess · Learn · Resources · Institutions) is wrong
// chrome mid-task — the user is answering, not browsing. This minimal
// header keeps the wordmark for trust, gives a Save & exit, and shows
// the live position. The thin progress bar lives inside the same band so
// the question prompt is the first content the user reads.
function AssessmentFlowHeader({
  progress,
  questionNumber,
  answeredCount,
  totalQuestions,
}: {
  progress: number;
  questionNumber: number;
  answeredCount: number;
  totalQuestions: number;
}) {
  const clampedAnsweredCount = Math.min(Math.max(answeredCount, 0), totalQuestions);

  return (
    <header className="mk-take-flow-header" role="banner">
      <div className="mk-take-flow-header-row">
        <Link href="/" className="mk-take-flow-brand" aria-label="The AI Banking Institute home">
          <Wordmark variant="full" tone="dark" size={22} />
          <span className="mk-take-flow-brand-sub">AI Readiness Assessment</span>
        </Link>
        <div className="mk-take-flow-meta">
          <span className="mk-take-flow-status">
            <span className="mk-take-flow-q">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="mk-take-flow-count">
              {clampedAnsweredCount} of {totalQuestions} answered · save your place anytime
            </span>
          </span>
          <Link href="#assessment-resume-link" className="mk-take-flow-exit">
            Email resume link
          </Link>
        </div>
      </div>
      <ProgressBar progress={progress} />
    </header>
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
