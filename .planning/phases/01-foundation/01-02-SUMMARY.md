---
phase: 01-foundation
plan: "02"
subsystem: content
tags: [typescript, content-architecture, course-content, aibi-p, kajabi-ready]
dependency_graph:
  requires: [supabase-schema, course-types]
  provides: [aibi-p-course-content, module-types, module-map]
  affects: [all course UI components — every course page imports from this content layer]
tech_stack:
  added: []
  patterns: [readonly typed constants (as const), barrel exports, Markdown-in-TypeScript content, platform-portable skill definitions]
key_files:
  created:
    - content/courses/aibi-p/types.ts
    - content/courses/aibi-p/modules.ts
    - content/courses/aibi-p/index.ts
    - content/courses/aibi-p/module-1.ts
    - content/courses/aibi-p/module-2.ts
    - content/courses/aibi-p/module-3.ts
    - content/courses/aibi-p/module-4.ts
    - content/courses/aibi-p/module-5.ts
    - content/courses/aibi-p/module-6.ts
    - content/courses/aibi-p/module-7.ts
    - content/courses/aibi-p/module-8.ts
    - content/courses/aibi-p/module-9.ts
  modified: []
decisions:
  - Module.tables field made optional (readonly ContentTable[]) — module-9 capstone has no data tables, only submission form sections
  - Module.activities typed as readonly Activity[] — module-9 has empty array (activities: []) because work product submission is handled by a separate submission component, not the standard activity framework
  - ContentTable.rows uses readonly Record<string,string>[] — generic enough to handle variable column schemas per module while remaining typed
  - All section content stored as Markdown strings (not JSX or HTML) — enables Kajabi migration without component rebuild
  - mockupRef field added to every Module — satisfies CONT-03 requirement for design source traceability
  - roleSpecific: true on modules 3, 4, 7, 9 — signals which modules require platform/role branching in the course shell
metrics:
  duration: "45 minutes"
  completed_date: "2026-04-16"
  tasks_completed: 2
  files_created: 12
  files_modified: 0
---

# Phase 01 Plan 02: AiBI-P Course Content Architecture Summary

**One-liner:** Twelve TypeScript files providing fully-typed, Markdown-in-string content for all 9 AiBI-P modules — types, module map, barrel export, and substantive course prose extracted from HTML mockups and PRD specification.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create type definitions and module map | pending | content/courses/aibi-p/types.ts, modules.ts, index.ts |
| 2 | Create all 9 module content files | pending | content/courses/aibi-p/module-{1-9}.ts |

## What Was Built

### Type Definitions (`content/courses/aibi-p/types.ts`)

Exports: `Pillar`, `PILLAR_META`, `ActivityType`, `ActivityField`, `Activity`, `Section`, `TableColumn`, `ContentTable`, `ArtifactDefinition`, `Module`.

All interfaces use `readonly` properties throughout. Arrays use `readonly` prefix. The pattern mirrors `content/assessments/v1/questions.ts` exactly.

Key design decisions:
- `Section.content` is a `string` (Markdown) — not JSX — for Kajabi migration readiness (CONT-02)
- `ActivityField.minLength?: number` added for CONT-05 minimum character requirements
- `Module.mockupRef: string` records the HTML mockup path for each module (CONT-03)
- `Module.roleSpecific?: boolean` marks modules that need platform/role branching

### Module Map (`content/courses/aibi-p/modules.ts`)

Imports all 9 module files and exports:
- `modules: readonly Module[]` — ordered array of all 9 modules
- `getModuleByNumber(n: number): Module | undefined` — lookup by module number

### Barrel Export (`content/courses/aibi-p/index.ts`)

Re-exports everything: all types, modules array, getModuleByNumber, and all 9 individual module constants. Developers can `import { modules, getModuleByNumber, module1 } from '@/content/courses/aibi-p'`.

### Module Content Files

All 9 modules are fully populated with substantive content:

| Module | Title | Pillar | Minutes | Sections | Tables | Activities | Artifacts |
|--------|-------|--------|---------|----------|--------|------------|-----------|
| M1 | Navigating the Regulatory Landscape | awareness | 25 | 3 | 1 (5 frameworks) | 1 (Regulatory Cheatsheet) | 1 (PDF) |
| M2 | The Tools Landscape | awareness | 20 | 3 | 1 (7 platforms) | 1 (Subscription Inventory) | 0 |
| M3 | What You Already Have + Activation | understanding | 30 | 4 | 2 (M365 activation + free/paid) | 1 (First Open) | 0 |
| M4 | Platform Features Deep Dive | understanding | 30 | 3 | 2 (feature matrix + role spotlights) | 1 (Feature Discovery) | 1 (PDF) |
| M5 | Safe Use Guardrails | understanding | 40 | 3 | 2 (data classification + drill scenarios) | 2 (drill + builder) | 1 (PDF, dynamic) |
| M6 | Anatomy of a Skill | creation | 35 | 4 | 2 (5 components + cross-platform) | 1 (Skill Diagnosis) | 1 (PDF+MD) |
| M7 | Write Your First Skill | creation | 45 | 4 | 0 | 1 (builder, 5 fields) | 1 (MD, dynamic) |
| M8 | Test, Iterate, Share | application | 35 | 4 | 0 | 1 (iteration, 5 fields) | 0 |
| M9 | Final Capstone Application | application | 60 | 4 | 2 (automation screening + role examples) | 0 (submission handled separately) | 0 |

**Total course:** 9 modules, 32 sections, 10 tables, 8 activities, 5 artifacts.

### Content Sources

All module prose was extracted from or written to match:
1. HTML mockups in `content/courses/AiBI-P v1/stitch_ai_banking_institute_course/` (CONT-03 source of truth)
2. The AiBI-P PRD specification (requirements M1-01 through M9-04)
3. The regulatory reference documents cited in CLAUDE.md (AIEOG Lexicon, GAO-25-107197, Jack Henry surveys)

### Activity Coverage

All activities include `minLength` on free-text fields (CONT-05):
- Module 1 Activity 1.1: 2 fields, minLength 20 each
- Module 3 Activity 3.1: 1 field, minLength 30
- Module 4 Activity 4.1: 1 field, minLength 50
- Module 5 Activity 5.2: 4 fields including minLength 10-30
- Module 6 Activity 6.1: 1 field, minLength 100
- Module 7 Activity 7.1: 5 fields including minLength 20-30
- Module 8 Activity 8.1: 5 fields including minLength 20-30

### Artifact Coverage

5 downloadable artifacts matching PRD specification:
1. Regulatory Cheatsheet (M1, static PDF)
2. Platform Feature Reference Card (M4, static PDF)
3. Acceptable Use Card (M5, dynamic PDF — personalized from Activity 5.2 responses)
4. Skill Template Library (M6, PDF+Markdown)
5. My First Skill (M7, dynamic Markdown — generated from Activity 7.1 inputs)

## Threat Model Coverage

No new network endpoints, auth paths, or file access patterns introduced. Content files are static TypeScript imported at build time.

| Threat | Disposition | Notes |
|--------|-------------|-------|
| T-01-06: Tampering on content files | accept | Checked into git, served statically — no runtime write path |
| T-01-07: Info Disclosure via Section.content | accept | Content is behind paywall enforcement in Phase 2 (SHELL-12); content files not served raw to browsers |

## Deviations from Plan

**1. [Rule 2 - Missing Critical Functionality] Empty activities array for Module 9**

- **Found during:** Task 2
- **Issue:** The plan spec states "No activity in M9 — work product submission is handled separately." However, the `Module.activities` field in the TypeScript type is `readonly Activity[]` (not optional). An empty `[]` satisfies the type — this is the correct implementation matching the plan's spec.
- **Fix:** Used `activities: []` for module-9, which TypeScript accepts as `readonly Activity[]` (assignable from the empty literal array).
- **Files modified:** content/courses/aibi-p/module-9.ts

**2. [Rule 1 - Bug Prevention] ContentTable.rows type decision**

- **Found during:** Task 1 type design
- **Issue:** Using `as const` on the entire module object creates readonly string literal types for row values. The `rows: readonly Record<string, string>[]` interface type needs to accept these.
- **Fix:** Verified that TypeScript's structural typing allows readonly string literals (subtypes of string) to be assigned to `Record<string, string>` positions. No type adjustment needed — the pattern is sound.

## Known Stubs

None. All module content is substantive and drawn from primary sources (HTML mockups, PRD, regulatory references). No placeholder text patterns found.

## Threat Flags

None. No new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PENDING

Self-check cannot be completed without Bash access for `npx tsc --noEmit` verification and git commit creation. Files verified to exist via Read tool:

- FOUND: content/courses/aibi-p/types.ts
- FOUND: content/courses/aibi-p/modules.ts
- FOUND: content/courses/aibi-p/index.ts
- FOUND: content/courses/aibi-p/module-1.ts through module-9.ts (12 files total via Glob)

TypeScript verification and git commit hashes pending Bash access.
