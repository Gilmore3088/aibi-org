-- 00034 — AiBI Content Engine: Scout + queue schema.
--
-- Adds four tables (sources, content_items, content_scores,
-- story_candidates) and the content_with_latest_score view used by the
-- nightly Scout cron and the founder-only /admin/content-engine console.
-- See Plans/content-engine.md and tasks/content-engine.md.
--
-- Lives in the shared website Supabase project, isolated in a dedicated
-- `content_engine` schema so generic names (sources, content_items, etc.)
-- can never collide with future website tables. See 2026-05-18 entry
-- in DECISIONS.md.
--
-- NOTE: After applying this migration, add `content_engine` to the
-- PostgREST "Exposed schemas" list in Supabase dashboard
-- (Settings → API → Exposed schemas). Without that step, the supabase-py
-- client cannot read the tables. This is a one-time dashboard action,
-- tracked as a 🔒 task in tasks/content-engine.md.

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- enables future fuzzy theme search

create schema if not exists content_engine;

grant usage on schema content_engine to postgres, anon, authenticated, service_role;
alter default privileges in schema content_engine
    grant all on tables to postgres, service_role;
alter default privileges in schema content_engine
    grant all on sequences to postgres, service_role;
alter default privileges in schema content_engine
    grant all on functions to postgres, service_role;


-- =========================================================================
-- sources: the influencers/blogs/feeds being monitored
-- =========================================================================
create table content_engine.sources (
    id              uuid primary key default uuid_generate_v4(),
    name            text not null unique,
    category        text not null check (category in ('banking', 'general_ai', 'practitioner')),
    ingestion_type  text not null check (ingestion_type in ('rss', 'youtube', 'gmail', 'manual')),
    source_url      text not null,
    handle          text,
    notes           text,
    active          boolean not null default true,
    last_fetched_at timestamptz,
    created_at      timestamptz not null default now()
);

create index idx_ce_sources_active on content_engine.sources(active) where active = true;


-- =========================================================================
-- content_items: raw items pulled from sources
-- =========================================================================
create table content_engine.content_items (
    id            uuid primary key default uuid_generate_v4(),
    source_id     uuid not null references content_engine.sources(id) on delete cascade,
    external_id   text not null,           -- GUID / URL / message-id, for dedup
    title         text not null,
    url           text,
    author        text,
    published_at  timestamptz,
    raw_content   text,                    -- full body where available
    excerpt       text,                    -- first ~1200 chars, used by Scout
    ingested_at   timestamptz not null default now(),
    unique (source_id, external_id)
);

create index idx_ce_content_items_published on content_engine.content_items(published_at desc);
create index idx_ce_content_items_source on content_engine.content_items(source_id);


-- =========================================================================
-- content_scores: Scout output (one or more per content_item; latest wins)
-- =========================================================================
create table content_engine.content_scores (
    id                  uuid primary key default uuid_generate_v4(),
    content_item_id     uuid not null references content_engine.content_items(id) on delete cascade,
    banking_relevance   int  not null check (banking_relevance between 0 and 10),
    content_type        text not null check (content_type in (
                            'framework', 'how_to', 'opinion', 'news', 'tool_launch',
                            'case_study', 'research', 'tutorial', 'announcement', 'other'
                        )),
    key_themes          text[] not null default '{}',
    one_line_summary    text not null,
    proposed_pillar     text check (proposed_pillar in (
                            'awareness', 'understanding', 'creation', 'application', 'none'
                        )),
    consequence_level   text check (consequence_level in ('low', 'medium', 'high')),
    skip                boolean not null default false,
    skip_reason         text,
    raw_score_json      jsonb not null,
    scored_at           timestamptz not null default now(),
    model               text not null
);

create index idx_ce_content_scores_item on content_engine.content_scores(content_item_id);
create index idx_ce_content_scores_relevance on content_engine.content_scores(banking_relevance desc);
create index idx_ce_content_scores_themes on content_engine.content_scores using gin(key_themes);


-- =========================================================================
-- story_candidates: Synthesizer output (built in next milestone; schema here so
-- migrations don't churn later)
-- =========================================================================
create table content_engine.story_candidates (
    id                  uuid primary key default uuid_generate_v4(),
    week_of             date not null,
    title               text not null,
    thesis              text not null,
    source_item_ids     uuid[] not null,
    proposed_format     text,
    pillar              text,
    consequence_level   text,
    status              text not null default 'pending'
                            check (status in ('pending', 'approved', 'rejected', 'developed')),
    notes               text,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index idx_ce_story_candidates_week on content_engine.story_candidates(week_of desc);
create index idx_ce_story_candidates_status on content_engine.story_candidates(status);


-- =========================================================================
-- View: latest score per content item — what the digest and review use
-- =========================================================================
create or replace view content_engine.content_with_latest_score as
select
    ci.id              as content_item_id,
    ci.source_id,
    s.name             as source_name,
    s.category         as source_category,
    ci.title,
    ci.url,
    ci.author,
    ci.published_at,
    ci.excerpt,
    cs.banking_relevance,
    cs.content_type,
    cs.key_themes,
    cs.one_line_summary,
    cs.proposed_pillar,
    cs.consequence_level,
    cs.skip,
    cs.scored_at
from content_engine.content_items ci
join content_engine.sources s on s.id = ci.source_id
left join lateral (
    select * from content_engine.content_scores
    where content_item_id = ci.id
    order by scored_at desc
    limit 1
) cs on true;
