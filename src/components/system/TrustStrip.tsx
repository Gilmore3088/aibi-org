/**
 * <TrustStrip> — regulatory citation row.
 *
 * The trust badge of the brand. Sits in the footer of public marketing
 * surfaces and at the close of program / for-institutions pages. Always
 * the same regulators in the same order; the text is content from
 * `content/regulations/index.ts`.
 *
 *   <TrustStrip prefix="Curriculum aligned with" />
 */

import { REGULATIONS } from "@content/regulations";
import { cn } from "@/lib/utils/cn";

export interface TrustStripProps {
  readonly prefix?: string;
  readonly surface?: "parch-warm" | "ink";
  readonly className?: string;
}

export function TrustStrip({
  prefix = "Curriculum aligned with",
  surface = "parch-warm",
  className,
}: TrustStripProps) {
  const isDark = surface === "ink";
  const surfaceClass = isDark ? "bg-ink text-bone" : "bg-parch-dark text-ink";
  const labelClass = isDark ? "text-cream" : "text-slate";

  return (
    <div
      className={cn(
        "px-s7 py-s6 flex flex-wrap gap-x-s6 gap-y-s2 items-baseline text-body-sm",
        surfaceClass,
        className
      )}
      role="contentinfo"
      aria-label="Regulatory framework alignment"
    >
      <span className={cn("font-mono text-label-sm uppercase tracking-widest", labelClass)}>
        {prefix}
      </span>
      {REGULATIONS.map((reg) => (
        <span key={reg.slug} className="font-medium">
          <span className="sr-only">Aligned with </span>
          {reg.short}
        </span>
      ))}
    </div>
  );
}
