# Decision — Course Format Variants

**Status:** Decided 2026-04-18
**Deciders:** James Gilmore + Claude
**Task:** H3 (P1 from the course-harness follow-ups)

## Context

The course harness ships with one format: self-paced, single track, three phases of items. Live today at `/courses/aibi-s/*`. AiBI Foundations (still on its own components) is also self-paced with modules grouped by pillars.

Future courses will likely need:

- **Cohort format.** Scheduled live sessions, weekly deadlines, peer discussion, cohort-scoped leaderboards.
- **Workshop format.** Short (1-2 day), intensive, single-track, pre-read + live + follow-up structure.
- **Playground / sandbox.** No course structure at all — just tools and prompts. Maybe AiBI-L's fCAIO-assist tool lives here.

The question: how does the harness accommodate these without either forking into N copies or producing one mega-component with every-format-in-one-if-else?

## Options considered

### Option A — Single harness, optional feature blocks in CourseConfig

Every course uses `<CourseShell>`, `<CourseSidebar>`, `<CourseHeader>`, `<CourseTabs>`. The `CourseConfig` type grows optional blocks:

```ts
interface CourseConfig {
  // ...existing fields...
  readonly cohort?: CohortConfig;       // schedule, weekly deadlines, live links
  readonly discussion?: DiscussionConfig;
  readonly workshop?: WorkshopConfig;
}
```

Harness components check for these blocks and render format-specific UI when present.

**Pros:** single source of truth, declarative, TypeScript can discriminate, adding a format = new optional block.

**Cons:** `CourseConfig` grows over time, harness components accrue conditionals, risk of unused fields cluttering every config.

### Option B — Multiple shell variants sharing primitives

Separate top-level shells: `<SelfPacedShell>`, `<CohortShell>`, `<WorkshopShell>`. Each composes the same primitives (`CourseSidebar`, `CourseTabs`) plus format-specific pieces.

**Pros:** clean separation, no conditionals, easier to iterate on one format, clear mental model ("this course uses the cohort shell").

**Cons:** duplication of layout scaffolding, more files to touch when primitives evolve, new formats = new shell file.

## Decision

**Option A — with an escape hatch to Option B when formats truly diverge.**

### The rule

If two formats share the core structural DNA — sections of items with progress tracking — use **Option A** (optional config blocks).

If a format has fundamentally different UX — no items, no sections, different primary navigation — fork a new shell (**Option B**) under `src/lib/<format>-shell/` and share only the atomic primitives that still apply (`CourseTabs`, styling tokens).

### Why Option A first

1. Self-paced, cohort, and workshop all have: a track/course, sections (pillars/phases/themes), items (modules/units/sessions), and per-user progress. The sidebar, header, and tabs are the same shape in all three. Forking shells early means forking 95% duplicate code.
2. The *differences* are additive: cohort adds a schedule widget; workshop adds a session timer; self-paced has neither. Optional config blocks express this precisely.
3. TypeScript's discriminated unions (or just optional blocks) make the type system enforce consistency — you can't accidentally read `config.cohort.schedule` when `cohort` is undefined.
4. New contributors grok "add an optional block to the config" faster than "create a new shell and wire it up."

### When to break to Option B

Fork a new shell when any of these is true:

- The new format has no sections+items structure (e.g., a free-form playground, an administrative dashboard, a certification-display page).
- Adding the format as a config block would require more conditionals in harness components than the shared code is worth (rough rule of thumb: if more than 3 harness components need `if (config.newFormat)` branches, break).
- The format's primary navigation is fundamentally different (e.g., time-slot-based instead of item-based).

Creating a second shell is not failure — it's honest scoping. The bar is "adding this as a config block actively harms the common cases."

## Applied consequences

### For the next scheduled course type (cohort)

When cohort courses arrive (likely AiBI-L first), extend `CourseConfig` with:

```ts
readonly cohort?: {
  readonly startDate: string;               // ISO date
  readonly cadence: 'weekly' | 'biweekly';
  readonly liveSessions: readonly LiveSession[];
  readonly discussionBoardUrl?: string;
};
```

The sidebar reads `config.cohort` and conditionally shows a "Next live session" block at the top. The header adds a small "Week 2 of 6" pill. No new shell, no fork.

### For a hypothetical sandbox playground

Fork to `src/lib/playground-shell/` — no sections, no items, no progress, different primary nav.

### For AiBI Foundations migration (H6)

AiBI Foundations is a self-paced course with four pillars. It's pure Option A — will migrate cleanly into the existing `CourseConfig` shape when H6 runs.

## Follow-ups

- When authoring the first cohort-enabled course, add the `cohort` block to `CourseConfig` types and update the harness components. That's the moment to prove Option A scales.
- Revisit this decision if the harness accumulates 5+ `if (config.X)` branches in a single component. At that point, the config-blocks approach is telling us to fork.
- Document the specific block shapes (CohortConfig, WorkshopConfig, etc.) as they're added, rather than designing them all upfront. YAGNI.

## Escape-hatch checklist for future contributors

Before adding a new optional block to `CourseConfig`, ask:

1. Does this format share `sections[].items[]` structure? If no, fork shell.
2. Would this be used by at least two courses? If no, is it course-specific content (goes in course.config.ts) rather than format config?
3. Can this be expressed as data, not UI behavior? Data (schedule dates, session links) fits Option A. Radically different interaction models (real-time collab, live quizzing) fit Option B.

If all three pass, Option A. Else, fork.
