// Phase 1: questions. Renders the "measure your growth" header, a
// GrowthPreview hint with the pre-score, and the QuestionCard.

import type { AssessmentQuestion } from '@content/assessments/v2/types';
import { QuestionCard } from '@/app/assessment/_components/QuestionCard';
import { GrowthPreview } from './GrowthPreview';
import { QUESTIONS_PER_SESSION } from './postAssessmentStorage';

export function PostAssessmentQuestionsPhase({
  selectedQuestions,
  answers,
  currentQuestion,
  preScore,
  preTierLabel,
  onAnswer,
}: {
  readonly selectedQuestions: readonly AssessmentQuestion[];
  readonly answers: readonly number[];
  readonly currentQuestion: number;
  readonly preScore: number | null;
  readonly preTierLabel: string | null;
  readonly onAnswer: (points: number) => void;
}) {
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
          Answer honestly — the same way you did before the course. The point is the
          comparison, not the score.
        </p>

        <GrowthPreview preScore={preScore} preTierLabel={preTierLabel} />
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
