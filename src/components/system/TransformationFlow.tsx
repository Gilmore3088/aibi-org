/**
 * <TransformationFlow> — visual replacement for <TransformationArc>.
 *
 * The mission rendered as a graphic, not a paragraph stack. SVG flow with
 * three stage nodes connected by a curved terra path, set on parch with
 * full-bleed mono labels. Massive serif stage names. The text shrinks to
 * one phrase per stage; the visual carries the rest.
 */

import { cn } from "@/lib/utils/cn";

export interface FlowStage {
  readonly index: string;          // "01" / "02" / "03"
  readonly stage: string;          // "Today" / "The path" / "In a year"
  readonly title: string;          // "The banker" / "The practitioner" / "The builder"
  readonly tagline: string;        // single phrase, no paragraph
}

export interface TransformationFlowProps {
  readonly stages: readonly FlowStage[];
  readonly className?: string;
}

export function TransformationFlow({ stages, className }: TransformationFlowProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Connecting curve — drawn behind the stage tiles */}
      <svg
        aria-hidden="true"
        className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-[120px] pointer-events-none"
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
      >
        <path
          d="M 60 80 Q 250 0 500 60 Q 750 120 940 40"
          stroke="var(--color-terra)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 6"
        />
      </svg>

      <ol className="relative grid gap-s8 md:grid-cols-3">
        {stages.map((stage, idx) => (
          <li
            key={stage.index}
            className={cn(
              "bg-linen border border-strong p-s7 text-center",
              // Stagger the middle stage downward — diagonal-flow visual
              idx === 1 && "md:translate-y-s8"
            )}
            aria-current={idx === stages.length - 1 ? "step" : undefined}
          >
            <p className="font-mono text-display-md tabular-nums text-terra leading-none mb-s4">
              {stage.index}
            </p>
            <p className="font-mono text-label-md uppercase tracking-widest text-slate mb-s4">
              {stage.stage}
            </p>
            <h3 className="font-serif text-display-sm md:text-display-md leading-tight text-ink mb-s3">
              {stage.title}
            </h3>
            <p className="font-serif italic text-body-md text-ink/75 leading-snug">
              {stage.tagline}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
