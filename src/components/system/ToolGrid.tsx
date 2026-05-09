/**
 * <ToolGrid> — vendor logo + wordmark grid.
 *
 * Each tile shows a vendor logo (loaded from /public/tool-logos/<slug>.svg)
 * as the visual anchor, with a hairline-divided footer carrying tool name +
 * vendor in serif and mono. Reads as a curriculum spec sheet, not a
 * paragraph list.
 *
 * Logo files: drop official SVGs into `public/tool-logos/`. See
 * `public/tool-logos/README.md` for each vendor's official brand page.
 * Missing files render gracefully — the layout reserves logo space and
 * falls back to the tool name in serif at logo size.
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
      {tools.map((tool) => (
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

          {/* Logo well — centered, generous, reads as the visual anchor.
              <object> renders its child fallback automatically when the
              SVG file is missing, so empty wells stay typographic instead
              of showing browser broken-image icons. */}
          <div className="flex items-center justify-center px-s6 py-s8 lg:py-s10 min-h-[7rem]">
            <object
              data={`/tool-logos/${tool.slug}.svg`}
              type="image/svg+xml"
              aria-label={`${tool.name} logo`}
              className="max-h-12 w-auto max-w-[60%] pointer-events-none"
            >
              <span
                aria-hidden="true"
                className="font-serif text-[3rem] leading-none text-ink/25 tracking-tight"
              >
                {tool.name.charAt(0)}
              </span>
            </object>
          </div>

          {/* Footer — name + vendor, hairline-divided */}
          <div className="border-t border-hairline px-s6 py-s5 mt-auto">
            <p className="font-serif text-display-xs leading-none text-ink">
              {tool.name}
            </p>
            <p className="font-mono text-label-md uppercase tracking-widest text-slate mt-s2">
              {tool.vendor}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
