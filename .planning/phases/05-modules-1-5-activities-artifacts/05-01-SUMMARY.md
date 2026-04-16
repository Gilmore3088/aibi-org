---
phase: 05-modules-1-5-activities-artifacts
plan: "01"
subsystem: course-activities
tags: [activities, forms, api, supabase, progress-gating]
dependency_graph:
  requires:
    - "04-xx: course_enrollments table, save-progress API, getEnrollment utility"
  provides:
    - "submit-activity API route"
    - "ActivityForm client component"
    - "ModuleContentClient boundary"
    - "Gated Next Module navigation"
  affects:
    - "src/app/courses/aibi-p/[module]/page.tsx"
    - "src/app/api/courses/submit-activity/route.ts"
    - "src/app/courses/aibi-p/_components/*"
tech_stack:
  added:
    - "src/lib/stripe/provision-enrollment.ts (extracted from route)"
  patterns:
    - "Server component fetches existing responses, passes to client boundary"
    - "Client boundary (ModuleContentClient) owns shared state between ActivitySection and ModuleNavigation"
    - "Auth: cookies() + createServerClient for session, createServiceRoleClient for writes"
key_files:
  created:
    - src/app/api/courses/submit-activity/route.ts
    - src/app/courses/aibi-p/_components/ActivityForm.tsx
    - src/app/courses/aibi-p/_components/ActivitySection.tsx
    - src/app/courses/aibi-p/_components/ModuleContentClient.tsx
    - src/app/courses/aibi-p/_components/ModuleNavigation.tsx
    - src/lib/stripe/provision-enrollment.ts
  modified:
    - src/app/courses/aibi-p/[module]/page.tsx
    - src/app/courses/aibi-p/onboarding/OnboardingSurvey.tsx
    - src/app/api/webhooks/stripe/route.ts
decisions:
  - "Client boundary pattern: ModuleContentClient owns moduleComplete state so ActivitySection and ModuleNavigation can share it without prop drilling through the server component"
  - "shell-only types: drill and builder activities remain as ActivityFormShell until Plans 02-03 implement specialized components"
  - "existingResponses fetched server-side: avoids an extra client-side round-trip; passed as initial props to ActivityForm"
metrics:
  duration_minutes: 45
  completed_date: "2026-04-15"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 3
---

# Phase 05 Plan 01: Activity Submission Infrastructure Summary

Interactive activity submission for the AiBI-P course: POST API with auth/ownership/duplicate/minLength enforcement writing to activity_responses, and a client ActivityForm replacing disabled shells with server-fetched read-only state for previously submitted activities.

## What Was Built

### Task 1 — POST /api/courses/submit-activity (82e5dd2)

New API route at `src/app/api/courses/submit-activity/route.ts`:

- Authenticates via Supabase `getUser()` from cookies (T-05-01)
- Looks up enrollment with `enrollment.user_id === user.id` ownership check (T-05-06)
- Forward-only enforcement: `moduleNumber` must equal `current_module` (M1-06)
- Duplicate prevention: 409 if `activity_id` already in `activity_responses` (CONT-04)
- Server-side `minLength` validation per activity field definitions (T-05-02, CONT-05)
- Generic 403 response does not reveal whether enrollment exists for other users (T-05-04)
- Returns 201 `{ success: true, activityId }` on success

### Task 2 — ActivityForm + Module Page Wiring (20512a8)

**ActivityForm.tsx** — Client component (`'use client'`) with:
- Full interactive fields (textarea, text, radio, select) with focus rings for keyboard accessibility (A11Y-01)
- Client-side validation matching server-side rules; inline error messages in `var(--color-error)` with text descriptions, not color-only (A11Y-02)
- Character count display `{current}/{minLength}` on textarea fields
- `existingResponse` prop triggers read-only mode with a "Submitted" badge — no submit button shown
- Artifact download button rendered after successful submission when `completionTrigger === 'artifact-download'`
- 409 treated as success (idempotent UX); 400 field errors surfaced inline; 401/403 shows session error

**ActivitySection.tsx** — Client wrapper managing per-activity submission state:
- Initializes `submittedIds` from `existingResponses` (server-fetched) so returning learners see correct state
- `drill` and `builder` activity types render `ActivityFormShell` (Plans 02-03 will replace these)
- After all submittable activities complete, shows "Complete Module" button calling `save-progress`
- Calls `onAllActivitiesComplete` callback on save-progress success

**ModuleContentClient.tsx** — Client boundary owning `moduleComplete` state:
- Bridges server-component data (activities, existingResponses, isAlreadyCompleted) to client interactivity
- Renders `ActivitySection` (state setter) and `ModuleNavigation` (state reader) together

**ModuleNavigation.tsx** — Client component:
- Shows active "Next Module" link when `moduleComplete === true`
- Shows locked span with lock icon when `moduleComplete === false`; `aria-disabled="true"` for accessibility

**[module]/page.tsx** — Updated server component:
- Fetches `activity_responses` for the current enrollment + module using service role client
- Builds `existingResponses: Record<activityId, Record<fieldId, string>>`
- Replaces static `ActivityFormShell` loop and inline nav with `ModuleContentClient`
- `isAlreadyCompleted` passed so returning learners who completed the module see the active Next button immediately

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Moved provisionEnrollment out of stripe route.ts**
- **Found during:** Task 2 — `npm run build` advanced past ESLint to TypeScript type-check
- **Issue:** `provisionEnrollment`, `ProvisionResult`, and `ProvisionError` were exported from `src/app/api/webhooks/stripe/route.ts`. Next.js 14 only allows HTTP method handlers and a specific set of config exports from route files; any other named export is a type error that blocks build.
- **Why it was hidden:** The build was previously failing on `OnboardingSurvey.tsx` lint errors before reaching the TypeScript check. Fixing those errors exposed the stripe route issue.
- **Fix:** Created `src/lib/stripe/provision-enrollment.ts` containing the extracted function and interfaces. Updated `stripe/route.ts` to import from there instead.
- **Files modified:** `src/app/api/webhooks/stripe/route.ts`, `src/lib/stripe/provision-enrollment.ts` (new)
- **Commit:** 20512a8

**2. [Rule 1 - Bug] Fixed unescaped quotes in OnboardingSurvey.tsx**
- **Found during:** Task 2 — `npm run build` lint step
- **Issue:** Two unescaped `"` characters on lines 274-275 failing `react/no-unescaped-entities`
- **Fix:** Replaced with `&ldquo;` and `&rdquo;` HTML entities
- **Files modified:** `src/app/courses/aibi-p/onboarding/OnboardingSurvey.tsx`
- **Commit:** 20512a8

## Known Stubs

- **Artifact download button** in `ActivityForm.tsx` links to `/public/artifacts/{artifactId}.pdf` as a static fallback. Plan 03 will create the `/api/courses/artifacts/[artifactId]` route that replaces this. The button renders correctly and is functional as a static link in the interim.
- `drill` and `builder` activity types render `ActivityFormShell` (disabled). Plans 02-03 will replace with specialized components.

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes beyond what is specified in the plan's threat model.

| Flag | File | Description |
|------|------|-------------|
| None | — | All new endpoints and trust boundaries covered by T-05-01 through T-05-06 in plan |

## Self-Check: PASSED

Files created:
- `src/app/api/courses/submit-activity/route.ts` — FOUND
- `src/app/courses/aibi-p/_components/ActivityForm.tsx` — FOUND
- `src/app/courses/aibi-p/_components/ActivitySection.tsx` — FOUND
- `src/app/courses/aibi-p/_components/ModuleContentClient.tsx` — FOUND
- `src/app/courses/aibi-p/_components/ModuleNavigation.tsx` — FOUND
- `src/lib/stripe/provision-enrollment.ts` — FOUND

Commits:
- `82e5dd2` — FOUND (feat(05-01): add submit-activity API route)
- `20512a8` — FOUND (feat(05-01): add ActivityForm, wire module page)

Build: PASSED (`npm run build` exits 0, all 38 static pages generated)
