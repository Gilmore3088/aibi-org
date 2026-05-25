# Tasks — AiBI Foundations UX Recovery (Plans/aibi-foundations-ux-recovery-2026-05-25.md)

Companion task list for the UX recovery plan. Track open work here. When all
boxes in a phase check, mark the phase COMPLETE in the plan and move on.
When the whole file is closed, move it to `tasks/_done/`.

Four directional decisions are **locked** (see plan §"Decisions Locked
2026-05-25" + DECISIONS.md 2026-05-25 entry):

1. Phase 1 = Guided Lesson Shell extraction + M0–M3 migration.
2. M4's primary artifact = Workbench Pack (replaces "AI Work Profile").
3. M5 stays Projects and Context (Write a Project Brief); re-threaded to
   feed a Workbench Pack run, not the old Profile.
4. Tagline kept: "Turning Bankers into Builders."

---

## Phase 0 — close-out (today, 2026-05-25)

- [x] P0.1. Plan rewritten from "proposed" draft into "active" plan;
      four locked decisions recorded; 14 net-new findings from the
      2026-05-24 reviewer fleet integrated; Phase 1 made concrete
- [x] P0.2. DECISIONS.md entry appended (2026-05-25)
- [x] P0.3. Operator-canvas scripts carried forward from
      `feature/addie-v1` to `feature/addie-v2`
      (`scripts/aibi_canvas.py`, `scripts/aibi_module_bundles.py`)
- [x] P0.4. Task file created (this file)
- [ ] P0.5. Row appended to `tasks/MASTER.md`
- [ ] P0.6. Row appended to `CHRONOLOGY.md`
- [ ] P0.7. Initial commit on `feature/addie-v2` covering all of
      Phase 0 (plan + DECISIONS + tasks + MASTER + CHRONOLOGY +
      canvas scripts) — operator approval required before push
- [ ] P0.8. Flag the 683MB `addie-v1-stash/` snapshot dir on
      `feature/addie-v1` for separate cleanup (not part of this
      plan — note in next session handoff)

---

## Phase 1 — Guided Lesson Shell + M0–M3 migration

**Goal.** Every free lesson (M0.1, M0.2, M1.1–M1.4, M2.1–M2.4, M3.1–M3.5
= 13 lessons) runs on the same canonical `LessonStepShell`. Typography,
timing, and vocabulary asides land *inside* each migration commit so
no file gets touched twice.

### Workstream A — Shell extraction (does not ship to learners alone)

- [ ] A1. Extract `LessonStepShell` from `M02Experience` into a
      generic component with a documented prop contract
      - Source: `src/components/addie/lesson/M02Experience.tsx` (or
        equivalent — confirm path during audit)
      - Target: `src/components/addie/lesson/LessonStepShell.tsx`
      - Constraint: visual parity with the M0.2 implementation;
        no regressions
- [ ] A2. Document the Shell's prop contract by extending
      `docs/Foundation-Course-ADDIE/AiBI_Lesson_Shell_Migration.md`
      - Add a "Canonical prop contract" section with TypeScript
        interface, slot/region map, and the do-not-add-to-this-shell
        list (anything that belongs to the Paid Workbench Shell
        or Artifact Review Shell — out of scope for Phase 1)
- [ ] A3. Audit + list the legacy lessons currently running through
      `LessonPlayer` and `M01Experience`. Produce a
      `docs/Foundation-Course-ADDIE/AiBI_Lesson_Migration_Inventory.md`
      table: lesson id · current shell · migration order · open
      questions per lesson

### Workstream B — M0–M3 migration (lands lesson-by-lesson)

Each migration commit ticks the B-line AND the matching C-line in the
same commit. **Do not** ship a B-line without its C-line; this is
the "one touch per file" guarantee.

- [ ] B1. **M0.1** — migrate from `M01Experience` to `LessonStepShell`
      - Preserve the redesigned onboarding screen content
      - Land C2 (timing-honesty retime) and C5 (new "what does an AI
        tool look like" frame from Branch Mgr finding) inside this
        commit
- [ ] B2. **M1.1** Predictive token engine
- [ ] B3. **M1.2** Tool landscape (`ToolLandscapeMatrix`, 538 LOC —
      audit for over-engineering during migration)
- [ ] B4. **M1.3** Why this matters (5 track variants — preserve them)
- [ ] B5. **M1.4** Good vs bad use in a bank
- [ ] B6. **M2.1** SSO + tool sanctioning
- [ ] B7. **M2.2** Embedded copilot (CRO Margaret flagged as too
      soft — tighten copy during migration)
- [ ] B8. **M2.3** First Conversation sandbox
- [ ] B9. **M2.4** Where AI Fits worksheet (5 track variants)
- [ ] B10. **M3.1** Role · Task · Context · Format
- [ ] B11. **M3.2** A/B sandbox (Pair 1 flagged as cognitive-load
      CRITICAL — fold the rebuild into the migration; do not just
      reskin)
- [ ] B12. **M3.3** Five prompt patterns — **SPLIT into 3.3a (default
      brief) + 3.3b (advanced patterns)** during this migration
      (lands C3)
- [ ] B13. **M3.4** Spot the Violation drill (12 scenarios)
- [ ] B14. **M3.5** Real use cases + Pack save (5 track variants;
      conversion finale; honestly time at 35–45 min, not 25)

### Workstream C — Inline content polish (lands inside each B commit)

- [ ] C1. Plain-English asides on first use:
      - **SR 11-7** (first appearance: M1.4 case-bad) — one-line
        gloss: "the Fed's model risk management guidance"
      - **MNPI** (first appearance: M3.4 warn) — "material non-public
        information" + one community-bank example
      - **OCC bulletins** (first appearance: M3.1 Reg E example)
      - **Reg E** (first appearance: M3.1) — "the Fed's electronic-
        funds rule"
      - **ECOA / Reg B** (first appearance: TBD during audit)
      - **chain-of-thought** (first appearance: M3.3 / 3.3b)
        — rename header to "Make it think out loud"
      - **few-shot** (first appearance: M3.3 / 3.3b) — rename
        header to "Show examples first"
      - (PRD lives in M5; handled in Phase 2, not here)
- [ ] C2. **M0.1 timing-honesty retime.** Change "<15 min per lesson"
      stat card to a banded estimate ("8–25 min · drills longer,
      clearly flagged"). Branch Mgr Devon's honest timings:
      M3.2 ~25min, M3.3 ~22min, M3.4 ~20–30min, M3.5 ~35–45min.
      Per-lesson timing cards inside the affected lessons also
      retimed to match.
- [ ] C3. **M3.3 split** — see B12. New seeds for 3.3a (default brief
      pattern only) and 3.3b (the other four patterns reframed as
      "later when you need them"). Update sidebar nav, lesson order,
      and the M3.5 "starter pack" reference if it points to M3.3.
- [ ] C4. **Typography-restraint pass.** Mono caps only for metadata
      / status / breadcrumb; body kicker labels ≤ 0.18em tracking;
      never the dominant element on a beat. Audit all M0–M3 lesson
      bodies during their migration.
- [ ] C5. **M0.1 "what does an AI tool look like" frame.** Insert a
      30-second annotated still showing the input box, the output
      area, and the "send" affordance, before M1.1 introduces token
      prediction. Use a generic chat UI mockup (do not embed a
      specific vendor's logo). Branch Mgr Devon's finding: a learner
      who has never opened Claude/ChatGPT reaches M2.3 still not
      knowing what to look at.

### Workstream D — Acceptance

- [ ] D1. All 13 free lessons render through `LessonStepShell` — no
      `M01Experience` / `M02Experience` / `LessonPlayer` imports in
      the M0–M3 surface
- [ ] D2. `npm run build` passes with zero TypeScript errors
- [ ] D3. Mobile pass on iPhone 13 mini viewport (Branch Mgr's
      tighter target). Specific surfaces to check:
      - `OffLimitsSorter` thumb targets ≥ 44px
      - Side-by-side `[case:good]` / `[case:bad]` cards stack on
        mobile and don't lose comparison
      - M3.4 drill resumable on scenario-by-scenario basis
- [ ] D4. Reviewer walk-through against the Shell prop contract doc
      (A2 deliverable) with the live URL open alongside
- [ ] D5. CHRONOLOGY.md and tasks/MASTER.md updated; Phase 1
      counted out

### Phase 1 explicitly DOES NOT touch

- M4 / M5 lessons (Phase 2)
- The Workbench Pack artifact (Phase 2)
- Funnel wiring / state machine (Phase 4)
- Assessment flow (Phase 4)
- Stripe success URL / auth binding (Phase 4)
- `/my-toolbox` vs `/dashboard/toolbox` consolidation (Phase 4)

---

## Phase 2 — Workbench Pack + M5 re-thread (not started)

Phase-2 tasks are scaffolded here so they don't get lost; do not start
until Phase 1 acceptance closes.

- [ ] E1. Add `workbench_pack` to
      `addie.lessons.takeaway_artifact_type` enum (Supabase
      migration). Reuse `/supabase-migrate` skill per CLAUDE.md.
- [ ] E2. Build the Paid Workbench Shell — three-pane layout
      (source / controls / output), review bar, save/export
- [ ] E3. Build `WorkbenchPackBuilder` (replaces / extends
      `SkillBuilder`). Pack shape: `source_packet · prompt_used ·
      first_output · review_tags · improved_output ·
      questions_to_confirm · final_work_product` + governance
      metadata (`version · approver · use_boundary ·
      validation_notes`)
- [ ] E4. Update `docs/Foundation-Course-ADDIE/AiBI_Module_4_Skills.md`
      curriculum doc to reflect Workbench Pack (Skill Template /
      Working Skill / Verified Skill artifact rows become one Pack
      composite)
- [ ] E5. Update M4.1–M4.4 lesson seeds to produce the Pack (single
      composite Toolbox row per lesson, not three Skill rows)
- [ ] E6. Re-thread M5 Project Brief lesson so the Brief drives a
      Workbench Pack run on a learner's real project (not the old
      AI Work Profile)
- [ ] E7. Add leadership-track variant of M5 Project Brief:
      Board AI Brief + Risk Appetite Statement template
      (addresses CEO Bill's institutional-deliverable gap)
- [ ] E8. Update M5.5 closing copy — currently references "Workbench
      Pack" as if it exists; now it will
- [ ] E9. Resolve Phase 2 open product question 1 (Pack as composite
      vs parent-with-child-rows) before E1 lands
- [ ] E10. Resolve Phase 2 open product question 2 (Pack export to
      plain markdown / copy-to-clipboard) before E2 lands

---

## Phase 3 — Artifact Review Shell + leadership-track depth (not started)

- [ ] F1. Generalize `DataDisciplineCardArtifact` into a typed
      Artifact Review Shell
- [ ] F2. Variants for Prompt Moves Card, Workbench Pack, Compliance
      Review
- [ ] F3. Add 5 more leadership-track branches (current floor 5/24;
      CEO target 10/24)
- [ ] F4. Add "what can go wrong, by department" lesson — CEO Bill's
      worst-case walkthrough (named hallucinated regulatory
      citations in adverse-action letters; disparate-impact risk
      in loan drafting; third-party-risk angle on consumer LLMs)
- [ ] F5. Add seat-allocation decision tree for the institutional
      buyer (which 4–6 of 18 staff actually need M4–M5)

---

## Phase 4 — Funnel wiring (Vera's e2e findings, not started)

- [ ] G1. `sessionStorage` → `localStorage` (TTL 24h) for assessment
      flight-state (iOS Safari memory eviction kills sessionStorage
      — Carl-class abandonment at Q5)
- [ ] G2. "Welcome back, [first name]" personalization on
      `/foundation` after email capture
- [ ] G3. Result-page CTA repositioning — let the score breathe;
      one primary CTA only at the score-reveal moment
- [ ] G4. Gate cost-shape parity fix — demote Decline below the
      three-card grid; surface as small tertiary text affordance
- [ ] G5. Stripe `success_url` → `/foundation/welcome?session_id=...`
      with auth-binding and name personalization within 200ms
- [ ] G6. Toolbox route consolidation — pick `/my-toolbox` or
      `/dashboard/toolbox` as canonical, redirect the other
- [ ] G7. `ResultsViewV2` dynamic-import — add `loading` skeleton
      that matches the result-page card layout
- [ ] G8. Email subject lines lead with the score, not the brand
      ("Edwina, your AI readiness score: 24/48 · Early Stage")

---

## Open product questions (need answers before relevant phase starts)

1. **(Phase 2)** Workbench Pack — singular composite artifact, or
   parent with linked child rows? Default: composite; revisit if
   version diffing requires more granularity.
2. **(Phase 2)** Skill portability — does the Pack export to plain
   markdown the learner can paste into Claude/ChatGPT outside the
   Toolbox? Recommended: yes, with a copy-to-clipboard affordance
   on every Pack page.
3. **(Phase 3)** Leadership branches — how many before the
   leadership-track refresh ships? CEO target 10/24 (currently
   5). Estimate authoring cost first.
4. **(Phase 4)** Result-page CTAs — at the score reveal, what is
   the *one* primary CTA? Recommended: "Start the free course."
   The Pay $295 / Buy $99 triangle moves to a separate CTA block
   below or on the `/foundation` landing.
