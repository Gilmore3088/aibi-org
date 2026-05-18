-- 001_initial_schema.sql
-- AiBI Content Engine: Scout + queue
--
-- Run this in the Supabase SQL editor against a fresh project.

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- enables future fuzzy theme search


-- =========================================================================
-- sources: the influencers/blogs/feeds being monitored
-- =========================================================================
create table sources (
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

create index idx_sources_active on sources(active) where active = true;


-- =========================================================================
-- content_items: raw items pulled from sources
-- =========================================================================
create table content_items (
    id            uuid primary key default uuid_generate_v4(),
    source_id     uuid not null references sources(id) on delete cascade,
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

create index idx_content_items_published on content_items(published_at desc);
create index idx_content_items_source on content_items(source_id);


-- =========================================================================
-- content_scores: Scout output (one or more per content_item; latest wins)
-- =========================================================================
create table content_scores (
    id                  uuid primary key default uuid_generate_v4(),
    content_item_id     uuid not null references content_items(id) on delete cascade,
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

create index idx_content_scores_item on content_scores(content_item_id);
create index idx_content_scores_relevance on content_scores(banking_relevance desc);
create index idx_content_scores_themes on content_scores using gin(key_themes);


-- =========================================================================
-- story_candidates: Synthesizer output (built in next milestone; schema here so
-- migrations don't churn later)
-- =========================================================================
create table story_candidates (
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

create index idx_story_candidates_week on story_candidates(week_of desc);
create index idx_story_candidates_status on story_candidates(status);


-- =========================================================================
-- View: latest score per content item — what the digest and review use
-- =========================================================================
create or replace view content_with_latest_score as
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
from content_items ci
join sources s on s.id = ci.source_id
left join lateral (
    select * from content_scores
    where content_item_id = ci.id
    order by scored_at desc
    limit 1
) cs on true;
