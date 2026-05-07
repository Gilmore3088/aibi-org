/**
 * <EssayArchive> — newspaper-archive list of essays.
 *
 * Each row: mono date | topic chiplet · serif headline · sub-line · mono read-time · arrow.
 * Replaces card grids in /research with a denser editorial list pattern.
 *
 * Categorization is content-driven — the consuming page filters which essays
 * to pass in. The archive itself doesn't filter.
 */

import Link from "next/link";
import { EssayMeta } from "./EssayMeta";
import { cn } from "@/lib/utils/cn";

export interface EssayArchiveItem {
  readonly slug: string;
  readonly title: string;
  readonly dek?: string;
  readonly date: string;
  readonly category?: string;
  readonly readMinutes?: number;
}

export interface EssayArchiveProps {
  readonly items: readonly EssayArchiveItem[];
  readonly basePath?: string;
  readonly className?: string;
}

export function EssayArchive({ items, basePath = "/research", className }: EssayArchiveProps) {
  return (
    <ul className={cn("border-t border-hairline", className)}>
      {items.map((item) => (
        <li key={item.slug} className="border-b border-hairline">
          <Link
            href={`${basePath}/${item.slug}`}
            className="grid gap-s4 grid-cols-[1fr_auto] md:grid-cols-[110px_1fr_80px_30px] items-baseline py-s5 hover:bg-parch transition-colors duration-fast"
          >
            <EssayMeta date={item.date} className="hidden md:block" />
            <div>
              <EssayMeta date={item.date} category={item.category} className="md:hidden mb-s2" />
              {item.category && (
                <p className="hidden md:block font-mono text-label-sm uppercase tracking-widest text-terra mb-s1">
                  {item.category}
                </p>
              )}
              <h3 className="font-serif text-display-xs leading-snug">{item.title}</h3>
              {item.dek && (
                <p className="text-body-sm text-slate mt-s1 leading-relaxed">{item.dek}</p>
              )}
            </div>
            <span className="hidden md:block font-mono text-mono-sm tabular-nums text-slate text-right">
              {item.readMinutes ? `${item.readMinutes} min` : ""}
            </span>
            <span aria-hidden="true" className="hidden md:block text-terra text-right">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
