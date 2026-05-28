/* Lightweight chrome wrapper for /research/<slug> long-form articles.
 *
 * The archive at /research uses MockupShell. Article bodies are
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
}

export function ArticleShell({
  children,
  readMinutes,
  lastUpdated,
  byline,
  showTOC = false,
}: ArticleShellProps) {
  const hasChips = readMinutes != null || lastUpdated != null || byline != null;
  return (
    <div className="mockup-scope" style={{ background: 'var(--cream)' }}>
      <SiteHeader activePath="/research" />
      <div className="mk-article-head">
        <Link href="/research" className="mk-article-back">
          ← Research
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
    </div>
  );
}
