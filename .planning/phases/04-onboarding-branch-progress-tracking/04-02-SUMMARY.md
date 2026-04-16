---
phase: "04"
plan: "02"
subsystem: courses/aibi-p
tags: [progress-tracking, onboarding-gate, content-routing, settings, supabase]
dependency_graph:
  requires: [04-01]
  provides: [save-progress-api, content-routing, onboarding-gate, settings-page]
  affects: [courses/aibi-p/layout, courses/aibi-p/modules, courses/aibi-p/sidebar]
tech_stack:
  added: [x-pathname middleware pattern]
  patterns: [forward-only server enforcement, pure content routing helpers, pre-populated settings form]
key_files:
  created:
    - src/app/api/courses/save-progress/route.ts
    - src/app/courses/aibi-p/_lib/contentRouting.ts
    - src/app/courses/aibi-p/settings/page.tsx
    - src/app/courses/aibi-p/settings/OnboardingSettings.tsx
    - src/middleware.ts
  modified:
    - src/app/courses/aibi-p/_lib/getEnrollment.ts
    - src/app/courses/aibi-p/layout.tsx
    - src/app/courses/aibi-p/_components/CourseSidebar.tsx
    - src/app/courses/aibi-p/_components/MobileSidebarDrawer.tsx
decisions:
  - "middleware.ts forwards x-pathname header so layout can read current path without props (avoids redirect loop for /onboarding and /settings)"
  - "M365 takes precedence over ChatGPT Plus in getPlatformPriority when both are true — institution context is more actionable for professional training"
  - "save-progress deduplicates completed_modules via Set to handle idempotent calls cleanly"
  - "Last module (9) holds current_module at 9 rather than advancing to 10 — avoids out-of-range state"
metrics:
  duration_minutes: 25
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_changed: 9
---

# Phase 4 Plan 02: Progress Persistence, Content Routing, Onboarding Gate, and Settings Summary

**One-liner:** Supabase-backed module progress with forward-only server enforcement, M365/role content routing, onboarding gate in layout, and pre-populated settings form.

## What Was Built

### Task 1: getEnrollment extension + save-progress API + contentRouting + layout gate

**getEnrollment.ts** — Added `onboarding_answers` to the `EnrollmentData` type Pick and to the Supabase select query. All downstream consumers (layout, module pages, settings page) now receive the full onboarding state without additional queries.

**POST /api/courses/save-progress** — Writes module completion to `course_enrollments` with three layers of server-side enforcement:
1. Auth check: `supabase.auth.getUser()` — returns 401 if absent
2. Ownership check: SELECT with both `id = enrollmentId` AND `user_id = user.id` — returns 403 if mismatch
3. Forward-only logic: `moduleNumber` must equal `current_module`; all prior modules 1..N-1 must be in `completed_modules` — returns 400 on violation
After passing all checks, appends to `completed_modules` (via Set deduplication) and advances `current_module`. Last module (9) holds at 9, not 10.

**contentRouting.ts** — Three pure functions with no Supabase imports:
- `getPlatformPriority(answers)` — returns platform order; M365 brings Copilot first, ChatGPT Plus brings ChatGPT first, M365 takes precedence when both are true
- `getRoleSpotlight(answers)` — returns `primary_role` directly
- `getContentVariant(answers, moduleNumber)` — combined descriptor; `showM365Path` is true only when `uses_m365 === 'yes'` AND `moduleNumber === 3`

**layout.tsx onboarding gate** — After `getEnrollment()`, if enrollment exists but `onboarding_answers` is null, redirects to `/courses/aibi-p/onboarding`. Exempt paths (`/onboarding`, `/settings`, `/purchase`) are checked via the `x-pathname` header set by middleware, preventing infinite redirect loops.

**middleware.ts** — New file. Forwards `request.nextUrl.pathname` as `x-pathname` response header on every non-static request. Necessary because Next.js App Router layouts do not receive the current pathname as a prop.

### Task 2: Settings page for updating onboarding answers

**settings/page.tsx** — Server component. Calls `getEnrollment()`, redirects to `/purchase` if null, passes `enrollment.id` and `enrollment.onboarding_answers` to `OnboardingSettings`.

**OnboardingSettings.tsx** — Client component. Pre-populates the three-question form (M365 buttons, AI subscription checkboxes + exclusive options, role grid) from `currentAnswers`. On submit POSTs to `/api/courses/save-onboarding` (reuses Plan 01 endpoint). On success shows an inline "Profile saved successfully." confirmation (sage-colored, fades after 2s) then calls `router.refresh()` to reload server data. Includes a "Back to Course" link.

**CourseSidebar.tsx and MobileSidebarDrawer.tsx** — Settings link with gear icon added at the bottom of the sidebar footer (below the Resume button) on both desktop and mobile variants.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocker] Created middleware.ts to supply x-pathname header**
- **Found during:** Task 1, when implementing the onboarding gate in layout.tsx
- **Issue:** The layout gate needed to read the current pathname to avoid redirecting users already on `/onboarding` or `/settings`. Next.js App Router layouts receive no pathname prop, and no middleware existed to forward it.
- **Fix:** Created `src/middleware.ts` that sets `x-pathname` from `request.nextUrl.pathname` on every non-static request. Layout reads this via `headers().get('x-pathname')`.
- **Files modified:** `src/middleware.ts` (new), `src/app/courses/aibi-p/layout.tsx` (reads header)
- **Commits:** `0cc2b58`

## Success Criteria Check

- [x] Enrolled learner with null onboarding_answers is redirected to survey before any module
- [x] Module completion writes to Supabase — survives iOS tab kill (no sessionStorage dependency)
- [x] M365 user gets Copilot content priority; ChatGPT Plus subscriber gets ChatGPT priority
- [x] Forward-only enforced server-side: POST to save-progress rejects out-of-sequence attempts
- [x] Settings page lets learners update onboarding answers at any time
- [x] TypeScript compiles with zero errors

## Self-Check: PASSED

Files verified present:
- FOUND: src/app/api/courses/save-progress/route.ts
- FOUND: src/app/courses/aibi-p/_lib/contentRouting.ts
- FOUND: src/app/courses/aibi-p/settings/page.tsx
- FOUND: src/app/courses/aibi-p/settings/OnboardingSettings.tsx
- FOUND: src/middleware.ts

Commits verified:
- FOUND: 0cc2b58 (Task 1)
- FOUND: 73f0f9d (Task 2)
