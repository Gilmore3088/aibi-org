# AiBI — feature/stripe-products: User Journey + Merge Brief

**Audited:** 2026-05-06
**Branch:** feature/stripe-products
**Purpose:** Combined reference for an engineer review pass.
Two parts: (I) the public user paths and where they go; (II) the
merge brief — what's new, what changed, what infra has to move.

---

# Part I — User Journey + Page Directory

for, what journey it belongs to, and where we have duplicate / redundant
surfaces that can be consolidated.

---

## 1. The five primary journeys

### Journey A — Cold visitor → free assessment

```
/  (homepage)
   └─► /assessment/start  (landing: "what to expect")
         └─► /assessment   (12Q quiz, sessionStorage-backed)
               ├─ Score + tier shown immediately (no gate)
               └─ EmailGate captures email + firstName + institutionName
                     └─► /results/[id]  (auth-required permanent home)
```

**Conversion intent:** email capture → ConvertKit + HubSpot → Calendly /
AiBI-P / In-Depth CTAs.
**Friction today:** lands on `/assessment/start` then transitions to
`/assessment`. Two URLs for one experience.

---

### Journey B — In-Depth individual buyer ($99)

```
/assessment/in-depth   (marketing + two purchase cards)
   └─► Stripe Checkout
         └─► /assessment/in-depth/take?session=…   (server resolves token)
               └─ FORCED REDIRECT (Phase 2): /auth/login?next=…&email=…
                     └─ Magic link → email click → back to /take?token=…
                           └─► 48Q quiz (localStorage-backed)
                                 └─► /api/indepth/submit-answers
                                       └─► /results/in-depth/[id]
                                              └─ Tailored starter artifact
                                                 (rendered markdown)
```

**Convert intent:** entitlement `indepth-starter-toolkit` granted →
`/dashboard/toolbox` read-only.
**Friction today:** post-checkout redirect dance (session→token→login→
take). Each hop is necessary but the experience is jarring.

---

### Journey C — In-Depth institution leader ($79/seat × 10+)

```
/assessment/in-depth   (BuyForMyTeamCard)
   └─► Stripe Checkout
         └─► /assessment/in-depth/dashboard?session=…   (auth required)
               └─ Bind leader_user_id on first visit
               └─ Invite roster (textarea → /api/indepth/invite → Resend)
               └─ Aggregate report (locked < 3 responses)
                     └─ Champions, dimension breakdown, distribution
```

The leader gets `indepth-starter-toolkit` entitlement too → toolbox
read-only access.

---

### Journey D — In-Depth institution invitee (staff)

```
[email from leader]
   └─► /assessment/in-depth/take?token=<magic-link>
         └─ token validated, invite_consumed_at marked
         └─ NO sign-in required (token IS the access key)
               └─► 48Q quiz
                     └─► /results/in-depth/[id]
```

Invitees can complete without an account. Their result is anonymized in
the leader's aggregate; their personal result is reachable only via the
magic link (or, post-completion, via /dashboard/assessments if they
later sign in with that email).

---

### Journey E — AiBI-P learner (course buyer, $295 / $199 institution)

```
/education  →  /courses/aibi-p   (overview + buy CTA)
   └─► /courses/aibi-p/purchase  →  Stripe Checkout
         └─► /courses/aibi-p?enrolled=true
               └─ webhook → entitlements + course_enrollments row
               └─ FORCED REDIRECT: /courses/aibi-p/onboarding (3Q survey)
                     └─► /courses/aibi-p/[1..N]   (modules)
                           ├─ /artifacts/[id]
                           ├─ /toolkit          (personal artifact roundup)
                           ├─ /prompt-library
                           ├─ /quick-wins
                           ├─ /post-assessment
                           ├─ /tool-guides
                           ├─ /gallery
                           ├─ /submit           (work product)
                           ├─ /certificate      (after passing)
                           └─ /settings
```

Plus: `/certifications/exam/aibi-p` for the proficiency exam,
`/dashboard/toolbox` for the production toolbox, `/dashboard/progression`
for module progress.

---

## 2. Page directory

### 2.1 Public marketing

| Path | Purpose | Notes |
|---|---|---|
| `/` | Homepage. Hero + ROI calc + 3 pillars + sourced stats. | Primary CTA = free assessment. |
| `/about` | Founder story. | Phase 3. Lightweight. |
| `/security` | Pillar B (security) landing. | Free guide download. |
| `/privacy` | Privacy policy. | |
| `/terms` | Terms of service. | |
| `/ai-use-disclaimer` | AI usage disclosure. | |
| `/coming-soon` | Holding page. | Pre-launch only; not in main nav. |

### 2.2 Education hub

| Path | Purpose | Notes |
|---|---|---|
| `/education` | Unified hub. **Free classes** + **Paid diagnostics** + **Certifications**. | Replaced /courses + /certifications. |
| `/for-institutions` | Institution-facing pitch. **In-Depth** band + samples + custom-engagements stub. | |
| `/for-institutions/advisory` | Pilot · Program · Leadership Advisory. | Prices removed pending case studies. |
| `/for-institutions/samples/efficiency-ratio-workbook` | Free sample artifact. | |

### 2.3 Free Assessment (12Q)

| Path | Purpose | Notes |
|---|---|---|
| `/assessment/start` | "What to expect" landing. | **Candidate for consolidation** with `/assessment`. |
| `/assessment` | The quiz UI itself. | sessionStorage; EmailGate at end. |
| `/results/[id]` | Owner-bound result. | Auth required. Score + tier + 7-day plan + In-Depth CTA. |
| `/assessment/results/print/[id]` | Print-friendly version. | Used by PDF generation. |

### 2.4 In-Depth Assessment (48Q paid)

| Path | Purpose | Notes |
|---|---|---|
| `/assessment/in-depth` | Marketing + BuyForMyself + BuyForMyTeam. | Server-resolves auth → prefills email. |
| `/assessment/in-depth/take` | Token-gated quiz. | Individual buyers redirected to /auth/login first. |
| `/assessment/in-depth/dashboard` | Institution leader dashboard. | Auth + ownership-bound; roster + invites + aggregate. |
| `/results/in-depth/[id]` | Result page. | Score / tier / 8-dim breakdown / starter artifact. |

### 2.5 Auth

| Path | Purpose | Notes |
|---|---|---|
| `/auth/login` | Password + Magic Link. | `?email=` prefill, `?next=` redirect. Magic-link default for in-depth take redirects. |
| `/auth/signup` | Account creation. | |
| `/auth/forgot-password` | Reset flow. | |
| `/auth/reset-password` | Set new password. | |
| `/auth/callback` | OAuth + magic-link landing. | Route handler, not a page. |

### 2.6 Dashboard

| Path | Purpose | Notes |
|---|---|---|
| `/dashboard` | Learner home. Next action / artifacts / readiness / SAFE. | |
| `/dashboard/assessments` | All completed takes (in-depth + free). | New 2026-05-05. |
| `/dashboard/progression` | Module progress detail. | **Possible overlap** with `/dashboard` itself. |
| `/dashboard/toolbox` | Banking AI Toolbox. Full or Starter tier. | Tabs: Guide, Library, Build, Playground, My Toolbox. |
| `/dashboard/toolbox/library` + `/library/[slug]` | Library browse + skill detail. | |
| `/dashboard/toolbox/cookbook` + `/cookbook/[slug]` | Recipes catalog + detail. | |

### 2.7 AiBI-P course

| Path | Purpose | Notes |
|---|---|---|
| `/courses/aibi-p` | Course overview. | Now exempt from onboarding redirect (2026-05-05). |
| `/courses/aibi-p/purchase` | Buy flow. | Redirects to /education for non-enrollees? Verify. |
| `/courses/aibi-p/onboarding` | 3Q survey + WelcomeFirstPrompt. | Forced for new enrollees. |
| `/courses/aibi-p/[module]` | Module page (12 modules). | Sequential. |
| `/courses/aibi-p/artifacts/[artifactId]` | Artifact view. | |
| `/courses/aibi-p/toolkit` | Personal toolkit roundup. | Pulls saved artifacts + skills. |
| `/courses/aibi-p/prompt-library` | Prompt library. | |
| `/courses/aibi-p/quick-wins` | Quick-win logs. | |
| `/courses/aibi-p/post-assessment` | After-course assessment. | **Possibly overlaps** with /certifications/exam. |
| `/courses/aibi-p/tool-guides` | Tool-specific how-tos. | |
| `/courses/aibi-p/gallery` | Cohort gallery. | |
| `/courses/aibi-p/submit` | Work-product submission. | |
| `/courses/aibi-p/certificate` | Credential preview / download. | |
| `/courses/aibi-p/settings` | Onboarding answer edits. | |

### 2.8 AiBI-S, AiBI-L (soft-hidden 2026-05-05)

| Path | Purpose | Notes |
|---|---|---|
| `/courses/aibi-s` + `/aibi-s/ops` + `/aibi-s/ops/unit/[unitId]` | Specialist track. | Redirected to /education in next.config.mjs. |
| `/courses/aibi-l` + `/aibi-l/[session]` + `/aibi-l/request` | Leader track. | Same. |

### 2.9 Certifications + verification

| Path | Purpose | Notes |
|---|---|---|
| `/certifications/exam/aibi-p` | Proficiency exam. | Standalone surface; entry point unclear. |
| `/verify/[certificateId]` | Public credential verification. | LinkedIn-shareable. |

### 2.10 Resources / lead-mag

| Path | Purpose | Notes |
|---|---|---|
| `/resources` | AI Banking Brief archive + newsletter signup. | |
| `/resources/the-widening-ai-gap` | Article. | |
| `/resources/members-will-switch` | Article. | |
| `/resources/six-ways-ai-fails-in-banking` | Article. | |
| `/resources/the-skill-not-the-prompt` | Article. | |
| `/resources/ai-governance-without-the-jargon` | Article. | |
| `/resources/what-your-efficiency-ratio-is-hiding` | Article. | |
| `/prompt-cards` | Lead-magnet card pack. | Email-gated. |
| `/practice/[repId]` | "Today's AI Rep" practice. | |

### 2.11 Admin (internal only)

| Path | Purpose |
|---|---|
| `/admin` | Internal dashboard. |
| `/admin/reviewer/[id]` | Submission review. |

---

## 3. Consolidation candidates

Ranked by impact-per-effort. Pick whichever combination feels right.

### 3.1 — Merge `/assessment/start` into `/assessment` (high impact, low risk)

**Today:** `/assessment/start` shows a "what to expect" page; clicking
"Start" navigates to `/assessment` which is the actual quiz. Two URLs,
one journey.

**Proposal:** Inline the start-page copy as the first screen of
`/assessment` itself (above the question card, hidden once Q1 is
answered). Redirect `/assessment/start` → `/assessment`.

**Wins:** one less hop. Returning visitors with no in-progress state
land directly on the welcome screen; visitors mid-take resume.

### 3.2 — Collapse `/dashboard/progression` into `/dashboard` (medium)

The dashboard already shows next action, course progress, and artifacts.
`/dashboard/progression` appears to render module status detail —
verify whether anything there isn't already on `/dashboard`. If it's
purely a deeper module view, fold it into a `<details>` block on
`/dashboard` or move to `/courses/aibi-p` sidebar.

### 3.3 — `/certifications/exam/aibi-p` ⇄ `/courses/aibi-p/post-assessment`
       (medium)

Probably the same exam wearing two URLs. Pick one canonical, redirect
the other. Likely keep `/certifications/exam/aibi-p` as the public
verifiable surface; redirect post-assessment to it.

### 3.4 — `/for-institutions/advisory` rolled into `/for-institutions` (small)

The advisory tiers (Pilot/Program/Leadership Advisory) are presently a
single section. Make them an anchor (`#advisory`) on the main page
instead of a sub-route. Reduces nav fanout; keeps one URL for the
institution conversation.

### 3.5 — `/assessment/results/print/[id]` is internal — hide from nav (verify)

Already not user-discoverable, but worth confirming nothing links to it
publicly. The PDF generation should be the only consumer.

### 3.6 — Rename for clarity (no consolidation, just naming)

- `/assessment` → `/assessment/take` (parallels `/assessment/in-depth/take`)
- `/courses/aibi-p` (overview) is fine; the **layout** does the heavy
  lifting — confirm the overview screen reads well for both new and
  enrolled users (one page, two states).

---

## 4. Frictions worth fixing without consolidating

| Friction | Current | Proposed |
|---|---|---|
| Buyer enters email twice | Free EmailGate + In-Depth purchase | (Done 2026-05-05) — `/api/auth/me` prefill on EmailGate; server-side prefill on cards |
| In-Depth post-checkout dance | session→token→login→take | (Done 2026-05-05) — but still 4 hops. Consider compressing token-resolution into the same page render. |
| Free assessment auto-loads stale | sessionStorage rehydration | (Done 2026-05-05) — drop completed state on hydration |
| "For Learners" gated by onboarding | Layout redirect | (Done 2026-05-05) — overview now exempt |
| In-Depth artifact wall of text | `whitespace-pre-wrap` | (Done 2026-05-05) — react-markdown |
| Toolbox tier unclear to starter buyers | One paywall | (Done 2026-05-05) — `tier: 'full' \| 'starter'` with banner |

---

## 5. Recommended next step

Pick one of:

- **A.** Implement the start-page consolidation (3.1). Concrete,
  low-risk, removes one URL from the funnel.
- **B.** Audit `/dashboard/progression` vs `/dashboard` overlap (3.2)
  and decide whether to merge.
- **C.** Decide on advisory rollup (3.4) — small, but tightens the
  /for-institutions story.

Or: surface a different journey I haven't named.

---

# Part II — Merge Brief (feature/stripe-products → main)

**Commits ahead of main:** 30

This document is intended for an engineer reviewing the branch cold.
Sections: what ships, what changed in existing code, what infra has to
move, what's still untested, and the known frictions.

---

## 1. What ships (new product surface)

### 1.1 In-Depth AI Readiness Assessment ($99 individual / $79 per seat × 10+ institution)

A second paid product alongside the existing AiBI-P course. 48 questions
(the same v2 question pool as the free 12Q, but the entire pool, not a
12-question rotation). Two purchase paths:

**Individual ($99):**
- `/assessment/in-depth` — marketing page + `BuyForMyselfCard`
- Stripe Checkout → webhook creates `indepth_assessment_takers` row
- Post-checkout redirect: `/assessment/in-depth/take?session=…`
- **Forced auth gate:** redirected to `/auth/login?next=…&email=…` (Magic
  Link by default for new buyers)
- After sign-in: `/take?token=…` → 48Q quiz → `/results/in-depth/[id]`

**Institution leader ($79 × N seats, N ≥ 10):**
- `/assessment/in-depth` — `BuyForMyTeamCard`
- Stripe Checkout → webhook creates `indepth_assessment_institutions` row
- Post-checkout redirect: `/assessment/in-depth/dashboard?session=…`
- Leader binds `leader_user_id` on first authed visit
- Leader invites staff via textarea (1 email per line) → `/api/indepth/invite`
- Anonymized aggregate report unlocks at 3+ completed responses
  - Tier band, dimension averages, low/mid/high distribution per dimension
  - Champions: top-2 takers ≥ 156/192 (81%) shown by email

**Institution invitee (staff):**
- Receives Resend magic-link email from leader
- `/take?token=<long-token>` — token-only access, no sign-in required
- Result lands on `/results/in-depth/[id]` (UUID-as-access-token model;
  no owner-binding enforced today — flagged as known limitation)

### 1.2 AI Starter Toolkit (entitlement)

Both individual buyers and institution leaders receive the
`indepth-starter-toolkit` entitlement on payment. This grants **read-only**
access to `/dashboard/toolbox`:

- **Visible tabs:** Start Here, Library
- **Hidden tabs:** Build, Playground, My Toolbox
- Banner explains the limitation and links to AiBI-P enrollment

Existing AiBI-P/S/L/toolbox-only tiers are unaffected (return `tier: 'full'`).

### 1.3 `/dashboard/assessments`

New page listing all completed takes for the signed-in user:
- In-Depth takes by `user_id` (bound at first authed take-page visit)
- Free readiness takes by `email` match on `user_profiles`

Empty states surface CTAs back to `/assessment/in-depth` and `/assessment/start`.

---

## 2. New API routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/api/indepth/submit-answers` | POST | Persist 48 answers + score; fire completion email + ConvertKit tag | Token (takerId) |
| `/api/indepth/invite` | POST | Leader-only bulk invite. Validates seats, generates tokens, sends Resend emails. Idempotent on (institution_id, invite_email) unique constraint | Supabase Auth + leader_user_id check |
| `/api/indepth/resend` | POST | Per-row resend from the leader dashboard. Looks up existing token, re-sends Resend email | Supabase Auth + leader |
| `/api/indepth/aggregate` | GET | Anonymized aggregate report. Returns `unlocked: false` < 3 responses | Supabase Auth + leader |
| `/api/auth/me` | GET | Returns `{ email }` for the current Supabase Auth user (or null). Used for client-side prefill on EmailGate. | None (returns null when not signed in) |

---

## 3. New DB schema

### 3.1 Migration `00028_indepth_assessment_tables.sql`

```
indepth_assessment_institutions (
  id, institution_name, leader_email, leader_user_id (nullable),
  seats_purchased, amount_paid_cents, stripe_session_id (unique),
  created_at
)

indepth_assessment_takers (
  id, institution_id (nullable — null for individual buyers),
  invite_email, invite_token (unique), invite_sent_at,
  invite_consumed_at, completed_at,
  score_total, score_per_dimension, answers,
  stripe_session_id (unique nullable)
)
```

RLS enabled on both. Service-role client used everywhere — RLS is
defense-in-depth, not the primary access control.

### 3.2 Migration `00029_indepth_user_id_and_starter_toolkit.sql`

```sql
ALTER TABLE indepth_assessment_takers
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE entitlements DROP CONSTRAINT entitlements_product_check;
ALTER TABLE entitlements ADD CONSTRAINT entitlements_product_check
  CHECK (product IN (
    'aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only',
    'indepth-starter-toolkit'  -- NEW
  ));
```

**Both migrations must run before deploying the branch** — the code on
the branch will throw if the columns / CHECK aren't there.

---

## 4. Modifications to existing surfaces

### 4.1 Stripe / checkout / webhook

- `src/app/api/create-checkout/route.ts` — dispatches on `product`, adds
  `indepth-assessment` mode (individual + institution).
- `src/lib/stripe.ts` — `CheckoutMetadata` widened with
  `institution_name`, `quantity`, `leader_email`.
- `src/lib/stripe/provision-enrollment.ts` — two new branches
  (`provisionIndepthIndividual`, `provisionIndepthInstitution`) and a
  `grantStarterToolkitEntitlement` helper that writes the entitlement
  row when an auth user already exists. Deferred grant on first authed
  take-page visit otherwise.

### 4.2 Free 12Q assessment

- `useAssessmentV2.ts` — persists `phase`; validates each answer is 1–4;
  drops a completed (12-answer) sessionStorage payload on hydration so
  returning visitors get a fresh take.
- `assessment/page.tsx` — Start-Over button below the question card
  when ≥1 answer exists.
- `EmailGate.tsx` — calls `/api/auth/me` on mount to prefill email for
  authed visitors.
- `ResultsViewV2.tsx` — strengthened CTA styling to In-Depth (was
  `font-mono text-[10px]`, now canonical institutional CTA recipe).
- `PdfDownloadButton.tsx` — removed the "Preparing your brief…" loader
  text; button silently appears when ready.

### 4.3 Tier band rebalancing (12-48 → applies to both products)

- `content/assessments/v2/scoring.ts` — `getTierV2(score, maxScore=48)`
  normalizes In-Depth scores (range 48-192) onto the canonical 12-48
  tier scale before bucketing. Tier bands themselves are unchanged.
- Existing free-assessment downstream consumers updated to pass through
  the v2 scoring function (some passed v1 scores).

### 4.4 Course discovery

- `/courses/aibi-p/layout.tsx` — bare `/courses/aibi-p` overview added
  to onboarding-exempt list, so the global "For Learners" nav lands the
  user on the overview rather than force-redirecting them into the 3Q
  survey. Module routes still gate.

### 4.5 Toolbox

- `lib/toolbox/access.ts` — `getPaidToolboxAccess` returns
  `{ userId, products, tier: 'full' | 'starter' }`. Starter is granted
  by the new `indepth-starter-toolkit` entitlement only.
- `dashboard/toolbox/page.tsx` — header changes label/subtitle/CTA based
  on tier; starter banner above the toolbox.
- `dashboard/toolbox/ToolboxApp.tsx` — `STARTER_TABS` filter hides
  Build/Playground/My Toolbox.

### 4.6 Marketing surfaces

- `/education` — new "Diagnostics · Paid" section with In-Depth.
- `/for-institutions` — new In-Depth band; advisory tiers replaced by
  custom-engagements contact stub.
- AiBI-S and AiBI-L cards removed from `/education` (decision 2026-05-05).

### 4.7 Auth

- `/auth/login` — accepts `?email=` prefill; defaults to Magic Link tab
  when `?next=/assessment/in-depth/take…`; preface text explains no
  password is required for first-time buyers.

### 4.8 next.config.mjs redirects

```js
// Soft-hide AiBI-S, AiBI-L
'/courses/aibi-s'      → '/education'   (302)
'/courses/aibi-l'      → '/education'   (302)
'/courses/aibi-s/:path*' → '/education' (302)
'/courses/aibi-l/:path*' → '/education' (302)
// Advisory tiers folded into /for-institutions
'/for-institutions/advisory'         → '/for-institutions' (302)
'/for-institutions/advisory/:path*'  → '/for-institutions' (302)
```

All non-permanent so we can flip back without browser cache pollution.

### 4.9 Resend / observability

- `lib/resend/index.ts` — three new In-Depth email templates
  (individual invite, institution invite, individual results).
- All Resend functions now `console.warn` on skip with the recipient +
  reason (was silent). Suppressed in tests via `NODE_ENV=test` and
  in CI via `RESEND_QUIET=true`.

### 4.10 Pricing alignment

- `/courses/aibi-p/purchase` — pricing aligned to $295 / $199 (10+
  institution). Free assessment results align too.

---

## 5. Stripe + ConvertKit + Resend infra changes

### 5.1 Stripe (test mode used during development)

**Products / prices to provision in live mode before launch:**

| Product | Price ID env var | Amount |
|---|---|---|
| In-Depth Assessment (individual) | `STRIPE_INDEPTH_INDIVIDUAL_PRICE_ID` | $99 once |
| In-Depth Assessment (institution per-seat) | `STRIPE_INDEPTH_INSTITUTION_PRICE_ID` | $79 once × N seats |
| AiBI-P (individual) | `STRIPE_AIBIP_PRICE_ID` (existing) | $295 |
| AiBI-P (institution per-seat) | `STRIPE_AIBIP_INSTITUTION_PRICE_ID` | $199 × N |

**Webhook endpoint:** `/api/webhooks/stripe` — already exists, the
provision-enrollment dispatcher now branches on `product`+`mode`.

**Comp coupon (test only):** `PagO0hdu` (100% off, max 20 redemptions).
Active codes: `AIBI-COMP-03` through `AIBI-COMP-07`.

### 5.2 ConvertKit tags + sequences

Three new tag IDs needed in env:

```
CONVERTKIT_TAG_ID_INDEPTH_INDIVIDUAL
CONVERTKIT_TAG_ID_INDEPTH_LEADER
CONVERTKIT_TAG_ID_INDEPTH_COMPLETER
```

Sequences to author per CLAUDE.md weekend env setup task.

### 5.3 Resend

- `RESEND_API_KEY` must be set in the deploy env or the In-Depth
  completion email + invite emails silently no-op (now with a stderr
  warn). Domain `aibankinginstitute.com` still pending verification per
  CLAUDE.md 2026-04-17 entry.
- Sender stays `onboarding@resend.dev` until verification.

### 5.4 Supabase

- Run migrations 00028 + 00029.
- No RLS policy changes on `entitlements` (the existing service-role-
  only-write policy still applies).

---

## 6. Tests + coverage

- 250 vitest tests passing on the branch.
- New unit tests added for:
  - `provisionIndepthIndividual` / `provisionIndepthInstitution` happy
    paths + idempotency
  - `computeAggregate` (privacy floor, dimension distributions,
    champion threshold, weakest/strongest sets)
  - `submit-answers` route validation
  - `invite` route seat-cap + binding
  - In-Depth scoring normalization
- **No e2e tests** for the take → submit → results flow. Smoke-tested
  manually on localhost with Stripe CLI tunneling to
  `localhost:3000/api/webhooks/stripe`.

---

## 7. Known frictions / things the engineer should look at

These are the ones I flagged during the build but did not fix:

1. **`/results/in-depth/[id]` has no owner-binding.** Anyone with the
   UUID sees the result. Documented in the page header. The intent was
   to keep email-magic-link access working without making invitees
   create accounts. Tighten when leader dashboards expose individual
   IDs (which today they do not).
2. **In-Depth post-checkout flow has 4 hops** (session → token → login →
   take). Each hop is necessary given the data model, but the
   experience is jarring. Could compress token resolution into the
   login redirect itself.
3. **No client-side rate limiting on `/api/indepth/invite`.** The leader
   could spam the resend endpoint. Server has a per-token uniqueness
   constraint on insert, but resend re-uses tokens. Low priority — only
   the leader can hit it, and they're auth-bound.
4. **`/results/in-depth/[id]` rendered markdown is identical across all
   four tier bands** for a given dimension. The per-tier preface
   suggested in CLAUDE.md isn't implemented yet. Flagged in the PRD as
   a "perceived value" lever for $99/$79.
5. **No e2e for the magic-link redirect dance.** Local smoke-tested but
   Vitest only covers the handlers. Worth a Playwright pass before
   prod.
6. **`getPaidToolboxAccess` dev bypass** (`SKIP_ENROLLMENT_GATE=true`)
   returns `tier: 'full'` — fine for testing but flag if anyone runs
   it in production.

---

## 8. Recommended deploy order

1. **Apply migrations** (`supabase db push --linked`) on the target env
2. **Create Stripe products + prices** in live mode; populate env vars
3. **Create ConvertKit tags + sequences**; populate env vars
4. **Set `RESEND_API_KEY`** in deploy env
5. **Merge branch → main**, deploy to staging
6. **Smoke test on staging:**
   - Cold visitor → free 12Q → email gate → results
   - In-Depth individual purchase → magic link → take → results
   - In-Depth institution leader purchase → dashboard → invite → aggregate (use 3+ comp codes)
   - Toolbox access for both starter (In-Depth buyer) and full (AiBI-P enrollee) tiers
7. **Promote to production**, monitor Stripe webhook deliveries

---

## 9. What's NOT in this branch

For your engineer's awareness:

- AiBI-S, AiBI-L are soft-hidden via redirects but their pages still
  exist in the repo. Reactivating means removing 4 redirects, re-adding
  cards in `/education`, and toggling Stripe products to `active=true`.
- Advisory tiers (`/for-institutions/advisory`) likewise redirected
  pending case studies.
- Per-tier framing on the In-Depth starter artifact (item 4 in section 7).
- E2E test pass.
- Production webhook signing-secret rotation if test webhook used the
  same one (verify `STRIPE_WEBHOOK_SECRET` matches the live endpoint).
