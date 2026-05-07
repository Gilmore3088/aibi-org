/**
 * <SectionHeader> — the canonical section opener.
 *
 * Composition: mono "§ NN · LABEL" prefix → serif H2 → optional italic subhead.
 * Used at the top of every section that introduces a new topic.
 *
 *   <SectionHeader number="01" label="The Path" title="From the work bankers do today, to the work AI lets them do." subtitle="Three stages, one banker." />
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface SectionHeaderProps {
  /** Two-digit string. Pass "01"–"99". Combined with `label` to form `§ NN · label`. */
  readonly number?: string;
  /** Short editorial category — "Diagnostic", "The Path", "Curriculum". */
  readonly label?: string;
  /** The section's serif H2 — the actual headline. */
  readonly title: ReactNode;
  /** Italic subtitle. Restrained — one sentence max. */
  readonly subtitle?: ReactNode;
  /** Heading level override; defaults to h2. */
  readonly as?: "h1" | "h2" | "h3";
  /** Section number tone — "terra" (default) or "dark" for use on ink bands. */
  readonly tone?: "terra" | "dark";
  readonly className?: string;
}

export function SectionHeader({
  number,
  label,
  title,
  subtitle,
  as: Heading = "h2",
  tone = "terra",
  className,
}: SectionHeaderProps) {
  const showPrefix = Boolean(number || label);
  const prefixColor = tone === "terra" ? "text-terra" : "text-amber-light";
  const subtitleColor = tone === "terra" ? "text-slate" : "text-cream";
  const titleColor = tone === "terra" ? "text-ink" : "text-bone";

  return (
    <div className={cn("mb-s6", className)}>
      {showPrefix && (
        <p className={cn("font-mono text-mono-sm uppercase tracking-wider mb-s2", prefixColor)}>
          {number ? `§ ${number}` : null}
          {number && label ? <span className="mx-s2 opacity-60">·</span> : null}
          {label}
        </p>
      )}
      <Heading className={cn("font-serif text-display-sm md:text-display-md", titleColor)}>
        {title}
      </Heading>
      {subtitle && (
        <p className={cn("font-serif italic text-body-lg mt-s2", subtitleColor)}>{subtitle}</p>
      )}
    </div>
  );
}
