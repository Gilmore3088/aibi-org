// src/app/dashboard/toolbox/cookbook/page.tsx
//
// Plan G — Task 4. SSR recipe index for the Cookbook. Lists published
// recipes from toolbox_recipes as cards. Empty state renders cleanly when
// the table is empty or the migration has not been applied yet.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { getRecipes } from '@/lib/toolbox/recipes';
import type { RecipeRow } from '@/lib/toolbox/recipes';

export const metadata: Metadata = {
  title: 'Cookbook · AiBI Toolbox',
  description:
    'Multi-step recipes that compose Library skills into end-to-end workflows for community bank teams.',
};

const PILLAR_LABEL: Record<RecipeRow['pillar'], string> = {
  A: 'Accessible',
  B: 'Boundary-Safe',
  C: 'Capable',
};

const PILLAR_COLOR: Record<RecipeRow['pillar'], string> = {
  A: 'var(--ledger-accent)',
  B: 'var(--ledger-accent-2)',
  C: 'var(--ledger-accent)',
};

export default async function CookbookPage() {
  const access = await getPaidToolboxAccess();
  if (!access) redirect('/dashboard/toolbox?paywall=1');

  const recipes = await getRecipes();

  return (
    <main className="min-h-screen bg-[color:var(--ledger-bg)]">
      <div className="border-b border-[color:var(--ledger-ink)]/10 bg-[color:var(--ledger-paper)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--ledger-accent)]">
              Toolbox · Cookbook
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--ledger-ink)] md:text-5xl">
              Cookbook
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--ledger-muted)]">
              Multi-step recipes that chain Library skills into end-to-end workflows. Each
              step pins to the exact skill version it was authored against.
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
        {recipes.length === 0 ? (
          <div className="mt-12 border border-dashed border-[color:var(--ledger-ink)]/20 bg-white p-10 text-center">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--ledger-muted)]">
              No published recipes yet
            </p>
            <h2 className="mt-3 font-serif text-2xl text-[color:var(--ledger-ink)]">
              The Cookbook is being seeded.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[color:var(--ledger-muted)]">
              Recipes compose multiple Library skills into a workflow. Check back shortly,
              or browse the Library to fork individual skills today.
            </p>
            <Link
              href="/dashboard/toolbox/library"
              className="mt-6 inline-flex items-center border border-[color:var(--ledger-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-ink)] transition-colors hover:border-[color:var(--ledger-accent)] hover:text-[color:var(--ledger-accent)]"
            >
              Browse Library →
            </Link>
          </div>
        ) : (
          <ul className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/dashboard/toolbox/cookbook/${r.slug}`}
                  className="block h-full border border-[color:var(--ledger-ink)]/15 bg-white p-5 transition-colors hover:border-[color:var(--ledger-accent)]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: PILLAR_COLOR[r.pillar] }}
                      aria-label={`Pillar ${r.pillar} (${PILLAR_LABEL[r.pillar]})`}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-muted)]">
                      {r.category} · {r.steps.length} {r.steps.length === 1 ? 'step' : 'steps'}
                    </span>
                  </div>
                  <h2 className="mt-2 font-serif text-xl text-[color:var(--ledger-ink)]">
                    {r.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[color:var(--ledger-muted)]">
                    {r.overview}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-accent)]">
                    Open Recipe →
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
