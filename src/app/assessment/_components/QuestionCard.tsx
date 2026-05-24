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

import { useEffect, useMemo, useRef } from "react";
import type { AssessmentQuestion as V1Question } from "@content/assessments/v1/questions";
import type { AssessmentQuestion as V2Question } from "@content/assessments/v2/types";
import { cn } from "@/lib/utils/cn";

type AnyAssessmentQuestion = V1Question | V2Question;

// Fisher-Yates — local copy so the QuestionCard does not pull from
// content/assessments/v2/rotation (avoids client/server boundary work
// for a four-element shuffle). Used for option-order randomisation
// (audit A19).
function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Audit A19 rework (Wave D critique 2026-05-24): the first pass used
// useMemo([question.id]) which re-shuffled when the learner navigated
// back to a prior question, because React unmounts/remounts the card
// per-question. The critique was right — re-shuffle on revisit reads
// as a UX bug. Cache the per-question order at module scope (one
// cache per page session) so back/forward stays stable. Keyed by
// `${dimension}:${id}` to keep the cache distinct across v1 and v2
// question types.
const OPTION_ORDER_CACHE = new Map<string, number[]>();

function stableShuffledIndices(
  cacheKey: string,
  optionCount: number,
): number[] {
  const cached = OPTION_ORDER_CACHE.get(cacheKey);
  if (cached && cached.length === optionCount) return cached;
  const indices = Array.from({ length: optionCount }, (_, i) => i);
  const shuffled = fisherYatesShuffle(indices);
  OPTION_ORDER_CACHE.set(cacheKey, shuffled);
  return shuffled;
}

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

  // Audit A19 (2026-05-24, rework after Wave D critique): break the
  // "lowest option is always worst" position signal. The shuffle is
  // resolved through a module-scope cache keyed on question.id, so
  // navigating back to a prior question RESTORES the prior order
  // rather than re-shuffling it (the first pass naïvely used
  // useMemo([question.id]) which re-fires on remount). Click
  // handlers still send option.points so the scoring path is
  // untouched.
  const cacheKey = `${question.dimension}:${question.id}`;
  const displayedOptions = useMemo(() => {
    const order = stableShuffledIndices(cacheKey, question.options.length);
    return order.map((i) => question.options[i]);
  }, [cacheKey, question.options]);

  function handleOptionKeyDown(event: React.KeyboardEvent, idx: number) {
    const last = displayedOptions.length - 1;
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
          <span className="mx-s2 text-slate">/</span>
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
        {displayedOptions.map((option, idx) => {
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
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ledger-accent)] focus-visible:outline-offset-[-2px]",
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
                        background: "var(--color-terra)",
                        boxShadow: "inset 0 0 0 3px var(--color-parch)",
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
        <span className="font-mono text-label-md uppercase tracking-widest text-slate">
          Tap an answer to continue
        </span>
      </div>
    </div>
  );
}
