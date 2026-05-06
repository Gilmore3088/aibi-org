# Merge Brief — feature/stripe-products → main

**Date:** 2026-05-06
**Branch:** feature/stripe-products
**Diff scale:** 67 files changed (+9,282 / −462). 30 added, 36 modified, 1 deleted.
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
