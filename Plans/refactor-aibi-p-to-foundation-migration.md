# refactor: aibi-p → foundation systematic migration

**Status:** plan · drafted 2026-05-10 · **Phase 0 conflicts resolved 2026-05-10** (Conflict 1 → Option B; Conflict 2 → `foundation-program/`; Conflict 3 → leave cert code unchanged; 5 lower-stakes recommendations accepted)
**Owner:** TBD · **Context:** v2 redesign migration, picks up where Phase 2 (rename in user-facing copy) ended
**Predecessors:** commits `98cb3b9` · `252c58e` · `ee1a6a5` · `dd2a3c6` · `ad5ba7c` · `d191dab` · `718f963` · `3e8ee1e`
**Related:** `tasks/foundation-v2-migration.md` · CLAUDE.md Decisions Log entry 2026-05-09

---

## Overview

The user-facing rename `AiBI-Practitioner` → `AiBI-Foundation` shipped in commit `ad5ba7c`
(66 files). The marketing-URL redirect `/courses/aibi-p` → `/courses/foundation` shipped
in commit `3e8ee1e`. This plan covers the remaining systematic work: **internal route
paths, environment variables, Stripe metadata, Supabase enum values, transactional email
template aliases, filesystem paths, and TypeScript identifiers.**

The 2026-05-06 Decisions Log entry deliberately preserved internal `aibi-p` slugs to
avoid URL/DB/integration churn during the AiBI-P → AiBI-Practitioner rename. **This plan
reverses that decision** for the route layer (per the 2026-05-10 user direction
"and /courses/aibi-p this should be /foundation now") and applies the **expand /
migrate / contract** pattern across every other system that holds `aibi-p` as an
identifier today.

The audit found ~600 references across ~120 files. Of those, roughly:

| Category | Count | Risk |
|---|--:|---|
| User-facing URL paths (`href="/courses/aibi-p"`) | ~40 | URL_REDIRECT_NEEDED |
| Filesystem route directories under `src/app/courses/aibi-p/` | ~50 | SAFE rename pending conflict resolution |
| Environment variable names (`STRIPE_AIBIP_*`) | 6 (Vercel) + 10 code refs | EXTERNALLY_BOUND (Vercel) |
| Stripe `metadata.product` and TS `Product` union members | ~10 | DATA_MIGRATION |
| Supabase CHECK constraints + filter queries | ~15 | DATA_MIGRATION |
| Email/Resend hardcoded URLs and template content | 2 (URLs) + 8 (mailerlite HTML, historical) | URL_REDIRECT_NEEDED |
| Public/content filesystem paths | 6 directories | SAFE |
| TypeScript identifiers (`V4_AIBIP_*`, `AIBIP_TOTAL_MODULES`, etc.) | ~12 | SAFE |
| Comments and pedagogical references in course prose | ~40 | EDITORIAL choice |
| Certificate ID prefix `AIBIP-` | 1 module + N issued certs | EXTERNALLY_BOUND |
| UTM campaign value `aibi-p` | 1 constant | EXTERNALLY_BOUND (analytics history) |

---

## Problem statement

The current state is internally inconsistent and operationally risky:

1. **Naming drift.** The user-facing brand says "AiBI-Foundation"; URLs say `/courses/foundation`; internal route directories, env vars, Stripe metadata, DB values, and TS identifiers still say `aibi-p`. Onboarding new contributors costs cycles to explain the dual naming.

2. **Search/SEO surface ambiguity.** Search engines and email recipients now see redirects from `/courses/aibi-p` → `/courses/foundation`, but the bulk of the deep route tree still lives under `/courses/aibi-p/*`. The redirect chain is incomplete — `/courses/aibi-p/m5` does not redirect, it serves the v1 course directly. That is the *correct* current behavior for grandfathering existing buyers, but it leaves the URL story muddled until the deep migration is intentional.

3. **Stripe + DB drift risk.** Every new enrollment row written today has `product='aibi-p'` because the writers haven't moved. Every new Stripe Checkout Session has `metadata.product='aibi-p'`. The longer this continues, the larger the eventual backfill.

4. **Hard conflicts blocking forward motion.** The new `/courses/foundation/[track]/` route (v2 four-track preview) cannot coexist with a renamed `/courses/foundation/[module]/` route at the same level — Next.js disallows two dynamic segments at the same depth. Same conflict exists in `content/courses/` between `aibi-p/` and `aibi-foundation/`. These conflicts must be resolved by architectural decision before any rename starts.

---

## Hard conflicts to resolve before starting

These are the three decisions that gate the rest of the migration. **No code changes
should ship until these are settled in writing.**

### Conflict 1: Route directory shape

`src/app/courses/foundation/[track]/page.tsx` exists today (v2 four-track preview, hidden
from the public landing per commit `3e8ee1e` but the route remains). Renaming
`src/app/courses/aibi-p/[module]/` → `src/app/courses/foundation/[module]/` would put two
dynamic segments at the same level — Next.js refuses to build.

Three options:

- **Option A — V1 absorbs.** Move the 12-module practitioner course's deep routes into
  `src/app/courses/foundation/` and **remove the v2 four-track preview entirely** (delete
  `src/app/courses/foundation/[track]/`). The four-track family becomes a future feature
  reintroduced when Phase 3 (Stripe) is real. Cost: throw away the v2 route shells just
  built; benefit: cleanest URL structure.

- **Option B — V1 lives one level deeper.** Move v1 routes to
  `src/app/courses/foundation/program/[module]/`. The `/courses/foundation/` overview
  serves as marketing, the v2 preview lives at `/courses/foundation/lite|full|manager|board`,
  and the active program lives at `/courses/foundation/program/*`. Cost: longer URLs;
  benefit: keeps both the active product and the v2 scaffolding addressable.

- **Option C — V1 stays at aibi-p.** Don't move v1 deep routes. Marketing redirect
  already covers the top-level URL. Existing buyers' bookmarks (e.g.,
  `/courses/aibi-p/m5`) continue to work without redirect chains. Internal renames apply
  to TS identifiers, env vars, Stripe metadata, DB values — but the route directories
  on disk stay `src/app/courses/aibi-p/*`. Cost: dual naming on the filesystem (route
  says foundation, dir says aibi-p) — one extra layer of indirection for new
  contributors; benefit: zero risk to existing buyers.

**Recommendation: Option B.** Reuses the v2 work already shipped, gives the active
product a clean canonical home, and lets the v2 four-track preview continue to evolve
in parallel without route conflicts. Trade-off accepted: the active program lives at
`/courses/foundation/program/*` instead of `/courses/foundation/*`, which adds one
segment of URL depth.

### Conflict 2: Content directory shape

`content/courses/aibi-foundation/` (v2 typed module data, 29 modules across four tracks)
and `content/courses/aibi-p/` (v1 typed module data, 12 modules) both exist. A flat
rename produces three siblings.

Recommendation matching Option B above:
- `content/courses/aibi-foundation/` keeps v2 four-track typed data (Lite/Full/Manager/Board)
- `content/courses/aibi-p/` renames to `content/courses/foundation-program/` (the active 12-module course)
- All `@content/courses/aibi-p/*` imports rewrite to `@content/courses/foundation-program/*`

### Conflict 3: Certificate credential code

`content/certifications/v1.ts:20-22` declares the credential code `AiBI-P` printed on
issued certificates. `src/lib/certificates/generateId.ts` uses prefix `AIBIP-` for
certificate IDs. Previously-issued certificates have these strings. Verifiable.

**Recommendation: leave both unchanged.** The credential code on a previously-issued
certificate cannot be retroactively rewritten (would invalidate the credential's
historical record). Going forward, *new* certificate issuances can use a new prefix
(e.g., `AIBIF-`) if you want, but the safer industry pattern is to keep the credential
code stable across rebrands. Stripe, AWS, and Salesforce all do this — product names
change, certification codes don't.

---

## Proposed solution

**Apply the expand / migrate / contract (parallel-change) pattern, per system, with
strict dependency ordering.** Old identifier never disappears from systems that hold
historical records (Stripe events, Postgres rows referenced by issued certificates,
sent emails). It only disappears from *new writes* and *new code paths*.

The five system-level migrations, in dependency order:

1. **HTTP redirects** — additive, single-step. Adds permanent `/courses/aibi-p/:path*`
   → `/courses/foundation/program/:path*` mapping in `next.config.mjs`. Existing
   bookmarks transparently redirect. Ships first because it's reversible and unblocks
   downstream work.

2. **Database (Supabase enum)** — `ALTER TYPE ADD VALUE 'foundation'` migration; adds
   the new value alongside `aibi-p`. Then a separate migration backfills rows after the
   dual-read code is deployed. Old enum value stays present forever (Postgres has no
   safe `DROP VALUE`).

3. **Application code (TS)** — introduces `normalizeProduct()` shim that maps
   `'aibi-p'` → `'foundation'` at every read boundary; new writes emit `'foundation'`.
   The shim is a forever-import (Stripe events from 2026-Q1 will keep showing up as
   webhook retries forever).

4. **Stripe** — `products.update({ name, metadata.legacy_slug })` to rename the
   customer-facing product name. Price IDs preserved (env vars rename, not values).
   Webhook handler accepts both `metadata.product` values via `normalizeProduct()`.

5. **Resend / MailerLite** — duplicate transactional templates with new aliases; let
   in-flight queued sends drain on the old alias; deactivate old aliases after a
   conservative drain window (30 days).

Filesystem renames (route directories, content directories, public assets) ship as
part of the application-code phase. Internal TS identifier renames (`V4_AIBIP_*`,
`AIBIP_TOTAL_MODULES`) ship as a separate cleanup commit after the user-facing layer
is stable.

---

## Decision matrix per category

For each of the 10 categories surfaced by the audit, the migration treatment:

| # | Category | Treatment | Risk | When |
|---|---|---|---|---|
| 1 | User-facing URL paths (`href="/courses/aibi-p"`) | Update each `href` in code; add `next.config.mjs` redirect for any external email links / bookmarks | URL_REDIRECT_NEEDED | Phase 1 |
| 2 | Route directories under `src/app/courses/aibi-p/` | Rename → `src/app/courses/foundation/program/` per Option B | SAFE (after conflict resolution) | Phase 4 |
| 3 | Env var names (`STRIPE_AIBIP_*`) | Three-deploy expand/contract: add new var with same value, deploy code reading either, remove old var | EXTERNALLY_BOUND (Vercel) | Phase 5 |
| 4 | Stripe `metadata.product` writes | Dual-read normalizer (forever); new writes emit `'foundation'` after webhook handler accepts both | DATA_MIGRATION (event history immutable) | Phase 6 |
| 5 | DB CHECK constraints + filter queries | `ALTER TYPE ADD VALUE` + dual-read queries + backfill | DATA_MIGRATION | Phase 2 + 7 |
| 6 | Email URL strings + Resend template aliases | Hardcoded URLs in `src/lib/resend/` updated; template aliases duplicated, drained, deactivated | URL_REDIRECT_NEEDED + ALIAS_DRAIN | Phase 8 |
| 7 | Public file paths (`public/AiBI-P/`) | Rename to `public/Foundation/` (or skip — verify nothing imports) | SAFE | Phase 9 |
| 8 | Content directories | `content/courses/aibi-p/` → `content/courses/foundation-program/`; sandbox/exam/practice-rep dirs follow | SAFE | Phase 4 |
| 9 | TypeScript identifiers (`V4_AIBIP_*`) | Rename together with their imports in one commit | SAFE | Phase 9 |
| 10 | Comments + pedagogical prose | Editorial pass after structural renames stable | EDITORIAL | Phase 10 |

Three identifiers are **EXTERNALLY_BOUND and stay unchanged**:

- **Cert ID prefix `AIBIP-`** in `src/lib/certificates/generateId.ts` — preserves
  verifiability of already-issued credentials.
- **UTM campaign value `'aibi-p'`** in `src/lib/utm.ts` — preserves Plausible attribution
  history. Internal constant name can be renamed; the *value* stays.
- **Credential code `AiBI-P`** in `content/certifications/v1.ts` — preserves
  pre-rename certificate identity.

---

## Phased implementation plan

Each phase is its own commit (or commits). Each is independently revertable. **Do not
collapse phases — the dependency ordering is what makes the migration safe.**

### Phase 0 — Pre-flight (no code changes)

- [ ] Resolve Conflict 1 (route shape) — get user sign-off on Option A / B / C
- [ ] Resolve Conflict 2 (content dir shape) — follows from #1
- [ ] Resolve Conflict 3 (cert code) — confirm "leave unchanged"
- [ ] Snapshot Plausible analytics export (CSV) — historical baseline
- [ ] Snapshot Stripe product list and metadata
- [ ] Snapshot list of MailerLite Automations + their group IDs
- [ ] Document the cutover date in `tasks/foundation-v2-migration.md` so analytics
      queries have a known seam

**Acceptance:** the three conflicts are resolved in writing in this plan or in
CLAUDE.md Decisions Log. Snapshots are stored locally and uploaded to a stable
location.

### Phase 1 — HTTP redirects (additive, lowest risk)

Ship the deep redirect to make every legacy URL transparently route to the new
location. This is reversible, has no coupling, and unblocks downstream user-facing
copy changes.

- [ ] Edit `next.config.mjs:60-85` — add three new redirect entries:
  ```ts
  { source: '/courses/aibi-p',          destination: '/courses/foundation/program',         permanent: true },
  { source: '/courses/aibi-p/:path*',   destination: '/courses/foundation/program/:path*',  permanent: true },
  { source: '/certifications/exam/aibi-p', destination: '/courses/foundation/program/exam', permanent: true },
  ```
  `permanent: true` emits HTTP 308 (preserves method, cacheable; per Next.js
  framework convention).
- [ ] Verify the existing top-level redirect at `src/app/courses/aibi-p/page.tsx`
      (commit `3e8ee1e`) is still in place; remove if `next.config.mjs` covers it
      (cleaner — config-level redirects fire before route resolution).

**Acceptance:**
- `curl -I /courses/aibi-p/m5` returns 308 → `/courses/foundation/program/m5`
- `curl -I /courses/aibi-p/dashboard` returns 308 → `/courses/foundation/program/dashboard`
- Browser navigation from a legacy email link works without 404

**Reversibility:** delete the redirect entries.

### Phase 2 — Supabase enum: ADD VALUE (additive)

- [ ] New migration `supabase/migrations/00024_add_foundation_product_enum.sql`:
  ```sql
  ALTER TABLE course_enrollments
    DROP CONSTRAINT IF EXISTS course_enrollments_product_check;
  ALTER TABLE course_enrollments
    ADD CONSTRAINT course_enrollments_product_check
    CHECK (product IN ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only', 'foundation'));

  ALTER TABLE course_entitlements
    DROP CONSTRAINT IF EXISTS course_entitlements_product_check;
  ALTER TABLE course_entitlements
    ADD CONSTRAINT course_entitlements_product_check
    CHECK (product IN ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only', 'foundation'));
  ```
  (Project uses TEXT + CHECK, not native enum — confirmed via `supabase/migrations/00014_entitlements_table.sql:11`. Simpler than enum migration; no `ADD VALUE`-in-transaction restriction.)
- [ ] Update trigger in `supabase/migrations/00015_entitlements_trigger.sql` to accept
      both values: a follow-on migration that re-creates the trigger function with
      `IF v_product NOT IN ('aibi-p', 'aibi-s', 'aibi-l', 'foundation')`.

**Acceptance:**
- `supabase db query --linked "SELECT 1 FROM course_enrollments WHERE product = 'foundation' LIMIT 1"` runs without constraint error (returns zero rows).
- Existing rows with `product='aibi-p'` continue to read correctly.

**Reversibility:** new migration that restores the original CHECK constraints.

### Phase 3 — TS code: introduce `normalizeProduct()` shim

- [ ] New module `src/lib/products/normalize.ts`:
  ```ts
  // Forever-shim: collapses legacy 'aibi-p' to canonical 'foundation' at every
  // boundary that reads from external sources (Stripe webhook payloads, DB rows
  // written before the rename, in-flight emails). Do not remove — Stripe event
  // retries from 2026-Q1 may arrive at any future date.
  export type ProductSlug = 'foundation' | 'aibi-s' | 'aibi-l' | 'toolbox-only';
  export type LegacyProductSlug = ProductSlug | 'aibi-p';

  export function normalizeProduct(slug: string | null | undefined): ProductSlug | null {
    if (!slug) return null;
    if (slug === 'aibi-p') return 'foundation';
    if (slug === 'foundation' || slug === 'aibi-s' || slug === 'aibi-l' || slug === 'toolbox-only') {
      return slug;
    }
    return null;
  }
  ```
- [ ] Update every `.eq('product', 'aibi-p')` query to `.in('product', ['aibi-p', 'foundation'])`.
      Audit found 10+ such call sites: `src/app/api/dashboard/learner/route.ts:54`,
      `src/app/api/courses/log-quick-win/route.ts:69, 150`,
      `src/app/courses/aibi-p/_lib/getEnrollment.ts:87` (route may have moved by Phase 4),
      `src/app/courses/aibi-p/onboarding/WelcomeFirstPrompt.tsx:55` (this is an INSERT
      — change the inserted value to `'foundation'` directly, no dual-read needed),
      `src/app/courses/aibi-p/[module]/page.tsx:144`, etc.
- [ ] Update `src/types/lms.ts:3` `CourseId` union to include `'foundation'` alongside
      `'aibi-p'` for the transition window.

**Acceptance:**
- `npx tsc --noEmit` clean.
- All existing user-facing flows (load /courses/aibi-p/m5 logged in as v1 buyer →
  module renders) keep working.
- A test row with `product='foundation'` would also be read correctly (dual-read
  unit test in `src/lib/products/normalize.test.ts`).

**Reversibility:** revert the commit; the shim and dual-read queries become no-ops.

### Phase 4 — Filesystem renames (route + content directories)

This is the largest single commit by line count, but it's mechanical (`git mv` + import
rewrites). Per Conflict 1 Option B:

- [ ] `git mv src/app/courses/aibi-p src/app/courses/foundation/program`
- [ ] Update every internal `import` referencing `@/app/courses/aibi-p/*` paths
- [ ] `git mv content/courses/aibi-p content/courses/foundation-program`
- [ ] Update every `@content/courses/aibi-p` import (10+ call sites — see audit
      Category 8). Tools: `grep -rln '@content/courses/aibi-p' src/ content/` then sed.
- [ ] `git mv content/sandbox-data/aibi-p content/sandbox-data/foundation-program`
- [ ] `git mv content/exams/aibi-p content/exams/foundation-program`
- [ ] `git mv content/practice-reps/aibi-p.ts content/practice-reps/foundation-program.ts`
- [ ] `git mv public/AiBI-P public/AiBI-Foundation` (verify nothing imports first;
      audit shows no code references)
- [ ] Add backward-compat redirect for the moved `/certifications/exam/aibi-p`
      (already in Phase 1 redirect list).
- [ ] Update Phase 1 redirect destinations: change
      `/courses/foundation/program/:path*` to actually exist after this phase. (Phase 1
      ships the redirect *target*, Phase 4 makes the target real — order matters but
      a redirect to a 404 is no worse than the current state for an in-flight 5-min
      deploy gap.)

**Acceptance:**
- `npx tsc --noEmit` clean.
- `npm run build` succeeds.
- All existing user-facing flows work via the redirect chain: legacy URL → 308 → new URL → renders.
- v1 buyer enrollment continues to authenticate against the same DB row.

**Reversibility:** revert the commit; all `git mv`s reverse cleanly because git
tracks renames.

### Phase 5 — Vercel env var rotation (three-deploy pattern)

Per the framework-research playbook:

**Phase 5a (expand):**
- [ ] In Vercel dashboard, add `STRIPE_FOUNDATION_PRICE_ID` and
      `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` to Production + Preview + Development,
      each with the **same value** as the corresponding `STRIPE_AIBIP_*` var.
- [ ] Edit `src/app/api/create-checkout/route.ts:115-177` to read with fallback:
  ```ts
  const priceId =
    process.env.STRIPE_FOUNDATION_PRICE_ID ??
    process.env.STRIPE_AIBIP_PRICE_ID ??
    (() => { throw new Error('STRIPE_FOUNDATION_PRICE_ID not set'); })();
  ```
- [ ] Deploy. App reads either; both must be present.

**Phase 5b (migrate):**
- [ ] After Phase 5a is green, edit the env reads to require only the new var.
- [ ] Deploy. App now requires the new var; old var is unused.

**Phase 5c (contract):**
- [ ] Delete `STRIPE_AIBIP_PRICE_ID` and `STRIPE_AIBIP_INSTITUTION_PRICE_ID` from
      Vercel dashboard (Production + Preview + Development).

**Acceptance:** After 5c, a fresh deployment succeeds with only the new env vars
present. End-to-end Stripe Checkout flow on staging completes successfully against the
existing `price_...` IDs.

**Reversibility:** restore old env vars in Vercel; revert code.

### Phase 6 — Stripe product rename + dual-read webhook

- [ ] In Stripe dashboard (or via CLI), update each Product:
  ```bash
  stripe products update prod_XXX --name="AiBI-Foundation" \
    --metadata[canonical_slug]=foundation \
    --metadata[legacy_slug]=aibi-p
  ```
  Repeat for individual + institution products. **Price IDs unchanged.**
- [ ] Edit `src/app/api/create-checkout/route.ts:153, 179` — new sessions emit
      `metadata.product = 'foundation'`.
- [ ] Edit `src/app/api/webhooks/stripe/route.ts:26-27` — call `normalizeProduct()` on
      `session.metadata.product` so both `'aibi-p'` (old retries) and `'foundation'`
      (new) sessions are accepted.
- [ ] Edit `src/lib/stripe/provision-enrollment.ts:107` — write `'foundation'` to DB on
      new webhook events.
- [ ] Edit `src/lib/stripe.ts:30` — TS `Product` union extended.

**Acceptance:**
- New Stripe Checkout Session created via `/courses/foundation/program/purchase` shows
  "AiBI-Foundation" as the product name on the checkout page.
- Webhook receiving a stale `metadata.product='aibi-p'` event (e.g., 24-hour-old
  in-flight session) processes correctly.
- New `course_enrollments` rows have `product='foundation'`.

**Reversibility:** revert Stripe Product `name` via dashboard; revert code; old
webhook handler accepts the same payloads as before.

**Sequencing constraint:** **the dual-read webhook must deploy at least 24 hours
before the metadata writer flips.** This guarantees no in-flight Checkout Session
lands in a webhook that doesn't recognize its own metadata. Practically: ship Phase 6
in two commits, 24+ hours apart.

### Phase 7 — Database backfill

- [ ] New migration `supabase/migrations/00025_backfill_foundation_product.sql`:
  ```sql
  UPDATE course_enrollments
     SET product = 'foundation'
     WHERE product = 'aibi-p';

  UPDATE course_entitlements
     SET product = 'foundation'
     WHERE product = 'aibi-p';

  UPDATE prompt_library
     SET course_source_ref = REPLACE(course_source_ref, 'aibi-p/', 'foundation/')
     WHERE course_source_ref LIKE 'aibi-p/%';
  ```
- [ ] Deploy.
- [ ] Verify no rows reference `'aibi-p'` anymore:
  ```sql
  SELECT COUNT(*) FROM course_enrollments WHERE product = 'aibi-p';   -- expect 0
  SELECT COUNT(*) FROM course_entitlements WHERE product = 'aibi-p';  -- expect 0
  ```

**Acceptance:** zero rows reference `'aibi-p'` in the live DB. Existing buyers'
enrollments still resolve (they're now under `product='foundation'` and the
dual-read code reads it).

**Reversibility:** inverse `UPDATE` statement.

### Phase 8 — Resend + MailerLite

**Resend:**
- [ ] Edit `src/lib/resend/index.ts:155, 219` — change hardcoded URLs from
      `https://aibankinginstitute.com/courses/aibi-p` to
      `https://aibankinginstitute.com/courses/foundation/program`.
- [ ] In Resend dashboard, **duplicate** each of the 5 templates with new aliases
      that drop any `aibi-p` references (audit shows aliases themselves are clean —
      `course-purchase-individual` etc. — so likely only the *body content* needs
      editing in the dashboard, not the alias rename). Verify each template's body
      copy once visually.
- [ ] Update wrapper helpers in `src/lib/resend/index.ts` if any aliases changed.

**MailerLite:**
- [ ] In MailerLite dashboard, review the 5 live Automations. Per the 2026-05-08
      decision, the dashboard versions need a re-sync from
      `src/lib/mailerlite/email-content.ts` after the rename. Audit: no
      `aibi-p` refs found in `src/lib/mailerlite/`, so this is body-content review only.

**Acceptance:** a fresh test purchase triggers a transactional email containing
`/courses/foundation/program/...` URLs (not `/courses/aibi-p/...`).

**Reversibility:** revert the URL string in code; restore the previous Resend
template body via the dashboard's version history.

### Phase 9 — TS identifier rename + public file path

- [ ] Rename `V4_AIBIP_MODULES`, `V4_AIBIP_MODULE_BY_NUMBER` →
      `V4_FOUNDATION_PROGRAM_MODULES`, `V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER`
      (`content/courses/foundation-program/v4-expanded-modules.ts:30, 525, 526`).
      Update all 3 import sites.
- [ ] Rename `TOTAL_AIBIP_MODULES` → `TOTAL_FOUNDATION_PROGRAM_MODULES`
      (`src/components/sections/HomeContextStrip.tsx:21, 64`).
- [ ] Rename `AIBIP_TOTAL_MODULES` → `FOUNDATION_PROGRAM_TOTAL_MODULES`
      (`src/app/api/admin/institution/summary/route.ts:5, 50`,
       `src/app/admin/page.tsx:6, 69, 131`).
- [ ] Decide on UTM campaign rename (`src/lib/utm.ts:6`). **Recommendation: keep value
      `'aibi-p'`, rename the constant name only.** Plausible has historical attribution
      data; changing the value splits dashboards.
- [ ] Decide on cert ID prefix (`src/lib/certificates/generateId.ts:2, 13, 25`).
      **Recommendation: keep `AIBIP-` prefix unchanged.** Already-issued certs are
      verifiable by this prefix; new prefix would create a confusing two-format issue.

**Acceptance:** `npx tsc --noEmit` clean. No code references the old identifier names.

### Phase 10 — Comments and pedagogical prose

Final editorial pass. ~40 references in `content/courses/aibi-s/*` and
`content/courses/aibi-l/*` reference "AiBI-P" as historical context ("AiBI-P
introduced X, AiBI-S extends Y"). Decision per author taste:

- [ ] **Option A (recommended):** rename in-prose to "AiBI-Foundation" for consistency
      with the new branding. The pedagogical reference still works ("AiBI-Foundation
      introduced X, AiBI-S extends Y").
- [ ] **Option B:** keep "AiBI-P" as historical / credential reference. Add a
      one-time editorial note explaining the rename in the AiBI-S course preface.

`scripts/generate-static-artifacts.mjs:571, 637, 888, 955` — PDF footer text
"ARTF-01 · AiBI-P: Banking AI Practitioner". This *is* user-facing (printed on
artifact PDFs). Rename to "AiBI-Foundation" to match the new brand.

`content/assessments/v2/personalization.ts:238, 549, 550, 557, 558` — copy text
"Run AiBI-P Module 01", "Enroll your team in AiBI-P". User-facing, rename.

`content/assessments/v2/pdf-content.ts:102` — `title: 'AiBI-P Practitioner'`. Rename.

**Acceptance:** no user-facing surface displays "AiBI-P" except the credential code
on previously-issued certificates.

---

## Migration patterns reference

The patterns below are already documented by the framework-docs research. Included
here as a quick reference to avoid re-deriving them mid-implementation.

### HTTP redirect — Next.js 14

```ts
// next.config.mjs
async redirects() {
  return [
    { source: '/courses/aibi-p',          destination: '/courses/foundation/program',          permanent: true },
    { source: '/courses/aibi-p/:path*',   destination: '/courses/foundation/program/:path*',   permanent: true },
  ];
}
```

`permanent: true` → HTTP 308 (method-preserving, cacheable, search-engine-friendly).
Industry norm: keep these forever; no removal date.

### Postgres CHECK constraint extension

```sql
ALTER TABLE course_enrollments
  DROP CONSTRAINT IF EXISTS course_enrollments_product_check;
ALTER TABLE course_enrollments
  ADD CONSTRAINT course_enrollments_product_check
  CHECK (product IN ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only', 'foundation'));
```

(Project uses TEXT + CHECK, not native enum — confirmed via 00014 migration. This is
the easier path: drop and re-create constraint atomically.)

### Stripe product rename — Node SDK

```ts
await stripe.products.update('prod_XXX', {
  name: 'AiBI-Foundation',
  metadata: { canonical_slug: 'foundation', legacy_slug: 'aibi-p' },
});
// Price IDs unchanged.
```

### Vercel env var expand/contract

Three deploys. Phase 5a adds the new var (same value), code reads either. Phase 5b
removes the fallback. Phase 5c removes the old var from Vercel. Each phase is
independently revertable.

### normalizeProduct shim

```ts
// src/lib/products/normalize.ts — forever-shim, do not delete
export function normalizeProduct(slug: string | null | undefined): ProductSlug | null {
  if (!slug) return null;
  if (slug === 'aibi-p') return 'foundation';
  return ['foundation', 'aibi-s', 'aibi-l', 'toolbox-only'].includes(slug)
    ? (slug as ProductSlug)
    : null;
}
```

---

## Acceptance criteria (overall)

### Functional

- [ ] Visiting any legacy `/courses/aibi-p/*` URL renders the same content it did
      before, via 308 redirect to `/courses/foundation/program/*`.
- [ ] New Stripe Checkout sessions show "AiBI-Foundation" as the product name.
- [ ] New `course_enrollments` rows are written with `product='foundation'`.
- [ ] Existing buyers' enrollments continue to authorize access to course modules.
- [ ] Stripe webhook successfully processes both legacy (`aibi-p`) and new
      (`foundation`) `metadata.product` values.

### Non-functional

- [ ] `npx tsc --noEmit` passes clean across all phases
- [ ] `npm run build` succeeds before each phase ships
- [ ] Zero downtime during the rollout (each phase is additive)
- [ ] Plausible analytics keeps a documented seam date in the README
- [ ] `tasks/foundation-v2-migration.md` updated at the end of each phase

### Quality gates

- [ ] No hardcoded `'aibi-p'` strings remain in writers (DB INSERT, Stripe metadata
      write, MailerLite group assignment)
- [ ] All readers use `normalizeProduct()` or the dual-value `IN` query
- [ ] Phase 6 dual-read webhook has been live for ≥24 hours before Phase 6 metadata
      writer flips
- [ ] Phase 7 backfill verifies zero rows reference `'aibi-p'` in `course_enrollments`
      and `course_entitlements`

---

## Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Existing buyer's bookmark to `/courses/aibi-p/m5` 404s | Medium | High (customer support burden) | Phase 1 ships the deep redirect with `:path*` passthrough |
| Stripe webhook retry from 2026-Q1 fails because handler doesn't recognize legacy `metadata.product='aibi-p'` | Low | High (lost enrollment) | `normalizeProduct()` shim is forever-import; webhook accepts both indefinitely |
| Backfill UPDATE locks `course_enrollments` table during peak | Low | Medium | Run Phase 7 during low-traffic window; the table is small enough this should complete in seconds |
| In-flight Checkout Session lands in a Phase 6 webhook that hasn't deployed yet | Medium | Medium | Sequencing constraint: dual-read webhook ships ≥24h before metadata writer flips |
| Resend template body still says "AiBI-Practitioner" after Phase 8 because operator forgot to update dashboard | Medium | Low (cosmetic; not a functional break) | Test purchase + visual review of the resulting email; Phase 8 acceptance criterion |
| Plausible analytics dashboards split before/after the cutover | High | Low (analytics seam, not a functional issue) | Document the cutover date; queries become `WHERE product IN ('aibi-p','foundation')` |
| MailerLite Automations send copy with stale "AiBI-Practitioner" text after Phase 8 | Low | Low | Per 2026-05-08 pattern, recreate Automations with corrected copy in dashboard |
| Plan reverses 2026-05-06 decision; future contributors confused about why internal IDs changed | Low | Low | This plan + CLAUDE.md Decisions Log entry document the reversal explicitly |

---

## Rollback plan per phase

Each phase produces its own commit. Rollback is `git revert <commit>` plus the
phase-specific operational steps below.

| Phase | Code revert | Operational rollback |
|---|---|---|
| 1 | revert `next.config.mjs` change | none — redirect just disappears |
| 2 | revert migration file | new migration restoring original CHECK |
| 3 | revert `normalizeProduct.ts` + dual-read queries | none |
| 4 | revert filesystem renames + import rewrites | none — `git mv` is fully tracked |
| 5 | revert env var fallback code; old vars still in Vercel | restore old env vars (still present until 5c) |
| 6 | revert webhook + checkout writer; revert TS Product union | restore Stripe Product `name` via dashboard |
| 7 | run inverse `UPDATE` migration | none |
| 8 | revert URL strings in `src/lib/resend/index.ts` | restore Resend template bodies via Resend dashboard version history |
| 9 | revert TS identifier renames | none |
| 10 | revert prose changes | none |

---

## Communication plan

(Per best-practices research §7. Summarized.)

1. **One direct email to all enrolled buyers** the day Phase 6 ships. Subject: *"Your
   AiBI-Practitioner course is now AiBI-Foundation."* Four-question body: what
   changed (the name, only the name), what didn't (access, progress, certificate,
   bookmarks), why (one sentence), what to do (nothing).

2. **In-app banner** on `/dashboard` and `/courses/foundation/program/*` for 30 days,
   dismissible, terra signal color, no exclamation marks. Cookie-store dismiss state.

3. **No social, no blog, no newsletter blast.** This is a maintenance change, not a
   launch.

4. **Customer-support one-pager** in the project Notion / wiki before the email goes
   out: 3-sentence answer to "AiBI-P vs Foundation" plus link to this plan.

5. **Cert handling:** previously-issued certificates keep "AiBI-Practitioner"
   designation. Future issuances use "AiBI-Foundation". This is a deliberate "industry
   convention" choice (LinkedIn-style: credentials at time of issue are immutable).

---

## Operational sequencing (run-of-show)

| Day | Phase | Action | Reversible |
|---|---|---|---|
| D-7 | 0 | Resolve conflicts; snapshot Plausible / Stripe / MailerLite | yes |
| D-3 | 1 | Ship `next.config.mjs` deep redirects | yes |
| D-3 | 2 | Ship Supabase CHECK constraint extension | yes |
| D-2 | 3 | Ship `normalizeProduct()` + dual-read queries | yes |
| D-2 | 4 | Ship filesystem renames (route + content + sandbox + exam dirs) | yes |
| D-1 | 5a | Add `STRIPE_FOUNDATION_*_PRICE_ID` to Vercel; deploy code reading either | yes |
| D-1 | 6a | Ship dual-read webhook handler (accepts both `aibi-p` and `foundation`) | yes |
| **D0+24h** | 6b | Flip Stripe Product `name` + flip metadata writer to `'foundation'` | yes |
| D+1 | 7 | Run DB backfill | yes (inverse UPDATE) |
| D+1 | (comm) | Send customer email; raise in-app banner | yes (retract email content; lower banner) |
| D+3 | 8 | Update Resend URLs; review template bodies | yes |
| D+3 | 5b | Remove env var fallback (code reads only new var) | yes |
| D+7 | 9 | TS identifier renames + public dir rename | yes |
| D+14 | 5c | Remove old env vars from Vercel | yes (re-add) |
| D+30 | (comm) | Drop in-app banner | yes |
| D+30 | 10 | Editorial pass on prose / comments | yes |
| Forever | — | Keep `normalizeProduct()`, the 308 redirects, the `'aibi-p'` value in CHECK constraint, and the legacy MailerLite automation | — |

The single hard constraint is **the 24-hour gap between Phase 6a and Phase 6b** so
in-flight Checkout Sessions can't land in a webhook that doesn't recognize their
metadata.

---

## Open questions

These are decisions that need user/operator input before Phase 0 closes:

1. **Conflict 1 — route shape.** Option A (v1 absorbs and v2 preview deletes) /
   Option B (v1 lives at `/courses/foundation/program/*`) / Option C (v1 stays at
   `/courses/aibi-p/*`)? **Recommend B.**

2. **Conflict 2 — content shape.** Follows from #1. **Recommend
   `content/courses/foundation-program/`** for the active 12-module course and
   keep `content/courses/aibi-foundation/` for v2 four-track preview data.

3. **Conflict 3 — credential code.** Keep "AiBI-P" as the credential code printed
   on certificates? **Recommend yes** (industry convention).

4. **Phase 10 prose.** Rename "AiBI-P" historical references in AiBI-S and AiBI-L
   curriculum prose (Option A) or keep as historical (Option B)? **Recommend A.**

5. **Cert ID prefix.** New certs use `AIBIP-` (preserves verification continuity)
   or `AIBIF-` (matches the new brand)? **Recommend `AIBIP-` unchanged.**

6. **UTM campaign value.** Keep `'aibi-p'` (preserves Plausible attribution) or
   change to `'foundation'` (consistent naming, breaks historical comparison)?
   **Recommend keep value, rename internal constant.**

7. **Customer email cadence.** Single email at Phase 6 ship date, or pre-announce 7
   days in advance? **Recommend single email at ship.**

---

## References

### Internal references

- Audit: see "Files in this codebase that will need touching" appendix below
- `tasks/foundation-v2-migration.md` — the broader v2 migration plan; this rename
  plan is a child / sibling of Phase 2
- CLAUDE.md Decisions Log:
  - 2026-05-06 — original short-ID-preservation decision (this plan reverses for routes)
  - 2026-05-08 — MailerLite recreation pattern for copy changes
  - 2026-05-09 — v2 redesign canonicalization
  - 2026-05-10 — single-product overview + aibi-p top-level redirect (in-progress)
- Memory entries:
  - `feedback_split_large_renames.md` — visible-copy first, internal sweep second
  - `feedback_no_sed_i_on_env_files.md` — never use `sed -i` on `.env*` files
  - `reference_supabase_migration_naming_divergence.md` — `supabase db query --linked`

### External references

- [Next.js — Redirects (`permanent: true` emits 308)](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
- [Stripe — Manage products and prices](https://docs.stripe.com/products-prices/manage-prices)
- [Stripe — Metadata is append-only history](https://docs.stripe.com/metadata)
- [PostgreSQL 17 — ALTER TYPE](https://www.postgresql.org/docs/17/sql-altertype.html)
- [Supabase — Managing enums in Postgres](https://supabase.com/docs/guides/database/postgres/enums)
- [Resend — Update template](https://resend.com/docs/api-reference/templates/update-template)
- [Vercel — Environment variables](https://vercel.com/docs/environment-variables)
- [Martin Fowler — ParallelChange / expand–contract](https://martinfowler.com/bliki/ParallelChange.html)
- [Google Search Central — 301/308 redirects pass PageRank identically](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [RFC 7538 — HTTP 308 Permanent Redirect](https://datatracker.ietf.org/doc/html/rfc7538)

### Audit appendix — files referencing `aibi-p`

(Selected representative entries; full inventory in the parallel research output. ~600
references across ~120 files.)

**User-facing URL paths:**
- `next.config.mjs:74-82` (existing redirects to /courses/aibi-p)
- `src/app/page.tsx:33, 66`
- `src/app/education/page.tsx:119, 217`
- `src/app/for-institutions/page.tsx:65`
- `src/app/dashboard/page.tsx:190, 220, 226, 364, 393`
- `src/app/dashboard/progression/page.tsx:324, 356`
- `src/app/api/create-checkout/route.ts:150, 151, 176, 177`
- `src/app/api/webhooks/stripe/route.ts:27`
- `src/components/Footer.tsx:20`
- `src/lib/lms/assessment-recommendations.ts:43, 51`
- `src/lib/resend/index.ts:155, 219`
- `content/copy/index.ts:72`
- `content/assessments/v2/personalization.ts:551, 559`

**Filesystem route directories (whole tree):**
- `src/app/courses/aibi-p/` — `_components/`, `_lib/`, `[module]/`, `onboarding/`,
  `purchase/`, `purchased/`, `submit/`, `gallery/`, `settings/`, `quick-wins/`,
  `tool-guides/`, `toolkit/`, `certificate/`, `artifacts/[artifactId]/`,
  `post-assessment/`, `prompt-library/`, `page.tsx` (already redirected), `layout.tsx`

**Env var names:**
- `src/app/api/create-checkout/route.ts:115, 117, 118, 122, 123, 136, 139, 142, 169, 175`
- `docs/stripe-products.md:105, 114, 222, 260, 261`

**Stripe metadata + DB enum values:**
- `src/lib/stripe.ts:30` (TS union)
- `src/lib/stripe/provision-enrollment.ts:107`
- `src/app/api/create-checkout/route.ts:153, 179`
- `src/app/api/webhooks/stripe/route.ts:26`
- `supabase/migrations/00014_entitlements_table.sql:11`
- `supabase/migrations/00015_entitlements_trigger.sql:21`
- `supabase/migrations/00018_toolbox_library_tables.sql:21`
- `supabase/migrations/00022_migrate_course_prompts_to_library.sql` (40+ rows of
  `course_source_ref` values like `aibi-p/module-3`)
- `src/types/lms.ts:3`
- `src/app/api/dashboard/learner/route.ts:54`
- `src/app/api/courses/log-quick-win/route.ts:69, 150`

**Email/Resend:**
- `src/lib/resend/index.ts:155, 219` (hardcoded URLs in template variables)
- `docs/mailerlite-emails/*.html` (8 files; historical, treated as URL_REDIRECT_NEEDED)

**Public + content directories:**
- `public/AiBI-P/` (likely safe rename; no code imports per audit)
- `content/courses/aibi-p/` (whole tree)
- `content/sandbox-data/aibi-p/` (3 files)
- `content/exams/aibi-p/` (questions.ts, scoring.ts)
- `content/practice-reps/aibi-p.ts`

**TS identifiers:**
- `content/courses/aibi-p/v4-expanded-modules.ts:30, 525, 526` (`V4_AIBIP_*`)
- `src/components/sections/HomeContextStrip.tsx:21, 64` (`TOTAL_AIBIP_MODULES`)
- `src/app/api/admin/institution/summary/route.ts:5, 50` (`AIBIP_TOTAL_MODULES`)
- `src/app/admin/page.tsx:6, 69, 131` (`AIBIP_TOTAL_MODULES`)
- `src/lib/utm.ts:6` (UTM campaign — recommend keep value)
- `src/lib/certificates/generateId.ts:2, 13, 25` (cert ID prefix — recommend keep)
- `src/types/lms.ts:3` (`CourseId` union)

**EXTERNALLY_BOUND (do not change):**
- `content/certifications/v1.ts:20, 22` — credential code on issued certificates
- `src/lib/certificates/generateId.ts` — `AIBIP-` cert ID prefix (verification)
- `src/lib/utm.ts` — `aibi-p` UTM campaign value (analytics history)
- Stripe `prod_*` and `price_*` IDs (immutable by design)
- `course_enrollments.product='aibi-p'` rows from before backfill (mutable, but
  immutable in event-history sense — Stripe events with that metadata exist forever)

---

## Final note: when not to do this migration

If the cost/benefit weighs against shipping all 10 phases, the **minimum viable
rename** is:

1. Phase 1 (HTTP redirects) — already done up to top-level; extend with `:path*` passthrough
2. Phase 6 (Stripe Product `name` only — leave `metadata.product='aibi-p'` forever)
3. Phase 8 (Resend template URL strings)

That's three commits and ~30 minutes of work. The rest of the plan exists because
the user's stated intent is *systematic* rename, not *minimum viable*. The
recommendation is to go through all 10 phases in sequence over ~30 days, with each
phase committable and reversible independently.
