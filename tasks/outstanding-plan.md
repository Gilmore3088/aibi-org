# Outstanding Plan — Master Document

**Created:** 2026-05-05 · **Last reviewed:** 2026-05-05

Single source of truth for what's left across the project. Replaces ad-hoc scattering across `tasks/todo.md`, the four-surface specs, and PR descriptions. When in doubt: read this file first.

---

## How this is organized

Five buckets:

| Bucket | Owner | When |
|---|---|---|
| **Operator weekend work** | James | This weekend |
| **Next-session builds (Stripe MCP)** | Claude + James | Next session |
| **Implementation plans pending** | Claude (when ready) | Future sessions |
| **Code-quality + docs followups** | Claude (anytime) | Anytime |
| **Phase 1.5+ deferred work** | Future product decision | TBD |

Each section calls out: what it is, what's blocking, what unblocks it.

---

## 1. Operator weekend work

> All blocked on James having dashboard access I don't have. Fully spec'd in `tasks/weekend-env-setup.md`.

### 1.1 Vercel env vars (highest impact / lowest effort)

| Phase | Vars | What unlocks |
|---|---|---|
| 0 | `CRON_SECRET`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, replicate Supabase keys to Preview + Development | Cleanup cron stops 401-ing nightly; Plausible analytics flows; PR previews actually render |
| 1 | `CONVERTKIT_API_KEY`, `CONVERTKIT_API_SECRET`, four `CONVERTKIT_TAG_ID_*`, `SKIP_CONVERTKIT=true` (staging) | Spec 3 tier-tagging actually fires |
| 2 | `RESEND_API_KEY` + sender, `HUBSPOT_API_KEY`, `NEXT_PUBLIC_CALENDLY_URL`, AI keys, `TOOLBOX_IP_HASH_SALT` | Existing flows fully working (transactional email, CRM sync, AI features, stable rate limits) |
| 3 | All Stripe keys + price IDs (depends on §2 below) | Phase 2 monetization |

### 1.2 ConvertKit dashboard work

- Create 4 Tags (`aibi-assessment-startingpoint` and the other three).
- Create 4 Sequences with tag-add triggers.
- Paste the 12 emails I drafted at `content/email-sequences/` into the Sequences (drafts ready, just copy-paste).
- Verify in CK dashboard.

### 1.3 HubSpot custom property pre-creation

Per CLAUDE.md, the HubSpot API silently ignores unknown properties. Create these in HubSpot **before** real captures land:
- `assessment_score` (Number)
- `score_tier` (Single-line text)
- `institution_name` (Single-line text)
- `asset_size` (Dropdown: <$100M / $100–500M / $500M–$1B / $1B+)
- `lead_source` (Dropdown: assessment / referral / linkedin / conference)

### 1.4 Run manual verification runbook

`docs/manual-verification-runbook.md` — every operator-gated AC for Specs 1–4. Runs in ~45 minutes once env vars are set. Record results, file issues for failures.

---

## 2. Next-session builds (Stripe MCP)

> Blocked on James adding the Stripe MCP server before the next session opens.

```bash
claude mcp add stripe -- npx -y @stripe/mcp --tools=all --api-key=$STRIPE_SECRET_KEY
```

### 2.1 Create Stripe products + prices

Use the Stripe MCP to create:
- AiBI Foundations: $97 one-time
- AiBI-P Practitioner: $295 one-time
- (Future: AiBI-S Specialist, AiBI-L Leader — pricing TBD)

Capture the Price IDs and paste into Vercel as:
- `STRIPE_FOUNDATIONS_PRICE_ID`
- `STRIPE_PRACTITIONER_PRICE_ID`

### 2.2 Verify the existing webhook handler end-to-end

The Stripe webhook + `provisionEnrollment` + entitlement gate at `/courses/aibi-p` is **already built and tested** (`src/app/api/webhooks/stripe/route.ts`, `src/app/api/webhooks/stripe/route.test.ts`, `src/lib/stripe/provision-enrollment.ts`, `src/app/courses/aibi-p/_lib/getEnrollment.ts`). What's missing:

- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` set in Vercel.
- A Stripe webhook endpoint registered in Stripe dashboard pointing at `https://aibankinginstitute.com/api/webhooks/stripe`.
- One real test purchase (Stripe test mode) to verify signature → `course_enrollments` insert → entitlement-grant chain works on the deployed site.

### 2.3 Schema cleanup: deprecate `kajabi_user_id`

Per the 2026-05-05 decision (drop Kajabi), the `course_enrollments.kajabi_user_id` column is dead weight:
- No production code reads or writes it (verified — `grep -rn "\.kajabi_user_id\|kajabi_user_id:" src/` returns only the type definition).
- `src/types/course.ts:39` still declares it for type completeness.

Two options for cleanup:
- **Conservative**: leave the column in DB, mark the type field deprecated with a comment, never reference it again. Zero risk.
- **Aggressive**: write migration 00028 to `ALTER TABLE course_enrollments DROP COLUMN kajabi_user_id;`. Permanent — destroys any historical Kajabi IDs (if any exist; user said they never used Kajabi). Slight risk.

Conservative is fine for v1. James decides next session.

---

## 3. Implementation plans pending

> Plans I can write now, but won't execute without your direction. Each is a sizeable multi-task build.

### 3.1 Phase 1.5+ — Readiness History (deferred from Spec 4)

**Job:** preserve old assessment scores when a user retakes, exposing them at per-result URLs so the user has a longitudinal record.

**Scope:**
- `readiness_history` table: `id`, `email`, `user_id`, `score`, `tier_id`, `dimension_breakdown`, `answers`, `taken_at`. Append-only — never updated.
- Migration: 00028 (assuming nothing else has claimed it by then).
- `capture-email` route change: continue to upsert `user_profiles` for "current state" but ALSO insert into `readiness_history`. Most current row in history = source of truth.
- `/results/[id]` route change: `[id]` becomes `readiness_history.id` (not `user_profiles.id`). Loader reads from history.
- Spec 2 PDF: warm route writes PDF keyed by `readiness_history.id` not `user_profiles.id`. Storage path changes.
- Spec 3 tier re-routing: stays driven by current state in `user_profiles`. Tag re-route on retake works as today.
- Spec 4 magic-link: SignupModal `next=` param uses `readiness_history.id` of the just-created row.

**Effort estimate:** 8–10 hours. Schema-cascading change. Needs careful migration of in-flight data.

**Blockers / open questions:**
- Backfill: do existing `user_profiles` rows seed an initial `readiness_history` row? Recommend yes — single SQL backfill in the migration.
- What happens when a user retakes 30 days later? Old PDF (which was tied to `user_profiles.id`) — does it stay accessible at the old URL? Likely yes if the old URL structure is preserved as a redirect.
- /dashboard depends on this landing first.

**When to build:** when user feedback shows people are retaking and asking "why don't I see my old score?"

### 3.2 Phase 1.5+ — `/dashboard` page

**Job:** authenticated users see all of their assessment briefs, sortable by date, with quick links to each.

**Scope:**
- `/dashboard/page.tsx` server component — auth check, list `readiness_history` rows for `auth.uid()`, render as a timeline/table.
- Cards per row: tier badge, score, taken_at, "View brief" → `/results/{history_id}`.

**Effort estimate:** 2–3 hours.

**Blockers:** **§3.1 must ship first.** Otherwise it's a degenerate page (one row).

### 3.3 Phase 1.5+ — Re-PDF on return-trip past retention

**Job:** when a user clicks Download PDF on `/results/[id]` and the PDF was deleted by the 30-day cleanup cron, regenerate it on demand.

**Scope:**
- Update `PdfDownloadButton` state machine: if `/api/assessment/pdf/warm` returns `pdf-not-ready` from the download endpoint, automatically POST `/warm` again, then retry download.
- Or: change `warm` to be a no-op when PDF exists, regen when missing — single code path covers both paths.

**Effort estimate:** 1–2 hours. Code is small; testing the storage-deletion path is what takes time.

**Blockers:** none. Can ship anytime. Low priority until users are actually returning past 30 days.

### 3.4 Phase 3 — AI Practice Sandbox AiBI-S + AiBI-L coverage

**Job:** extend the existing AiBI-P practice sandbox to cover the Specialist and Leader certifications.

**Scope** (per `tasks/todo.md`):

AiBI-S — 6 weekly exercises:
- W1 Department Scanner (workflow data → automation candidates)
- W2 Workspace Architect (team description → workspace config)
- W3 Automation Builder (workflow → automation prompt)
- W4 Impact Calculator (before/after → ROI report with charts)
- W5 Training Script Generator (team description → custom training script)
- W6 Playbook Drafter (full department AI playbook)

AiBI-L — 4 sessions:
- S1 Maturity Sandbox (90-day priorities from MaturityScorecard)
- S2 Policy Drafter (governance framework expansion)
- S3 Financial Narrative (board deck financial section)
- S4 Board Q&A Simulator (skeptical board member roleplay)

Shared infra: role-track sample data (5 variants), document library, system prompts for contract analysis + process automation, tabbed Learn/Practice/Apply layouts.

**Effort estimate:** 3–4 weeks. Substantial content + UX work. Requires curriculum design, sample data authoring, evaluation rubrics.

**Blockers:** AiBI-P sandbox Phase 2 (multi-provider OpenAI + Gemini, recharts, PDF export, production rate limiting) should land first per `tasks/todo.md`.

**When to build:** after AiBI-P enrollments validate the sandbox approach with paying learners.

### 3.5 Phase 2 — AI Practice Sandbox completion (per existing todo.md)

**Job:** turn the AiBI-P sandbox from MVP into production.

**Scope** (per `tasks/todo.md` lines 198–220):
- OpenAI adapter (`src/lib/sandbox/providers/openai.ts`)
- Gemini adapter (`src/lib/sandbox/providers/gemini.ts`)
- Provider switching in UI (remove "Coming soon" from non-Claude tabs)
- Recharts integration (detect `chart` code blocks, render styled charts)
- PDF export on responses (client-side gen)
- Copy-to-clipboard on responses
- Production rate limiting (Supabase or Redis instead of in-memory Map)
- Production auth validation (Supabase auth check in API route — currently dev bypass only)
- Monthly spend monitoring per provider

**Effort estimate:** 1–2 weeks across all items.

**Blockers:** OpenAI + Gemini API keys (operator). The auth check + rate limiting depend on existing Supabase Auth which is now real (Spec 2). Plus `tasks/weekend-env-setup.md` Phase 2 env vars.

---

## 4. Code-quality + docs followups

> Anytime work. Small. No blockers.

### 4.1 ✅ Done this session

- ConvertKit form-subscribe stub → real implementation (commit `5c6b7a5`).
- Newsletter route bug-fix (was calling assessment form helper).
- 12 ConvertKit email drafts at `content/email-sequences/`.
- Vitest coverage for `loadAssessmentResponse` (10 cases, commit `85c3787`).
- Manual verification runbook (`docs/manual-verification-runbook.md`).

### 4.2 Outstanding small items

- **`src/types/course.ts:39`** — `kajabi_user_id` field still declared. Mark deprecated comment or schedule §2.3 migration.
- **`tasks/todo.md` housekeeping** — line 55–98 has Phase-1-MVP backlog from 2026-04-15. Most of that is shipped per the 4 PR merges this week. Worth a pass to mark items done and trim.
- **CLAUDE.md `/api/capture-email` row** — the Page Routes table at line 177 says "MVP". Specs 1–4 elevated this route significantly. Worth updating the description.
- **HubSpot custom property auto-create script** — write a one-shot Node script that uses the HubSpot API to create the 5 custom properties. Saves James's time during weekend setup. Half-hour build, dependency on HubSpot key (operator must provide).
- **`.env.local.example` audit** — drift-prone. Schedule quarterly review.

---

## 5. Phase 1.5+ deferred — strategic, not engineering

Items the user community will demand or the data will support. Not buildable today.

- **Peer benchmarking content.** Blocked on N≥30 respondents per segment. Spec'd in `tasks/todo.md` lines 173–181. The infrastructure (server-rendered `/results/[id]` from §3.1, recompute-on-view) is already laid. When you have ~200 respondents, you light up a percentile component without per-user migration.
- **Asset-size + charter-type segmentation.** Same dependency.
- **"Benchmark me quarterly" newsletter segment.** Opt-in CK tag; uses existing tagging infrastructure.
- **HubSpot ↔ ConvertKit suppression.** Spec'd in Spec 3 spec doc as v1.1: when a user books an Executive Briefing (HubSpot deal opens), they exit the conversion-pushing email sequence. Needs HubSpot webhook + CK API. Real but not urgent.

---

## What I built this session vs. what's still outstanding (TL;DR)

**Built and pushed (origin/main):**
- `0c8061c` — `.env.local.example` overhaul + `tasks/weekend-env-setup.md`
- `97d8dfa` — Spec 3 + Spec 4 plan archives
- `0b6a3af` — Drop Kajabi + Zapier from CLAUDE.md / todo

**Built locally, awaiting push approval:**
- `851cb8c` — 12 ConvertKit email drafts
- `85c3787` — vitest coverage for loadAssessmentResponse (10 tests)
- `bec53d7` — `docs/manual-verification-runbook.md`
- `5c6b7a5` — Real ConvertKit form-subscribe adapter + newsletter route fix + 8 vitest tests

**Outstanding categories:**
- §1 — operator weekend work (you, this weekend)
- §2 — Stripe MCP next session (you set up MCP, then us together)
- §3 — implementation plans pending (decide which to start, when)
- §4 — code-quality nits (ad-hoc, low priority)
- §5 — strategic deferred (data-gated)

**Critical path to "everything lit up" in production:**
1. Push the 4 unpushed commits (5 min).
2. Weekend env-var + dashboard setup per §1 (~2 hours).
3. Run manual verification runbook (45 min).
4. Add Stripe MCP server, next session (10 min).
5. Create products via MCP, paste Price IDs into Vercel (10 min).
6. Real-mode Stripe test purchase, verify entitlement chain (15 min).

That's ~3.5 hours of mostly-operator work between "today" and "everything works." Implementation plans (§3) are independent of this critical path.
