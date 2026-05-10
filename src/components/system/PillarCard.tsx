/**
 * <PillarCard> — a card with a pillar-color stripe at the top edge.
 *
 * Used in the certification ladder, transformation arc, and engagement
 * tier grids. The stripe is the only "thick" line in the system (3px).
 *
 *   <PillarCard pillar="application" stripe>
 *     <PillarCard.Eyebrow>01 · Foundational</PillarCard.Eyebrow>
 *     <PillarCard.Title>AiBI Foundations</PillarCard.Title>
 *     <PillarCard.Designation>Banking AI Foundations · The Institute</PillarCard.Designation>
 *     ...
 *   </PillarCard>
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { PILLAR_COLORS, type Pillar } from "@/lib/design-system/tokens";

export interface PillarCardProps {
  readonly pillar?: Pillar;
  readonly stripe?: boolean;
  /** Surface tone — defaults to parch. Use "linen" for neutral, "dark" for ink band. */
  readonly surface?: "parch" | "linen" | "dark";
  readonly className?: string;
  readonly children: ReactNode;
}

export function PillarCard({ pillar, stripe = true, surface = "parch", className, children }: PillarCardProps) {
  const surfaceClass =
    surface === "linen" ? "bg-linen text-ink" : surface === "dark" ? "bg-ink text-bone" : "bg-parch text-ink";
  const stripeColor = pillar ? PILLAR_COLORS[pillar] : "var(--color-terra)";

  return (
    <article className={cn("relative border border-hairline", surfaceClass, className)}>
      {stripe && (
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: stripeColor }}
        />
      )}
      <div className="p-s6">{children}</div>
    </article>
  );
}

/** Eyebrow — small mono label at the top of the card. */
PillarCard.Eyebrow = function Eyebrow({ children }: { readonly children: ReactNode }) {
  return (
    <p className="font-mono text-mono-sm uppercase tracking-wider text-slate mb-s2">{children}</p>
  );
};

/** Title — serif card title. */
PillarCard.Title = function Title({ children, level = 3 }: { readonly children: ReactNode; readonly level?: 2 | 3 | 4 }) {
  const Heading = `h${level}` as "h2" | "h3" | "h4";
  return <Heading className="font-serif text-display-xs md:text-display-sm leading-snug">{children}</Heading>;
};

/** Designation — italic serif sub-title under the card title. */
PillarCard.Designation = function Designation({ children }: { readonly children: ReactNode }) {
  return <p className="font-serif italic text-body-sm text-slate mt-s1 mb-s4">{children}</p>;
};

/** Body — paragraph or block content. */
PillarCard.Body = function Body({ children }: { readonly children: ReactNode }) {
  return <div className="text-body-sm leading-relaxed">{children}</div>;
};
