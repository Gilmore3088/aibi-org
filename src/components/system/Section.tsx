/**
 * <Section> — page-section primitive.
 *
 * The most-used primitive in the system. Wraps content in a horizontally
 * padded, optionally bg-tinted band with hairline dividers between siblings.
 *
 * Variants control the surface tone:
 *   - linen     (default page background)
 *   - parch     (one step warmer; used for "soft band" sections)
 *   - parchDark (two steps warmer; KPI ribbon, value-prop bands, mission)
 *   - dark      (ink background for emphasis: ROI, capstone, CTA, contact)
 *
 * The `divider` prop controls the hairline between this section and the next:
 *   - hairline (default — 1px ink/10)
 *   - strong   (1px solid ink — used between major posture shifts, e.g. above
 *               a KPI ribbon)
 *   - none
 */

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "linen" | "parch" | "parchDark" | "dark";
type Divider = "hairline" | "strong" | "none";
type ContainerWidth = "narrow" | "default" | "wide" | "full";

const VARIANT_CLASS: Record<Variant, string> = {
  linen: "bg-linen text-ink",
  parch: "bg-parch text-ink",
  parchDark: "bg-parch-dark text-ink",
  dark: "bg-ink text-bone",
};

const DIVIDER_CLASS: Record<Divider, string> = {
  hairline: "border-b border-hairline",
  strong: "border-b border-strong",
  none: "",
};

const CONTAINER_CLASS: Record<ContainerWidth, string> = {
  narrow: "max-w-narrow",
  default: "max-w-default",
  wide: "max-w-wide",
  full: "",
};

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  readonly variant?: Variant;
  readonly divider?: Divider;
  readonly container?: ContainerWidth;
  /** Vertical padding scale: "tight" | "default" | "hero". */
  readonly padding?: "tight" | "default" | "hero" | "none";
  readonly children: ReactNode;
  /**
   * If true, render no `mx-auto max-w-...` wrapper. The children are
   * responsible for their own width. Use for full-bleed grids (KPI ribbons,
   * cert ladders) where each cell should span the page.
   */
  readonly bleed?: boolean;
}

export function Section({
  variant = "linen",
  divider = "hairline",
  container = "default",
  padding = "default",
  bleed = false,
  className,
  children,
  ...rest
}: SectionProps) {
  const padClass =
    padding === "none"
      ? ""
      : padding === "tight"
        ? "py-s8 px-s7"
        : padding === "hero"
          ? "py-s12 px-s7 md:py-s16"
          : "py-s9 px-s7";

  const inner = bleed ? (
    children
  ) : (
    <div className={cn("mx-auto", CONTAINER_CLASS[container])}>{children}</div>
  );

  return (
    <section
      className={cn(VARIANT_CLASS[variant], DIVIDER_CLASS[divider], padClass, className)}
      {...rest}
    >
      {inner}
    </section>
  );
}
