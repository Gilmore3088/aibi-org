'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { SiteHeader } from '@/components/mockup';
import { useAssessmentV2, QUESTIONS_PER_SESSION } from '../_lib/useAssessmentV2';
import { ProgressBar } from '../_components/ProgressBar';
import { EmailGate } from '../_components/EmailGate';

// ResultsViewV3 is a ~25 KB source component (drags in PdfDownloadButton +
// SignupModal + result-rendering helpers). It only renders after the user
// completes questions AND captures email. Defer the chunk until then so
// the initial page bundle stays light — the user has spent ~2 minutes
// answering questions by the time this is needed.
const ResultsViewV3 = dynamic(
  () => import('../_components/ResultsViewV3').then((mod) => mod.ResultsViewV3),
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
        cta={{ label: 'Restart', href: '#restart' }}
      />
      <main className="mk-take">
        <h1 className="sr-only">AI Readiness Assessment</h1>
        <ProgressBar progress={state.phase === 'questions' ? state.progress : 1} />

        {state.phase === 'questions' && state.selectedQuestions.length > 0 && (() => {
          const q = state.selectedQuestions[state.currentQuestion];
          const selected = state.answers[state.currentQuestion];
          // Live running score on the canonical raw scale (12–48) so the
          // number we show during taking matches what the results page
          // shows. The previous percentage-of-answered projection was
          // mathematically confusing — a single 2/4 answer on Q1 read as
          // "50/100" which looks like a wild swing instead of "2 so far,
          // 11 more to go".
          const answered = state.answers.filter((a) => a > 0).length;
          const runningScore = state.answers.reduce((sum, a) => sum + (a > 0 ? a : 0), 0);
          const completePct = Math.round((state.currentQuestion / QUESTIONS_PER_SESSION) * 100);
          return (
            <div className="mk-take-inner">
              {/* Persistent dark navy hero — live score panel.
                  Copy is intentionally minimal here. The user clicked
                  a "Take the assessment" CTA to land on this page, so
                  selling the assessment again is redundant — the next
                  question should be the focus. */}
              <section className="mk-take-q-hero">
                <div className="mk-take-q-hero-copy">
                  <div className="mk-take-q-hero-chip">
                    <span className="mk-dot" /> Question {state.currentQuestion + 1} of {QUESTIONS_PER_SESSION}
                  </div>
                  <h2>Answer the question below.</h2>
                  <p>
                    Pick the option that&rsquo;s closest to true for your
                    institution today. There&rsquo;s no right answer — only
                    your honest read.
                  </p>
                </div>
                <div className="mk-take-q-card">
                  <div className="mk-take-q-card-score">
                    <p className="mk-k">Running score</p>
                    <div className="mk-take-q-card-num">
                      <span className="mk-v">{runningScore}</span>
                      <span className="mk-u">/ 48</span>
                    </div>
                    <div className="mk-take-q-card-tier">
                      <p className="mk-k">Tier</p>
                      <p className="mk-take-q-card-tier-v">Revealed at the end</p>
                    </div>
                  </div>
                  <div className="mk-take-q-card-progress">
                    <p className="mk-k">Assessment Progress</p>
                    <h3>
                      Question {state.currentQuestion + 1} of {QUESTIONS_PER_SESSION}
                    </h3>
                    <div className="mk-take-q-card-track">
                      <div
                        className="mk-take-q-card-fill"
                        style={{ width: `${state.progress * 100}%` }}
                      />
                    </div>
                    <div className="mk-take-q-card-meta">
                      <div className="mk-take-snap-meta-card">
                        <p className="mk-k">Answered</p>
                        <p className="mk-take-snap-meta-v">{answered}</p>
                      </div>
                      <div className="mk-take-snap-meta-card">
                        <p className="mk-k">Remaining</p>
                        <p className="mk-take-snap-meta-v">{QUESTIONS_PER_SESSION - answered}</p>
                      </div>
                      <div className="mk-take-snap-meta-card">
                        <p className="mk-k">Complete</p>
                        <p className="mk-take-snap-meta-v">{completePct}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Side-by-side question panel */}
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
              </section>
            </div>
          );
        })()}

        <div className="mk-take-inner">

          {state.phase === 'score' && state.tier && (() => {
            const breakdown = state.getDimensionBreakdown();
            const breakdownEntries = Object.entries(breakdown);
            const topGapEntry = breakdownEntries.length > 0
              ? breakdownEntries.reduce((a, b) =>
                  a[1].score / a[1].maxScore < b[1].score / b[1].maxScore ? a : b
                )
              : null;
            const topGapLabel = topGapEntry?.[1].label ?? 'Documentation';
            return (
              <div className="mk-take-score">
                {/* SCORE REVEAL — dark navy, no email yet */}
                <section
                  ref={scoreHeadingRef as React.RefObject<HTMLElement>}
                  tabIndex={-1}
                  className="mk-take-snap"
                  aria-label="Readiness snapshot"
                >
                  <div className="mk-take-snap-copy">
                    <p className="mk-take-snap-k">Diagnostic complete</p>
                    <h2>Your top gap: {topGapLabel}.</h2>
                    <p className="mk-take-snap-lede">
                      Enter your work email below for the full breakdown and a starter artifact you can use this week.
                    </p>
                  </div>
                  <div className="mk-take-snap-card">
                    <div className="mk-take-snap-score">
                      <p className="mk-k">Readiness score</p>
                      <div className="mk-take-snap-num">
                        <span className="mk-v">{state.totalScore}</span>
                        <span className="mk-u">/ 48</span>
                      </div>
                      <div className="mk-take-snap-tier">
                        <p className="mk-k">Tier</p>
                        <p className="mk-take-snap-tier-v">{state.tier.label}</p>
                      </div>
                    </div>
                    <div className="mk-take-snap-meta">
                      <ResultMeta
                        label="Dimensions scored"
                        value={String(Object.keys(state.getDimensionBreakdown()).length)}
                      />
                      <ResultMeta label="Top gap" value={topGapLabel} />
                      <ResultMeta
                        label="Questions"
                        value={`${QUESTIONS_PER_SESSION} of ${QUESTIONS_PER_SESSION}`}
                      />
                    </div>
                  </div>
                </section>

                {/* INSIGHT CARD — 3-column on cream */}
                <section className="mk-take-insight" aria-label="Your first move">
                  <div className="mk-take-insight-col">
                    <p className="mk-k">Your first move</p>
                    <h3>Write the review path.</h3>
                    <p>
                      Your top gap is <strong>{topGapLabel}</strong>. Start by defining who
                      reviews AI-supported work, what they check, and where the reviewed output
                      is saved.
                    </p>
                  </div>
                  <div className="mk-take-insight-col">
                    <p className="mk-k">Starter outline</p>
                    <h3>AI Workflow SOP</h3>
                    <ul className="mk-take-insight-list">
                      <li>Tool used</li>
                      <li>Allowed input</li>
                      <li>Human reviewer</li>
                      <li>Retention rule</li>
                    </ul>
                  </div>
                  <div className="mk-take-insight-col">
                    <p className="mk-k">Useful next reads</p>
                    <a href="/playbooks/compliance" className="mk-take-insight-link">
                      <strong>Compliance Playbook</strong>
                      <span>Use-case intake, review evidence, approval workflow.</span>
                    </a>
                    <a
                      href="/research/templates/ai-workflow-sop"
                      className="mk-take-insight-link"
                    >
                      <strong>AI Workflow SOP Template</strong>
                      <span>The fields examiners actually look at.</span>
                    </a>
                  </div>
                </section>

                {/* EMAIL CAPTURE — the real EmailGate */}
                <section className="mk-take-send" aria-label="Send the full report">
                  <header>
                    <p className="mk-k">Ready for the full breakdown?</p>
                    <h2>Send the report and keep the starter artifact.</h2>
                    <p>
                      Get the 8-dimension breakdown, copy-ready Markdown artifact, and
                      recommended next step sent to your work email.
                    </p>
                  </header>
                  <div className="mk-take-send-form">
                    <EmailGate
                      score={state.totalScore}
                      tierId={state.tier.id}
                      tierLabel={state.tier.label}
                      answers={state.answers}
                      version="v3"
                      maxScore={48}
                      dimensionBreakdown={breakdown}
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
                  </div>
                </section>

                <div className="mk-take-restart">
                  <button type="button" onClick={state.restart} className="mk-take-restart-btn">
                    Start over
                  </button>
                </div>
              </div>
            );
          })()}

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
              <ResultsViewV3
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

function ResultMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="mk-take-snap-meta-card">
      <p className="mk-k">{label}</p>
      <p className="mk-take-snap-meta-v">{value}</p>
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
