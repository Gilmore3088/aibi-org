---
name: elevate-course
description: Turn an approved elevation issue into a Foundation course update — editing or adding micro-modules under the repo's strict copy tests. Use only when an `elevation`-labeled issue has been approved by the owner; course PRs are never auto-merged.
---

# Elevate content into the course

Course content is typed data: `content/courses/foundation-program/micro-modules.ts`
(`FOUNDATION_MICRO_MODULES`, currently 18 module objects) drives the module
pages, activities, and config. Editing a module = editing its object.

## Preconditions

- An `elevation`-labeled GitHub issue approved by James names the change.
- The source briefing(s) it elevates are published and their claims
  registered. Course copy citing stats/regulations inherits the same
  claims-registry rules (the gate scans `content/`).

## Editing an existing module (the common case)

1. Edit the module object in `micro-modules.ts`. Check the keyed side files
   for the same module number: `role-paths.ts`, `prompt-library.ts`,
   `output-examples.ts`, `content/practice-reps/foundation-program.ts`,
   `content/exams/foundation-program/questions.ts` — update where the change
   reaches them.
2. The copy tests are the quality rails — satisfy, never weaken them:
   10–15 min estimatedMinutes; unique keyOutput; transferMove ≤120 chars with
   an approved verb; activity description ≤18 words; see
   `micro-modules.test.ts`, `module-activities.test.ts`, `copy-hygiene.test.ts`.
3. Never touch `content/sandbox-data/` (planted-error teaching samples).

## Adding module 19+ (rare — flag, don't improvise)

Requires, beyond the object append: a Supabase migration widening the
`activity_responses` CHECK constraint (pattern:
`supabase/migrations/00047_foundation_18_module_activity_responses.sql`),
updating tests that hard-code 18 (`schema-contract.test.ts`,
`micro-modules.test.ts`, `module-activities.test.ts`), and optionally
sandbox config / role paths / practice reps. Propose this in the issue with
the full file list and WAIT for explicit approval of the migration before
writing it.

## Ship

`npx vitest run content/courses` + `npx tsc --noEmit` +
`node scripts/check-claims.mjs` → branch `claude/elevate-<topic>` → PR
referencing the elevation issue, James merges. Never auto-merge course
changes.
