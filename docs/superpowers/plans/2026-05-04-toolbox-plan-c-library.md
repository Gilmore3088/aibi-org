# AiBI Toolbox — Plan C: DB-backed Library + Versioning + Fork

**Status:** Plan drafted, pending user approval before execution
**Branch:** `feature/toolbox-library`
**Worktree:** `~/Projects/aibi-toolbox-library`
**Spec:** `docs/superpowers/specs/2026-04-29-aibi-toolbox-design.md` (v1.1, decision #13 RLS, decision #17 versioning, decision #23 kind discriminator)
**Depends on:** Plan A0 (entitlements + `/dashboard/toolbox`), Plan B (kind discriminator) — both merged to main as of 2026-05-04
**Date:** 2026-05-04

---

## 1. Summary

Move the Toolbox Library from file-based scaffolding (`src/content/toolbox/templates.ts`, 15 workflow-kind templates) into Supabase tables with versioning. Add browse + detail UI under `/dashboard/toolbox/library`. Add a Fork mechanic that copies a Library version into the user's personal `toolbox_skills` table as an editable copy with provenance.

**This plan does NOT cover:**

- **Save to Toolbox capture button** (Plan F)
- **Cookbook recipes** (Plan G — recipes pin to Library skill versions; the version table from this plan is the foundation)
- **Multi-provider Playground** (Plans D/E)
- **Authoring 25 new Library skills with teaching annotations** (content track per spec §11)
- **Pillar retagging of the 15 seeded templates** (defaults to `'A'` in this plan; content track will retag)

---

## 2. Tasks

| # | Task | Type |
|---|---|---|
| 1 | Verify dev environment | Setup |
| 2 | Migration 00018 — Library tables + RLS (row-level entitlement check) | Migration |
| 3 | Migration 00019 — seed v1 of 15 existing file-based templates as Library originals | Migration |
| 4 | `lib/toolbox/library.ts` — server-side data access (list, get, fork) | New module |
| 5 | Failing tests for library data access + fork roundtrip | TDD red |
| 6 | `/api/toolbox/library/route.ts` — list with filters | New route |
| 7 | `/api/toolbox/library/[slug]/route.ts` — detail with current version content | New route |
| 8 | `/api/toolbox/library/[slug]/fork/route.ts` — copy Library version → personal `toolbox_skills` | New route |
| 9 | `/dashboard/toolbox/library/page.tsx` — browse UI with filters | New UI |
| 10 | `/dashboard/toolbox/library/[slug]/page.tsx` — detail UI + Fork button | New UI |
| 11 | Wire Library link into ToolboxApp navigation (sidebar / Start Here tab) | Integration |
| 12 | End-to-end smoke test | Verification |

---

## 3. Detailed task specs

### Task 1 — Verify dev environment

```bash
cd ~/Projects/aibi-toolbox-library
ls .env.local                                  # symlink to main .env.local should exist
npm install                                    # ensure node_modules current
npm run build                                  # baseline: build passes off main
npx tsc --noEmit                               # baseline: zero errors
npx vitest run                                 # baseline: 61 tests passing (12 files)
```

Expected: all clean. If anything fails, stop and surface — Plan C cannot proceed against a broken baseline.

### Task 2 — Migration 00018: Library tables + RLS

Two new tables per spec §7.3, with row-level entitlement RLS per decision #13. Library tables are read-mostly; the version table is append-only.

```sql
-- Helper SQL function used by the RLS policy. If `has_toolbox_access(uuid)`
-- already exists from Plan A0, drop and recreate is unnecessary — verify
-- before this migration runs and adjust accordingly.
create or replace function has_toolbox_access(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.entitlements
    where user_id = check_user_id
      and active = true
      and product in ('aibi-p','aibi-s','aibi-l','toolbox-only')
      and (expires_at is null or expires_at > now())
      and revoked_at is null
  );
$$;

create table toolbox_library_skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in ('workflow','template')),
  title text not null,
  description text,
  pillar char(1) not null check (pillar in ('A','B','C')),
  category text not null,
  complexity text check (complexity in ('beginner','intermediate','advanced')),
  course_source_ref text,
  current_version integer not null default 1,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_library_skills_pillar on toolbox_library_skills (pillar);
create index idx_library_skills_category on toolbox_library_skills (category);
create index idx_library_skills_kind on toolbox_library_skills (kind);
create index idx_library_skills_published on toolbox_library_skills (published) where published = true;

create table toolbox_library_skill_versions (
  id uuid primary key default gen_random_uuid(),
  library_skill_id uuid not null references toolbox_library_skills(id) on delete cascade,
  version integer not null,
  content jsonb not null,    -- full snapshot of the skill payload at publish time
  published_at timestamptz not null default now(),
  unique (library_skill_id, version)
);
create index idx_library_versions_skill on toolbox_library_skill_versions (library_skill_id);

alter table toolbox_library_skills enable row level security;
alter table toolbox_library_skill_versions enable row level security;

-- Read requires authenticated user AND active toolbox entitlement
create policy "Library skills readable by entitled users"
  on toolbox_library_skills
  for select
  to authenticated
  using (has_toolbox_access((select auth.uid())) and published = true);

create policy "Library versions readable by entitled users"
  on toolbox_library_skill_versions
  for select
  to authenticated
  using (
    has_toolbox_access((select auth.uid()))
    and exists (
      select 1 from toolbox_library_skills lib
      where lib.id = toolbox_library_skill_versions.library_skill_id
        and lib.published = true
    )
  );

-- No INSERT/UPDATE/DELETE policies for authenticated users; only service-role
-- writes via seed migrations and admin tooling.
```

⚠️ **PUSH GATE before applying.** Same protocol as Plan A0 / Plan B. Confirm:
- `has_toolbox_access` either does not exist yet (Plan A0 didn't create the SQL helper, only the TS client) OR matches this body byte-for-byte.
- RLS smoke-tested locally with a `supabase start` instance before pushing to remote.

### Task 3 — Migration 00019: seed 15 templates as Library originals

Idempotent INSERT. Reads `src/content/toolbox/templates.ts` shape and projects to the new schema. All 15 are `kind='workflow'` (per Plan B). All default to `pillar='A'` and `complexity='intermediate'` — content track will retag.

For each of the 15 templates:
- INSERT into `toolbox_library_skills` with `slug = template.id`, `published = true`, `current_version = 1`. ON CONFLICT (slug) DO NOTHING.
- INSERT into `toolbox_library_skill_versions` with `version = 1` and `content = ` full template payload as JSONB. ON CONFLICT (library_skill_id, version) DO NOTHING.

Migration produced via small Node script (committed alongside) that emits the SQL — `templates.ts` is too large to hand-write into SQL inserts and the script keeps the seed reproducible.

After migration: `select count(*) from toolbox_library_skills where published = true` = 15.

### Task 4 — `lib/toolbox/library.ts` data access

```typescript
// Three exported functions. Each takes a Supabase service-role client
// (because RLS is gated by has_toolbox_access; for server-side reads we
// trust the API route's prior entitlement check and use service role).

export async function listLibrarySkills(opts: {
  pillar?: 'A' | 'B' | 'C';
  category?: string;
  kind?: 'workflow' | 'template';
}): Promise<LibrarySkillSummary[]>;

export async function getLibrarySkill(slug: string): Promise<{
  skill: LibrarySkillRow;
  currentVersion: LibrarySkillVersion;
} | null>;

export async function forkLibrarySkill(opts: {
  ownerId: string;
  librarySkillId: string;
  versionId: string;
}): Promise<{ id: string }>;  // returns the new toolbox_skills row id
```

Fork implementation:
1. Read the version's `content` jsonb.
2. INSERT into `toolbox_skills` with `owner_id = ownerId`, `source = 'library'`, `source_ref = versionId`, plus all content fields mapped from the JSONB.
3. Return the new row id.

### Task 5 — Failing tests

`__tests__/lib/toolbox/library.test.ts`:
- `listLibrarySkills` returns published skills only
- `listLibrarySkills` filters by pillar, category, kind
- `getLibrarySkill` returns skill + current version content
- `getLibrarySkill('nonexistent-slug')` returns null
- `forkLibrarySkill` creates a `toolbox_skills` row with `source='library'` and the right `source_ref`
- Fork preserves all content fields (round-trip equality on each)

Tests use a vitest test container or mock Supabase client per existing test patterns in the repo.

### Task 6 — `GET /api/toolbox/library`

Route handler:
1. Verify user is authenticated (existing auth utility).
2. Verify user has Toolbox access via existing `getPaidToolboxAccess` (refactored in A0).
3. Parse query params: `pillar`, `category`, `kind`.
4. Call `listLibrarySkills(opts)`.
5. Return JSON.

Errors: 401 if unauthenticated, 403 if not entitled, 400 on malformed filter values.

### Task 7 — `GET /api/toolbox/library/[slug]`

Same auth/entitlement gate. Returns `{ skill, currentVersion }` or 404. The version's `content` jsonb is included in full so the detail page can render every field.

### Task 8 — `POST /api/toolbox/library/[slug]/fork`

Auth + entitlement. Body: `{ versionId?: string }` — defaults to current version if omitted.

1. Look up the slug → skill id and resolve `versionId` (provided or current).
2. Call `forkLibrarySkill({ ownerId: session.user.id, librarySkillId, versionId })`.
3. Return `{ id: newSkillId }` with 201.
4. Fire server-side Plausible event `skill_forked_from_library` with `{ library_skill_slug, library_skill_version_id }` per spec §9.

### Task 9 — `/dashboard/toolbox/library/page.tsx`

SSR page. Server component. Server-side entitlement check at top of file (redirect to paywall if missing).

UI:
- Header: "Library — starter skills harvested from the AiBI curriculum"
- Filter row: pillar (A/B/C), category (Compliance/Lending/Operations/etc.), complexity, kind toggle (workflow/template)
- Grid of LibrarySkillCard components: title, description, pillar badge (sage/cobalt/terra per CLAUDE.md), category, complexity, "Open →" link to detail page

Empty filter result state.

### Task 10 — `/dashboard/toolbox/library/[slug]/page.tsx`

SSR page. Detail view of one Library skill with the current version's full content.

UI:
- Header: title, pillar badge, category, complexity
- Description
- For workflow-kind: render `purpose`, `questions`, `steps`, `success`, `guardrails` sections
- For template-kind: render `system_prompt`, `user_prompt_template` (with `{{variable}}` highlighting), `variables` list, `example` if present, `teaching_annotations` as expandable callouts
- "Fork to my Toolbox" button (client component) → calls `POST /fork` → on success, redirects to `/dashboard/toolbox/skills/[newId]` (Skill Builder edit view)
- Provenance footer: "Sourced from {{course_source_ref}}" if present

### Task 11 — Wire navigation

Add Library link to ToolboxApp.tsx tab navigation OR dashboard sidebar. Smallest patch wins. If adding a new top-level tab in ToolboxApp, follow the existing tab pattern; if adding a sidebar entry, add to whatever lists `/dashboard/toolbox`.

### Task 12 — End-to-end smoke test

Manual smoke matrix:
- Log in as an entitled user
- Visit `/dashboard/toolbox/library` → grid renders with 15 skills, filters work
- Click into a skill → detail page renders all fields correctly
- Click Fork → confirm new row appears in personal Toolbox at `/dashboard/toolbox/skills/[id]`
- Confirm forked skill has `source='library'` in the DB
- Log out / log in as unentitled user → `/dashboard/toolbox/library` redirects to paywall
- Direct API hit on `/api/toolbox/library` without auth → 401
- Direct API hit with auth but no entitlement → 403
- Confirm `npx tsc --noEmit` clean, `npx vitest run` green, `npm run build` succeeds

---

## 4. Verification matrix (target end-state)

| Check | Expected |
|---|---|
| `npx tsc --noEmit` | Zero errors |
| `npx vitest run` | All prior tests + new library tests passing |
| `npm run build` | Succeeds |
| Migration 00018, 00019 applied to remote | Confirmed via `supabase migration list` |
| `select count(*) from toolbox_library_skills where published` | 15 |
| `select count(*) from toolbox_library_skill_versions` | 15 (one v1 per skill) |
| `/dashboard/toolbox/library` browse page | Renders 15 skills, filters work |
| Library detail page | Renders for any seeded slug |
| Fork roundtrip | Creates `toolbox_skills` row with `source='library'`, `source_ref` pointing at version id |
| Unentitled access | 403 / paywall redirect on every Library route |

---

## 5. Out-of-scope reminders (Plan-C-fail-mode if they creep in)

- Save to Toolbox capture button — Plan F
- Cookbook recipe support — Plan G (will pin to `library_skill_version_id`; this plan provides the table)
- Authoring new Library Skills beyond the 15 seeded templates — content track
- Library Skill EDIT/UPDATE/DELETE — Library originals are read-only in v1; updates are deferred to a later admin-tooling plan (would publish a new version row, not modify in place)
- Multi-provider Playground — Plans D/E
- Pillar retagging of seeded templates — content track

If any task starts requiring one of these, stop and ask.

---

## 6. Risk notes

1. **`has_toolbox_access` SQL function** — Plan A0 created the TS client (`lib/toolbox/access.ts`) but may not have created the SQL function the spec references for RLS. Task 2 creates it if missing. If Plan A0 already created a SQL function with a different signature, Task 2 needs to reconcile rather than create.

2. **Pillar defaults for the 15 seeded templates** — defaulting all 15 to `'A'` violates the spec's "pillar discipline is visual grammar" rule (sage = A only, cobalt = B only, terra = C only). The Library landing page will show 15 sage badges, which is misleading. Acceptable for engineering plan because content track owns the retagging, but worth a content-track ticket created at the same time so it doesn't get forgotten.

3. **Migration 00019 size** — 15 templates × full JSONB payload ≈ 60-100KB of SQL inserts. Manageable but the migration file will be large. Generate it via script committed alongside.

4. **Forked skill destination** — `POST /fork` redirects to `/dashboard/toolbox/skills/[newId]` (Skill Builder edit view). That route exists per Plan B. Verify the redirect target is reachable before declaring Task 8 done.

---

## 7. Execution gate

This plan is ready for review. Execution requires:

1. Approval of the plan as written (or an amended version if the user wants changes)
2. Approval of the migration push at Task 2 (⚠️ ALL CAPS gate)
3. Approval of the seed migration push at Task 3 (⚠️ ALL CAPS gate)

Recommended execution mode: inline (same as Plan A0 and Plan B — sequential tasks, shared file surface, migration push gates require a live conversation).
