// ToolboxItemView — full-page view of one artifact: title, versions, body.

import Link from 'next/link';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import type { ToolboxItem, ToolboxItemVersion } from '@/lib/addie/toolbox/items';

interface ToolboxItemViewProps {
  readonly item: ToolboxItem;
  readonly versions: ReadonlyArray<ToolboxItemVersion>;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ToolboxItemView({ item, versions }: ToolboxItemViewProps) {
  const latest = versions[0];
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-3">
        <Link
          href="/foundation/foundation/dashboard/toolbox"
          className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
        >
          ← Toolbox
        </Link>
      </nav>
      <header className="border-b border-[var(--ledger-rule)] pb-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <KickerLabel tone="muted">{item.type.replace(/_/g, ' ')}</KickerLabel>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ledger-ink)]">{item.title}</h1>
          <p className="mt-1 text-sm text-[var(--ledger-muted)]">
            Updated {fmtDate(item.updated_at)} · version {latest?.version ?? 1}
          </p>
        </div>
        <a href={`/api/addie/toolbox/items/${item.id}/export`} download>
          <LedgerButton variant="secondary" size="sm">Download .md</LedgerButton>
        </a>
      </header>
      <LedgerCard className="p-5">
        <article className="whitespace-pre-wrap font-serif text-[var(--ledger-ink)] text-base leading-relaxed">
          {latest?.body_md ?? '(no content)'}
        </article>
      </LedgerCard>
      {versions.length > 1 ? (
        <section className="mt-8">
          <KickerLabel tone="muted">Version history</KickerLabel>
          <ul className="mt-2 divide-y divide-[var(--ledger-rule)] border-y border-[var(--ledger-rule)]">
            {versions.map((v) => (
              <li key={v.id} className="py-2 flex items-center justify-between text-sm">
                <span className="font-mono">v{v.version}</span>
                <span className="text-[var(--ledger-muted)]">{fmtDate(v.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
