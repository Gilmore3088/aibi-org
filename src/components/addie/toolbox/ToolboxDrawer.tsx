'use client';

// ToolboxDrawer — slide-in right-side sheet listing the learner's artifacts.
// Opened from a button rendered by the page shell.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { ToolboxItemCard } from './ToolboxItemCard';
import type { ToolboxItem } from '@/lib/addie/toolbox/items';

interface ToolboxDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function ToolboxDrawer({ open, onClose }: ToolboxDrawerProps) {
  const [items, setItems] = useState<ToolboxItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    fetch('/api/addie/toolbox/items')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setItems((data.items as ToolboxItem[]) ?? []);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'unknown'));
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Toolbox"
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="Close toolbox"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--ledger-ink)] opacity-40"
      />
      <aside className="absolute right-0 top-0 h-full w-full md:w-[380px] bg-[var(--ledger-paper)] border-l border-[var(--ledger-rule)] flex flex-col">
        <header className="flex items-center justify-between border-b border-[var(--ledger-rule)] px-4 py-3">
          <div className="flex items-center gap-3">
            <KickerLabel tone="ink">Toolbox</KickerLabel>
            {items ? (
              <span className="font-mono text-[0.7rem] text-[var(--ledger-muted)]">
                {items.length}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-ink)] hover:underline"
          >
            Close
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error ? (
            <p role="alert" className="text-sm text-[var(--ledger-weak)]">{error}</p>
          ) : null}
          {!items ? (
            <p className="text-sm text-[var(--ledger-muted)]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--ledger-muted)]">
              You haven&apos;t saved anything yet. Every lesson produces something — that&apos;s the
              Toolbox.
            </p>
          ) : (
            items.map((it) => <ToolboxItemCard key={it.id} item={it} />)
          )}
        </div>
        <footer className="border-t border-[var(--ledger-rule)] p-3">
          <Link href="/foundation/dashboard/toolbox" onClick={onClose}>
            <LedgerButton variant="secondary" size="sm" className="w-full">
              Open full Toolbox
            </LedgerButton>
          </Link>
        </footer>
      </aside>
    </div>
  );
}
