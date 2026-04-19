---
phase: 09-post-uat-polish-bundle
plan: "01"
subsystem: course-platform
tags: [migration, bug-fix, docs, pdf-fonts, certificate]
dependency_graph:
  requires:
    - supabase/migrations/00004_security_hardening.sql  # set_updated_at() function reused
    - src/lib/pdf/CertificateDocument.tsx
    - src/app/courses/aibi-p/page.tsx
    - src/app/courses/aibi-s/page.tsx
  provides:
    - course_enrollments.updated_at column + trigger
    - Safe Start Course URL (Math.max guard)
    - Accurate ROADMAP Phase 6 SC #4 language
    - Cormorant + DM Mono brand fonts in Certificate PDF
  affects:
    - Any code reading course_enrollments.updated_at
    - /courses/aibi-p and /courses/aibi-s overview pages
    - Certificate PDF output (typography now matches brand spec)
tech_stack:
  added:
    - public/fonts/Cormorant-Regular.ttf
    - public/fonts/Cormorant-Bold.ttf
    - public/fonts/Cormorant-Italic.ttf
  patterns:
    - Font.register at module scope (react-pdf safe pattern for Next.js serverless)
    - Math.max(1, value ?? 1) guard for URL-bound numeric values
key_files:
  created:
    - supabase/migrations/00006_course_enrollments_updated_at.sql  # Task 1 (orchestrator)
    - public/fonts/Cormorant-Regular.ttf
    - public/fonts/Cormorant-Bold.ttf
    - public/fonts/Cormorant-Italic.ttf
  modified:
    - src/app/courses/aibi-p/page.tsx
    - src/app/courses/aibi-s/page.tsx
    - src/lib/pdf/CertificateDocument.tsx
    - .planning/ROADMAP.md
decisions:
  - "Task 3 Option A taken (auto-selected via --auto chain mode): ROADMAP updated to three-step iteration flow, no IterationTrackerData.ts code changes"
  - "Cormorant static TTFs downloaded from Google Fonts gstatic CDN (not variable fonts) for maximum react-pdf compatibility"
  - "DMMono-Regular.ttf was pre-existing in public/fonts/ — not re-downloaded"
metrics:
  duration: "~20 minutes (Tasks 2-4 by this agent)"
  completed: "2026-04-19"
  tasks_completed: 4
  files_modified: 4
  files_created: 4
---

# Phase 09 Plan 01: Post-UAT Polish Bundle Summary

Four small UAT findings from Phases 04/05/06/08 closed in a single tightly-scoped plan. Cormorant + DM Mono brand fonts now embedded in the Certificate PDF; Start Course link guarded against the current_module=0 edge case; ROADMAP language reconciled with the shipped three-step IterationTracker; updated_at column and trigger added to course_enrollments.

## One-liner

Post-UAT cleanup: Math.max guard on course links, Cormorant/DM Mono fonts in Certificate PDF, ROADMAP spec aligned to shipped three-step IterationTracker, course_enrollments updated_at trigger added.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add updated_at column + trigger to course_enrollments | 123adf9 | supabase/migrations/00006_course_enrollments_updated_at.sql |
| 2 | Guard Start Course link against current_module=0 | e2757ed | src/app/courses/aibi-p/page.tsx, src/app/courses/aibi-s/page.tsx |
| 3 | Resolve IterationTracker spec/UX mismatch (Option A) | 36570b2 | .planning/ROADMAP.md |
| 4 | Register Cormorant + DM Mono fonts in Certificate PDF | 0f0b76e | src/lib/pdf/CertificateDocument.tsx, public/fonts/Cormorant-*.ttf |

## Execution Notes

**Task 1** was applied by the orchestrator before this agent was spawned (see commit `123adf9`). The migration was applied to the live Supabase project via `mcp__supabase__apply_migration` and committed. This agent reset the worktree to that commit as its base before executing Tasks 2, 3, and 4.

**Task 3**: Auto-selected Option A per `--auto` chain mode. The ROADMAP Phase 6 SC #4 previously read "four iterations with the one-change rule." The shipped IterationTracker has exactly three steps: Stress Test → Diagnose → Revise. The spec language was updated to match reality. Zero code changes.

## Deviations from Plan

**1. [Rule 3 - Blocking] Worktree base mismatch resolved**
- **Found during:** Pre-execution worktree check
- **Issue:** The worktree HEAD was at `ecfcf75` (a `feature/coming-soon` merge); commit `123adf9` (orchestrator Task 1) was a child of that commit but not yet in the worktree. Migration file was absent.
- **Fix:** `git reset --hard 123adf9` to advance worktree to the correct base before starting Task 2.
- **Files modified:** None (git state only)
- **Commit:** N/A

**2. [Rule 2 - Missing file] Cormorant static TTFs downloaded from gstatic**
- **Found during:** Task 4
- **Issue:** Plan called for downloading Cormorant-Regular/Bold/Italic TTFs to `public/fonts/`, but the directory already had only the variable font variants (`Cormorant-Variable.ttf`, `Cormorant-Italic-Variable.ttf`). Variable fonts can be unreliable with react-pdf.
- **Fix:** Downloaded static TTFs from Google Fonts gstatic CDN (resolving actual URLs via the Google Fonts CSS API). DMMono-Regular.ttf was already present and valid.
- **Files added:** Cormorant-Regular.ttf (177 KB), Cormorant-Bold.ttf (177 KB), Cormorant-Italic.ttf (176 KB)
- **Commit:** 0f0b76e

## Decisions Made

1. **Option A for Task 3**: Update ROADMAP spec to match shipped three-step UX. Zero code changes. Rationale: the three steps (Stress Test → Diagnose → Revise) constitute a complete iteration; "four iterations" in the original spec referred to attempts, not steps.
2. **Static TTFs over variable fonts**: react-pdf's font engine has known issues with variable font axes. Static per-weight files are the safe path.

## Known Stubs

None — this plan closes rough edges rather than introducing new features.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes at trust boundaries introduced. The migration adds a column to an existing table with an existing trigger function; no new RLS surface.

## Verification

### Task 1 (orchestrator-applied)
- `updated_at` column exists on `course_enrollments` with `NOT NULL` constraint and `now()` default
- Trigger `set_course_enrollments_updated_at` fires BEFORE UPDATE, reusing `public.set_updated_at()`
- Existing rows backfilled to `created_at`

### Task 2
- `Math.max(1, enrollment?.current_module ?? 1)` in both course overview pages
- A learner with `current_module=0` will be directed to module 1, not a 404

### Task 3
- ROADMAP.md Phase 6 SC #4 now reads: "Activity 8.1 guides the learner through a three-step iteration flow (Stress Test → Diagnose → Revise) that applies the one-change rule per revise; the final iterated skill saves as a new .md file"
- No changes to `IterationTrackerData.ts` or any component

### Task 4
- `Font.register` called at module scope with three Cormorant variants and DM Mono
- All `Helvetica-Bold`, `Helvetica-Oblique`, `Helvetica-BoldOblique`, `Helvetica`, and `Courier` references replaced
- Comment block updated — no "proxy" wording remains
- Four TTF files are valid TrueType fonts (verified with `file` command)

## Self-Check: PASSED

Files exist:
- FOUND: supabase/migrations/00006_course_enrollments_updated_at.sql
- FOUND: public/fonts/Cormorant-Regular.ttf
- FOUND: public/fonts/Cormorant-Bold.ttf
- FOUND: public/fonts/Cormorant-Italic.ttf
- FOUND: public/fonts/DMMono-Regular.ttf
- FOUND: src/lib/pdf/CertificateDocument.tsx (modified)
- FOUND: src/app/courses/aibi-p/page.tsx (modified)
- FOUND: src/app/courses/aibi-s/page.tsx (modified)

Commits exist:
- FOUND: 123adf9 (Task 1 — orchestrator)
- FOUND: e2757ed (Task 2)
- FOUND: 36570b2 (Task 3)
- FOUND: 0f0b76e (Task 4)
