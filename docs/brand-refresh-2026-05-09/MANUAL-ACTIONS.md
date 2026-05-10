---
title: Manual actions for the AiBI Foundations rename
date: 2026-05-09
status: in-progress
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

## Status as of 2026-05-09 session

| # | Action | Method | Status |
|---|---|---|---|
| 1 | Supabase migration | MCP (`apply_migration`) | ✅ Applied — 5 + 6 rows updated, check constraint widened |
| 2 | Vercel env var renames | Vercel dashboard | ✅ Done 2026-05-09 — `STRIPE_FOUNDATIONS_*` added alongside legacy `STRIPE_AIBIP_*`. Drop the legacy pair from Vercel after the cleanup commit ships and `main` is reading the new names only. |
| 3 | Stripe product rename + metadata | MCP (`stripe_api_execute`) | ✅ `prod_UShU302Dln6DMz` renamed to "AiBI Foundations"; metadata `tier`/`credential_code`/`access_grant` updated |
| 4 | Resend templates (3) | MCP (`update-template` + `publish-template`) | ✅ All 3 updated and republished — names, subjects, variable fallbacks |
| 5 | MailerLite automations (5) | — | ⏳ MCP `update_automation_email` rejects the content (subject Liquid + 1000-char cap). See §5 below for the dashboard procedure. Automations still in DRAFT (enabled=false), so subscribers are unaffected. |
| 6 | localStorage migration | client-side migrator | ⏳ Deferred — separate follow-up |
| 7 | Cleanup commit | code | ⏳ After everything above is verified |

---

## 1. Apply the Supabase migration ✅ DONE

Applied 2026-05-09 via the Supabase MCP. The original migration file
referenced 4 tables that don't actually exist in production
(`library_links`, `practice_rep_completions`, `saved_prompts`,
`user_artifacts` — that schema appears to be staging-only). Production
only had 2 tables with `aibi-p` rows.

What ran:

```sql
ALTER TABLE entitlements DROP CONSTRAINT entitlements_product_check;
ALTER TABLE entitlements ADD CONSTRAINT entitlements_product_check
  CHECK (product = ANY (ARRAY['foundations'::text, 'aibi-p'::text,
    'aibi-s'::text, 'aibi-l'::text, 'toolbox-only'::text,
    'indepth-starter-toolkit'::text]));
UPDATE course_enrollments SET product = 'foundations' WHERE product = 'aibi-p';
UPDATE entitlements       SET product = 'foundations' WHERE product = 'aibi-p';
```

Result:
- `course_enrollments`: 5 rows updated (aibi-p → foundations)
- `entitlements`: 6 rows updated
- `entitlements_product_check` widened to allow both values

The migration file at `supabase/migrations/00028_rename_aibi_p_product_to_foundations.sql`
has been corrected to match what was actually applied.

---

## 2. Rename Vercel env vars

In Vercel project settings, for each environment (Production, Preview,
Development):

- `STRIPE_AIBIP_PRICE_ID` → `STRIPE_FOUNDATIONS_PRICE_ID` (same value)
- `STRIPE_AIBIP_INSTITUTION_PRICE_ID` → `STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID` (same value)

The code reads the new name first and falls back to the old name, so you
can do this any time. Once you confirm new var is set, delete the old.

---

## 3. Update Stripe product metadata ✅ DONE

Applied 2026-05-09 via the Stripe MCP.

- `prod_UShU302Dln6DMz` renamed:
  - was: "AiBI-Practitioner · Banking AI Course"
  - now: "AiBI Foundations"
- Metadata updated:
  - `tier`: `aibi-p` → `foundations`
  - `credential_code`: `AiBI-P` → `Foundations`
  - `access_grant`: `course:aibi-p` → `course:foundations`
- Description left unchanged (already accurate, no Practitioner refs)

**Note:** Only one product (`prod_UShU302Dln6DMz`) currently exists for
this course in Stripe. The institution price referenced in CLAUDE.md is
attached to the same product, so no second product update was needed.

---

## 4. Edit Resend template bodies ✅ DONE

Applied 2026-05-09 via the Resend MCP. Three published templates
updated and re-published:

| Alias | Change |
|---|---|
| `course-purchase-individual` | Name → "Course purchase — individual (AiBI Foundations)"; variable fallbacks `COURSE_NAME` ("AiBI Foundations") and `COURSE_URL` (`/courses/foundations`) updated. HTML body uses variables, no static edit needed. |
| `course-purchase-institution` | Subject → "{{INSTITUTION_NAME}} — your AiBI Foundations seats are ready"; `COURSE_URL` fallback updated. HTML body uses variables. |
| `certificate-issued` | Name → "Foundations Certificate issued"; subject → "Your Foundations Certificate is ready, {{HOLDER_NAME}}"; `DESIGNATION` fallback ("Foundations Certificate — The AI Banking Institute") and `CERTIFICATE_ID` fallback (`FND-XXXXXX`). |

The helper functions in `src/lib/resend/index.ts` already pass the new
`COURSE_NAME` ("AiBI Foundations") and `DESIGNATION` ("Foundations
Certificate") at runtime, so emails sent today render with the correct
copy regardless of fallback values.

---

## 5. Re-deploy MailerLite Automations ⏳ Dashboard required

**MCP attempted but the tool can't carry the content.** The MailerLite
`update_automation_email` MCP tool has two hard limits that block the
push from this repo:

1. `subject` field rejects Liquid `{{ subscriber.first_name | default: ... }}`
   syntax — only literal text or MailerLite's `{$first_name}` merge form
2. `plain_text` field is capped at 1000 characters — these emails run
   1500–2500 chars each

The 5 Automations remain in DRAFT (`enabled: false`) so no subscriber
receives outdated copy. The canonical content is in version control at
`content/email-sequences/<tier>/0{1,2,3}-day-{0,3,7}-*.md`.

**Recommended dashboard procedure:**

1. Open each automation in the MailerLite dashboard (links below)
2. For each email step, paste the body from the matching `.md` file
   in `content/email-sequences/`. Convert the Liquid `{{ subscriber.* }}`
   merge tags to MailerLite's native `{$first_name}` etc.
3. Set the subject to the value in the matching frontmatter
4. Toggle the automation from Draft to Active

| Tier | Automation | Source folder |
|---|---|---|
| Newsletter Welcome | [186965438418126829](https://dashboard.mailerlite.com/automations/186965438418126829) | (HTML in `docs/mailerlite-emails/00-newsletter-welcome.html`) |
| Starting Point | [186965478342657970](https://dashboard.mailerlite.com/automations/186965478342657970) | `content/email-sequences/starting-point/` |
| Early Stage | [186965527420208336](https://dashboard.mailerlite.com/automations/186965527420208336) | `content/email-sequences/early-stage/` |
| Building Momentum | [186965564883732340](https://dashboard.mailerlite.com/automations/186965564883732340) | `content/email-sequences/building-momentum/` |
| Ready to Scale | [186965601924679393](https://dashboard.mailerlite.com/automations/186965601924679393) | `content/email-sequences/ready-to-scale/` |

Before activating, confirm sender `hello@aibankinginstitute.com` is
authenticated in MailerLite Settings → Domains.

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
