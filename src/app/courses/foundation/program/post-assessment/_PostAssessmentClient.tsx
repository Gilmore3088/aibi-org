'use client';

// _PostAssessmentClient — Client shell for the post-course assessment.
// Phases: questions → score → results
// Reads pre-score from localStorage (aibi-user). No email gate — learner
// is already authenticated. Saves result to course_enrollments via API.
// Uses a separate sessionStorage key so it never collides with the
// public readiness assessment (STORAGE_KEY = 'foundations-post-assessment-v2').

import { useEffect, useState, useCallback, useRef } from 'react';
import { migrateStorageKey } from '@/lib/storage/migrate';
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
import { TOTAL_ANNUAL_HOURS } from '../_lib/activitySavings';
import type { ReadinessResult } from '@/lib/user-data';
import { GrowthPreview } from './_local/GrowthPreview';
import { ShareDelta } from './_local/ShareDelta';

const QUESTIONS_PER_SESSION = 12;
const STORAGE_KEY = 'foundations-post-assessment-v2';
const LEGACY_STORAGE_KEY = 'aibi-post-assessment-v2';

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
    migrateStorageKey(window.sessionStorage, LEGACY_STORAGE_KEY, STORAGE_KEY);
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
            {/* Context header + comparison preview */}
            <div className="max-w-2xl mx-auto mb-10">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: 'var(--gold-a10)',
                  color: 'var(--gold-deep)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                AiBI-Foundation · Measure your growth
              </span>
              <h1
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(28px, 3.4vw, 36px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.022em',
                  color: 'var(--ink)',
                  margin: '0 0 14px',
                }}
              >
                You finished the course. Answer the same 12 questions again.
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--slate-600)',
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                }}
              >
                Answer honestly — the same way you did before the course. The point
                is the comparison, not the score.
              </p>

              <GrowthPreview
                preScore={preData?.score ?? null}
                preTierLabel={preData?.tierLabel ?? null}
              />
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
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: 'var(--gold-a10)',
                  color: 'var(--gold-deep)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: 24,
                }}
              >
                Post-course score
              </span>
              <ScoreRing
                score={totalScore}
                minScore={12}
                maxScore={48}
                colorVar={getTierV2(totalScore).colorVar}
                label={getTierV2(totalScore).label}
              />
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(28px, 3.6vw, 40px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink)',
                  textAlign: 'center',
                  marginTop: 32,
                  maxWidth: '36rem',
                }}
              >
                {getTierV2(totalScore).headline}
              </h2>
              {preData?.score && (
                <p
                  style={{
                    fontSize: 15,
                    color: 'var(--slate-600)',
                    marginTop: 16,
                  }}
                >
                  Before the course: score{' '}
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--ink)' }}>
                    {preData.score}
                  </span>
                  {' '}({preData.tierLabel})
                </p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleViewResults}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  background: 'var(--ink)',
                  color: 'var(--cream-2)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color var(--t-fast) var(--ease)',
                }}
              >
                VIEW FULL COMPARISON
              </button>
            </div>
          </div>
        )}

        {/* ── Results phase ────────────────────────────────────────────── */}
        {phase === 'results' && postTier && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div
              style={{
                background: 'var(--ink)',
                color: '#fff',
                borderRadius: 28,
                padding: 'clamp(28px, 4vw, 40px)',
                boxShadow: 'var(--shadow-hero)',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: 'var(--gold-a20)',
                  color: 'var(--gold-soft)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                AiBI-Foundation · Measure your growth
              </span>
              <h1
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(36px, 4.6vw, 56px)',
                  lineHeight: 1.04,
                  letterSpacing: '-0.028em',
                  color: '#fff',
                  margin: 0,
                }}
              >
                Your transformation
              </h1>
            </div>

            {saving && (
              <p
                style={{ fontSize: 13, color: 'var(--slate-500)', margin: 0 }}
                aria-live="polite"
              >
                Saving your result...
              </p>
            )}
            {saveError && (
              <p
                style={{ fontSize: 13, color: 'var(--ink)', margin: 0, fontWeight: 600 }}
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

            <ShareDelta
              preScore={preData?.score ?? null}
              postScore={totalScore}
              preTierLabel={preData?.tierLabel ?? null}
              postTierLabel={postTier.label}
            />
          </div>
        )}
      </div>
    </main>
  );
}
