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
| In-Depth Assessment (paid, $99 individual) | **Create product + 1 price + promo codes.** Active for individual purchase. | Live at `/assessment/in-depth`; institution mode returns a contact-us message. |
| Foundation Course ($295 individual / $199 per seat institution bundle, min 10) | **Create product + individual price + institution price.** Active after live QA. | Live at `/courses/foundation/program/purchase`. |
| Team Assessment (paid, min 10 seats) | **Create product + per-seat price only if intentionally selling.** | Route exists at `/assessment/team`, but treat as assisted-sales until hardening passes. |
| AiBI-S Specialist ($1,495 / seat) | Create product + price. **Mark `active: false` until cohort dates set.** | "Request info" form only |
| AiBI-L Leader ($2,800 individual / $12,000 team of 8) | Create both prices. **Mark `active: false`.** | "Request info" form only |
| Advisory: Pilot · Program · Leadership Advisory | **Do NOT create in Stripe.** Custom-quoted, invoiced. | "Request info" form only |

Inactive prices still receive `price_*` IDs you can paste into `.env.local` so the code paths exist; they just can't be used in a Checkout Session until flipped to `active: true`.

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

Result: each code is a one-shot 100%-off, scoped to the In-Depth Assessment only, expiring in 90 days. If both burn, mint two more — don't widen the cap on the existing coupon (that's how comps leak). Track who you gave them to in HubSpot under contact notes.

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
| `product.name` | `AI Banking AiBI Foundations` |
| `product.description` | `Self-paced Foundation course for banking professionals. Includes 18 bite-sized modules, reusable prompts, skills, workflow artifacts, Toolbox saves, and the Foundation certificate.` |
| `product.metadata.tier` | `aibi-p` |
| `product.metadata.credential_code` | `AiBI Foundations` |
| `product.metadata.access_grant` | `course:aibi-p` |
| `product.metadata.format` | `self-paced` |
| `price.unit_amount` | `29500` |
| `price.currency` | `usd` |
| `price.recurring` | none — one-time |
| `price.nickname` | `AI Banking AiBI Foundations — Individual` |
| `.env.local` key | `STRIPE_FOUNDATION_PRICE_ID` (legacy fallbacks: `STRIPE_FOUNDATIONS_PRICE_ID`, `STRIPE_AIBIP_PRICE_ID`) |

**Volume / institution pricing (added 2026-05-05):** A second price exists on the same product for institution bundles.

| Field | Value |
|---|---|
| `price.unit_amount` | `19900` (= $199/seat) |
| `price.nickname` | `AI Banking AiBI Foundations — Institution Bundle ($199/seat, min 10)` |
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

**Endpoint URL (staging first, then production):**
- Staging: `https://staging.aibankinginstitute.com/api/webhooks/stripe`
- Production: `https://aibankinginstitute.com/api/webhooks/stripe`

**Events to subscribe (minimum viable — start narrow, expand on demand):**
- `checkout.session.completed` — provisions Foundation, In-Depth, or Team Assessment access from `metadata.product`.
- `payment_intent.payment_failed` — logs failed purchase analytics.
- `charge.refunded` — revokes individual access, releases institution discount locks, or marks Team Assessment cohorts refunded.
- `payment_intent.succeeded` — acknowledged; fulfillment lives on Checkout completion.
- `customer.subscription.*` — **not subscribed.** No subscription products yet.

**Signing secrets:** one per endpoint. Store the production signing secret as `STRIPE_WEBHOOK_SECRET`. Optional `STRIPE_WEBHOOK_SECRET_TEST` is also accepted so test-mode Stripe events can be verified against the same deployed path during QA.

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

Run these in sequence. Stop after each block, paste the returned IDs into `.env.local`, commit (without secrets — only the price IDs, which are not secrets).

**Block 1 — Active individual products:**
1. Create product **In-Depth AI Readiness Assessment** with the fields in Product 2 above. Create one $99 individual price. Capture it as `STRIPE_INDEPTH_PRICE_ID`.
2. Create the comp coupon (100% off, max 2 redemptions, scoped to the In-Depth Assessment product) and attach two single-use promotion codes: `AIBI-COMP-01` and `AIBI-COMP-02`, each expiring 90 days out.
3. Create product **AI Banking AiBI Foundations** with the fields in Product 3. Capture the $295 individual price as `STRIPE_FOUNDATION_PRICE_ID`.
4. Create the Foundation institution price at $199/seat, min 10 in site validation. Capture it as `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID`.

**Block 2 — Team Assessment only if intentionally selling:**
5. Create **Team Assessment** with a per-seat price and capture it as `STRIPE_TEAM_ASSESSMENT_PRICE_ID`. Keep this dark unless the product is being sold as assisted-sales with support coverage.

**Block 3 — Inactive/future products (staged, dark):**
6. Create **AiBI-S Specialist** with `active: false` only when cohort packaging is real. Capture `price_id` → `STRIPE_AIBIS_PRICE_ID`.
7. Create **AiBI-L Leader** with `active: false` only when workshop packaging is real. Capture individual/team prices only after those offers are defined.

**Block 4 — Webhook endpoints (staging first):**
8. Create webhook endpoint at staging URL listening for `checkout.session.completed` + `payment_intent.payment_failed` + `payment_intent.succeeded` + `charge.refunded`. Capture signing secret for the staging environment.
9. Repeat for production URL → `STRIPE_WEBHOOK_SECRET`.

**Block 5 — Verification:**
10. List all products and prices; confirm metadata + active flags match the table above.
11. List webhook endpoints; confirm URLs and event subscriptions.
12. Test-redeem `AIBI-COMP-01` against the In-Depth Assessment Checkout link; confirm `amount_total: 0` session and that the webhook still grants access.
13. Complete one low-risk live purchase for In-Depth and Foundation before promotion.

---

## What changes for go-live (test → live)

When ready to flip to live mode:
1. Create live mode product/price set (Stripe doesn't promote test objects to live; they're separate worlds). Easiest: re-run Block 1+2 against the live key.
2. Replace `sk_test_…` with `sk_live_…` and `pk_test_…` with `pk_live_…` in production env vars only. Staging keeps test keys forever.
3. Re-register the Stripe MCP server with the live key (or keep the test one and switch via `--api-key` for live operations).
4. Update webhook endpoints in live mode, get fresh signing secrets.
5. Add the launch-gate item to `docs/launch-checklist.md`: "Stripe live products created and price IDs in Vercel production env."

---

## Reference: env vars this doc creates

```bash
# Already in .env.local (test mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

# Created by Block 1
STRIPE_INDEPTH_PRICE_ID=price_...                     # $99 individual
STRIPE_FOUNDATION_PRICE_ID=price_...                  # Foundation Course, $295 (1 seat)
STRIPE_FOUNDATION_INSTITUTION_PRICE_ID=price_...      # Foundation institution bundle, $199/seat (min 10)

# Created by Block 2 only if Team Assessment is intentionally enabled
STRIPE_TEAM_ASSESSMENT_PRICE_ID=price_...

# Created by Block 3 if future products are intentionally staged
STRIPE_AIBIS_PRICE_ID=price_...
STRIPE_AIBIL_PRICE_ID=price_...
STRIPE_AIBIL_TEAM_PRICE_ID=price_...

# Created by Block 4
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...                  # optional

```
