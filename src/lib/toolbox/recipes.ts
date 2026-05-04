// src/lib/toolbox/recipes.ts
//
// Plan G — Task 3 server-side data access for the Cookbook. Reads the
// toolbox_recipes table seeded in 00021. Each recipe step pins to a specific
// toolbox_library_skill_versions.id so the rendered narrative never drifts
// from the prompt content it was authored against (decision #17).
//
// All functions use the service-role client. Callers (the recipe pages) are
// responsible for invoking getPaidToolboxAccess() before calling these helpers
// — the row-level RLS policy on toolbox_recipes is defense-in-depth, not the
// only gate.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface RecipeStepRow {
  readonly skill_slug: string;
  readonly skill_version_id: string;
  readonly narrative: string;
  readonly notes?: string | null;
}

export interface RecipeRow {
  readonly slug: string;
  readonly title: string;
  readonly overview: string;
  readonly pillar: 'A' | 'B' | 'C';
  readonly category: string;
  readonly steps: readonly RecipeStepRow[];
  readonly compliance_notes?: string | null;
}

export interface RecipeStep extends RecipeStepRow {
  readonly skillSnapshot: Record<string, unknown> | null;
}

export interface Recipe extends Omit<RecipeRow, 'steps'> {
  readonly steps: readonly RecipeStep[];
}

export async function getRecipes(): Promise<RecipeRow[]> {
  if (!isSupabaseConfigured()) return [];
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_recipes')
    .select('slug,title,overview,pillar,category,steps,compliance_notes')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as RecipeRow[];
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  if (!isSupabaseConfigured()) return null;
  const client = createServiceRoleClient();

  const { data: recipe, error: rErr } = await client
    .from('toolbox_recipes')
    .select('slug,title,overview,pillar,category,steps,compliance_notes')
    .eq('slug', slug)
    .single();
  if (rErr || !recipe) return null;

  const recipeRow = recipe as RecipeRow;
  const steps: RecipeStep[] = [];
  for (const step of recipeRow.steps) {
    const { data: ver, error: vErr } = await client
      .from('toolbox_library_skill_versions')
      .select('content')
      .eq('id', step.skill_version_id)
      .single();
    const snapshot =
      vErr || !ver
        ? null
        : ((ver as { content?: Record<string, unknown> }).content ?? null);
    steps.push({ ...step, skillSnapshot: snapshot });
  }

  return { ...recipeRow, steps };
}

export async function getRecipesUsingSkill(
  slug: string,
): Promise<Array<{ slug: string; title: string }>> {
  if (!isSupabaseConfigured()) return [];
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_recipes')
    .select('slug,title')
    .eq('published', true)
    .filter('steps', 'cs', JSON.stringify([{ skill_slug: slug }]));
  if (error || !data) return [];
  return data as Array<{ slug: string; title: string }>;
}
