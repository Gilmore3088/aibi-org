'use client';

// ToolboxVersionHistory — collapsible panel showing the last N versions of
// an artifact. "Restore" PATCHes the chosen body back as a new version,
// preserving the audit trail (we never destroy history).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import type { ToolboxItemVersion } from '@/lib/addie/toolbox/items';

interface ToolboxVersionHistoryProps {
  readonly itemId: string;
  readonly versions: ReadonlyArray<ToolboxItemVersion>;
  readonly currentVersion: number;
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ToolboxVersionHistory({
  itemId,
  versions,
  currentVersion,
}: ToolboxVersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function restore(v: ToolboxItemVersion) {
    if (pendingVersion !== null) return;
    setPendingVersion(v.version);
    setError(null);
    try {
      const res = await fetch(`/api/addie/toolbox/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body_md: v.body_md }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setPendingVersion(null);
    }
  }

  if (versions.length === 0) {
    return (
      <section className="mt-8">
        <KickerLabel tone="muted">Version history</KickerLabel>
        <p className="mt-2 text-sm text-[var(--ledger-muted)]">
          No prior versions yet. Edit this artifact and a new version is recorded each save.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8" data-testid="version-history">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between border-b border-[var(--ledger-rule)] pb-2 min-h-[44px]"
      >
        <KickerLabel tone="muted">Version history &middot; {versions.length}</KickerLabel>
        <span className="font-mono text-[0.7rem] text-[var(--ledger-muted)]">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>
      {open ? (
        <ul className="mt-3 divide-y divide-[var(--ledger-rule)]">
          {versions.map((v) => (
            <li
              key={v.id}
              className="py-3 flex items-center justify-between gap-3 text-sm"
              data-testid="version-row"
            >
              <div className="min-w-0">
                <p className="font-mono text-[0.75rem] text-[var(--ledger-ink)] tabular-nums">
                  v{v.version}
                  {v.version === currentVersion ? (
                    <span className="ml-2 font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent)]">
                      Current
                    </span>
                  ) : null}
                </p>
                <p className="text-[var(--ledger-muted)] text-xs">{fmtDateTime(v.created_at)}</p>
              </div>
              {v.version === currentVersion ? null : (
                <LedgerButton
                  variant="tertiary"
                  size="sm"
                  onClick={() => restore(v)}
                  disabled={pendingVersion !== null}
                  loading={pendingVersion === v.version}
                >
                  Restore
                </LedgerButton>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[var(--ledger-weak)]">
          Restore failed: {error}
        </p>
      ) : null}
    </section>
  );
}
