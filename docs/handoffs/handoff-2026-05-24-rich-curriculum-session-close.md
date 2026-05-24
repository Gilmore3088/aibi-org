# Handoff — feature/addie-v1 rich curriculum + AI experience session close (2026-05-24)

*Frozen snapshot. Branch `feature/addie-v1` · HEAD `5ce76c6` · 67 commits ahead of `main`. All work pushed to `origin/feature/addie-v1`. 405/405 tests · `tsc --noEmit` clean.*

## TL;DR

Continuation session from `handoff-2026-05-24-addie-session-close.md`. Started by closing the three concrete deferred items the prior handoff flagged (animations #40, sandbox cost dashboard #36, MailerLite triggers #35) plus the m1.1 sticky-TOC bug. Then took on the user's escalating goals: a fix for the duplicate-nav + HTTP-500 bug visible at `/foundation/gate`, then a full content audit, then the "build for a high-end AI experience" mandate which became the in-lesson AI tutor, a new rich visual vocabulary in the LessonBody renderer, anchor-lesson upgrades across all six modules, and the per-lesson AI completion summary card. Eleven commits, all live on the branch.

## Branch state

- **HEAD:** `5ce76c6 feat(addie): per-lesson AI completion summary (audit §3.2)`
- **Commits ahead of main:** 67 (this session added 11)
- **Tests:** 405/405 passing · `npx tsc --noEmit` clean (filter `addie-v1-stash/`)
- **Pushed to:** https://github.com/Gilmore3088/aibi-org/tree/feature/addie-v1
- **Dev server:** running at `localhost:3000` (background task `b0zak8gzc`) — kill with `lsof -ti:3000 | xargs kill`

## What shipped this session (in order)

### Wave 1 — closing the prior handoff's deferred items

| # | Commit | Detail |
|---|---|---|
| 1 | `162464e` | **m1.1 TOC fix.** Script-only lessons (only `## SCRIPT` + `## PRODUCTION` h2s) had an empty TOC because both were stripped. Promoted numbered scene leads (`**One: …**` etc.) to virtual h3 headings; gave the matching scene cards `id={slugifyHeading(lead)}` so scroll-to + scroll-spy resolve. |
| 2 | `671ccfe` | **#40 element-level animation wiring.** Added `addie-illus-*` classNames to SVG sub-elements in `ModuleIllustration.tsx` so the existing CSS keyframes (needle sweep, token pulse, arrow nudge, bar shimmer, card shuffle, launch loop) actually fire. M4 cards needed wrapper groups since they carry SVG transform attrs. |
| 3 | `f0bff67` | **#36 /admin/sandbox dashboard.** New operator surface for LLM-spend budget + abuse signals. Four LedgerCard panels: per-provider daily spend vs cap (oxblood ≥100%, gold ≥80%), session volume split by mode + identity, flagged-session list with reasons, top exercises by spend. Reads `addie.sandbox_sessions` + `addie.sandbox_spend` via service-role. Added to admin SUBNAV. `SANDBOX_DAILY_BUDGET_USD` defaults to $20. |
| 4 | `a7977a7` | **#35 MailerLite lifecycle triggers.** Two pieces: (a) `/api/addie/gate/capture-email` now subscribes the lead to `MAILERLITE_GROUP_ID_GATE_EMAIL` after upsert + emit. (b) New nightly cron `/api/addie/cron/abandoned-gate` (05:00 UTC, vercel.json) sweeps source=gate leads 72h–14d old, skips paid/active/already-notified, subscribes the rest to `MAILERLITE_GROUP_ID_GATE_ABANDONED`, emits `gate_abandoned_notified` for idempotency. |

### Wave 2 — the user reported "sign in not working appropriately. repeat navs"

| # | Commit | Detail |
|---|---|---|
| 5 | `197152d` | **Repeat-nav + HTTP-500 fix.** Two bugs visible at `/foundation/gate`: (a) global SiteNav stacking on AddieNav because the middleware set `x-pathname` only on the response, but `RootLayout` reads it from `next/headers` which sees REQUEST headers — fixed by forwarding `x-pathname` on the request headers via `NextResponse.next({ request: { headers } })` everywhere. Also added `/foundation` and `/account` to `CHROMELESS_PATHS`. (b) HTTP 500 in the Pay $295 / Buy Seats cards because `src/lib/stripe.ts` threw at module-import time when `STRIPE_SECRET_KEY` was unset → HTML 500 → `res.json()` failed → "HTTP 500" with no detail. Made the Stripe client lazy via `Proxy` so throws land inside the route's try/catch and return JSON; `PayOptionCard` now reads `body.detail` too. |

### Wave 3 — content audit + the "high-end AI experience" mandate

| # | Commit | Detail |
|---|---|---|
| 6 | `20c06a6` | **Foundation course content audit.** `docs/reviews/foundation-course-content-audit-2026-05-24.md` (197 lines). Headline: data + code skeleton essentially complete (24 lessons, 55 KCs, 20 track variants, 12 toolbox templates, 13 sandbox configs, all interactive widgets). Two real content gaps (M0 dual-layer + M1–M5 curriculum docs) + eight high-end AI builds proposed with leverage ranking. |
| 7 | `ae837dd` | **In-lesson AI tutor (audit §3.1).** First AI-native feature. Migration 00060 adds `tutor_conversation` to artifact_type enum. PII guard (mirrors sandbox-service). Tutor system prompt locks Claude Haiku to lesson body + role track + data-discipline rule + hard rules against revealing the prompt or roaming past current lesson. POST `/api/addie/tutor/stream` rate-limited 20/IP/hr, NDJSON stream, emits `tutor_query` + `tutor_blocked_pii` events. `LessonTutor.tsx` — fixed bottom-right chip → side-rail sheet, streaming with blinking caret, ⌘⏎ to send, Esc to close. |

### Wave 4 — rich visual curriculum vocabulary

| # | Commit | Detail |
|---|---|---|
| 8 | `3a3cbc8` | **Visual vocabulary + 4 anchor lessons.** Renderer gains two block types: `[stat]` (sourced statistic card, pipe-delimited value\|source\|takeaway) and `[case:good]`/`[case:bad]` (case-study cards with optional `[outcome]` footer, auto-grouped into a 1/2/3-up grid). New `AiBI_Curriculum_Visual_Vocabulary.md` in `docs/Foundation-Course-ADDIE/` documents all 8 block types with when-to-use, when-NOT-to-use, and a worked M1.4 example. Anchor lessons upgraded: m0.1 (dual-layer rewrite + stat/save/tip), m0.2 (stat + save + paired case:bad/case:good), m1.4 (FDIC efficiency-ratio stat + 5-card grid), m3.1 (4-part stat + 4-case grid for Role·Task·Context·Format). |
| 9 | `2997a5b` | **Blockquote walker fix.** Cards weren't rendering — the walker treated bare blank lines as paragraph breaks INSIDE blockquotes, so the `[stat]`/`[case]` blocks separated by a blank line were being absorbed into the preceding hero quote. Now the walker terminates at any bare blank line; canonical inside-quote paragraph breaks use the empty `>` marker which still starts with `>`. |
| 10 | `7428c2b` | **m2.1/m4.1/m5.1 anchor upgrades.** Completed the rollout across all six modules. m2.1 = 3-card mixed grid (2 good + 1 bad) for SSO identity choices. m4.1 = 3-card all-good grid for "Saved beats remembered / The anatomy / Bounded scope is the feature." m5.1 = 3-card mixed grid for assistant/skill/agent — agent intentionally `[case:bad]` per editorial position. |

### Wave 5 — second AI-native feature

| # | Commit | Detail |
|---|---|---|
| 11 | `5ce76c6` | **Per-lesson AI completion summary (audit §3.2).** Bottom of every lesson now shows a 3-sentence Claude-generated recap referenced to the learner's role track. Cached per `(lesson_id, identity)` in `addie.events` action=`lesson_summary_generated` — no new table. `~$0.001` per learner per lesson; cache hits approach 100% after first generation. `LessonSummaryCard.tsx` renders inline below the LessonPlayer with a "YOUR RECAP" kicker and a "stored in your course journal" footer. Verified live: m1.1 generated a real recap referencing the lesson's loan-file analogy. |

## Local DB state

The three seed-body upgrades (m0, m1, m3) and the three targeted UPDATEs (m2.1, m4.1, m5.1) were **applied to the linked Supabase project** via `supabase db query --linked`. Migrations 00055–00059 from the prior handoff plus 00060 added this session are present in the repo but **not auto-applied** — they remain operator action per the prior handoff.

| Migration | Purpose | Applied? |
|---|---|---|
| 00055 | PostgREST grants | (operator) |
| 00056 | sales_leads | (operator) |
| 00057 | billing_audit | (operator) |
| 00058 | modules.hero_image_url | (operator) |
| 00059 | modules.intro_video_url | (operator) |
| 00060 | artifact_type += tutor_conversation | (operator) — required before tutor save-to-Toolbox |

## Env vars added or used this session

All have safe defaults; site works without them:

- **`MAILERLITE_GROUP_ID_GATE_EMAIL`** — gate-email nurture group (Wave 1)
- **`MAILERLITE_GROUP_ID_GATE_ABANDONED`** — abandoned-gate group, gated by the cron (Wave 1)
- **`SANDBOX_DAILY_BUDGET_USD`** — defaults to $20 (Wave 1)
- **`ANTHROPIC_API_KEY`** — already required pre-session; now also drives the tutor (Wave 3) + lesson summary (Wave 5)

## What's deferred (still open in code)

| Item | Source | Status |
|---|---|---|
| #19 Per-concept micro-interactions inside lesson body | prior handoff | Still deferred. Vocabulary upgrade (this session) provides the visual hooks; the next move is click-to-reveal definitions on banker jargon. |
| Audit §3.3 Adaptive sandbox prompts based on KC performance | content audit | Open |
| Audit §3.4 Pre-generated demo outputs on marketing surfaces | content audit | Open |
| Audit §3.5 Per-learner "AI Banking Brief" digest | content audit | Open |
| Audit §3.6 TTS voice mode | content audit | Open |
| Audit §3.7 Multi-modal artifact composition | content audit | Open |
| Audit §3.8 Daily generated citations | content audit | Open |
| M1–M5 detailed curriculum docs | prior handoff + audit §2.2 | User explicitly deprioritized this session ("not in same shape"); pattern is the M0 doc — see `AiBI_Curriculum_Visual_Vocabulary.md` for the visual half. |
| m2/m4/m5 KC seed idempotency | discovered Wave 4 | The KC INSERTs in m2/m4/m5 seeds lack `ON CONFLICT (lesson_id, ordinal) DO UPDATE` so the seeds aren't safely re-runnable. Add the clause. ~30 min. |

## Operator action items (out of code)

Carries forward from the prior handoff plus this session's additions:

1. **Apply migration 00060** to enable `tutor_conversation` Toolbox saves.
2. **Configure Stripe Customer Portal** in dashboard — `billingPortal.sessions.create` still throws until done.
3. **Set the new env vars** above in Vercel Production + Preview scopes.
4. **Record + caption** the 13 videos + 2 audio lessons + 5 m1.3 audio variants + 6 module intro videos.
5. **Confirm Stripe live keys** in `.env.local` if running locally — without them, the gate cards render "STRIPE_SECRET_KEY is not set" (which is what they should say, post-Wave-2 fix).
6. **Author MailerLite groups for the two new lifecycle automations** (gate-email + gate-abandoned).
7. Apply remaining content gaps from the audit at operator discretion using the new `[stat]`/`[case]` vocabulary documented in `AiBI_Curriculum_Visual_Vocabulary.md`.

## Two open questions for next session

1. **Adaptive sandbox prompts (audit §3.3)** — should the M2.3/M3.2/M3.5 sandbox presets filter based on the learner's prior KC results? Filter out the basic preset when the learner aced prompting; offer scaffolded starters when they failed. ~1 day. Closes the loop between assessment and practice.
2. **Per-learner Brief digest (audit §3.5)** — weekly Resend-delivered "Brief for [name], [track]" that ties saved Toolbox artifacts + role-relevant industry data into a personalized digest. ~2 days. The single highest-LTV move from the audit since it re-engages learners between modules.

## How to resume

```bash
cd /Users/jgmbp/Projects/TheAiBankingInstitute/.worktrees/addie-v1
git fetch origin
git status                                  # clean on feature/addie-v1
git log --oneline -12                       # confirm HEAD = 5ce76c6
npx tsc --noEmit                            # clean
npx vitest run --reporter=dot               # 405/405
COMING_SOON=false npm run dev               # localhost:3000
```

Then walk:
- `/foundation/m1/m1.1` — see the AI tutor chip (bottom-right) + the recap card (bottom of page) + the TOC fix (right rail)
- `/foundation/m1/m1.4` — see the upgraded `[stat]` + 5-card `[case]` grid
- `/foundation/m3/m3.1` — see the 4-card `[case]` grid for Role · Task · Context · Format
- `/foundation/m0/m0.2` — see the paired `[case:bad]`/`[case:good]` for the named-vs-anonymised example
- `/foundation/m2/m2.1` — see the SSO-decision 3-card mixed grid
- `/foundation/gate` — see the single-nav (Wave 2 fix) and the gate-fork cards
- `/admin/sandbox` — set `OPERATOR_EMAILS=jlgilmore2@gmail.com` first, then sign in

## File map (what's new this session)

| Path | Purpose |
|---|---|
| `docs/reviews/foundation-course-content-audit-2026-05-24.md` | The content audit |
| `docs/Foundation-Course-ADDIE/AiBI_Curriculum_Visual_Vocabulary.md` | The block-type vocabulary spec |
| `docs/handoffs/handoff-2026-05-24-rich-curriculum-session-close.md` | This file |
| `supabase/migrations/00060_addie_tutor_artifact_type.sql` | Enables `tutor_conversation` artifact saves |
| `src/lib/addie/tutor/` | piiCheck + systemPrompt for the tutor |
| `src/lib/addie/lessonSummary/` | Prompt + cache for the per-lesson recap |
| `src/lib/addie/sandbox/queries.ts` | /admin/sandbox queries |
| `src/app/api/addie/tutor/stream/route.ts` | Tutor streaming endpoint |
| `src/app/api/addie/lesson/summary/route.ts` | Lesson recap endpoint |
| `src/app/api/addie/cron/abandoned-gate/route.ts` | Nightly abandoned-gate sweeper |
| `src/app/admin/sandbox/page.tsx` | Operator sandbox dashboard |
| `src/components/addie/lesson/LessonTutor.tsx` | Tutor UI |
| `src/components/addie/lesson/LessonSummaryCard.tsx` | Recap UI |

— End of handoff.
