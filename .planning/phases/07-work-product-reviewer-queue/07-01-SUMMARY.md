---
phase: 07-work-product-reviewer-queue
plan: 01
subsystem: course/submission
tags: [work-product, file-upload, supabase-storage, presigned-url, certification-gate]
dependency_graph:
  requires: [course_enrollments, work_submissions, activity_responses, Supabase Storage bucket 'work-products']
  provides: [/courses/aibi-p/submit page, /api/courses/submit-work-product route, Supabase Storage upload helper]
  affects: [AiBI-P certification flow, reviewer queue (Phase 7 plans)]
tech_stack:
  added: [Supabase Storage presigned upload URLs (createSignedUploadUrl)]
  patterns: [presign-then-direct-upload, service-role-write, enrollment-ownership-check, forward-only-status-transitions]
key_files:
  created:
    - src/lib/supabase/storage.ts
    - src/app/courses/aibi-p/submit/page.tsx
    - src/app/courses/aibi-p/_components/WorkProductForm.tsx
    - src/app/api/courses/submit-work-product/route.ts
  modified: []
decisions:
  - "Presigned upload pattern: API generates signed URL, client PUTs file directly to Supabase Storage — avoids Vercel 4.5MB body limit"
  - "skillFileUrl stored as Supabase Storage path (not full URL) for bucket-scoped validation"
  - "Confirmation email deferred — TODO comment added at both POST response points per CLAUDE.md decisions"
metrics:
  duration: "~45 minutes"
  completed: "2026-04-16T17:42:00Z"
  tasks_completed: 2
  files_created: 4
---

# Phase 7 Plan 1: Work Product Submission Form — Summary

Work product submission form at /courses/aibi-p/submit with presigned file upload to Supabase Storage, four-item completeness enforcement, and status-aware page rendering for the AiBI-P certification gate.

## What Was Built

### Task 1: Storage helper + submission page + form component

**`src/lib/supabase/storage.ts`**

Supabase Storage helper with three exports:
- `WORK_PRODUCT_BUCKET = 'work-products'` constant
- `getPresignedUploadUrl(enrollmentId, filename)` — calls `createSignedUploadUrl` via service role client; sanitizes filename to prevent path traversal; returns `{ signedUrl, path }`
- `getPublicUrl(path)` — returns public URL for a stored file
- `isValidStoragePath(path, enrollmentId)` — validates path starts with `${enrollmentId}/` prefix (T-07-02)

**`src/app/courses/aibi-p/submit/page.tsx`**

Server component with three access gates:
1. Not enrolled → redirect to `/courses/aibi-p/purchase`
2. Enrolled but modules 1-9 not all complete → "Complete all nine modules" message
3. Enrolled + modules complete → fetch latest `work_submissions` row and branch:
   - `pending` or `resubmitted` → "Under review" message with submitted_at date
   - `approved` → "Approved" message with certificate link
   - `failed` (no prior resubmission counted here) → `WorkProductForm` in resubmission mode
   - No submission → `WorkProductForm` in initial mode

Terra-colored header band matches module page pattern.

**`src/app/courses/aibi-p/_components/WorkProductForm.tsx`**

Client component with four required fields:
- File upload (.md/.txt): on select → POST `?action=presign` → PUT to signed URL → stores path
- Input text (redacted) — 50 char minimum
- Raw AI output — 50 char minimum
- Edited output + annotation — 100 char minimum
- Annotation (separate field) — 50 char minimum

Features: upload progress states (uploading/uploaded/error), submit button disabled until all valid, resubmission feedback banner (cobalt border, parch background), success region with focus management for A11Y, all fields with `aria-describedby` error linkage.

### Task 2: API route

**`src/app/api/courses/submit-work-product/route.ts`**

Two modes via `?action` query param:

**`?action=presign`:**
- Auth → enrollment ownership check → 9 modules complete check → generate presigned URL
- File extension validated (.md/.txt only)
- Returns `{ signedUrl, path }`

**Default (submit):**
- Auth → enrollment ownership check → 9 modules complete check
- Server-side validation: skillFileUrl path-scoped to enrollment, all text minimums
- Existing submission checks: 409 for pending/resubmitted/approved
- Resubmission path: updates failed row to 'resubmitted' (T-07-06, only once)
- New submission: insert with `review_status = 'pending'`
- Returns 201 `{ message, submissionId }`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

**Confirmation email not wired** — `TODO: send confirmation email when ConvertKit/Loops is wired` comments at both POST response paths in `route.ts` (line ~270 and ~292). This is intentional per CLAUDE.md decisions: "Third-party integrations deferred for prototype phase." Email confirmation will be added when ConvertKit or Loops account is created.

## Threat Surface

All STRIDE mitigations from the plan's threat model are implemented:
- T-07-01: `getUser()` auth + `enrollment.user_id === user.id` ownership check before any operation
- T-07-02: `isValidStoragePath()` validates skillFileUrl starts with `${enrollmentId}/`; file extension restricted to .md/.txt
- T-07-04: Generic 403 "Enrollment not found or access denied" — does not leak existence
- T-07-05: Presigned URL gated behind auth + enrollment + module completion checks
- T-07-06: Status transition validated — only `failed` → `resubmitted`; 409 returned for all other resubmission attempts

## Prerequisite (Not Automated)

The `work-products` Supabase Storage bucket must be created manually in the Supabase Dashboard (or via a migration) before file uploads will work. Set access to **private**. This is documented as a comment in `storage.ts`.

## Self-Check: PASSED

- `src/lib/supabase/storage.ts` — FOUND
- `src/app/courses/aibi-p/submit/page.tsx` — FOUND
- `src/app/courses/aibi-p/_components/WorkProductForm.tsx` — FOUND
- `src/app/api/courses/submit-work-product/route.ts` — FOUND
- Task 1 commit `00e3537` — FOUND
- Task 2 commit `73ab1e7` — FOUND
- `npx tsc --noEmit` — PASSED (zero errors)
