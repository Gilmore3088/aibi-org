'use client';

// MobileNav — hamburger menu + slide-out drawer for mobile screens.
// Visible only below md breakpoint. Renders nav links, assessment CTA,
// and sign-in link inside a backdrop overlay.
// A11Y: focus trap, Escape key, focus restoration on close.

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/assessment', label: 'Assess' },
  { href: '/courses/aibi-p', label: 'Learn' },
  { href: '/dashboard/toolbox', label: 'Apply' },
  { href: '/for-institutions', label: 'Lead' },
  { href: '/resources', label: 'Resources' },
  { href: '/dashboard', label: 'Today' },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Restore focus to the hamburger button
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  // Close on route change
  useEffect(() => {
    if (open) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  // Focus the close button when drawer opens
  useEffect(() => {
    if (open && drawerRef.current) {
      const closeBtn = drawerRef.current.querySelector<HTMLElement>('[data-close-btn]');
      closeBtn?.focus();
    }
  }, [open]);

  // Escape key handler + focus trap
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
        return;
      }

      // Focus trap: cycle Tab within the drawer
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, close]);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="p-3 -mr-3 text-[color:var(--color-ink)] hover:text-[color:var(--color-terra)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2 rounded-[2px]"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Backdrop + drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-[color:var(--color-ink)]/30"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer — no shadow-lg per design system (elevation through color contrast only) */}
          <nav
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed top-0 right-0 z-50 h-full w-72 bg-[color:var(--color-linen)] border-l border-[color:var(--color-ink)]/10 overflow-y-auto"
          >
            {/* Close button */}
            <div className="flex justify-end p-5">
              <button
                data-close-btn
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="p-3 text-[color:var(--color-ink)] hover:text-[color:var(--color-terra)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] rounded-[2px]"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <div className="px-6 pb-8 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      'block py-3 px-3 font-serif-sc text-sm uppercase tracking-[0.15em] rounded-[2px] transition-colors',
                      isActive
                        ? 'text-[color:var(--color-terra)] bg-[color:var(--color-parch)]'
                        : 'text-[color:var(--color-ink)]/75 hover:text-[color:var(--color-terra)] hover:bg-[color:var(--color-parch)]',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="h-px bg-[color:var(--color-ink)]/10 my-4" aria-hidden="true" />

              {/* Assessment CTA */}
              <Link
                href="/assessment"
                className="block w-full text-center py-3 px-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
              >
                See where you stand
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
