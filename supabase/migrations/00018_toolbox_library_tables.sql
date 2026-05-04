-- Plan C — Task 2
-- Library tables for the AiBI Toolbox: read-only template originals plus
-- versioned content snapshots. RLS uses a row-level entitlement check so a
-- misconfigured client cannot read library content without an active paid
-- entitlement (defense-in-depth, decision #13 in the design spec).

-- has_toolbox_access(uuid) — SQL helper used by RLS policies. Mirrors the
-- TypeScript predicate in lib/toolbox/access.ts so the database is the
-- single source of truth for entitlement checks.
create or replace function public.has_toolbox_access(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.entitlements
    where user_id = check_user_id
      and active = true
      and product in ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only')
      and (expires_at is null or expires_at > now())
      and revoked_at is null
  );
$$;

comment on function public.has_toolbox_access(uuid)
  is 'Returns true if the user has at least one active paid entitlement that grants Toolbox access. Used by RLS policies on toolbox_library_* tables.';

-- toolbox_library_skills — read-only originals. Each row is the canonical
-- pointer for a Library skill; full content lives in versions.
create table public.toolbox_library_skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in ('workflow', 'template')),
  title text not null,
  description text,
  pillar char(1) not null check (pillar in ('A', 'B', 'C')),
  category text not null,
  complexity text check (complexity in ('beginner', 'intermediate', 'advanced')),
  course_source_ref text,
  current_version integer not null default 1,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_library_skills_pillar on public.toolbox_library_skills (pillar);
create index idx_library_skills_category on public.toolbox_library_skills (category);
create index idx_library_skills_kind on public.toolbox_library_skills (kind);
create index idx_library_skills_published on public.toolbox_library_skills (published) where published = true;

-- toolbox_library_skill_versions — append-only snapshots. Each Library skill
-- gets a v1 row at creation; future edits publish new versions. Cookbook
-- recipes (Plan G) pin to a specific version_id so narrative stays aligned
-- with prompt content.
create table public.toolbox_library_skill_versions (
  id uuid primary key default gen_random_uuid(),
  library_skill_id uuid not null references public.toolbox_library_skills(id) on delete cascade,
  version integer not null,
  content jsonb not null,
  published_at timestamptz not null default now(),
  unique (library_skill_id, version)
);

create index idx_library_versions_skill on public.toolbox_library_skill_versions (library_skill_id);

-- RLS — read requires authenticated user AND active toolbox entitlement.
-- No INSERT/UPDATE/DELETE policies for authenticated users; writes happen
-- via service-role seed migrations and admin tooling only.
alter table public.toolbox_library_skills enable row level security;
alter table public.toolbox_library_skill_versions enable row level security;

create policy "Library skills readable by entitled users"
  on public.toolbox_library_skills
  for select
  to authenticated
  using (
    public.has_toolbox_access((select auth.uid()))
    and published = true
  );

create policy "Library versions readable by entitled users"
  on public.toolbox_library_skill_versions
  for select
  to authenticated
  using (
    public.has_toolbox_access((select auth.uid()))
    and exists (
      select 1
      from public.toolbox_library_skills lib
      where lib.id = public.toolbox_library_skill_versions.library_skill_id
        and lib.published = true
    )
  );
