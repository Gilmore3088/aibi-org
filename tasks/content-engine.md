# Content Engine — Scout + Queue Task List

Plan: [`Plans/content-engine.md`](../Plans/content-engine.md)
Code: [`/content-engine/`](../content-engine/)

Updated 2026-05-18 (initial draft from upstream zip).

---

## Phase 1 · Days 1–2 · Infrastructure

- [x] Decide Supabase project: shared with website (2026-05-18 — see `DECISIONS.md`). Migration relocated to `supabase/migrations/00034_content_engine_schema.sql`.
- [ ] Apply `supabase/migrations/00034_content_engine_schema.sql` to the shared project (via Supabase CLI / dashboard alongside the website migrations)
- [ ] Confirm tables created: `sources`, `content_items`, `content_scores`, `story_candidates`
- [ ] Confirm view created: `content_with_latest_score`
- [ ] Confirm extensions: `uuid-ossp`, `pg_trgm`
- [ ] Create Modal account (`pip install modal && modal token new`)
- [ ] Create Modal secret `aibi-scout-secrets` with `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`
- [ ] Local: `cd content-engine && uv venv && source .venv/bin/activate && uv pip install -e .`
- [ ] Local: `cp .env.example .env` and fill in real values (do NOT commit)

## Phase 2 · Days 3–4 · Verify and seed sources

- [ ] Open each `# TODO: verify` URL in `content-engine/src/aibi_scout/sources.py`:
  - [ ] Ron Shevlin (Forbes)
  - [ ] Theodora Lau (Substack)
  - [ ] Andrew Ng (The Batch)
  - [ ] Karpathy (rare feed)
  - [ ] Anthropic News
  - [ ] OpenAI Blog
  - [ ] Jason Liu (jxnl.co)
  - [ ] Chip Huyen
  - [ ] Shreya Shankar
- [ ] For any 404s: pivot to Gmail label route OR drop from the seed list
- [ ] `python scripts/seed_sources.py` — confirm 25 rows inserted (idempotent)

## Phase 3 · Days 5–6 · RSS ingester end-to-end

- [ ] `modal run modal_app.py::nightly_scout` — confirm ≥ 15 sources return items
- [ ] Inspect first 50 rows in `content_items` for shape (title, excerpt, published_at, dedupe behavior)
- [ ] Fix any feedparser oddities (Substack date formats, missing authors, HTML excerpts)
- [ ] Confirm dedup: re-run; new rows should be 0 (unique violation handled)

## Phase 4 · Day 7 · First Haiku scoring run

- [ ] Run `nightly_scout` again with scoring enabled; capture stats
- [ ] Spot-check ~10 scores in `content_scores` against gut sense
- [ ] Note items where Scout was obviously wrong — they become eval seed candidates

## Phase 5 · Days 8–9 · Hand-label eval set

- [ ] Pick 25–30 real items from `content_items` covering all 3 categories
- [ ] Skew the set toward edge cases (close-call items, not obvious keeps)
- [ ] Label each `keep` / `skip` in `evals/scout_eval_set.jsonl`
- [ ] Include ~30% skip items so precision is measurable
- [ ] Cover all 4 pillars in the keep set

## Phase 6 · Day 10 · Eval and iterate

- [ ] `python scripts/eval_scout.py evals/scout_eval_set.jsonl --threshold 5`
- [ ] Read every false positive; identify pattern
- [ ] Sharpen the rubric in `content-engine/src/aibi_scout/scoring/prompts.py`
- [ ] Re-run until **Precision > 0.80** (hard gate)
- [ ] Record before/after confusion matrix in a comment at top of `prompts.py`

## Phase 7 · Days 11–12 · YouTube + Gmail ingesters

- [ ] YouTube: `pip install youtube-transcript-api yt-dlp`; implement `ingesters/youtube.py`
- [ ] YouTube: pick 2–3 channels to test (Mollick if available; otherwise an AI podcast)
- [ ] Gmail: choose strategy — dedicated address (recommended) vs. label on personal
- [ ] Gmail: OAuth flow → save `token.json` → mount as Modal secret OR use IMAP fallback
- [ ] Gmail: implement `ingesters/gmail.py`; confirm American Banker emails ingest cleanly
- [ ] Both: add try/except so a failing source does not abort the run

## Phase 8 · Day 13 · Weekly digest

- [ ] Wire Resend: add `RESEND_API_KEY` to Modal secret + local `.env`
- [ ] Implement `markdown_to_html` (use `markdown` or `mistune`)
- [ ] Add Resend send to `build_and_send_digest()` (TODO block already in place)
- [ ] Confirm sender domain `aibankinginstitute.com` (or subdomain) verified in Resend
- [ ] Send first manual digest to founder; review formatting in Gmail + Apple Mail

## Phase 9 · Day 14 · Deploy cron

- [ ] `modal deploy modal_app.py` — confirm two cron schedules registered
  - [ ] Nightly Scout: `0 7 * * *` (07:00 UTC)
  - [ ] Weekly digest: `0 14 * * 5` (Friday 14:00 UTC)
- [ ] Set a calendar reminder for Friday — confirm digest arrived
- [ ] Add Modal dashboard URL to `docs/handoffs/content-engine-deployed-YYYY-MM-DD.md`

---

## Phase 10 · Days 15–17 · Admin UI (read paths)

- [ ] Add `ADMIN_EMAILS` to `.env.local.example` (comma-separated)
- [ ] `src/lib/admin/isAdmin.ts` — server helper, returns `true` only if `session.user.email ∈ ADMIN_EMAILS`
- [ ] `src/app/admin/layout.tsx` — gate every child route; 404 (not 403) on non-admin
- [ ] Migration: add `rescore_requests` table (id, content_item_id, requested_by, requested_at, processed_at)
- [ ] `/admin/content-engine` dashboard page (last cron run, items this week, top 10)
- [ ] `/admin/content-engine/sources` — table view of all sources
- [ ] `/admin/content-engine/queue` — paginated, filterable (score / pillar / source / date)
- [ ] `/admin/content-engine/queue/[id]` — detail view, full excerpt + score history
- [ ] `/api/admin/content-engine/sources` GET
- [ ] `/api/admin/content-engine/items` GET (filterable)
- [ ] Ledger styling: hairline tables, mono scores with tabular-nums, soft pillar badges
- [ ] Skip-link, focus rings, WCAG 2.1 AA pass

## Phase 11 · Days 18–19 · Admin UI (write paths + digest)

- [ ] `/api/admin/content-engine/sources` POST/PATCH (toggle `active`, add new source)
- [ ] `/api/admin/content-engine/items/[id]/rescore` POST — writes to `rescore_requests`
- [ ] Modal: add `process_rescore_requests` function on 5-min schedule
- [ ] `/admin/content-engine/digest` — render markdown via the same code path as the Friday send
- [ ] `/api/admin/content-engine/digest/preview` GET
- [ ] `/api/admin/content-engine/digest/send` POST (calls Resend with founder confirmation modal)
- [ ] Empty-state page at `/admin/content-engine/candidates` ("Synthesizer not yet shipped")

## Phase 12 · Day 20 · Admin UI QA

- [ ] Founder walks the admin end-to-end on iPhone Safari + desktop Chrome
- [ ] Confirm non-admin email gets 404 on every admin route
- [ ] Confirm rescore round-trip: trigger from UI → Modal picks up → new score appears in queue
- [ ] Confirm "send digest now" delivers to Resend test inbox
- [ ] Add admin URL + admin email allow-list to `docs/handoffs/content-engine-deployed-YYYY-MM-DD.md`

---

## Ship gate

All checked before marking plan `shipped`:

- [ ] 14 consecutive nights of clean cron runs
- [ ] Precision > 0.80, Recall > 0.50 on the eval set
- [ ] 3 consecutive Friday digests delivered without manual fix
- [ ] First digest produced ≥ 3 items scoring 7+
- [ ] Founder review time per digest < 30 min
- [ ] Admin UI: founder can browse queue, rescore, send digest without writing SQL
- [ ] Admin UI: non-admin email gets 404 on every admin route (no info leak)

---

## After ship — decision gate

- [ ] Decide: build Synthesizer + Formatter agents next, OR another scoring iteration first
- [ ] Document decision in [`../DECISIONS.md`](../DECISIONS.md)
- [ ] If green-lit: open `Plans/content-engine-synthesizer.md`

---

## Out of scope (do not creep)

- Synthesizer agent (weekly clustering) — schema is in place via `story_candidates`
- Translator / Formatter agents
- QA agent (brand voice, banking specificity)
- Review UI — use Supabase SQL editor + the Friday digest
- Auto-publishing to `/research` — every item goes through founder review
