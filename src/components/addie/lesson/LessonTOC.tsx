'use client';

// LessonTOC — sticky right-rail outline for the lesson body. Scroll-spy
// highlights the current section; sections scrolled past are marked
// "done" with the accent rule. Click to scroll-to-anchor. Hidden on
// mobile (sticky bottom nav already covers wayfinding there).

import { useEffect, useState } from 'react';
import type { LessonHeading } from './lessonHeadings';

interface LessonTOCProps {
  readonly headings: ReadonlyArray<LessonHeading>;
}

export function LessonTOC({ headings }: LessonTOCProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [doneSet, setDoneSet] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (headings.length === 0) return;
    const targets = headings
      .map((h) => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => !!el);
    if (targets.length === 0) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll-spy via IntersectionObserver. The "active" heading is the
    // first one currently intersecting the upper third of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        // Sort by document order; pick first intersecting.
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        if (intersecting.length > 0) {
          setActiveSlug(intersecting[0].id);
        }
        // Mark anything above the viewport as done.
        const newDone = new Set<string>();
        for (const t of targets) {
          if (t.getBoundingClientRect().top < 80) newDone.add(t.id);
        }
        setDoneSet(newDone);
      },
      { rootMargin: '-72px 0px -66% 0px', threshold: 0 },
    );
    for (const t of targets) io.observe(t);

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const link = target?.closest('a[data-lesson-toc]');
      if (!link) return;
      const slug = link.getAttribute('href')?.replace(/^#/, '');
      if (!slug) return;
      e.preventDefault();
      const el = document.getElementById(slug);
      if (!el) return;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${slug}`);
    }
    window.addEventListener('click', onClick);

    return () => {
      io.disconnect();
      window.removeEventListener('click', onClick);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const doneCount = doneSet.size;
  const total = headings.length;

  return (
    <nav
      aria-label="In this lesson"
      className="hidden xl:block w-60 shrink-0 sticky top-[88px] self-start"
    >
      <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-2">
        In this lesson
      </div>
      <div className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)] mb-3 tabular-nums">
        {doneCount} / {total} sections
      </div>
      <ol className="space-y-1 border-l border-[var(--ledger-rule)] pl-3">
        {headings.map((h) => {
          const isActive = activeSlug === h.slug;
          const isDone = doneSet.has(h.slug) && !isActive;
          return (
            <li key={h.slug}>
              <a
                href={`#${h.slug}`}
                data-lesson-toc
                aria-current={isActive ? 'true' : undefined}
                className={
                  'block py-1.5 text-sm leading-snug transition-colors duration-[120ms] ' +
                  (h.level === 3 ? 'pl-3 ' : '') +
                  (isActive
                    ? 'text-[var(--ledger-ink)] font-semibold border-l-2 border-[var(--ledger-accent)] -ml-3 pl-3'
                    : isDone
                      ? 'text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]'
                      : 'text-[var(--ledger-ink-2)] hover:text-[var(--ledger-ink)]')
                }
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
