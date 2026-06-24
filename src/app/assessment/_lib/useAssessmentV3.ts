'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  trackAssessmentStart,
  trackAssessmentComplete,
} from '@/lib/analytics/events';
import { questions as questionPool } from '@content/assessments/v3/questions';
import { selectQuestions } from '@content/assessments/v3/rotation';
import { getTierV3, getDimensionScores, type Tier, type DimensionScore } from '@content/assessments/v3/scoring';
import type { AssessmentQuestion, Dimension } from '@content/assessments/v3/types';

export const QUESTIONS_PER_SESSION = 12;
const STORAGE_KEY = 'aibi-assessment-v3';

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
  restoreDraft: (draft: PersistedState) => boolean;
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
    const phase =
      parsed.phase === 'score' || parsed.phase === 'results' || parsed.phase === 'questions'
        ? parsed.phase
        : parsed.answers.length >= QUESTIONS_PER_SESSION
          ? 'score'
          : 'questions';

    // Rebuild selected questions from IDs to preserve order
    const poolById = new Map(pool.map((q) => [q.id, q]));
    const restored = parsed.selectedQuestionIds
      .map((id) => poolById.get(id))
      .filter((q): q is AssessmentQuestion => q !== undefined);

    if (restored.length !== QUESTIONS_PER_SESSION) return null;

    return {
      questions: restored,
      answers: parsed.answers.slice(0, QUESTIONS_PER_SESSION),
      currentQuestion: Math.min(
        Math.max(parsed.currentQuestion, 0),
        QUESTIONS_PER_SESSION - 1
      ),
      phase,
    };
  } catch {
    return null;
  }
}

export function useAssessmentV3(): AssessmentState & AssessmentActions {
  const [selectedQuestions, setSelectedQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [phase, setPhase] = useState<AssessmentPhase>('questions');
  const [hydrated, setHydrated] = useState(false);
  const startFiredRef = useRef(false);
  const completeFiredRef = useRef(false);

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

    // assessment_start fires once per mount, even on a resumed session.
    if (!startFiredRef.current) {
      startFiredRef.current = true;
      trackAssessmentStart();
    }
  }, []);

  // Persist answers and question selection on every change
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    if (selectedQuestions.length === 0) return;

    const payload: PersistedState = {
      selectedQuestionIds: selectedQuestions.map((q) => q.id),
      answers,
      currentQuestion,
      phase,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [answers, currentQuestion, phase, selectedQuestions, hydrated]);

  const totalScore = answers.reduce((sum, n) => sum + n, 0);
  const isComplete = answers.length === QUESTIONS_PER_SESSION;
  const tier = isComplete ? getTierV3(totalScore) : null;
  const progress = answers.length / QUESTIONS_PER_SESSION;

  // Fire assessment_complete once when the score phase first becomes visible.
  // The completeFiredRef gate prevents double-firing on re-render or restart
  // -> finish in the same session.
  useEffect(() => {
    if (phase === 'score' && tier && !completeFiredRef.current) {
      completeFiredRef.current = true;
      trackAssessmentComplete({ tier: tier.id, score: totalScore });
    }
    if (phase === 'questions') {
      // Allow another complete event on restart.
      completeFiredRef.current = false;
    }
  }, [phase, tier, totalScore]);

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
  // From the score phase, return to Q12 so the user can review/edit instead
  // of being forced into Start over.
  const goBack = useCallback(() => {
    if (phase === 'score') {
      setCurrentQuestion(QUESTIONS_PER_SESSION - 1);
      setPhase('questions');
      return;
    }
    setCurrentQuestion((prev) => (phase === 'questions' && prev > 0 ? prev - 1 : prev));
  }, [phase]);

  const restart = useCallback(() => {
    setAnswers([]);
    setCurrentQuestion(0);
    setPhase('questions');
    setSelectedQuestions((prev) =>
      prev.length === QUESTIONS_PER_SESSION ? prev : selectQuestions(questionPool),
    );
  }, []);

  const restoreDraft = useCallback((draft: PersistedState): boolean => {
    const restored = draft.selectedQuestionIds
      .map((id) => questionPool.find((q) => q.id === id))
      .filter((q): q is AssessmentQuestion => q !== undefined);
    if (restored.length !== QUESTIONS_PER_SESSION) return false;

    setSelectedQuestions(restored);
    setAnswers(draft.answers.slice(0, QUESTIONS_PER_SESSION));
    setCurrentQuestion(Math.min(Math.max(draft.currentQuestion, 0), QUESTIONS_PER_SESSION - 1));
    setPhase(
      draft.phase === 'score' || draft.phase === 'results' || draft.phase === 'questions'
        ? draft.phase
        : 'questions',
    );
    return true;
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
    restoreDraft,
    advanceToResults,
    getDimensionBreakdown,
  };
}
