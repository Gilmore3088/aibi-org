# AiBI Toolbox — Plan G: Cookbook

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Cookbook surface at `/dashboard/toolbox/cookbook` per spec §5.4 — a curated set of 5–8 narrative recipes that each chain 3–4 Library Skills into an end-to-end workflow, with version-pinned step references so a recipe's narrative never drifts from the prompts it teaches.

**Architecture:** Three layers:

1. **Data.** New migration `00021_toolbox_recipes.sql` creates the `toolbox_recipes` table per spec §7.3, including a JSONB `steps` array where each step pins to a specific `toolbox_library_skills` slug + `toolbox_library_skill_versions.id`. RLS uses the `has_toolbox_access(uuid)` SQL function from Plan C migration 00019. A small seed loader hydrates 1 reference recipe at migration time so the surface is non-empty for QA; the remaining recipes land via the content track per spec §11.
2. **Routes.** New SSR routes `/dashboard/toolbox/cookbook` (recipe index with filters) and `/dashboard/toolbox/cookbook/[slug]` (recipe detail with narrative, per-step Skill version snapshots, and "Save to Toolbox" CTAs that reuse Plan F's `/api/toolbox/save` endpoint with `origin: 'library'`). The existing **misnamed** "Cookbook" tab inside `ToolboxApp.tsx` (which currently renders the *template library*, not the spec's Cookbook) is renamed to "Library" in Task 1 to free up the term — see Task 1 for the user-confirmation step.
3. **Cross-links.** Each Library Skill detail page gains a "Used in recipes:" footer that lists recipes referencing it. Each My Toolbox skill row that was saved from a recipe step shows a "Recipe: <slug>" backlink (uses `source_ref: cookbook:<slug>#step-<n>` written by the Save flow). The dashboard sidebar gains a "Cookbook" link.

**Tech Stack:** Next.js 14 App Router · TypeScript strict · Supabase migrations · existing `lib/toolbox/types.ts` · existing `/api/toolbox/save` from Plan F · existing `has_toolbox_access` SQL function from Plan C · Plausible deferred-call pattern.

---

## Plan context

### What shipped earlier

- **Plans A0/B/C/D/E/F.** Notable for Plan G:
  - **Plan C** created `toolbox_library_skills` + `toolbox_library_skill_versions` and the `has_toolbox_access(uuid)` SQL function. Plan G's recipe table reuses both: it foreign-keys to library skills via `slug` (not `id`, because slugs are stable across version edits) and reuses `has_toolbox_access` in the RLS policy.
  - **Plan F** built `/api/toolbox/save` with three origins (`course`, `playground`, `library`). Plan G adds a fourth conceptual origin — saving from a recipe step — but reuses `origin: 'library'` because each recipe step is a thin wrapper around a Library Skill version. The mapper writes `source_ref: cookbook:<recipe-slug>#step-<n>` so the My Toolbox backlink can resolve to either the library entry (Plan F path) OR the recipe (Plan G addition).

### Naming collision to resolve

The existing `ToolboxApp.tsx` has a tab labelled **"Cookbook"** that renders the **template library** (15 starter Skills). The spec's Cookbook is a *different* surface — narrative recipes that chain Skills. Plan G keeps the spec's terminology: the recipe surface is the Cookbook, and the existing tab is renamed. **Task 1 confirms the rename with the user before any code changes** (because copy on a learner-visible tab is the kind of change that needs human sign-off).

### What this plan does NOT do

- **Authoring 5–8 polished launch recipes** — content track per spec §11. Plan G ships migration + surface + 1 reference recipe to validate the shape end-to-end. The remaining 4–7 recipes land via the content track and a separate authoring loop.
- **Recipe authoring UI** — recipes are authored in JSON/YAML in the codebase or via direct DB insert at v1. A web authoring UI is out of scope.
- **Multi-step orchestration** (auto-piping the output of step N as the input to step N+1 in the Playground). Each recipe step is currently a standalone Skill the learner runs themselves; orchestrated runs are Phase 2.
- **Compare Mode within a recipe** — Phase 2.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Create | `supabase/migrations/00021_toolbox_recipes.sql` | DDL for `toolbox_recipes`. RLS policy via `has_toolbox_access`. Index on `slug`. Seeds one reference recipe so QA can exercise the surface. |
| Create | `src/content/toolbox/recipes.ts` | TypeScript-typed catalog of recipes for the seed loader and for any in-process render-time reads. Single source of truth for the reference recipe content. |
| Create | `src/lib/toolbox/recipes.ts` | Server-side helpers: `getRecipes()`, `getRecipeBySlug()`. Queries `toolbox_recipes` joined to library skills + versions. Returns a fully-hydrated `RecipeWithSteps` shape. |
| Create | `src/lib/toolbox/recipes.test.ts` | Mocked Supabase. Asserts `getRecipeBySlug` resolves step skill snapshots from the pinned `version_id`, not from the current-pointer. |
| Create | `src/app/dashboard/toolbox/cookbook/page.tsx` | SSR. Recipe index with filters by pillar + category. Each card links to `/dashboard/toolbox/cookbook/[slug]`. |
| Create | `src/app/dashboard/toolbox/cookbook/[slug]/page.tsx` | SSR. Recipe detail: overview, then ordered steps. Each step renders a `RecipeStep` component. |
| Create | `src/app/dashboard/toolbox/cookbook/_components/RecipeStep.tsx` | Renders one step: narrative paragraph, Skill snapshot (system prompt + user template OR workflow definition, kind-aware), compliance notes, and a "Save this Skill to my Toolbox" button wired to `/api/toolbox/save` with `origin: 'library'` + step-level source_ref override. |
| Create | `src/app/dashboard/toolbox/cookbook/_components/RecipeStep.test.tsx` | Asserts kind-aware rendering and the save button click → POST shape. |
| Modify | `src/app/dashboard/toolbox/ToolboxApp.tsx` | (a) Rename the existing `cookbook` tab to `library` (after Task 1 user confirmation). (b) Add a new "Cookbook" link in the toolbox header pointing to `/dashboard/toolbox/cookbook`. |
| Modify | `src/lib/toolbox/save-mappers.ts` (from Plan F) | Allow the `library` origin payload to include an optional `recipeSourceRef` string. When present, it overrides the default `library:<id>@<version>` source_ref, so saves from a recipe step record `cookbook:<slug>#step-<n>` instead. |
| Modify | `src/app/api/toolbox/save/route.ts` (from Plan F) | Pass through the optional `recipeSourceRef` from the request body. |
| Modify | `src/app/dashboard/toolbox/ToolboxApp.tsx` (My Toolbox tab `<SourceBacklink>` from Plan F) | Recognize `source_ref: 'cookbook:<slug>#step-<n>'` and render a "Recipe: <slug>" link. |
| Modify | The Library detail page (`src/app/dashboard/toolbox/library/[slug]/page.tsx`) | Render a "Used in recipes:" footer listing recipes that reference this slug. Server-side query at render time. |

---

## Tasks

### Task 1: Naming decision (locked)

**Decision (locked 2026-05-04):**

- The existing tab labelled **"Cookbook"** (which renders the template library) is renamed to **"Library"**. Matches the spec's terminology and matches the new `/dashboard/toolbox/library` route family that already exists from Plan C.
- The new recipes surface lives at **`/dashboard/toolbox/cookbook`** per spec §5.4.
- The internal tab id `'cookbook'` is renamed to `'library'`. The URL slug `?tab=cookbook` is switched to `?tab=library` **immediately** (no transitional sprint). A 301-style redirect (Next.js `redirect()` server-side, or a small client-side fallback in `ToolboxApp.tsx` that maps the legacy query param to the new one) handles any in-the-wild course-module links that still point at `?tab=cookbook` — see Task 9 Step 1.

Apply per Task 9. No further confirmation needed.

---

### Task 2: Migration 00021 — `toolbox_recipes` table + RLS + seed

**Files:**
- Create: `supabase/migrations/00021_toolbox_recipes.sql`

Per spec §7.3 DDL plus decision #17 (recipe steps pin to `skill_version_id`, not just slug). Per CLAUDE.md performance pattern, wrap `auth.uid()` in `(select auth.uid())` and index policy columns. RLS reuses `has_toolbox_access(uuid)` from Plan C migration 00019.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/00021_toolbox_recipes.sql

-- Cookbook recipes per spec §5.4. Each recipe chains 3–4 Library Skills.
-- Step references pin to a specific library skill version so narrative
-- never drifts from the prompt content. (Decision #17.)

create table if not exists toolbox_recipes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  overview text not null,
  steps jsonb not null,                       -- [{ skill_slug, skill_version_id, narrative, notes? }, ...]
  pillar char(1) not null check (pillar in ('A','B','C')),
  category text not null,
  compliance_notes text,
  published boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_toolbox_recipes_slug on toolbox_recipes (slug);
create index if not exists idx_toolbox_recipes_published on toolbox_recipes (published) where published = true;

alter table toolbox_recipes enable row level security;

-- Read requires authenticated user AND active Toolbox entitlement.
-- has_toolbox_access(uuid) was created in 00019 (Plan C).
create policy "Read recipes for entitled users" on toolbox_recipes
  for select
  using (has_toolbox_access((select auth.uid())) and published = true);

-- No insert/update/delete from authenticated clients in v1.
-- Recipe authoring lands via service-role + migrations (or direct DB insert).
-- Service role bypasses RLS, so no explicit policy needed for it.

-- ---------------------------------------------------------------
-- Seed a single reference recipe so QA can exercise the surface.
-- Real launch content (4–7 more recipes) lands via the content
-- track per spec §11.
-- ---------------------------------------------------------------

-- Resolve the version_id for two reference Skills inserted in Plan C.
-- If those slugs do not exist (fresh DB), this insert is a no-op via
-- the WHERE clause so the migration stays idempotent.
do $$
declare
  v_classify_id uuid;
  v_draft_id uuid;
begin
  select v.id into v_classify_id
  from toolbox_library_skill_versions v
  join toolbox_library_skills s on s.id = v.library_skill_id
  where s.slug = 'classify-customer-complaint'
  order by v.version desc limit 1;

  select v.id into v_draft_id
  from toolbox_library_skill_versions v
  join toolbox_library_skills s on s.id = v.library_skill_id
  where s.slug = 'draft-complaint-response'
  order by v.version desc limit 1;

  if v_classify_id is not null and v_draft_id is not null then
    insert into toolbox_recipes (slug, title, overview, steps, pillar, category, compliance_notes, published)
    values (
      'respond-to-complaint-with-audit-trail',
      'Respond to a customer complaint with full audit trail',
      'Three Skills chained: classify the complaint, draft a Reg-DD-aligned response, then log a one-paragraph compliance summary for the file. Output of step 1 informs steps 2 and 3 — the learner runs each in turn and pastes the prior step''s output as context.',
      jsonb_build_array(
        jsonb_build_object(
          'skill_slug', 'classify-customer-complaint',
          'skill_version_id', v_classify_id,
          'narrative', 'Run the classifier first. The category it returns drives both the response tone in step 2 and the compliance flagging in step 3.',
          'notes', 'Paste only the complaint body — no member name or account number. The classifier needs context, not identifiers.'
        ),
        jsonb_build_object(
          'skill_slug', 'draft-complaint-response',
          'skill_version_id', v_draft_id,
          'narrative', 'Use the category from step 1 plus the original complaint to draft the response. The Skill''s system prompt enforces Reg DD-aligned language and prohibits any commitment about credits or fee waivers.',
          'notes', 'Read the draft for tone before sending. The Skill is conservative — it leaves explicit "[insert reviewer name]" placeholders that need a human pass.'
        )
      ),
      'B',
      'Operations',
      'Aligned with Reg DD §1030. The response Skill includes guardrails against language that could be construed as a contractual commitment.',
      true
    )
    on conflict (slug) do nothing;
  end if;
end $$;
```

> **Note:** the seed assumes the two slugs `classify-customer-complaint` and `draft-complaint-response` exist in `toolbox_library_skills`. If they do not (Plan C's seed used different slugs), update the slugs in the `select v.id into …` queries to match what's actually in the library. The `if v_classify_id is not null` guard means the migration is idempotent and safe to run on a DB without the prerequisite library entries — it simply skips the seed and leaves the surface empty until content lands.

- [ ] **Step 2: Apply locally and to a staging branch**

Per CLAUDE.md, never delete or recreate Supabase branches without explicit consent. Use the existing staging branch.

```bash
# Confirm with the user first (CLAUDE.md):
# "About to apply migration 00021 to local + staging Supabase. Proceed? (yes/no)"
supabase db push
# After user confirms, apply to staging via the project's normal flow.
```

Verify:

```bash
supabase db query --linked "select count(*) from toolbox_recipes where published = true;"
# Expected: 1 (or 0 if the prerequisite library slugs were absent — log this clearly).
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00021_toolbox_recipes.sql
git commit -m "feat(toolbox): migration 00021 — toolbox_recipes table + RLS + seed"
```

---

### Task 3: Server helpers `getRecipes()` + `getRecipeBySlug()`

**Files:**
- Create: `src/lib/toolbox/recipes.ts`
- Create: `src/lib/toolbox/recipes.test.ts`

`getRecipes()` returns the published recipe list (no joins — just slugs + metadata) for the index page. `getRecipeBySlug(slug)` hydrates a recipe with each step's pinned-version Skill snapshot by joining `toolbox_library_skill_versions.content` (the immutable JSONB blob from Plan C).

The pin is critical: if `toolbox_library_skills` was edited (publishing a v2), the recipe must still render the v1 content the narrative was written against. The query reads `content` from the pinned version row, NOT from the current-pointer on the library table.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/toolbox/recipes.test.ts
import { describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

import { getRecipes, getRecipeBySlug } from './recipes';

describe('getRecipes', () => {
  it('returns published recipes ordered by created_at desc', async () => {
    const select = vi.fn().mockReturnThis();
    const eq = vi.fn().mockReturnThis();
    const order = vi.fn().mockResolvedValueOnce({ data: [{ slug: 'a', title: 'A', pillar: 'B', category: 'Ops', overview: 'o', steps: [] }], error: null });
    fromMock.mockReturnValueOnce({ select, eq, order });
    const list = await getRecipes();
    expect(list).toEqual([{ slug: 'a', title: 'A', pillar: 'B', category: 'Ops', overview: 'o', steps: [] }]);
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
    // First call: load the recipe
    const recipe = {
      slug: 'r1', title: 'R1', overview: 'o', pillar: 'B', category: 'Ops',
      steps: [
        { skill_slug: 'classify', skill_version_id: 'v-old', narrative: 'narr', notes: null },
      ],
      compliance_notes: null,
    };
    const recipeQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValueOnce({ data: recipe, error: null }) };

    // Second call: load the pinned version content
    const versionQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValueOnce({ data: { content: { kind: 'workflow', name: 'Classify v1 (old)' } }, error: null }) };

    fromMock.mockReturnValueOnce(recipeQuery).mockReturnValueOnce(versionQuery);

    const out = await getRecipeBySlug('r1');
    expect(out?.steps[0].skillSnapshot).toEqual({ kind: 'workflow', name: 'Classify v1 (old)' });
    expect(versionQuery.eq).toHaveBeenCalledWith('id', 'v-old');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/toolbox/recipes.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement the helpers**

```typescript
// src/lib/toolbox/recipes.ts
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

  const steps: RecipeStep[] = [];
  for (const step of (recipe as RecipeRow).steps) {
    const { data: ver } = await client
      .from('toolbox_library_skill_versions')
      .select('content')
      .eq('id', step.skill_version_id)
      .single();
    steps.push({ ...step, skillSnapshot: (ver as { content?: Record<string, unknown> } | null)?.content ?? null });
  }
  return { ...(recipe as RecipeRow), steps };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/toolbox/recipes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/toolbox/recipes.ts src/lib/toolbox/recipes.test.ts
git commit -m "feat(toolbox): server helpers for Cookbook recipes"
```

---

### Task 4: Recipe index page `/dashboard/toolbox/cookbook`

**Files:**
- Create: `src/app/dashboard/toolbox/cookbook/page.tsx`

SSR. Lists recipes in card form with pillar (sage/cobalt/terra per CLAUDE.md non-negotiable) and category. Empty state if `getRecipes()` returns `[]`.

- [ ] **Step 1: Implement the page**

```tsx
// src/app/dashboard/toolbox/cookbook/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getRecipes } from '@/lib/toolbox/recipes';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';

export const metadata: Metadata = { title: 'Cookbook · AiBI Toolbox' };

const PILLAR_COPY = {
  A: { label: 'Pillar A · Accessible', color: 'var(--color-sage)' },
  B: { label: 'Pillar B · Boundary-Safe', color: 'var(--color-cobalt)' },
  C: { label: 'Pillar C · Capable', color: 'var(--color-terra)' },
} as const;

export default async function CookbookIndex() {
  const access = await getPaidToolboxAccess();
  if (!access) redirect('/dashboard/toolbox?paywall=1');

  const recipes = await getRecipes();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">Cookbook</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">End-to-end banking workflows.</h1>
        <p className="mt-3 max-w-prose text-[color:var(--color-slate)]">
          Each recipe chains three or four Library Skills into a complete workflow.
          Run the steps in order; save any Skill to your Toolbox as you go.
        </p>
      </header>

      {recipes.length === 0 ? (
        <p className="text-[color:var(--color-slate)]">No recipes published yet. Check back soon.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {recipes.map((r) => (
            <li key={r.slug}>
              <Link href={`/dashboard/toolbox/cookbook/${r.slug}`} className="block border border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] p-6 hover:border-[color:var(--color-terra)]">
                <span
                  className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[color:var(--color-linen)]"
                  style={{ backgroundColor: PILLAR_COPY[r.pillar].color }}
                >
                  {PILLAR_COPY[r.pillar].label}
                </span>
                <h2 className="mt-3 font-serif text-2xl text-[color:var(--color-ink)]">{r.title}</h2>
                <p className="mt-2 text-sm text-[color:var(--color-slate)]">{r.overview}</p>
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[color:var(--color-slate)]">
                  {r.steps.length} steps · {r.category}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Manual smoke test**

`npm run dev`. As a paid user, visit `/dashboard/toolbox/cookbook`. Verify:
1. The seeded recipe renders as a card.
2. Pillar B uses cobalt — sage and terra do not appear on this card.
3. As an unauthenticated visitor, the redirect to the paywall fires.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/toolbox/cookbook/page.tsx
git commit -m "feat(toolbox): Cookbook recipe index page"
```

---

### Task 5: Recipe detail page + RecipeStep component

**Files:**
- Create: `src/app/dashboard/toolbox/cookbook/[slug]/page.tsx`
- Create: `src/app/dashboard/toolbox/cookbook/_components/RecipeStep.tsx`
- Create: `src/app/dashboard/toolbox/cookbook/_components/RecipeStep.test.tsx`

The detail page renders overview + ordered steps. Each `RecipeStep` shows the narrative, then the Skill snapshot kind-aware (system prompt + user template for `template`; purpose + steps + guardrails for `workflow`), then the "Save to my Toolbox" CTA, then any per-step notes.

The Save CTA POSTs to `/api/toolbox/save` with `origin: 'library'`, the library skill id (resolved via the slug), the version id (pinned by the recipe), AND a new `recipeSourceRef` field that the route accepts (Task 7) so the saved skill records its recipe provenance.

- [ ] **Step 1: Implement the page**

```tsx
// src/app/dashboard/toolbox/cookbook/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getRecipeBySlug } from '@/lib/toolbox/recipes';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { RecipeStep } from '../_components/RecipeStep';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface PageProps { readonly params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recipe = await getRecipeBySlug(params.slug);
  return { title: recipe ? `${recipe.title} · Cookbook` : 'Recipe not found' };
}

async function resolveLibrarySkillIds(slugs: readonly string[]): Promise<Record<string, string>> {
  if (!isSupabaseConfigured() || slugs.length === 0) return {};
  const client = createServiceRoleClient();
  const { data } = await client.from('toolbox_library_skills').select('id,slug').in('slug', slugs as string[]);
  const map: Record<string, string> = {};
  for (const row of (data ?? []) as Array<{ id: string; slug: string }>) {
    map[row.slug] = row.id;
  }
  return map;
}

export default async function RecipePage({ params }: PageProps) {
  const access = await getPaidToolboxAccess();
  if (!access) redirect('/dashboard/toolbox?paywall=1');

  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) notFound();

  const slugToLibraryId = await resolveLibrarySkillIds(recipe.steps.map((s) => s.skill_slug));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">Cookbook · {recipe.category}</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">{recipe.title}</h1>
        <p className="mt-4 leading-relaxed text-[color:var(--color-slate)]">{recipe.overview}</p>
        {recipe.compliance_notes && (
          <p className="mt-3 border-l-4 border-[color:var(--color-cobalt)] pl-4 text-sm text-[color:var(--color-slate)]">
            <strong>Compliance:</strong> {recipe.compliance_notes}
          </p>
        )}
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
```

- [ ] **Step 2: Write the failing test for RecipeStep**

```tsx
// src/app/dashboard/toolbox/cookbook/_components/RecipeStep.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeStep } from './RecipeStep';

describe('RecipeStep', () => {
  const baseStep = {
    skill_slug: 'classify',
    skill_version_id: 'ver-1',
    narrative: 'Run the classifier.',
    notes: 'Paste only the body.',
    skillSnapshot: { kind: 'template', name: 'Classify Complaint', systemPrompt: 'sys', userPromptTemplate: 'tmpl' },
  } as const;

  it('renders the narrative, notes, and template snapshot fields', () => {
    render(<RecipeStep index={1} recipeSlug="r1" step={baseStep as any} librarySkillId="lib-1" />);
    expect(screen.getByText(/run the classifier/i)).toBeTruthy();
    expect(screen.getByText(/paste only the body/i)).toBeTruthy();
    expect(screen.getByText(/system prompt/i)).toBeTruthy();
    expect(screen.getByText(/sys/)).toBeTruthy();
    expect(screen.getByText(/tmpl/)).toBeTruthy();
  });

  it('renders workflow snapshot fields for kind=workflow', () => {
    const wf = { ...baseStep, skillSnapshot: { kind: 'workflow', name: 'Workflow X', purpose: 'p', steps: ['s1', 's2'], guardrails: ['g1'] } };
    render(<RecipeStep index={2} recipeSlug="r1" step={wf as any} librarySkillId="lib-2" />);
    expect(screen.getByText(/purpose/i)).toBeTruthy();
    expect(screen.getByText(/s1/)).toBeTruthy();
    expect(screen.getByText(/g1/)).toBeTruthy();
  });

  it('POSTs to /api/toolbox/save with origin=library and recipeSourceRef on click', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ id: 'new' }), { status: 200 }));
    render(<RecipeStep index={1} recipeSlug="respond-to-complaint" step={baseStep as any} librarySkillId="lib-1" />);
    fireEvent.click(screen.getByRole('button', { name: /save to my toolbox/i }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.origin).toBe('library');
    expect(body.payload.librarySkillId).toBe('lib-1');
    expect(body.payload.versionId).toBe('ver-1');
    expect(body.payload.recipeSourceRef).toBe('cookbook:respond-to-complaint#step-1');
    fetchMock.mockRestore();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/app/dashboard/toolbox/cookbook/_components/RecipeStep.test.tsx`
Expected: FAIL — component missing.

- [ ] **Step 4: Implement RecipeStep**

```tsx
// src/app/dashboard/toolbox/cookbook/_components/RecipeStep.tsx
'use client';

import { useState } from 'react';
import type { RecipeStep as RecipeStepData } from '@/lib/toolbox/recipes';

interface Props {
  readonly index: number;
  readonly recipeSlug: string;
  readonly step: RecipeStepData;
  readonly librarySkillId: string | undefined;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface TemplateSnapshot {
  kind: 'template';
  name?: string;
  systemPrompt?: string;
  userPromptTemplate?: string;
}
interface WorkflowSnapshot {
  kind: 'workflow';
  name?: string;
  purpose?: string;
  steps?: readonly string[];
  guardrails?: readonly string[];
}
type Snapshot = TemplateSnapshot | WorkflowSnapshot;

export function RecipeStep({ index, recipeSlug, step, librarySkillId }: Props) {
  const [state, setState] = useState<SaveState>('idle');
  const snap = (step.skillSnapshot ?? {}) as Snapshot;

  async function handleSave() {
    if (!librarySkillId) {
      setState('error');
      return;
    }
    setState('saving');
    try {
      const res = await fetch('/api/toolbox/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'library',
          payload: {
            librarySkillId,
            versionId: step.skill_version_id,
            recipeSourceRef: `cookbook:${recipeSlug}#step-${index}`,
          },
        }),
      });
      setState(res.ok ? 'saved' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <article className="border border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] p-6">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Step {index} · {snap.name ?? step.skill_slug}
      </p>
      <p className="mt-3 leading-relaxed text-[color:var(--color-ink)]">{step.narrative}</p>

      <section className="mt-5 border-t border-[color:var(--color-ink)]/10 pt-5">
        {snap.kind === 'template' && (
          <>
            <h3 className="font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">System prompt</h3>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-[color:var(--color-ink)]">{snap.systemPrompt}</pre>
            <h3 className="mt-4 font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">User template</h3>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-[color:var(--color-ink)]">{snap.userPromptTemplate}</pre>
          </>
        )}
        {snap.kind === 'workflow' && (
          <>
            <h3 className="font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Purpose</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-ink)]">{snap.purpose}</p>
            {snap.steps?.length ? (
              <>
                <h3 className="mt-4 font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Steps</h3>
                <ol className="mt-2 list-decimal pl-5 text-[13px] text-[color:var(--color-ink)]">
                  {snap.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </>
            ) : null}
            {snap.guardrails?.length ? (
              <>
                <h3 className="mt-4 font-serif-sc text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Guardrails</h3>
                <ul className="mt-2 list-disc pl-5 text-[13px] text-[color:var(--color-ink)]">
                  {snap.guardrails.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </>
            ) : null}
          </>
        )}
      </section>

      {step.notes && (
        <p className="mt-5 border-l-4 border-[color:var(--color-terra)] pl-4 text-sm text-[color:var(--color-slate)]">
          <strong>Note:</strong> {step.notes}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!librarySkillId || state === 'saving'}
          className="bg-[color:var(--color-terra)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]"
        >
          {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved to Toolbox' : state === 'error' ? 'Save failed' : 'Save to my Toolbox'}
        </button>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Run tests, verify pass**

Run: `npx vitest run src/app/dashboard/toolbox/cookbook`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/toolbox/cookbook
git commit -m "feat(toolbox): Cookbook recipe detail + RecipeStep component"
```

---

### Task 6: Extend `/api/toolbox/save` to accept `recipeSourceRef`

**Files:**
- Modify: `src/app/api/toolbox/save/route.ts` (from Plan F)
- Modify: `src/lib/toolbox/save-mappers.ts` (from Plan F)
- Modify: `src/app/api/toolbox/save/route.test.ts` (from Plan F)

The Plan F save endpoint takes `library` payloads but always writes `source_ref: library:<id>@<version>`. Plan G adds an optional `recipeSourceRef` override; when present, the row records the recipe provenance instead of the library provenance, and `source` becomes `'forked'` (still — the row is a fork of the library version, just discovered through a recipe).

- [ ] **Step 1: Update the route to accept the new field**

In the route's `LibraryPayload` shape (from Plan F):

```typescript
interface LibraryPayload { origin: 'library'; payload: { librarySkillId: string; versionId: string; recipeSourceRef?: string } }
```

Pass the optional override to the mapper:

```typescript
} else {
  // ... fetch entry ...
  skill = libraryEntryToToolboxSkill(entry as never, access.userId, body.payload.versionId, body.payload.recipeSourceRef);
  sourceRef = skill.sourceRef;
}
```

- [ ] **Step 2: Update the mapper signature**

```typescript
export function libraryEntryToToolboxSkill(
  entry: LibraryEntry,
  userId: string,
  versionId: string,
  recipeSourceRef?: string,
): ToolboxSkill {
  // ... unchanged setup ...
  const common = {
    // ... existing fields ...
    source: 'forked' as const,
    sourceRef: recipeSourceRef ?? `library:${entry.id}@${versionId}`,
  };
  // ... rest unchanged ...
}
```

- [ ] **Step 3: Add a route test for the override**

Append to `src/app/api/toolbox/save/route.test.ts`:

```typescript
it('records recipeSourceRef when provided on a library-origin save', async () => {
  // mock library entry lookup
  const fromMock = (await import('@/lib/supabase/client')).createServiceRoleClient as unknown as ReturnType<typeof vi.fn>;
  // ... arrange the from() chain so the library entry resolves ...
  const res = await POST(req({
    origin: 'library',
    payload: { librarySkillId: 'lib-1', versionId: 'ver-7', recipeSourceRef: 'cookbook:respond#step-1' },
  }));
  expect(res.status).toBe(200);
  // assert the insert call carried source_ref: 'cookbook:respond#step-1'
});
```

(Adapt the mock chain to match the existing test's mocking style; the assertion that matters is the inserted `source_ref`.)

- [ ] **Step 4: Run all save tests**

Run: `npx vitest run src/app/api/toolbox/save src/lib/toolbox/save-mappers.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/toolbox/save/route.ts src/app/api/toolbox/save/route.test.ts src/lib/toolbox/save-mappers.ts
git commit -m "feat(toolbox): allow recipeSourceRef override on library-origin save"
```

---

### Task 7: Recognize `cookbook:` source_ref in My Toolbox backlinks

**Files:**
- Modify: the `<SourceBacklink>` helper added in Plan F's Task 6 (inside `ToolboxApp.tsx` or wherever it landed).

Plan F's helper handles `source: 'course'` and `library:<id>@…` patterns. Add a third branch that matches `cookbook:<slug>#step-<n>` and renders a "Recipe: <slug>" link to `/dashboard/toolbox/cookbook/<slug>`.

- [ ] **Step 1: Extend the helper**

```tsx
if ((skill.source === 'forked' || skill.source === 'library') && skill.sourceRef.startsWith('cookbook:')) {
  const match = /^cookbook:([^#]+)#step-(\d+)/.exec(skill.sourceRef);
  if (!match) return null;
  return (
    <p className="text-xs text-[color:var(--color-slate)]">
      Source:{' '}
      <Link href={`/dashboard/toolbox/cookbook/${match[1]}`} className="underline">
        Cookbook recipe · step {match[2]}
      </Link>
    </p>
  );
}
```

Place this branch BEFORE the existing `library:` branch so the `cookbook:` prefix wins.

- [ ] **Step 2: Smoke test**

As a paid user, save a Skill from a recipe step. Check My Toolbox: the row's source link reads "Cookbook recipe · step 1" and goes to the recipe page.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/toolbox/ToolboxApp.tsx
git commit -m "feat(toolbox): cookbook source-ref backlink in My Toolbox"
```

---

### Task 8: "Used in recipes" footer on Library detail pages

**Files:**
- Modify: `src/app/dashboard/toolbox/library/[slug]/page.tsx`

A small server-side query at render time: which recipes reference this library skill's slug? Render a list of links.

- [ ] **Step 1: Add the lookup helper**

Inside `src/lib/toolbox/recipes.ts`, append:

```typescript
export async function getRecipesUsingSkill(slug: string): Promise<Array<{ slug: string; title: string }>> {
  if (!isSupabaseConfigured()) return [];
  const client = createServiceRoleClient();
  // Postgres JSONB containment: any element of `steps` whose skill_slug equals the input.
  const { data } = await client
    .from('toolbox_recipes')
    .select('slug,title')
    .eq('published', true)
    .filter('steps', 'cs', JSON.stringify([{ skill_slug: slug }]));
  return (data ?? []) as Array<{ slug: string; title: string }>;
}
```

(`cs` is the Supabase shorthand for the `@>` containment operator on JSONB.)

- [ ] **Step 2: Render the footer on the library detail page**

In `src/app/dashboard/toolbox/library/[slug]/page.tsx`, after the existing recipe content:

```tsx
import { getRecipesUsingSkill } from '@/lib/toolbox/recipes';
// ...
const recipesUsing = await getRecipesUsingSkill(params.slug);
// ... in JSX ...
{recipesUsing.length > 0 && (
  <section className="mt-12 border-t border-[color:var(--color-ink)]/10 pt-6">
    <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-slate)]">Used in recipes</p>
    <ul className="mt-3 space-y-2">
      {recipesUsing.map((r) => (
        <li key={r.slug}>
          <Link href={`/dashboard/toolbox/cookbook/${r.slug}`} className="underline text-[color:var(--color-terra)]">
            {r.title}
          </Link>
        </li>
      ))}
    </ul>
  </section>
)}
```

- [ ] **Step 3: Smoke test**

Visit the library entry for the seed recipe's first step. Confirm the "Used in recipes" footer shows the recipe.

- [ ] **Step 4: Commit**

```bash
git add src/lib/toolbox/recipes.ts src/app/dashboard/toolbox/library/\[slug\]/page.tsx
git commit -m "feat(toolbox): Used-in-recipes footer on Library detail"
```

---

### Task 9: Apply the tab rename + add Cookbook link

**Files:**
- Modify: `src/app/dashboard/toolbox/ToolboxApp.tsx`

Two changes per Task 1's locked decision:

1. Rename the existing `cookbook` tab to `library`. Update the `TabId` union, the `TABS` array, all render branches, and any internal `setTab('cookbook')` calls.
2. Add a "Cookbook" link in the toolbox header pointing at `/dashboard/toolbox/cookbook`. This is a link, not a tab — the recipes surface is its own route.
3. Add a tiny query-param compatibility shim that maps any legacy `?tab=cookbook` to `?tab=library` so in-the-wild course-module links don't 404 the user onto an unknown tab.

- [ ] **Step 1: Apply the rename + the legacy shim**

In `ToolboxApp.tsx`:

1. Update the `TabId` union: `'cookbook'` → `'library'`.
2. Update `TABS`: `{ id: 'library', label: 'Library' }`.
3. Update every render branch and `setTab('cookbook')` call to use `'library'`.
4. Add a `useEffect` near the existing `useSearchParams` consumer that maps the legacy slug:

```tsx
useEffect(() => {
  const tab = searchParams?.get('tab');
  if (tab === 'cookbook') {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'library');
    router.replace(`${pathname}?${params.toString()}`);
  }
}, [searchParams, pathname, router]);
```

5. Search the rest of the codebase for `?tab=cookbook` and `tab=cookbook` and replace with `?tab=library`. The earlier grep already flagged at least one occurrence in `src/app/courses/aibi-p/_components/ModuleNavigation.tsx`. Update each one.

```bash
grep -rn 'tab=cookbook' src/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 2: Add the Cookbook link**

In the toolbox header JSX, next to the existing tab nav:

```tsx
<Link
  href="/dashboard/toolbox/cookbook"
  className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] hover:underline"
>
  Cookbook →
</Link>
```

- [ ] **Step 3: Type check + smoke test**

Run: `npx tsc --noEmit`
Expected: zero errors.

`npm run dev`. Verify: the tab now reads "Library" (or whatever was picked); the Cookbook link in the header lands on the recipe index.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/toolbox/ToolboxApp.tsx
git commit -m "feat(toolbox): rename Cookbook tab -> Library; link to recipe surface"
```

---

### Task 10: Plausible event for recipe views

**Files:**
- Modify: `src/app/dashboard/toolbox/cookbook/[slug]/page.tsx`

Per spec §9, fire `cookbook_recipe_viewed` on detail page render. Use the existing deferred-call pattern. Page is server-rendered, so the event fires from a small client island that mounts inside the page.

- [ ] **Step 1: Create the tiny tracker island**

```tsx
// src/app/dashboard/toolbox/cookbook/_components/TrackRecipeView.tsx
'use client';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/plausible';

export function TrackRecipeView({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent('cookbook_recipe_viewed', { slug });
  }, [slug]);
  return null;
}
```

- [ ] **Step 2: Mount it on the detail page**

In `src/app/dashboard/toolbox/cookbook/[slug]/page.tsx`, just inside `<main>`:

```tsx
import { TrackRecipeView } from '../_components/TrackRecipeView';
// ...
<TrackRecipeView slug={recipe.slug} />
```

- [ ] **Step 3: Smoke test**

Open DevTools → Network. Visit `/dashboard/toolbox/cookbook/respond-to-complaint-with-audit-trail`. Verify the Plausible event fires with `props: { slug: 'respond-to-complaint-with-audit-trail' }`.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/toolbox/cookbook/_components/TrackRecipeView.tsx src/app/dashboard/toolbox/cookbook/\[slug\]/page.tsx
git commit -m "feat(toolbox): cookbook_recipe_viewed Plausible event"
```

---

## Acceptance criteria

- [ ] Migration 00021 applied locally and to staging; `toolbox_recipes` table exists with the spec §7.3 column set; RLS gates reads via `has_toolbox_access`.
- [ ] One reference recipe seeded; `getRecipes()` returns it.
- [ ] `/dashboard/toolbox/cookbook` renders the recipe index for paid users; redirects unauthenticated users to the paywall.
- [ ] `/dashboard/toolbox/cookbook/[slug]` renders overview + ordered steps + per-step Save CTA.
- [ ] Recipe step content is sourced from the **pinned version snapshot**, not from the current library row pointer (verified by the `recipes.test.ts` test that queries by `version_id`).
- [ ] Saving from a recipe step writes `source: 'forked'` + `source_ref: 'cookbook:<slug>#step-<n>'`.
- [ ] My Toolbox renders the "Cookbook recipe · step <n>" backlink for those rows.
- [ ] Library detail page shows "Used in recipes:" when at least one recipe references the slug.
- [ ] The existing "Cookbook" tab is renamed to "Library"; legacy `?tab=cookbook` URLs are mapped to `?tab=library` via a client-side shim; a "Cookbook" link in the toolbox header lands on the recipe index.
- [ ] `cookbook_recipe_viewed` Plausible event fires on detail render.
- [ ] `npx tsc --noEmit` passes; `npx vitest run` passes; `npm run build` succeeds.
- [ ] An issue is open or a content-track ticket exists for authoring the remaining 4–7 launch recipes.

---

## What Plan G explicitly does NOT do

- **Author 4–7 polished launch recipes.** Content track per spec §11. Plan G ships the surface + 1 reference recipe.
- **Recipe authoring UI.** v1 recipes live in JSON in the codebase and are inserted via migration. A web authoring experience is Phase 2.
- **Multi-step orchestration** (auto-piping step N → step N+1). Each recipe step runs independently in the Playground; the learner moves between steps manually.
- **Recipe versioning.** Library Skills are versioned (Plan C); recipes are not — when a recipe needs updating, edit the row in place. If recipe versioning is needed in Phase 2, design it then.
- **Compare Mode within recipes** — Phase 2.

---

## Self-Review

### Spec coverage check

| Spec section | Plan G coverage |
|---|---|
| §5.4 Cookbook surface at `/dashboard/toolbox/cookbook` | Tasks 4, 5 |
| §5.4 5–8 recipes at launch, ~3–4 Skills each | Surface ships in Plan G; the 4–7 additional recipes are content-track work |
| §5.4 Recipe contains overview, step-by-step, links to Library Skills, worked examples, teaching annotations, compliance notes | Tasks 5 + 8 (annotations and worked examples render via the pinned `skillSnapshot`); compliance notes are a top-level recipe field |
| §6.1 Save to Toolbox on each Cookbook recipe step | Tasks 5 + 6 (RecipeStep button, route accepts `recipeSourceRef`) |
| §7.2 `/dashboard/toolbox/cookbook` SSR + `/dashboard/toolbox/cookbook/[slug]` SSR | Tasks 4, 5 |
| §7.3 `toolbox_recipes` DDL + decision #17 (steps pin to `skill_version_id`) | Task 2 + Task 3 (`getRecipeBySlug` queries by version_id) |
| §7.3 RLS: read requires authenticated user AND active Toolbox entitlement | Task 2 (uses `has_toolbox_access` from Plan C 00019) |
| §9 `cookbook_recipe_viewed` Plausible event | Task 10 |
| §6.3 Pillar tagging (sage = A only, cobalt = B only, terra = C only) | Tasks 4, 5 — pillar color usage is non-negotiable per CLAUDE.md |

### Placeholder scan

Searched plan for: TBD, TODO, "implement later", "fill in details", "add appropriate error handling", "similar to Task N", "write tests for the above" — zero hits. Task 6 Step 3 includes a small "adapt the mock chain to match the existing test's mocking style" instruction rather than rewriting Plan F's full mock setup; the engineer reading Task 6 has Plan F's `route.test.ts` in front of them and the precise insertion point (asserting `source_ref` on the insert call). Task 1 is a user-confirmation step rather than a code step — explicitly so, because the tab rename is a learner-visible copy change that should not be applied unilaterally.

### Type consistency

- `Recipe`, `RecipeStep`, `RecipeRow`, `RecipeStepRow` in `lib/toolbox/recipes.ts` are used consistently in `recipes.test.ts`, the index page, the detail page, and `RecipeStep.tsx`.
- `LibraryPayload` extension in Task 6 (adding optional `recipeSourceRef`) matches the field name used in `RecipeStep.tsx`'s POST body.
- `source: 'forked'` for cookbook-derived saves matches the existing `toolbox_skills.source` CHECK constraint from Plan B.
- Pillar-color CSS variables (`--color-sage`, `--color-cobalt`, `--color-terra`) match CLAUDE.md's color discipline.

### Scope check

10 tasks: 1 user-confirmation gate, 1 migration + seed, 1 server helpers module, 2 routes, 1 component (with tests), 1 endpoint extension, 1 backlink extension, 1 cross-link, 1 tab rename, 1 analytics event. All within one coherent "ship Cookbook surface end-to-end" arc. The migration without the routes is dead weight; the routes without the migration cannot render anything. The tab rename is the only task that touches existing learner-visible copy and is correctly gated behind explicit user confirmation. With Plans A0–G shipped, the spec §11 engineering track is feature-complete; only the content-authoring track (the 25 Library Skills + 4–7 additional recipes) and the deferred PII layering remain before launch.
