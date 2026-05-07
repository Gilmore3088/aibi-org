/**
 * <Marginalia> — terra-left-rule annotation.
 *
 * The "footnote in the margin" treatment. Used for sidebar quotes, founder
 * cards, supporting points off to the side of body copy. Rendered as an
 * <aside> by default for semantic accessibility.
 *
 *   <Marginalia label="Founder">
 *     <h4>James Gilmore</h4>
 *     <p>...</p>
 *   </Marginalia>
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface MarginaliaProps {
  /** Small mono uppercase label above the content. Optional. */
  readonly label?: string;
  /** Color of the left rule. Defaults to terra. Pillar-restricted otherwise. */
  readonly accent?: "terra" | "sage" | "cobalt" | "amber";
  readonly as?: "aside" | "div";
  readonly className?: string;
  readonly children: ReactNode;
}

const ACCENT_BORDER: Record<NonNullable<MarginaliaProps["accent"]>, string> = {
  terra: "border-l-terra",
  sage: "border-l-sage",
  cobalt: "border-l-cobalt",
  amber: "border-l-amber",
};

const ACCENT_TEXT: Record<NonNullable<MarginaliaProps["accent"]>, string> = {
  terra: "text-terra",
  sage: "text-sage",
  cobalt: "text-cobalt",
  amber: "text-amber",
};

export function Marginalia({ label, accent = "terra", as = "aside", className, children }: MarginaliaProps) {
  const Tag = as;
  return (
    <Tag className={cn("border-l-2 pl-s4", ACCENT_BORDER[accent], className)}>
      {label && (
        <p
          className={cn(
            "font-mono text-label-sm uppercase tracking-widest mb-s2",
            ACCENT_TEXT[accent]
          )}
        >
          {label}
        </p>
      )}
      {children}
    </Tag>
  );
}
