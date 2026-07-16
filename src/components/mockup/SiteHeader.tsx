'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from './Button';
import { Wordmark } from '@/components/brand';

// Nav items are destinations, so each uses the noun. "Home" is intentionally
// absent — the logo links home, so a redundant Home item just adds a cell.
// The same list drives the desktop bar and the mobile drawer.
const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: 'Assessment', href: '/assessment' },
  { label: 'Training', href: '/courses' },
  { label: 'Resources', href: '/resources' },
  { label: 'For Institutions', href: '/for-institutions' },
  { label: 'Pricing', href: '/pricing' },
];

function MenuIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export interface SiteHeaderProps {
  /** Active route path (e.g. '/courses'). The matching nav item gets the
   * active styling. Pass `undefined` to render no active state. */
  activePath?: string;
  /** Primary CTA — top-right on desktop, dominant action at the bottom of the
   * mobile drawer. Defaults to "Get readiness score" → /assessment/take. */
  cta?: { label: string; href: string };
}

export function SiteHeader({
  activePath,
  cta = { label: 'Get readiness score', href: '/assessment/take' },
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => activePath === href;
  const closeMenu = () => setMenuOpen(false);

  // While the drawer is open: lock background scroll (without a layout shift —
  // pad by the scrollbar width), move focus into the drawer, trap Tab inside
  // it, close on Escape, and return focus to the menu button on close.
  useEffect(() => {
    if (!menuOpen) return;

    const menuButton = menuButtonRef.current;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );
    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
      menuButton?.focus();
    };
  }, [menuOpen]);

  return (
    <header className="mk-header">
      <div className="mk-container mk-header-inner">
        <Link className="mk-brand" href="/" aria-label="The AI Banking Institute home">
          {/* Full lockup on wider screens; the compact "[Ai]BI" on phones, where
              the full wordmark + Menu button would overflow a 375px header. Only
              the visible one is in the a11y tree (display:none removes it). */}
          <Wordmark variant="full" tone="dark" size={24} className="mk-brand-full" />
          <Wordmark variant="compact" tone="dark" size={24} className="mk-brand-compact" />
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

        {/* Desktop-only CTA. */}
        <div className="mk-header-cta">
          <Button variant="gold" href={cta.href}>
            {cta.label}
          </Button>
        </div>

        {/* Mobile-only menu trigger. */}
        <button
          ref={menuButtonRef}
          type="button"
          className="mk-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="mk-mobile-drawer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <MenuIcon />
          <span>Menu</span>
        </button>
      </div>

      {/* Portalled to <body> so the fixed overlay escapes the header's
          backdrop-filter containing block (which would otherwise clip it). */}
      {menuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="mk-drawer-root" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="mk-drawer-backdrop" onClick={closeMenu} aria-hidden="true" />
            <div ref={panelRef} id="mk-mobile-drawer" className="mk-drawer-panel">
              <div className="mk-drawer-head">
                <span className="mk-drawer-title">Menu</span>
                <button type="button" className="mk-drawer-close" onClick={closeMenu} aria-label="Close menu">
                  <CloseIcon />
                </button>
              </div>

              <nav className="mk-drawer-nav" aria-label="Site">
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mk-drawer-link${isActive(item.href) ? ' is-active' : ''}`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    onClick={closeMenu}
                  >
                    <span>{item.label}</span>
                    {isActive(item.href) && <span className="mk-drawer-current">Current</span>}
                  </Link>
                ))}
              </nav>

              <div className="mk-drawer-cta">
                <Button variant="gold" size="lg" href={cta.href} onClick={closeMenu}>
                  Get my readiness score
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
