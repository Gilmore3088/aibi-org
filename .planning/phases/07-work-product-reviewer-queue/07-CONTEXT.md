# Phase 7: Work Product + Reviewer Queue - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode)

<domain>
## Phase Boundary

Build the assessed work product submission form (4-item package with file upload) and the reviewer dashboard with 5-dimension rubric scoring. The Accuracy hard gate (score of 1 = auto-fail) must be enforced server-side. Failed submissions get written feedback and one resubmission. This is the gate between course completion and certification.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion. Key constraints:

**Work Product Submission (WORK-01 through WORK-05):**
- 4-item package: (1) skill .md file upload, (2) input text (redacted), (3) raw AI output, (4) final edited output + 4-6 sentence annotation
- File uploads use Supabase presigned URLs — client uploads directly to Supabase Storage, NOT through Vercel API (4.5MB limit)
- All 4 items required before submission
- Submission form at /courses/aibi-p/submit (referenced by M9 CompletionCTA)
- Completion email on submission with confirmation and review timeline

**Reviewer Queue (REVW-01 through REVW-08):**
- Dashboard at /admin/reviewer/ showing submissions ordered by date
- 5-dimension rubric: Accuracy, Completeness, Tone and Voice, Judgment, Skill Quality (1-4 each)
- Accuracy hard gate: score of 1 = auto-fail regardless of total (server-side enforced)
- Passing: total >= 14 AND Accuracy >= 3
- On fail: written feedback identifying dimensions + actionable guidance
- One resubmission permitted; resubmissions appear at top of queue
- Reviewer approval triggers certificate flow (Phase 8)
- Reviewer identity: for now use REVIEWER_EMAILS env var allowlist (simplest; Supabase table deferred)

**DB: work_submissions table already exists (Phase 1) with all needed columns**

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- work_submissions table (Phase 1) — all columns in place
- Supabase client with createServiceRoleClient and createServerClient
- Course enrollment/auth patterns from Phases 3-4
- ActivitySection and CompletionCTA already point to /courses/aibi-p/submit

### Integration Points
- New page: /courses/aibi-p/submit (work product submission form)
- New page: /admin/reviewer/ (reviewer dashboard)
- New API: /api/courses/submit-work-product (handles submission)
- New API: /api/courses/review-submission (handles reviewer scoring)
- Supabase Storage bucket for file uploads (needs creation)

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond PRD. Refer to ROADMAP success criteria.

</specifics>

<deferred>
## Deferred Ideas

- Reviewer calibration system (anchor submissions) — operational process, not code
- Accredible integration — Phase 8

</deferred>
