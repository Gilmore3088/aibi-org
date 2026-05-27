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

export const metadata: Metadata = {
  title: 'Cookbook · AiBI Toolbox',
  description:
    'Multi-step recipes that compose Library skills into end-to-end workflows for community bank teams.',
};

export default async function CookbookPage() {
  const access = await getPaidToolboxAccess();
  if (!access) redirect('/dashboard/toolbox?paywall=1');

  const recipes = await getRecipes();

  return (
    <main className="min-h-screen bg-[color:var(--cream)]">
      <div className="border-b border-[color:var(--ink-a10)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
              Toolbox · Cookbook
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight text-[color:var(--ink)] md:text-5xl">
              Cookbook
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-600)]">
              Multi-step recipes that chain Library skills into end-to-end
              workflows. Each step pins to the exact skill version it was
              authored against.
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
        {recipes.length === 0 ? (
          <div className="mt-12 rounded-[24px] border border-dashed border-[color:var(--ink-a15)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--slate-500)]">
              No published recipes yet
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[color:var(--ink)]">
              The Cookbook is being seeded.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[color:var(--slate-600)]">
              Recipes compose multiple Library skills into a workflow. Check
              back shortly, or browse the Library to fork individual skills
              today.
            </p>
            <Link
              href="/dashboard/toolbox/library"
              className="mt-6 inline-flex items-center rounded-[12px] border border-[color:var(--ink-a15)] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]"
            >
              BROWSE LIBRARY →
            </Link>
          </div>
        ) : (
          <ul className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/dashboard/toolbox/cookbook/${r.slug}`}
                  className="block h-full rounded-[24px] border border-[color:var(--ink-a15)] bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:border-[color:var(--ink)] hover:shadow-[var(--shadow-feature)]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
                    {r.category} · {r.steps.length} {r.steps.length === 1 ? 'step' : 'steps'}
                  </p>
                  <h2 className="mt-2 text-xl font-bold leading-snug text-[color:var(--ink)]">
                    {r.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[color:var(--slate-600)]">
                    {r.overview}
                  </p>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
                    OPEN RECIPE →
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
