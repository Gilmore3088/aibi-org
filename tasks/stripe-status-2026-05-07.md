# Stripe Status — 2026-05-07 (afternoon)

Snapshot of the Stripe stack after the In-Depth fulfillment build, the
AiBI-P confirmation page build, and the audit.

---

## ✅ Live in production

### Two end-to-end purchase paths
- **AiBI-Practitioner $295 / $199 institution** — `/courses/aibi-p/purchase`
  → Stripe → `/courses/aibi-p/purchased` (new today) → log in → entitlement
  gate → `/courses/aibi-p`
- **In-Depth Assessment $99** — `/assessment/in-depth` → Stripe →
  `/assessment/in-depth/purchased` (new today) → log in → entitlement gate
  → `/assessment/in-depth/take` → 48 questions → `/results/{profileId}`

### Stripe inventory (test mode, account `acct_1TTll2Ry9NIFjtII`)
| Product | ID | Status | Prices |
|---|---|---|---|
| AiBI-Practitioner | `prod_UShU302Dln6DMz` | active | $295 / $199 |
| In-Depth Assessment | `prod_UShU2x1hnWjYe2` | active | $99 / $79 |
| AiBI-S Specialist | `prod_UShZSlWrdzgC3w` | **inactive** (deactivated today via MCP) | none |
| AiBI-L Leader | `prod_UShZBcevbScyJJ` | **inactive** (deactivated today via MCP) | none |

### Resend templates (all published)
1. `course-purchase-individual` — fires on AiBI-P individual purchase
2. `course-purchase-institution` — fires on AiBI-P institution-bulk purchase
3. `in-depth-assessment-purchase` — fires on In-Depth purchase (created
   today via MCP)
4. `assessment-results-breakdown`, `certificate-issued`, `inquiry-ack`,
   `waitlist-confirmation`, `assessment-options` (existing)

### Vercel env vars (Production + Preview scopes)
✅ Set: `STRIPE_SECRET_KEY`, `STRIPE_AIBIP_PRICE_ID`,
   `STRIPE_AIBIP_INSTITUTION_PRICE_ID`, `STRIPE_INDEPTH_PRICE_ID`,
   `STRIPE_INDEPTH_INSTITUTION_PRICE_ID`, `RESEND_API_KEY`

---

## 🔴 BLOCKERS — webhook is broken right now

### Webhook returns 503 in production

```
$ curl -X POST https://www.aibankinginstitute.com/api/webhooks/stripe -d '{}'
{"error":"Webhook not configured."}
```

**Impact:** Any Stripe purchase right now charges the customer but never
creates a `course_enrollments` row. The customer never gets entitlement.

**Cause:** `STRIPE_WEBHOOK_SECRET` is not in Vercel env (verified via
`vercel env ls` — only the price IDs and secret key are present).

**Two-step fix (you must do this in dashboard):**

1. **Stripe Dashboard → Developers → Webhooks**
   - Verify an endpoint exists pointing at
     `https://aibankinginstitute.com/api/webhooks/stripe`
   - It should listen to at least `checkout.session.completed`
   - If missing, "Add endpoint" with that URL + that event
   - Copy the "Signing secret" (`whsec_…`) from the endpoint details panel
2. **Vercel Dashboard → Project Settings → Environment Variables**
   - Add `STRIPE_WEBHOOK_SECRET=whsec_…` — Production + Preview scopes
   - Redeploy (or it'll pick up on next deploy)

**Verification after fix:** `curl -X POST` to the webhook should return
`{"error":"Missing stripe-signature header."}` (400) instead of 503 —
that means the signature check is enabled and waiting for a real
Stripe-signed request.

---

## ✅ Inconsistencies fixed this round

| Issue | Status |
|---|---|
| Stripe In-Depth product description still said "8-question" | Fixed via MCP |
| AiBI-S/L products active=true but described as inactive | Both deactivated via MCP |
| Bad `course_enrollments` row from earlier $99 test (product='aibi-p' instead of 'in-depth-assessment') | Fixed via SQL UPDATE |
| AiBI-P checkout success_url dropped buyers on `/courses/aibi-p?enrolled=true` with no auth context | New `/courses/aibi-p/purchased` page mirrors the In-Depth flow |
| In-Depth checkout success_url same problem | New `/assessment/in-depth/purchased` page (yesterday) |

---

## 🟡 Remaining gaps (not blocking, queued for decisions)

### Stale seed `course_enrollments` rows
Four rows from April 18-19 with `stripe_session_id=null`, all manual SQL
inserts during early testing:

| email | product |
|---|---|
| jlgilmore2@gmail.com | aibi-p |
| jlgilmore2@gmail.com | aibi-s |
| hello@aibankinginstitute.com | aibi-p |
| hello@aibankinginstitute.com | aibi-s |

If any AiBI-S code path queries this table for entitlement, those rows
grant access without payment. Decision needed: leave as test seed, or
DELETE.

### provision-enrollment institution branch is AiBI-P-shaped
The institution code path hardcodes `discount_locked: true` (a
persistent-discount mechanic specific to AiBI-P). Keeps working for
AiBI-P. For In-Depth institution mode (currently 503-stubbed in route),
would mis-tag the row if ever enabled. Right call to keep the 503 stub
until you decide institution semantics for In-Depth.

### No Stripe Customer records
Both successful test payments have `customer: null`. Checkout creates
Sessions without `customer_creation: 'always'`. Workable for one-time
products; limits future "see my orders" / Stripe Customer Portal /
repeat-purchase UX. Easy fix — one-line add to checkout session creation.

### No Stripe Tax setup
Not enabled. May or may not matter depending on your jurisdiction +
institutional invoicing approach. Decision deferred.

### No refund or dispute flow
Refunds: manual via Stripe dashboard. No `refund-issued` Resend template.
Disputes: no automation. Future concern.

### Stripe receipt emails — unknown setting
Stripe can auto-send its own receipts if "Email customers" is on in the
Stripe dashboard. May overlap with our Resend `course-purchase-individual`
/ `in-depth-assessment-purchase` templates. Verify in
Stripe Dashboard → Settings → Email customers, decide which set you want
firing.

---

## 🔴 BLOCKING REAL (LIVE-MODE) LAUNCH

### Everything is test-mode
Every price ID currently in Vercel starts with `price_1TT…` — all
test-mode IDs from the sandbox account. Live mode requires:

1. Activate Stripe live mode (business verification)
2. Recreate four products + prices in live mode
3. Replace ALL these env vars with live values:
   - `STRIPE_SECRET_KEY` → `sk_live_…`
   - `STRIPE_WEBHOOK_SECRET` → live whsec (different from test)
   - All four `STRIPE_*_PRICE_ID` env vars → live price IDs
4. Re-register the webhook endpoint (live mode has its own webhook list)

I can drive most of this via Stripe MCP once live mode is activated, but
the activation itself is a dashboard task that requires your business
info.

---

## Suggested order when you're back

| Priority | Task | Who |
|---|---|---|
| 🔴 1 | Add `STRIPE_WEBHOOK_SECRET` to Vercel + verify endpoint in Stripe dashboard | You |
| 🟡 2 | Decide on stale seed `course_enrollments` rows | You approve, me |
| 🟡 3 | Decide whether to enable Stripe Customer creation on Sessions | You approve, me |
| 🟢 4 | Pre-launch: activate live mode, recreate products, port env vars | You + me via MCP |

Once #1 lands and the webhook is confirmed working with a real test
purchase, the test-mode purchase flow is fully end-to-end functional.
