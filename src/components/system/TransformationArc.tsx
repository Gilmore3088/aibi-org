/**
 * <TransformationArc> — three-stage banker → practitioner → builder arc.
 *
 * The mission rendered as content. Replaces the homepage "How it works" feature
 * grid with an editorial three-stage progression. Each stage has a role label,
 * serif title, body paragraph, and bullet list of attributes.
 *
 *   <TransformationArc stages={[banker, practitioner, builder]} />
 */

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface ArcStage {
  readonly stageLabel: string;
  readonly title: string;
  readonly body: ReactNode;
  readonly attributes: readonly string[];
}

export interface TransformationArcProps {
  readonly stages: readonly ArcStage[];
  readonly className?: string;
}

export function TransformationArc({ stages, className }: TransformationArcProps) {
  const lgCols =
    stages.length === 3
      ? "lg:grid-cols-[1fr_30px_1fr_30px_1fr]"
      : stages.length === 4
        ? "lg:grid-cols-[1fr_30px_1fr_30px_1fr_30px_1fr]"
        : "lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]";

  return (
    <div
      role="list"
      aria-label="Stages of practitioner transformation"
      className={cn("grid gap-px bg-hairline border border-hairline", lgCols, className)}
    >
      {stages.map((stage, idx) => (
        <Fragment key={`stage-${idx}`}>
          <div
            role="listitem"
            className="bg-linen p-s6"
            aria-current={idx === stages.length - 1 ? "step" : undefined}
          >
            <p className="font-mono text-label-sm uppercase tracking-widest text-terra mb-s3">
              {stage.stageLabel}
            </p>
            <h4 className="font-serif text-display-xs leading-snug mb-s3">{stage.title}</h4>
            <p className="text-body-sm leading-relaxed text-ink/80 mb-s3">{stage.body}</p>
            <ul className="border-t border-hairline pt-s3 space-y-s1 text-body-sm">
              {stage.attributes.map((attr) => (
                <li key={attr} className="flex gap-s2">
                  <span aria-hidden="true" className="font-mono text-terra">
                    —
                  </span>
                  <span>{attr}</span>
                </li>
              ))}
            </ul>
          </div>
          {idx < stages.length - 1 && (
            <div
              aria-hidden="true"
              className="bg-linen hidden lg:grid place-items-center text-terra font-mono"
            >
              →
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
