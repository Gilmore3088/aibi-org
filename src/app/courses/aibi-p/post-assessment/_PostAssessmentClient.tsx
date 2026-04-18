'use client';

// _PostAssessmentClient — Client shell for the post-course assessment.
// Phases: questions → score → results
// Reads pre-score from localStorage (aibi-user). No email gate — learner
// is already authenticated. Saves result to course_enrollments via API.
// Uses a separate sessionStorage key so it never collides with the
// public readiness assessment (STORAGE_KEY = 'aibi-post-assessment-v2').

import { useEffect, useState, useCallback, useRef } from 'react';
import { questions as questionPool } from '@content/assessments/v2/questions';
import { selectQuestions } from '@content/assessments/v2/rotation';
import { getTierV2, getDimensionScores } from '@content/assessments/v2/scoring';
import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import type { AssessmentQuestion, Dimension } from '@content/assessments/v2/types';
import { getUserData } from '@/lib/user-data';
import { QuestionCard } from '@/app/assessment/_components/QuestionCard';
import { ProgressBar } from '@/app/assessment/_components/ProgressBar';
import { ScoreRing } from '@/app/assessment/_components/ScoreRing';
import { GrowthComparison } from '../_components/GrowthComparison';
import { TransformationCard } from '../_components/TransformationCard';
import type { ReadinessResult } from '@/lib/user-data';

const QUESTIONS_PER_SESSION = 12;
const STORAGE_KEY = 'aibi-post-assessment-v2';

// Annual hours saved per module (mirrors TimeSavingsCard data).
const ANNUAL_HOURS_BY_MODULE: Record<number, number> = {
  1: 6, 2: 0, 3: 43, 4: 52, 5: 0, 6: 0, 7: 87, 8: 0, 9: 0,
};
const TOTAL_ANNUAL_HOURS = Object.values(ANNUAL_HOURS_BY_MODULE).reduce((a, b) => a + b, 0);
const SKILLS_BUILT = 3; // Modules 4 (Acceptable Use), 7 (AI Skill), 9 (Capstone)

type Phase = 'questions' | 'score' | 'results';

interface PersistedState {
  readonly selectedQuestionIds: readonly string[];
  readonly answers: readonly number[];
  readonly currentQuestion: number;
}

function readPersisted(): {
  questions: AssessmentQuestion[];
  answers: number[];
  currentQuestion: number;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.selectedQuestionIds)) return null;
    if (!Array.isArray(parsed.answers)) return null;
    if (typeof parsed.currentQuestion !== 'number') return null;

    const poolById = new Map(questionPool.map((q) => [q.id, q]));
    const restored = parsed.selectedQuestionIds
      .map((id) => poolById.get(id))
      .filter((q): q is AssessmentQuestion => q !== undefined);

    if (restored.length !== QUESTIONS_PER_SESSION) return null;

    return {
      questions: restored,
      answers: parsed.answers.slice(0, QUESTIONS_PER_SESSION),
      currentQuestion: Math.min(Math.max(parsed.currentQuestion, 0), QUESTIONS_PER_SESSION - 1),
    };
  } catch {
    return null;
  }
}

interface PostAssessmentClientProps {
  readonly enrollmentId: string;
}

export function PostAssessmentClient({ enrollmentId }: PostAssessmentClientProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('questions');
  const [selectedQuestions, setSelectedQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pre-score from localStorage
  const [preData, setPreData] = useState<ReadinessResult | null>(null);

  // Post-score results
  const [postTier, setPostTier] = useState<Tier | null>(null);
  const [dimensionDeltas, setDimensionDeltas] = useState<
    Partial<Record<Dimension, { pre: DimensionScore | null; post: DimensionScore }>>
  >({});

  const savedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    // Load pre-score from localStorage
    const userData = getUserData();
    if (userData?.readiness) {
      setPreData(userData.readiness);
    }

    // Hydrate from sessionStorage or select fresh questions
    const persisted = readPersisted();
    if (persisted) {
      setSelectedQuestions(persisted.questions);
      setAnswers(persisted.answers);
      setCurrentQuestion(persisted.currentQuestion);
    } else {
      setSelectedQuestions(selectQuestions(questionPool));
    }
    setHydrated(true);
  }, []);

  // Persist in-progress state
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    if (selectedQuestions.length === 0) return;
    if (answers.length === 0 && currentQuestion === 0) return;

    const payload: PersistedState = {
      selectedQuestionIds: selectedQuestions.map((q) => q.id),
      answers,
      currentQuestion,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [answers, currentQuestion, selectedQuestions, hydrated]);

  const totalScore = answers.reduce((sum, n) => sum + n, 0);
  const isComplete = answers.length === QUESTIONS_PER_SESSION;
  const progress = answers.length / QUESTIONS_PER_SESSION;

  const answer = useCallback(
    (points: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQuestion] = points;
        return next;
      });
      setCurrentQuestion((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= QUESTIONS_PER_SESSION) {
          setPhase('score');
          return prev;
        }
        return nextIndex;
      });
    },
    [currentQuestion],
  );

  const handleViewResults = useCallback(async () => {
    if (!isComplete || savedRef.current) return;

    const tier = getTierV2(totalScore);
    setPostTier(tier);

    const postDimScores = getDimensionScores(answers, selectedQuestions);

    // Build dimension deltas
    const preBreakdown = preData?.dimensionBreakdown;
    const deltas: typeof dimensionDeltas = {};
    for (const [dim, postScore] of Object.entries(postDimScores) as [Dimension, DimensionScore][]) {
      const preDimScore = preBreakdown?.[dim] ?? null;
      deltas[dim] = {
        pre: preDimScore
          ? { score: preDimScore.score, maxScore: preDimScore.maxScore, label: preDimScore.label }
          : null,
        post: postScore,
      };
    }
    setDimensionDeltas(deltas);

    setPhase('results');

    // Save to API
    if (!savedRef.current) {
      savedRef.current = true;
      setSaving(true);
      setSaveError(null);
      try {
        const res = await fetch('/api/courses/save-post-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId,
            score: totalScore,
            answers,
            questionIds: selectedQuestions.map((q) => q.id),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg = (data as { error?: string }).error ?? 'Save failed.';
          setSaveError(msg);
        }
      } catch {
        setSaveError('Network error. Your result was not saved.');
      } finally {
        setSaving(false);
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [isComplete, totalScore, answers, selectedQuestions, preData, enrollmentId]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen">
      <ProgressBar progress={phase === 'questions' ? progress : 1} />

      <div className="px-6 py-12 md:py-20">
        {/* ── Questions phase ─────────────────────────────────────────── */}
        {phase === 'questions' && selectedQuestions.length > 0 && (
          <div>
            {/* Context header */}
            <div className="max-w-2xl mx-auto mb-10">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
                AiBI-P · Measure Your Growth
              </p>
              <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
                You have completed all nine modules. Answer these questions honestly —
                the same way you did before the course. The comparison shows your transformation.
              </p>
            </div>

            <QuestionCard
              question={selectedQuestions[currentQuestion]}
              questionNumber={currentQuestion + 1}
              totalQuestions={QUESTIONS_PER_SESSION}
              selectedPoints={answers[currentQuestion]}
              onAnswer={answer}
            />
          </div>
        )}

        {/* ── Score phase ─────────────────────────────────────────────── */}
        {phase === 'score' && isComplete && (
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="flex flex-col items-center text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 mb-6">
                Post-Course Score
              </p>
              <ScoreRing
                score={totalScore}
                minScore={12}
                maxScore={48}
                colorVar={getTierV2(totalScore).colorVar}
                label={getTierV2(totalScore).label}
              />
              <h2 className="font-serif text-3xl md:text-4xl text-center mt-8 max-w-xl text-[color:var(--color-ink)]">
                {getTierV2(totalScore).headline}
              </h2>
              {preData?.score && (
                <p className="font-sans text-base text-[color:var(--color-ink)]/70 mt-4">
                  Before the course: score{' '}
                  <span className="font-mono tabular-nums">{preData.score}</span>
                  {' '}({preData.tierLabel})
                </p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleViewResults}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
              >
                View Full Comparison
              </button>
            </div>
          </div>
        )}

        {/* ── Results phase ────────────────────────────────────────────── */}
        {phase === 'results' && postTier && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
                AiBI-P · Measure Your Growth
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[color:var(--color-ink)] leading-tight">
                Your Transformation
              </h1>
            </div>

            {saving && (
              <p className="font-mono text-xs text-[color:var(--color-slate)]" aria-live="polite">
                Saving your result...
              </p>
            )}
            {saveError && (
              <p
                className="font-mono text-xs text-[color:var(--color-error)]"
                role="alert"
                aria-live="assertive"
              >
                {saveError}
              </p>
            )}

            <TransformationCard
              preScore={preData?.score ?? null}
              postScore={totalScore}
              preTierLabel={preData?.tierLabel ?? null}
              postTierLabel={postTier.label}
              postTierColorVar={postTier.colorVar}
              skillsBuilt={SKILLS_BUILT}
              annualHoursSaved={TOTAL_ANNUAL_HOURS}
              enrollmentId={enrollmentId}
            />

            <GrowthComparison
              preScore={preData?.score ?? null}
              postScore={totalScore}
              preTierId={preData?.tierId ?? null}
              preTierLabel={preData?.tierLabel ?? null}
              postTierId={postTier.id}
              postTierLabel={postTier.label}
              postTierColorVar={postTier.colorVar}
              dimensionDeltas={dimensionDeltas}
            />
          </div>
        )}
      </div>
    </main>
  );
}
