'use client';

/**
 * <Ticker> — Bloomberg-style rotating strip of sourced statistics and
 * regulatory references. Sits beneath the SiteNav on the homepage.
 *
 * Design intent (#191):
 *   - One item visible at a time, fade-rotate every ~6s
 *   - Pauses on hover and when the tab is unfocused
 *   - Respects `prefers-reduced-motion: reduce` — collapses to a static
 *     row showing the first item without rotation
 *   - Mobile-safe: wraps cleanly at < 640px, no horizontal scroll
 *
 * Content lives in `content/ticker/items.ts`. Type contract in
 * `src/types/ticker.ts`.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getActiveTickerItems } from '@content/ticker/items';
import { TICKER_TYPE_LABELS, type TickerItem } from '@/types/ticker';

const ROTATE_MS = 6000;

const ALL_ITEMS = getActiveTickerItems();

export function Ticker() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Detect reduced-motion preference once on mount + listen for changes.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Pause when the tab is not visible. Saves animation cycles + avoids
  // the "all items rotated past while I was on a different tab" feeling.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Drive the rotation. Skip entirely if reduced-motion or paused or there's
  // only one item.
  useEffect(() => {
    if (prefersReducedMotion || paused || ALL_ITEMS.length <= 1) return;
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % ALL_ITEMS.length);
    }, ROTATE_MS);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [prefersReducedMotion, paused]);

  if (ALL_ITEMS.length === 0) return null;

  const current = ALL_ITEMS[index];
  if (!current) return null;

  return (
    <aside
      aria-label="The AI Banking Institute — running signal"
      // Decorative + informative. Don't announce every rotation to assistive
      // tech (would be noisy); the strip's existence is announced once.
      aria-live="off"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="border-b border-hairline bg-parch"
    >
      <div className="max-w-wide mx-auto px-s7 py-s2 flex flex-wrap items-baseline gap-x-s4 gap-y-1">
        <TickerItemRow item={current} />
      </div>
    </aside>
  );
}

function TickerItemRow({ item }: { readonly item: TickerItem }) {
  const kicker = TICKER_TYPE_LABELS[item.type];
  const body = (
    <>
      <span
        aria-hidden="true"
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
      >
        {kicker}
      </span>
      <span className="font-serif italic text-body-sm text-ink/90 leading-snug">
        {item.text}
      </span>
      {item.source && (
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
          {item.source}
        </span>
      )}
    </>
  );

  // Wrap in a Link when href is set, otherwise just a span. Keep the same
  // structure either way so the layout doesn't shift between items.
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="flex flex-wrap items-baseline gap-x-s4 gap-y-1 hover:text-gold transition-colors"
      >
        {body}
      </Link>
    );
  }
  return (
    <span className="flex flex-wrap items-baseline gap-x-s4 gap-y-1">
      {body}
    </span>
  );
}
