'use client';

import { useState, useCallback } from 'react';

const KICKER: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

interface AccordionSectionProps {
  readonly title: string;
  readonly accentVar: string;
  readonly defaultOpen?: boolean;
  readonly children: React.ReactNode;
}

export function AccordionSection({
  title,
  accentVar,
  defaultOpen = false,
  children,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      <button
        type="button"
        onClick={toggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: open ? 'var(--cream)' : '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          transition: 'background .12s',
        }}
        aria-expanded={open}
      >
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--ink)',
            borderBottom: open ? `2px solid ${accentVar}` : 'none',
            paddingBottom: open ? 1 : 0,
            textAlign: 'left',
          }}
        >
          {title}
        </span>
        <span
          style={{ ...KICKER, color: accentVar, marginLeft: 16, flexShrink: 0 }}
          aria-hidden="true"
        >
          {open ? 'Close' : 'Open'}
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: 20,
            background: 'var(--cream)',
            borderTop: '1px solid var(--ink-a10)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
