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
import type { ToolboxKind } from '@/lib/toolbox/types';

export const metadata: Metadata = {
  title: 'Toolbox Library | The AI Banking Institute',
  description:
    'Banker-vetted prompts and skills from the AiBI curriculum. Fork any one into your personal Toolbox to edit and run.',
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
    <main className="min-h-screen bg-[color:var(--cream)]">
      <div className="border-b border-[color:var(--ink-a10)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
              Toolbox · Library
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight text-[color:var(--ink)] md:text-5xl">
              Library
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-600)]">
              Banker-vetted prompts and skills. Fork any one into your personal
              Toolbox to edit and run against your own scenarios.
            </p>
          </div>
          <Link
            href="/dashboard/toolbox"
            className="inline-flex w-fit items-center rounded-[12px] border border-[color:var(--ink-a15)] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]"
          >
            BACK TO TOOLBOX
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <FilterBar category={category} kind={kind} categories={categories} />

        {skills.length === 0 ? (
          <p className="mt-12 text-sm text-[color:var(--slate-600)]">
            No skills match the current filters.{' '}
            <Link
              href="/dashboard/toolbox/library"
              className="font-semibold text-[color:var(--ink)] underline underline-offset-4 hover:text-[color:var(--gold-deep)]"
            >
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
                  className="block h-full rounded-[24px] border border-[color:var(--ink-a15)] bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:border-[color:var(--ink)] hover:shadow-[var(--shadow-feature)]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
                    {s.category} · {s.complexity ?? 'intermediate'}
                  </p>
                  <h2 className="mt-2 text-xl font-bold leading-snug text-[color:var(--ink)]">
                    {s.title}
                  </h2>
                  {s.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[color:var(--slate-600)]">
                      {s.description}
                    </p>
                  )}
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
                    OPEN →
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
    'rounded-[999px] border border-[color:var(--ink-a15)] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]';
  const activeClass =
    'rounded-[999px] border border-[color:var(--ink)] bg-[color:var(--ink)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white';

  const buildHref = (params: Partial<SearchParams>) => {
    const next = new URLSearchParams();
    const merged = { category, kind, ...params };
    if (merged.category) next.set('category', merged.category);
    if (merged.kind) next.set('kind', merged.kind);
    const qs = next.toString();
    return qs ? `?${qs}` : '/dashboard/toolbox/library';
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[color:var(--ink-a10)] pb-6">
      <FilterGroup label="Category">
        {categories.map((c) => (
          <Link
            key={c}
            href={buildHref({ category: category === c ? undefined : c })}
            className={category === c ? activeClass : baseClass}
          >
            {c}
          </Link>
        ))}
      </FilterGroup>
      <FilterGroup label="Kind">
        {(['workflow', 'template'] as const).map((k) => (
          <Link
            key={k}
            href={buildHref({ kind: kind === k ? undefined : k })}
            className={kind === k ? activeClass : baseClass}
          >
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
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--slate-500)]">
        {label}
      </span>
      {children}
    </div>
  );
}
