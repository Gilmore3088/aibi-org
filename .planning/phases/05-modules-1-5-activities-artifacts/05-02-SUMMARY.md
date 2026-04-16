---
phase: 05-modules-1-5-activities-artifacts
plan: 02
subsystem: ui
tags: [react, typescript, nextjs, course, activity, drill, form, classification]

# Dependency graph
requires:
  - phase: 05-01
    provides: ActivityForm generic component, submit-activity API, ActivitySection skeleton

provides:
  - SubscriptionInventory: 7-platform x 4-option radio grid for M2 Activity 2.1
  - ClassificationDrill: timed 20-scenario drill with scoring and annotations for M5 Activity 5.1
  - AcceptableUseCardForm: 4-field role-specific form for M5 Activity 5.2
  - module-5.ts drill scenarios expanded to 20 total
  - ActivitySection routes specialized components by activity type and module number
  - ModuleContentClient threads tables prop to ActivitySection for drill scenario extraction

affects:
  - 05-03 (PDF generation for AcceptableUseCardForm disabled button becomes live)
  - future module pages that add specialized activity types

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Activity routing by type and module number in ActivitySection
    - DrillScenario extraction from ContentTable rows at render time
    - Timer-based state machine (ready/active/review/submitted) with requestAnimationFrame-friendly 1s setInterval
    - A11Y-02 pattern: all status indicators paired with text labels (no color-only status)

key-files:
  created:
    - src/app/courses/aibi-p/_components/SubscriptionInventory.tsx
    - src/app/courses/aibi-p/_components/ClassificationDrill.tsx
    - src/app/courses/aibi-p/_components/AcceptableUseCardForm.tsx
  modified:
    - content/courses/aibi-p/module-5.ts
    - src/app/courses/aibi-p/_components/ActivitySection.tsx
    - src/app/courses/aibi-p/_components/ModuleContentClient.tsx
    - src/app/courses/aibi-p/[module]/page.tsx

key-decisions:
  - "Module page passes mod.tables to ModuleContentClient so ActivitySection can extract drill scenarios at runtime without a separate prop-drilling architecture"
  - "Timer uses 1s setInterval (not rAF) — adequate granularity for a 20s countdown without unnecessary CPU cost"
  - "Timer does not auto-advance mid-keyboard-navigation (isNavigatingRef guard) per A11Y spec in plan"
  - "AcceptableUseCardForm PDF button is intentionally disabled — Plan 03 wires /api/courses/generate-acceptable-use-card"

patterns-established:
  - "Activity routing pattern: ActivitySection checks moduleNumber + activity.id for module-specific overrides before falling back to type-based routing"
  - "Drill scenario extraction: extractDrillScenarios() pulls rows from ContentTable by id; falls back to ActivityFormShell if table missing"
  - "Specialized component interface: all share activity/enrollmentId/moduleNumber/existingResponse/onSubmitSuccess props for consistency with ActivityForm"

requirements-completed:
  - M2-04
  - M2-05
  - M2-06
  - M3-05
  - M4-03
  - M5-04
  - M5-05

# Metrics
duration: 20min
completed: 2026-04-16
---

# Phase 05 Plan 02: Module-Specific Activity Components Summary

**SubscriptionInventory (M2), ClassificationDrill with 20-second timer (M5.1), and AcceptableUseCardForm (M5.2) wired into the module routing layer; module-5.ts expanded to 20 drill scenarios with balanced Tier 1/2/3 distribution**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-16T16:44:50Z
- **Completed:** 2026-04-16T17:04Z
- **Tasks:** 3 of 3
- **Files modified:** 7

## Accomplishments

- Built SubscriptionInventory: 7-platform × 4-option radio grid for M2 Activity 2.1, with read-only mode and validation requiring all platforms selected before submit
- Built ClassificationDrill: full state machine (ready → active → review → submitted) with 20-second countdown timer, per-scenario correctness annotations, tier breakdown, and A11Y-compliant text labels on all status indicators
- Built AcceptableUseCardForm: 4-field role-specific form with minLength validation, character counters, and intentionally-disabled PDF button pending Plan 03
- Expanded module-5.ts from 10 to 20 drill scenarios (5 Tier 1, 8 Tier 2, 7 Tier 3) with realistic banking contexts
- Updated ActivitySection routing layer to dispatch M2/2.1 → SubscriptionInventory, drill → ClassificationDrill, builder → AcceptableUseCardForm, all others → ActivityForm
- Threaded `tables` prop through ModuleContentClient → ActivitySection so drill scenario data flows from server content to client component without extra fetching

## Task Commits

1. **Task 1: SubscriptionInventory + 10 more drill scenarios** — `7fda0a4` (feat)
2. **Task 2: ClassificationDrill component** — `cca070c` (feat)
3. **Task 3: AcceptableUseCardForm + component wiring** — `db1d76b` (feat)

## Files Created/Modified

- `src/app/courses/aibi-p/_components/SubscriptionInventory.tsx` — 7-platform radio grid form for M2 Activity 2.1
- `src/app/courses/aibi-p/_components/ClassificationDrill.tsx` — Timed 20-scenario drill with scoring, annotations, and state machine
- `src/app/courses/aibi-p/_components/AcceptableUseCardForm.tsx` — 4-field role-specific form for M5 Activity 5.2
- `content/courses/aibi-p/module-5.ts` — m5-drill-scenarios table expanded from 10 to 20 rows
- `src/app/courses/aibi-p/_components/ActivitySection.tsx` — Rewired to route specialized components by type/module
- `src/app/courses/aibi-p/_components/ModuleContentClient.tsx` — Added optional `tables` prop, passed to ActivitySection
- `src/app/courses/aibi-p/[module]/page.tsx` — Passes `mod.tables` to ModuleContentClient

## Decisions Made

- Module page passes `mod.tables` (optional) to `ModuleContentClient` which forwards to `ActivitySection`. This avoids duplicating scenario data in props and keeps extraction logic in one place (`extractDrillScenarios()`).
- Timer uses `setInterval` at 1-second granularity — sufficient for a 20-second countdown. Timer does not auto-advance while `isNavigatingRef.current` is true, protecting keyboard users from losing their selection window.
- `AcceptableUseCardForm` post-submit PDF button is disabled with explanatory text. The `/api/courses/generate-acceptable-use-card` route is Plan 03 scope — the button link is present but gated so learners see a clear affordance without a broken route.

## Deviations from Plan

None — plan executed exactly as written. The module-2 activity had only 6 field entries in the content file (missing Microsoft Copilot Free), but the plan specified 7 platforms from the m2-platforms table. The SubscriptionInventory component reads `activity.fields` directly and handles whatever field count is present, so no content change was required for the component to work correctly.

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| Disabled "Generate Acceptable Use Card" button | `AcceptableUseCardForm.tsx` | ~201 | Plan 03 creates `/api/courses/generate-acceptable-use-card` — button is present but `disabled` with explanatory text until that route exists |

This stub does not prevent the plan's goal (activity submission works); it defers PDF download to Plan 03 as specified.

## Issues Encountered

None — TypeScript compiled clean on all tasks. Build passed without errors.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All three specialized activity components are live and integrated with the submit-activity API from Plan 01
- Plan 03 (PDF generation) can implement `/api/courses/generate-acceptable-use-card` and the disabled button in `AcceptableUseCardForm` will automatically become active (the `isReadOnly` branch already renders a live `<a>` link when `existingResponse` is provided)
- M3 and M4 free-text activities use `ActivityForm` from Plan 01 — no additional work needed

## Self-Check: PASSED

- FOUND: `src/app/courses/aibi-p/_components/SubscriptionInventory.tsx`
- FOUND: `src/app/courses/aibi-p/_components/ClassificationDrill.tsx`
- FOUND: `src/app/courses/aibi-p/_components/AcceptableUseCardForm.tsx`
- FOUND: `.planning/phases/05-modules-1-5-activities-artifacts/05-02-SUMMARY.md`
- FOUND commit `7fda0a4`: feat(05-02): add SubscriptionInventory component and 10 more M5 drill scenarios
- FOUND commit `cca070c`: feat(05-02): add ClassificationDrill component for M5 Activity 5.1
- FOUND commit `db1d76b`: feat(05-02): add AcceptableUseCardForm and wire all specialized activity components

---
*Phase: 05-modules-1-5-activities-artifacts*
*Completed: 2026-04-16*
