'use client';

// Client-only animation runner for the /research surface.
// Mounts an IntersectionObserver that adds `.in` to `.reveal` elements
// when they enter the viewport, and kicks off the cover-chart line draw.
// Respects prefers-reduced-motion by stamping everything `in` immediately
// instead of animating.

import { useEffect } from 'react';

export function ResearchAnimations(): null {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function drawCover(): void {
      const c = document.getElementById('coverChart');
      if (!c) return;
      c.querySelectorAll<SVGPathElement>('.ln.draw').forEach((p) => {
        const len = parseFloat(p.getAttribute('data-len') ?? '1100') || 1100;
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        requestAnimationFrame(() => p.classList.add('in'));
      });
      c.querySelectorAll('.gap-band, .dot, .lbl, .gap-callout, .gap-num').forEach((el) =>
        el.classList.add('in'),
      );
    }

    if (reduced) {
      document.querySelectorAll('.aibi-research .reveal').forEach((el) => el.classList.add('in'));
      drawCover();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
      },
      { threshold: 0.18 },
    );

    document.querySelectorAll('.aibi-research .reveal').forEach((el) => io.observe(el));
    const t = window.setTimeout(drawCover, 300);

    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
