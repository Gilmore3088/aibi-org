// ToolboxSummary — tile showing free-tier cap usage (4 max), or "unlimited"
// for paid identities. Renders a quiet link into the full Toolbox.

import Link from 'next/link';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { FREE_TIER_ARTIFACT_CAP } from '@/lib/addie/toolbox/items';

interface ToolboxSummaryProps {
  readonly count: number;
  readonly unlimited: boolean;
}

export function ToolboxSummary({ count, unlimited }: ToolboxSummaryProps) {
  return (
    <LedgerCard className="p-5">
      <KickerLabel tone="muted">Toolbox</KickerLabel>
      <p className="mt-2 font-serif text-3xl text-[var(--ledger-ink)] tabular-nums">
        {count}
        {unlimited ? null : (
          <span className="text-[var(--ledger-muted)]"> / {FREE_TIER_ARTIFACT_CAP}</span>
        )}
      </p>
      <p className="mt-1 text-sm text-[var(--ledger-muted)]">
        {unlimited ? 'Unlimited (paid)' : 'free-tier saves used'}
      </p>
      <Link
        href="/foundation/dashboard/toolbox"
        className="mt-3 inline-block font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-accent)] hover:underline"
      >
        Open Toolbox →
      </Link>
    </LedgerCard>
  );
}
