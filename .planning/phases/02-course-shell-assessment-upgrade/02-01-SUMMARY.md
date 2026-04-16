---
phase: 02-course-shell-assessment-upgrade
plan: "01"
subsystem: course-shell
tags: [course, layout, sidebar, navigation, pillar-cards, module-map, responsive]
dependency_graph:
  requires: []
  provides: [course-shell-layout, course-overview-page, pillar-navigation]
  affects: [src/app/courses/aibi-p]
tech_stack:
  added: []
  patterns: [server-component-layout, client-drawer, pillar-color-discipline, amber-token]
key_files:
  created:
    - src/app/courses/aibi-p/layout.tsx
    - src/app/courses/aibi-p/page.tsx
    - src/app/courses/aibi-p/_components/CourseSidebar.tsx
    - src/app/courses/aibi-p/_components/MobileSidebarDrawer.tsx
    - src/app/courses/aibi-p/_components/ProgressIndicator.tsx
    - src/app/courses/aibi-p/_components/PillarCard.tsx
    - src/app/courses/aibi-p/_components/ModuleMapItem.tsx
  modified:
    - src/app/globals.css
    - content/courses/aibi-p/types.ts
decisions:
  - "--color-amber #c48820 chosen over terra-light for Creation pillar per CONTEXT.md decision; provides distinct identity for pillar C in the 4-pillar visual grammar"
  - "CourseSidebar and ProgressIndicator as Server Components; only MobileSidebarDrawer requires 'use client' for useState open/close"
  - "Inline SVG icons instead of an icon library per designer brief (no icon libraries)"
  - "Locked modules rendered as div (non-interactive), not Link, to prevent direct URL navigation to locked content"
metrics:
  duration_minutes: 25
  completed_date: "2026-04-16"
  tasks_completed: 2
  files_changed: 9
---

# Phase 2 Plan 01: Course Shell Layout and Overview Page Summary

Course shell layout and `/courses/aibi-p` overview page using persistent left sidebar, pillar-grouped navigation, and 9-module map — all sourced from typed content files, responsive to 390px.

## What Was Built

**Layout shell** (`layout.tsx`): App Router layout wrapping all `/courses/aibi-p/*` routes. Desktop shows a fixed 288px sidebar (CourseSidebar). Mobile below `lg` breakpoint shows a sticky header bar containing the hamburger trigger (MobileSidebarDrawer). Content area offsets with `lg:ml-72 pt-16`.

**CourseSidebar** (Server Component): Fixed left panel grouping all 9 modules under 4 pillar headings. Visual states: locked modules are non-interactive divs at 40% opacity with a lock icon; current module gets parch-dark highlight with terra text; completed modules show a pillar-colored checkmark. Resume button at bottom links to current module.

**MobileSidebarDrawer** (Client Component): Hamburger button visible only below `lg`. Click opens a `role="dialog"` slide-out panel using `translate-x-0 / -translate-x-full` transition. Backdrop overlay, Escape key close, body scroll lock. Same module list as CourseSidebar.

**ProgressIndicator** (Server Component): Row of 9 dots — terra-filled for completed, outlined for incomplete. ARIA progressbar role. "N of 9 modules complete" label in DM Mono.

**PillarCard** (Server Component): Parchment card with inline SVG icon (pillar-colored), Cormorant heading, description, module count, and status badge. Four status variants: completed (pillar color), in-progress (pillar color bold), locked (dust color).

**ModuleMapItem** (Server Component): Module number in DM Mono at pillar color, Cormorant title, key output in DM Mono, thin progress bar (full/partial/empty per status), status text.

**page.tsx** (course overview): Hero with Cormorant heading, progress indicator, Resume/Syllabus CTAs. Four-pillar grid (1→2→4 col). 9-module map grid (1→2→3 col). All hardcoded to module 1 as current (Supabase wiring deferred to Plan 02-03).

**globals.css**: Added `--color-amber: #c48820` and `--color-amber-light: #d4a032`.

**types.ts**: Updated `PILLAR_META.creation.colorVar` from `var(--color-terra-light)` to `var(--color-amber)`.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `14ef451` | feat(02-01): add --color-amber token, course layout with persistent sidebar |
| Task 2 | `3348f6a` | feat(02-01): course overview page with pillar cards and 9-module map |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| `src/app/courses/aibi-p/layout.tsx` | `STUB_COMPLETED_MODULES = []`, `STUB_CURRENT_MODULE = 1` | Enrollment tracking wired to Supabase in Plan 02-03 |
| `src/app/courses/aibi-p/page.tsx` | Same hardcoded values passed to components | Same: Plan 02-03 resolves |

These stubs are intentional per the plan spec. The overview page renders correctly — all 9 modules visible, module 1 shown as current, pillars show Awareness as in-progress. The stub does not prevent the plan's goal (navigational skeleton) from being achieved.

## Threat Flags

None — this plan creates static UI components only; no user input, no API calls, no auth checks.

## Self-Check: PASSED

All 7 created files present, both modified files verified, --color-amber in globals.css, PILLAR_META.creation uses var(--color-amber), commits 14ef451 and 3348f6a exist, `npm run build` completed with /courses/aibi-p listed as static route.
