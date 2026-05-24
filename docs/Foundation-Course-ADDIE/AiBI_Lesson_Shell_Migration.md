# AiBI Foundation — Lesson Shell v2 Migration

*The v2 lesson shell — a stepped Learn → Try → Check → Save → Recap experience that replaces the dense "everything on one scrolling page" v1 layout. Built 2026-05-24 in response to a sharp design critique. Live on m0.2 as the proof of concept.*

**Authority:** Pairs with `AiBI_Design_System_Spec.md` and `AiBI_Foundation_Course_ADDIE_Design_v2.md`. Implements the per-lesson UX direction the critique laid out.

---

## What changed

| | v1 (existing) | v2 (m0.2 today) |
|---|---|---|
| Layout | Three columns: course sidebar · scrolling body · TOC + tutor rail | Single 768-max column, stepped panels |
| Density | Video + transcript + KC + sorter + takeaway + recap + nav all stacked | One mode per screen; the learner always knows what to do next |
| Course outline | Always-on left rail with all 24 lessons | Hidden by default; minimal "Module · Lesson N of N" header |
| Navigation | Prev/next in three places (top, bottom, sticky pill) | One persistent bottom bar |
| Sorter / interactive | Below the fold, after the prose | The hero of its own step |
| Takeaway artifact | "Save to Toolbox" button after the KC | Its own dedicated step with the full reference card visible |
| Recap | Generated paragraph at the bottom | "Your Monday move" card — operational, scannable, actionable |
| Tutor | Bottom-right chip (kept) | Same — works alongside v2 |

---

## The 6-step canonical pattern

Every v2 lesson follows the same shape. Per-lesson variants drop steps they don't need (a video-only lesson has no Try; a worksheet lesson has no Sort) but the order never changes.

| # | Step | Purpose | What lives here |
|---|---|---|---|
| 01 | **Rule / Concept** | The big idea, calm and clear | `RuleHeroCard` or `ConceptHeroCard` |
| 02 | **Move** | The action the rule produces | `AnonymizationFlow` (M0), `PromptBriefBuilder` (M3), `SkillSketcher` (M4)… |
| 03 | **Try** | The hands-on widget | Existing interactives — `OffLimitsSorter`, `ToolLandscapeMatrix`, sandbox, etc. |
| 04 | **Check** | Quick comprehension check | Existing `KnowledgeCheck` component |
| 05 | **Save** | The takeaway artifact, in full | Per-lesson artifact card (e.g. `DataDisciplineCardArtifact`) |
| 06 | **Recap** | "Your Monday move" operational card | Inline card; no LLM call needed for the recap card itself |

For lessons where one step doesn't apply, drop it — but never insert a step out of order.

---

## How to migrate a lesson to v2

The mechanism is intentionally simple: the lesson page checks the lesson id and routes to a v2 experience component when one is registered.

In `src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx`:

```ts
const useV2Shell = payload.lesson.id === 'm0.2';
if (useV2Shell) {
  return <M02Experience checks={…} interactiveExercise={…} … />;
}
// fallback to the existing LessonPlayer
```

To add a new v2 lesson:

1. **Build the lesson-specific experience composer** under `src/components/addie/lesson/v2/<MID>Experience.tsx`. Compose the 6 steps using `LessonStepShell` + existing widgets + new hero components.
2. **Reuse existing widgets** wherever possible (`OffLimitsSorter`, `KnowledgeCheck`, `SkillBuilder`, sandbox views).
3. **Build a per-lesson hero component** only when an existing one doesn't fit. The bar is high — the goal is a small reusable kit, not a per-lesson snowflake.
4. **Add the lesson id to the check** in the lesson page. Don't replace the v1 path until all lessons are migrated.
5. **Test step-by-step** with the Playwright pattern in `/tmp/aibi_v2_check.py` — walk every step, screenshot, confirm the strip→generalize→ask move (or the lesson's equivalent) is visibly the hero.

---

## The shared components (today)

Under `src/components/addie/lesson/v2/`:

| Component | Use |
|---|---|
| `LessonStepShell.tsx` | The container. Steps array, progress strip, single bottom nav, keyboard ←/→ and J/K. Every v2 lesson uses this. |
| `RuleHeroCard.tsx` | Screen 1 — a big rule statement with elevator-test parchment footer. Generic enough to reuse for any "the one rule" or "the one principle" step. |
| `AnonymizationFlow.tsx` | Screen 2 specifically for m0.2 — strip→generalize→ask interactive. The strip pattern itself generalizes; consider extracting a `StripPattern` primitive when a second lesson needs it. |
| `DataDisciplineCardArtifact.tsx` | Screen 5 for m0.2 — the saved Data Discipline Card. Template for future artifact cards: full reference content visible, save button as a side effect, not the value. |
| `M02Experience.tsx` | The m0.2 composer. Read it as the template for `M11Experience`, `M14Experience`, etc. |

---

## What we kept

- **The AI tutor** (`LessonTutor`) — works identically on v2 lessons. Bottom-right chip → side-rail sheet. The tutor is lesson-aware and the system prompt locks it to the current lesson body regardless of which shell is in use.
- **The KnowledgeCheck component** — used as the Check step's panel content.
- **Every existing interactive widget** — `OffLimitsSorter`, `ToolLandscapeMatrix`, `SpotTheViolation`, `SkillBuilder`, `PRDBuilder`, etc. They all slot into the Try step.
- **The seed body_md** — the existing dual-layer SCRIPT/PRODUCTION content is still authoritative. The v2 shell consumes it differently (one section per step) instead of rendering it linearly.

---

## What we deferred (not in this MVP)

- **Course outline drawer.** v2 simply hides the sidebar. A "View full course outline" button + slide-in drawer is the next layer. ~2 hr.
- **Per-step deep linking.** `?step=3` on the URL so a learner can resume mid-lesson. ~1 hr.
- **Save-on-step-complete events.** Emit `lesson_step_complete` to `addie.events` for analytics. ~30 min.
- **Confetti on save.** Not yet. The user's critique was clear: no marketing-style affirmations. The "✓ Saved to Toolbox" state change is the affirmation.

---

## Recommended migration order

Roll out v2 in lesson groups, not one at a time. Each group shares enough structure that the composers reuse each other's patterns.

1. **M0 complete** — m0.2 done; m0.1 next (rule of "this course" + track picker as Try).
2. **M1 awareness** — m1.1 + m1.4 are great fits (one rule, then good/bad cases as Sort). m1.2 needs the matrix as Try.
3. **M2 access** — m2.1 + m2.2 are short concept lessons; m2.3 sandbox is the first non-trivial Try step.
4. **M3 prompting** — m3.1 (anatomy) maps cleanly; m3.2 (A/B sandbox) is the biggest test of Try+Check chemistry.
5. **M4 + M5** — paid tier; defer until M0–M3 are converted and a learner cohort has shipped feedback.

The rollout is **not blocking** — every unmigrated lesson keeps the v1 shell. Migration is opt-in, lesson by lesson.

---

## Open questions

1. **Should the v2 shell own analytics emits for step transitions?** Probably yes — `lesson_step_view` per panel gives much sharper drop-off data than the current per-page emit.
2. **Should a learner who returns to a v2 lesson resume mid-flow?** Lean yes. Persist `lastStep` to `addie.learner_progress` and start there on re-entry.
3. **Should the "Save" step have a printable view?** Likely. The Data Discipline Card is meant to live on a desk. Add `window.print()` styling once a learner asks for it.

---

*Last updated 2026-05-24. Owned by the lesson-shell work. Update when a new lesson migrates or a new hero component lands.*
