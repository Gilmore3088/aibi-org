# Phase 1 — Guided Lesson Shell + M0–M3 Migration (Design Spec)

**Created:** 2026-05-25
**Branch:** `feature/addie-v2`
**Parent plan:** [`Plans/aibi-foundations-ux-recovery-2026-05-25.md`](../../../Plans/aibi-foundations-ux-recovery-2026-05-25.md)
**Status:** Pending user review

## Purpose

Migrate the 13 free Foundation Course lessons (M0.1, M0.2, M1.1–M1.4,
M2.1–M2.4, M3.1–M3.5) from three different shells (`M01Experience`,
`M02Experience`, generic `LessonPlayer`) onto a single canonical
`LessonStepShell`. Inside each migration commit, land the content-polish
fixes that surfaced from the 2026-05-24 reviewer fleet: plain-English
asides on first-use jargon, banded-estimate timing honesty, a
"what does an AI tool look like" onboarding frame in M0.1, the
M3.3 cognitive-overload split, and a typography-restraint pass.

This is **Phase 1 of the multi-phase recovery plan**. Phases 2–4 (the
Workbench Pack, Artifact Review Shell + leadership-track depth, and
funnel/systems wiring) are out of scope for this spec and get their own
spec → plan → implementation cycles.

## Why this matters

The 2026-05-24 reviewer fleet (CEO Bill Hagedorn, CRO Margaret Holloway,
Branch Mgr Devon Reyes, Sr PM Vera Kowalczyk) and the 2026-05-25 product
review converge: M0–M3 content is the strongest banker-facing AI
orientation any of them has seen in two years, but the surface running
it is heterogeneous — three different shells with different prop
contracts, typographies, and nav behaviours. The content lands despite
the surface, not because of it. The plan locks this as Phase 1 (Decision
#1, 2026-05-25 DECISIONS entry) because every later phase — Workbench
Pack, Artifact Review Shell, leadership branches — needs a stable
canonical lesson container to build against.

## Architecture

### Strategy: hybrid migration

| PR | Scope | Lessons migrated | Cumulative state |
|---|---|---|---|
| **PR1** | Extract `LessonStepShell` + migrate M0.1 + M0.2 onto it. Shell becomes the canonical reference. | 2 / 13 | Shell live; M0 on new Shell; M1–M3 still on `LessonPlayer` |
| **PR2** | Migrate M1.1–M1.4 | 4 / 13 | M0+M1 on new Shell |
| **PR3** | Migrate M2.1–M2.4 | 4 / 13 | M0+M1+M2 on new Shell |
| **PR4** | Migrate M3.1, M3.2, M3.4, M3.5 + land M3.3 split (M3.3a + M3.3b) | 6 / 13 | All M0–M3 on new Shell; legacy `LessonPlayer` no longer reached by M0–M3 |
| **PR5** | Acceptance — Playwright suite, mobile pass on iPhone 13 mini viewport, build green, reviewer walk-through | — | Phase 1 closed |

**Rationale.** M0.1 + M0.2 are the only lessons today on bespoke shells
(`M01Experience`, `M02Experience`); the rest of M1–M3 run through the
generic `LessonPlayer`. Landing M0 first makes the Shell's reference
implementations the most-reviewed lessons in the course (per the
reviewer-fleet consensus), so subsequent M1–M3 migrations mirror a
working pattern instead of inventing one. The bounded "mixed state"
period in production sits at the M0→M1 boundary, which learners cross
exactly once.

### Coexistence pattern (during migration)

A new `lesson.shell_kind` field on `addie.lessons` (`'step' | 'legacy'`,
default `'legacy'`) lets the route layer at `/foundation/[moduleId]/[lessonId]`
pick the renderer. No feature flag, no env var — the seed row IS the
flag. Reverting a single lesson back to legacy during the migration
window is a one-row UPDATE.

```
                     ┌─────────────────────────┐
GET /foundation/m1.2 │ addie.lessons.shell_kind │
                     └────────────┬────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
                'step'                          'legacy'
                  │                               │
                  ▼                               ▼
        ┌─────────────────┐             ┌─────────────────┐
        │ LessonStepShell │             │  LessonPlayer   │
        │   (Phase 1)     │             │    (legacy)     │
        └─────────────────┘             └─────────────────┘
```

`M01Experience` and `M02Experience` are deleted in PR1 (their content
moves into M0.1 and M0.2 step seeds on the Shell). `LessonPlayer`
stays in the tree until PR4 ships, then gets deleted in PR5 once
zero M0–M3 routes reference it.

### Decoupling boundaries

- **`LessonStepShell`** — pure presentation. Receives lesson + step + handlers, renders. No data fetching, no business logic, no auth checks.
- **Lesson body parser** — its own module. Renders `body_md` → React, expands `[[Gloss:term]]` markers via the `<Gloss>` component.
- **Glossary** — static content file (`content/courses/foundation-program/glossary.ts`). No DB call.
- **Track-variant resolution** — stays in the existing helper. No change in Phase 1.
- **Telemetry / analytics hooks** — stay where they are. No change in Phase 1.

## Component contract — `LessonStepShell`

```typescript
interface LessonStepShellProps {
  lesson: {
    id: string;            // 'm0.1', 'm1.3', etc.
    moduleId: string;      // 'm0', 'm1', etc.
    title: string;
    kicker?: string;       // mono-caps overline (e.g. "MODULE 1 · LESSON 2")
    timingBand: string;    // "8–12 min" — banded, no exact promise
    objectiveMd?: string;
    transferMd?: string;
  };
  steps: LessonStep[];     // ordered; each has bodyMd + optional interactive slot
  currentStepIndex: number;
  onStepChange: (next: number) => void;
  onComplete: () => void;
  rightRail?: ReactNode;   // Coach drawer, Toolbox snippet — slot, not coupling
  trackVariant?: TrackVariant;  // pass-through; Shell doesn't resolve
}

interface LessonStep {
  id: string;
  bodyMd: string;          // markdown with [[Gloss:term]] support
  interactive?: ReactNode; // e.g. OffLimitsSorter, SpotTheViolation
  knowledgeCheck?: KnowledgeCheck;
}
```

**Rendering regions:**

1. **Top metadata bar.** Kicker (mono caps) · title (Newsreader display) · timing band (mono) · progress indicator. Single line on desktop; stacks on mobile.
2. **Body region.** One step at a time. Markdown rendered via the parser with `<Gloss>` interpolation. Optional `interactive` slot below the body.
3. **Right rail slot.** Optional region for the Coach drawer / Toolbox snippet. Collapses to a sheet on mobile (existing pattern from `M02Experience`).
4. **Bottom nav.** Reuses the existing `LessonStickyNav` — single bottom bar; no duplicate nav anywhere else in the surface.

**State ownership.** The Shell owns NO lesson identity state. `currentStepIndex` and `onStepChange` are controlled props; parent (the route component) owns the routing.

## Data model changes

Two Supabase migrations. Both small, both via `/supabase-migrate` per
CLAUDE.md. Both fully reversible by reverting the migration file:

### Migration 00062 — `addie.lessons.shell_kind`

```sql
ALTER TABLE addie.lessons
  ADD COLUMN shell_kind text NOT NULL DEFAULT 'legacy'
    CHECK (shell_kind IN ('step', 'legacy'));
```

Each migration PR (PR1–PR4) flips the relevant lesson rows from
`'legacy'` to `'step'` in the same commit that changes the component.

### Migration 00063 — M3.3 split

```sql
-- rename existing m3.3 to m3.3a (curriculum doc updates body_md
-- separately to be default-brief-only content)
UPDATE addie.lessons SET id = 'm3.3a' WHERE id = 'm3.3';

-- insert m3.3b for advanced patterns
INSERT INTO addie.lessons (id, module_id, title, ...) VALUES
  ('m3.3b', 'm3', 'Advanced prompt patterns', ...);
```

`content/courses/foundation-program/module-3.ts` updated to reflect the
new lesson order. M3.5's starter-pack reference (currently pointing to
`m3.3`) updated to `m3.3a`. Sidebar nav follows automatically because it
reads from `module-3.ts`.

No RLS changes (lesson rows are public-read). No new tables.

## Inline vocabulary asides — `<Gloss>`

A small React component, rendered inline in lesson `body_md` via a
markdown extension. Format in source:

```md
A learner who pastes a draft adverse-action letter into ChatGPT risks
an [[Gloss:SR 11-7]] violation — your bank's model risk function would
have to inventory and validate that prompt.
```

Renders as: the term inline with a subtle dotted underline + a
hover/tap popover containing the one-line plain-English gloss.

**Implementation:** uses native `<details>`/`<summary>` (zero deps,
accessible by default, works on mobile tap). HeadlessUI Popover is the
documented upgrade path if `<details>` styling proves too constrained
for the Ledger aesthetic.

**Glossary content** lives in `content/courses/foundation-program/glossary.ts`
— single source of truth, keyed by term:

```typescript
export const glossary: Record<string, string> = {
  'SR 11-7': "the Fed's model risk management guidance — the rulebook for how banks govern AI/model outputs",
  'MNPI': "material non-public information — facts whose disclosure could move markets, harm members, or pre-empt a regulator",
  'Reg E': "the Fed's electronic-funds-transfer rule",
  'OCC': "the Office of the Comptroller of the Currency — national-bank regulator",
  'ECOA / Reg B': "the Equal Credit Opportunity Act and its implementing rule — fair-lending requirements",
};
```

`chain-of-thought` and `few-shot` jargon are addressed by **renaming the
M3.3b pattern headers** to plain English (`"Make it think out loud"` /
`"Show examples first"`) rather than glossing — the jargon disappears
from the lesson surface entirely. The technical names appear once in a
subtitle, not as the dominant label.

Missing entries render the term plain — no crash. First-use marker is
per-page (not per-session): if a learner returns to a lesson, the gloss
appears again.

## "What does an AI tool look like" frame (M0.1 only)

A new React component, `AiToolAnatomy`, embedded as a step inside M0.1
between the course-shape stat card and the M0.1→M0.2 transition.

**Visual:** annotated SVG illustration of a generic chat UI. Labelled
regions: input box · send affordance · output area · conversation
history sidebar. No vendor logo, no screenshot — that dates immediately
and creates licensing questions. The generic shape gives a learner who
has never opened Claude/ChatGPT a mental anchor without endorsing a
specific tool.

**Rationale (Branch Mgr Devon finding #9):** a learner reaches M2.3
(the first-conversation sandbox) still not knowing what an AI tool
*looks like*. This frame closes the gap.

## Timing honesty (M0.1 + per-lesson cards)

M0.1's stat card changes from `6 · 24 · <15m` to:

> **6 modules · 24 lessons · 8–25 min each · drills longer, clearly flagged**

Per-lesson timing band fields retimed per Branch Mgr Devon's measured
times (recovery plan Finding #8):

| Lesson | Old promise | New band |
|---|---|---|
| M3.2 (A/B sandbox) | <15 min | 20–25 min |
| M3.3a (default brief) | — (new) | 10–15 min |
| M3.3b (advanced patterns) | — (new) | 12–18 min |
| M3.4 (Spot the Violation drill) | <15 min | 20–30 min |
| M3.5 (Starter Prompt Pack) | <15 min | 35–45 min |

Content change only; no schema change. Each lesson's `timingBand` field
is already a string column on `addie.lessons`.

## Typography-restraint pass

Lands inside each migration commit. Audit rules (enforced by the Shell
prop contract + a Storybook visual diff):

- Mono caps (`font-mono uppercase tracking-wider`) ONLY on metadata,
  status, breadcrumb, kicker — never body labels
- Body kicker labels max `tracking-[0.18em]`
- No mono dominating any single visible region
- No new font weights or families introduced
- Italics retired (already a site-wide rule per CLAUDE.md; verify the
  Shell respects `*{font-style:normal!important}`)

## Error handling

| Failure mode | Behavior |
|---|---|
| Shell receives empty `steps` array | Render empty-state card: "This lesson is being authored. Check back soon." |
| Shell receives lesson with missing `bodyMd` for a step | Render the step container with a placeholder; log to telemetry |
| `<Gloss>` term missing from glossary | Render plain text; log dev warning (no user-visible error) |
| Lesson row has `shell_kind='step'` but no `steps` data | Fall back to a single step rendering `body_md` whole |
| Route layer encounters `shell_kind` enum value it doesn't know | Default to `'legacy'`; log warning |

No throws on the lesson surface — defensive everywhere. Errors are
logged through the existing telemetry path; learners never see a
stack trace.

## Testing

| Layer | Coverage |
|---|---|
| **Unit (Vitest)** | `LessonStepShell` prop contract; `<Gloss>` glossary fallback; markdown extension for `[[Gloss:term]]`; `AiToolAnatomy` snapshot |
| **Component (Storybook visual diff)** | Each migrated lesson, before + after each migration PR. Stored in the PR description as the canonical visual artifact. |
| **E2E (Playwright)** | M0 → M3 happy path on desktop and iPhone 13 mini viewport; lesson nav (prev/next/jump); right-rail collapse on mobile; M3.3a + M3.3b render in correct order on `/foundation/m3` |
| **Build** | Zero TypeScript errors; `npm run build` green at the end of each PR |
| **Acceptance (PR5)** | Reviewer walk-through against the Shell prop contract doc with the live URL open |

Mobile pass on iPhone 13 mini specifically per Branch Mgr Devon's
tighter target. Surfaces to check: `OffLimitsSorter` thumb targets
(≥ 44px), `[case:good]`/`[case:bad]` side-by-side stacking, M3.4
drill scroll behavior.

## Acceptance criteria

- [ ] All 13 free lessons have `shell_kind='step'` in seeds
- [ ] All 13 lessons render through `LessonStepShell`
- [ ] Zero imports of `M01Experience`, `M02Experience`, or
      `LessonPlayer` in M0–M3 routes
- [ ] `npm run build` passes; zero TypeScript errors
- [ ] Playwright passes on desktop + iPhone 13 mini viewport
- [ ] Reviewer walk-through complete against the Shell prop
      contract doc with the live URL open
- [ ] M3.3 split shipped: `m3.3a` (default brief only) +
      `m3.3b` (advanced patterns) render in correct order
- [ ] M0.1 timing card shows banded estimate; M3.2 / M3.3a /
      M3.3b / M3.4 / M3.5 per-lesson bands match the table above
- [ ] M0.1 `AiToolAnatomy` step renders before M0.1→M0.2 transition
- [ ] Glossary entries render via `<Gloss>` for at least:
      `SR 11-7`, `MNPI`, `Reg E`, `OCC`, `ECOA / Reg B`
- [ ] `M01Experience` and `M02Experience` deleted from the codebase
- [ ] `LessonPlayer` deleted from the codebase (PR5)

## Out of scope (Phase 1 explicitly does NOT touch)

- M4 / M5 lesson content (Phase 2)
- The Workbench Pack artifact + `WorkbenchPackBuilder` (Phase 2)
- `addie.lessons.takeaway_artifact_type` enum (Phase 2)
- Paid Workbench Shell (Phase 2)
- Artifact Review Shell (Phase 3)
- Adding leadership-track branches beyond what already exists (Phase 3)
- Worst-case-by-department lesson (Phase 3)
- Seat-allocation decision tree (Phase 3)
- Assessment sessionStorage → localStorage (Phase 4)
- Welcome-back personalization on `/foundation` (Phase 4)
- Result-page CTA repositioning (Phase 4)
- Gate cost-shape parity fix (Phase 4)
- Stripe success-URL auth binding (Phase 4)
- `/my-toolbox` vs `/dashboard/toolbox` consolidation (Phase 4)
- Email subject-line changes (Phase 4)
- Tagline (Decision #4 locked: keep "Turning Bankers into Builders")

## Open questions (none block PR1)

These can be resolved during the migration; they do not block starting
PR1 because they affect later PRs only:

1. **Should `<Gloss>` track first-appearance per-lesson or
   per-module?** Default in this spec is per-page (which simplifies the
   parser). If per-module-once would land better pedagogically (i.e.
   the same term only glosses once across M1.1, M1.2, M1.3 even if
   each contains it), revisit before PR2 lands.

2. **Should `LessonStepShell` accept a `previousLessonId` /
   `nextLessonId` pair, or compute them from `module-3.ts`?** The
   sticky nav today computes from a route helper; carry that pattern
   into the Shell rather than passing as props.

3. **Mobile right-rail behavior.** Current `M02Experience` collapses
   the Coach drawer to a sheet on mobile. Confirm this behavior
   migrates cleanly to the Shell; if not, deviation logged in PR1.

## Sources

- Parent plan: `Plans/aibi-foundations-ux-recovery-2026-05-25.md`
- Decisions Log: 2026-05-25 entry
- Reviewer fleet: `docs/reviews/foundation-{ceo,cro,branch-mgr,e2e}-*-2026-05-24.md`
- Comprehensive audit: `docs/reviews/foundation-comprehensive-audit-2026-05-24.md`
- Curriculum spine: `content/courses/foundation-program/module-{0..3}.ts`
- Existing shell migration doc: `docs/Foundation-Course-ADDIE/AiBI_Lesson_Shell_Migration.md`
- Brand rules: `CLAUDE.md` Design Context + Brand & Copy Rules sections
