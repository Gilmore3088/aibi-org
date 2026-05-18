# AiBI Content Engine — Scout + Queue

The first stage of The AI Banking Institute content engine. Pulls AI content nightly from 25 sources, scores each item for community-bank relevance with Claude Haiku, and surfaces a weekly digest of high-signal items.

This is the **Scout + queue** milestone. Synthesizer, Translator, Formatter, and QA agents come after the queue is validated.

> **Project context:** the strategic plan lives at
> [`../Plans/content-engine.md`](../Plans/content-engine.md). The
> ordered task list lives at [`../tasks/content-engine.md`](../tasks/content-engine.md).
> A founder-only admin UI (in the Next.js app at `/admin/content-engine`)
> is in scope for v1 — see the plan's "Admin UI" section.

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

## Setup

### 1. Supabase
- Create a project at supabase.com
- Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
- Copy the project URL and `service_role` key

### 2. Modal
- `pip install modal && modal token new`
- Create a secret named `aibi-scout-secrets` in the Modal dashboard with:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `ANTHROPIC_API_KEY`

### 3. Local install
```bash
uv venv && source .venv/bin/activate
uv pip install -e .
cp .env.example .env  # fill in
```

### 4. Verify the 25 source URLs
`src/aibi_scout/sources.py` lists 25 sources. URLs marked `# TODO: verify` need a quick check before seeding — open each in your browser, confirm it returns a valid feed.

### 5. Seed and run
```bash
python scripts/seed_sources.py
modal run modal_app.py::nightly_scout  # one-off test run
modal deploy modal_app.py              # enable nightly cron
```

## The 14-day plan

| Day   | Task                                                              |
| ----- | ----------------------------------------------------------------- |
| 1–2   | Supabase schema, env, Modal account                                |
| 3–4   | Verify the 25 source URLs, seed                                    |
| 5–6   | RSS ingester working end-to-end (covers ~20 of 25 sources)         |
| 7     | First Haiku scoring run on ~50 real items                          |
| 8–9   | Hand-label 25–30 items as keep/skip; populate `evals/scout_eval_set.jsonl` |
| 10    | Run `scripts/eval_scout.py`; iterate the prompt until P/R > 0.8    |
| 11–12 | YouTube + Gmail ingesters                                          |
| 13    | Weekly digest formatter + email send (Resend recommended)          |
| 14    | Deploy Modal cron; first real Friday digest                        |

After ~3 weeks of live data: decide whether queue quality justifies the Synthesizer + Formatter agents, or whether scoring needs another iteration.

## Eval discipline

Same rigor you applied to BFI extraction. Don't trust the scoring prompt until you've checked it against ≥25 hand-labeled items and tracked the confusion matrix. Track:
- **Precision** (when Scout says "keep," does the operator agree?) — matters most; false positives pollute the queue
- **Recall** (when the operator would keep, does Scout catch it?) — matters less; missed items get caught on rescore

## Adding a source

Edit `src/aibi_scout/sources.py` and re-run `scripts/seed_sources.py` (idempotent — only inserts new).

## What's intentionally not here yet

- **Synthesizer** agent (weekly clustering) — schema in place via `story_candidates` table
- **Translator + Formatter** agents (artifact generation)
- **QA** agent (brand voice, banking specificity, slop check)
- **Review UI** — use Supabase SQL editor + Friday digest until queue volume forces an upgrade

## Cost (steady state)

- Haiku scoring: ~150 items/week × ~$0.0005/item ≈ **<$5/month**
- Modal: free tier likely sufficient (one 30-min nightly job + one weekly job)
- Supabase: free tier sufficient until story_candidates volume grows
