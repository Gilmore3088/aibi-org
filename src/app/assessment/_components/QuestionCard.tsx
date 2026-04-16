'use client';

import type { AssessmentQuestion } from '@content/assessments/v1/questions';

interface QuestionCardProps {
  readonly question: AssessmentQuestion;
  readonly questionNumber: number;
  readonly totalQuestions: number;
  readonly selectedPoints: number | undefined;
  readonly onAnswer: (points: number) => void;
  readonly onBack: () => void;
  readonly canGoBack: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedPoints,
  onAnswer,
  onBack,
  canGoBack,
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70">
        <span>
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-[color:var(--color-terra)]">{question.dimension}</span>
      </div>

      <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-10 text-[color:var(--color-ink)]">
        {question.prompt}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const selected = selectedPoints === option.points;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onAnswer(option.points)}
              aria-pressed={selected}
              aria-label={`${option.label}${selected ? ' (selected)' : ''}`}
              className={
                'w-full text-left px-5 py-4 border transition-colors ' +
                (selected
                  ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra-pale)]/40 text-[color:var(--color-ink)]'
                  : 'border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] hover:border-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-pale)]/20 text-[color:var(--color-ink)]')
              }
            >
              <span className="font-sans text-base md:text-lg leading-snug">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-terra)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          &larr; Back
        </button>
        <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-slate)]">
          Tap an answer to continue
        </span>
      </div>
    </div>
  );
}
