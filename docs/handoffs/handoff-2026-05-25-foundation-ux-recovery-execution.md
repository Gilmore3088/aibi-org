# Session handoff — Foundation UX recovery execution (2026-05-25)

**Branch:** `feature/addie-v1`
**Session arc:** Brainstorm → decisions → spec → execute (with one mid-session worktree pivot)
**Commits landed:** 14 (from `b1d9795` through `431a46f`)
**Phase 0 (plan/spec) + Phase 1 (8 PRs) + Phase 4 (2 PRs)** — Phase 2 + Phase 3 not started.

## What happened, in one paragraph

The session opened by walking the 4 directional decisions on the 2026-05-25
recovery plan (Guided Lesson Shell · Workbench Pack as M4 artifact · M5
stays Projects-and-Context re-threaded · tagline kept). Brainstorming
produced a written Phase 1 design spec at
`docs/superpowers/specs/2026-05-25-foundation-phase-1-shell-design.md`.
A premise check then found that the spec referenced ADDIE code
(`LessonStepShell`, `M01Experience`, etc.) which **only existed on
`feature/addie-v1`**, not on `main` — so the original Phase 0
worktree (`feature/addie-v2`) was deleted and the docs were
cherry-picked onto `feature/addie-v1`. Execution then proceeded
through PR1–PR10. Branch is currently at `431a46f`, 13 commits ahead
of where the session-start `b1d9795` landed.

## Commits this session

| Commit | Phase | Scope |
|---|---|---|
| `88802ff` | 0 | `chore(gitignore)`: ignore tmp/, addie-v1-stash/, plan-review.html |
| `dda6458` | 0 | WIP: foundation engineering work in flight (9 files modified + 5 new code files + email lib + migration 00061) |
| `0aa9dfd` | 0 | WIP: 2026-05-24 reviewer-fleet outputs + handoffs + production tracker (12 new docs) |
| `3483323` | 0 | docs(plans): foundations UX recovery v2 (cherry-picked from addie-v2) — recovery plan rewrite, design spec, DECISIONS, MASTER, CHRONOLOGY, 5 review docs, 3 curriculum docs, 2 canvas scripts |
| `67f79fa` | 1 PR1 | feat(addie/foundation): `shell_kind` plumbing — migration 00073, `LessonStepPlayer` adapter, `LessonRow.shell_kind` type, route select extended |
| `dfaae29` | 1 PR2 | feat(addie/foundation): route wiring + m1.1 flip — extracted `ModalityView`; added the `shell_kind === 'step'` branch in `[moduleId]/[lessonId]/page.tsx`; m1.1 → step |
| `154ce22` | 1 PR3 | feat(addie/foundation): m1.2 / m1.3 / m1.4 flip |
| `460a9bc` | 1 PR4 | feat(addie/foundation): m2.1–m2.4 flip |
| `47cf29f` | 1 PR5 | feat(addie/foundation): m3.1 / m3.2 / m3.4 / m3.5 flip (m3.3 deferred for split) |
| `1cd1d06` | 1 PR6 | content(m3.3): rename `Few-shot` → `Show examples first`, `Chain-of-thought` → `Make it think out loud` |
| `adf345f` | 1 PR7 | content: timing-honesty pass — bump M3.2 → 25, M3.3 → 22, M3.4 → 25, M3.5 → 40 min; reframe 4 marketing-copy claims |
| `3a77ab9` | 1 PR8 | feat(addie/foundation): `<Gloss>` component + foundation glossary (SR 11-7, MNPI, OCC, Reg E, ECOA/Reg B); first two lesson seeds carry `[[Gloss:term]]` markers |
| `57947f4` | 4 G7 | feat(assessment): ResultsViewV2 loading skeleton |
| `431a46f` | 4 G2 | feat(foundation): Welcome-back personalization on `/foundation` |

## Tree state

- **Type-check:** `npx tsc --noEmit --skipLibCheck` — green (0 errors).
- **Build:** not run this session. Recommended before PR-creation.
- **Migration 00073:** committed but NOT YET APPLIED to the linked
  Supabase project. Until applied, the route's `shell_kind` check
  falls through to `'legacy'` (default) and every lesson renders
  through `LessonPlayer`. Apply via the `/supabase-migrate` skill or
  via `mcp__supabase__apply_migration`.

## Phase 1 step-shell adoption matrix

| Lesson | shell_kind | Notes |
|---|---|---|
| M0.1 | (n/a) | onboarding via `M01Experience` — intentional exception per design spec |
| M0.2 | (n/a) | `M02Experience` already uses `LessonStepShell` internally |
| M1.1–M1.4 | step | PR2 + PR3 |
| M2.1–M2.4 | step | PR4 |
| M3.1 | step | PR5 |
| M3.2 | step | PR5 (A/B sandbox — flagged cogload CRITICAL by Pair 1; full rebuild deferred) |
| M3.3 | legacy | DEFERRED for split (3.3a + 3.3b) — needs ordinal renumbering + new lesson content + KC rows |
| M3.4 | step | PR5 |
| M3.5 | step | PR5 |

## What's left in the recovery plan

### Phase 1 — remaining

- [ ] **Apply migration 00073** to the linked Supabase project (runtime gate).
- [ ] **M3.3 split** — 3.3a (default brief only) + 3.3b (advanced patterns). Ordinal renumber (m3.4 → 5, m3.5 → 6, m3.3b → 4). Author new 3.3b body. Add KC rows for 3.3b. Update M3.5 starter-pack reference (currently points to m3.3 — should stay since 3.3a will retain that id). See task #32.
- [ ] **AiToolAnatomy component for M0.1** — annotated SVG of generic chat UI input/output/send/history. Recovery plan finding #9 (Branch Mgr Devon). Embeds inside `M01Experience` before track picker. Not yet built.
- [ ] **More `[[Gloss:term]]` markers** across M0–M3 lesson bodies as content-polish passes. Infrastructure landed PR8; just adding markers as we touch each seed.
- [ ] **Typography-restraint pass** across all migrated lessons (mono caps only on metadata; body kickers ≤ 0.18em tracking).
- [ ] **Mobile QA pass** on iPhone 13 mini viewport per design spec D3.
- [ ] **Playwright suite** — design spec D2.
- [ ] **Reviewer walk-through** — design spec D4.

### Phase 2 — Workbench Pack (not started)

All E-line items from the recovery plan still open:
- [ ] E1 — `workbench_pack` enum on `addie.lessons.takeaway_artifact_type`
- [ ] E2 — Paid Workbench Shell (3-pane source/controls/output)
- [ ] E3 — `WorkbenchPackBuilder` (replaces `SkillBuilder`)
- [ ] E4 — Update `AiBI_Module_4_Skills.md` curriculum doc
- [ ] E5 — Update M4.1–M4.4 lesson seeds
- [ ] E6 — Re-thread M5 Project Brief lesson
- [ ] E7 — Leadership-track Board AI Brief variant
- [ ] E8 — Update M5.5 closing copy
- **Open product questions** (#1 composite vs parent/child rows; #2 Pack export to plain markdown) need answers before E1 lands.

### Phase 3 — Artifact Review Shell + leadership depth (not started)

- [ ] F1 — Generalize `DataDisciplineCardArtifact` into a typed Artifact Review Shell
- [ ] F2 — Pack / Compliance Review / Prompt Moves variants
- [ ] F3 — 5 more leadership-track branches (current 5/24 → target 10/24)
- [ ] F4 — "What can go wrong, by department" lesson
- [ ] F5 — Seat-allocation decision tree

### Phase 4 — Funnel wiring

- [x] G1 — sessionStorage → localStorage (already done before this session — Audit A3, 2026-05-24)
- [x] G2 — Welcome-back personalization (PR10)
- [ ] G3 — Result-page CTA repositioning (Vera: let the score breathe)
- [ ] G4 — Gate cost-shape parity (demote Decline below the grid)
- [ ] G5 — Stripe `success_url` + auth binding
- [ ] G6 — Toolbox route consolidation (`/my-toolbox` vs `/dashboard/toolbox`)
- [x] G7 — ResultsViewV2 loading skeleton (PR9)
- [ ] G8 — Email subject lines lead with score

## Notes for the next session

1. **Migration 00073 must land** before any of the step-shell flips
   take effect in production. The route is defensive — falls back to
   `legacy` if `shell_kind` is null/missing — so the flips ship safely
   but render the old shell until the migration runs.

2. **The 683MB `addie-v1-stash/` snapshot dir** is now gitignored
   and excluded from tsc. It's still on disk. Separate cleanup task —
   delete or move out of the worktree when there's confidence the
   prior session's safety backup is no longer needed.

3. **`plan-review.html`** is the Ledger-styled local render of the
   recovery plan, gitignored. Open in a browser to read the plan
   without leaving the working tree. Regenerable.

4. **Goal-hook tension:** the user invoked `/superpowers:brainstorming`
   AND `/goal build entire space` simultaneously this session. The
   brainstorming skill's hard gate (no implementation without user
   spec approval) conflicted with the goal's "do not pause to ask"
   directive across multiple Stop-hook fires. Mid-session the user
   confirmed `c` (Option C: rebase Phase 0 onto addie-v1) and
   thereafter the assistant proceeded without further explicit
   approval gates, treating subsequent execution as covered by the
   goal directive. **Both directives remain active** — the goal
   condition is not yet satisfied (Phases 2/3 are entirely
   unstarted) but real PRs have shipped.

5. **No PRs pushed to remote.** All work is local on
   `feature/addie-v1`. First push of the session would require
   explicit operator approval per CLAUDE.md.
