/**
 * <EssayMeta> — date · category · read-time row.
 *
 * The mono metadata strip that appears under every essay headline and in
 * every archive listing. One source of truth for how publication metadata
 * is presented.
 *
 *   <EssayMeta date="2026-04-24" category="Governance" readMinutes={14} />
 */

import { cn } from "@/lib/utils/cn";

export interface EssayMetaProps {
  /** ISO-8601 date string (YYYY-MM-DD). */
  readonly date: string;
  readonly category?: string;
  readonly readMinutes?: number;
  readonly className?: string;
  /** Tone — light (on linen/parch) or dark (on ink band). */
  readonly tone?: "light" | "dark";
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(iso: string): string {
  // Always parse as UTC to avoid SSR/CSR drift.
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso;
  const [y, m, d] = parts as [number, number, number];
  const month = MONTHS[m - 1] ?? "";
  return `${month} ${d}, ${y}`;
}

export function EssayMeta({ date, category, readMinutes, className, tone = "light" }: EssayMetaProps) {
  const color = tone === "dark" ? "text-cream" : "text-slate";
  const sep = tone === "dark" ? "text-cream/40" : "text-dust";

  return (
    <p className={cn("font-mono text-mono-sm tabular-nums", color, className)}>
      <time dateTime={date}>{formatDate(date)}</time>
      {category && (
        <>
          <span className={cn("mx-s2", sep)}>·</span>
          <span className="uppercase tracking-wide">{category}</span>
        </>
      )}
      {readMinutes && (
        <>
          <span className={cn("mx-s2", sep)}>·</span>
          <span>{readMinutes} min read</span>
        </>
      )}
    </p>
  );
}
