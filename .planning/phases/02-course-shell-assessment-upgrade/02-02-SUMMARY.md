---
phase: 02-course-shell-assessment-upgrade
plan: "02"
subsystem: course-shell
tags: [course, rendering, components, markdown, module-page]
dependency_graph:
  requires: ["02-01"]
  provides: ["02-03"]
  affects: [src/app/courses/aibi-p]
tech_stack:
  added: []
  patterns:
    - dangerouslySetInnerHTML with sanitized-at-build-time content (Markdown from typed TS files)
    - generateStaticParams for 9-module SSG route
    - 'use client' scoped to ActivityFormShell only; all other components are Server Components
key_files:
  created:
    - src/app/courses/aibi-p/[module]/page.tsx
    - src/app/courses/aibi-p/_components/ModuleHeader.tsx
    - src/app/courses/aibi-p/_components/ContentSection.tsx
    - src/app/courses/aibi-p/_components/ContentTable.tsx
    - src/app/courses/aibi-p/_components/ActivityFormShell.tsx
    - src/app/courses/aibi-p/_components/MarkdownRenderer.tsx
  modified: []
decisions:
  - "dangerouslySetInnerHTML is safe here: Markdown source is typed TypeScript constants compiled at build time, never user input"
  - "MarkdownRenderer uses regex-based parsing (no remark/rehype) — content is simple enough and avoids a dependency"
  - "Tables rendered after all sections per plan spec (prose then supplementary data then activities)"
  - "ActivityFormShell is 'use client' for field rendering context even though no submission logic exists"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-15"
  tasks_completed: 2
  files_created: 6
  files_modified: 0
---

# Phase 02 Plan 02: Module Rendering Components and Dynamic Page Summary

**One-liner:** Regex Markdown renderer, pillar-colored ModuleHeader, ContentSection/ContentTable/ActivityFormShell components, and a generateStaticParams dynamic page that renders all 9 AiBI-P modules from typed content files.

## What Was Built

### Task 1 — Shared Rendering Components

Five components created in `src/app/courses/aibi-p/_components/`:

**MarkdownRenderer.tsx** — Server Component. Splits content on double newlines, renders paragraphs, `**bold**`, `*italic*`, `- ` lists, `### ` headings, and `` `code` `` with DM Mono. Uses `dangerouslySetInnerHTML` — safe because all Markdown is typed TypeScript build-time constants, never user-provided input.

**ModuleHeader.tsx** — Server Component. Full-width header band with `backgroundColor: PILLAR_META[pillar].colorVar`. White text throughout. DM Mono for module number and meta row (time, output, pillar). Cormorant italic for title. Implements SHELL-11 pillar color discipline.

**ContentSection.tsx** — Server Component. Cormorant heading + MarkdownRenderer. Supports recursive subsections via nested `ContentSection` calls with decremented heading level. 16-unit bottom margin between sections.

**ContentTable.tsx** — Server Component. `overflow-x-auto` wrapper satisfies SHELL-09 (no horizontal page scroll at 390px). `min-w-[600px]` on the table forces scroll rather than wrapping. DM Mono column headers at 10px with wide tracking.

**ActivityFormShell.tsx** — Client Component. Renders all five field types (text, textarea, radio, select, file) as disabled inputs. Left terra border accent. Submit button disabled with "Activity submission available when enrolled" label. No form submission logic — Phase 5-6 per CONTEXT.md.

### Task 2 — Dynamic Module Page

`src/app/courses/aibi-p/[module]/page.tsx`:

- `generateStaticParams()` returns modules 1–9 from the typed array, pre-rendering all 9 pages at build time
- `generateMetadata()` returns titled metadata per module
- `parseInt` + `isNaN` + range check + `getModuleByNumber` + `notFound()` guard implements T-02-03 (URL param tampering)
- Renders: ModuleHeader → ContentSection map → ContentTable map → ActivityFormShell map
- Navigation footer: "Back to Overview" link always visible; "Next Module" terra button visible for modules 1–8; "Course Complete" label for module 9

## Verification

- `npx tsc --noEmit` passes clean (zero errors)
- `npm run build` succeeds — all 9 module routes appear in build output as SSG (●)
- Module 1: sage header, regulatory content, frameworks table, Regulatory Cheatsheet activity shell
- Module 7: amber header, skill builder content
- Module 9: terra header, capstone content, no Next Module button

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed dead code in ActivityFormShell**
- **Found during:** Post-Task 1 review
- **Issue:** `minLengthHint` variable was defined but unreachable — the conditional `{!field.minLength && minLengthHint}` could never render since the variable was only assigned when `field.minLength` was truthy
- **Fix:** Removed the variable and dead fallback branch; single conditional `{field.minLength && ...}` in return block is sufficient
- **Files modified:** `src/app/courses/aibi-p/_components/ActivityFormShell.tsx`
- **Commit:** 2236dbe

## Known Stubs

The `ActivityFormShell` submit button displays "Activity submission available when enrolled" and is permanently disabled. This is intentional — activity interactivity (form submission, artifact generation, progress tracking) is deferred to Phase 5-6 per CONTEXT.md. The shell renders all field metadata correctly; the only missing piece is the submission handler.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes were introduced. The `dangerouslySetInnerHTML` usage is bounded to build-time TypeScript constants — not a runtime injection surface.

## Self-Check: PASSED

Files confirmed present:
- src/app/courses/aibi-p/[module]/page.tsx — FOUND
- src/app/courses/aibi-p/_components/ModuleHeader.tsx — FOUND
- src/app/courses/aibi-p/_components/ContentSection.tsx — FOUND
- src/app/courses/aibi-p/_components/ContentTable.tsx — FOUND
- src/app/courses/aibi-p/_components/ActivityFormShell.tsx — FOUND
- src/app/courses/aibi-p/_components/MarkdownRenderer.tsx — FOUND

Commits confirmed:
- 4d650b8 — feat(02-02): add module rendering components
- 5236585 — feat(02-02): add dynamic module page with generateStaticParams
- 2236dbe — fix(02-02): remove dead code in ActivityFormShell
