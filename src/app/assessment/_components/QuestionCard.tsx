"use client";

/**
 * QuestionCard — single-question chrome for /assessment.
 *
 * Rebuilt on the design-2.0 token system. Editorial treatment with mono
 * "NN / NN" question counter, dimension label, serif display prompt,
 * and hairline-ruled answer rows. The internal point value (1–4) is
 * not surfaced in the UI — answers are differentiated by label only,
 * not by visible score.
 *
 * UX preserved verbatim:
 *   - Auto-advance on option click (no separate Continue button)
 *   - role="radiogroup" with roving tabindex + arrow-key nav
 *   - Prompt heading is focused on question change for screen readers
 */

import { useEffect, useRef } from "react";
import type { AssessmentQuestion as V1Question } from "@content/assessments/v1/questions";
import type { AssessmentQuestion as V2Question } from "@content/assessments/v2/types";
import { cn } from "@/lib/utils/cn";

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

  useEffect(() => {
    promptRef.current?.focus();
  }, [question.id]);

  function handleOptionKeyDown(event: React.KeyboardEvent, idx: number) {
    const last = question.options.length - 1;
    let nextIdx = idx;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextIdx = idx === last ? 0 : idx + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        nextIdx = idx === 0 ? last : idx - 1;
        break;
      case "Home":
        nextIdx = 0;
        break;
      case "End":
        nextIdx = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    optionRefs.current[nextIdx]?.focus();
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Editorial header — NN / NN · DIMENSION */}
      <div className="flex items-baseline justify-between mb-s8">
        <p className="font-mono text-mono-sm tabular-nums uppercase tracking-wider text-slate">
          <span className="text-terra">
            {String(questionNumber).padStart(2, "0")}
          </span>
          <span className="mx-s2 text-dust">/</span>
          <span>{String(totalQuestions).padStart(2, "0")}</span>
        </p>
        <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra">
          {question.dimension}
        </p>
      </div>

      {/* Big editorial prompt */}
      <h2
        ref={promptRef}
        tabIndex={-1}
        className="font-serif text-display-sm md:text-display-md text-ink leading-tight tracking-tightish mb-s10 focus:outline-none"
      >
        {question.prompt}
      </h2>

      {/* Hairline-ruled answer list */}
      <div
        role="radiogroup"
        aria-label={question.prompt}
        className="border-t border-strong"
      >
        {question.options.map((option, idx) => {
          const selected = selectedPoints === option.points;
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
              aria-label={`${option.label}${selected ? " (selected)" : ""}`}
              className={cn(
                "w-full text-left grid grid-cols-[1fr_28px] gap-s4 items-baseline",
                "px-s4 py-s4 border-b border-hairline transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:bg-parch",
                selected
                  ? "bg-parch"
                  : "hover:bg-parch/60"
              )}
            >
              <span className="font-serif text-body-lg md:text-display-xs leading-snug text-ink">
                {option.label}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "self-center w-[14px] h-[14px] rounded-full border transition-colors duration-fast",
                  selected ? "border-terra" : "border-hairline"
                )}
                style={
                  selected
                    ? {
                        background:
                          "radial-gradient(circle, var(--color-terra) 50%, transparent 52%)",
                      }
                    : undefined
                }
              />
            </button>
          );
        })}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-s8 text-mono-sm">
        {canGoBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="font-sans text-body-sm text-slate hover:text-terra transition-colors duration-fast"
          >
            ← Back to question {String(questionNumber - 1).padStart(2, "0")}
          </button>
        ) : (
          <span />
        )}
        <span className="font-mono text-label-md uppercase tracking-widest text-dust">
          Tap an answer to continue
        </span>
      </div>
    </div>
  );
}
