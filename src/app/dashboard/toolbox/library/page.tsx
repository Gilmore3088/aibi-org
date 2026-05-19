// src/app/dashboard/toolbox/library/page.tsx
//
// Plan C — Library browse page. SSR. Lists all published Library Skills with
// optional filter UI (rendered as a small client island via search params,
// kept simple in v1).

import type { Metadata } from 'next';
import Link from 'next/link';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { listLibrarySkills } from '@/lib/toolbox/library';
import { Paywall } from '../_components/Paywall';
import type { ToolboxKind, ToolboxPillar } from '@/lib/toolbox/types';

export const metadata: Metadata = {
  title: 'Toolbox Library | The AI Banking Institute',
  description:
    'Starter banking AI skills harvested from the AiBI curriculum. Fork any skill into your personal Toolbox to edit and run.',
};

const PILLAR_LABEL: Record<ToolboxPillar, string> = { A: 'Accessible', B: 'Boundary-Safe', C: 'Capable' };
const PILLAR_COLOR: Record<ToolboxPillar, string> = {
  A: 'var(--ledger-accent)',
  B: 'var(--ledger-accent-2)',
  C: 'var(--ledger-accent)',
};

interface SearchParams {
  category?: string;
  kind?: string;
}

const VALID_KINDS: ReadonlyArray<ToolboxKind> = ['workflow', 'template'];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getPaidToolboxAccess();
  if (!access) return <Paywall />;

  const sp = await searchParams;
  const kind =
    sp.kind && VALID_KINDS.includes(sp.kind as ToolboxKind)
      ? (sp.kind as ToolboxKind)
      : undefined;
  const category = sp.category || undefined;

  const skills = await listLibrarySkills({ category, kind });

  const categories = Array.from(new Set(skills.map((s) => s.category))).sort();

  return (
    <main className="min-h-screen bg-[color:var(--ledger-bg)]">
      <div className="border-b border-[color:var(--ledger-ink)]/10 bg-[color:var(--ledger-paper)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--ledger-accent)]">
              Toolbox · Library
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--ledger-ink)] md:text-5xl">
              Library
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--ledger-muted)]">
              Starter skills harvested from the AiBI curriculum. Fork any skill into your personal Toolbox to edit and run.
            </p>
          </div>
          <Link
            href="/dashboard/toolbox"
            className="inline-flex w-fit items-center border border-[color:var(--ledger-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-ink)] transition-colors hover:border-[color:var(--ledger-accent)] hover:text-[color:var(--ledger-accent)]"
          >
            Back to Toolbox
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <FilterBar category={category} kind={kind} categories={categories} />

        {skills.length === 0 ? (
          <p className="mt-12 text-sm text-[color:var(--ledger-muted)]">
            No skills match the current filters.{' '}
            <Link href="/dashboard/toolbox/library" className="underline">
              Clear filters
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/toolbox/library/${s.slug}`}
                  className="block h-full border border-[color:var(--ledger-ink)]/15 bg-white p-5 transition-colors hover:border-[color:var(--ledger-accent)]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: PILLAR_COLOR[s.pillar] }}
                      aria-label={`Pillar ${s.pillar} (${PILLAR_LABEL[s.pillar]})`}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-muted)]">
                      {s.category} · {s.complexity ?? 'intermediate'}
                    </span>
                  </div>
                  <h2 className="mt-2 font-serif text-xl text-[color:var(--ledger-ink)]">
                    {s.title}
                  </h2>
                  {s.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[color:var(--ledger-muted)]">
                      {s.description}
                    </p>
                  )}
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-accent)]">
                    Open →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function FilterBar({
  category,
  kind,
  categories,
}: {
  category?: string;
  kind?: ToolboxKind;
  categories: string[];
}) {
  const baseClass =
    'border border-[color:var(--ledger-ink)]/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-ink)] transition-colors hover:border-[color:var(--ledger-accent)]';
  const activeClass =
    'border border-[color:var(--ledger-accent)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-accent)]';

  const buildHref = (params: Partial<SearchParams>) => {
    const next = new URLSearchParams();
    const merged = { category, kind, ...params };
    if (merged.category) next.set('category', merged.category);
    if (merged.kind) next.set('kind', merged.kind);
    const qs = next.toString();
    return qs ? `?${qs}` : '/dashboard/toolbox/library';
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[color:var(--ledger-ink)]/10 pb-6">
      <FilterGroup label="Category">
        {categories.map((c) => (
          <Link key={c} href={buildHref({ category: category === c ? undefined : c })} className={category === c ? activeClass : baseClass}>
            {c}
          </Link>
        ))}
      </FilterGroup>
      <FilterGroup label="Kind">
        {(['workflow', 'template'] as const).map((k) => (
          <Link key={k} href={buildHref({ kind: kind === k ? undefined : k })} className={kind === k ? activeClass : baseClass}>
            {k}
          </Link>
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--ledger-muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}
