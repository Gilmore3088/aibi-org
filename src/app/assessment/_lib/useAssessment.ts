'use client';

import { useCallback, useEffect, useState } from 'react';
import { questions } from '@content/assessments/v1/questions';
import { getTier, type Tier } from '@content/assessments/v1/scoring';

const STORAGE_KEY = 'aibi-assessment-v1';
const TOTAL_QUESTIONS = questions.length;

export type AssessmentPhase = 'questions' | 'score' | 'results';

interface PersistedState {
  readonly answers: readonly number[];
  readonly currentQuestion: number;
}

export interface AssessmentState {
  readonly currentQuestion: number;
  readonly answers: readonly number[];
  readonly phase: AssessmentPhase;
  readonly totalScore: number;
  readonly tier: Tier | null;
  readonly isComplete: boolean;
  readonly progress: number; // 0–1
}

export interface AssessmentActions {
  answer: (points: number) => void;
  back: () => void;
  restart: () => void;
  advanceToResults: () => void;
}

function readPersisted(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.answers)) return null;
    if (typeof parsed.currentQuestion !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useAssessment(): AssessmentState & AssessmentActions {
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [phase, setPhase] = useState<AssessmentPhase>('questions');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from sessionStorage once on mount
  useEffect(() => {
    const persisted = readPersisted();
    if (persisted) {
      setAnswers(persisted.answers.slice(0, TOTAL_QUESTIONS));
      setCurrentQuestion(
        Math.min(Math.max(persisted.currentQuestion, 0), TOTAL_QUESTIONS - 1)
      );
    }
    setHydrated(true);
  }, []);

  // Persist on every answer change
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    if (answers.length === 0 && currentQuestion === 0) return;
    const payload: PersistedState = { answers, currentQuestion };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [answers, currentQuestion, hydrated]);

  const totalScore = answers.reduce((sum, n) => sum + n, 0);
  const isComplete = answers.length === TOTAL_QUESTIONS;
  const tier = isComplete ? getTier(totalScore) : null;

  const answer = useCallback((points: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = points;
      return next;
    });
    // Advance after a short delay so the user sees the selection
    setCurrentQuestion((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= TOTAL_QUESTIONS) {
        setPhase('score');
        return prev; // hold position; phase transition handles the rest
      }
      return nextIndex;
    });
  }, [currentQuestion]);

  const back = useCallback(() => {
    if (phase !== 'questions') return;
    if (currentQuestion === 0) return;
    setCurrentQuestion((prev) => prev - 1);
  }, [currentQuestion, phase]);

  const restart = useCallback(() => {
    setAnswers([]);
    setCurrentQuestion(0);
    setPhase('questions');
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const advanceToResults = useCallback(() => {
    setPhase('results');
  }, []);

  const progress = TOTAL_QUESTIONS === 0 ? 0 : answers.length / TOTAL_QUESTIONS;

  return {
    currentQuestion,
    answers,
    phase,
    totalScore,
    tier,
    isComplete,
    progress,
    answer,
    back,
    restart,
    advanceToResults,
  };
}

export { TOTAL_QUESTIONS, STORAGE_KEY };
