# Stripe Products & Pricing — The AI Banking Institute

**Status:** Needs production dashboard verification before paid promotion.
**Source of truth for live checkout behavior:** `src/app/api/create-checkout/route.ts`,
`src/app/api/checkout/in-depth/route.ts`, `src/app/api/checkout/team-assessment/route.ts`,
and `src/app/api/webhooks/stripe/route.ts`.
**Currency:** USD across the board. **Tax:** Stripe Tax disabled for now — bank/CU buyers are typically tax-exempt and we'll handle exemptions case-by-case until volume justifies enabling it.

---

## What ships now vs. what gets created in Stripe but stays dark

| Product | Stripe state at launch | Site state at launch |
|---|---|---|
| AI Readiness Assessment (free) | **No Stripe object** — it's free. | Live (`/assessment`) |
| In-Depth Assessment (paid, $99 individual) | **Block 1 — create product + 1 price + (optional) comp codes.** Active for individual purchase. | Live at `/assessment/in-depth`; institution mode returns a contact-us message. |
| Foundation Course ($295 individual) | **Block 1 — create product + individual price.** Active after live QA. | Live at `/courses/foundation/program/purchase`. |
| Foundation institution bundle ($199/seat, min 10) | **Appendix A — defer.** Assisted-sales; invoice the first deal. | Contact-us / assisted rollout |
| Team Assessment (paid, min 10 seats) | **Appendix A — defer.** Assisted-sales until 2 cohorts pass E2E QA. | Route exists at `/assessment/team`; treat as assisted-sales until hardening passes. |
| AiBI-S Specialist ($1,495 / seat) | **Appendix A — defer.** Create only when a cohort date is real. | "Request info" form only |
| AiBI-L Leader ($2,800 individual / $12,000 team of 8) | **Appendix A — defer.** Create only when a workshop date is real. | "Request info" form only |
| Advisory: Pilot · Program · Leadership Advisory | **Never in Stripe.** Custom-quoted, invoiced. | "Request info" form only |

Deferred products should not receive launch-time `price_*` IDs. Create those
Stripe prices only when the offer is intentionally enabled or a real
assisted-sales buyer makes the SKU concrete.

---

## Product 1 — AI Readiness Assessment (free)

**No Stripe involvement.** Documented here so the funnel is complete:
- Lives at `/assessment`. 12 questions, roughly 3 minutes. The free output is a readiness snapshot and 30-day next move.
- This is the lead magnet, not a SKU. Conversion goal: free result → email capture → $99 In-Depth Assessment or $295 Foundation Course.
- Future "premium assessment add-ons" (peer benchmarks, etc.) are deferred per 2026-04-15 entry until N≥30 per segment exists.

---

## Product 2 — In-Depth Assessment ($99 individual)

Paid follow-up to the free 12-question assessment. The current self-serve route is individual purchase only. Institution/bulk mode intentionally returns a contact-us message until seat semantics and fulfillment are hardened.

### Product

| Field | Value |
|---|---|
| `product.name` | `In-Depth AI Readiness Assessment` |
| `product.description` | `Paid follow-up to the free 12-question snapshot. Individual 48-question AI readiness diagnostic with dimension-level scoring, personal recommendations, and a practical next-step plan. One-time purchase.` |
| `product.metadata.tier` | `assessment-plus` |
| `product.metadata.access_grant` | `assessment-indepth` |

### Price

| Field | Individual |
|---|---|
| `price.unit_amount` | `9900` (cents) |
| `price.currency` | `usd` |
| `price.recurring` | none — one-time |
| `price.nickname` | `In-Depth Assessment — Individual` |
| `.env.local` key | `STRIPE_INDEPTH_PRICE_ID` |

### Free promo codes (2) — for comp / testing

Create **one coupon, two redeemable promotion codes** so you can hand the codes to specific people without minting a new coupon every time.

| Coupon field | Value |
|---|---|
| `coupon.id` (let Stripe auto-generate) | — |
| `coupon.percent_off` | `100` |
| `coupon.duration` | `once` |
| `coupon.max_redemptions` | `2` (hard cap across both codes) |
| `coupon.applies_to.products` | `[<In-Depth Assessment product id>]` (scope the comp so it can't accidentally zero out an AiBI Foundations sale) |
| `coupon.metadata.purpose` | `comp-testing` |

Then attach two promotion codes to that coupon:

| Promotion code | `code` | `max_redemptions` | `expires_at` |
|---|---|---|---|
| 1 | `AIBI-COMP-01` | `1` | 90 days from creation |
| 2 | `AIBI-COMP-02` | `1` | 90 days from creation |

Result: each code is a one-shot 100%-off, scoped to the In-Depth Assessment only, expiring in 90 days. If both burn, mint two more — don't widen the cap on the existing coupon (that's how comps leak). Track who you gave them to in a tracked spreadsheet or in the promotion code's own Stripe `metadata` (there is no CRM — HubSpot was removed 2026-05).

> **Comp revocation caveat.** A 100%-off session has `amount_total: 0`, **no PaymentIntent, and no charge** — so the `charge.refunded` revocation path (see Webhook setup) can never fire for a comp. To pull access from a comped account you must **manually delete its `course_enrollments` row** in Supabase (the `entitlements` sync trigger then flips access off). Before relying on comps, confirm in test mode that a $0 session actually fires `checkout.session.completed`; do not assume it.

**Apply at checkout:** Stripe Checkout has the "Allow promotion codes" toggle. Enable it on this product's Checkout Sessions:
```typescript
allow_promotion_codes: true
```
Customer types `AIBI-COMP-01` at checkout → total goes to $0 → `checkout.session.completed` still fires → webhook still grants access. The comp is invisible to your code; it just sees a successful session with `amount_total: 0`.

---

## Product 3 — Foundation Course ($295 individual / $199 per seat institution bundle)

The flagship individual course. The current course is 18 bite-sized modules built around bank-safe AI basics, prompt building, reusable skills, workflow artifacts, Toolbox saves, and a certificate.

| Field | Value |
|---|---|
| `product.name` | `AiBI-Foundation · The AI Banking Institute` |
| `product.description` | `Self-paced Foundation course for banking professionals. Includes 18 bite-sized modules, reusable prompts, skills, workflow artifacts, Toolbox saves, and the Foundation certificate.` |
| `product.metadata.tier` | `aibi-p` *(legacy value — keep; webhook/entitlement reads still tolerate `aibi-p`. Do not "fix" this without updating the read path.)* |
| `product.metadata.credential_code` | `AiBI-Foundation` |
| `product.metadata.access_grant` | `course:aibi-p` *(legacy — same reason as `tier`)* |
| `product.metadata.format` | `self-paced` |
| `price.unit_amount` | `29500` |
| `price.currency` | `usd` |
| `price.recurring` | none — one-time |
| `price.nickname` | `AiBI-Foundation — Individual` |

> **Brand:** the canonical credential is `AiBI-Foundation` (hyphenated, singular). The plural "AiBI Foundations" and the old "AI Banking AiBI Foundations" string are banned (see CLAUDE.local brand rules) — buyers see `product.name` on their Stripe receipt, so it must be brand-clean.
| `.env.local` key | `STRIPE_FOUNDATION_PRICE_ID` (legacy fallbacks: `STRIPE_FOUNDATIONS_PRICE_ID`, `STRIPE_AIBIP_PRICE_ID`) |

**Volume / institution pricing (added 2026-05-05):** A second price exists on the same product for institution bundles.

| Field | Value |
|---|---|
| `price.unit_amount` | `19900` (= $199/seat) |
| `price.nickname` | `AiBI-Foundation — Institution Bundle ($199/seat, min 10)` |
| `price.metadata.min_quantity` | `10` |
| `.env.local` key | `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` (legacy fallbacks: `STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID`, `STRIPE_AIBIP_INSTITUTION_PRICE_ID`) |

The minimum-quantity guard (`>= 10`) is enforced at the API route level in `/api/create-checkout`, not in Stripe. Net effect: 10 seats = $1,990 (~33% off list); 25 seats = $4,975. Single-seat AiBI Foundations remains $295. No customer should ever buy 1–9 institution seats — the route rejects qty < 10 with 400.

---

## Product 4 — AiBI-S Specialist ($1,495/seat) — staged dark

Cohort-based, 16-hour live track. Per-track Specialist credentials (AiBI-S/Ops, AiBI-S/Lending, AiBI-S/Compliance). Decision 2026-04-19 in memory: format will eventually shift to self-paced to match AiBI Foundations, but PRD currently says cohort. Create the product anyway so the price ID slot exists in `.env.local`.

| Field | Value |
|---|---|
| `product.name` | `AiBI-S · Banking AI Specialist Certification` |
| `product.active` | `false` until first cohort scheduled |
| `product.metadata.tier` | `aibi-s` |
| `product.metadata.access_grant` | `course:aibi-s` |
| `price.unit_amount` | `149500` |
| `price.nickname` | `AiBI-S — Per Seat` |
| `.env.local` key | `STRIPE_AIBIS_PRICE_ID` |

Add institution pricing only after the first real Specialist deal makes the seat count and delivery model concrete.

---

## Product 5 — AiBI-L Leader ($2,800 / $12,000) — staged dark

C-suite workshop, 1-day in-person. Two prices on one product:

| Field | Individual | Team of 8 |
|---|---|---|
| `product.name` (shared) | `AiBI-L · Banking AI Leader Certification` | (same) |
| `product.active` | `false` until first workshop date | (same) |
| `price.unit_amount` | `280000` | `1200000` |
| `price.nickname` | `AiBI-L — Individual` | `AiBI-L — Team of 8` |
| `.env.local` key | `STRIPE_AIBIL_PRICE_ID` | `STRIPE_AIBIL_TEAM_PRICE_ID` |

---

## What we deliberately do NOT create in Stripe

**Advisory engagements (Pilot · Program · Leadership Advisory).**
Per decision 2026-04-24, these are coaching engagements that pair with cohorts. Pricing was removed from the public site until case studies exist. Sales motion is consultative — quote, contract, invoice via Stripe Invoicing (manual) when a deal closes. **Do not create products or fixed prices for these.** When the first one sells, send a one-off invoice through Stripe; only formalize a SKU after three closed deals at the same price tell us what the price actually is.

---

## Webhook setup

**There is no staging environment.** The two environments are Vercel **preview URLs**
(test-mode QA) and **production** (live). Stripe is **two separate accounts**, not one
account with test/live modes — the sandbox account (CLI-paired) and the live account
(production fulfillment). Signing secrets are **per-endpoint, per-account**.

**Canonical endpoint path (both accounts):** `/api/webhooks/stripe`
- QA / test mode: register a sandbox-account endpoint at a Vercel **preview URL**
  (`https://aibi-<hash>-…vercel.app/api/webhooks/stripe`), **or** run the Stripe CLI
  `stripe listen --forward-to localhost:3000/api/webhooks/stripe` against local dev.
- Production: register a **live-account, live-mode** endpoint at
  `https://www.aibankinginstitute.com/api/webhooks/stripe`.

**Events to subscribe (the handler consumes all four — subscribe all four):**
- `checkout.session.completed` — **load-bearing.** Provisions Foundation / In-Depth / Team Assessment access from `metadata.product` (writes `course_enrollments`).
- `charge.refunded` — **load-bearing.** Automatically revokes access (full refund → entitlement off; partial → retained). If you skip this, refunds will *silently* fail to revoke and the §6 refund smoke test will fail with no obvious cause.
- `payment_intent.payment_failed` — logs failed-purchase analytics.
- `payment_intent.succeeded` — acknowledged; fulfillment lives on Checkout completion.
- `customer.subscription.*` — **not subscribed.** No subscription products yet.

> This list must stay identical to `docs/launch-checklist.md §4`. If they ever
> disagree, the handler in `src/app/api/webhooks/stripe/route.ts` is the source of truth.

**Signing secrets:** one per endpoint, per account. Store the **live-account, live-mode**
endpoint's secret as `STRIPE_WEBHOOK_SECRET` (Production scope). Optional
`STRIPE_WEBHOOK_SECRET_TEST` is also read by the route (`route.ts`) so sandbox-account
test-mode events can be verified against a deployed preview during QA. A sandbox-triggered
event will **never** verify against the production `STRIPE_WEBHOOK_SECRET` — a 400
`signature verification failed` from a sandbox trigger proves the route is reachable but
expected to mismatch.

---

## Customer metadata convention

Every Checkout Session created from the site sets:

```typescript
metadata: {
  product: 'foundation' | 'in-depth-assessment' | 'team-assessment',
  mode: 'individual' | 'institution',
  tier: 'individual' | 'team',
  user_email: <buyer email if collected>,
  institution_name: <institution/team buyer name if collected>,
  quantity: <seat count as string if institution/team purchase>,
}
```

The webhook handler reads `metadata.product` to decide whether to write `course_enrollments`, `institution_enrollments`, or `team_assessment_cohorts`. Current Foundation writes normalize to `foundation`; legacy reads still tolerate older values such as `aibi-p`.

---

## Tax, fees, refunds

- **Stripe Tax:** off until US sales-tax exposure is real. Banks/CUs are largely exempt; revisit after 50 transactions or first multi-state pattern.
- **Processing fees:** absorbed (~2.9% + $0.30 per US card). Net on $295 ≈ $286.15. Net on $99 ≈ $95.83. Net on a 10-seat Foundation institution purchase at $1,990 ≈ $1,931.99. Comp codes ($0 sessions) incur **no fee** since Stripe charges nothing on a zero-amount payment.
- **Refund policy:** public site currently states 7 days for unused digital purchases: assessment not submitted, fewer than two course modules completed, and no certificate issued. Duplicate purchases and unresolved access failures are also refundable. Process refunds through Stripe dashboard with an explicit access-check follow-up.

---

## Test cards (test mode only)

| Scenario | Card |
|---|---|
| Success | `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP |
| Authentication required (3DS) | `4000 0025 0000 3155` |
| Decline (generic) | `4000 0000 0000 0002` |
| Decline (insufficient funds) | `4000 0000 0000 9995` |
| Decline (fraudulent) | `4100 0000 0000 0019` |

---

## Order of operations (what to ask the MCP)

**The launch needs exactly two products and one webhook.** Everything else lives in
Appendix A and is created only when a real buyer/cohort makes the SKU concrete — do not
provision dark inventory at launch (it just has to be maintained twice across the
test→live split). Run Block 1 in sequence; paste returned price IDs into `.env.local`
and Vercel (price IDs are not secrets).

**Block 1 — The launch (two products, comp codes, webhook):**
1. Create product **In-Depth AI Readiness Assessment** (Product 2 fields). Create one $99 individual price → `STRIPE_INDEPTH_PRICE_ID`.
2. Create product **AiBI-Foundation** (Product 3 fields). Create the $295 individual price → `STRIPE_FOUNDATION_PRICE_ID`.
3. *(Optional, comp/testing only.)* Create the comp coupon (100% off, max 2 redemptions, scoped to the In-Depth product) and attach two single-use promotion codes `AIBI-COMP-01` / `AIBI-COMP-02`, each expiring 90 days out. Remember comps can't be refund-revoked (see the comp caveat under Product 2) — to pull a comp, delete its `course_enrollments` row.
4. Create **one live-account, live-mode** webhook endpoint at `https://www.aibankinginstitute.com/api/webhooks/stripe`, subscribed to all four events listed under **Webhook setup**. Capture its signing secret → `STRIPE_WEBHOOK_SECRET`.

**Block 2 — Verification (then hand off to `docs/launch-checklist.md`):**
5. List products + prices; confirm metadata, brand-clean names, and active flags.
6. List webhook endpoints; confirm the URL and that all four events are subscribed.
7. In **test mode**, redeem `AIBI-COMP-01` against the In-Depth Checkout link; confirm `amount_total: 0`, that `checkout.session.completed` fires, and that access is granted.
8. Run the live purchase + refund + idempotency smoke tests in **`docs/launch-checklist.md` §6** — that file is the single launch gate; do not duplicate its checklist here.

> **Appendix A — When a real buyer appears (do NOT run at launch):**
> - **Foundation institution bundle** ($199/seat, min 10): assisted-sales. Invoice the first deal via Stripe Invoicing; formalize the `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` price only once seat count + fulfillment are proven.
> - **Team Assessment** (per-seat): assisted-sales until two production-like cohorts pass E2E QA (per the GTM plan). Create `STRIPE_TEAM_ASSESSMENT_PRICE_ID` then, not before.
> - **AiBI-S Specialist** (`active:false`): create only when a cohort date is real → `STRIPE_AIBIS_PRICE_ID`.
> - **AiBI-L Leader** (`active:false`): create only when a workshop date is real → `STRIPE_AIBIL_PRICE_ID` / `STRIPE_AIBIL_TEAM_PRICE_ID`.
> - **Advisory** (Pilot/Program/Leadership): never a Stripe product; one-off Stripe Invoice per deal; formalize a SKU only after three closed deals at the same price.

---

## What changes for go-live (test → live)

When ready to flip to live mode (this is the **live Stripe account**, not the sandbox):
1. Create the live product/price set in the live account (Stripe doesn't promote test objects to live, and the two accounts are separate worlds). Easiest: re-run **Block 1** against the live key.
2. Set `STRIPE_SECRET_KEY=sk_live_…` in the **Production** scope only. There is **no** client-side Stripe key — checkout is a server-side redirect (`stripe.checkout.sessions.create`), so do not set any `pk_*` / `NEXT_PUBLIC_STRIPE_KEY`. Preview keeps test keys.
3. Point the Stripe CLI / MCP at the live account for live operations (`stripe login --interactive` → select the non-sandbox account). The CLI is paired to the sandbox by default.
4. Register the live-mode webhook endpoint, capture its fresh signing secret into `STRIPE_WEBHOOK_SECRET` (Production scope).
5. The launch gate already lives in `docs/launch-checklist.md` — confirm "Stripe live products created and price IDs in Vercel production env" there rather than duplicating a checklist here.

---

## Reference: env vars this doc creates

```bash
# --- Launch-critical (the only Stripe vars first-dollar needs) ---
STRIPE_SECRET_KEY=sk_live_...                          # sk_test_... on preview
STRIPE_INDEPTH_PRICE_ID=price_...                      # $99 individual In-Depth
STRIPE_FOUNDATION_PRICE_ID=price_...                   # Foundation course, $295 (1 seat)
STRIPE_WEBHOOK_SECRET=whsec_...                        # live-account, live-mode endpoint secret

# There is NO client-side Stripe key. Checkout is a server-side redirect, so
# NEXT_PUBLIC_STRIPE_KEY / pk_* is NOT used anywhere and must not be set.

# Optional — sandbox test-mode verification against a deployed preview
STRIPE_WEBHOOK_SECRET_TEST=whsec_...                   # optional, QA only

# --- Deferred (DO NOT create at launch — see Appendix A) ---
# Create these only when a real buyer/cohort makes the SKU concrete:
# STRIPE_FOUNDATION_INSTITUTION_PRICE_ID=price_...     # $199/seat bundle (min 10) — assisted-sales
# STRIPE_TEAM_ASSESSMENT_PRICE_ID=price_...            # Team Assessment — assisted-sales
# STRIPE_AIBIS_PRICE_ID=price_...                      # AiBI-S — when a cohort date exists
# STRIPE_AIBIL_PRICE_ID=price_...                      # AiBI-L — when a workshop date exists
# STRIPE_AIBIL_TEAM_PRICE_ID=price_...
```
