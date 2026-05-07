/**
 * <QuestionFrame> — assessment Q-and-4-answers + sidebar Why.
 *
 * The signature view of the diagnostic in-flow. Two-column layout: question
 * with ranked-answer list on the left, "Why this question" panel with a
 * citation on the right.
 *
 * Selected answer state is controlled via props; the calling page owns the
 * actual selection state.
 */

import { cn } from "@/lib/utils/cn";

export interface QuestionAnswer {
  readonly id: string;
  readonly score: number; // 1–4
  readonly label: string;
  readonly detail?: string;
}

export interface QuestionFrameProps {
  readonly questionNumber: number;
  readonly totalQuestions: number;
  readonly dimensionLabel: string;
  readonly question: string;
  readonly answers: readonly QuestionAnswer[];
  readonly selectedId?: string | null;
  readonly onSelect: (id: string) => void;
  readonly why: {
    readonly heading: string;
    readonly body: string;
    readonly citation?: { readonly text: string; readonly source: string };
  };
  readonly className?: string;
}

export function QuestionFrame({
  questionNumber,
  totalQuestions: _totalQuestions,
  dimensionLabel,
  question,
  answers,
  selectedId,
  onSelect,
  why,
  className,
}: QuestionFrameProps) {
  return (
    <div className={cn("grid lg:grid-cols-[1.6fr_1fr] border-b border-hairline", className)}>
      {/* Main column */}
      <div className="bg-linen px-s9 py-s10 lg:border-r lg:border-hairline">
        <p className="font-mono text-label-sm uppercase tracking-widest text-terra mb-s4">
          {dimensionLabel}
        </p>
        <h1 className="font-serif text-display-sm md:text-display-md text-ink leading-tight tracking-tightish">
          <span className="font-mono text-mono-md text-slate mr-s3">
            {String(questionNumber).padStart(2, "0")} /
          </span>
          {question}
        </h1>

        <ul className="mt-s8 border-t border-hairline">
          {answers.map((answer) => {
            const selected = selectedId === answer.id;
            return (
              <li key={answer.id} className="border-b border-hairline">
                <button
                  type="button"
                  onClick={() => onSelect(answer.id)}
                  aria-pressed={selected}
                  className={cn(
                    "w-full text-left grid grid-cols-[36px_1fr_22px] gap-s4 items-baseline py-s4 px-s2",
                    "hover:bg-parch transition-colors duration-fast",
                    selected && "bg-parch"
                  )}
                >
                  <span className="font-mono text-mono-sm uppercase tracking-wide text-terra pt-[2px]">
                    {String(answer.score).padStart(2, "0")}
                  </span>
                  <span className="text-body-md md:text-body-lg text-ink leading-snug">
                    {answer.label}
                    {answer.detail && (
                      <span className="block text-body-sm text-slate mt-s1 leading-relaxed">
                        {answer.detail}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "self-center w-[14px] h-[14px] border rounded-full",
                      selected
                        ? "border-terra bg-terra/[0.0001]"
                        : "border-hairline"
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
              </li>
            );
          })}
        </ul>
      </div>

      {/* Aside */}
      <aside className="bg-parch px-s9 py-s10" aria-label="Why this question">
        <p className="font-mono text-label-sm uppercase tracking-widest text-terra mb-s4">
          Why this question
        </p>
        <h2 className="font-serif text-body-lg md:text-display-xs text-ink leading-snug mb-s4">
          {why.heading}
        </h2>
        <p className="text-body-sm text-ink/80 leading-relaxed">{why.body}</p>
        {why.citation && (
          <figure className="mt-s5 pt-s4 border-t border-hairline">
            <blockquote className="font-serif italic text-body-sm text-slate leading-relaxed">
              {why.citation.text}
            </blockquote>
            <figcaption className="font-mono text-label-sm uppercase tracking-widest text-dust mt-s2">
              {why.citation.source}
            </figcaption>
          </figure>
        )}
      </aside>
    </div>
  );
}
