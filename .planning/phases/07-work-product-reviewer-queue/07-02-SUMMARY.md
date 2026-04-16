---
phase: 07-work-product-reviewer-queue
plan: 02
subsystem: reviewer-dashboard
tags: [reviewer, rubric, auth, admin, api]
dependency_graph:
  requires: [07-01]
  provides: [reviewer-dashboard, review-submission-api, reviewer-auth]
  affects: [work_submissions-table, /admin/reviewer-route]
tech_stack:
  added: []
  patterns:
    - REVIEWER_EMAILS env var allowlist for reviewer identity
    - Service role client for cross-user DB operations in reviewer context
    - Supabase join returns array for to-one FK relations (Array<{...}> not object)
    - Accuracy hard gate checked server-side before any status update
key_files:
  created:
    - src/lib/auth/reviewerAuth.ts
    - src/app/admin/reviewer/layout.tsx
    - src/app/admin/reviewer/page.tsx
    - src/app/admin/reviewer/[id]/page.tsx
    - src/app/admin/reviewer/_components/SubmissionQueue.tsx
    - src/app/admin/reviewer/_components/RubricForm.tsx
    - src/app/api/courses/review-submission/route.ts
  modified: []
decisions:
  - Supabase join type is Array not object — course_enrollments returned as array even for to-one FK
  - console.log for REVW-08 certificate trigger removed per CLAUDE.md; triggerCertificate flag in response serves as Phase 8 signal instead
  - getPublicUrl used for skill file download link with note that Phase 8 may need signed URLs for private bucket
metrics:
  duration_minutes: 45
  completed_date: "2026-04-16"
  tasks_completed: 3
  tasks_total: 3
  files_created: 7
  files_modified: 0
---

# Phase 07 Plan 02: Reviewer Dashboard and Review Submission API Summary

Reviewer dashboard at `/admin/reviewer/` with 5-dimension rubric scoring, REVIEWER_EMAILS env var auth gate, and server-side Accuracy hard gate (score 1 = auto-fail regardless of total).

## What Was Built

### Reviewer Auth (`src/lib/auth/reviewerAuth.ts`)

`verifyReviewer()` reads the authenticated user's email, lowercases it, and checks it against a `Set<string>` parsed from the `REVIEWER_EMAILS` environment variable (comma-separated). Returns `{ isReviewer, userId, email }`. Gracefully returns `isReviewer: false` when Supabase is not configured (local dev without env vars).

### Reviewer Layout (`src/app/admin/reviewer/layout.tsx`)

Server component wrapping all `/admin/reviewer/` routes. Calls `verifyReviewer()` and immediately `redirect('/')` for non-reviewers. Renders a minimal admin shell: "The AI Banking Institute" subtitle + "Reviewer Dashboard" heading in Cormorant serif, max-w-6xl centered.

### Queue Page (`src/app/admin/reviewer/page.tsx`)

Server component. Queries `work_submissions` with `review_status IN ('pending', 'resubmitted')`, ordered by `submitted_at ASC`, then sorts in JS to place resubmissions before pending. Shows a count of already-reviewed submissions (approved + failed) as a summary line. Passes sorted rows to `SubmissionQueue`.

### SubmissionQueue (`src/app/admin/reviewer/_components/SubmissionQueue.tsx`)

Server component table with Status badge, Learner email, Submitted date (DM Mono), and Review link. Resubmitted rows get a terra left-border (`border-l-2`, `borderLeftColor: var(--color-terra)`). Empty state: "No submissions awaiting review."

### Detail Page (`src/app/admin/reviewer/[id]/page.tsx`)

Server component. Fetches submission by ID using service role client (bypasses RLS). Shows all 4 submission items in scrollable `<pre>` blocks with parch background. Shows prior review feedback in a blue info box for resubmissions. Renders `RubricForm` only for pending/resubmitted submissions; shows an already-reviewed message otherwise.

### RubricForm (`src/app/admin/reviewer/_components/RubricForm.tsx`)

Client component. Five dimension fieldsets with `role="radiogroup"` and `aria-labelledby`. Each dimension has four styled radio labels (1–4) with descriptive text. Live score total shown with passing/failing color (sage green / error red). Accuracy=1 triggers a `role="alert"` warning banner. Feedback textarea required when failing (total < 14 OR accuracy < 3), with character counter (min 100). Submit button disabled until all 5 dimensions scored and requirements met. On success: shows result card and redirects to queue after 2 seconds.

### Review Submission API (`src/app/api/courses/review-submission/route.ts`)

POST endpoint. Auth flow: get user via anon client, then `verifyReviewer()` — 403 if not a reviewer. Validates all 5 scores as integers 1–4 via `parseScores()`. Loads submission; returns 409 if already reviewed. Scoring:
- `total = sum of 5 scores`
- Accuracy hard gate: `scores.accuracy === 1` → always `'failed'` (REVW-03)
- Pass threshold: `total >= 14 AND accuracy >= 3` → `'approved'` (REVW-04)
- Failing without feedback >= 100 chars → 400
- `resubmissionExhausted = result === 'failed' && wasResubmission` (REVW-06)

Writes `review_scores`, `review_feedback`, `review_status`, `reviewer_id`, `reviewed_at` via service role. Returns `{ result, total, accuracyGateFailed, triggerCertificate, resubmissionExhausted }`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Supabase join returns array not object for course_enrollments**
- **Found during:** TypeScript check after Task 1
- **Issue:** `course_enrollments` from a Supabase FK join is typed as `Array<{...}>` by the TS client, not `{ email: string } | null`. TypeScript error TS2352 on both page.tsx and queue page.
- **Fix:** Updated `SubmissionRow.course_enrollments` and `SubmissionWithEmail.course_enrollments` to `Array<{ email: string }> | null`; updated all access from `?.email` to `?.[0]?.email`
- **Files modified:** `page.tsx`, `[id]/page.tsx`, `SubmissionQueue.tsx`
- **Commit:** `da7e5e0`

**2. [Rule 2 - Missing] Removed console.log per CLAUDE.md coding style**
- **Found during:** Task 2 review
- **Issue:** Plan spec said to `console.log("Certificate issuance triggered for enrollment...")` for REVW-08. CLAUDE.md rule: "Remove console.log statements before committing."
- **Fix:** Removed console.log; the `triggerCertificate: true` field in the API response serves as the Phase 8 signal. Enrollment ID is in the response body for Phase 8 to consume.
- **Files modified:** `route.ts`

## Task 3 Checkpoint

Auto-approved (autonomous mode). Full end-to-end workflow verification (12-step checklist) deferred to user testing with live Supabase environment once `REVIEWER_EMAILS` is configured.

## Known Stubs

None — all data flows are wired. The `triggerCertificate` flag in the review API response is intentionally a stub for Phase 8 certificate issuance; it returns `true` but takes no action. This is by design per REVW-08.

## Threat Surface Scan

All new surface is covered by the plan's threat model (T-07-07 through T-07-12). No additional surface introduced beyond the planned `/admin/reviewer/` routes and `/api/courses/review-submission` endpoint.

## Self-Check

All 7 files confirmed present. All 3 commits confirmed in git log.

## Self-Check: PASSED

| File | Status |
|------|--------|
| `src/lib/auth/reviewerAuth.ts` | FOUND |
| `src/app/admin/reviewer/layout.tsx` | FOUND |
| `src/app/admin/reviewer/page.tsx` | FOUND |
| `src/app/admin/reviewer/[id]/page.tsx` | FOUND |
| `src/app/admin/reviewer/_components/SubmissionQueue.tsx` | FOUND |
| `src/app/admin/reviewer/_components/RubricForm.tsx` | FOUND |
| `src/app/api/courses/review-submission/route.ts` | FOUND |
| Commit `6371580` | FOUND |
| Commit `271cb2d` | FOUND |
| Commit `da7e5e0` | FOUND |
| `npx tsc --noEmit` | PASSED — zero errors |
