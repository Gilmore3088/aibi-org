/**
 * <DiagnosticPage> — assessment in-flow page archetype.
 *
 * Composes:
 *   - parch-dark progress strip with question count + bar
 *   - QuestionFrame (Q + answers + sidebar Why)
 *   - bottom action row with prev/next/submit
 *   - running-tally caption with privacy note
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { QuestionFrame, type QuestionFrameProps } from "../diagnostic/QuestionFrame";
import { cn } from "@/lib/utils/cn";

export interface DiagnosticPageProps extends QuestionFrameProps {
  readonly questionNumber: number;
  readonly totalQuestions: number;
  /** "/assessment/q/3" — typically the previous-question route. */
  readonly prevHref?: string;
  /** Caller handles next via onNext (advances state). */
  readonly onNext?: () => void;
  readonly nextLabel?: string;
  readonly nextDisabled?: boolean;
  /** Running total of the user's score so far, for the bottom caption. */
  readonly runningScore?: number;
  readonly runningMax?: number;
  /** Note above the answers — typically the privacy reassurance. */
  readonly footnote?: ReactNode;
  readonly saveAndContinueHref?: string;
}

export function DiagnosticPage({
  questionNumber,
  totalQuestions,
  prevHref,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  runningScore,
  runningMax,
  footnote = "Your answers persist on this device. Email is requested only after the final question.",
  saveAndContinueHref,
  ...frame
}: DiagnosticPageProps) {
  const pct = Math.min(100, Math.round((questionNumber / totalQuestions) * 100));

  return (
    <main>
      <div className="bg-parch-dark px-s7 py-s4 border-b border-strong">
        <div className="max-w-wide mx-auto flex flex-wrap gap-s5 items-center text-body-sm">
          <span className="font-mono text-label-sm uppercase tracking-widest text-slate">
            Readiness Diagnostic
          </span>
          <span className="font-mono text-mono-sm tabular-nums text-ink">
            Question <span className="text-terra">{String(questionNumber).padStart(2, "0")}</span>{" "}
            <span className="text-slate">of</span>{" "}
            {String(totalQuestions).padStart(2, "0")}
          </span>
          <div
            className="flex-1 h-[2px] bg-hairline relative min-w-[120px]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
            aria-valuenow={questionNumber}
            aria-label={`Question ${questionNumber} of ${totalQuestions}`}
          >
            <span
              className="absolute inset-y-0 left-0 bg-terra transition-[width] duration-medium"
              style={{ width: `${pct}%` }}
            />
          </div>
          {saveAndContinueHref && (
            <Link
              href={saveAndContinueHref}
              className="font-sans text-body-sm text-slate border-b border-dotted border-slate pb-[1px] hover:text-terra hover:border-terra"
            >
              Save & continue later
            </Link>
          )}
        </div>
      </div>

      <QuestionFrame
        {...frame}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />

      <div className="bg-linen px-s7 py-s5 flex flex-wrap items-center justify-between gap-s4">
        <div>
          {prevHref ? (
            <Link
              href={prevHref}
              className="font-sans text-body-sm text-slate hover:text-terra transition-colors duration-fast"
            >
              ← Back to question {String(Math.max(1, questionNumber - 1)).padStart(2, "0")}
            </Link>
          ) : (
            <span />
          )}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || !onNext}
          className={cn(
            "bg-terra text-linen px-s7 py-s4 rounded-sharp font-sans text-mono-sm font-medium uppercase tracking-wider",
            "hover:bg-terra-light transition-colors duration-fast",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {nextLabel} →
        </button>
      </div>

      <div className="bg-parch px-s7 py-s4 border-t border-hairline flex flex-wrap items-center justify-between gap-s3 text-body-sm text-slate">
        <span>{footnote}</span>
        {runningScore !== undefined && runningMax !== undefined && (
          <span className="font-mono text-mono-sm tabular-nums text-ink">
            <span className="text-slate uppercase tracking-wider mr-s2 text-label-sm">
              Running
            </span>
            {runningScore} of {runningMax} possible
          </span>
        )}
      </div>
    </main>
  );
}
