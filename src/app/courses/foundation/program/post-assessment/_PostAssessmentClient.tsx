'use client';

// _PostAssessmentClient — Client shell for the post-course assessment.
// Phases: questions → score → results
// Reads pre-score from localStorage (aibi-user). No email gate — learner
// is already authenticated. Saves result to course_enrollments via API.
// Uses a separate sessionStorage key so it never collides with the
// public readiness assessment (STORAGE_KEY = 'foundations-post-assessment-v2').

import { useEffect, useState, useCallback, useRef } from 'react';
import { questions as questionPool } from '@content/assessments/v2/questions';
import { selectQuestions } from '@content/assessments/v2/rotation';
import { getTierV2, getDimensionScores } from '@content/assessments/v2/scoring';
import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import type { AssessmentQuestion, Dimension } from '@content/assessments/v2/types';
import { getUserData } from '@/lib/user-data';
import { ProgressBar } from '@/app/assessment/_components/ProgressBar';
import type { ReadinessResult } from '@/lib/user-data';
import { readPersisted, QUESTIONS_PER_SESSION, STORAGE_KEY } from './_lib/readPersisted';
import { PostAssessmentQuestions } from './_components/PostAssessmentQuestions';
import { PostAssessmentScore } from './_components/PostAssessmentScore';
import { PostAssessmentResults } from './_components/PostAssessmentResults';

type Phase = 'questions' | 'score' | 'results';

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

  const [preData, setPreData] = useState<ReadinessResult | null>(null);

  const [postTier, setPostTier] = useState<Tier | null>(null);
  const [dimensionDeltas, setDimensionDeltas] = useState<
    Partial<Record<Dimension, { pre: DimensionScore | null; post: DimensionScore }>>
  >({});

  const savedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const userData = getUserData();
    if (userData?.readiness) {
      setPreData(userData.readiness);
    }

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

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    if (selectedQuestions.length === 0) return;
    if (answers.length === 0 && currentQuestion === 0) return;

    const payload = {
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
        {phase === 'questions' && selectedQuestions.length > 0 && (
          <PostAssessmentQuestions
            selectedQuestions={selectedQuestions}
            currentQuestion={currentQuestion}
            answers={answers}
            preData={preData}
            onAnswer={answer}
          />
        )}

        {phase === 'score' && isComplete && (
          <PostAssessmentScore
            totalScore={totalScore}
            preData={preData}
            onViewResults={handleViewResults}
          />
        )}

        {phase === 'results' && postTier && (
          <PostAssessmentResults
            postTier={postTier}
            totalScore={totalScore}
            preData={preData}
            dimensionDeltas={dimensionDeltas}
            saving={saving}
            saveError={saveError}
            enrollmentId={enrollmentId}
          />
        )}
      </div>
    </main>
  );
}
