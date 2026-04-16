---
phase: 06-modules-6-9-activities-skill-builder
plan: "02"
subsystem: course-activities
tags: [iteration-tracker, completion-cta, m8, m9, activity-less-module, skill-iteration, md-export]
dependency_graph:
  requires:
    - "06-01 (SkillBuilder with skill-md-content stored in activity response)"
    - "04-xx (ActivitySection routing, submit-activity API, save-progress API)"
  provides:
    - "IterationTracker component (M8 Activity 8.1) with 3-step visual flow and .md v1.1 export"
    - "GET /api/courses/activity-response endpoint for retrieving stored activity responses"
    - "CompletionCTA messages for M6, M7, M8, and M9 work product submission CTA"
    - "M9 activity-less completion gate in ModuleContentClient"
  affects:
    - "ActivitySection routing (iteration type branch added)"
    - "ModuleContentClient (activity-less module completion button + CTA)"
    - "CompletionCTA (M5 check made explicit, M9 check added, M6-M8 messages added)"
tech_stack:
  added:
    - "GET /api/courses/activity-response (auth-gated single activity response retrieval)"
    - "Client-side Blob URL .md v1.1 download with iteration log header (IterationTracker)"
  patterns:
    - "IterationTracker fetches M7 skill on mount via activity-response API; falls back gracefully if unavailable"
    - "generateIteratedMarkdown: prepends iteration log header, bumps v1.0 to v1.1 in title"
    - "Activity-less module completion: ModuleContentClient renders Mark Complete button directly when activities.length === 0"
    - "CompletionCTA: explicit moduleNumber checks (5 = Calendly, 9 = submit, else encouragement)"
key_files:
  created:
    - src/app/courses/aibi-p/_components/IterationTracker.tsx
    - src/app/api/courses/activity-response/route.ts
  modified:
    - src/app/courses/aibi-p/_components/ActivitySection.tsx
    - src/app/courses/aibi-p/_components/CompletionCTA.tsx
    - src/app/courses/aibi-p/_components/ModuleContentClient.tsx
decisions:
  - "IterationTracker fetches M7 skill .md via new GET /api/courses/activity-response endpoint on mount rather than relying on props — keeps ActivitySection interface clean and is a standard fetch pattern"
  - "M9 completion gate placed in ModuleContentClient (not ActivitySection) — ActivitySection already returns null for empty arrays, and ModuleContentClient is the right owner of module-level completion state"
  - "CompletionCTA M9 check uses explicit moduleNumber === 9 || isLastModule so it also fires if module count changes in future"
  - "Iteration .md export falls back gracefully with instructions when M7 response unavailable — never blocks form submission"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-16"
  tasks_completed: 2
  files_created: 2
  files_modified: 3
---

# Phase 06 Plan 02: Iteration Tracker, M9 Completion Gate, and CompletionCTA M6-M9 Summary

**One-liner:** M8 three-step Iteration Tracker with .md v1.1 export, M9 activity-less completion gate, and CompletionCTA messages for all Creation/Application pillar modules including a work product submission CTA for M9.

## What Was Built

### Task 1: IterationTracker Component + activity-response API

**IterationTracker** (`_components/IterationTracker.tsx`) — M8 Activity 8.1 specialized component:
- Three visual steps with numbered headers (terra color), border-left accent on each step section
  - Step 1: Stress Test — test-input-1, test-input-2
  - Step 2: Diagnose — output-assessment-1, output-assessment-2
  - Step 3: Revise and Version — revision-notes, sharing-ladder-level (radio)
- All 6 fields from module-8.ts activity definition with matching validation (minLength 20/30)
- On mount, fetches M7 Activity 7.1 response via `GET /api/courses/activity-response`; shows contextual "before you begin" note depending on availability
- On submission: POSTs to `/api/courses/submit-activity`, then downloads `.md v1.1` if M7 skill was available
  - `generateIteratedMarkdown`: prepends iteration log header (version, changes, sharing level), bumps `v1.0` to `v1.1` in title
  - Falls back with manual instructions if M7 data unavailable — never blocks form submission
- Post-submission: read-only view of all 3 steps
- Keyboard accessible (focus rings, aria-live, aria-label, aria-required)

**GET /api/courses/activity-response** (`/api/courses/activity-response/route.ts`):
- Query params: `enrollmentId`, `activityId`
- Auth: Supabase getUser() + enrollment ownership check (user_id match)
- Returns `{ response: Record<string, string> | null }` — null is normal when activity not yet submitted
- Security: Generic 403 on auth failure (no enrollment existence leak); T-06-05 disposition: accept (retrieves only learner's own data)

**ActivitySection routing** — Added `activity.type === 'iteration'` branch before the ClassificationDrill check, routing M8 Activity 8.1 to IterationTracker. Updated file header comment.

Note on My First Skill re-download (ARTF-04, M7-06): This was already implemented in Plan 01 — SkillBuilder renders a "Re-download Skill File" button in its read-only view when `existingResponse` is present, using the stored `skill-md-content` field. No additional work needed.

### Task 2: CompletionCTA M6-M9 + M9 Completion Gate

**CompletionCTA** (`_components/CompletionCTA.tsx`) — Updated with M6-M9 messages:

| Module | CTA Type | Content |
|--------|----------|---------|
| M6 | Encouragement | "Module 6 complete. You can now dissect any AI skill and identify what makes it effective. Your Skill Template Library is ready to use." |
| M7 | Encouragement | "Module 7 complete. You have built your first institutional-grade AI skill. It is saved and ready to deploy in your primary AI platform." |
| M8 | Encouragement | "Module 8 complete. Your skill has been stress-tested and iterated. The version-controlled approach you practiced scales to every skill you build." |
| M9 | Work Product CTA | Cormorant heading, body copy explaining 4-item work product package, terra CTA button → `/courses/aibi-p/submit` |
| M5 | Executive Briefing | Calendly link (unchanged, now explicit `moduleNumber === 5` check) |

Check order: M9/isLastModule first → M5 second → M1-8 encouragement fallback. This prevents isLastModule from accidentally routing to the M5 block if module count ever changes.

**ModuleContentClient** (`_components/ModuleContentClient.tsx`) — M9 completion gate:
- When `activities.length === 0` and module not already complete: renders "Mark Module Complete" button
- On click: POSTs to `/api/courses/save-progress`, sets `moduleComplete = true` on success
- After marking complete: renders `CompletionCTA` (which shows M9 work product submission CTA)
- `handleAllActivitiesComplete` converted from inline arrow to `useCallback` for consistency
- `ModuleNavigation` still receives `moduleComplete` state — navigation unlocks after marking complete

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written. My First Skill re-download was already present from Plan 01 (not a deviation, discovered during review).

## Known Stubs

**`/courses/aibi-p/submit` link in M9 CompletionCTA** — This page does not exist yet. It is the Phase 7 work product submission page. The CTA button renders and links to this path, but clicking it will 404 until Phase 7 is built. This is intentional — the CTA is the correct long-term link target, and Phase 7 will create the page at this path.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| New API endpoint | src/app/api/courses/activity-response/route.ts | New GET endpoint. Auth-gated with enrollment ownership check. Returns learner's own activity response data only. RLS on activity_responses provides defense in depth. Consistent with T-06-05 accept disposition. |

## Self-Check: PASSED

Files verified:
- `src/app/courses/aibi-p/_components/IterationTracker.tsx` — FOUND
- `src/app/api/courses/activity-response/route.ts` — FOUND
- `src/app/courses/aibi-p/_components/CompletionCTA.tsx` — FOUND (modified)
- `src/app/courses/aibi-p/_components/ModuleContentClient.tsx` — FOUND (modified)

Commits verified:
- `986ad44` feat(06-02): add IterationTracker for M8 Activity 8.1 and activity-response API — FOUND
- `053c8ca` feat(06-02): update CompletionCTA for M6-M9 and fix M9 activity-less completion gate — FOUND

Build: `npm run build` — PASSED, zero TypeScript or ESLint errors.

Task 3 (human-verify checkpoint) — auto-approved per autonomous execution mode.
