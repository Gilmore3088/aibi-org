/**
 * <DimensionGrid> — 8-cell scored dimension grid for the assessment results.
 *
 * Each cell shows the dimension name, score (mono x/4 format), a colored bar,
 * a one-paragraph diagnostic, and an optional "act first" / "strength" tag.
 * Bars use pillar-color discipline: terra default, cobalt for security/risk,
 * sage for talent/literacy strengths, error for weakest dimensions.
 */

import { cn } from "@/lib/utils/cn";

export type DimensionTag = "act-first" | "strength" | null;

export interface DimensionScore {
  readonly slug: string;
  readonly name: string;
  readonly score: number;
  readonly maxScore?: number;
  readonly comment: string;
  /** Optional accent color override; defaults to terra. */
  readonly accent?: "terra" | "cobalt" | "sage" | "error";
  readonly tag?: DimensionTag;
}

export interface DimensionGridProps {
  readonly dimensions: readonly DimensionScore[];
  readonly className?: string;
}

const ACCENT_BG: Record<NonNullable<DimensionScore["accent"]>, string> = {
  terra: "bg-terra",
  cobalt: "bg-cobalt",
  sage: "bg-sage",
  error: "bg-error",
};

const TAG_CLASS: Record<NonNullable<DimensionTag>, { wrap: string; label: string }> = {
  "act-first": { wrap: "bg-terra-pale", label: "act first" },
  strength: { wrap: "bg-sage-pale", label: "strength" },
};

const TAG_TEXT: Record<NonNullable<DimensionTag>, string> = {
  "act-first": "text-error",
  strength: "text-sage",
};

export function DimensionGrid({ dimensions, className }: DimensionGridProps) {
  return (
    <div
      className={cn(
        "grid sm:grid-cols-2 gap-px bg-hairline border-y border-strong",
        className
      )}
      role="list"
      aria-label="Readiness scores by dimension"
    >
      {dimensions.map((dim) => {
        const max = dim.maxScore ?? 4;
        const pct = Math.max(0, Math.min(1, dim.score / max));
        const accent = dim.accent ?? "terra";
        return (
          <div
            key={dim.slug}
            role="listitem"
            className="bg-linen p-s5"
          >
            <div className="flex items-baseline gap-s3 mb-s2">
              <h3 className="font-serif text-display-xs leading-snug flex-1">
                {dim.name}
                {dim.tag && (
                  <span
                    className={cn(
                      "ml-s2 inline-block align-middle text-label-sm px-s2 py-[2px] uppercase tracking-wide",
                      TAG_CLASS[dim.tag].wrap,
                      TAG_TEXT[dim.tag]
                    )}
                  >
                    {TAG_CLASS[dim.tag].label}
                  </span>
                )}
              </h3>
              <p className="font-mono tabular-nums text-mono-md text-ink shrink-0">
                {dim.score}
                <span className="text-dust"> / {max}</span>
              </p>
            </div>
            <div
              className="h-[4px] bg-parch-dark mb-s3 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={dim.score}
              aria-label={`${dim.name}: ${dim.score} of ${max}`}
            >
              <span
                className={cn("block h-full transition-[width] duration-slow", ACCENT_BG[accent])}
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <p className="text-body-sm leading-relaxed text-ink/80">{dim.comment}</p>
          </div>
        );
      })}
    </div>
  );
}
