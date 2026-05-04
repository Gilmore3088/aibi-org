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
  A: 'var(--color-sage)',
  B: 'var(--color-cobalt)',
  C: 'var(--color-terra)',
};

interface SearchParams {
  pillar?: string;
  category?: string;
  kind?: string;
}

const VALID_PILLARS: ReadonlyArray<ToolboxPillar> = ['A', 'B', 'C'];
const VALID_KINDS: ReadonlyArray<ToolboxKind> = ['workflow', 'template'];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getPaidToolboxAccess();
  if (!access) return <Paywall />;

  const sp = await searchParams;
  const pillar =
    sp.pillar && VALID_PILLARS.includes(sp.pillar as ToolboxPillar)
      ? (sp.pillar as ToolboxPillar)
      : undefined;
  const kind =
    sp.kind && VALID_KINDS.includes(sp.kind as ToolboxKind)
      ? (sp.kind as ToolboxKind)
      : undefined;
  const category = sp.category || undefined;

  const skills = await listLibrarySkills({ pillar, category, kind });

  const categories = Array.from(new Set(skills.map((s) => s.category))).sort();

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
              Toolbox · Library
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--color-ink)] md:text-5xl">
              Library
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">
              Starter skills harvested from the AiBI curriculum. Fork any skill into your personal Toolbox to edit and run.
            </p>
          </div>
          <Link
            href="/dashboard/toolbox"
            className="inline-flex w-fit items-center border border-[color:var(--color-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]"
          >
            Back to Toolbox
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <FilterBar pillar={pillar} category={category} kind={kind} categories={categories} />

        {skills.length === 0 ? (
          <p className="mt-12 text-sm text-[color:var(--color-slate)]">
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
                  className="block h-full border border-[color:var(--color-ink)]/15 bg-white p-5 transition-colors hover:border-[color:var(--color-terra)]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: PILLAR_COLOR[s.pillar] }}
                      aria-label={`Pillar ${s.pillar} (${PILLAR_LABEL[s.pillar]})`}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                      {s.category} · {s.complexity ?? 'intermediate'}
                    </span>
                  </div>
                  <h2 className="mt-2 font-serif text-xl text-[color:var(--color-ink)]">
                    {s.title}
                  </h2>
                  {s.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[color:var(--color-slate)]">
                      {s.description}
                    </p>
                  )}
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)]">
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
  pillar,
  category,
  kind,
  categories,
}: {
  pillar?: ToolboxPillar;
  category?: string;
  kind?: ToolboxKind;
  categories: string[];
}) {
  const baseClass =
    'border border-[color:var(--color-ink)]/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-terra)]';
  const activeClass =
    'border border-[color:var(--color-terra)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)]';

  const buildHref = (params: Partial<SearchParams>) => {
    const next = new URLSearchParams();
    const merged = { pillar, category, kind, ...params };
    if (merged.pillar) next.set('pillar', merged.pillar);
    if (merged.category) next.set('category', merged.category);
    if (merged.kind) next.set('kind', merged.kind);
    const qs = next.toString();
    return qs ? `?${qs}` : '/dashboard/toolbox/library';
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[color:var(--color-ink)]/10 pb-6">
      <FilterGroup label="Pillar">
        {(['A', 'B', 'C'] as const).map((p) => (
          <Link key={p} href={buildHref({ pillar: pillar === p ? undefined : p })} className={pillar === p ? activeClass : baseClass}>
            {PILLAR_LABEL[p]}
          </Link>
        ))}
      </FilterGroup>
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
      <span className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-slate)]">
        {label}
      </span>
      {children}
    </div>
  );
}
