// src/lib/toolbox/recipes.test.ts
//
// Plan G — Task 3 tests for recipes.ts data access. Mocks the Supabase
// service-role client; the key correctness property under test is that
// getRecipeBySlug resolves step content from the pinned skill_version_id,
// not from the current-pointer on the library table.

import { describe, expect, it, vi, beforeEach } from 'vitest';

const fromMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

import { getRecipes, getRecipeBySlug, getRecipesUsingSkill } from './recipes';

beforeEach(() => {
  fromMock.mockReset();
});

describe('getRecipes', () => {
  it('returns published recipes ordered by created_at desc', async () => {
    const select = vi.fn().mockReturnThis();
    const eq = vi.fn().mockReturnThis();
    const order = vi.fn().mockResolvedValueOnce({
      data: [
        { slug: 'a', title: 'A', pillar: 'B', category: 'Ops', overview: 'o', steps: [], compliance_notes: null },
      ],
      error: null,
    });
    fromMock.mockReturnValueOnce({ select, eq, order });

    const list = await getRecipes();

    expect(list).toEqual([
      { slug: 'a', title: 'A', pillar: 'B', category: 'Ops', overview: 'o', steps: [], compliance_notes: null },
    ]);
    expect(fromMock).toHaveBeenCalledWith('toolbox_recipes');
    expect(eq).toHaveBeenCalledWith('published', true);
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('returns [] when supabase reports an error', async () => {
    const select = vi.fn().mockReturnThis();
    const eq = vi.fn().mockReturnThis();
    const order = vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    fromMock.mockReturnValueOnce({ select, eq, order });

    expect(await getRecipes()).toEqual([]);
  });
});

describe('getRecipeBySlug', () => {
  it('returns null for an unknown slug', async () => {
    const select = vi.fn().mockReturnThis();
    const eq = vi.fn().mockReturnThis();
    const single = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    fromMock.mockReturnValueOnce({ select, eq, single });

    expect(await getRecipeBySlug('does-not-exist')).toBeNull();
  });

  it('hydrates step content from the pinned version, not the current pointer', async () => {
    const recipe = {
      slug: 'r1',
      title: 'R1',
      overview: 'o',
      pillar: 'B',
      category: 'Ops',
      steps: [
        { skill_slug: 'classify', skill_version_id: 'v-old', narrative: 'narr', notes: null },
      ],
      compliance_notes: null,
    };
    const recipeQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: recipe, error: null }),
    };
    const versionQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: { content: { kind: 'workflow', name: 'Classify v1 (old)' } },
        error: null,
      }),
    };

    fromMock.mockReturnValueOnce(recipeQuery).mockReturnValueOnce(versionQuery);

    const out = await getRecipeBySlug('r1');

    expect(out?.steps[0].skillSnapshot).toEqual({ kind: 'workflow', name: 'Classify v1 (old)' });
    expect(versionQuery.eq).toHaveBeenCalledWith('id', 'v-old');
    expect(fromMock).toHaveBeenNthCalledWith(1, 'toolbox_recipes');
    expect(fromMock).toHaveBeenNthCalledWith(2, 'toolbox_library_skill_versions');
  });

  it('returns step with null skillSnapshot when version lookup fails', async () => {
    const recipe = {
      slug: 'r1',
      title: 'R1',
      overview: 'o',
      pillar: 'B',
      category: 'Ops',
      steps: [
        { skill_slug: 'classify', skill_version_id: 'v-missing', narrative: 'narr', notes: null },
      ],
      compliance_notes: null,
    };
    const recipeQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: recipe, error: null }),
    };
    const versionQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'not found' } }),
    };

    fromMock.mockReturnValueOnce(recipeQuery).mockReturnValueOnce(versionQuery);

    const out = await getRecipeBySlug('r1');

    expect(out?.steps[0].skillSnapshot).toBeNull();
  });
});

describe('getRecipesUsingSkill', () => {
  it('returns rows when the chained query resolves with data', async () => {
    const select = vi.fn().mockReturnThis();
    const eq = vi.fn().mockReturnThis();
    const filter = vi.fn().mockResolvedValueOnce({
      data: [
        { slug: 'recipe-a', title: 'Recipe A' },
        { slug: 'recipe-b', title: 'Recipe B' },
      ],
      error: null,
    });
    fromMock.mockReturnValueOnce({ select, eq, filter });

    const list = await getRecipesUsingSkill('classify');

    expect(list).toEqual([
      { slug: 'recipe-a', title: 'Recipe A' },
      { slug: 'recipe-b', title: 'Recipe B' },
    ]);
    expect(fromMock).toHaveBeenCalledWith('toolbox_recipes');
    expect(eq).toHaveBeenCalledWith('published', true);
    expect(filter).toHaveBeenCalledWith(
      'steps',
      'cs',
      JSON.stringify([{ skill_slug: 'classify' }]),
    );
  });
});
