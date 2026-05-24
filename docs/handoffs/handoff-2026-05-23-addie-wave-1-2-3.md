# Handoff — ADDIE Foundation rebuild (Wave 1+2+3 shipped)

*Author: 2026-05-23 session · branch `feature/addie-v1` · status: code-complete, runtime-debugging in progress · DRAFT for next session*

## TL;DR

The full ADDIE Foundation Course rebuild landed in 22 commits today on `feature/addie-v1`: schema (19 `addie.*` tables + 3 storage buckets), sandbox service (3 providers + 8/8 §14 security tests), auth + payments (Stripe × 3 products + gate fork + team seats), web app shell (10 routes + 24 components + lesson player), all 6 modules seeded (M0–M5: 24 lessons, 25 track variants, 55 KCs, 13 exercises including 3 real LLM sandboxes), $99 assessment results surface, team admin dashboard, full audit doc. **337/337 tests pass; `npx tsc --noEmit` clean.**

Then we tried to actually use it locally — and hit a string of runtime bugs that the unit tests don't catch and the audit didn't surface. **The build is not yet runnable end-to-end as a learner.** This doc captures every bug, the fix path, the bigger themes, and what to do first next session.

## Branch state

- **Branch:** `feature/addie-v1`, 22 commits ahead of `main`.
- **HEAD:** `55f86fa` (Wave 3c audit doc + 3 soft polish items).
- **Tests:** 66 files / 337 tests / 0 fail.
- **Typecheck:** `npx tsc --noEmit` clean.
- **DB live state:** 19 `addie.*` tables + 3 storage buckets applied to the shared Supabase project (`gbmhrqubbervdltvtpur`); `public.*` untouched.
- **Test/preview environment:** unverified. Live runtime test today was local dev (`npm run dev` on `localhost:3000` with `COMING_SOON=false`).

## What works (verified runtime)

- ✅ Schema applied; all 19 `addie.*` tables + 2 views + 3 storage buckets queryable via `supabase db query --linked`.
- ✅ Server compiles. Dev server boots. All addie routes return HTTP 200.
- ✅ `/foundation` (course home) renders course overview from `addie.modules`.
- ✅ `/foundation/[moduleId]/[lessonId]` renders the real lesson title + body_md after PostgREST exposure fix.
- ✅ Lesson modality dispatch routes correctly to VideoLessonView / AudioLessonView / InteractiveLessonView / SandboxLessonView / etc.
- ✅ The 6 module records, the 24 lessons, the 25 track variants are all in the DB and reachable.

## What's broken (this session's runtime bug list — fix these first)

### B1. PostgREST schema-exposure was off. **FIXED at runtime, NOT yet codified in a migration.**

- **Symptom:** every `addie.*` query from the JS SDK returned null; lesson pages rendered the Next.js notFound() UI.
- **Root cause:** Wave 1 migration `00037_addie_schema_init.sql` GRANTed USAGE on the schema but PostgREST's exposed-schema allowlist (`pgrst.db_schemas`) did NOT include `addie`. The migration was written on the (wrong) theory that "addie traffic flows through API routes, not PostgREST" — but those routes use the same Supabase JS SDK which calls PostgREST.
- **Runtime fix applied:**
  ```sql
  ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, storage, graphql, addie';
  NOTIFY pgrst, 'reload config';
  NOTIFY pgrst, 'reload schema';
  ```
- **Followup needed before merge:** a new migration `00055_addie_grants_and_exposure.sql` codifying both the schema exposure AND the table-level grants below (B2). The current runtime fix is at the role level and could be overwritten by a dashboard save. The grants are even more urgent because they affect every environment.

### B2. Table-level grants missing for `service_role` + `authenticated`. **FIXED at runtime, NOT yet codified in a migration.**

- **Symptom:** even after schema exposure, PostgREST returned `42501: permission denied for table modules`.
- **Root cause:** service_role bypasses RLS but still needs raw table-level `GRANT SELECT/INSERT/...`. Migration 00037 only granted `USAGE` on the schema. No table grants anywhere in 00037–00054.
- **Runtime fix applied:** see commit log of the dev-debug session.
- **Followup needed:** codify the grants into a migration. Include `ALTER DEFAULT PRIVILEGES IN SCHEMA addie GRANT ALL ON TABLES TO service_role` so future tables auto-grant.

### B3. Knowledge-check submit returns HTTP 401 for every anon visitor. **NOT FIXED.**

- **Symptom:** clicking a multiple-choice answer on a free lesson returns 401 from `/api/addie/checks/respond`.
- **Root cause:** that route requires either a Supabase session OR a signed `aibi_addie_anon` cookie. Anon visitors have neither. The cookie is only minted when something explicitly calls `ensureAnonSession(req, res)` — the `(addie)` layout never does. So every fresh visitor's anon flow is broken before they can complete a single KC.
- **Fix path:** add `ensureAnonSession` to either (a) the `(addie)/layout.tsx` server-component (preferred), or (b) Next.js middleware scoped to the `(addie)` route group. Setting it in the layout means it fires on every addie page load; the cookie is set on the response.
- **Side effect:** the lesson page's KC, Toolbox save, and any future "I'm done" completion mark all depend on this cookie. Fixing this fixes the whole anon side.

### B4. Other runtime issues the user surfaced but we didn't get to enumerate

The user reported "there are a lot of issues" beyond the two named. They are not enumerated in this draft. **Action for next session: do a click-through of the 8 spot-checked routes, capture each broken interaction in a new section of this doc, prioritize, fix in order.**

### B5. Audit-identified soft items from `AiBI_Wave_1_2_3_Audit_2026-05-23.md` §I

- ~~Auth href `/auth/sign-in` → `/auth/login`~~ — fixed in commit `55f86fa`.
- ~~PayOptionCard "unlocked" → "access"~~ — fixed in commit `55f86fa`.
- ~~Start_Here.md §7 stale~~ — refreshed in commit `55f86fa`.
- Lesson-side analytics emits still missing (`lesson_view`, `lesson_complete`, `artifact_save`, `toolbox_reuse`).
- On-main `/assessment/in-depth` runner does NOT call new `/api/addie/assessment/results` endpoint.
- Anon→lead artifact migration is sequential not transactional.
- Resend signed-token invite template (currently MailerLite stub).
- MailerLite unsubscribe webhook → flip `addie.leads.marketing_opt_in`.

## Bigger themes (worth confronting before more building)

1. **Unit tests don't catch runtime integration bugs.** Tests pass at 337/337 and the audit returned a Conditional GO, yet the most basic learner action (load a lesson, answer a KC) fails. The seam between Supabase JS SDK ↔ PostgREST exposure ↔ Postgres grants is a known-tricky stack and we shipped with zero verified end-to-end runtime test. **Need:** a small Playwright E2E that loads `/foundation/m0/m0.1`, clicks a KC answer, asserts the response is graded. That single test would have failed today.

2. **Schema-isolation theory ran into PostgREST reality.** The original design said "client traffic goes through API routes; addie schema stays invisible to PostgREST." In practice, every server route uses the same Supabase JS SDK which uses PostgREST. The isolation we shipped is real (it's still invisible to the anon key) but the rationale in `00037` is misleading. Update the comment in 00037 + add a DECISIONS.md entry walking back that one sentence.

3. **Maintain-trackers-as-you-work helped at the doc layer but didn't prevent runtime drift.** The trackers accurately say what shipped at the code layer. They don't track runtime smoke. New rule for Wave 4: every wave commit must include at least one route screenshot or a curl-assert of the page rendering real content.

4. **Operator vs. engineer scope discipline held.** Six items genuinely required dashboard work (Stripe price renames, webhook endpoint, env vars, storage buckets, schema exposure if we'd routed it that way). Engineering got to ship a coherent code change set without any "the operator should…" cop-outs sprinkled through. Worth preserving in Wave 4.

## Wave 4 punch list — priority order

**Tier 1 — fix-before-anyone-tries-the-course-again:**
- [ ] Codify B1 + B2 as migration `00055_addie_grants_and_exposure.sql` (5 min).
- [ ] Fix B3: add `ensureAnonSession` to `(addie)/layout.tsx` (10 min).
- [ ] Click-through every addie route (10 routes), log every issue into B4 (30 min).
- [ ] Add at least one Playwright E2E that loads a lesson and submits a KC (1 hr).

**Tier 2 — fix-before-merge:**
- [ ] Wire on-main `/assessment/in-depth` runner → POST `/api/addie/assessment/results` (1 hr).
- [ ] Add lesson-side analytics emits (`lesson_view` / `lesson_complete` / `artifact_save` / `toolbox_reuse`) (1 hr).
- [ ] Make anon→lead artifact migration transactional via a Postgres function (30 min).

**Tier 3 — pre-pilot:**
- [ ] Resend signed-token seat-invite template + endpoint (replaces MailerLite stub).
- [ ] MailerLite unsubscribe webhook → flip `addie.leads.marketing_opt_in`.
- [ ] Run the §12 pre-pilot security gate; publish Privacy Policy + ToS + `/security` page.
- [ ] Full WCAG 2.1 AA audit; iPhone Safari smoke pass.

**Tier 4 — operator pre-pilot work (engineering can't do):**
- [ ] Record + edit + caption + transcribe ~13 videos + 2 audios + 5 m1.3 audio variants.
- [ ] Stripe live-mode price IDs.
- [ ] MailerLite assessment + nurture sequences authored.
- [ ] Vendor commercial-API data terms verified (Anthropic/OpenAI/Google).
- [ ] Resolve employment / IP / conflict-of-interest position before commercial sales.

## How to resume next session

1. **Open this doc first.** It's the truth of where we left off.
2. **Confirm branch:** `git -C ~/Projects/TheAiBankingInstitute/.worktrees/addie-v1 log --oneline -5` should show `55f86fa` at HEAD.
3. **Confirm DB state:** `supabase db query --linked --agent=no "SELECT count(*) FROM addie.lessons;"` should return 24.
4. **Start dev server:** `cd ~/Projects/TheAiBankingInstitute/.worktrees/addie-v1 && COMING_SOON=false npm run dev`. Browse to `localhost:3000/foundation`.
5. **First task:** fix B1 + B2 (codify the grants) + B3 (anon session). That's an hour. The course should be usable as a learner after that.
6. **Second task:** click-through every route, fill in B4, prioritize.
7. **Third task:** Playwright E2E for the lesson-load-and-KC path. Don't ship Wave 4 fixes without it.

## File map (where to look for what)

- **Specs (source of truth):** `docs/Foundation-Course-ADDIE/*.md` — Start_Here, PRD, ADDIE Design v2, Module PRDs, etc.
- **Decisions log:** `DECISIONS.md` — every 2026-05-23 entry.
- **Audit:** `docs/Foundation-Course-ADDIE/AiBI_Wave_1_2_3_Audit_2026-05-23.md` — full gate-by-gate.
- **Trackers:** `docs/Foundation-Course-ADDIE/AiBI_Module_Production_Tracker.md`, `AiBI_Launch_Checklist.md`, `AiBI_Handoff_Docs_Checklist.md`.
- **Schema:** `supabase/migrations/00037–00054` (18 files, all `addie.*`).
- **Seed content:** `supabase/seed/m0_addie.sql` … `m5_addie.sql` (6 files).
- **Sandbox service:** `sandbox-service/` (19 files; the LLM-key boundary).
- **Web app shell:** `src/app/(addie)/` (10 routes), `src/components/addie/` (65 components).
- **Server libs:** `src/lib/addie/` (auth, leads, entitlements, stripe, team, toolbox, checks, courses, assessment, sandbox, rateLimit, supabase).
- **API routes:** `src/app/api/addie/` (gate, checkout, webhooks, team/seats, assessment, toolbox, checks), `src/app/api/sandbox/` (run, ab), `src/app/api/skill/` (run).
- **Interactive widgets:** `src/components/addie/interactives/{m0,m1,m2,m3,m4,m5}/` (4 widgets in m0/m1/m2/m3; 2 in m4; 3 in m5).
- **Toolbox templates:** `src/content/addie/toolbox-templates/{m0..m5}/*.md` (12 templates total).

## Lessons captured this session (saved to memory)

- `feedback_maintain_trackers_as_you_work.md` — tick the trackers in the same commit that lands the work. Don't let them drift across waves.
- `feedback_mv_breaks_symlinked_env.md` — never `mv tmp dest` onto a symlinked `.env.local`; use `cat tmp > dest` to write through the symlink.

## Open questions for the operator (you)

1. Do you want the merge to happen NOW (with the Tier 1 punch list as immediate follow-up PRs) or AFTER Tier 1 is done? The audit said "Conditional GO" — runtime bugs B1+B2+B3 push that toward "soft no until Tier 1 done."
2. Are you willing to add a Playwright dependency? It would have caught all three runtime bugs and is the single biggest quality leverage point for Wave 4.
3. The audit caught design drift in the schema-init theory; do you want a DECISIONS.md entry walking back the rationale, or just leave the migration comment misleading?

— End of draft. Iterate in next session.
