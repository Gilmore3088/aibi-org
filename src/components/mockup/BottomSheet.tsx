'use client';

/**
 * BottomSheet — modal sheet that slides up from the bottom of the viewport
 * on mobile. Renders via React portal so it escapes parent stacking
 * contexts. Includes focus trap, ESC handler, backdrop dismiss, body
 * scroll lock, and aria-modal semantics.
 *
 * Use for mobile-only interactions where a sticky bar or popover would
 * obscure too much page content (e.g. picker UIs with > ~6 options).
 *
 * Caller controls open state. The sheet renders nothing when closed.
 */

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

export interface BottomSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  /** Visible heading at the top of the sheet — also used as aria-label. */
  readonly title: string;
  readonly children: ReactNode;
}

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Lock body scroll behind the sheet.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the sheet.
    const first = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    first?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="mk-bottom-sheet-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={sheetRef}
        className="mk-bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mk-bottom-sheet-handle" aria-hidden="true" />
        <div className="mk-bottom-sheet-head">
          <h2 id={titleId} className="mk-bottom-sheet-title">{title}</h2>
          <button
            type="button"
            className="mk-bottom-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
        <div className="mk-bottom-sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
