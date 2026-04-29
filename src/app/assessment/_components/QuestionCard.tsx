'use client';

import { useEffect, useRef } from 'react';
import type { AssessmentQuestion as V1Question } from '@content/assessments/v1/questions';
import type { AssessmentQuestion as V2Question } from '@content/assessments/v2/types';

type AnyAssessmentQuestion = V1Question | V2Question;

interface QuestionCardProps {
  readonly question: AnyAssessmentQuestion;
  readonly questionNumber: number;
  readonly totalQuestions: number;
  readonly selectedPoints: number | undefined;
  readonly onAnswer: (points: number) => void;
  readonly onBack?: () => void;
  readonly canGoBack?: boolean;
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
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const promptRef = useRef<HTMLHeadingElement | null>(null);

  // Focus the prompt heading when the question changes so screen readers
  // announce the new question and keyboard users land in a known place.
  useEffect(() => {
    promptRef.current?.focus();
  }, [question.id]);

  // Arrow-key navigation between radio options — required for proper
  // role="radiogroup" semantics. Up/Left → previous, Down/Right → next,
  // Home → first, End → last. Wraps around.
  function handleOptionKeyDown(event: React.KeyboardEvent, idx: number) {
    const last = question.options.length - 1;
    let nextIdx = idx;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIdx = idx === last ? 0 : idx + 1;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIdx = idx === 0 ? last : idx - 1;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    optionRefs.current[nextIdx]?.focus();
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70">
        <span>
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-[color:var(--color-terra)]">{question.dimension}</span>
      </div>

      <h2
        ref={promptRef}
        tabIndex={-1}
        className="font-serif text-3xl md:text-4xl leading-tight mb-10 text-[color:var(--color-ink)] focus:outline-none"
      >
        {question.prompt}
      </h2>

      <div className="space-y-3" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option, idx) => {
          const selected = selectedPoints === option.points;
          // Roving tabindex: only the selected (or first if none selected)
          // option is in the tab order. Arrow keys move focus inside the group.
          const tabIndex =
            selectedPoints === undefined
              ? idx === 0
                ? 0
                : -1
              : selected
                ? 0
                : -1;
          return (
            <button
              key={idx}
              ref={(el) => {
                optionRefs.current[idx] = el;
              }}
              type="button"
              role="radio"
              tabIndex={tabIndex}
              onClick={() => onAnswer(option.points)}
              onKeyDown={(event) => handleOptionKeyDown(event, idx)}
              aria-checked={selected}
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
        {canGoBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-terra)]"
          >
            &larr; Back
          </button>
        ) : (
          <span />
        )}
        <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-slate)]">
          Tap an answer to continue
        </span>
      </div>
    </div>
  );
}
