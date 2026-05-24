'use client';

// ToolboxDrawer — slide-in right-side sheet listing the learner's artifacts.
// Renders one of five states (PRD §3.6):
//   - empty                : signed-in, no saves yet
//   - with-items           : 1–2 saves, below approaching threshold
//   - approaching-cap      : free tier, count === cap - 1 (warning rail)
//   - cap-reached          : free tier, count >= cap (gate-fork upsell)
//   - paid-unlimited       : entitlement holder; no quota copy
// State is driven by GET /api/addie/toolbox/state, items list via the
// existing items route.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { ToolboxItemCard } from './ToolboxItemCard';
import type { ToolboxItem } from '@/lib/addie/toolbox/items';
import type { ToolboxState } from '@/app/api/addie/toolbox/state/route';

interface ToolboxDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; items: ToolboxItem[]; quota: ToolboxState }
  | { kind: 'error'; message: string };

type Variant = 'empty' | 'with-items' | 'approaching-cap' | 'cap-reached' | 'paid-unlimited';

function deriveVariant(items: ReadonlyArray<ToolboxItem>, quota: ToolboxState): Variant {
  if (quota.isPaid) return 'paid-unlimited';
  if (items.length === 0) return 'empty';
  if (quota.count >= quota.cap) return 'cap-reached';
  if (quota.count >= quota.cap - 1) return 'approaching-cap';
  return 'with-items';
}

export function ToolboxDrawer({ open, onClose }: ToolboxDrawerProps) {
  const [load, setLoad] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoad({ kind: 'loading' });
    Promise.all([
      fetch('/api/addie/toolbox/items', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/addie/toolbox/state', { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([itemsRes, quotaRes]: [{ items?: ToolboxItem[] }, ToolboxState]) => {
        if (cancelled) return;
        setLoad({
          kind: 'ready',
          items: itemsRes.items ?? [],
          quota: quotaRes,
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLoad({ kind: 'error', message: e instanceof Error ? e.message : 'unknown' });
      });
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

  const ready = load.kind === 'ready' ? load : null;
  const variant: Variant | null = ready ? deriveVariant(ready.items, ready.quota) : null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Toolbox" className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close toolbox"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--ledger-ink)] opacity-40"
      />
      <aside className="absolute right-0 top-0 h-full w-full md:w-[420px] bg-[var(--ledger-paper)] border-l border-[var(--ledger-rule)] flex flex-col">
        <header className="flex items-center justify-between border-b border-[var(--ledger-rule)] px-4 py-3">
          <div className="flex items-center gap-3">
            <KickerLabel tone="ink">Toolbox</KickerLabel>
            {ready ? (
              <span
                className="font-mono text-[0.7rem] text-[var(--ledger-muted)] tabular-nums"
                data-testid="toolbox-quota"
              >
                {ready.quota.isPaid
                  ? 'unlimited'
                  : `${ready.quota.count} / ${ready.quota.cap}`}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-ink)] hover:underline min-h-[44px] px-2"
          >
            Close
          </button>
        </header>

        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          data-testid="toolbox-variant"
          data-variant={variant ?? 'loading'}
        >
          {load.kind === 'loading' ? (
            <p className="text-sm text-[var(--ledger-muted)]">Loading…</p>
          ) : load.kind === 'error' ? (
            <p role="alert" className="text-sm text-[var(--ledger-weak)]">
              {load.message}
            </p>
          ) : variant === 'empty' ? (
            <EmptyState />
          ) : variant === 'cap-reached' ? (
            <>
              <CapReachedBanner />
              {ready!.items.map((it) => (
                <ToolboxItemCard key={it.id} item={it} />
              ))}
            </>
          ) : (
            <>
              {variant === 'approaching-cap' ? (
                <ApproachingCapBanner count={ready!.quota.count} cap={ready!.quota.cap} />
              ) : null}
              {variant === 'paid-unlimited' && ready!.items.length === 0 ? (
                <p className="text-sm text-[var(--ledger-muted)]">
                  Nothing saved yet. Finish a lesson to drop your first artifact here.
                </p>
              ) : null}
              {ready!.items.map((it) => (
                <ToolboxItemCard key={it.id} item={it} />
              ))}
            </>
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

function EmptyState() {
  return (
    <div className="border-l-[2px] border-l-[var(--ledger-rule-strong)] px-3 py-3">
      <p className="text-sm text-[var(--ledger-ink)]">Nothing saved yet.</p>
      <p className="mt-1 text-sm text-[var(--ledger-muted)]">
        Every lesson ends with something worth keeping. When you finish one, save the
        artifact and it appears here.
      </p>
    </div>
  );
}

function ApproachingCapBanner({ count, cap }: { count: number; cap: number }) {
  return (
    <div
      data-testid="toolbox-banner"
      data-tone="warning"
      className="border-l-[2px] border-l-[var(--ledger-accent)] bg-[var(--ledger-tape)] px-3 py-2"
    >
      <p className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-accent)]">
        {count} of {cap} free saves used
      </p>
      <p className="mt-1 text-sm text-[var(--ledger-ink)]">
        One save left on the free tier. The next one will ask you to keep going on the
        paid course, save by email, or take the $99 Readiness Assessment.
      </p>
    </div>
  );
}

function CapReachedBanner() {
  return (
    <div
      data-testid="toolbox-banner"
      data-tone="cap"
      className="border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] rounded-[3px] p-4 space-y-3"
    >
      <div>
        <KickerLabel tone="accent">Free saves used</KickerLabel>
        <p className="mt-2 text-sm text-[var(--ledger-ink)]">
          You have saved the four free artifacts. The artifacts you already saved stay
          here. To save more, pick a path.
        </p>
      </div>
      <div className="grid gap-2">
        <Link href="/foundation/gate" className="block">
          <LedgerButton variant="primary" size="sm" className="w-full">
            Pay $295 · continue
          </LedgerButton>
        </Link>
        <Link href="/foundation/gate#email" className="block">
          <LedgerButton variant="secondary" size="sm" className="w-full">
            Email to keep more
          </LedgerButton>
        </Link>
        <Link href="/foundation/gate#assessment" className="block">
          <LedgerButton variant="tertiary" size="sm" className="w-full">
            Take the $99 assessment
          </LedgerButton>
        </Link>
      </div>
    </div>
  );
}
