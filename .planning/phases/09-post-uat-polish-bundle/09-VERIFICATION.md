---
phase: 09-post-uat-polish-bundle
verified: 2026-04-18T19:00:00Z
status: gaps_found
score: 5/6 must-haves verified
overrides_applied: 0
gaps:
  - truth: "IterationTracker ships as 3 steps and ROADMAP language reflects that (Option A was taken)"
    status: failed
    reason: "Commit 36570b2 correctly updated Phase 6 SC #4 to 'three-step iteration flow' but the subsequent orchestrator commit 41b6af5 used the same pre-change base index (5437b98) and silently reverted the text change while only preserving the checkbox. HEAD now reads 'four iterations with the one-change rule' — the old language."
    artifacts:
      - path: ".planning/ROADMAP.md"
        issue: "Line 117 still reads 'Activity 8.1 guides the learner through four iterations with the one-change rule' — should read 'through a three-step iteration flow (Stress Test → Diagnose → Revise) that applies the one-change rule per revise'"
    missing:
      - "Re-apply the SC #4 text change from commit 36570b2 to current HEAD: replace 'four iterations with the one-change rule' with 'a three-step iteration flow (Stress Test → Diagnose → Revise) that applies the one-change rule per revise'"
---

# Phase 09: Post-UAT Polish Bundle Verification Report

**Phase Goal:** Four small findings from Phase 04/05/06/08 UAT that don't block the milestone but deserve cleanup are resolved
**Verified:** 2026-04-18T19:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | course_enrollments has an updated_at column with a trigger that auto-updates on row UPDATE | VERIFIED | Migration 00006 adds column + `CREATE TRIGGER set_course_enrollments_updated_at BEFORE UPDATE … EXECUTE FUNCTION public.set_updated_at()`. Commit 123adf9 confirms applied to production. |
| 2 | All existing course_enrollments rows have updated_at populated (backfilled to created_at) | VERIFIED | Migration contains `UPDATE course_enrollments SET updated_at = created_at WHERE updated_at IS NULL` followed by `ALTER COLUMN updated_at SET NOT NULL`. |
| 3 | Start Course link never produces /courses/aibi-p/0 even when current_module=0 | VERIFIED | `src/app/courses/aibi-p/page.tsx:34` — `const currentModule = Math.max(1, enrollment?.current_module ?? 1);` — guard is in place, URL uses `currentModule`. Commit e2757ed. |
| 4 | Start Course link never produces /courses/aibi-s/0 even when current_module=0 | VERIFIED | `src/app/courses/aibi-s/page.tsx:32` — `const currentWeek = Math.max(1, enrollment?.current_module ?? 1);` — guard is in place. |
| 5 | IterationTracker ships as 3 steps and ROADMAP language reflects that (Option A was taken) | FAILED | Commit 36570b2 made the correct text change. Orchestrator commit 41b6af5 silently reverted it by diffing against the same pre-change base (index 5437b98). HEAD ROADMAP.md line 117 still reads "four iterations with the one-change rule." |
| 6 | Certificate PDF uses Cormorant for display type and DM Mono for numeric fields instead of Helvetica/Courier proxies | VERIFIED | `Font.register` present at module scope for Cormorant (Regular/Bold/Italic) and DM Mono. No Helvetica or Courier references found in CertificateDocument.tsx. All date/certId/verifyUrl styles use `fontFamily: 'DM Mono'`. All display styles use `fontFamily: 'Cormorant'`. Commit 0f0b76e. |

**Score:** 5/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/00006_course_enrollments_updated_at.sql` | Adds updated_at column, trigger, and backfill | VERIFIED | File exists (25 lines). Contains `ALTER TABLE course_enrollments`, backfill UPDATE, NOT NULL constraint, and trigger wired to `public.set_updated_at()`. |
| `src/lib/pdf/CertificateDocument.tsx` | Certificate PDF with brand-matching font registration | VERIFIED | File exists (439 lines). Contains `Font.register` at module scope for both Cormorant and DM Mono families. No Helvetica or Courier references remain. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| supabase/migrations/00006_course_enrollments_updated_at.sql | supabase/migrations/00004_security_hardening.sql | reuses public.set_updated_at() function | VERIFIED | `EXECUTE FUNCTION public.set_updated_at();` on line 25. Pattern match confirmed. |

### Data-Flow Trace (Level 4)

Not applicable — this phase modifies a migration, two URL-construction code paths, a ROADMAP doc, and a PDF renderer config. No dynamic-data rendering components introduced.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| No Helvetica/Courier in CertificateDocument | grep Helvetica\|Courier src/lib/pdf/CertificateDocument.tsx | No matches | PASS |
| Math.max guard present in aibi-p | grep "Math.max" src/app/courses/aibi-p/page.tsx | Line 34: Math.max(1, enrollment?.current_module ?? 1) | PASS |
| Math.max guard present in aibi-s | grep "Math.max" src/app/courses/aibi-s/page.tsx | Line 32: Math.max(1, enrollment?.current_module ?? 1) | PASS |
| Migration uses hardened trigger function | grep "EXECUTE FUNCTION" 00006 migration | Line 25: EXECUTE FUNCTION public.set_updated_at() | PASS |
| ROADMAP Phase 6 SC #4 reflects three-step flow | grep "Activity 8.1" ROADMAP.md | "four iterations with the one-change rule" — old text | FAIL |
| Cormorant TTF files present | ls public/fonts/ | Cormorant-Regular.ttf, Cormorant-Bold.ttf, Cormorant-Italic.ttf all present | PASS |

### Requirements Coverage

No requirement IDs were declared for this phase. Phase 9 ROADMAP entry lists TBD for requirements.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `.planning/ROADMAP.md` | Stale spec text ("four iterations") after revert | Warning | ROADMAP SC does not match shipped UX — minor documentation debt, but this was the explicit goal of Truth #5 |

**Review warnings carried forward (advisory, non-blocking):**

- WR-01 (from 09-REVIEW.md): `Math.max` guard is applied only at the URL construction site on these two pages. Other consumers of `current_module` (server-side route handlers, `getModuleStatus`) still see the raw DB value of 0 for freshly enrolled users. Recommended fix: centralize the coercion in `getEnrollment.ts`. Not a blocker for this phase's stated goal.
- WR-02 (from 09-REVIEW.md): Cormorant Bold-Italic face is not registered. The `signatureName` and `sealText` styles request both `fontWeight: 'bold'` and `fontStyle: 'italic'` simultaneously; react-pdf will fall back to synthetic italic with a stderr warning. The plan's must_haves did not require bold-italic specifically, so this is informational only. Fix: register `Cormorant-BoldItalic.ttf` (if available) or restructure styles to italic-only for those elements.

### Human Verification Required

None required. The gap is programmatically confirmed (git diff) and the fix is a one-line doc edit.

### Gaps Summary

One gap is blocking the phase goal: the ROADMAP Phase 6 SC #4 text was correctly changed in commit `36570b2` to read "a three-step iteration flow (Stress Test → Diagnose → Revise) that applies the one-change rule per revise" — but the subsequent orchestrator commit `41b6af5` ("mark plan 09-01 complete in ROADMAP") silently reverted this change. The root cause is a merge conflict resolution: `41b6af5` diffed from the same index hash (`5437b98`) that `36570b2` used as its parent, so when the orchestrator applied only its checkbox change it overwrote the executor's text change.

The fix is a single-line doc edit to `.planning/ROADMAP.md` line 117. No code changes required.

---

_Verified: 2026-04-18T19:00:00Z_
_Verifier: Claude (gsd-verifier)_
