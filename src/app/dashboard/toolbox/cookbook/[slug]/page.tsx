// src/app/dashboard/toolbox/cookbook/[slug]/page.tsx
//
// Plan G — Task 5. SSR recipe detail page. Renders the recipe overview
// (with optional compliance callout) and ordered RecipeStep cards. The
// page-level concern unique to this route is resolving each step's
// library skill slug to a UUID so the per-step Save CTA can POST the
// concrete librarySkillId. We do this once with a single batched
// `.in('slug', […])` query rather than per-step round-trips.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { getRecipeBySlug } from '@/lib/toolbox/recipes';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { RecipeStep } from '../_components/RecipeStep';
import { TrackRecipeView } from '../_components/TrackRecipeView';

interface PageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const recipe = await getRecipeBySlug(params.slug);
  return {
    title: recipe ? `${recipe.title} · Cookbook` : 'Recipe not found · Cookbook',
  };
}

async function resolveLibrarySkillIds(
  slugs: readonly string[],
): Promise<Record<string, string>> {
  if (!isSupabaseConfigured() || slugs.length === 0) return {};
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_library_skills')
    .select('id,slug')
    .in('slug', slugs as string[]);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const row of data as Array<{ id: string; slug: string }>) {
    map[row.slug] = row.id;
  }
  return map;
}

export default async function CookbookRecipePage(props: PageProps) {
  const params = await props.params;
  const access = await getPaidToolboxAccess();
  if (!access) redirect('/dashboard/toolbox?paywall=1');

  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) notFound();

  const uniqueSlugs = Array.from(new Set(recipe.steps.map((s) => s.skill_slug)));
  const slugToLibraryId = await resolveLibrarySkillIds(uniqueSlugs);

  return (
    <main className="min-h-screen bg-[color:var(--cream)]">
      <TrackRecipeView slug={recipe.slug} />
      <div className="border-b border-[color:var(--ink-a10)] bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
          <Link
            href="/dashboard/toolbox/cookbook"
            className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
          >
            ← BACK TO COOKBOOK
          </Link>
          <p className="mt-4 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            Cookbook · {recipe.category}
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-[color:var(--ink)] md:text-5xl">
            {recipe.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[color:var(--slate-600)]">
            {recipe.overview}
          </p>
          {recipe.compliance_notes ? (
            <p className="mt-5 rounded-[12px] border-l-4 border-[color:var(--gold)] bg-[color:var(--cream-2)] py-3 pl-4 pr-4 text-sm text-[color:var(--slate-600)]">
              <strong className="font-semibold text-[color:var(--ink)]">Compliance:</strong>{' '}
              {recipe.compliance_notes}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
        <ol className="space-y-8">
          {recipe.steps.map((step, idx) => (
            <li key={`${step.skill_slug}-${idx}`}>
              <RecipeStep
                index={idx + 1}
                recipeSlug={recipe.slug}
                step={step}
                librarySkillId={slugToLibraryId[step.skill_slug]}
              />
            </li>
          ))}
        </ol>

        <section className="mt-12 rounded-[24px] border border-[color:var(--ink-a15)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            Next
          </p>
          <h2 className="mt-2 text-xl font-bold leading-snug text-[color:var(--ink)]">
            Saved the steps you need? Put them to work.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--slate-600)]">
            The skills you save from this recipe land in your Toolbox, ready to run
            against your own scenarios.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <Link
              href="/dashboard/toolbox"
              className="inline-flex items-center rounded-[12px] bg-[color:var(--ink)] px-5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[1.2px] text-white transition-colors hover:bg-[color:var(--ink-2)]"
            >
              OPEN MY TOOLBOX →
            </Link>
            <Link
              href="/dashboard/toolbox/cookbook"
              className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
            >
              BACK TO COOKBOOK
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
