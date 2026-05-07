/**
 * <EditorialQuote> — pull quote / blockquote primitive.
 *
 * Two variants:
 *   - light  → inline pull quote on parch/linen surface
 *   - dark   → quote on ink surface (used in About, Research, Results)
 *
 * Quotation marks are drawn in terra (or amber-light on dark) — this is
 * the only place curly quotes are styled colorfully.
 *
 *   <EditorialQuote attribution="From the founder's notes · April 2026">
 *     Community banks don't need to be told AI is coming.
 *   </EditorialQuote>
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface EditorialQuoteProps {
  readonly variant?: "light" | "dark";
  readonly attribution?: string;
  /** Visual size — "lg" for a hero pull quote, "md" for inline. */
  readonly size?: "md" | "lg";
  readonly className?: string;
  readonly children: ReactNode;
}

export function EditorialQuote({
  variant = "light",
  attribution,
  size = "md",
  className,
  children,
}: EditorialQuoteProps) {
  const isDark = variant === "dark";
  const bg = isDark ? "bg-ink text-bone" : "bg-transparent text-ink";
  const accent = isDark ? "text-amber-light" : "text-terra";
  const attrColor = isDark ? "text-cream" : "text-slate";
  const sizeClass = size === "lg" ? "text-display-xs md:text-display-sm" : "text-body-lg";

  return (
    <figure className={cn(isDark ? "p-s7" : "", bg, className)}>
      <blockquote
        className={cn(
          "font-serif italic leading-snug",
          sizeClass,
          isDark ? "text-bone" : "text-ink"
        )}
      >
        <span aria-hidden="true" className={cn("mr-[2px]", accent)}>
          {"“"}
        </span>
        {children}
        <span aria-hidden="true" className={accent}>
          {"”"}
        </span>
      </blockquote>
      {attribution && (
        <figcaption
          className={cn(
            "font-mono text-label-md uppercase tracking-widest mt-s4",
            attrColor
          )}
        >
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
