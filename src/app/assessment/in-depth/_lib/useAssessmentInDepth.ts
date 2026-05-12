'use client';

// Hook for the paid 48-question In-Depth Assessment.
//
// Mirrors useAssessmentV2 but uses the full question pool instead of a
// rotation, persists to its own sessionStorage key (so the free 12-question
// session can coexist), and uses the same scoring + tier logic since
// scoring is normalized.

import { useCallback, useEffect, useState } from 'react';
import { questions as questionPool } from '@content/assessments/v2/questions';
import { selectAllQuestions } from '@content/assessments/v2/rotation';
import {
  getTierInDepth,
  getDimensionScores,
  type Tier,
  type DimensionScore,
} from '@content/assessments/v2/scoring';
import type { AssessmentQuestion, Dimension } from '@content/assessments/v2/types';

const STORAGE_KEY = 'aibi-assessment-indepth';

export type AssessmentPhase = 'questions' | 'score' | 'results';

interface PersistedState {
  readonly selectedQuestionIds: readonly string[];
  readonly answers: readonly number[];
  readonly currentQuestion: number;
}

export interface InDepthState {
  readonly currentQuestion: number;
  readonly answers: readonly number[];
  readonly phase: AssessmentPhase;
  readonly totalScore: number;
  readonly maxScore: number;
  readonly tier: Tier | null;
  readonly isComplete: boolean;
  readonly progress: number;
  readonly selectedQuestions: readonly AssessmentQuestion[];
  readonly questionCount: number;
}

export interface InDepthActions {
  answer: (points: number) => void;
  goBack: () => void;
  restart: () => void;
  advanceToResults: () => void;
  getDimensionBreakdown: () => Record<Dimension, DimensionScore>;
}

function readPersisted(
  pool: readonly AssessmentQuestion[],
  expectedCount: number,
): {
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

    const poolById = new Map(pool.map((q) => [q.id, q]));
    const restored = parsed.selectedQuestionIds
      .map((id) => poolById.get(id))
      .filter((q): q is AssessmentQuestion => q !== undefined);

    if (restored.length !== expectedCount) return null;

    return {
      questions: restored,
      answers: parsed.answers.slice(0, expectedCount),
      currentQuestion: Math.min(
        Math.max(parsed.currentQuestion, 0),
        expectedCount - 1,
      ),
    };
  } catch {
    return null;
  }
}

export function useAssessmentInDepth(): InDepthState & InDepthActions {
  const [selectedQuestions, setSelectedQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [phase, setPhase] = useState<AssessmentPhase>('questions');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate or shuffle the full pool on mount.
  useEffect(() => {
    const fresh = selectAllQuestions(questionPool);
    const persisted = readPersisted(questionPool, fresh.length);
    if (persisted) {
      setSelectedQuestions(persisted.questions);
      setAnswers(persisted.answers);
      setCurrentQuestion(persisted.currentQuestion);
    } else {
      setSelectedQuestions(fresh);
    }
    setHydrated(true);
  }, []);

  const questionCount = selectedQuestions.length;

  // Persist to sessionStorage on every change.
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

  // Raw score is the sum of all 48 answers (1-4 points each) — range
  // 48–192. We keep the raw value as the source of truth and stop
  // rescaling into the free-flow 12–48 band. The In-Depth tier function
  // maps raw + max → tier id via percentile thresholds so the Briefing's
  // phase rubric (Curious / Coordinated / Programmatic / Native) and the
  // stored readiness_tier_id always reconcile.
  const totalScore = answers.reduce((sum, n) => sum + n, 0);
  const maxScore = questionCount * 4;
  const isComplete = questionCount > 0 && answers.length === questionCount;
  const tier = isComplete ? getTierInDepth(totalScore, maxScore) : null;
  const progress = questionCount > 0 ? answers.length / questionCount : 0;

  const answer = useCallback(
    (points: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQuestion] = points;
        return next;
      });
      setCurrentQuestion((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= questionCount) {
          setPhase('score');
          return prev;
        }
        return nextIndex;
      });
    },
    [currentQuestion, questionCount],
  );

  const goBack = useCallback(() => {
    setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const restart = useCallback(() => {
    setAnswers([]);
    setCurrentQuestion(0);
    setPhase('questions');
    setSelectedQuestions(selectAllQuestions(questionPool));
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const advanceToResults = useCallback(() => {
    setPhase('results');
  }, []);

  const getDimensionBreakdown = useCallback(
    (): Record<Dimension, DimensionScore> =>
      getDimensionScores(answers, selectedQuestions),
    [answers, selectedQuestions],
  );

  return {
    currentQuestion,
    answers,
    phase,
    totalScore,
    maxScore,
    tier,
    isComplete,
    progress,
    selectedQuestions,
    questionCount,
    answer,
    goBack,
    restart,
    advanceToResults,
    getDimensionBreakdown,
  };
}
