"use client";

/**
 * QuestionCard — single-question chrome for /assessment.
 *
 * Ported to the mockup design system (2026-05-27). Inter typography, navy
 * ink + gold accent, sentence-case headlines, UPPER mono labels.
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
    <div
      className="w-full max-w-3xl mx-auto"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Header — NN / NN · DIMENSION */}
      <div className="flex items-baseline justify-between mb-8">
        <p
          className="tabular-nums uppercase"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "var(--slate-500)",
          }}
        >
          <span style={{ color: "var(--gold-deep)" }}>
            {String(questionNumber).padStart(2, "0")}
          </span>
          <span style={{ margin: "0 6px", color: "var(--slate-400)" }}>/</span>
          <span>{String(totalQuestions).padStart(2, "0")}</span>
        </p>
        <p
          className="uppercase"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "var(--gold-deep)",
          }}
        >
          {question.dimension}
        </p>
      </div>

      {/* Prompt */}
      <h2
        ref={promptRef}
        tabIndex={-1}
        className="focus:outline-none"
        style={{
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          marginBottom: 40,
        }}
      >
        {question.prompt}
      </h2>

      {/* Answer list */}
      <div
        role="radiogroup"
        aria-label={question.prompt}
        style={{ borderTop: "1px solid var(--ink-a15)" }}
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
                "w-full text-left grid grid-cols-[1fr_28px] gap-4 items-center",
                "transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
              )}
              style={{
                padding: "20px 16px",
                borderBottom: "1px solid var(--ink-a10)",
                background: selected ? "var(--cream-2)" : "transparent",
                outlineColor: "var(--gold)",
                transitionDuration: "120ms",
              }}
              onMouseEnter={(e) => {
                if (!selected) e.currentTarget.style.background = "var(--cream)";
              }}
              onMouseLeave={(e) => {
                if (!selected) e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: "var(--ink)",
                }}
              >
                {option.label}
              </span>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  border: selected
                    ? "1px solid var(--gold)"
                    : "1px solid var(--ink-a15)",
                  background: selected ? "var(--gold)" : "transparent",
                  boxShadow: selected ? "inset 0 0 0 3px #fff" : undefined,
                  justifySelf: "end",
                  transition: "border-color 120ms, background 120ms",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{ marginTop: 32 }}
      >
        {canGoBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="transition-colors"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--slate-600)",
              transitionDuration: "120ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--gold-deep)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--slate-600)";
            }}
          >
            ← Back to question {String(questionNumber - 1).padStart(2, "0")}
          </button>
        ) : (
          <span />
        )}
        <span
          className="uppercase"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "var(--slate-500)",
          }}
        >
          Tap an answer to continue
        </span>
      </div>
    </div>
  );
}
