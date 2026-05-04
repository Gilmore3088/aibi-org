-- Plan G — Task 2
-- Cookbook recipes per spec §5.4. Each recipe chains 3–4 Library Skills.
-- Step references pin to a specific library skill version so narrative
-- never drifts from the prompt content. (Decision #17.)

create table if not exists public.toolbox_recipes (
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

create index if not exists idx_toolbox_recipes_slug on public.toolbox_recipes (slug);
create index if not exists idx_toolbox_recipes_published on public.toolbox_recipes (published) where published = true;

alter table public.toolbox_recipes enable row level security;

-- Read requires authenticated user AND active Toolbox entitlement.
-- has_toolbox_access(uuid) was created in 00018 (Plan C).
drop policy if exists "Read recipes for entitled users" on public.toolbox_recipes;
create policy "Read recipes for entitled users" on public.toolbox_recipes
  for select
  to authenticated
  using (public.has_toolbox_access((select auth.uid())) and published = true);

-- No insert/update/delete from authenticated clients in v1.
-- Recipe authoring lands via service-role + migrations (or direct DB insert).
-- Service role bypasses RLS, so no explicit policy needed for it.

-- ---------------------------------------------------------------
-- Seed a single reference recipe so QA can exercise the surface.
-- Real launch content (4–7 more recipes) lands via the content
-- track per spec §11.
--
-- Plan deviation: the original plan referenced library slugs
-- 'classify-customer-complaint' and 'draft-complaint-response',
-- which do not exist in Plan C's seed (00019). Substituted with
-- the two seeded slugs that best support a complaint-response +
-- audit-trail narrative: 'member-complaint' (classifies + drafts
-- response) and 'sar-narrative' (produces the formal narrative for
-- the file). The do-block guard keeps this idempotent — if either
-- slug is absent, the insert is skipped.
-- ---------------------------------------------------------------

do $$
declare
  v_complaint_id uuid;
  v_narrative_id uuid;
begin
  select v.id into v_complaint_id
  from public.toolbox_library_skill_versions v
  join public.toolbox_library_skills s on s.id = v.library_skill_id
  where s.slug = 'member-complaint'
  order by v.version desc limit 1;

  select v.id into v_narrative_id
  from public.toolbox_library_skill_versions v
  join public.toolbox_library_skills s on s.id = v.library_skill_id
  where s.slug = 'sar-narrative'
  order by v.version desc limit 1;

  if v_complaint_id is not null and v_narrative_id is not null then
    insert into public.toolbox_recipes (slug, title, overview, steps, pillar, category, compliance_notes, published)
    values (
      'respond-to-complaint-with-audit-trail',
      'Respond to a customer complaint with full audit trail',
      'Two Skills chained: classify the complaint and draft the member response, then produce a formal narrative for the case file. Output of step 1 informs step 2 — the learner runs each in turn and pastes the prior step''s output as context.',
      jsonb_build_array(
        jsonb_build_object(
          'skill_slug', 'member-complaint',
          'skill_version_id', v_complaint_id,
          'narrative', 'Run the complaint workflow first. It categorizes the complaint, drafts a plain-language member response, and creates a log entry with regulatory flags (UDAAP, Reg E, FCRA) that drive the audit-trail narrative in step 2.',
          'notes', 'Paste only the complaint body and minimal context — no member name or account number. The Skill needs the facts, not identifiers.'
        ),
        jsonb_build_object(
          'skill_slug', 'sar-narrative',
          'skill_version_id', v_narrative_id,
          'narrative', 'Use the category and regulatory flags from step 1 to produce the formal narrative for the case file. The Skill enforces FinCEN 5W structure and prohibits speculation beyond documented facts.',
          'notes', 'Read the narrative for tone before filing. The Skill is conservative — it leaves explicit placeholders that need a human pass before the BSA officer signs off.'
        )
      ),
      'B',
      'Operations',
      'Aligned with Reg DD §1030 and 31 CFR 1020.320(e). The response Skill includes guardrails against language that could be construed as a contractual commitment; the narrative Skill anonymizes member identifiers and refuses to speculate about intent.',
      true
    )
    on conflict (slug) do nothing;
  end if;
end $$;
