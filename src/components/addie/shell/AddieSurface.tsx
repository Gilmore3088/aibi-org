'use client';

// AddieSurface — client-side enabler for the course-surface CSS scope.
// Adds .js-ready to the wrapping element on mount so the reveal-on-scroll
// rules activate; also runs an IntersectionObserver to flip
// data-revealed=true as elements scroll in, and tracks reading progress
// for the top progress bar.
//
// The component renders nothing of its own — it mutates the .addie-course-
// surface root and toggles a fixed reading-progress bar via a portal-style
// fragment. SSR-safe: without JS the layout still reads correctly because
// CSS only opts into the hidden state once .js-ready is present.

import { useEffect, useRef } from 'react';

interface AddieSurfaceProps {
  readonly readingProgress?: boolean;
}

export function AddieSurface({ readingProgress = false }: AddieSurfaceProps) {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.querySelector('.addie-course-surface');
    if (!root) return;
    root.classList.add('js-ready');

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal-on-scroll
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    let io: IntersectionObserver | null = null;
    if (!reduce && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              (e.target as HTMLElement).dataset.revealed = 'true';
              io?.unobserve(e.target);
            }
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
      );
      for (const t of targets) io.observe(t);
    } else {
      for (const t of targets) t.dataset.revealed = 'true';
    }

    // Reading progress
    let raf = 0;
    const onScroll = () => {
      if (!barRef.current) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
        barRef.current!.style.width = `${(p * 100).toFixed(2)}%`;
      });
    };
    if (readingProgress) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    return () => {
      root.classList.remove('js-ready');
      if (io) io.disconnect();
      if (readingProgress) window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [readingProgress]);

  if (!readingProgress) return null;
  return (
    <div
      ref={barRef}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      className="addie-reading-progress"
    />
  );
}
