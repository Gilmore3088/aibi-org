'use client';

// Hook for the paid In-Depth AI Readiness Diagnostic (v4).
//
// Drives the 48-question, 8-dimension flow. Persists to its own
// sessionStorage key (separate from the free v3 and the legacy v2 keys
// so all three can coexist during the migration).
//
// Mirrors the shape of useAssessmentInDepth (v2 hook) so the runner
// component can swap with minimal churn.

import { useCallback, useEffect, useState } from 'react';
import { questions as questionPool } from '@content/assessments/v4/questions';
import { selectAllQuestions } from '@content/assessments/v4/rotation';
import {
  getDimensionScores,
  getMaturityBand,
  normalize,
  rankDimensions,
  type DimensionScore,
} from '@content/assessments/v4/scoring';
import type {
  AssessmentQuestion,
  Dimension,
  MaturityBand,
} from '@content/assessments/v4/types';

const STORAGE_KEY = 'aibi-assessment-v4';

export type AssessmentPhase = 'questions' | 'score' | 'results';

interface PersistedState {
  readonly selectedQuestionIds: readonly string[];
  readonly answers: readonly number[];
  readonly currentQuestion: number;
}

export interface InDepthV4State {
  readonly currentQuestion: number;
  readonly answers: readonly number[];
  readonly phase: AssessmentPhase;
  readonly rawScore: number;
  readonly maxScore: number;
  readonly normalizedScore: number;
  readonly band: MaturityBand | null;
  readonly isComplete: boolean;
  readonly progress: number;
  readonly selectedQuestions: readonly AssessmentQuestion[];
  readonly questionCount: number;
}

export interface InDepthV4Actions {
  answer: (points: number) => void;
  goBack: () => void;
  restart: () => void;
  advanceToResults: () => void;
  getDimensionBreakdown: () => Record<Dimension, DimensionScore>;
  getRanked: () => ReturnType<typeof rankDimensions>;
}

function readPersisted(
  pool: readonly AssessmentQuestion[],
  expectedCount: number,
  storageKey: string,
): {
  questions: AssessmentQuestion[];
  answers: number[];
  currentQuestion: number;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey);
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

export function useAssessmentV4(storageKey = STORAGE_KEY): InDepthV4State & InDepthV4Actions {
  const [selectedQuestions, setSelectedQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [phase, setPhase] = useState<AssessmentPhase>('questions');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fresh = selectAllQuestions(questionPool);
    const persisted = readPersisted(questionPool, fresh.length, storageKey);
    if (persisted) {
      setSelectedQuestions(persisted.questions);
      setAnswers(persisted.answers);
      setCurrentQuestion(persisted.currentQuestion);
    } else {
      setSelectedQuestions(fresh);
    }
    setHydrated(true);
  }, [storageKey]);

  const questionCount = selectedQuestions.length;

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
    window.sessionStorage.setItem(storageKey, JSON.stringify(payload));
  }, [answers, currentQuestion, selectedQuestions, hydrated, storageKey]);

  const rawScore = answers.reduce((sum, n) => sum + n, 0);
  const maxScore = questionCount * 4;
  const isComplete = questionCount > 0 && answers.length === questionCount;
  const normalizedScore = isComplete ? normalize(rawScore) : 0;
  const band = isComplete ? getMaturityBand(normalizedScore) : null;
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
      window.sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const advanceToResults = useCallback(() => {
    setPhase('results');
  }, []);

  const getDimensionBreakdown = useCallback(
    (): Record<Dimension, DimensionScore> =>
      getDimensionScores(answers, selectedQuestions),
    [answers, selectedQuestions],
  );

  const getRanked = useCallback(
    () => rankDimensions(getDimensionScores(answers, selectedQuestions)),
    [answers, selectedQuestions],
  );

  return {
    currentQuestion,
    answers,
    phase,
    rawScore,
    maxScore,
    normalizedScore,
    band,
    isComplete,
    progress,
    selectedQuestions,
    questionCount,
    answer,
    goBack,
    restart,
    advanceToResults,
    getDimensionBreakdown,
    getRanked,
  };
}
