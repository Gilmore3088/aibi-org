# Stripe Products & Pricing — The AI Banking Institute

**Status:** Test mode (sk_test_* key registered with Stripe MCP, 2026-05-05).
**Source of truth for pricing:** `Plans/aibi-foundation-v3.html` (curriculum tiers) + Decisions Log entries 2026-04-15, 2026-04-24, 2026-05-05 in `CLAUDE.md`.
**Currency:** USD across the board. **Tax:** Stripe Tax disabled for now — bank/CU buyers are typically tax-exempt and we'll handle exemptions case-by-case until volume justifies enabling it.

---

## What ships now vs. what gets created in Stripe but stays dark

| Product | Stripe state at launch | Site state at launch |
|---|---|---|
| AI Readiness Assessment (free) | **No Stripe object** — it's free. | Live (`/assessment`) |
| In-Depth Assessment (paid, $99 / $79 at 10+) | **Create product + 2 prices + 2 promo codes.** Active. | Live behind email gate (Phase 1.5 add-on) |
| AI Banking Practitioner Course ($295) | **Create product + price + Payment Link.** Active. | Live (`/courses/aibi-p`) |
| AiBI-S Specialist ($1,495 / seat) | Create product + price. **Mark `active: false` until cohort dates set.** | "Request info" form only |
| AiBI-L Leader ($2,800 individual / $12,000 team of 8) | Create both prices. **Mark `active: false`.** | "Request info" form only |
| Advisory: Pilot · Program · Leadership Advisory | **Do NOT create in Stripe.** Custom-quoted, invoiced. | "Request info" form only |

Inactive prices still receive `price_*` IDs you can paste into `.env.local` so the code paths exist; they just can't be used in a Checkout Session until flipped to `active: true`.

---

## Product 1 — AI Readiness Assessment (free)

**No Stripe involvement.** Documented here so the funnel is complete:
- Lives at `/assessment`. Eight questions, scored 8–32. Score and tier visible without email; dimension breakdown + starter artifact gated behind email capture (decision 2026-04-27).
- This is the lead magnet, not a SKU. Conversion goal: email → Executive Briefing booking → paid product.
- Future "premium assessment add-ons" (peer benchmarks, etc.) are deferred per 2026-04-15 entry until N≥30 per segment exists.

---

## Product 2 — In-Depth Assessment ($99 individual / $79 each at 10+)

Paid follow-up to the free 8-question assessment. **One product, two prices** — the Stripe-native pattern for volume tiers when the line is sharp (1–9 vs. 10+) and you want each as a discrete checkout.

### Product

| Field | Value |
|---|---|
| `product.name` | `In-Depth AI Readiness Assessment` |
| `product.description` | `Paid follow-up to the free 8-question assessment. Personalized 20-page report with dimension-level scoring, peer band comparison, recommended starting playbook, and a 30-day action plan keyed to your lowest-scoring dimensions. One-time purchase, lifetime access to the report, includes one update if you retake within 12 months.` |
| `product.metadata.tier` | `assessment-plus` |
| `product.metadata.access_grant` | `assessment-indepth` |

### Prices (two, both on the product above)

| Field | Individual | Volume (10+) |
|---|---|---|
| `price.unit_amount` | `9900` (cents) | `7900` |
| `price.currency` | `usd` | `usd` |
| `price.recurring` | none — one-time | none — one-time |
| `price.nickname` | `In-Depth Assessment — Individual` | `In-Depth Assessment — Volume (10+ seats)` |
| `price.metadata.min_quantity` | `1` | `10` |
| `.env.local` key | `STRIPE_INDEPTH_ASSESSMENT_PRICE_ID` | `STRIPE_INDEPTH_ASSESSMENT_VOLUME_PRICE_ID` |

The volume price uses Stripe's `transform_quantity` is **not** needed — instead, the checkout link for the volume SKU enforces a minimum of 10 via `adjustable_quantity.minimum: 10` on the line item, with `unit_amount: 7900`. So 10 seats = $790, 25 seats = $1,975, etc. The metadata flag `min_quantity: 10` is for our own routing logic in `/api/create-checkout`, not for Stripe.

### Free promo codes (2) — for comp / testing

Create **one coupon, two redeemable promotion codes** so you can hand the codes to specific people without minting a new coupon every time.

| Coupon field | Value |
|---|---|
| `coupon.id` (let Stripe auto-generate) | — |
| `coupon.percent_off` | `100` |
| `coupon.duration` | `once` |
| `coupon.max_redemptions` | `2` (hard cap across both codes) |
| `coupon.applies_to.products` | `[<In-Depth Assessment product id>]` (scope the comp so it can't accidentally zero out an AiBI-P sale) |
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

## Product 3 — AI Banking Practitioner Course ($295) — first real course

The flagship Phase 2 product. HTML mockups exist in `public/AiBI-P/`; LMS in `src/lib/lms/`; webhook chain documented in `CLAUDE.md` § "Course Provisioning." The **product name in Stripe** is the spelled-out form ("AI Banking Practitioner Course"), not the credential code — per the 2026-04-15 brand rule that reserves "AiBI-P" for credential displays, the seal, and the LinkedIn-credential string. Receipts, hosted invoices, and the Stripe-hosted Checkout page all show the product name to the buyer; "AI Banking Practitioner Course" reads cleanly to a banker who doesn't know the brand yet. The credential they earn on completion is still rendered as "AiBI-P · The AI Banking Institute" in the LMS / certificate.

| Field | Value |
|---|---|
| `product.name` | `AI Banking Practitioner Course` |
| `product.description` | `Self-paced certification course (≈8 credit hours) for community bank and credit union staff. Covers Pillars A (Accessible AI) and B (Boundary-Safe AI) with an introduction to Pillar C (Capable AI). Includes 9 modules, work-product assessment, and the AiBI-P credential ("AiBI-P · The AI Banking Institute") on completion. Lifetime access to course materials.` |
| `product.metadata.tier` | `aibi-p` |
| `product.metadata.credential_code` | `AiBI-P` |
| `product.metadata.access_grant` | `course:aibi-p` |
| `product.metadata.format` | `self-paced` |
| `price.unit_amount` | `29500` |
| `price.currency` | `usd` |
| `price.recurring` | none — one-time |
| `price.nickname` | `AI Banking Practitioner Course — Individual` |
| `.env.local` key | `STRIPE_AIBIP_PRICE_ID` |

**Volume / institution pricing (added 2026-05-05):** A second price exists on the same product for institution bundles.

| Field | Value |
|---|---|
| `price.unit_amount` | `19900` (= $199/seat) |
| `price.nickname` | `AI Banking Practitioner Course — Institution Bundle ($199/seat, min 10)` |
| `price.metadata.min_quantity` | `10` |
| `.env.local` key | `STRIPE_AIBIP_INSTITUTION_PRICE_ID` |

The minimum-quantity guard (`>= 10`) is enforced at the API route level in `/api/create-checkout`, not in Stripe. Net effect: 10 seats = $1,990 (~33% off list); 25 seats = $4,975. Single-seat AiBI-P remains $295. No customer should ever buy 1–9 institution seats — the route rejects qty < 10 with 400.

---

## Product 4 — AiBI-S Specialist ($1,495/seat) — staged dark

Cohort-based, 16-hour live track. Per-track Specialist credentials (AiBI-S/Ops, AiBI-S/Lending, AiBI-S/Compliance). Decision 2026-04-19 in memory: format will eventually shift to self-paced to match AiBI-P, but PRD currently says cohort. Create the product anyway so the price ID slot exists in `.env.local`.

| Field | Value |
|---|---|
| `product.name` | `AiBI-S · Banking AI Specialist Certification` |
| `product.active` | `false` until first cohort scheduled |
| `product.metadata.tier` | `aibi-s` |
| `product.metadata.access_grant` | `course:aibi-s` |
| `price.unit_amount` | `149500` |
| `price.nickname` | `AiBI-S — Per Seat` |
| `.env.local` key | `STRIPE_AIBIS_PRICE_ID` |

Add an institution-volume price (8 seats at $11,960 — 80 seats at $119,600 per the foundation doc's economic example) when first deal closes.

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
- `checkout.session.completed` — primary signal that triggers `course_enrollments` insert + ConvertKit tag
- `payment_intent.payment_failed` — for retry/notification
- `charge.refunded` — for revoking access (Phase 3, not wired yet)
- `customer.subscription.*` — **not subscribed.** No subscription products yet.

**Signing secrets:** one per endpoint. Store as `STRIPE_WEBHOOK_SECRET_STAGING` and `STRIPE_WEBHOOK_SECRET` (production) in `.env.local`. The handler at `src/app/api/webhooks/stripe/route.ts` must call `stripe.webhooks.constructEvent(...)` and let it throw on invalid signatures (per CLAUDE.md § "Stripe Webhook Signature Verification").

---

## Customer metadata convention

Every Checkout Session created from the site sets:

```typescript
metadata: {
  email: <captured email>,
  product: 'indepth-assessment' | 'aibi-p' | 'aibi-s' | 'aibi-l' | 'aibi-l-team',
  source_score: <assessment score if applicable>,
  source_tier: <'starting-point' | 'early-stage' | 'building-momentum' | 'ready-to-scale'>,
  institution_name: <if collected>,
  asset_size: <if collected>,
  utm_source: <if present>,
}
```

The webhook handler reads `metadata.product` to decide which `course_enrollments.product` value to write and which ConvertKit tag to apply.

---

## Tax, fees, refunds

- **Stripe Tax:** off until US sales-tax exposure is real. Banks/CUs are largely exempt; revisit after 50 transactions or first multi-state pattern.
- **Processing fees:** absorbed (~2.9% + $0.30 per US card). Net on $295 ≈ $286.45. Net on $99 ≈ $96.18. Net on $79 (volume seat) ≈ $76.39 — at 10 seats that's $790 gross, $766.80 net. Net on $1,495 ≈ $1,451.34. Net on $2,800 ≈ $2,718.50. Comp codes ($0 sessions) incur **no fee** since Stripe charges nothing on a zero-amount payment.
- **Refund policy:** 7-day money-back on $99 and $295 products if course/report not started. AiBI-S/L: pro-rated only if cohort hasn't begun. Process refunds through the dashboard, not the MCP — refunds touch live money and require ALL-CAPS confirmation per CLAUDE.md.

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

**Block 1 — Active products (ship-ready):**
1. Create product **In-Depth AI Readiness Assessment** with the fields in Product 2 above. Create **two prices** on it: $99 individual and $79 volume (min 10). Capture both → `STRIPE_INDEPTH_ASSESSMENT_PRICE_ID` and `STRIPE_INDEPTH_ASSESSMENT_VOLUME_PRICE_ID`.
2. Create the comp coupon (100% off, max 2 redemptions, scoped to the In-Depth Assessment product) and attach two single-use promotion codes: `AIBI-COMP-01` and `AIBI-COMP-02`, each expiring 90 days out.
3. Create product **AI Banking Practitioner Course** with the fields in Product 3. Capture `price_id` → `STRIPE_AIBIP_PRICE_ID`.

**Block 2 — Inactive products (staged, dark):**
4. Create **AiBI-S Specialist** with `active: false`. Capture `price_id` → `STRIPE_AIBIS_PRICE_ID`.
5. Create **AiBI-L Leader** with `active: false` and both prices (individual + team of 8). Capture both → `STRIPE_AIBIL_PRICE_ID`, `STRIPE_AIBIL_TEAM_PRICE_ID`.

**Block 3 — Webhook endpoints (staging first):**
6. Create webhook endpoint at staging URL listening for `checkout.session.completed` + `payment_intent.payment_failed` + `charge.refunded`. Capture signing secret → `STRIPE_WEBHOOK_SECRET_STAGING`.
7. Repeat for production URL → `STRIPE_WEBHOOK_SECRET`.

**Block 4 — Verification:**
8. List all products and prices; confirm metadata + active flags match the table above.
9. List webhook endpoints; confirm both URLs and event subscriptions.
10. Test-redeem `AIBI-COMP-01` against the In-Depth Assessment Checkout link; confirm `amount_total: 0` session and that the second code (`AIBI-COMP-02`) still has 1 redemption left.

---

## What changes for go-live (test → live)

When ready to flip to live mode:
1. Create live mode product/price set (Stripe doesn't promote test objects to live; they're separate worlds). Easiest: re-run Block 1+2 against the live key.
2. Replace `sk_test_…` with `sk_live_…` and `pk_test_…` with `pk_live_…` in production env vars only. Staging keeps test keys forever.
3. Re-register the Stripe MCP server with the live key (or keep the test one and switch via `--api-key` for live operations).
4. Update webhook endpoints in live mode, get fresh signing secrets.
5. Add the launch-gate item to `tasks/weekend-env-setup.md`: "Stripe live products created and price IDs in Vercel production env."

---

## Reference: env vars this doc creates

```bash
# Already in .env.local (test mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

# Created by Block 1
STRIPE_INDEPTH_ASSESSMENT_PRICE_ID=price_...          # $99 individual
STRIPE_INDEPTH_ASSESSMENT_VOLUME_PRICE_ID=price_...   # $79/seat, min 10
STRIPE_AIBIP_PRICE_ID=price_...                       # AI Banking Practitioner Course, $295 (1 seat)
STRIPE_AIBIP_INSTITUTION_PRICE_ID=price_...           # AiBI-P institution bundle, $199/seat (min 10)

# Created by Block 2 (inactive products)
STRIPE_AIBIS_PRICE_ID=price_...
STRIPE_AIBIL_PRICE_ID=price_...
STRIPE_AIBIL_TEAM_PRICE_ID=price_...

# Created by Block 3
STRIPE_WEBHOOK_SECRET_STAGING=whsec_...
STRIPE_WEBHOOK_SECRET=whsec_...

```
