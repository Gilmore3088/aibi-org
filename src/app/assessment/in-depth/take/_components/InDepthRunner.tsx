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
        <div className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-3 font-semibold">
            Before we begin
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-[color:var(--color-ink)] leading-[1.02] tracking-tight">
            Which seat are you reading <span className="text-[color:var(--color-terra)]">from?</span>
          </h1>
          <p className="font-serif text-lg text-[color:var(--color-ink)]/80 mt-4 leading-relaxed max-w-[58ch]">
            Your Briefing will be framed for your seat. Optional &mdash; skip and you&apos;ll still get the full diagnosis.
          </p>

          <fieldset className="mt-10">
            <legend className="sr-only">Your role</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((id) => {
                const meta = ROLE_META[id];
                const selected = role === id;
                return (
                  <label
                    key={id}
                    className={`relative block border-2 rounded-[3px] p-5 cursor-pointer transition-all ${
                      selected
                        ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra)]/[0.04] shadow-[0_8px_22px_-18px_rgba(14,27,45,0.30)]'
                        : 'border-[color:var(--color-ink)]/12 hover:border-[color:var(--color-ink)]/35 hover:bg-[color:var(--color-parch)]/40'
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
                    <div className="flex items-start gap-4">
                      <div className={`flex-none w-10 h-10 grid place-items-center rounded-[2px] transition-colors ${
                        selected
                          ? 'bg-[color:var(--color-terra)] text-[color:var(--color-linen)]'
                          : 'bg-[color:var(--color-parch)] text-[color:var(--color-ink)]/80'
                      }`}>
                        <RoleIcon id={id} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-serif text-lg text-[color:var(--color-ink)] leading-tight block">
                          {meta.label}
                        </span>
                        <span className="block text-sm text-[color:var(--color-ink)]/70 mt-1.5 leading-snug">
                          {meta.description}
                        </span>
                      </div>
                      {selected && (
                        <span className="flex-none w-5 h-5 grid place-items-center rounded-full bg-[color:var(--color-terra)] text-[color:var(--color-linen)] text-[11px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-10 flex items-center gap-6 flex-wrap">
            <button
              type="button"
              onClick={() => commitRolePick(role)}
              disabled={role === null}
              className="font-mono text-[11px] uppercase tracking-[0.18em] font-semibold px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] rounded-[1px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Begin assessment →
            </button>
            <button
              type="button"
              onClick={() => commitRolePick(null)}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-ink)] border-b border-[color:var(--color-ink)]/30 hover:border-[color:var(--color-ink)] pb-0.5"
            >
              Skip for now
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

function RoleIcon({ id }: { readonly id: Role }) {
  // Minimal line icons in the Ledger style — same stroke weight, same gold accent.
  const stroke = 'currentColor';
  const sw = 1.6;
  switch (id) {
    case 'operator':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.93 4.93 L7.05 7.05 M16.95 16.95 L19.07 19.07 M4.93 19.07 L7.05 16.95 M16.95 7.05 L19.07 4.93" />
        </svg>
      );
    case 'compliance-risk':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 2 L20 6 L20 12 C 20 17 16 21 12 22 C 8 21 4 17 4 12 L4 6 Z" />
          <path d="M9 12 L11 14 L15 10" />
        </svg>
      );
    case 'training-hr':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M2 9 L12 4 L22 9 L12 14 Z" />
          <path d="M6 11 L6 16 C 6 17 8.5 18 12 18 C 15.5 18 18 17 18 16 L18 11" />
          <line x1="22" y1="9" x2="22" y2="14" />
        </svg>
      );
    case 'executive':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 20 L21 20 M5 20 L5 10 L9 7 L9 20 M15 20 L15 4 L19 7 L19 20" />
        </svg>
      );
    case 'lending':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 8 L9 16 M9 8 L13 8 C 14.5 8 15.5 9 15.5 10.5 C 15.5 12 14.5 13 13 13 L9 13" />
        </svg>
      );
    case 'marketing':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 11 L3 13 L7 13 L13 18 L13 6 L7 11 Z" />
          <path d="M16 8 C 18 9 18 15 16 16" />
          <path d="M19 5 C 23 8 23 16 19 19" />
        </svg>
      );
    case 'it':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="4" width="18" height="13" rx="1" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <path d="M8 9 L10 11 L8 13 M13 13 L16 13" />
        </svg>
      );
    case 'other':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="9" r="1.5" fill={stroke} />
          <path d="M10 13 L12 13 L12 17 M10 17 L14 17" />
        </svg>
      );
  }
}
