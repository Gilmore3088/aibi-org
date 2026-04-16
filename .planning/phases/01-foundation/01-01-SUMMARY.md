---
phase: 01-foundation
plan: "01"
subsystem: database
tags: [supabase, schema, rls, typescript, migration]
dependency_graph:
  requires: []
  provides: [supabase-schema, course-types, supabase-client]
  affects: [all subsequent phases — every course feature depends on these tables and types]
tech_stack:
  added: ["@supabase/ssr@0.10.2", "@supabase/supabase-js@2.103.2"]
  patterns: [RLS with SELECT-wrapped auth.uid(), service role bypass for system writes, readonly TypeScript interfaces]
key_files:
  created:
    - supabase/migrations/00001_course_tables.sql
    - src/types/course.ts
  modified:
    - src/lib/supabase/client.ts
    - package.json
    - package-lock.json
decisions:
  - Reviewer UPDATE policies deferred to Phase 7 (reviewer identity model undecided per STATE.md blocker)
  - institution_enrollments has no user-facing RLS policies — all access via service role
  - course_enrollments ALTER TABLE uses idempotent DO $$ blocks for prototype-to-production safety
metrics:
  duration: "2 minutes"
  completed_date: "2026-04-16"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 01 Plan 01: Database Schema, RLS, and Supabase Client Summary

**One-liner:** Five-table AiBI-P schema with RLS, SELECT-wrapped auth.uid() policies, 8 indexes, readonly TypeScript interfaces, and @supabase/ssr client factories replacing the stub.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create SQL migration with all 5 tables | 5336994 | supabase/migrations/00001_course_tables.sql |
| 2 | Add RLS policies, indexes, TypeScript types, Supabase client | a57cb18 | src/types/course.ts, src/lib/supabase/client.ts, package.json |

## What Was Built

### SQL Migration (`supabase/migrations/00001_course_tables.sql`)

Five tables in creation order:

1. **institution_enrollments** — Created fresh; no user-facing RLS (service role only)
2. **course_enrollments** — Extended from prototype-era table via idempotent DO $$ blocks; adds user_id, onboarding_answers, completed_modules, current_module, enrolled_at, institution_enrollment_id
3. **activity_responses** — UNIQUE (enrollment_id, activity_id) enforces CONT-04 forward-only rule
4. **work_submissions** — review_scores/review_status have no user UPDATE policy; only service role can write review fields
5. **certificates** — UNIQUE on enrollment_id prevents duplicates; public read policy for verification endpoint

RLS: 5 tables enabled, 7 policies. All `auth.uid()` calls wrapped in `(select auth.uid())` for ~95% query plan improvement per CLAUDE.md pattern.

Indexes: 8 total — covering all foreign keys and RLS policy columns.

### TypeScript Types (`src/types/course.ts`)

Exports: `CourseEnrollment`, `ActivityResponse`, `WorkSubmission`, `Certificate`, `InstitutionEnrollment`, `OnboardingAnswers`, `ReviewScores`, `LearnerRole`, `ReviewStatus`. All properties readonly. Columns correspond 1:1 to migration file.

### Supabase Client (`src/lib/supabase/client.ts`)

Replaces throwing stub with three factory functions:
- `createBrowserClient()` — uses `@supabase/ssr` for Client Components
- `createServerClient(cookieStore)` — uses `@supabase/ssr` for Server Components and Route Handlers; cookie set/delete errors silently ignored (expected in Server Components)
- `createServiceRoleClient()` — uses `@supabase/supabase-js` directly with service role key; auth.autoRefreshToken and persistSession both false

`isSupabaseConfigured()` check preserved from stub.

## Threat Model Coverage

All 5 STRIDE threats from the plan's threat register are mitigated in the migration:

| Threat | Mitigation Applied |
|--------|-------------------|
| T-01-01: Spoofing on activity_responses | RLS policy validates enrollment ownership via auth.uid() join |
| T-01-02: Tampering on work_submissions | No user UPDATE policy on review fields — service role only |
| T-01-03: Info Disclosure on certificates | Accepted — intentionally public (no PII beyond holder_name) |
| T-01-04: Privilege Escalation on course_enrollments | user_id set by service role; user UPDATE WITH CHECK does not include user_id |
| T-01-05: DoS on institution_enrollments | No user-facing RLS — all access through validated server-side service role |

## Deviations from Plan

**1. [Rule 2 - Missing Critical Functionality] Idempotent ALTER TABLE blocks**
- **Found during:** Task 1
- **Issue:** The plan specified using ALTER TABLE to add new columns to course_enrollments (which may already exist from the prototype phase). A bare ALTER TABLE ADD COLUMN would fail on a fresh environment where the table was just created with IF NOT EXISTS. Added DO $$ BEGIN / END $$ blocks with information_schema checks to make each ADD COLUMN idempotent — safe for both fresh Supabase projects and existing ones with the prototype-era table.
- **Files modified:** supabase/migrations/00001_course_tables.sql
- **Commit:** 5336994

**2. [Rule 3 - Blocking Issue] @supabase/ssr not installed**
- **Found during:** Task 2
- **Issue:** package.json had no Supabase dependencies; client implementation requires @supabase/ssr and @supabase/supabase-js.
- **Fix:** Installed @supabase/ssr@0.10.2 and @supabase/supabase-js@2.103.2 via npm install.
- **Files modified:** package.json, package-lock.json
- **Commit:** a57cb18

## Known Stubs

None. All exported interfaces are fully typed. The Supabase client throws with a helpful error message when env vars are absent — this is intentional (not a stub).

## Threat Flags

None. No new network endpoints, auth paths, or file access patterns introduced beyond what the plan's threat model covers.

## Self-Check: PASSED

Files verified:
- FOUND: supabase/migrations/00001_course_tables.sql
- FOUND: src/types/course.ts
- FOUND: src/lib/supabase/client.ts

Commits verified:
- FOUND: 5336994
- FOUND: a57cb18
