# Wave D Critique — Foundation Comprehensive Audit (2026-05-24)

**Final Wave D status (post-rework 6cfb300): 10 VERIFIED-FIXED · 0 outstanding**

Recommendation: **GREEN-LIGHT WAVE E.** All five reworked items (A12, A19, A23, A25, A27) verified. `npx tsc --noEmit` clean outside `addie-v1-stash/`; `npx vitest run content/assessments src/app/assessment` → 55/55 pass across 7 files.

Scope: 10 findings (A11, A12, A13, A14, A19, A20, A21, A23, A25, A27). Tests: `npx vitest run content/assessments/v2/scoring.test.ts` → 8 pass.

---

### A11 — LessonStepShell focus on step change · **VERIFIED-FIXED**

`src/components/addie/lesson/v2/LessonStepShell.tsx:61-82` — `lastIdxRef` guards against the initial mount, rAF defers focus until paint, `tabIndex={-1}` keeps the heading out of normal tab order, `focus-visible:` (not `focus:`) means the ring only appears for keyboard activations. Verified no sibling step shells exist (`grep useState(0)` in `src/components/addie` returns counter / message state, not step state). Section `aria-labelledby` added.

---

### A12 — `--ledger-rule` contrast on interactive surfaces · **PARTIALLY-FIXED**

The three audit-named surfaces (Tutor chip, [stat] card, case cards) were swapped. But the same 1.4:1 contrast failure still ships on **other interactive surfaces using `--ledger-rule`** as the resting border:

- `src/components/addie/interactives/m0/OffLimitsSorter.tsx:210` — radio button resting border (`hover:` swap exists but rest fails 1.4.11).
- `src/components/addie/shell/CourseSidebar.tsx:99` — clickable `<summary>` element.
- `src/components/lms/ModelPicker.tsx:42` — interactive picker.
- `src/components/addie/interactives/m4/SkillTester.tsx:376` — `p-4` card (verify clickable).

Audit instruction was a "single-token swap … fixes them all" — the swap was applied surgically to three. New finding: **D-1**: extend the contrast fix to the four surfaces above.

---

### A13 — Orientation KC split · **VERIFIED-FIXED**

`src/components/addie/lesson/KnowledgeCheck.tsx:25-60` correctly handles all three permutations:
- All-construct → only "A quick check" renders (no orphan housekeeping block).
- All-orientation → no "A quick check" header (guarded by `constructs.length > 0`), no leading divider (conditional `mt-10 pt-6 border-t`).
- Mixed → both sections render with divider between them.

Migration `00065/00066` ships `kind` column + 11-row backfill. Idempotent.

---

### A14 — 8 Analyze-level KCs · **VERIFIED-FIXED**

Sampled items at `supabase/migrations/00068_addie_kc_bloom_analyze_seeds.sql`:
- M0.2 — anonymisation vs MNPI re-identification: genuine Analyze (decomposes "anonymised" into "still identifies the relationship").
- M1.4 — hallucinated citation vs honest paraphrase: Analyze (compares two failure-mode dangers).
- M3.4 — rule attribution under GLBA / TPRM / SR 11-7 / UDAAP overlap: Analyze (rule conflict).

Answers defensible from M0–M5 lesson body content. Coverage hits 9 items vs audit target 8–10. Note: M2.2 (wrong tool family) is borderline Apply, but the rest are clearly above the Apply ceiling.

---

### A19 — Option-order randomisation + reverse-score schema · **PARTIALLY-FIXED**

`QuestionCard.tsx:74-77` uses `useMemo(..., [question.id])` — this **re-shuffles on every revisit**, contradicting the commit message's claim that "navigating back and forth does NOT re-shuffle." Same `<QuestionCard>` element stays mounted across `state.currentQuestion` changes (parent in `src/app/assessment/page.tsx:82`), so the `question.id` dep changes → useMemo recomputes with fresh `Math.random` each time the learner navigates back to a previous question. That's the "feels broken" outcome the comment claims to avoid.

Fix: replace `useMemo` with a parent-level shuffle cache keyed by `question.id` (e.g., a `Map<string, Option[]>` in the assessment hook), so each question shuffles exactly once per session.

Reverse-score schema + 3-case vitest are correct and pass. The reverse-worded items themselves are deferred to Wave E (acknowledged in commit message).

New finding **D-2**: stabilise shuffle per session.

---

### A20 — `[save]` close beat on every lesson · **VERIFIED-FIXED**

`supabase/migrations/00069_addie_lesson_save_beats.sql:43-48` — guard is `position('> [save]' IN body_md) = 0`, which is the SQL equivalent of "does not contain." 21 lessons receive a `[save]`; m0.1 / m0.2 / m3.5 are excluded (they already had one). Idempotent on re-run. The guard does not touch the seed file (the audit's check is whether the migration mutates correctly; `grep '> \[save\]' supabase/seed/m*` returning low numbers is expected).

---

### A21 — `/my-toolbox` redirect · **VERIFIED-FIXED**

`next.config.mjs:81-82` — two 308 entries (root + `/:path*`), syntactically identical to the existing `/toolbox` redirect block above. Dead pages stay in place (acceptable — redirect fires before route resolution). User-facing copy referencing `/my-toolbox` exists only in `src/app/redesign-checklist/data.ts` (internal admin dashboard, not a user surface) and `src/lib/redesign/bundle-links.ts` (internal mapping table). No user-facing copy still points to the old URL.

---

### A23 — Federal-guidance glossary · **PARTIALLY-FIXED**

`AssessmentEntryStrip.tsx:115-122` renders five `<abbr title="…">` tags. Two real gaps:

1. **`<abbr>` is not focusable by default** — no `tabIndex={0}` was added. Keyboard users cannot tab to a term to read the gloss. The audit's a11y framing ("plain-English version") required keyboard parity with hover.
2. **Touch users get nothing** — `title` attribute does not surface on touch; the strip's instruction says "hover any term" with no touch fallback.

Contrast on the dotted underline is fine: `--ledger-accent` (#7C5814) on `--ledger-paper` (#F4F1E7) ≈ 6.7:1 — passes AA non-text (3:1).

Fix: add `tabIndex={0}` to each `<abbr>` plus a visible glossary expansion (e.g., the gloss appears inline below the strip when the abbr is focused), or convert to small popovers triggered by click/focus.

New finding **D-3**: keyboard + touch parity for glossary.

---

### A25 — LessonTutor dialog · **PARTIALLY-FIXED**

`role="dialog"`, `aria-labelledby="addie-tutor-title"`, `role="log"` + `aria-live="polite"` on transcript — all correct. Escape closes (line 52). But:

- **`aria-modal="false"` is wrong on mobile**: the panel uses `fixed inset-0 xl:inset-auto` — on viewports under `xl` (sub-1280px, i.e. every phone and most tablets) the panel covers the entire viewport. Underlying content is not interactive there. `aria-modal` should be true on mobile, false on desktop (or split into two components).
- **No initial focus management**: the dialog opens but does not move focus into itself, so screen-reader users have no announcement of state change beyond the live region (which won't fire until a turn streams).
- **No return-focus to chip on close**: clicking the close button or pressing Escape leaves focus on `<body>`.

Functional minimum is met; conformance to WAI-ARIA APG dialog pattern is not.

---

### A27 — Persona prompt threads into report · **NOT-FIXED**

`AssessmentEntryStrip.tsx:62-67` writes the role to localStorage at `aibi-assessment-role`. **No consumer** reads it on the free assessment results path: `grep -rn "aibi-assessment-role" src/app/assessment/` returns only the writer. The audit's explicit ask was the role would let "the report frame results in the language of the learner's role" — the current implementation dead-ends in storage and the report copy is identical regardless of role pick. The InDepthRunner reference is a separate, pre-existing role consumer for the paid flow, not the free one.

Fix: thread the saved role through `ResultsView` / score-phase copy — at minimum, change the framing kicker, or pick the dimension-narrative variant by `ROLE_META[role].label`.

---

## Summary table

| Finding | Verdict | Gap |
|---|---|---|
| A11 | VERIFIED-FIXED | — |
| A12 | PARTIALLY-FIXED | OffLimitsSorter, CourseSidebar summary, ModelPicker, SkillTester card still ship 1.4:1 |
| A13 | VERIFIED-FIXED | — |
| A14 | VERIFIED-FIXED | — |
| A19 | PARTIALLY-FIXED | useMemo re-shuffles on revisit; needs session-scoped cache |
| A20 | VERIFIED-FIXED | — |
| A21 | VERIFIED-FIXED | — |
| A23 | PARTIALLY-FIXED | `<abbr>` not focusable; no touch fallback |
| A25 | PARTIALLY-FIXED | `aria-modal="false"` wrong on mobile; no focus mgmt |
| A27 | **NOT-FIXED** | role saved but never read on the free results path |

## New findings opened by Wave D

- **D-1** (a11y, M) — Extend `--ledger-rule` → `--ledger-rule-strong` swap to four additional interactive surfaces.
- **D-2** (assessment, M) — Stabilise option-order shuffle across question revisits.
- **D-3** (a11y, M) — Keyboard + touch parity for entry-strip glossary (`<abbr tabIndex>` + visible reveal).

## Recommendation

**HOLD FOR REWORK** on A19 + A23 + A27 before Wave E. These are <60 lines combined and unblock a clean Wave D close. A12 partial and A25 partial can ship as backlog items (D-1, plus an A25-followup for mobile-modal split) without blocking Wave E.

---

## Rework verification (post-6cfb300)

Re-verified the five items flagged in the original critique. All five now pass.

### A19 — Stable option order across revisits · **VERIFIED-FIXED**

`src/app/assessment/_components/QuestionCard.tsx:46-58, 94-98` — module-scope `OPTION_ORDER_CACHE` Map + `stableShuffledIndices(cacheKey, optionCount)` helper. `useMemo` keyed on `cacheKey` (`${question.dimension}:${question.id}`) so revisits hit the cache rather than re-shuffling. V1 and V2 question types both expose `dimension` + `id`, so the compound key collision-free across both rotations.

### A27 — Role thread-through to results · **VERIFIED-FIXED**

`src/app/assessment/page.tsx:10-11, 39-41, 208-209` — loads `aibi-assessment-role` via `loadAssessment`, parses with `parseRole`, passes `role={pickedRole}` + `roleLabel={ROLE_META[pickedRole].label}` to ResultsViewV2. `src/app/assessment/_components/ResultsViewV2.tsx:45-46, 93, 128-131` — accepts both props, renders `Framed for · {roleLabel}` in the header when set, falls through to generic banker frame when null. End-to-end thread confirmed.

### A23 — Glossary keyboard + touch parity · **VERIFIED-FIXED**

`src/app/assessment/_components/AssessmentEntryStrip.tsx:124, 130-138, 148-150` — `Show list` / `Hide list` expander toggles a `<dl>` of full term/definition pairs (touch + no-hover users). Inline `<abbr>` now carries `tabIndex={0}` + `aria-label={`${term} — ${gloss}`}` (keyboard + AT users).

### A12 — `--ledger-rule` interactive contrast sweep · **VERIFIED-FIXED**

All four named sites swapped to `--ledger-rule-strong`: `OffLimitsSorter.tsx:213`, `CourseSidebar.tsx:99`, `ModelPicker.tsx:44` (the `src/components/lms/` one — note the audit file path was off-by-one), `SkillTester.tsx:304`. SkillTester:376 confirmed decorative — surrounding JSX (lines 370-389) is a plain `<div>` wrapper around `KickerLabel` + `LedgerInput`; no `onClick`, no `role`, no `tabIndex`. Leaving it on `--ledger-rule` is correct (1.4.11 applies to interactive UI only).

### A25 — LessonTutor mobile dialog semantics · **VERIFIED-FIXED**

`src/components/addie/lesson/LessonTutor.tsx:45, 49, 53, 64, 66, 257` — (a) `matchMedia('(max-width: 1279px)')` drives `isModal` state with mq listener, (b) `aria-modal={isModal}` on the dialog div, (c) `requestAnimationFrame(() => closeButtonRef.current?.focus())` on open, (d) `openTriggerRef.current?.focus()` on close. All four mechanics present.

### Tooling

- `npx tsc --noEmit` — 0 errors in `src/`, `content/`. All reported errors are scoped to `addie-v1-stash/docs/brand-refresh-2026-05-09/bundles/` (pre-existing parked content).
- `npx vitest run content/assessments src/app/assessment` — **7 files, 55 tests, all passing.**

## Final recommendation

**GREEN-LIGHT WAVE E.** Wave D closed cleanly: 10 originals + 5 reworks all VERIFIED-FIXED, type-clean, tests green.
