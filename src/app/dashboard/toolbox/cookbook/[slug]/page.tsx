// src/app/dashboard/toolbox/cookbook/[slug]/page.tsx
//
// Plan G — Task 5. SSR recipe detail page. Renders the recipe overview
// (with optional compliance callout) and ordered RecipeStep cards. The
// page-level concern unique to this route is resolving each step's
// library skill slug to a UUID so the per-step Save CTA can POST the
// concrete librarySkillId. We do this once with a single batched
// `.in('slug', […])` query rather than per-step round-trips.

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { getRecipeBySlug } from '@/lib/toolbox/recipes';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { RecipeStep } from '../_components/RecipeStep';
import { TrackRecipeView } from '../_components/TrackRecipeView';

interface PageProps {
  readonly params: { slug: string };
}

const PILLAR_LABEL: Record<'A' | 'B' | 'C', string> = {
  A: 'Accessible',
  B: 'Boundary-Safe',
  C: 'Capable',
};

const PILLAR_COLOR: Record<'A' | 'B' | 'C', string> = {
  A: 'var(--color-sage)',
  B: 'var(--color-cobalt)',
  C: 'var(--color-terra)',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

export default async function CookbookRecipePage({ params }: PageProps) {
  const access = await getPaidToolboxAccess();
  if (!access) redirect('/dashboard/toolbox?paywall=1');

  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) notFound();

  const uniqueSlugs = Array.from(new Set(recipe.steps.map((s) => s.skill_slug)));
  const slugToLibraryId = await resolveLibrarySkillIds(uniqueSlugs);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <TrackRecipeView slug={recipe.slug} />
      <header className="mb-10">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: PILLAR_COLOR[recipe.pillar] }}
            aria-label={`Pillar ${recipe.pillar} (${PILLAR_LABEL[recipe.pillar]})`}
          />
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Cookbook · {recipe.category}
          </p>
        </div>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">
          {recipe.title}
        </h1>
        <p className="mt-4 leading-relaxed text-[color:var(--color-slate)]">
          {recipe.overview}
        </p>
        {recipe.compliance_notes ? (
          <p className="mt-4 border-l-4 border-[color:var(--color-cobalt)] pl-4 text-sm text-[color:var(--color-slate)]">
            <strong>Compliance:</strong> {recipe.compliance_notes}
          </p>
        ) : null}
      </header>

      <ol className="space-y-12">
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
    </main>
  );
}
