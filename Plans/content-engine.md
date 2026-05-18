---
status: active
created: 2026-05-18
owner-tasks: tasks/content-engine.md
---

# AiBI Content Engine — Scout + Queue

## Goal

Build a nightly pipeline that keeps `/research` (The AI Banking Brief)
and downstream artifacts (newsletter, course updates, social) fed with
**current, banking-specific AI signal** — without the founder personally
reading 25 sources a week.

This plan covers the **Scout + Queue** milestone only. Synthesizer,
Translator, Formatter, and QA agents come after the queue has been
validated against real data and a hand-labeled eval set.

## Why now

- `/research` page redesign (see [`research-page-design-brief.md`](./research-page-design-brief.md))
  positions the page as the Institute's credibility engine. Credibility
  requires a steady cadence of sourced, dated material.
- The May 2026 launch (per [`aibi-launch-spec-v2.md`](./aibi-launch-spec-v2.md))
  needs a content engine that survives the founder's attention budget
  once cohorts start.
- Newsletter sequences (Day 0 / 3 / 7 plus weekly Brief) need a
  reliable source of source-cited items so we never publish unsourced
  statistics — which is a hard rule in CLAUDE.md ("Citations Always").

## Architecture

```
RSS / YouTube / Gmail  →  Modal nightly cron (07:00 UTC)
        │
        ▼
  content_items (Supabase)
        │
        ▼
  Haiku scoring (banking relevance, type, pillar, consequence)
        │
        ▼
  content_scores (Supabase)
        │
        ▼
  Friday weekly digest email (top items, grouped by pillar)
```

Code lives in [`/content-engine/`](../content-engine/) — a self-contained
Python project (uv + Modal + Supabase + Anthropic) sitting alongside
the Next.js app. It does not share runtime, dependencies, or build with
the website; it shares only the Supabase project.

## Sources (25)

The seed list is in [`content-engine/src/aibi_scout/sources.py`](../content-engine/src/aibi_scout/sources.py):

- **8 banking / fintech** (Marous, Shevlin, Skinner, Crosman/American
  Banker, Alex Johnson, Mikula, Cornerstone/GonzoBanker, Lau)
- **9 general AI thought leaders** (Mollick, Willison, Ng, Latent
  Space, Lambert, Every/Shipper, Karpathy, AI Snake Oil, Dwarkesh)
- **8 practitioners** (Anthropic, OpenAI, Hamel, Eugene Yan, Jason Liu,
  Chip Huyen, Lenny, Shreya Shankar)

Several URLs are marked `# TODO: verify` and need a browser check
before seeding. Forbes/contributor RSS is the shakiest — fall back to
Gmail label routing where feeds 404.

## Pillar mapping

Scout assigns each item one of the four launch-spec pillars so the
downstream queue maps cleanly onto curriculum and `/research`:

| Pillar | Scout's question |
|--------|------------------|
| awareness | "what's happening / why it matters" |
| understanding | "how does it actually work" |
| creation | "build it / prompt it / configure it" |
| application | "deploy it in a banking workflow with controls" |

Each item also gets a **consequence level** (`low` / `medium` / `high`)
that flags how much harm a banker could do by getting it wrong.
Application-pillar + high-consequence items get priority in the Friday
digest because those are the artifacts the Institute most needs to ship.

## Supabase schema

One migration: [`content-engine/supabase/migrations/001_initial_schema.sql`](../content-engine/supabase/migrations/001_initial_schema.sql)

| Table | Purpose |
|-------|---------|
| `sources` | The 25 monitored feeds (active flag, last fetched) |
| `content_items` | Raw items pulled from feeds (dedup'd by `source_id + external_id`) |
| `content_scores` | Scout output — one or more per item, latest wins |
| `story_candidates` | Synthesizer output (schema in place, agent not built) |
| `content_with_latest_score` (view) | What the digest and review UI query |

This runs against the same Supabase project as the website. Tables are
namespaced clearly (`content_*` / `sources` / `story_candidates`) and
do not touch the existing `assessment_responses` / `course_enrollments`
schema. RLS is not enabled — service-role only, no client access from
the Next.js side until a review UI is built.

## Cost (steady state)

| Item | Estimate |
|------|----------|
| Haiku scoring | ~150 items/week × ~$0.0005/item ≈ **<$5/mo** |
| Modal | Free tier (one 30-min nightly + one weekly job) |
| Supabase | Free tier until `story_candidates` volume grows |
| Resend (digest send, day 13+) | Free tier (3k/mo) |

## 14-day build plan

The task file ([`tasks/content-engine.md`](../tasks/content-engine.md))
holds the granular checklist. Phases:

| Day | Phase |
|-----|-------|
| 1–2 | Supabase schema, env, Modal account |
| 3–4 | Verify 25 source URLs, seed |
| 5–6 | RSS ingester end-to-end (~20/25 sources) |
| 7 | First Haiku scoring run on ~50 real items |
| 8–9 | Hand-label 25–30 items as keep/skip; populate eval set |
| 10 | Run `eval_scout.py`; iterate prompt to **P/R > 0.8** |
| 11–12 | YouTube + Gmail ingesters |
| 13 | Weekly digest formatter + Resend send |
| 14 | Deploy Modal cron; first real Friday digest |
| 15–17 | Admin UI: auth, sources, queue (read-only) |
| 18–19 | Admin UI: rescore queue + digest preview/send |
| 20 | End-to-end QA on admin; founder sign-off |

## Eval discipline (non-negotiable)

Same rigor we applied to BFI extraction. Do not trust the scoring
prompt until it has been checked against ≥25 hand-labeled items and
the confusion matrix tracked.

- **Precision > 0.80** is the hard gate (false positives pollute the
  digest and waste the founder's review time)
- **Recall** matters less — missed items get caught on rescore
- Iterate `content-engine/src/aibi_scout/scoring/prompts.py` against
  `evals/scout_eval_set.jsonl` until precision clears the bar

## Admin UI (new — required for v1)

The original "use Supabase SQL editor + Friday digest" review path is
not enough. We need a **founder-only admin console** in the Next.js
app to manage the engine without writing SQL. This is in scope for v1
and adds Phase 10 + 11 below.

**Route:** `/admin/content-engine` (and sub-routes). Auth-gated to a
single founder email via Supabase Auth + an allow-list check (no new
role table for v1 — just an env var `ADMIN_EMAILS`).

**Views (v1):**

| Route | Purpose |
|-------|---------|
| `/admin/content-engine` | Dashboard — last cron run, items scored this week, top 10 by relevance |
| `/admin/content-engine/sources` | List + add + edit + toggle `active` on the 25 sources |
| `/admin/content-engine/queue` | Browse `content_items` joined to latest score; filter by score / pillar / source / date |
| `/admin/content-engine/queue/[id]` | Item detail — full excerpt, score history, rescore button |
| `/admin/content-engine/digest` | Preview this week's digest markdown + "send now" button |
| `/admin/content-engine/candidates` | (Phase 2) approve/reject `story_candidates` once Synthesizer ships |

**API routes (server-only, service-role Supabase):**

| Route | Verb | Purpose |
|-------|------|---------|
| `/api/admin/content-engine/sources` | GET / POST / PATCH | CRUD on `sources` |
| `/api/admin/content-engine/items` | GET | List items with latest score (filterable) |
| `/api/admin/content-engine/items/[id]/rescore` | POST | Re-run Scout on demand |
| `/api/admin/content-engine/digest/preview` | GET | Return markdown |
| `/api/admin/content-engine/digest/send` | POST | Send via Resend immediately |

**Auth:** every admin route + every API route checks
`session.user.email ∈ ADMIN_EMAILS`. Anything else → 404 (not 403 —
do not advertise that admin routes exist).

**Design:** Ledger system per CLAUDE.md. Newsreader display, Geist
body, JetBrains Mono for scores and timestamps. Tables use hairline
rules, no shadows. Score column is mono with tabular-nums. Pillar
badges use the soft pillar marks from the LMS prototype.

**Rescore endpoint design:** the admin app does not run Haiku itself
(no Python in Next.js). The `rescore` POST writes a row to a new
`rescore_requests` table; the Modal cron picks it up on its next run
(or we add a short-interval Modal function polling every 5 min). This
keeps secrets in Modal and avoids shipping Anthropic credentials to
Vercel.

## Out of scope (deferred)

These are **intentionally not built yet** — schema is in place via
`story_candidates`, but the agents wait until the queue has produced
≥3 weeks of validated data:

- **Synthesizer** — weekly clustering of related items into story candidates
- **Translator** — turning a story into a banker-specific framing
- **Formatter** — producing the actual artifact (essay, checklist, deck)
- **QA** — brand voice, banking specificity, slop check
- **Candidate review UI** — empty page in v1 (`/admin/content-engine/candidates`),
  wired up when Synthesizer ships
- **Multi-admin role table** — for v1, `ADMIN_EMAILS` env var is enough
- **Auto-publishing** to `/research` — every item goes through founder
  review before publication, full stop

## Decision points

Before any work starts, decide:

1. **Supabase project: shared or separate?** — Spec says shared. If we
   ever change our mind, the migration is straightforward (the engine
   schema is namespaced and isolated).
2. **Modal account scope** — engine-only secret (`aibi-scout-secrets`)
   so the engine credentials never co-mingle with website Vercel envs.
3. **Resend sender** — `scout@aibankinginstitute.com` (requires the
   subdomain to be added in Resend). The Friday digest is internal-only
   for the founder until format is locked.
4. **Gmail routing strategy** — dedicated Gmail address vs. a label on
   the personal address. Dedicated address is cleaner; label is
   faster to set up. Recommend dedicated address before going live.

## Success criteria

- [ ] Nightly Modal cron runs without manual intervention for 14
      consecutive days
- [ ] Eval set returns Precision > 0.80, Recall > 0.50
- [ ] Friday digest renders cleanly in email, groups by pillar, links work
- [ ] First three weeks produce ≥ 3 items per week scoring 7+
- [ ] No unsourced statistics enter the queue (Scout always cites source)
- [ ] Founder spends < 30 min/week reviewing the digest

## After this ships

Decision gate: **does the queue quality justify the Synthesizer +
Formatter agents, or does scoring need another iteration?** The answer
comes from the first three Friday digests plus eval re-run.

## References

- Engine code: [`content-engine/README.md`](../content-engine/README.md)
- Canonical launch spec: [`aibi-launch-spec-v2.md`](./aibi-launch-spec-v2.md)
- Research page brief: [`research-page-design-brief.md`](./research-page-design-brief.md)
- Citations rule: [`../CLAUDE.md`](../CLAUDE.md) → "Citations Always"
