---
phase: "07-work-product-reviewer-queue"
verified: 2026-04-18
status: blocked_external
auditor: claude
note: "All code complete; review pipeline requires REVIEWER_EMAILS env var + Supabase Storage 'work-products' bucket created + ConvertKit/Loops for confirmation email (deferred). Storage RLS policies have been added since."
---

# Phase 7: Work Product + Reviewer Queue — Verification Report (Retroactive)

**Phase Goal:** Learners submit their 4-item work product package via direct Supabase Storage upload, reviewers score submissions against the 5-dimension rubric with the Accuracy hard gate enforced server-side, and failed submissions receive written feedback with one resubmission permitted.
**Verified:** 2026-04-18 (retroactive audit; code shipped 2026-04-16 across 2 plans)
**Status:** blocked_external — code is complete and TypeScript-clean; requires REVIEWER_EMAILS env var, creation of the `work-products` Supabase Storage bucket with RLS, and (deferred) ConvertKit/Loops for confirmation email before the pipeline can run end-to-end in production.

## Scope

From `07-CONTEXT.md`: build the assessed work product submission form (4-item package with file upload) and the reviewer dashboard with 5-dimension rubric scoring. The Accuracy hard gate (score of 1 = auto-fail) must be enforced server-side. Failed submissions get written feedback and one resubmission. This is the gate between course completion and certification.

## Success Criteria — Pass/Fail

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | A learner can upload their skill .md file directly to Supabase Storage (not through a Vercel function) and submit text fields for input, raw output, edited output, and annotation — form cannot be submitted with any of the four items missing | CODE PASS · BLOCKED EXTERNAL | `src/lib/supabase/storage.ts` implements `getPresignedUploadUrl` via `createSignedUploadUrl`; `WorkProductForm.tsx` PUTs file directly to signed URL (bypasses Vercel 4.5MB limit). API validates all 4 fields with min-char rules (50/50/100/50). Bucket must be manually created in Supabase Dashboard. |
| 2 | A reviewer accessing `/admin/reviewer/` sees the submission queue ordered by date; selecting a submission shows the 5-dimension rubric with 1-4 radio buttons per dimension | CODE PASS · BLOCKED EXTERNAL | `src/app/admin/reviewer/page.tsx` queries pending+resubmitted ordered by `submitted_at ASC`, resubmissions sorted to top. `[id]/page.tsx` renders the 4 submission items + `RubricForm`. Requires `REVIEWER_EMAILS` env var to access; otherwise `verifyReviewer()` returns false and layout redirects to `/`. |
| 3 | A submission with a score of 1 on Accuracy is automatically failed regardless of total score — this check happens server-side before any status update | PASS | `src/app/api/courses/review-submission/route.ts` — server-side check `scores.accuracy === 1 → result = 'failed'` before DB update. Hard gate is enforced in the API, not the client. |
| 4 | A passing submission (score >= 14, Accuracy >= 3) transitions the enrollment to `approved` status; a failing submission sends the learner written feedback and opens the resubmission path | CODE PASS · BLOCKED EXTERNAL (email) | Pass condition: `total >= 14 && accuracy >= 3` → `'approved'` (REVW-04). Fail path: `review_feedback` required (>=100 chars) before status write. `work_submissions.review_status` updated via service role. Email delivery to learner is deferred — `TODO: send confirmation email when ConvertKit/Loops is wired` comments in `submit-work-product/route.ts`. |
| 5 | A learner who failed receives actionable written feedback identifying specific dimensions and can resubmit exactly once; their resubmission appears at the top of the reviewer queue | CODE PASS · BLOCKED EXTERNAL (email) | `RubricForm` enforces feedback >= 100 chars when failing. Resubmission path: `submit-work-product` only allows `failed → resubmitted` transition (T-07-06); any other state returns 409. Queue sort elevates `resubmitted` above `pending`. Learner notification email deferred. |

**Score (code facts):** 5/5 code paths implemented.
**Score (live verification):** 0/5 fully testable without the Supabase bucket + reviewer allowlist + email service.

## Required Artifacts

| Artifact | Plan | Status | Details |
|----------|------|--------|---------|
| `src/lib/supabase/storage.ts` | 07-01 | VERIFIED | `WORK_PRODUCT_BUCKET`, `getPresignedUploadUrl`, `getPublicUrl`, `isValidStoragePath` |
| `src/app/courses/aibi-p/submit/page.tsx` | 07-01 | VERIFIED | Server component with 3 access gates; status-aware branching (pending/approved/failed) |
| `src/app/courses/aibi-p/_components/WorkProductForm.tsx` | 07-01 | VERIFIED | 4 required fields + file upload with presigned-URL PUT |
| `src/app/api/courses/submit-work-product/route.ts` | 07-01 | VERIFIED | `?action=presign` and default submit modes; 9-module completion check; extension allowlist (.md/.txt) |
| `src/lib/auth/reviewerAuth.ts` | 07-02 | VERIFIED | `verifyReviewer()` against `REVIEWER_EMAILS` env var (comma-separated allowlist) |
| `src/app/admin/reviewer/layout.tsx` | 07-02 | VERIFIED | Non-reviewers redirected to `/`; admin shell |
| `src/app/admin/reviewer/page.tsx` | 07-02 | VERIFIED | Queue with resubmissions sorted to top |
| `src/app/admin/reviewer/[id]/page.tsx` | 07-02 | VERIFIED | Submission detail with RubricForm; shows prior feedback on resubmissions |
| `src/app/admin/reviewer/_components/SubmissionQueue.tsx` | 07-02 | VERIFIED | Terra left-border on resubmitted rows |
| `src/app/admin/reviewer/_components/RubricForm.tsx` | 07-02 | VERIFIED | 5 fieldsets; live score total; Accuracy=1 alert; feedback required when failing |
| `src/app/api/courses/review-submission/route.ts` | 07-02 | VERIFIED | Server-side Accuracy hard gate; `triggerCertificate` flag in response (Phase 8 signal) |

## Key Link Verification

| From | To | Status | Details |
|------|----|--------|---------|
| `WorkProductForm` | `/api/courses/submit-work-product?action=presign` | WIRED | Client requests signed URL on file select |
| `WorkProductForm` | Supabase Storage signed URL | WIRED | Direct PUT from client to bucket (T-07-02: path validated) |
| `WorkProductForm` | `/api/courses/submit-work-product` | WIRED | POST default action submits all 4 items |
| `submit-work-product/route.ts` | `work_submissions` | WIRED | INSERT for new, UPDATE for `failed → resubmitted` |
| `admin/reviewer/page.tsx` | `work_submissions` join `course_enrollments` | WIRED | Service role query; array-typed join handled correctly per 07-02 deviation |
| `RubricForm` | `/api/courses/review-submission` | WIRED | POST with 5 scores + feedback |
| `review-submission/route.ts` | `verifyReviewer` | WIRED | 403 for non-reviewers |
| `review-submission/route.ts` → Phase 8 certificate | PARTIAL | `triggerCertificate: true` flag returned in response for Phase 8 to consume; no action taken in this phase (by design per REVW-08) |

## Gaps

Minor items, not blockers for code correctness:

- **Confirmation email on submission (WORK-05).** Explicit TODO comments at both POST response points in `submit-work-product/route.ts`. Acceptable per CLAUDE.md decisions log: "Third-party integrations deferred for prototype phase." Will be wired when ConvertKit or Loops account exists.
- **Learner feedback email on fail.** Same situation as WORK-05 — relies on an email service. Feedback is stored in `work_submissions.review_feedback` and can be surfaced on the learner's submit page, which already renders the resubmission banner with prior feedback (see `WorkProductForm` resubmission mode).
- **`getPublicUrl` vs signed URLs for reviewer skill-file view.** 07-02 decision notes the private bucket may require signed URLs in Phase 8. If the bucket is set to private (as recommended), reviewer detail page links using `getPublicUrl` will 403. Verify behaviour once the bucket is created; switch to signed URLs if needed.

## External Blockers

None code-side. Operational items required before the Phase 7 pipeline runs:

| Item | Owner | Status |
|------|-------|--------|
| Create Supabase Storage bucket `work-products` (private) | User | NOT DONE (documented in storage.ts comment) |
| Add RLS policies to `work-products` bucket | User | DONE (per recent commit `chore(education): clean up stale links, delete HeroSplit, add storage policies`) |
| Set `REVIEWER_EMAILS` env var in Vercel production (comma-separated allowlist) | User | NOT SET |
| Choose email service (ConvertKit or Loops) and wire confirmation email | User | DEFERRED per CLAUDE.md decisions log |

Until the bucket is created and `REVIEWER_EMAILS` is set, the submission flow cannot complete in production: file uploads will fail with a Storage error, and `/admin/reviewer/` redirects all visitors to `/`.

## Anti-Patterns Found

None. Auth + ownership enforcement on every endpoint. Accuracy hard gate enforced server-side (cannot be bypassed by modifying the client). Path-traversal protection in `isValidStoragePath`. Status transitions validated server-side (T-07-06). REVIEWER_EMAILS allowlist is a simple approach acknowledged in plan — upgrades to a DB-backed reviewer table are listed in deferred ideas.

## Recommendation

**external-unblock + human verification.** Operationally:

1. Create the `work-products` bucket as private in the Supabase Dashboard.
2. Set `REVIEWER_EMAILS` in Vercel production.
3. Verify bucket RLS policies allow signed upload URLs scoped to `${enrollmentId}/` prefix.
4. Switch `getPublicUrl` reviewer link to `createSignedUrl` if bucket is private (Phase 8 touchpoint flagged in 07-02 decisions).

Then human verification:

1. As a learner, complete 9 modules; visit `/courses/aibi-p/submit`; upload a .md file; submit all 4 items; confirm `work_submissions.review_status = 'pending'` with correct bucket path.
2. As a reviewer (email in `REVIEWER_EMAILS`), visit `/admin/reviewer/`; open the submission; score 5 dimensions with Accuracy = 1 and total = 20; confirm submission fails despite high total (REVW-03).
3. As a learner, return to `/courses/aibi-p/submit`; confirm resubmission banner with prior feedback; resubmit; confirm `review_status = 'resubmitted'` and row appears at top of reviewer queue.
4. Attempt a second resubmission after re-fail; confirm 409 response (one-resubmission rule, REVW-06).
5. Wire ConvertKit or Loops; un-stub the TODO email comments in `submit-work-product/route.ts`.

Code is complete; the above checkpoint closes Phase 7.

---
*Verified (retroactive): 2026-04-18*
*Verifier: Claude (gsd-verifier)*
