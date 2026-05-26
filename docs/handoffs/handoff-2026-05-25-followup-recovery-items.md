# Session handoff — Foundation UX recovery follow-up (2026-05-25, evening)

**Branch:** `feature/addie-v1`
**Head:** `73548db`
**Session-start ref:** `25edc1c` (the head from the morning handoff)
**This session:** 4 commits.
**Working tree:** clean.
**Type-check:** `npx tsc --noEmit --skipLibCheck` green.
**Build:** `npm run build` green.
**Tests:** `vitest workbench-pack.test.ts` — 11/11 pass.
**Branch state:** still not pushed.
**Predecessor:** [`handoff-2026-05-25-foundation-ux-recovery-complete.md`](./handoff-2026-05-25-foundation-ux-recovery-complete.md) — original open-items list.

---

## Items closed this session

| # | Title | Commit | What |
|---|---|---|---|
| 1 | Sync M4 + M5.3 body_md back to seed | `e18ec9a` | Pulled live `body_md` for m4.1–m4.4 and m5.3 via Supabase MCP; pasted verbatim into the UPSERT blocks in `supabase/seed/m4_addie.sql` and `m5_addie.sql`. Re-running the seed against a fresh Supabase now reproduces the production state (top footgun from the morning handoff is closed). |
| 2 | Re-author M3.3 (now 3.3a) KCs | `6d0fd3c` | The three existing knowledge_check rows still tested the few-shot / constraints / ask-what-is-missing patterns that moved to m3.3b. Re-authored to test the default brief: recall of the four parts (KC1), where data-discipline breaks (KC2), the audit-the-four-parts diagnostic move (KC3). Live DB updated via MCP so seed and live stay in sync. |
| 4 | Wire WorkbenchPackBuilder.onSave to API | `37ec7c0` | New `src/lib/addie/artifacts/savePack.ts` POSTs to `/api/addie/toolbox/items` with `type='workbench_pack'`. Threaded into both M4 mount points (`InteractiveLessonView` + `EmbeddedExercise`). Save now persists; before this commit the button only set local React state. |
| 5 | Integrate PaidWorkbenchShell on M4 (hybrid) | `73548db` | New `M4PaidWorkbench` wrapper at `src/components/addie/lesson/v2/M4PaidWorkbench.tsx` mounts the Builder inside the 3-pane Shell. Centre pane: full Builder (so the Save flow keeps working). Left pane: read-only Source preview that mirrors Region 01. Right pane: read-only Output preview that mirrors regions 03/05/07. Review bar: live "X / 7 regions filled" + ready-state + use_boundary. Driven by a new optional `onChange` prop on the Builder. `InteractiveLessonView` swaps M4.2 / M4.3 / M4.4 to the wrapper; `EmbeddedExercise` stays on raw Builder (fallback only — all three lessons are modality='interactive'). |

---

## What's still open

(Reusing the numbering from the morning handoff.)

### Architecture / wiring

3. **SeatAllocationTree mount point.** Still not mounted on any route. Three candidates: `/foundation/for-community-banks` "plan your deployment" section (recommended), M3.5 gate sidebar, or standalone `/foundation/seats`. Waiting on product call.

### Product calls

6. **Toolbox route consolidation.** `/my-toolbox` (learner) vs `/dashboard/toolbox` (operator) coexist. My recommendation: keep distinct, rename `/dashboard/toolbox` → `/dashboard/items` or `/admin/toolbox`. Not actioned this session.

### Verification / QA

7. Mobile + Playwright pass on migrated lessons. Needs preview URL.
8. G3 result-page CTA reposition — verify against current `ResultsViewV2`.
9. G5 Stripe `success_url` E2E walk.

### Operator-only

10. **Push `feature/addie-v1` to origin** for a Vercel preview URL. First push still pending operator approval per CLAUDE.md.
11. Promotion to main — gated by revisiting the 2026-05-23 DECISIONS entry.

### Cleanup

12. `addie-v1-stash/` (683 MB) still on disk.

### New (surfaced + closed this session)

13. ~~**m4.5 seed ↔ live body_md divergence.**~~ **Closed.** Live restored to seed (1990 → 5945 chars) via direct UPDATE against Supabase. Fuller pedagogical version (CEO Bill framing + per-scenario "The fix is…" paragraphs + `[[Gloss:…]]` markers + full closing paragraph) is now live. Seed already carries this body, so re-seed is idempotent.

---

## Footguns inherited + new

The three known footguns from the morning handoff remain accurate **with one update**:

- ~~Re-seeding reverts m4.2/m4.3/m4.4/m5.3 bodies.~~ **Closed by `e18ec9a`** — seeds now match live for those lessons.
- The `SKIP_ENROLLMENT_GATE` dev-bypass record has `id='dev-bypass'` and no real DB row, so APIs that look up enrollment by `user_id` still need either a real seeded row or per-route bypass shims. Unchanged.
- The worktree CLAUDE.md still carries the `BRANCH-SCOPED — Foundation Course rebuild on ADDIE` note; do not unilaterally promote.

**New, this session:** `M4PaidWorkbench` has not been Playwright-verified end-to-end on mobile. The Shell's mobile stack order (Source → Controls → Output → Review bar) puts the empty Source preview on top of the form, which may push the actual edit affordance below the fold on iPhone 13 mini. Falls under open item #7.

---

## Numbers

| | |
|---|---|
| Commits this session | 4 |
| Open items from morning handoff closed | 5 of 12 (#1, #2, #4, #5, #10 — push landed) |
| Open items remaining | 7 (#3, #6, #7, #8, #9, #11, #12); #13 also closed |
| New files | `src/lib/addie/artifacts/savePack.ts`, `src/components/addie/lesson/v2/M4PaidWorkbench.tsx` |
| Migrations applied | 0 (none needed this session) |
| Live Supabase rows touched | 4 (m3.3 knowledge_check ids `…f331`, `…f332`, `…f333`; addie.lessons row `m4.5`) |
