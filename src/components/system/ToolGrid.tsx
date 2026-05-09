/**
 * <ToolGrid> — compact category-grouped tool list.
 *
 * Renders the curriculum's tool list as a hairline-divided directory
 * grouped by category (General / Office / Documents / Research). Each
 * row: terra mono category label, serif tool names with interpunct
 * separators, vendor in mono caption.
 *
 * Designed to sit directly under a SectionHeader as a dense reference
 * block — not as a hero-sized card grid.
 */

import { TOOLS, type CurriculumTool } from "@content/curriculum/tools";
import { cn } from "@/lib/utils/cn";

const CATEGORY_LABEL: Record<CurriculumTool["category"], string> = {
  "general-llm": "General",
  "office-suite": "Office",
  research: "Research",
  documents: "Documents",
};

const CATEGORY_ORDER: readonly CurriculumTool["category"][] = [
  "general-llm",
  "office-suite",
  "documents",
  "research",
];

export interface ToolGridProps {
  readonly tools?: readonly CurriculumTool[];
  readonly className?: string;
}

export function ToolGrid({ tools = TOOLS, className }: ToolGridProps) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABEL[cat],
    tools: tools.filter((t) => t.category === cat),
  })).filter((g) => g.tools.length > 0);

  return (
    <dl
      className={cn("border-y border-hairline divide-y divide-hairline", className)}
      aria-label="Tools the curriculum teaches"
    >
      {grouped.map((group) => (
        <div
          key={group.category}
          className="grid grid-cols-[10rem_1fr] gap-s6 py-s5 items-baseline"
        >
          <dt className="font-mono text-label-md uppercase tracking-widest text-terra">
            {group.label}
          </dt>
          <dd className="font-serif text-body-lg text-ink leading-snug">
            {group.tools.map((tool, idx) => (
              <span key={tool.slug} className="whitespace-nowrap">
                {tool.name}
                <span className="font-mono text-label-sm uppercase tracking-widest text-slate ml-s2">
                  {tool.vendor}
                </span>
                {idx < group.tools.length - 1 && (
                  <span aria-hidden="true" className="mx-s3 text-ink/30">·</span>
                )}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
