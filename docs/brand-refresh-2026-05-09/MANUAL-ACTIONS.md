---
title: Manual actions for the AiBI Foundations rename
date: 2026-05-09
status: pending
---

# Manual actions

The code in this branch (`feature/brand-refresh`) has been written to be
**zero-downtime**: the new `'foundations'` product identifier and
`STRIPE_FOUNDATIONS_*` env vars are preferred, but the legacy `'aibi-p'`
value and `STRIPE_AIBIP_*` env vars are accepted as fallbacks. You can
deploy the code today and run the dashboard work below on your schedule —
nothing breaks if any of these steps lag the deploy.

Once **all** of these are done, a follow-up cleanup commit can drop the
legacy fallbacks.

---

## 1. Apply the Supabase migration

File: `supabase/migrations/00028_rename_aibi_p_product_to_foundations.sql`

Backfills 4 tables:
- `course_enrollments.product`: `'aibi-p'` → `'foundations'`
- `library_links.source_ref`: rewrites `'aibi-p/...'` prefix to `'foundations/...'`
- `practice_rep_completions.course_id`: `'aibi-p'` → `'foundations'`
- `saved_prompts.course_id`: `'aibi-p'` → `'foundations'`
- `user_artifacts.course_id`: `'aibi-p'` → `'foundations'`

Migration is idempotent. Apply via the standard Supabase CLI flow used
in `00027_*` (do NOT use `supabase db push` — see the
"Supabase migration naming divergence" memory).

**Verify after applying:**

```sql
SELECT product, COUNT(*) FROM course_enrollments GROUP BY product;
-- expect 0 rows with product = 'aibi-p'

SELECT COUNT(*) FROM library_links WHERE source_ref LIKE 'aibi-p/%';
-- expect 0
```

---

## 2. Rename Vercel env vars

In Vercel project settings, for each environment (Production, Preview,
Development):

- `STRIPE_AIBIP_PRICE_ID` → `STRIPE_FOUNDATIONS_PRICE_ID` (same value)
- `STRIPE_AIBIP_INSTITUTION_PRICE_ID` → `STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID` (same value)

The code reads the new name first and falls back to the old name, so you
can do this any time. Once you confirm new var is set, delete the old.

---

## 3. Update Stripe product metadata

In the Stripe dashboard, two product entries currently include
"AiBI-P" / "Practitioner" in their display names. Update them so internal
team and customer receipts read consistently:

- Product `prod_UShU302Dln6DMz` (the $295 individual seat):
  - Old name (per `docs/PRE-MERGE-2026-05-09.md`): "AiBI Foundations · Banking AI Course"
  - **New name:** "AiBI Foundations" (drop the redundant subtitle)
  - Description: "Self-paced 12-module AI course for community bank staff"
- Institution product (the $199/seat institution price):
  - Update display name to "AiBI Foundations · Institution Seat"
  - Description: "Per-seat enrollment for institution cohorts (10+ seats)"

Stripe's product metadata only affects checkout display and invoices —
no code change is needed once metadata is updated.

---

## 4. Edit Resend template bodies

Template **aliases** stay the same (no code references to update). The
template **HTML bodies** in the Resend dashboard need a copy edit:

| Alias | Find | Replace |
|---|---|---|
| `course-purchase-individual` | `AiBI-Practitioner`, `AiBI-P` | `AiBI Foundations` |
| `course-purchase-institution` | `AiBI-Practitioner`, `AiBI-P` | `AiBI Foundations` |
| `certificate-issued` | `AiBI-Practitioner`, `AiBI Foundations certificate` | `Foundations Certificate` |

Any `{{COURSE_NAME}}` template variable already receives the new value
from the wrapper helper in `src/lib/resend/index.ts` (defaults to
"AiBI Foundations"), so the wrapper handles dynamic substitution
correctly — only static template HTML needs your edit.

---

## 5. Re-deploy MailerLite Automations

The five Automations in MailerLite (1× Newsletter + 4× tier sequences)
were authored against the old "AiBI-Practitioner" / "AiBI-P" copy. Per
the 2026-05-08 Decisions Log, the canonical email source is in
`src/lib/mailerlite/email-content.ts` (now updated). Two options:

- **Recommended:** delete the existing 5 Automations and re-create them
  by re-running the equivalent of the 2026-05-08 setup (paste the new
  content from `email-content.ts` into each step). This guarantees the
  new copy ships exactly as written and committed.
- **Faster but riskier:** edit each email step in the MailerLite
  dashboard, find/replace `AiBI-Practitioner` → `AiBI Foundations` and
  `AiBI-P` → `AiBI Foundations`. Doesn't catch reworded sentences.

Before re-deploying, confirm that the sender `hello@aibankinginstitute.com`
is still authenticated in MailerLite Settings → Domains.

---

## 6. localStorage migration (deferred — track for follow-up)

Several browser-side keys still embed the old `aibi-p` prefix:

- `aibi-p-m{N}-tab` (module tab state)
- `aibi-p-module-{N}` (module-level state)
- `aibi-p-welcome` (onboarding welcome screen)
- `aibi-post-assessment-v2`
- `aibi-practice-{rep-id}`

Renaming these without a migration shim resets every existing learner's
in-progress state. The right fix is a small client-side migrator that
reads the old key first, copies its value to a new `foundations-...`
key, and deletes the old. Tracking this for a follow-up commit — it's
intentional that the current commit leaves these keys alone.

---

## 7. Cleanup (after everything above is verified)

A follow-up commit can:

- Drop the `'aibi-p'` legacy matchers in `.in('product', ...)` filters
  and `(... === 'foundations' || ... === 'aibi-p')` comparisons
- Drop the `STRIPE_AIBIP_*` env var fallbacks in `create-checkout/route.ts`
- Remove `'aibi-p'` from the `CourseId` type union and the
  `FoundationsLevelCode` alias in `src/app/dashboard/progression/page.tsx`
- Drop the legacy prefix in `SourceBacklink.tsx`'s `COURSE_REF_PATTERN`

Do NOT do this cleanup until the migration in step 1 is confirmed
applied in production and you have visually verified that no live
checkouts/enrollments have a `product = 'aibi-p'` value.
