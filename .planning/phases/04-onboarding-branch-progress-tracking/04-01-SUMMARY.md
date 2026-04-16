---
phase: 04-onboarding-branch-progress-tracking
plan: "01"
subsystem: ui, api
tags: [next.js, supabase, typescript, course, onboarding, forms]

requires:
  - phase: 02-course-shell
    provides: getEnrollment.ts, CourseEnrollment type, course_enrollments table with onboarding_answers column
  - phase: 03-stripe-checkout
    provides: enrollment rows created in course_enrollments on purchase

provides:
  - 3-question onboarding survey at /courses/aibi-p/onboarding
  - POST /api/courses/save-onboarding endpoint that persists answers to Supabase
  - OnboardingAnswers persisted to course_enrollments.onboarding_answers (jsonb)

affects:
  - 04-02 (progress tracking needs enrollment with onboarding_answers)
  - module content personalization (reads onboarding_answers for M365/role routing)

tech-stack:
  added: []
  patterns:
    - "Stepped form: multi-question survey shown one step at a time, step state in useState"
    - "Service role + auth verification pattern: anonClient.getUser() for identity, serviceClient for write after manual ownership check"
    - "Exclusive option group: checkbox group clears when exclusive radio selected, and vice versa"

key-files:
  created:
    - src/app/courses/aibi-p/onboarding/page.tsx
    - src/app/courses/aibi-p/onboarding/OnboardingSurvey.tsx
    - src/app/api/courses/save-onboarding/route.ts

key-decisions:
  - "Used three separate step views (not a single long form) to match mockup's stepped progress pattern and improve mobile UX"
  - "Q2 AI subscriptions uses checkbox multi-select + two exclusive radio-style buttons; mutual exclusion handled in state without a radio group to allow deselection"
  - "API route uses anonClient for getUser() (reads auth cookies) + serviceClient for DB write (bypasses RLS after manual ownership check) — matches Phase 1 decisions"

requirements-completed: [ONBD-01, ONBD-02, ONBD-05]

duration: 20min
completed: 2026-04-16
---

# Phase 4 Plan 01: Onboarding Survey Summary

**3-question stepped onboarding form at /courses/aibi-p/onboarding with Supabase persistence via authenticated POST /api/courses/save-onboarding**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-16
- **Completed:** 2026-04-16
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Server component page.tsx gates non-enrolled users (redirects to /purchase)
- OnboardingSurvey.tsx: 3-step form — M365 usage, AI subscriptions (multi-select with exclusive options), primary role grid — matching the HTML mockup's two-column layout with terracotta/parchment brand system
- POST /api/courses/save-onboarding: validates OnboardingAnswers shape, authenticates via Supabase getUser, verifies enrollment ownership, writes to Supabase with service role client

## Task Commits

1. **Task 1: Onboarding survey page and client component** - `f485e38` (feat)
2. **Task 2: Save-onboarding API route** - `1f20110` (feat)

## Files Created/Modified

- `src/app/courses/aibi-p/onboarding/page.tsx` - Server component; enrollment gate + renders OnboardingSurvey
- `src/app/courses/aibi-p/onboarding/OnboardingSurvey.tsx` - Client component; 3-step survey form, submits to save-onboarding API, redirects to Module 1 on success
- `src/app/api/courses/save-onboarding/route.ts` - POST handler; validates answers, authenticates user, verifies enrollment ownership, writes onboarding_answers to Supabase

## Decisions Made

- Three separate step views rather than a single scrollable form — matches mockup and improves completion rate on mobile
- Q2 uses a hybrid checkbox + exclusive-button model: selecting a paid subscription clears exclusive options and vice versa. Stored as `string[]` in `personal_ai_subscriptions`; empty array represents "None"
- API route uses the anon client for `getUser()` (reads session cookies) and the service role client for the DB write — consistent with the service role pattern established in Phase 1 for webhook writes

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

TypeScript error on `[...VALID_ROLES]` spread (Set iteration requires `downlevelIteration` flag). Fixed inline by removing the spread — the error message was simplified to "primary_role must be a valid LearnerRole value" which is equally clear.

## User Setup Required

None — no external service configuration required. Supabase `course_enrollments.onboarding_answers` column was created in Phase 2 migrations.

## Next Phase Readiness

- Onboarding survey fully wired end-to-end (survey → API → Supabase)
- Plan 02 (progress tracking) can build on `completed_modules` / `current_module` columns
- Module content personalization can now read `onboarding_answers` from `getEnrollment` once Plan 02 extends the select fields

---
*Phase: 04-onboarding-branch-progress-tracking*
*Completed: 2026-04-16*

## Self-Check: PASSED

- FOUND: src/app/courses/aibi-p/onboarding/page.tsx
- FOUND: src/app/courses/aibi-p/onboarding/OnboardingSurvey.tsx
- FOUND: src/app/api/courses/save-onboarding/route.ts
- FOUND commit: f485e38 (Task 1)
- FOUND commit: 1f20110 (Task 2)
