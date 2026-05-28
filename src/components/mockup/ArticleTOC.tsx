'use client';

/**
 * ArticleTOC — auto-generated table of contents for long-form research
 * articles. On mount, scans the document for `h2[id]` elements and
 * renders them as a sticky-aside nav on desktop / a collapsible
 * `<details>` strip on mobile.
 *
 * Articles opt in by passing `showTOC` to ArticleShell. Headings must
 * have an `id` attribute for them to appear in the TOC; existing
 * articles will need a one-line edit per h2.
 */

import { useEffect, useState } from 'react';

interface TocItem {
  readonly id: string;
  readonly text: string;
}

export function ArticleTOC() {
  const [items, setItems] = useState<readonly TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Collect ALL h2 elements inside the article body (id or not) so existing
    // articles can opt in without per-h2 edits. Skip the TOC's own heading.
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('article h2, main h2'),
    ).filter((h) => !h.closest('.mk-article-toc'));

    // Auto-assign slugified ids to headings that don't have one.
    headings.forEach((h) => {
      if (!h.id) {
        const slug = (h.textContent || '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]+/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 60);
        if (slug) h.id = slug;
      }
    });

    setItems(
      headings
        .filter((h) => h.id)
        .map((h) => ({
          id: h.id,
          text: (h.textContent || '').trim(),
        })),
    );

    // Spy on which section is visible (IntersectionObserver, top of viewport).
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveId(e.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -75% 0px' },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  const listMarkup = (
    <ol className="mk-article-toc-list">
      {items.map((it) => (
        <li key={it.id}>
          <a
            href={`#${it.id}`}
            className={`mk-article-toc-link${activeId === it.id ? ' is-active' : ''}`}
            aria-current={activeId === it.id ? 'true' : undefined}
          >
            {it.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <aside className="mk-article-toc" aria-label="On this page">
      <h2 className="mk-article-toc-label">On this page</h2>
      {/* Mobile: collapsible <details>. Desktop: static panel. CSS swaps
          visibility at 1024px via .mk-article-toc-mobile / -desktop. */}
      <details className="mk-article-toc-details mk-article-toc-mobile">
        <summary className="mk-article-toc-summary">
          {items.length} sections
        </summary>
        {listMarkup}
      </details>
      <div className="mk-article-toc-static mk-article-toc-desktop">
        {listMarkup}
      </div>
    </aside>
  );
}
