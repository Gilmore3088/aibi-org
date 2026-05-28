'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './Button';

// Desktop primary nav — buyer-facing destinations only.
// Sandbox + Toolbox are product surfaces that confuse first-time visitors;
// they live inside the signed-in experience (dashboard chrome) and as
// references inside the course/assessment pages, not in the top nav.
const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Assessment', href: '/assessment' },
  { label: 'Learn', href: '/courses' },
  { label: 'Resources', href: '/research' },
  { label: 'Institutions', href: '/for-institutions' },
];

// Mobile primary nav — 3 core buttons + a "More" overflow. Labels shortened
// ("Assessment" → "Assess") so the four mobile cells breathe at narrow
// widths. Resources + Institutions live in the More panel. About + Security
// + FAQ live in the footer, not nav (2026-05-28 user direction).
const PRIMARY_MOBILE_NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Assess', href: '/assessment' },
  { label: 'Learn', href: '/courses' },
];

const MORE_MOBILE_NAV: { label: string; href: string; helper: string }[] = [
  { label: 'Resources', href: '/research', helper: 'Research, templates, downloads' },
  { label: 'Institutions', href: '/for-institutions', helper: 'Team rollout and briefing' },
];

export interface SiteHeaderProps {
  /** Active route path (e.g. '/courses'). The matching nav item gets the
   * active styling. Pass `undefined` to render no active state. */
  activePath?: string;
  /** Primary CTA in the top-right (desktop only — hidden on mobile because
   * the sticky bottom CTA covers the same surface). Defaults to "Get
   * readiness score" → /assessment. */
  cta?: { label: string; href: string };
}

export function SiteHeader({
  activePath,
  cta = { label: 'Get readiness score', href: '/assessment/take' },
}: SiteHeaderProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_MOBILE_NAV.some((item) => activePath === item.href);

  const isActive = (href: string) => activePath === href;

  return (
    <header className="mk-header">
      <div className="mk-container mk-header-inner">
        <Link className="mk-brand" href="/" aria-label="The AI Banking Institute home">
          <span className="mk-seal" aria-hidden>
            {/* Landmark / institution icon */}
            <svg
              className="mk-ic-lg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="22" x2="21" y2="22" />
              <line x1="6" y1="18" x2="6" y2="11" />
              <line x1="10" y1="18" x2="10" y2="11" />
              <line x1="14" y1="18" x2="14" y2="11" />
              <line x1="18" y1="18" x2="18" y2="11" />
              <polygon points="12 2 20 7 4 7" />
            </svg>
          </span>
          <span className="mk-wm-1">The AI Banking Institute</span>
        </Link>

        <nav className="mk-nav" aria-label="Primary">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? 'is-active' : ''}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop-only CTA — hidden on mobile via .mk-header-cta CSS so the
            mobile header is just centered logo + nav pill. */}
        <div className="mk-header-cta">
          <Button variant="gold" href={cta.href}>
            {cta.label}
          </Button>
        </div>
      </div>

      <div className="mk-container mk-nav-mobile-wrap">
        <nav className="mk-nav-mobile" aria-label="Primary (mobile)">
          {PRIMARY_MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? 'is-active' : ''}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`mk-nav-mobile-more${moreActive || moreOpen ? ' is-active' : ''}`}
            aria-expanded={moreOpen}
            aria-controls="mk-nav-mobile-more-panel"
          >
            {moreOpen ? 'Close' : 'More'}
          </button>
        </nav>

        {moreOpen && (
          <div
            id="mk-nav-mobile-more-panel"
            className="mk-nav-mobile-more-panel"
            role="region"
            aria-label="More navigation"
          >
            {MORE_MOBILE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mk-nav-mobile-more-link${isActive(item.href) ? ' is-active' : ''}`}
                onClick={() => setMoreOpen(false)}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className="mk-nav-mobile-more-link-label">{item.label}</span>
                <span className="mk-nav-mobile-more-link-helper">{item.helper}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
