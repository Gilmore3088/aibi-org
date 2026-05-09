/**
 * <ToolGrid> — vendor monogram + wordmark grid.
 *
 * Each tile shows a typeset Cormorant monogram (the tool name's first
 * letter, terra) inside a hairline-bordered square, with the tool name
 * and vendor in the hairline-divided footer below. Treats all six
 * vendors uniformly — same monogram treatment, different letter — so
 * the grid reads as a typeset ticker, not as missing logos.
 *
 * Trademark / brand-policy note: real vendor logos are gated by each
 * vendor's brand guidelines (Microsoft and Google explicitly require
 * licensing, others require press-kit review). The monogram treatment
 * is policy-safe, on-brand, and cohesive across all tiles.
 */

import { TOOLS, type CurriculumTool } from "@content/curriculum/tools";
import { cn } from "@/lib/utils/cn";

const CATEGORY_LABEL: Record<CurriculumTool["category"], string> = {
  "general-llm": "General",
  "office-suite": "Office",
  research: "Research",
  documents: "Documents",
};

export interface ToolGridProps {
  readonly tools?: readonly CurriculumTool[];
  readonly className?: string;
}

export function ToolGrid({ tools = TOOLS, className }: ToolGridProps) {
  return (
    <div
      className={cn(
        "grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-strong",
        className
      )}
      role="list"
      aria-label="Tools the curriculum teaches"
    >
      {tools.map((tool) => {
        const initial = tool.name.charAt(0);
        return (
          <article
            key={tool.slug}
            role="listitem"
            className="bg-linen flex flex-col transition-colors duration-fast hover:bg-parch"
          >
            {/* Category eyebrow */}
            <div className="px-s6 pt-s5">
              <p className="font-mono text-label-sm uppercase tracking-widest text-terra">
                {CATEGORY_LABEL[tool.category]}
              </p>
            </div>

            {/* Monogram well — typeset Cormorant initial in a hairline square */}
            <div className="flex items-center justify-center px-s6 py-s8 lg:py-s10 min-h-[7rem]">
              <span
                aria-hidden="true"
                className="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 border border-hairline bg-parch font-serif text-[3.25rem] lg:text-[4rem] leading-none text-terra select-none"
              >
                {initial}
              </span>
            </div>

            {/* Footer — tool name + vendor */}
            <div className="border-t border-hairline px-s6 py-s5 mt-auto">
              <p className="font-serif text-display-xs leading-none text-ink">
                {tool.name}
              </p>
              <p className="font-mono text-label-md uppercase tracking-widest text-slate mt-s2">
                {tool.vendor}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
