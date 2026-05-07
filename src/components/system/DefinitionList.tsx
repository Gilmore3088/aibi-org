/**
 * <DefinitionList> — labeled key-value rows in the editorial dl pattern.
 *
 * Used inside cert tiles, ROI input panels, program facts, and anywhere a
 * "spec sheet" presentation is needed. Labels are mono uppercase; values are
 * sans (or mono if numeric).
 *
 *   <DefinitionList items={[
 *     { label: "Format", value: "Self-paced, online" },
 *     { label: "Effort", value: "9 modules · ~12 hours", mono: true },
 *     { label: "Tuition", value: "$295", mono: true },
 *   ]} />
 */

import { cn } from "@/lib/utils/cn";

export interface DefinitionListItem {
  readonly label: string;
  readonly value: string;
  /** Render value in mono with tabular-nums. Use for numbers, dates, codes. */
  readonly mono?: boolean;
}

export interface DefinitionListProps {
  readonly items: readonly DefinitionListItem[];
  /** Width of the label column in the 2-col grid. Default: 90px. */
  readonly labelWidth?: string;
  /** Surface — controls border colors for dark variant. */
  readonly surface?: "light" | "dark";
  readonly className?: string;
}

export function DefinitionList({
  items,
  labelWidth = "90px",
  surface = "light",
  className,
}: DefinitionListProps) {
  const borderColor = surface === "dark" ? "border-cream/20" : "border-hairline";
  const labelColor = surface === "dark" ? "text-cream" : "text-dust";
  const valueColor = surface === "dark" ? "text-bone" : "text-ink";

  return (
    <dl
      className={cn("grid gap-y-s2 py-s3 border-y", borderColor, className)}
      style={{ gridTemplateColumns: `${labelWidth} 1fr` }}
    >
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="contents">
          <dt
            className={cn("font-mono text-label-sm uppercase tracking-wide pt-[2px]", labelColor)}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              item.mono ? "font-mono text-mono-sm tabular-nums" : "text-body-sm",
              "font-medium",
              valueColor
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
