/**
 * <ToolGrid> — vendor wordmark grid replacing the paragraph-list of tools.
 *
 * Each tile shows the tool name as a serif wordmark with the vendor below in
 * mono small-caps. Hover lifts the cell with a terra hairline. Reads at a
 * glance — six tools in one screen-width grid, no paragraphs.
 *
 * Used in place of the verbose "tools your bankers will use" lists.
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
          className="bg-linen px-s5 py-s6 transition-colors duration-fast hover:bg-parch"
        >
          <p className="font-mono text-label-sm uppercase tracking-widest text-terra mb-s3">
            {CATEGORY_LABEL[tool.category]}
          </p>
          <p className="font-serif text-display-xs md:text-display-sm leading-none text-ink">
            {tool.name}
          </p>
          <p className="font-mono text-label-md uppercase tracking-widest text-slate mt-s3">
            {tool.vendor}
          </p>
        </article>
      ))}
    </div>
  );
}
