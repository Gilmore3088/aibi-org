'use client';

import { QuestionCard } from '@/app/assessment/_components/QuestionCard';
import { GrowthPreview } from '../_local/GrowthPreview';
import type { AssessmentQuestion } from '@content/assessments/v2/types';
import type { ReadinessResult } from '@/lib/user-data';
import { QUESTIONS_PER_SESSION } from '../_lib/readPersisted';

interface PostAssessmentQuestionsProps {
  readonly selectedQuestions: AssessmentQuestion[];
  readonly currentQuestion: number;
  readonly answers: number[];
  readonly preData: ReadinessResult | null;
  readonly onAnswer: (points: number) => void;
}

export function PostAssessmentQuestions({
  selectedQuestions,
  currentQuestion,
  answers,
  preData,
  onAnswer,
}: PostAssessmentQuestionsProps) {
  return (
    <div>
      <div className="max-w-2xl mx-auto mb-10">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--gold-a10)',
            color: 'var(--gold-deep)',
            fontSize: '0.75rem',
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
            fontSize: 'clamp(1.75rem, 3.4vw, 2.25rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.022em',
            color: 'var(--ink)',
            margin: '0 0 14px',
          }}
        >
          See how far you&rsquo;ve come.
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--slate-600)',
            lineHeight: 1.6,
            margin: '0 0 24px',
          }}
        >
          You finished the course. Answer the same 12 questions you
          started with &mdash; honestly, the way you did on day one &mdash; and
          we&rsquo;ll show you exactly what changed, dimension by dimension.
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
        onAnswer={onAnswer}
      />
    </div>
  );
}
