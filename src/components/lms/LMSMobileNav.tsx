'use client';

// LMSMobileNav — hamburger button + slide-in drawer for the LMS sidebar.
// Renders nothing on desktop (CSS guards). On mobile (<768px) it shows a
// fixed-position hamburger button in the top-left and, when open, an
// off-canvas drawer with the same <LMSSidebar/> content.

import { useEffect, useState, type CSSProperties } from 'react';
import { LMSSidebar } from './LMSSidebar';
import type { LMSModule } from './types';

interface Props {
  readonly modules: readonly LMSModule[];
  readonly completed: readonly number[];
  readonly current: number;
  readonly learner?: {
    readonly name: string;
    readonly role: string;
  };
}

const buttonStyle: CSSProperties = {
  position: 'fixed',
  // 68px clears the global SiteNav (sticky top:0, ~63px tall + a 5px gap).
  // Without this offset the button overlapped the SiteNav wordmark on
  // mobile and clipped the leading "TH" of "THE AI BANKING INSTITUTE".
  // See #205.
  top: 68,
  left: 10,
  zIndex: 30,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 3,
  background: 'var(--cream-2)',
  border: '1px solid var(--ink-a10)',
  color: 'var(--ink)',
  cursor: 'pointer',
  padding: 0,
};

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(14, 27, 45, 0.55)',
  zIndex: 40,
};

const drawerStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  width: 'min(86vw, 320px)',
  background: 'var(--cream-2)',
  borderRight: '1px solid var(--ink-a10)',
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '4px 0 16px rgba(14, 27, 45, 0.18)',
};

const closeButtonStyle: CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 6,
  color: 'var(--ink)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

function HamburgerIcon() {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="18" height="1.5" fill="currentColor" />
      <rect x="0" y="6" width="18" height="1.5" fill="currentColor" />
      <rect x="0" y="12" width="18" height="1.5" fill="currentColor" />
    </svg>
  );
}

export function LMSMobileNav({ modules, completed, current, learner }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    // Prevent background scroll while the drawer is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Wrapper carries md:hidden so Tailwind's display:none on desktop
          beats the button's inline display:inline-flex (inline styles
          otherwise win the specificity battle and the button leaks onto
          desktop where the sidebar is already visible). */}
      <div className="md:hidden">
        <button
          type="button"
          style={buttonStyle}
          onClick={() => setOpen(true)}
          aria-label="Open course navigation"
          aria-expanded={open}
          aria-controls="lms-mobile-drawer"
        >
          <HamburgerIcon />
        </button>
      </div>

      {open && (
        <div className="md:hidden">
          <div
            style={backdropStyle}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="lms-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Course navigation"
            style={drawerStyle}
          >
            <button
              type="button"
              style={closeButtonStyle}
              onClick={() => setOpen(false)}
              aria-label="Close course navigation"
            >
              Close ×
            </button>
            <LMSSidebar
              modules={modules}
              completed={completed}
              current={current}
              learner={learner}
              mobile
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
