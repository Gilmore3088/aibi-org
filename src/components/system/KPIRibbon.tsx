/**
 * <KPIRibbon> — sourced data band primitive.
 *
 * The defining content shape of the brand: 2–6 cells with mono numbers,
 * sub-line, descriptor, and a citation. Sits on parch-dark surface with
 * hairline cell dividers.
 *
 *   <KPIRibbon items={[
 *     { label: "Curriculum", value: "9 modules", delta: "~12 hrs", desc: "From AI literacy to a working portfolio" },
 *     { label: "Foundations output", value: "3 artifacts", delta: "peer-reviewed", desc: "Real workflows shipped during the program" },
 *   ]} />
 *
 * Cells span the full row at the page level — they're meant to bleed
 * edge-to-edge inside their parent <Section bleed>. Use `padded` to constrain
 * to the section's container instead.
 */

import { cn } from "@/lib/utils/cn";

export interface KPIItem {
  readonly label: string;
  /** The headline metric — typically a number, name, or phrase. */
  readonly value: string;
  /** Optional secondary line under the value (mono, terra). */
  readonly delta?: string;
  /** One-line descriptor. */
  readonly desc?: string;
  /** Sourced citation line — author/publication, year. Shown in dust. */
  readonly source?: string;
}

export interface KPIRibbonProps {
  readonly items: readonly KPIItem[];
  /** When true, the ribbon respects its parent container's max-width. Default: bleeds. */
  readonly padded?: boolean;
  readonly className?: string;
  /** Aria label for screen readers. Defaults to "Key metrics". */
  readonly ariaLabel?: string;
}

export function KPIRibbon({ items, padded = false, className, ariaLabel = "Key metrics" }: KPIRibbonProps) {
  const cols = items.length;
  // Tailwind's grid-cols-N must be a static class for JIT; map common cases.
  const gridCols =
    cols === 2 ? "grid-cols-2" : cols === 3 ? "sm:grid-cols-3" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : cols === 5 ? "sm:grid-cols-5" : "sm:grid-cols-6";

  return (
    <div
      className={cn(
        "grid bg-parch-dark border-y border-strong",
        gridCols,
        padded ? "" : "",
        className
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item, idx) => (
        <div
          key={`${item.label}-${idx}`}
          className={cn(
            "p-s6 border-l border-hairline first:border-l-0",
            // On wrap boundary in 4-col responsive layout, top border restores rule
            cols === 4 && idx >= 2 ? "border-t border-hairline lg:border-t-0" : ""
          )}
        >
          <p className="font-serif-sc text-label-sm uppercase tracking-widest text-slate mb-s2">
            {item.label}
          </p>
          <p className="font-mono text-display-sm tabular-nums text-ink leading-tight">
            {item.value}
          </p>
          {item.delta && (
            <p className="font-mono text-mono-sm tabular-nums text-terra mt-s1">{item.delta}</p>
          )}
          {item.desc && <p className="text-body-sm text-ink/80 mt-s2 leading-snug">{item.desc}</p>}
          {item.source && (
            <p className="font-mono text-label-sm uppercase tracking-wide text-dust mt-s2">
              {item.source}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
