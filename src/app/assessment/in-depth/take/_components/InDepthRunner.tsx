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
import { ROLES, ROLE_META, parseRole, type Role } from '@content/assessments/v2/role';

const ROLE_STORAGE_KEY = 'aibi-indepth-role';

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string };

export function InDepthRunner(): React.ReactElement {
  const state = useAssessmentInDepth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' });
  const [role, setRole] = useState<Role | null>(null);
  const [rolePicked, setRolePicked] = useState(false);
  const scoreHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    // Restore prior role pick so a refresh mid-assessment does not re-show
    // the picker. Empty string is the marker for "user skipped".
    try {
      const saved = sessionStorage.getItem(ROLE_STORAGE_KEY);
      if (saved !== null) {
        setRole(parseRole(saved));
        setRolePicked(true);
      }
    } catch {
      // sessionStorage unavailable (private mode); proceed without persistence.
    }
  }, []);

  function commitRolePick(picked: Role | null): void {
    setRole(picked);
    setRolePicked(true);
    try {
      sessionStorage.setItem(ROLE_STORAGE_KEY, picked ?? '');
    } catch {
      // ignore — non-blocking
    }
  }

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
            role,
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
  }, [isComplete, tier, answers, selectedQuestions, role, router]);

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

  // Role-pick gate. Shown once, before Q1, when no answers have been
  // submitted yet. Skippable — role is optional and the Briefing renderer
  // falls back to un-roled framing when null.
  const showRoleGate =
    !rolePicked &&
    state.phase === 'questions' &&
    state.currentQuestion === 0 &&
    state.answers.length === 0;

  if (showRoleGate) {
    return (
      <main className="min-h-screen">
        <ProgressBar progress={0} />
        <div className="px-6 py-12 md:py-20 max-w-2xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 mb-4">
            Before we begin
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight">
            Which seat are you reading <em>from?</em>
          </h1>
          <p className="text-[color:var(--color-ink)]/75 mt-4 leading-relaxed">
            Your Briefing will be framed for your seat. Optional &mdash; skip and
            you will still get the full diagnosis.
          </p>

          <fieldset className="mt-8 space-y-2">
            <legend className="sr-only">Your role</legend>
            {ROLES.map((id) => {
              const meta = ROLE_META[id];
              const selected = role === id;
              return (
                <label
                  key={id}
                  className={`block border rounded-sm px-4 py-3 cursor-pointer transition-colors ${
                    selected
                      ? 'border-[color:var(--color-ink)] bg-[color:var(--color-parch)]'
                      : 'border-[color:var(--color-ink)]/15 hover:border-[color:var(--color-ink)]/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="aibi-role"
                    value={id}
                    checked={selected}
                    onChange={() => setRole(id)}
                    className="sr-only"
                  />
                  <span className="font-serif text-lg text-[color:var(--color-ink)]">
                    {meta.label}
                  </span>
                  <span className="block text-sm text-[color:var(--color-ink)]/70 mt-1">
                    {meta.description}
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className="mt-8 flex items-center gap-6">
            <button
              type="button"
              onClick={() => commitRolePick(role)}
              disabled={role === null}
              className="font-mono text-xs uppercase tracking-widest px-6 py-3 bg-[color:var(--color-ink)] text-[color:var(--color-linen)] rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Begin assessment
            </button>
            <button
              type="button"
              onClick={() => commitRolePick(null)}
              className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-ink)]"
            >
              Skip
            </button>
          </div>
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
