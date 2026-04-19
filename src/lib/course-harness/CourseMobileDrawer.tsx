'use client';

// CourseMobileDrawer — Hamburger-triggered slide-out drawer for mobile (below lg)
// Client Component: requires useState for open/close state

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { ResolvedCourseView, ResolvedCourseItem } from './types';

interface CourseMobileDrawerProps {
  readonly view: ResolvedCourseView;
}

function formatItemNumber(number: string | number): string {
  if (typeof number === 'number') return String(number).padStart(2, '0');
  return number;
}

function ItemRow({
  item,
  accentColorVar,
  onClose,
}: {
  item: ResolvedCourseItem;
  accentColorVar: string;
  onClose: () => void;
}) {
  const formattedNumber = formatItemNumber(item.number);

  if (item.status === 'locked') {
    return (
      <div
        className="flex items-center gap-3 px-6 py-2.5 opacity-40 cursor-not-allowed"
        aria-label={`${item.title} — locked`}
      >
        <span className="font-mono text-[10px] w-5 text-[color:var(--color-slate)]">
          {formattedNumber}
        </span>
        <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
          {item.title}
        </span>
        <svg
          className="w-3 h-3 text-[color:var(--color-dust)] shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  if (item.status === 'coming-soon') {
    return (
      <div
        className="flex items-center gap-3 px-6 py-2.5 opacity-40 cursor-not-allowed"
        aria-label={`${item.title} — coming soon`}
      >
        <span className="font-mono text-[10px] w-5 text-[color:var(--color-slate)]">
          {formattedNumber}
        </span>
        <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
          {item.title}
        </span>
        <span className="font-mono text-[8px] uppercase tracking-widest text-[color:var(--color-slate)] shrink-0">
          Soon
        </span>
      </div>
    );
  }

  if (item.status === 'current') {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className="flex items-center gap-3 px-6 py-2.5 bg-[color:var(--color-parch-dark)] font-bold transition-colors"
        aria-current="page"
      >
        <span
          className="font-mono text-[10px] w-5 font-bold"
          style={{ color: accentColorVar }}
        >
          {formattedNumber}
        </span>
        <span className="font-serif text-xs flex-1 leading-tight" style={{ color: accentColorVar }}>
          {item.title}
        </span>
      </Link>
    );
  }

  // completed
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className="flex items-center gap-3 px-6 py-2.5 hover:bg-[color:var(--color-parch)] transition-colors"
    >
      <span className="font-mono text-[10px] w-5 text-[color:var(--color-slate)]">
        {formattedNumber}
      </span>
      <span className="font-serif text-xs text-[color:var(--color-ink)] flex-1 leading-tight">
        {item.title}
      </span>
      <svg
        className="w-3 h-3 shrink-0"
        style={{ color: accentColorVar }}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-label="Completed"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}

export function CourseMobileDrawer({ view }: CourseMobileDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  const { config, sections, currentItem } = view;
  const accent = config.brand.accentColorVar;
  const resumeHref = currentItem?.href ?? sections[0]?.items[0]?.href ?? '#';

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger trigger — visible only below lg */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[color:var(--color-ink)] transition-colors"
        style={{ color: 'var(--color-ink)' }}
        aria-label="Open course navigation"
        aria-expanded={isOpen}
        aria-controls="mobile-course-nav"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[color:var(--color-ink)]/40 z-50 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Slide-out drawer */}
      <div
        id="mobile-course-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Course navigation"
        className={`fixed left-0 top-0 h-full w-72 bg-[color:var(--color-linen)] z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b h-16"
          style={{ borderColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold"
              style={{ border: `1.5px solid ${accent}`, color: accent }}
            >
              Ai
            </div>
            <div className="text-[color:var(--color-ink)] font-bold text-sm font-serif leading-tight">
              {config.brand.wordmark}
            </div>
          </div>
          <button
            onClick={close}
            className="p-1 text-[color:var(--color-slate)] transition-colors"
            aria-label="Close course navigation"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Item navigation grouped by section */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Course navigation">
          {sections.map((section) => {
            const sectionColor = section.colorVar ?? accent;
            return (
              <div key={section.id} className="mb-1">
                <div
                  className="px-6 py-2 text-[10px] uppercase font-mono tracking-[0.2em] font-bold"
                  style={{ color: sectionColor }}
                >
                  {section.label}
                </div>

                {section.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    accentColorVar={sectionColor}
                    onClose={close}
                  />
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer: Resume + cross-course nav */}
        <div
          className="p-6 border-t space-y-3"
          style={{ borderColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}
        >
          <Link
            href={resumeHref}
            onClick={close}
            className="w-full py-3 px-4 rounded-sm font-bold transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[color:var(--color-linen)]"
            style={{ backgroundColor: accent }}
          >
            Resume
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          {(config.crossCourseNav ?? []).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm transition-colors text-[10px] uppercase tracking-widest font-mono hover:bg-[color:var(--color-parch)]"
              style={{ color: 'var(--color-ink)', opacity: 0.6 }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
