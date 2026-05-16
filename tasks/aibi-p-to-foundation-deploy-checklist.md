# aibi-p → foundation: deploy checklist (operator-only steps)

The 10 code-side phases shipped on `feature/aibi-p-to-foundation-rename`
(commits `cb1c85d` through `3bec10d`). The items below are external-system
mutations that require operator action and (per CLAUDE.md) explicit
ALL-CAPS approval at execution time. Run them in order.

The single hard sequencing constraint is **a 24-hour gap between Step 4
(deploy code accepting both metadata.product values) and Step 6 (flip
the Stripe Product name + start writing 'foundation' as new metadata)**.
Any in-flight Stripe Checkout Session has a 24-hour lifetime; that gap
guarantees no session lands in a webhook that doesn't recognize its own
metadata.

---

## Step 1 — Snapshot baselines (D-7)

Before any rollout, snapshot:

- [ ] Plausible analytics CSV export (Settings → Export)
- [ ] Stripe product list and current `name`/`metadata` for each Product
      (`stripe products list --limit 50 > stripe-baseline-2026-05-10.json`)
- [ ] MailerLite Automations + their group IDs (screenshot the dashboard)
- [ ] Resend templates + their aliases + body content (5 templates)
- [ ] Vercel env var snapshot (`vercel env ls > vercel-baseline-2026-05-10.txt`)

Store baselines somewhere with the PR. They are the rollback reference.

## Step 2 — Apply Phase 2 Supabase migration (D-3)

⚠️ **ALL-CAPS APPROVAL REQUIRED — this writes to the live remote DB.**

Migration file: `supabase/migrations/00028_add_foundation_product_value.sql`

Apply via:

```bash
supabase db push --linked
```

Or via the Supabase MCP after explicit confirmation.

The migration is **additive only** — extends CHECK constraints, recreates
the trigger function, and recreates the toolbox-access RLS helper to accept
both `'aibi-p'` and `'foundation'`. No existing rows are modified.

Verification:

```bash
supabase db query --linked "SELECT product, COUNT(*) FROM course_enrollments GROUP BY product"
# Expect: 'aibi-p': N, no 'foundation' rows yet (those come after Step 6)
```

## Step 3 — Add Vercel env vars (D-1)

⚠️ **OPERATOR — Vercel env vars cannot be added from code.**

In Vercel dashboard → Settings → Environment Variables, add:

- `STRIPE_FOUNDATION_PRICE_ID` = (same value as `STRIPE_AIBIP_PRICE_ID`)
- `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` = (same value as `STRIPE_AIBIP_INSTITUTION_PRICE_ID`)

Set scope to **Production + Preview + Development**.

CLI alternative:

```bash
vercel env add STRIPE_FOUNDATION_PRICE_ID production
# (paste the same price_xxx value as STRIPE_AIBIP_PRICE_ID)
vercel env add STRIPE_FOUNDATION_INSTITUTION_PRICE_ID production
# repeat for preview + development scopes
```

The Stripe `price_xxx` ID values are immutable. Only the env var **names**
change in this rename — not the values they point at.

## Step 4 — Deploy the feature branch (D-1)

Merge `feature/aibi-p-to-foundation-rename` to `main` and deploy.

The dual-read code in `src/lib/products/normalize.ts` and the webhook
handler in `src/app/api/webhooks/stripe/route.ts` now accept both legacy
`'aibi-p'` and canonical `'foundation'` for `metadata.product`.

The new env var fallback in `src/app/api/create-checkout/route.ts` reads
`STRIPE_FOUNDATION_PRICE_ID` first, falls back to `STRIPE_AIBIP_PRICE_ID`.

Verify post-deploy:

```bash
curl -I https://aibankinginstitute.com/courses/aibi-p
# expect: HTTP/2 308 + location: /courses/foundation/program

curl -I https://aibankinginstitute.com/courses/aibi-p/m5
# expect: HTTP/2 308 + location: /courses/foundation/program/m5

curl -I https://aibankinginstitute.com/courses/foundation/program
# expect: HTTP/2 200
```

## Step 5 — Wait 24 hours

⏰ The 24-hour gap is the most important sequencing constraint in this
plan. Any Stripe Checkout Session created in the previous 24 hours has
`metadata.product='aibi-p'` and a still-valid expiry. Step 4 deployed
the dual-read webhook that accepts both values; Step 6 will flip new
sessions to write `'foundation'`. The 24-hour gap ensures no session is
in flight that the webhook can't recognize.

Do not skip this gap.

## Step 6 — Update Stripe products + metadata (D0)

⚠️ **ALL-CAPS APPROVAL REQUIRED — this mutates Stripe Products live.**

For each AiBI-Foundation product (individual + institution):

```bash
stripe products update prod_XXXXXXXXXXXXX \
  --name='AiBI-Foundation' \
  --metadata[canonical_slug]=foundation \
  --metadata[legacy_slug]=aibi-p
```

Or via the Stripe dashboard: Products → (each product) → Edit → Name
field → "AiBI-Foundation".

**Do not create new Prices.** The existing `price_xxx` IDs are referenced
by the Vercel env vars set in Step 3 and stay stable. Only the Product
`name` field changes (mutable; what shows on receipts and Checkout pages)
plus metadata for forward-compat audit trail.

Verification: open the Checkout URL for the existing price IDs and
confirm the new product name renders.

## Step 7 — Apply Phase 7 backfill migration (D+1)

⚠️ **ALL-CAPS APPROVAL REQUIRED — this UPDATEs production data.**

Migration file: `supabase/migrations/00029_backfill_foundation_product.sql`

Apply via:

```bash
supabase db push --linked
```

Verification:

```bash
supabase db query --linked "SELECT COUNT(*) FROM course_enrollments WHERE product='aibi-p'"
# expect: 0
supabase db query --linked "SELECT COUNT(*) FROM entitlements WHERE product='aibi-p'"
# expect: 0
supabase db query --linked "SELECT COUNT(*) FROM prompt_library WHERE course_source_ref LIKE 'aibi-p/%'"
# expect: 0
```

## Step 8 — Update Resend template bodies (D+3)

⚠️ **OPERATOR — Resend dashboard only.**

The 5 transactional templates have wrapper code in `src/lib/resend/index.ts`
that already sends "AiBI-Foundation" subject lines and `/courses/foundation/program`
URLs in template variables. The template **body** text in the Resend
dashboard may still reference "AiBI-P" or "AiBI-Practitioner" — those need
manual review:

- [ ] `assessment-results-breakdown` — body review
- [ ] `course-purchase-individual` — body review
- [ ] `course-purchase-institution` — body review
- [ ] `certificate-issued` — body review
- [ ] `inquiry-ack` — body review

Edit body copy in the Resend dashboard if any references survive.

Test: trigger a purchase on staging; confirm the resulting email shows
"AiBI-Foundation" everywhere.

## Step 9 — Update MailerLite automation copy (D+3)

⚠️ **OPERATOR — MailerLite dashboard only.**

Per the 2026-05-08 pattern (Decisions Log), MailerLite Automations get
recreated rather than edited when copy changes. The 5 live Automations:

- Newsletter welcome (`186965438418126829`)
- Starting Point sequence (`186965478342657970`)
- Early Stage sequence (`186965527420208336`)
- Building Momentum sequence (`186965564883732340`)
- Ready to Scale sequence (`186965601924679393`)

Source-of-truth copy lives in `src/lib/mailerlite/email-content.ts` (the
audit found no aibi-p references there — already clean post-Phase 2 rename).

If any automation body copy references "AiBI-P", deactivate the affected
automation, recreate from the source-of-truth file, and activate the new
one. Subscribers mid-sequence finish on the old copy — that is intended.

## Step 10 — Drop env var fallback (D+7)

When Step 4 has been live for at least one full release cycle and there
have been no incidents, ship a follow-up commit that removes the fallback
in `src/app/api/create-checkout/route.ts`:

```diff
-  const STRIPE_AIBIP_PRICE_ID =
-    process.env.STRIPE_FOUNDATION_PRICE_ID ?? process.env.STRIPE_AIBIP_PRICE_ID;
+  const STRIPE_AIBIP_PRICE_ID = process.env.STRIPE_FOUNDATION_PRICE_ID;
```

Same for the institution variant. Deploy.

## Step 11 — Remove legacy env vars from Vercel (D+14)

After Step 10 is green for at least 7 days:

```bash
vercel env rm STRIPE_AIBIP_PRICE_ID production
vercel env rm STRIPE_AIBIP_INSTITUTION_PRICE_ID production
# repeat for preview + development scopes
```

## Forever items

These never disappear:

- `'aibi-p'` stays in `entitlements.product` CHECK constraint (no
  Postgres `DROP VALUE`; harmless to leave).
- `normalizeProduct()` shim stays in `src/lib/products/normalize.ts` — Stripe
  webhook retries from 2026-Q1 events can arrive at any future date.
- The `/courses/aibi-p/:path*` 308 redirect in `next.config.mjs` stays —
  sent emails, Stripe receipts, and indexed URLs reference it.
- The `AIBIP-` cert ID prefix in `src/lib/certificates/generateId.ts` stays
  — preserves verifiability of issued certificates.
- The `'aibi-p'` UTM campaign value in `src/lib/utm.ts:6` stays —
  preserves Plausible attribution history.

---

## Customer comm (do this around D0 / D+1)

Per the plan §7. Send one direct email to every row in `course_enrollments`:

> Subject: Your AiBI-Practitioner course is now AiBI-Foundation
>
> Body answers four questions: what changed (the name, only the name),
> what didn't (access, progress, certificate, bookmarks), why (one
> sentence), what to do (nothing).

Raise an in-app banner on `/dashboard` and `/courses/foundation/program/*`
for 30 days. Drop on D+30.

Customer-support one-pager pre-paste into Notion before the email goes
out: 3-sentence answer to "AiBI-P vs Foundation."

No social, no blog, no newsletter blast. This is a maintenance change.

---

## Issue 88 — public product-ladder cleanup (added 2026-05-15)

Public copy now positions three distinct offers: Free Assessment,
In-Depth Assessment, AiBI-Foundation Course. Internal `aibi-p`
identifiers stay legacy per the rename pattern.

Operator must verify in Stripe dashboard before launch:

- [ ] Foundation product display name reads **AiBI-Foundation Course**
      (not "AiBI-Practitioner", not "AiBI-P", not "Foundation v2").
- [ ] In-Depth product display name reads **In-Depth Assessment**.
- [ ] Foundation product description mentions **lifetime access** so
      Stripe-hosted invoice and email receipts carry the same promise as
      `/courses/foundation/program/purchase`.
- [ ] Statement descriptor (`AIBI FOUNDATION` / `AIBI INDEPTH` or similar)
      will not confuse a banker reading their card statement.

No code change needed — these are dashboard-only edits.
