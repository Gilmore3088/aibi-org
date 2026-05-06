'use client';

import { useCallback, useEffect, useState } from 'react';
import { questions as questionPool } from '@content/assessments/v2/questions';
import { selectQuestions } from '@content/assessments/v2/rotation';
import { getTierV2, getDimensionScores, type Tier, type DimensionScore } from '@content/assessments/v2/scoring';
import type { AssessmentQuestion, Dimension } from '@content/assessments/v2/types';

export const QUESTIONS_PER_SESSION = 12;
const STORAGE_KEY = 'aibi-assessment-v2';

export type AssessmentPhase = 'questions' | 'score' | 'results';

interface PersistedState {
  readonly selectedQuestionIds: readonly string[];
  readonly answers: readonly number[];
  readonly currentQuestion: number;
  readonly phase?: AssessmentPhase;
}

export interface AssessmentState {
  readonly currentQuestion: number;
  readonly answers: readonly number[];
  readonly phase: AssessmentPhase;
  readonly totalScore: number;
  readonly tier: Tier | null;
  readonly isComplete: boolean;
  readonly progress: number; // 0–1
  readonly selectedQuestions: readonly AssessmentQuestion[];
}

export interface AssessmentActions {
  answer: (points: number) => void;
  goBack: () => void;
  restart: () => void;
  advanceToResults: () => void;
  getDimensionBreakdown: () => Record<Dimension, DimensionScore>;
}

function readPersisted(pool: readonly AssessmentQuestion[]): {
  questions: AssessmentQuestion[];
  answers: number[];
  currentQuestion: number;
  phase: AssessmentPhase;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.selectedQuestionIds)) return null;
    if (!Array.isArray(parsed.answers)) return null;
    if (typeof parsed.currentQuestion !== 'number') return null;

    // Per-element validation: scores must be integers 1-4 (matches the
    // free assessment's MIN/MAX). Anything else means corrupted state.
    const cleanAnswers = parsed.answers.filter(
      (n): n is number =>
        typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 4,
    );
    if (cleanAnswers.length !== parsed.answers.length) return null;

    // Rebuild selected questions from IDs to preserve order
    const poolById = new Map(pool.map((q) => [q.id, q]));
    const restored = parsed.selectedQuestionIds
      .map((id) => poolById.get(id))
      .filter((q): q is AssessmentQuestion => q !== undefined);

    if (restored.length !== QUESTIONS_PER_SESSION) return null;

    const answers = cleanAnswers.slice(0, QUESTIONS_PER_SESSION);

    // If the persisted state represents a *completed* take, drop it.
    // Returning visitors should get a fresh assessment, not a stale score
    // they can no longer interact with. Their result is preserved
    // server-side via /api/capture-email if they captured email.
    if (answers.length === QUESTIONS_PER_SESSION) {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      return null;
    }

    return {
      questions: restored,
      answers,
      currentQuestion: Math.min(
        Math.max(parsed.currentQuestion, 0),
        QUESTIONS_PER_SESSION - 1,
      ),
      phase: 'questions',
    };
  } catch {
    return null;
  }
}

export function useAssessmentV2(): AssessmentState & AssessmentActions {
  const [selectedQuestions, setSelectedQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [phase, setPhase] = useState<AssessmentPhase>('questions');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from sessionStorage on mount; otherwise select fresh questions
  useEffect(() => {
    const persisted = readPersisted(questionPool);
    if (persisted) {
      setSelectedQuestions(persisted.questions);
      setAnswers(persisted.answers);
      setCurrentQuestion(persisted.currentQuestion);
      setPhase(persisted.phase);
    } else {
      setSelectedQuestions(selectQuestions(questionPool));
    }
    setHydrated(true);
  }, []);

  // Persist answers and question selection on every change
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    if (selectedQuestions.length === 0) return;
    if (answers.length === 0 && currentQuestion === 0) return;

    const payload: PersistedState = {
      selectedQuestionIds: selectedQuestions.map((q) => q.id),
      answers,
      currentQuestion,
      phase,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [answers, currentQuestion, selectedQuestions, phase, hydrated]);

  const totalScore = answers.reduce((sum, n) => sum + n, 0);
  const isComplete = answers.length === QUESTIONS_PER_SESSION;
  const tier = isComplete ? getTierV2(totalScore) : null;
  const progress = answers.length / QUESTIONS_PER_SESSION;

  // answer: record points, advance to next question or transition to score phase
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
    [currentQuestion]
  );

  // goBack: step to the previous question without losing the answer for that question.
  // Available only on the questions phase; ignored if already at the first question.
  const goBack = useCallback(() => {
    setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const restart = useCallback(() => {
    setAnswers([]);
    setCurrentQuestion(0);
    setPhase('questions');
    setSelectedQuestions(selectQuestions(questionPool));
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const advanceToResults = useCallback(() => {
    setPhase('results');
  }, []);

  const getDimensionBreakdown = useCallback((): Record<Dimension, DimensionScore> => {
    return getDimensionScores(answers, selectedQuestions);
  }, [answers, selectedQuestions]);

  return {
    currentQuestion,
    answers,
    phase,
    totalScore,
    tier,
    isComplete,
    progress,
    selectedQuestions,
    answer,
    goBack,
    restart,
    advanceToResults,
    getDimensionBreakdown,
  };
}
