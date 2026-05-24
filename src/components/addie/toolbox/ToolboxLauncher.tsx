'use client';

// ToolboxLauncher — the persistent button in AddieNav that opens
// ToolboxDrawer. Listens for a custom event 'addie:open-toolbox' so any
// component (Save-as-Artifact, gate copy, etc.) can also pop the drawer.
// Polls the items count on mount + after each close so the badge stays
// fresh without a heavy global store.

import { useCallback, useEffect, useState } from 'react';
import { ToolboxDrawer } from './ToolboxDrawer';

export function ToolboxLauncher() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/addie/toolbox/items', { cache: 'no-store' });
      if (!r.ok) {
        setCount(null);
        return;
      }
      const data = await r.json();
      setCount(Array.isArray(data.items) ? data.items.length : null);
    } catch {
      setCount(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('addie:open-toolbox', onOpen);
    return () => window.removeEventListener('addie:open-toolbox', onOpen);
  }, [refresh]);

  useEffect(() => {
    if (!open) refresh();
  }, [open, refresh]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="addie-chip inline-flex items-center gap-2 hover:border-[var(--ledger-ink)] hover:text-[var(--ledger-ink)] transition-colors duration-[120ms]"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="10" height="8" rx="1" />
          <path d="M5 4V3a2 2 0 0 1 4 0v1" />
          <line x1="2" y1="8" x2="12" y2="8" />
        </svg>
        Toolbox
        {count !== null && count > 0 ? (
          <span
            className="font-mono text-[0.65rem] text-[var(--ledger-accent)] tabular-nums"
            aria-label={`${count} saved artifacts`}
          >
            {count}
          </span>
        ) : null}
      </button>
      <ToolboxDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
