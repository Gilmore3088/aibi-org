'use client';

/**
 * Sticky-bottom CTA bar for mobile only. Renders position:fixed at the
 * bottom of the viewport when the user has scrolled past the hero, so a
 * primary action prompt stays in reach across long marketing pages.
 *
 * Why: production audit on 2026-05-28 measured CTA "dead zones" of 4–6
 * thumb-swipes between consecutive primary CTAs on every parent page.
 * The chrome SiteHeader is sticky but it's nav, not an action button.
 * This component is the single highest-leverage mobile fix.
 *
 * Behavior:
 *   - desktop (>=768px): renders nothing (display:none in CSS)
 *   - mobile: appears immediately, so the first-paint CTA remains reachable
 *     even when the hero proof object stacks above or below the copy
 *   - tap target: 48px tall, full-width, gold fill, ink text
 *   - dismissable: small close button on the right; once dismissed in
 *     a session it stays hidden (sessionStorage flag)
 *   - safe-area aware: padding-bottom honors env(safe-area-inset-bottom)
 *
 * Caller passes the label + href that fit the page's primary funnel.
 */

import { useEffect, useState } from 'react';

export interface StickyMobileCtaProps {
  readonly label: string;
  readonly href: string;
  /** Optional analytics event source attribute (matches existing data-plausible patterns). */
  readonly source?: string;
}

const DISMISS_KEY = 'aibi.sticky-mobile-cta.dismissed-v1';
const SHOW_AFTER_SCROLL_PX = 0;

export function StickyMobileCta({ label, href, source }: StickyMobileCtaProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Honor a prior dismiss within the same browser session.
    if (typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch {
      // sessionStorage can throw in private mode — fail open.
    }
    const onScroll = () => setVisible(window.scrollY >= SHOW_AFTER_SCROLL_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="mk-sticky-mobile-cta"
      data-visible={visible ? 'true' : 'false'}
      aria-hidden={!visible}
    >
      <a
        href={href}
        className="mk-sticky-mobile-cta-action"
        data-plausible-event-source={source}
        tabIndex={visible ? 0 : -1}
      >
        {label}
      </a>
      <button
        type="button"
        onClick={handleDismiss}
        className="mk-sticky-mobile-cta-close"
        aria-label="Dismiss this prompt"
        tabIndex={visible ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      </button>
    </div>
  );
}
