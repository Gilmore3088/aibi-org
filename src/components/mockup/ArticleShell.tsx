/* Lightweight chrome wrapper for /resources/<slug> long-form articles.
 *
 * The archive at /resources uses MockupShell. Article bodies are
 * bespoke long-form layouts that don't fit a section-based shell,
 * so they wrap themselves in this component to inherit the
 * site-wide mockup SiteHeader + a "back to Research" crumb at the top.
 *
 * Optional props (read-time chip + last-updated chip + auto-TOC) were
 * added 2026-05-28 per the desktop audit's "add TOC to long research
 * pages over 6,000px" recommendation. All optional — existing articles
 * continue to render unchanged until they pass the props.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { SiteHeader } from './SiteHeader';
import { ArticleTOC } from './ArticleTOC';
import { StickyMobileCta } from './StickyMobileCta';
import { ReadingProgress } from './ReadingProgress';
import { Button, ArrowGlyph } from './Button';

export interface ArticleShellProps {
  readonly children: ReactNode;
  /** Estimated read time in minutes. Renders a chip in the head strip when set. */
  readonly readMinutes?: number;
  /** Date the article was last updated (ISO 8601 or human string). Renders a chip when set. */
  readonly lastUpdated?: string;
  /** Author or publisher chip text. */
  readonly byline?: string;
  /** Whether to render the auto-TOC. Defaults to false until an article opts in. */
  readonly showTOC?: boolean;
  /** Back-crumb destination. Defaults preserve the six legacy /resources articles. */
  readonly backHref?: string;
  readonly backLabel?: string;
  /** Which nav item reads as active in the SiteHeader. */
  readonly activePath?: string;
  /** Render the closing "next step" band. Off for articles that carry their own CTA. */
  readonly closing?: boolean;
  /** Analytics source for the sticky mobile CTA. Defaults to the research-article source. */
  readonly ctaSource?: string;
}

export function ArticleShell({
  children,
  readMinutes,
  lastUpdated,
  byline,
  showTOC = false,
  backHref = '/resources',
  backLabel = '← Research',
  activePath = '/resources',
  closing = false,
  ctaSource = 'sticky-mobile-cta-research-article',
}: ArticleShellProps) {
  const hasChips = readMinutes != null || lastUpdated != null || byline != null;
  return (
    <div className="mockup-scope ax-article">
      <ReadingProgress />
      <SiteHeader activePath={activePath} />
      <div className="mk-article-head">
        <Link href={backHref} className="mk-article-back">
          {backLabel}
        </Link>
        {hasChips && (
          <div className="mk-article-chips" aria-label="Article metadata">
            {readMinutes != null && (
              <span className="mk-article-chip">{readMinutes} min read</span>
            )}
            {byline != null && (
              <span className="mk-article-chip">{byline}</span>
            )}
            {lastUpdated != null && (
              <span className="mk-article-chip mk-article-chip-muted">
                Updated {lastUpdated}
              </span>
            )}
          </div>
        )}
      </div>
      {showTOC && <ArticleTOC />}
      {children}
      {closing && (
        <section className="ax-article-close">
          <div className="mk-container">
            <p className="ax-k">Next step</p>
            <h2>Where does your institution stand?</h2>
            <p>Twelve questions, three minutes. A score, your top gap, and a prompt you can use on Monday.</p>
            <Button variant="gold" size="lg" href="/assessment/take">
              Take the free assessment <ArrowGlyph />
            </Button>
          </div>
        </section>
      )}
      <StickyMobileCta
        label="Take the free assessment"
        href="/assessment/take"
        source={ctaSource}
      />
    </div>
  );
}
