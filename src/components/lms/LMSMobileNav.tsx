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
  top: 10,
  left: 10,
  zIndex: 30,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 3,
  background: 'var(--ledger-paper)',
  border: '1px solid var(--ledger-rule-strong)',
  color: 'var(--ledger-ink)',
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
  background: 'var(--ledger-paper)',
  borderRight: '1px solid var(--ledger-rule)',
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
  color: 'var(--ledger-ink)',
  fontFamily: 'var(--ledger-mono)',
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
      <button
        type="button"
        className="md:hidden"
        style={buttonStyle}
        onClick={() => setOpen(true)}
        aria-label="Open course navigation"
        aria-expanded={open}
        aria-controls="lms-mobile-drawer"
      >
        <HamburgerIcon />
      </button>

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
