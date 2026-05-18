# Handoff — Foundation content alignment + LMS harness extraction

**Date:** 2026-05-17 (evening session, shipped 2026-05-18 ~00:00–06:17 UTC)
**Branch:** all work merged to `main`
**PRs:** #124, #131, #127, #128, #130, #163 (merged) · #125, #126, #129 (closed/superseded)
**Status:** COMPLETE — live in production

---

## What this session did

Three threads, executed in parallel and merged sequentially:

1. **Foundation content cleanup (Phase A)** — removed dead files, moved orphan archives, stripped legacy data arrays that were never rendered, renamed exports.
2. **LMS harness extraction (Phase B)** — pulled the canonical `CourseConfig`, progress helpers, and module body templates into `src/lib/lms/`. Migrated Foundation onto the new harness.
3. **Curated content wiring (C-series follow-ups)** — surfaced ~750 lines of curriculum content that had been written but never rendered to learners: 6-platform tool guides, role personalization card, and module 3/7 mini-tutorials.

Net: roughly 3,500 lines of dead/duplicate/unrendered code either deleted or wired to learners across 6 merged PRs.

---

## What shipped

### Foundation content tree

- **`content/courses/foundation-program/tool-guides.ts` and `tool-guides-copilot-gemini.ts`** deleted (1,196 lines, zero consumers). Content recovered from git history and reauthored in canonical schema (see C1c below).
- **`content/courses/AiBI-P v1/`** moved to `Plans/_archive/aibi-p-prd-pre-rename/`.
- **`content/courses/foundation-program/stitch_ai_banking_institute_course/`** (8.8 MB of source mockups) moved to `Plans/_assets/stitch-source-mockups/`.
- **Legacy `sections` arrays** stripped from `module-1.ts`…`module-12.ts` (~660 lines). All 12 modules use V4 expanded modules as canonical body source.
- **`AIBI_P_*` exports** renamed to `FOUNDATION_*` in `content/practice-reps/foundation-program.ts` and 9 consumers. `dbProductKey: 'aibi-p'` preserved on `foundationCourseConfig` for Stripe / Supabase write-key compatibility.
- **Stale path comments** fixed in `content/curriculum/tools.ts` and `content/courses/foundation-program/index.ts`.

### LMS harness — `src/lib/lms/`

- **`types.ts`** — canonical `CourseConfig` with slug + dbProductKey split, brand, terminology, sections array, lean modules with `bodyTemplate` discriminator (`'tabbed' | 'linear' | 'custom'`), AI features, certificate requirements.
- **`progress.ts`** — pure `resolveCourseView()`, `findModule()`, `canAccessModule()` helpers.
- **`adapters.ts`** — bridges between harness shape and Foundation's legacy `completed_modules: number[]` shape.
- **`module-body/`** — Tabbed (Foundation pattern, wraps `<CourseTabs>`), Linear (sequential steps with progress dot rail, for future AI-simulation flows), Custom (pass-through escape hatch).
- **`README.md`** — five-step "how to add a new course" walkthrough.
- **`__tests__/example-course.config.ts` + test** — minimal valid `CourseConfig` as copy-paste starter and contract regression guard.

### Foundation migrated to harness

- `foundationCourseConfig` is the harness shape. Foundation-specific per-module data (pillar, keyOutput, learnerOutcome) lives in a separate `FOUNDATION_MODULES_META` keyed map so the harness `CourseModule` stays generic.
- `[module]/page.tsx` uses `<Tabbed>` from `@/lib/lms/module-body` instead of inline `<CourseTabs>`.
- Activity primitives (`MarkdownRenderer`, `ContentTable`) moved to `src/components/lms/` (consumed across course boundaries).

### Tool guides — 6 platforms

`/courses/foundation/program/tool-guides` now renders **all six** platforms instead of two:

- ChatGPT, Claude, Copilot, Gemini, NotebookLM, Perplexity
- One canonical `ToolGuide` schema with optional `BankingUseCase` fields (`description`, `steps`, `verifyBefore`, `dataWarning`) preserving the richest pre-deletion content.
- Per-platform files in `content/courses/foundation-program/tool-guides/`.
- Page renders via `ALL_TOOL_GUIDES.map()` instead of hardcoded two.

### Role personalization wired

- `RolePathCard` (already-built but unrendered component, ~544 lines of content) now appears on `/courses/foundation/program` between the hero and Course Structure section.
- Reads `enrollment.onboarding_answers.primary_role`, falls through silently when missing or unsupported.

### Module 3 and 7 tutorials wired

- New `MiniTutorialList` component renders the previously-unused `M3_TUTORIALS` (7 tutorials) and `M7_TUTORIALS` (11 tutorials) as accordion `<details>` blocks in the respective module Practice tabs.

### Prompt library / Toolbox reconciliation

- `ALL_PROMPTS` (14 banking prompts in `prompt-library.ts`) was already migrated to the Supabase Toolbox library by migration `00022_migrate_course_prompts_to_library.sql`. Documented the source-of-truth split in the file header.
- 4 dead helpers removed: `filterPrompts`, `getPromptTaskType`, `getPromptSafetyLevel`, `getPromptTimeMinutes`.

---

## What did NOT ship (intentional)

- **AiBI-S harness migration (B5, B6).** Dropped from plan after discovering AiBI-S is not a current product — its routes return 404 stubs, and migration would have been speculative without product constraints.
- **`src/lib/course-harness/` deletion (B7 full).** Still in use by AiBI-S. Stays until AiBI-S becomes a shipping product. Only the dead exports in `src/types/lms.ts` were removed (B7-light).
- **`<AISimulation>` primitive.** Speculative without AiBI-S as a real consumer. Build when the second course makes the shape obvious.

---

## How decisions were made

Key architectural call: **option B (precise) for B4 Foundation migration.** Two paths were on the table:

- A — extend harness `CourseModule` with Foundation's rich fields (pillar, keyOutput, learnerOutcome, etc.) via subtype. Minimal consumer churn.
- B — move Foundation-specific fields out of the modules array into `FOUNDATION_MODULES_META` keyed by module id. Harness `CourseModule` stays lean.

Chose B. The harness stays portable across courses; AiBI-S (when built) won't inherit Foundation's pillar/keyOutput concepts.

Other decisions:

- Foundation migrated first (live, lower risk if a problem surfaces). AiBI-S would have migrated next but is parked.
- `slug` (public identity) separated from `dbProductKey` (Stripe / Supabase write key, preserved as `'aibi-p'` for legacy webhook retries).
- Activity primitives (`ActivityForm`, `Drill`, `Builder`, `IterationTracker`) stayed under Foundation's `_components/` — move them when a second course actually needs them.

---

## Merge complications + recovery

The merge sequence hit three operational issues worth recording:

1. **First merge deleted the base of the next stacked PR.** `gh pr merge --delete-branch` on #124 auto-closed #125 because its base branch (`feature/foundation-content-alignment`) was gone. Lesson: **don't `--delete-branch` on stacked PRs.** Recreated #125's content as #131.

2. **Smoke test failed on #124's base because main had moved forward.** PR #124's base was `c8a0c01`; main was 5 commits ahead with auth-lane fixes that the smoke test depended on. `gh pr update-branch` resolved it by merging current main into the PR branch and re-running CI.

3. **Dashboard refactor (PR #123, "Ledger User Home") landed on main during this session.** Every stacked PR that touched the rename had to take main's new dashboard and re-apply the `AIBI_P_*` → `FOUNDATION_*` rename mechanically. Same fix three times.

4. **Stacked-PR rebases of #126 and #129 became cross-cutting.** Collapsed the harness chain by merging #127 (which included #126's commits) and closing #126 as superseded. Cherry-picked #129's content onto a fresh branch off main as #163.

---

## Reference

- **Inventory doc that drove this work:** [`docs/foundation-content-inventory-2026-05-17.md`](../foundation-content-inventory-2026-05-17.md)
- **Harness README + contract test:** `src/lib/lms/README.md`, `src/lib/lms/__tests__/example-course.config.ts`

---

## Open follow-ups (none blocking)

- When AiBI-S becomes a shipping product, design `<AISimulation>` and migrate AiBI-S onto the harness with real product constraints (B5, B6 deferred from this session).
- Toolbox migration `00022` runs the prompt library on production. If a learner doesn't see expected prompts at `/dashboard/toolbox/library`, verify the migration has been applied to the production database (not just local).
