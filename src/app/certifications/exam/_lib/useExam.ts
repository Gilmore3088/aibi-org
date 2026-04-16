'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { examQuestions, TOPIC_LABELS, type ExamQuestion, type Topic } from '@content/exams/aibi-p/questions';
import { getProficiencyLevel, type ProficiencyLevel } from '@content/exams/aibi-p/scoring';

const QUESTIONS_PER_EXAM = 12;
const TIME_LIMIT_SECONDS = 15 * 60; // 15 minutes

export type ExamPhase = 'intro' | 'questions' | 'results';

function shuffleAndDraw(pool: readonly ExamQuestion[], count: number): ExamQuestion[] {
  const byTopic = new Map<Topic, ExamQuestion[]>();
  for (const q of pool) {
    const existing = byTopic.get(q.topic) ?? [];
    existing.push(q);
    byTopic.set(q.topic, existing);
  }

  // Shuffle within each topic
  for (const questions of Array.from(byTopic.values())) {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
  }

  // Draw evenly from topics, then fill remaining randomly
  const topicKeys = Array.from(byTopic.keys());
  const perTopic = Math.floor(count / topicKeys.length);
  const drawn: ExamQuestion[] = [];

  for (const topic of topicKeys) {
    const topicQuestions = byTopic.get(topic)!;
    drawn.push(...topicQuestions.slice(0, perTopic));
  }

  // Fill remaining from unused questions
  const drawnIds = new Set(drawn.map((q) => q.id));
  const remaining = pool.filter((q) => !drawnIds.has(q.id));
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  drawn.push(...remaining.slice(0, count - drawn.length));

  // Final shuffle of drawn questions
  for (let i = drawn.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [drawn[i], drawn[j]] = [drawn[j], drawn[i]];
  }

  return drawn;
}

export interface TopicScore {
  readonly topic: Topic;
  readonly label: string;
  readonly correct: number;
  readonly total: number;
  readonly pct: number;
}

export interface ExamState {
  readonly phase: ExamPhase;
  readonly questions: readonly ExamQuestion[];
  readonly currentIndex: number;
  readonly answers: ReadonlyMap<string, string>;
  readonly secondsRemaining: number;
  readonly totalCorrect: number;
  readonly pctCorrect: number;
  readonly proficiency: ProficiencyLevel | null;
  readonly topicScores: readonly TopicScore[];
}

export interface ExamActions {
  start: () => void;
  answer: (questionId: string, key: string) => void;
  next: () => void;
  prev: () => void;
  finish: () => void;
  retake: () => void;
}

export function useExam(): ExamState & ExamActions {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [secondsRemaining, setSecondsRemaining] = useState(TIME_LIMIT_SECONDS);

  // Timer
  useEffect(() => {
    if (phase !== 'questions') return;
    if (secondsRemaining <= 0) {
      setPhase('results');
      return;
    }
    const id = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, secondsRemaining]);

  const totalCorrect = useMemo(() => {
    let count = 0;
    for (const q of questions) {
      if (answers.get(q.id) === q.correctKey) count++;
    }
    return count;
  }, [questions, answers]);

  const pctCorrect = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;
  const proficiency = phase === 'results' ? getProficiencyLevel(pctCorrect) : null;

  const topicScores: TopicScore[] = useMemo(() => {
    if (phase !== 'results') return [];
    const topicMap = new Map<Topic, { correct: number; total: number }>();
    for (const q of questions) {
      const entry = topicMap.get(q.topic) ?? { correct: 0, total: 0 };
      entry.total++;
      if (answers.get(q.id) === q.correctKey) entry.correct++;
      topicMap.set(q.topic, entry);
    }
    return Array.from(topicMap.entries()).map(([topic, { correct, total }]) => ({
      topic,
      label: TOPIC_LABELS[topic],
      correct,
      total,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    }));
  }, [phase, questions, answers]);

  const start = useCallback(() => {
    setQuestions(shuffleAndDraw(examQuestions, QUESTIONS_PER_EXAM));
    setCurrentIndex(0);
    setAnswers(new Map());
    setSecondsRemaining(TIME_LIMIT_SECONDS);
    setPhase('questions');
  }, []);

  const answer = useCallback((questionId: string, key: string) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, key);
      return next;
    });
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const finish = useCallback(() => {
    setPhase('results');
  }, []);

  const retake = useCallback(() => {
    setPhase('intro');
  }, []);

  return {
    phase,
    questions,
    currentIndex,
    answers,
    secondsRemaining,
    totalCorrect,
    pctCorrect,
    proficiency,
    topicScores,
    start,
    answer,
    next,
    prev,
    finish,
    retake,
  };
}
