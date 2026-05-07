/**
 * <EssayPage> — long-form research essay archetype.
 *
 * Used for every /research/[slug] page. Designed to render MDX content with a
 * narrow reading column, sourced citations, a NewsletterCard at the close, and
 * a "back to archive" link.
 *
 * MDX bodies should use H2 (##), H3 (###), `<EditorialQuote>`, `<KPIRibbon>`,
 * `<Marginalia>` — the design system primitives. Plain markdown also renders
 * cleanly via Tailwind typography defaults.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { Section } from "../Section";
import { EssayMeta } from "../EssayMeta";
import { NewsletterCard } from "../NewsletterCard";

export interface EssaySource {
  readonly label: string;
  readonly url?: string;
}

export interface EssayPageProps {
  readonly title: string;
  readonly dek?: string;
  readonly date: string;
  readonly category?: string;
  readonly readMinutes?: number;
  readonly author?: string;
  /** Optional list of named sources for the citation block at the close. */
  readonly sources?: readonly EssaySource[];
  /** The essay body — typically rendered MDX. */
  readonly children: ReactNode;
}

export function EssayPage({
  title,
  dek,
  date,
  category,
  readMinutes,
  author,
  sources,
  children,
}: EssayPageProps) {
  return (
    <main>
      <Section variant="linen" divider="hairline" padding="hero" container="narrow">
        <Link
          href="/research"
          className="font-serif-sc text-label-md uppercase tracking-widest text-slate hover:text-terra transition-colors duration-fast"
        >
          ← The AI Banking Brief
        </Link>
        {category && (
          <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra mt-s8">
            {category}
          </p>
        )}
        <h1 className="font-serif text-display-lg md:text-display-xl text-ink leading-tight tracking-tightish mt-s4">
          {title}
        </h1>
        {dek && (
          <p className="font-serif italic text-body-lg text-ink/80 mt-s5 leading-relaxed">{dek}</p>
        )}
        <div className="mt-s6">
          <EssayMeta date={date} category={category} readMinutes={readMinutes} />
        </div>
        {author && (
          <p className="font-mono text-mono-sm tabular-nums text-slate mt-s2">By {author}</p>
        )}
      </Section>

      <Section variant="linen" divider="hairline" padding="default" container="narrow">
        <div className="prose prose-aibi max-w-none">{children}</div>
      </Section>

      {sources && sources.length > 0 && (
        <Section variant="parch" divider="hairline" padding="default" container="narrow">
          <p className="font-mono text-label-md uppercase tracking-widest text-slate mb-s3">
            Sources
          </p>
          <ul className="space-y-s2 font-mono text-mono-sm tabular-nums text-ink/80">
            {sources.map((src, idx) => (
              <li key={idx} className="flex gap-s2">
                <span className="text-terra">{String(idx + 1).padStart(2, "0")}</span>
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink hover:text-terra"
                  >
                    {src.label}
                  </a>
                ) : (
                  <span>{src.label}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section variant="parchDark" divider="none" padding="default" container="narrow">
        <NewsletterCard
          heading="Read this regularly."
          blurb="The AI Banking Brief — fortnightly, sourced commentary on community-bank AI adoption."
        />
      </Section>
    </main>
  );
}
