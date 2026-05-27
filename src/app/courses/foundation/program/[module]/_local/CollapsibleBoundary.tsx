'use client';

// Banking Boundary as an accordion. Expanded by default on Module 1
// (first encounter); collapsed on subsequent modules so the safe-use
// frame doesn't read as boilerplate (audit §3, minor change).

import { useState, type ReactNode } from 'react';

interface Props {
  readonly defaultOpen: boolean;
  readonly children: ReactNode;
}

const MOCKUP_FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export function CollapsibleBoundary({ defaultOpen, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      style={{
        marginTop: 32,
        border: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
        borderRadius: 16,
        background: 'white',
        boxShadow: 'var(--shadow-soft)',
        fontFamily: MOCKUP_FONT,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '16px 22px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: MOCKUP_FONT,
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontFamily: MOCKUP_FONT,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
          }}
        >
          Safe-use boundary for this module
        </span>
        <span
          aria-hidden="true"
          style={{
            fontSize: 13,
            color: 'var(--slate-500)',
            fontWeight: 600,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: '4px 22px 22px' }}>{children}</div>
      )}
    </section>
  );
}
