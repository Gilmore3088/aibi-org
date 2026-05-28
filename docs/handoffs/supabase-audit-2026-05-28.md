# Supabase + Downloadable-Resources Audit
**Date:** 2026-05-28
**Project ref:** `gbmhrqubbervdltvtpur` (AiBI production)
**Status:** read-only audit complete · NO writes performed

---

## Executive summary

| Bucket | Status |
|---|---|
| Tables in DB | 21 (8 empty, 13 active) |
| Tables referenced by code but missing in DB | **5 — broken paths** |
| Storage buckets | 5 (only `assessment-pdfs` has data: 12 PDFs / 3.6 MB) |
| Migrations remote vs local | **21 remote vs 38 local files — 3 unapplied + name drift** |
| Edge functions | 0 |
| Downloadable resources | 22 files in `/public/downloads/` (~12 MB) — **all on Vercel, none in Supabase** |

**Headline issues**

1. **Five tables referenced by code do not exist** — production code paths are broken or dead. Most critical: the legacy `assessment_responses` table is queried by the `/dashboard/assessments` page and the transformation-report API; actual data lives on `user_profiles.readiness_*` columns.
2. **Three local migrations never applied to remote** — newsletter (retired), entitlements tier column (live feature), certificates enumeration fix (security).
3. **22 downloadable resources live on Vercel CDN.** Per your direction these should move into Supabase Storage with a metadata table + download log.

---

## 1. Tables in DB — verdict per table

### Active (13)
| Table | Rows | Purpose |
|---|---:|---|
| `user_profiles` | 12 | Auth + readiness assessment storage (readiness_* columns + PDF path) |
| `course_enrollments` | 13 | Foundation/AiBI-S/L purchases + onboarding + post-assessment |
| `email_capture_log` | 72 | IP-hash rate limit for `/api/capture-email` |
| `entitlements` | 2 | Active product entitlements (Stripe-driven) |
| `toolbox_library_skills` | 37 | Toolbox prompt catalog (seeded) |
| `toolbox_library_skill_versions` | 37 | Versioned prompts |
| `toolbox_recipes` | 1 | Multi-step recipes |
| `future_course_waitlist` | 16 | AiBI-S/L interest capture |
| `rate_limits` | 9 | Fixed-window counters |
| `ai_usage_log` | 5 | Toolbox AI call audit |
| `webauthn_credentials` | 1 | Passkey for one user |
| `webauthn_challenges` | 3 | Passkey challenge cache |
| `webauthn_recovery_codes` | 8 | Passkey recovery codes |

### Empty but legitimate (8 — keep)
| Table | Reason |
|---|---|
| `institution_enrollments` | Referenced as FK in `course_enrollments.institution_enrollment_id` |
| `activity_responses` | LMS activity tracking — populated when M0 ships |
| `work_submissions` | Module work-product submissions |
| `certificates` | Issued on Foundation completion |
| `quick_wins` | Referenced by `/api/courses/log-quick-win` — populates as users finish modules |
| `toolbox_skills` | User-saved skills (vs library catalog) — referenced by `/api/toolbox/*` |
| `prompt_card_leads` | Paid-preview prompt-card lead capture |
| `indepth_takes` | $99 In-Depth Assessment results |

### Code-only tables (5 — BROKEN)
Code references these but **no table exists in the database**:

| Table | Referenced by | Fix |
|---|---|---|
| `assessment_responses` | `src/app/dashboard/assessments/page.tsx:68`, `src/app/api/courses/generate-transformation-report/route.ts:312` | **Repoint to `user_profiles`** (where `readiness_*` columns live). Legacy table reference from PR #44 era. |
| `newsletter_subscribers` | `src/app/api/subscribe-newsletter/route.ts:87` | **Delete the route + local migration 00034**. Newsletter retired 2026-05-27 (memory: `project_no_active_newsletter`). |
| `practice_rep_completions` | `src/app/api/practice-reps/complete/route.ts:42`, `src/app/api/dashboard/learner/route.ts:58` | **Create table or remove routes** — depends on whether practice-reps surface ships. |
| `saved_prompts` | `src/app/api/dashboard/learner/route.ts:63` | **Decide:** consolidate with `toolbox_skills` (likely the right move) or create new. |
| `user_artifacts` | `src/app/api/practice-reps/complete/route.ts:64`, `src/app/api/dashboard/learner/route.ts:68`, `src/app/api/courses/submit-activity/route.ts:261` | **Create table** — this is the "saved Workbench Pack" surface from M4 memory; clear product role. |

---

## 2. Migration drift

**Remote applied:** 21 migrations (latest `addie_artifact_type_workbench_pack`, 2026-05-25).
**Local files:** 38 (`00001…00036`).

Three local migrations are not in the remote list:

| File | Action |
|---|---|
| `00034_newsletter_subscribers.sql` | **Delete file.** Newsletter retired; route is dead. |
| `00035_entitlements_tier_and_indepth.sql` | **Apply.** Adds `entitlements.tier` column for $99 In-Depth flow — confirmed not present in current schema. Live feature. |
| `00036_certificates_drop_public_enumeration.sql` | **Apply.** Security hardening — drops `Public read certificates` policy so the anon key can't enumerate every graduate. |

The earlier local files (00001–00033) appear in remote under different timestamp names — that's expected drift from the `supabase db push` workflow and not a problem.

---

## 3. Storage buckets

| Bucket | Objects | Bytes | Verdict |
|---|---:|---:|---|
| `assessment-pdfs` | 12 | 3.6 MB | **Active** — readiness report PDFs |
| `work-products` | 0 | 0 | Reserved — M4 Workbench Pack uploads. Keep. |
| `addie-course-media` | 0 | 0 | Reserved — course media (500 MB limit). Keep. |
| `addie-toolbox-exports` | 0 | 0 | Reserved — toolbox exports. Keep. |
| `addie-assessment-deliverables` | 0 | 0 | Reserved — pre/post-assessment deliverables. Keep. |
| `resources` | — | — | **Does not exist** — to be created. |

---

## 4. Vercel-side assets (audit of `/public/`)

| Path | Size | Verdict |
|---|---:|---|
| `/public/downloads/` | **12 MB** (22 files) | **MIGRATE to Supabase `resources` bucket** |
| `/public/artifacts/` | 112 K | Keep local — small, mostly `_archive/` |
| `/public/sketches/` | 736 K | Keep local — reference designs, not user-facing |
| `/public/lms-prototype/` | small | Keep local — prototype reference |
| `/public/tool-logos/` | small | Keep local — UI assets |
| `/public/.well-known/` | small | **Must stay local** — DNS / domain verification |

**The 22 `/public/downloads/` files** (referenced from `src/app/resources/data.ts`):

- 6 sector playbooks: `bsa-aml`, `compliance`, `infosec`, `lending`, `marketing`, `retail`
- 1 In-Depth playbook
- 4 starter-kit ZIPs: `governance`, `frontline`, `lending-review`, `marketing-review`
- 4 PDF templates: `ai-use-policy`, `ai-workflow-sop`, `board-briefing`, `gtm-plan`
- 3 artifacts: `ai-use-case-inventory`, `data-handling-card`, `fair-lending-checklist`
- 4 reference cards / samples: `prompt-strategy`, `red-yellow-green-use-card`, `regulatory-cheatsheet`, `safe-ai-use-checklist`, `platform-feature-card`, `sample-readiness-report`

---

## 5. Proposed target state (hybrid model — confirmed)

### New `resources` table (Postgres)

```sql
create table public.resources (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,            -- e.g. 'bsa-aml-playbook'
  title             text not null,
  description       text not null,
  category          text not null,                   -- 'playbook' | 'starter-kit' | 'template' | 'desk-card' | 'artifact'
  file_path         text not null,                   -- storage object path in 'resources' bucket
  file_type         text not null,                   -- 'pdf' | 'zip'
  file_size_bytes   bigint,
  tier_required     text not null default 'free',    -- 'free' | 'foundation' | 'aibi-s' | 'aibi-l'
  published         boolean not null default true,
  display_order     int,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
-- RLS: anon SELECT where published=true and tier_required='free'; service-role full.
```

### New `resource_downloads` table (logging)

```sql
create table public.resource_downloads (
  id            uuid primary key default gen_random_uuid(),
  resource_id   uuid references public.resources(id) on delete cascade,
  resource_slug text not null,
  user_id       uuid references auth.users(id),    -- nullable: anon downloads tracked by email
  email         text,
  ip_hash       text,                              -- TOOLBOX_IP_HASH_SALT
  user_agent    text,
  referrer      text,
  downloaded_at timestamptz not null default now()
);
-- RLS: service-role only (writes from /api/resources/download).
```

### New storage bucket `resources`
- Private bucket
- Signed URLs only (e.g. 5-minute expiry)
- File size limit: 10 MB (largest current asset is ~929 K)
- 22 files migrated from `/public/downloads/` keeping current filenames

### New API route `/api/resources/[slug]/download`
1. Look up resource by slug
2. Check `tier_required` against user's entitlements (or `free`)
3. Generate signed Storage URL
4. Insert `resource_downloads` row
5. Redirect to signed URL

### Refactor `src/app/resources/ResourcesExperience.tsx`
- Fetch resources list from `/api/resources` instead of hardcoded `data.ts`
- Route download links through `/api/resources/[slug]/download`

---

## 6. Recommended execution order

**Stage 1 — Fix broken paths (no destructive ops)**
1. Apply migration `00035_entitlements_tier_and_indepth.sql` (additive, safe)
2. Apply migration `00036_certificates_drop_public_enumeration.sql` (security, safe)
3. Repoint `assessment_responses` code refs → `user_profiles`
4. Decide on `practice_rep_completions` / `saved_prompts` / `user_artifacts` — either create migrations or remove the routes

**Stage 2 — Resources migration (additive)**
5. Create `resources` storage bucket
6. Create `resources` + `resource_downloads` tables (new migration)
7. Seed `resources` table from existing `src/app/resources/data.ts`
8. Upload 22 files to storage bucket
9. Build `/api/resources/[slug]/download` route
10. Refactor `ResourcesExperience.tsx` to read from API
11. **After QA passes**, delete `/public/downloads/` (requires ALL-CAPS approval)

**Stage 3 — Cleanup (requires ALL-CAPS approval per file/table)**
12. Delete `src/app/api/subscribe-newsletter/route.ts` + `supabase/migrations/00034_newsletter_subscribers.sql`
13. Decide whether to drop the 4 empty addie-* buckets if their features are deferred
14. Run security advisors after all changes; address any new findings

---

## What I did NOT do
- No tables dropped
- No buckets dropped
- No migrations applied
- No files deleted
- No code changes

All write actions in Stages 1–3 will be presented individually for explicit ALL-CAPS approval where destructive, or summarized for sign-off where additive.
