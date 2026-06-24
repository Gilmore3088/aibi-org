# Flow Atlas — grounded facts (massive-persona audit, 2026-06-23)

Single source of truth for the persona walkthroughs. Every fact below is traced
from the actual codebase on branch `massive-persona`. Click counts are exact.
"Click" = one tap/press the user must make (answering a question counts as one).

---

## A. FREE READINESS ASSESSMENT (12-question, v3)

**Entry:** Every home CTA + header CTA + footer "Free assessment" deep-link to
`/assessment/take` (Q1), skipping the `/assessment` marketing page. Primary hero
CTA = "Find my readiness gaps" (`_client.tsx:166`). Nav "Assessment" → `/assessment`
(marketing). `/assessment/start` 308→`/assessment/take`.

**Click-path (cold home → value):**
- Home → score visible = **14 clicks** (1 CTA + 12 answer taps + 1 email submit).
- Home → downloadable PDF = **15 clicks**.
- From `/assessment` marketing page: +1 (15 / 16).
- Questions auto-advance on tap (no Next button). Signed-in users skip the email
  typing click (auto-submit via `/api/auth/me`).

**Gate:** Email capture at the `score` phase (post-Q12). Blocks full report,
7-day plan, three takeaways, PDF. Previews score/tier/top-gap only. No auth gate,
no payment gate on the free path. `/results/[id]` is bearer-token (UUID = access).

**Known issues:**
1. Dead anchor: `score` phase header shows a "Restart" link → `#restart`; **no
   such element exists** (broken affordance). Real reset is a separate "Start over".
2. Legacy v2 `@react-pdf` starter-artifact route (`/api/assessment/starter-artifact/[dimension]`)
   is **orphaned for v3** but still **live + BROKEN (React #31 500)** for anyone
   clicking an old pre-2026-05-27 **v2 result link**.
3. V3 PDF uses Chromium/Puppeteer (`/assessment/results/print/[id]`), NOT react-pdf,
   so NOT affected by #31 — but exposed to the `@sparticuz/chromium` Vercel tracing
   500 (invisible locally). Degrades gracefully to an HTML print fallback (no dead-end).
4. Supabase-down / paid-collision case → `/api/capture-email` returns `profileId:null`
   → report renders inline with **NO PDF and NO print link at all** (quiet feature hole).
5. sessionStorage restores mid-questionnaire only; **reloading on the score/results
   page bounces the user back into the questionnaire** (no persisted phase).
6. `console.log` of raw emails + flow state in `capture-email/route.ts` (PII-in-logs).
7. At `score` phase there is no per-question Back — a misclick on Q11 forces full
   "Start over" (re-rolls a fresh 12-question set).

---

## B. FREE DOWNLOADABLE RESOURCES / playbooks / prompt cards / templates

**Discovery:** Home has **NO direct link** to `/resources`, `/playbooks`, or
`/prompt-cards`. All via nav "Resources" (`/resources`) or footer.
**Home → first downloadable artifact = 2 clicks** (nav Resources → download CTA),
file streams, ungated.

**Inventory (24 catalog files all present in `public/downloads/`):**
- 22 downloads are **static PDF / static ZIP / Word-gen (HTML→.doc)** → **WORK**,
  all **ungated**, 2 clicks from home. (kits, desk cards, 6 role playbooks,
  4 templates, paid-preview PDFs, artifact PDFs).
- **2 downloads are `@react-pdf` `renderToBuffer` → BROKEN in prod (React #31 500):**
  - **Prompt Cards PDF** (`/api/prompt-cards/download`) — behind email+role lead gate.
  - **Safe AI Use Guide PDF** (`/api/guides/safe-ai-use`) — behind name+email gate on `/security`.
  - These two are the **only email-gated free assets** → user gives email, gets a 500.

**Known issues:**
1. The two broken downloads are exactly the two conversion (email-gated) ones.
2. **GTM Plan template** (`/resources/templates/gtm-plan`) fully orphaned — built
   file + working route, but **unlinked anywhere**. Dead content.
3. **Playbook "assets" mostly dead-ends:** each role lists 5 assets; **9 "Draft"
   assets render "Coming soon"** (NPI Boundary Card, ECOA Card, Member Tone Card, etc.).
4. **Inconsistent gating:** role playbook PDFs are **ungated** on `/resources` cards
   but **email-gated** via the `/playbooks` modal — same endpoint, one click apart.
5. Prompt Cards "unlock" is a **localStorage flag only**; `/api/prompt-cards/download`
   has no server check → trivially bypassable, lead capture is cosmetic.
6. **Prompt Cards LeadModal role bug:** dropdown offers `value="foundation"` but the
   server set rejects it → **400 "Role is required"** if the user picks "Foundation".
7. `/prompt-cards` + `/playbooks` not in primary nav (discovery friction).
8. `/api/resources/[slug]/download` returns 503 if Supabase unconfigured **before**
   the static fallback (latent; prod has Supabase).

---

## C. PAID $99 IN-DEPTH ASSESSMENT (48-question) + TEAM ASSESSMENT

**Discovery:** **No home-hero or primary-nav link to the paid In-Depth.** Reachable
only from footer + post-free-assessment upsell cards + ROI dossier.
- `/assessment/in-depth` → Stripe checkout = **1 click**.
- Payment → diagnostic = **1 click** (open emailed magic link → authenticated `/take`).
- Diagnostic done → results = **0 clicks** (auto-redirect).

**Fulfillment:** webhook → `ensureAuthUser` (password-less account) → `course_enrollments`
row (`in-depth-assessment`) → magic link email → 1-click access. Robust retries
(3×1.5s) on `/take` + `/submit` absorb webhook lag. Magic-link failure falls back
to a pre-filled signup deep-link.

**Paid results PDF uses `window.print()` — NOT react-pdf, NOT broken.**

**Team Assessment:** **NOT self-serve** as shipped — `/api/checkout/team-assessment`
hard-403s unless `ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT=true` (not set).
`/assessment/team` shows an assisted-sales mailto card. The full cohort/token/admin/
aggregate machinery IS built behind the flag (not half-built). Correct per project intent.

**Known issues:**
1. **Discoverability** is the #1 paid-funnel risk — site pushes the FREE assessment;
   $99 has no top-level entry.
2. `/assessment/in-depth/access` is mostly **"Coming soon" scaffolding** (invites,
   aggregate report not built) — an individual buyer who lands there sees a near-empty
   institution dashboard. Linked from `/dashboard/assessments`.
3. `/purchased` over-promises "your paid Toolbox … is included" but the button just
   browses the **free** `/resources` hub.
4. Unauth post-payment forward motion depends entirely on email deliverability; only
   recovery is a "resend" button + mailto (ops alerted, buyer briefly stranded).
5. `/results/[id]` is bearer-token only (by design; UUIDs unguessable).

---

## D. $295 AiBI-FOUNDATION COURSE (18 modules) + certificate

**Discovery → purchase:**
- Home → Stripe checkout = **3 clicks** (Home → `/courses` → `/purchase` → Stripe).
- `/courses` → checkout = **2 clicks**. `/courses/foundation` 308→`/courses` (extra hop).
- No account required at checkout (Stripe email only).

**Fulfillment:** webhook → `ensureAuthUser` → `course_enrollments` (`current_module:1`)
→ `/purchased` magic-link "Begin" → onboarding (2-min) → Module 1. ~9s webhook-race
retry window (3×3s) before bouncing a just-paid buyer to `/purchase`.

**Progression:** strictly forward-only, server-gated (`canAccessModule`). Activities
required to advance; activity-less modules require a handoff note ≥12 chars + transfer
plan ≥12 chars. Progress saved via `/api/courses/save-progress`. "Complete one module"
loop ≈ 3-5 clicks (Understand → Try → Build → Save tabs).

**CRITICAL — certificate is an unreachable dead-end:**
- Cert requires all modules complete AND a `work_submissions` row with
  `review_status='approved'`.
- **Nothing in the app sets `review_status='approved'`** (no reviewer UI, no cron,
  no auto-approve) and **nothing calls `POST /api/courses/generate-certificate`.**
  Grep: zero callers. A finisher submits their work product (`pending`) → page says
  "~5 business days" → **waits forever**; issuance is a manual out-of-band DB edit + API
  call with no operator tooling.
- Even if approved, the cert PDF uses **`@react-pdf` renderToBuffer → BROKEN (#31 500)**.

**Course PDF inventory:** 5 of 7 downloadable outputs use the broken react-pdf path —
**Transformation Report, Certificate, Acceptable-Use Card, Prompt Cards, Skill-Template
Library** all 500. Only 2 markdown exports (module artifact, skill template `.md`) work.

**Known issues:**
1. Certificate dead-end (above) — the funnel's proudest moment is unreachable.
2. 5/7 course PDFs broken (react-pdf #31).
3. **Module-count mismatch risk:** 14 `module-N.ts` files on disk vs "18 modules" in
   copy/config — VERIFY the config truly enumerates 18 (else public count is wrong).
4. `/courses/foundation/program` home **does not gate on enrollment** — a signed-in,
   non-enrolled, device-trusted user sees the full course shell (soft leak; `/program/1`
   then bounces to purchase).
5. Webhook-race ~9s bounce-to-purchase for a paying buyer; hard webhook failure = stuck
   (only the one-tab-fragile `/purchased` magic link recovers).
6. TODO: **no submission-received email** despite `/submit` promising one.
7. `save-progress` failures fail silently (learner re-clicks blindly).
8. Module 9 / Module 5 hardcoded CTAs in `CompletionCTA.tsx` — brittle if module set changes.

---

## E. INTERACTIVE AI SURFACES (Toolbox / Practice / Playground / Sandbox)

**Two parallel, disconnected universes:**
| Layer | Routes | Real AI? | Real save? | Auth |
|-------|--------|----------|-----------|------|
| A. Public marketing **MOCKUPS** | `/playground`, `/practice`, `/my-toolbox`, `/my-toolbox/skill-builder`, `/my-toolbox/skills/[slug]` | NO (canned typewriter / hardcoded markdown) | NO (local state only) | mostly none |
| B. Real product | `/dashboard/toolbox` (+`/library`,`/cookbook`), `AIPracticeSandbox` (in course modules), `/practice/[repId]` | YES (real streamed model) | YES → `toolbox_skills` | auth + paid entitlement |

**Home → run a real AI prompt on a PUBLIC surface = IMPOSSIBLE** (no public real-AI
surface). The public `/playground` "Run" is a fake setInterval typewriter; "Save to
Toolbox" sets `setSaved(true)` and shows a toast — **nothing persists.**

**Known issues:**
1. Name collisions: two "Playground", two "Practice", two "My Toolbox", two "Sandbox"
   with opposite behavior. The real save-loop lives in a tab named "AiBI Lab".
2. `/practice` (root) brands itself "Signed-in sandbox / Enrolled-only" but is
   **public, ungated, and fake**.
3. `/my-toolbox` gates real auth + trusted-device around a **pure mockup** with
   fabricated "saved" content.
4. `/my-toolbox/skills/[slug]` **ignores its slug** — same hardcoded KYC skill for every URL.
5. `/my-toolbox/skill-builder` "Save Skill" is a `<Link href="/practice">` (dead-end).
6. ~2,463 lines of **orphaned dead code** (`_script.js`/`_body.html` in playground + my-toolbox).
7. **Real working loop (`/dashboard/toolbox`) is buried** behind auth+payment and not in nav.
8. **PII guardrail EXISTS server-side** (contra prior memory) on all 3 AI routes, but is
   a **narrow regex** that misses names, addresses, partial/masked accounts, and narrative
   PII, AND is **user-overridable with NO server-side audit log** → flagged content can
   reach Anthropic/OpenAI/Gemini on one click with no record. Compliance risk for a
   banking audience pasting real member notes.
9. `/api/sandbox/chat` gates **auth but not entitlement** — any logged-in free account can
   burn metered model budget (50/hr).

---

## F. ACCOUNT LIFECYCLE / DASHBOARD / VERIFY

- Accounts are **auto-provisioned silently, password-less** at every email-capture point
  (free assessment, inquiry, every Stripe purchase). User rarely touches `/auth/signup`.
- **Stripe → logged-in access to purchase = 1 click** (magic-link email → `/auth/confirm`
  → authenticated + auto-trusted device). Well-engineered, multiple fallbacks.
- `deriveDashboardViewModel` handles all 4 lifecycle states (new / free-only / $99 / $295)
  cleanly; partial API failures degrade to a soft banner (no white screen). Good.
- `/verify/[certificateId]` works, fully public, clean unknown-id surface.

**Known issues:**
1. **Entire post-purchase login is password-less + single-transactional-email-dependent.**
   Corporate email gateways (Mimecast/Proofpoint — the exact target audience) can filter
   the only access email; buyer then has a provisioned account they **cannot reach** (no
   password to log in; idempotent webhook won't re-send on retry; only recovery is
   `/auth/forgot-password`, which they have no reason to know applies). Biggest fulfillment risk.
2. **Phone-vs-desktop device-confirm loop:** confirming the new-device email in a different
   browser (phone) fails → user told to return to the original browser (desktop). Mobile-email
   audience friction; `/auth/confirm-device-pending` is otherwise an orphan wait state.
3. Magic link only sent on the `action==='created'` webhook branch → a failed first send +
   Stripe retry = dedup no-op, **never re-sends**.
4. **No certificate link on the dashboard even when earned** (ladder step 7 just links back
   into the course).
5. `signOut` does not clear the `aibi-trusted-device` cookie (persists post-logout).

---

## G. GLOBAL NAV / IA

- Primary CTA discipline is strong — every home/header/sticky CTA → `/assessment/take`.
- **Two divergent nav systems:** canonical mockup `SiteHeader`/`SiteFooter` (clean, zero
  broken links) vs legacy `system/SiteNav`+`SiteFooter` rendered only on **`/prompt-cards`,
  `/support/purchase-help`, `/verify/[certificateId]`** — older/thinner chrome + a **dead
  "About" link pointing to `/`** (not `/about`). These 3 pages look like a different site.
- **Orphan routes (zero inbound nav/home/footer links):** `/playground` (a real public AI
  demo) and `/certifications` (real inquiry page).
- Home CtaBand "Start learning" → `/courses/foundation` 307→`/courses` (avoidable hop).
- Resources taxonomy is fuzzy: `/resources`, `/playbooks`, `/prompt-cards`,
  `/resources/templates/*` overlap; footer lists 3 of the 4, never prompt-cards.
- **No redirect loops** (all 30 `next.config.mjs` redirects resolve to real pages).
- `CHROMELESS_PATHS` has duplicate entries (hand-maintained, error-prone — how the 3
  legacy-chrome pages were missed).

---

## CLICKS-TO-VALUE SUMMARY (cold home visitor)

| Value moment | Min clicks | Notes |
|---|---|---|
| Start free assessment | 1 | hero → `/assessment/take` (optimal) |
| See free score | 1 + 12 answers + 1 email | email gate by design |
| Free downloadable resource | 2 | nav Resources → download (ungated, works) |
| Reach $99 offer / checkout | 1 to offer (footer/upsell only), then 1 to Stripe | **no home/nav entry** |
| Reach $295 checkout | 2 (from `/courses`) / 3 (from home) | one avoidable redirect hop |
| Run public AI playground | **unreachable from nav** + fake anyway | orphan + mockup |
| Earn certificate (after finishing $295) | **BLOCKED** | no issuance path shipped |
