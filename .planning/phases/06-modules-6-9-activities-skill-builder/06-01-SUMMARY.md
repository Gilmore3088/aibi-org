---
phase: 06-modules-6-9-activities-skill-builder
plan: "01"
subsystem: course-activities
tags: [skill-builder, activities, pdf-artifacts, role-specific-content, m6, m7]
dependency_graph:
  requires:
    - "05-xx (AcceptableUseCardForm pattern, ActivitySection routing, submit-activity API)"
    - "04-xx (ModuleContentClient, enrollment with onboarding_answers)"
  provides:
    - "SkillDiagnosis component (M6 Activity 6.1)"
    - "SkillBuilder component (M7 Activity 7.1) with .md export"
    - "Skill Template Library PDF artifact (5-page + cover)"
    - "Five .md skill template files for direct download"
    - "skillBuilderData.ts with role-specific placeholders/starters for all 9 roles"
  affects:
    - "ActivitySection routing (M6/M7 branches added)"
    - "ModuleContentClient (learnerRole prop added)"
    - "[module]/page.tsx (learnerRole derivation from onboarding_answers)"
tech_stack:
  added:
    - "SkillTemplateLibraryDocument (react-pdf/renderer static PDF)"
    - "GET /api/courses/artifacts/skill-template-library (auth-gated PDF route)"
    - "Client-side Blob URL .md file download (zero dependencies)"
  patterns:
    - "AcceptableUseCardForm pattern: specialized activity component with submission + download"
    - "getRoleSpotlight (contentRouting.ts) to derive LearnerRole from onboarding_answers"
    - "Two-column lg layout with single-column mobile fallback in SkillBuilder"
    - "Skill Starters: aria-pressed toggle buttons that auto-fill all 5 form fields"
key_files:
  created:
    - public/artifacts/skill-templates/meeting-summary.md
    - public/artifacts/skill-templates/regulatory-research.md
    - public/artifacts/skill-templates/loan-pipeline.md
    - public/artifacts/skill-templates/exception-report.md
    - public/artifacts/skill-templates/marketing-content.md
    - src/lib/pdf/SkillTemplateLibraryDocument.tsx
    - src/app/api/courses/artifacts/skill-template-library/route.ts
    - src/app/courses/aibi-p/_components/SkillDiagnosis.tsx
    - src/app/courses/aibi-p/_components/SkillBuilder.tsx
    - src/app/courses/aibi-p/_lib/skillBuilderData.ts
  modified:
    - src/app/courses/aibi-p/_components/ActivitySection.tsx
    - src/app/courses/aibi-p/_components/ModuleContentClient.tsx
    - src/app/courses/aibi-p/[module]/page.tsx
decisions:
  - "PDF served via API route (/api/courses/artifacts/skill-template-library) rather than static file — allows auth-gating and avoids binary file in repo"
  - "learnerRole flows server->client via ModuleContentClient prop (Option A) rather than SkillBuilder fetching it — keeps client component lean"
  - "react-pdf gap property replaced with marginRight on flex children — react-pdf v4 StyleSheet does not support CSS gap"
  - "SkillBuilder stores generated .md content as skill-md-content field in activity response for ARTF-04 profile re-download"
  - "Skill Template Library .md files served as static public assets (/artifacts/skill-templates/*.md) with native browser download attribute"
metrics:
  duration: "~45 minutes"
  completed: "2026-04-15"
  tasks_completed: 3
  files_created: 10
  files_modified: 3
---

# Phase 06 Plan 01: Skill Template Library, SkillDiagnosis, and SkillBuilder Summary

**One-liner:** Five-component banking AI skill builder with role-specific starters and client-side .md export, plus M6 weak-prompt diagnosis activity with PDF+markdown Skill Template Library download.

## What Was Built

### Task 1: Skill Template Library Artifacts + SkillDiagnosis

**Five .md skill template files** (`public/artifacts/skill-templates/`) — institution-grade, 40-70 lines each, with all five components (Role, Context, Task, Format, Constraints) fully populated with real banking content:

| File | Role | Domain |
|------|------|--------|
| meeting-summary.md | Senior Operations Manager | Meeting documentation |
| regulatory-research.md | Senior Compliance Officer | Regulatory guidance analysis |
| loan-pipeline.md | Senior Credit Analyst | Pipeline status reporting |
| exception-report.md | Operations Manager | Daily exception triage |
| marketing-content.md | Marketing Communications Specialist | Member-facing content |

**SkillTemplateLibraryDocument** (`src/lib/pdf/`) — 6-page react-pdf document: cover with RTFC framework explanation and deployment guide, then one page per template. Auth-gated via `/api/courses/artifacts/skill-template-library`.

**SkillDiagnosis** (`_components/SkillDiagnosis.tsx`) — M6 Activity 6.1 component:
- Styled weak-prompt callout box
- Component selection dropdown (5 options per module-6.ts field definition)
- Improvement textarea (100-char minimum with live counter)
- Submits to `/api/courses/submit-activity`
- On completion: shows PDF download button + 5 individual .md file download links

### Task 2: SkillBuilder + skillBuilderData

**skillBuilderData.ts** — Role-specific data for all 9 `LearnerRole` values:
- `getRolePlaceholders(role)` — placeholder text for all 5 form fields per role
- `getRoleSkillStarters(role)` — 3 pre-built complete skill configurations per role (27 total starters)
- `FORMAT_OPTIONS` — kept in sync with module-7.ts activity field options

**SkillBuilder** (`_components/SkillBuilder.tsx`) — M7 Activity 7.1 component:
- Two-column layout on `lg` breakpoint: RTFC framework explanation panel (left) + form (right)
- Single column on mobile
- Skill Starters: aria-pressed toggle buttons that auto-fill all 5 fields from role-specific banking examples
- 5 form fields: Role (text/min 20), Context (textarea/min 20), Task (textarea/min 30), Format (select), Constraints (textarea/min 30)
- Role-specific placeholder text from `getRolePlaceholders(learnerRole)`
- On submit: generates .md content, POSTs to `/api/courses/submit-activity` (including `skill-md-content` field for ARTF-04), triggers client-side Blob URL download
- Filename format: `[Role-keywords]-[Task-keywords]-Skill-v1.md`
- Post-submission: read-only field view + re-download button

### Task 3: ActivitySection Routing Wiring

**ActivitySection.tsx** — Two new routing branches added before existing guards:
- `moduleNumber === 6 && activity.id === '6.1'` → `SkillDiagnosis`
- `moduleNumber === 7 && activity.id === '7.1'` → `SkillBuilder` (with `learnerRole`)
- M5 builder narrowed to `activity.type === 'builder' && moduleNumber === 5` (no regression)
- New `learnerRole?: LearnerRole` prop (defaults to `'other'`)

**ModuleContentClient.tsx** — Added `learnerRole?: LearnerRole` prop, passed through to ActivitySection.

**[module]/page.tsx** — Derives `learnerRole` from `enrollment.onboarding_answers` via `getRoleSpotlight()`, defaults to `'other'` if no onboarding answers. Passed to `ModuleContentClient`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ESLint unescaped apostrophes in SkillTemplateLibraryDocument**
- **Found during:** Task 3 build verification
- **Issue:** Three apostrophes in `<Text>` JSX nodes triggered `react/no-unescaped-entities` — Next.js build failed
- **Fix:** Moved affected string literals to JS expression syntax (`{'text with apostrophe\'s'}`) to satisfy linter
- **Files modified:** `src/lib/pdf/SkillTemplateLibraryDocument.tsx`
- **Commit:** `9788491`

**2. [Rule 1 - Bug] react-pdf StyleSheet does not support CSS gap property**
- **Found during:** Task 1 (pre-emptive fix during authoring)
- **Issue:** `gap: 8` and `gap: 12` in StyleSheet would silently fail or error at render time in react-pdf v4
- **Fix:** Replaced with `marginRight` on flex children (`frameworkItem`, `col`)
- **Files modified:** `src/lib/pdf/SkillTemplateLibraryDocument.tsx`

## Known Stubs

None — all artifact downloads are wired, all form submissions route to the live API, and all role-specific data is fully populated for all 9 learner roles.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| New API endpoint | src/app/api/courses/artifacts/skill-template-library/route.ts | New GET endpoint. Auth-gated (returns 401 when Supabase configured and user not authenticated). No enrollment ownership check needed — content is static and non-personalized. Acceptable risk per T-06-03. |

## Self-Check: PASSED

Files verified:
- `public/artifacts/skill-templates/meeting-summary.md` — FOUND
- `public/artifacts/skill-templates/regulatory-research.md` — FOUND
- `public/artifacts/skill-templates/loan-pipeline.md` — FOUND
- `public/artifacts/skill-templates/exception-report.md` — FOUND
- `public/artifacts/skill-templates/marketing-content.md` — FOUND
- `src/lib/pdf/SkillTemplateLibraryDocument.tsx` — FOUND
- `src/app/api/courses/artifacts/skill-template-library/route.ts` — FOUND
- `src/app/courses/aibi-p/_components/SkillDiagnosis.tsx` — FOUND
- `src/app/courses/aibi-p/_components/SkillBuilder.tsx` — FOUND
- `src/app/courses/aibi-p/_lib/skillBuilderData.ts` — FOUND

Commits verified:
- `27390b3` feat(06-01): add Skill Template Library artifacts and SkillDiagnosis component
- `2bb3db5` feat(06-01): add SkillBuilder component and role-specific skill starter data
- `e4305a2` feat(06-01): wire SkillDiagnosis and SkillBuilder into ActivitySection routing
- `9788491` fix(06-01): escape apostrophes in SkillTemplateLibraryDocument Text nodes

Build: `npm run build` — PASSED, zero TypeScript or ESLint errors.
