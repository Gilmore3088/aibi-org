# Session handoff — Foundation UX recovery execution complete (2026-05-25)

**Branch:** `feature/addie-v1`
**Head:** `25edc1c`
**32 commits** ahead of the session-start commit `b1d9795`.
**Working tree:** clean.
**Type-check:** `npx tsc --noEmit --skipLibCheck` green throughout.
**Tests:** `vitest workbench-pack.test.ts` — 11/11 pass.
**Branch state:** not pushed.
**Companion docs:** [`handoff-2026-05-25-foundation-ux-recovery-execution.md`](./handoff-2026-05-25-foundation-ux-recovery-execution.md) — earlier
checkpoint with the per-PR commit table. This doc reflects the final
end-of-session state and what's actually live.

---

## What's live in your Supabase right now

Migrations applied via MCP this session:

| Migration | What it does |
|---|---|
| `00073_addie_lessons_add_shell_kind` | Adds `addie.lessons.shell_kind` enum (`'step' \| 'legacy'`, default `'legacy'`). Route uses this to pick `LessonStepPlayer` vs `LessonPlayer`. |
| `00074_addie_artifact_type_workbench_pack` | Adds `'workbench_pack'` to the `addie.artifact_type` enum so M4 lessons can save the new composite Pack as a `toolbox_items` row. |

Schema + content state in the DB after the seed sync:

| Surface | State |
|---|---|
| **M0.1** | bespoke `M01Experience`, intentional exception, with `AiToolAnatomy` SVG inserted before the proof moment |
| **M0.2** | bespoke `M02Experience` (already uses `LessonStepShell` internally) |
| **M1.1 – M1.4** | `shell_kind='step'`; `m1.1` flipped `is_branched=true` for the new leadership variant |
| **M2.1 – M2.4** | `shell_kind='step'` |
| **M3.1** | `shell_kind='step'`; `is_branched=true` for new leadership variant |
| **M3.2** | `shell_kind='step'`; honest 25-min duration |
| **M3.3** | `shell_kind='step'`; **renamed** to "3.3a · Default brief: Role · Task · Context · Format"; **body slimmed** to default-brief-only content; 12-min duration |
| **M3.3b** *(new)* | `shell_kind='step'`, ordinal 4, "3.3b · Advanced patterns" with the four patterns + plain-English renames (Show examples first / Make it think out loud), 15 min, one knowledge_check |
| **M3.4** | `shell_kind='step'`; ordinal bumped 4 → 5; `is_branched=true` for leadership variant; 25-min honest duration; MNPI Gloss marker live |
| **M3.5** | `shell_kind='step'`; ordinal bumped 5 → 6; 40-min honest duration |
| **M4.1 – M4.4** | `shell_kind='step'`, `takeaway_artifact_type='workbench_pack'`. **Titles renamed** ("What a Workbench Pack is", "Build your first Pack", "Build a Pack for your role", "Test, refine, governance overlay"). **Bodies re-authored** around the Pack vocabulary. `m4.4` flipped `is_branched=true` for leadership variant |
| **M4.5** *(new)* | `shell_kind='step'`, ordinal 5, "What can go wrong, by department" — CEO Bill's worst-case-by-department lesson |
| **M5.1 – M5.5** | `shell_kind='step'`. `m5.3` retitled "Project Brief → Workbench Pack: drive a real Pack run on your own work" with re-authored 9-section Brief body. `m5.5` closing copy reconciled with the Pack vocabulary |
| **M1.4** | `SR 11-7` / `OCC` / `Reg E` Gloss markers live |
| **Leadership-track variants** | 10 / 24 lessons branched: m0.2, m1.1, m1.3, m2.4, m3.1, m3.4, m3.5, m4.3, m4.4, m5.2 — meets CEO Bill's 10/24 target floor |

Dev account seeded for local QA:

```
auth.users.id          = ebab4783-2a7b-4f5c-a869-f18fe4c8ab18
auth.users.email       = jlgilmore2+0523-1@gmail.com

public.course_enrollments → product='aibi-p',           stripe_session_id='dev_manual_2026_05_25'
addie.entitlements        → product='foundation_individual', status='active'
```

These unlock both the legacy LMS surface (`/courses/foundation/program/*`)
and the new ADDIE paid surface (`/foundation/m4`, `/foundation/m5`).

---

## What's in the code this session — phase by phase

### Phase 1 — Guided Lesson Shell + content polish (DONE)

| PR | Commit | What |
|---|---|---|
| PR1 | `67f79fa` | `shell_kind` plumbing — migration 00073, `LessonStepPlayer` adapter, `LessonRow.shell_kind` type, route select extended, tsconfig excludes `addie-v1-stash` |
| PR2 | `dfaae29` | Route wiring on `shell_kind === 'step'` branch; `ModalityView` extracted; m1.1 flipped |
| PR3 | `154ce22` | m1.2 / m1.3 / m1.4 flipped |
| PR4 | `460a9bc` | m2.1 – m2.4 flipped |
| PR5 | `47cf29f` | m3.1 / m3.2 / m3.4 / m3.5 flipped (m3.3 held for split) |
| PR6 | `1cd1d06` | Jargon rename in m3.3: Few-shot → Show examples first, Chain-of-thought → Make it think out loud |
| PR7 | `adf345f` | Timing honesty — duration_min bumps on M3 + 4 marketing-copy reframes |
| PR8 | `3a77ab9` | `<Gloss>` component + `glossary.ts` (5 terms: SR 11-7, MNPI, OCC, Reg E, ECOA/Reg B); `[[Gloss:term]]` parser in LessonBody |
| PR12 | `7d0ee88` | `AiToolAnatomy` SVG in M0.1 (Branch Mgr Devon finding #9) |
| PR18 | `c892bbb` | M3.3 structural split into 3.3a (kept m3.3 id, slimmed body) + new m3.3b (advanced patterns); ordinal renumber m3.4→5, m3.5→6 |

### Phase 2 — Workbench Pack + M5 re-thread (DONE)

| PR | Commit | What |
|---|---|---|
| PR13 | `a9d2c60` | `workbench_pack` enum (migration 00074), `WorkbenchPackContent` type, `packToMarkdown` helper, `isPackComplete` validator, 11 unit tests |
| PR14 | `526e5c3` | `WorkbenchPackBuilder` client component — single-column 7-region form with governance fieldset, Save + Copy-as-Markdown actions |
| PR15 | `56140c5` | M4 curriculum doc annotated with Pack pivot — legacy Skill body kept under the callout |
| PR16 | `d87fcd8` | `PaidWorkbenchShell` — generic 3-pane container (source / controls / output + sticky review bar) for paid lessons |
| PR19 | `e59f15d` | M4 takeaway_artifact_type → workbench_pack; shell_kind → step in seeds |
| PR20 | `3cfaf8f` | M5 re-thread — m5.3 retitle, Board AI Brief leadership variant on m5.2, M5.5 closing copy reconciled |
| PR24 | `ee956ae` | M4 body_md re-author around Pack vocabulary (titles + bodies); m5.3 body re-authored into 9-section Project Brief; partial seed sync (full M4.2/M4.3/M4.4 bodies live in DB only — see "Open" below) |
| (route) | `25edc1c` | **WorkbenchPackBuilder wired into M4 dispatch tables** — both `EmbeddedExercise` and `InteractiveLessonView` now route `m4-2-build-first-skill` / `m4-3-role-skill` / `m4-4-test-refine` exercise IDs to the Pack builder with per-lesson seeded `initialSourcePacket` text |

### Phase 3 — Artifact Review Shell + leadership-track depth (DONE)

| PR | Commit | What |
|---|---|---|
| PR17 | `25d5203` | `ArtifactReviewShell` (generic typed shell) + `WorkbenchPackArtifact` (Pack-variant read-only render) |
| PR21 | `c36f69c` | New m4.5 "What can go wrong, by department" lesson (CEO Bill F4) |
| PR22 | `590eb20` | `SeatAllocationTree` component (CEO Bill F5) — interactive headcount → paid/free seat calculator |
| PR23 | `de01a88` | 4 new leadership-track branches (m1.1, m3.1, m3.4, m4.4) — total now 10/24, meets CEO Bill target |

### Phase 4 — Funnel wiring (5 / 8 done after reconciliation)

| Item | Status | Commit |
|---|---|---|
| G1 — sessionStorage → localStorage 24h TTL | ✅ already done before this session (Audit A3, 2026-05-24) | — |
| G2 — Welcome-back personalization on `/foundation` | ✅ done | `431a46f` |
| G3 — Result-page CTA repositioning | open — verify against current state | — |
| G4 — Gate cost-shape parity (Decline demoted) | ✅ already done (Audit A9/A18, 2026-05-24) | — |
| G5 — Stripe success_url + auth binding | open — needs E2E walk | — |
| G6 — Toolbox route consolidation (`/my-toolbox` vs `/dashboard/toolbox`) | open — product call needed | — |
| G7 — ResultsViewV2 loading skeleton | ✅ done | `57947f4` |
| G8 — Email subject lines lead with score | ✅ already done (`src/lib/resend/index.ts:116`) | — |

### Phase 0 — plumbing + cherry-pick (DONE)

| Commit | What |
|---|---|
| `88802ff` | gitignore additions (`/tmp/`, `/addie-v1-stash/`, `plan-review.html`) |
| `dda6458` | WIP code carry-forward (sandbox routes, PII scanner, lesson views, m0/m1 seeds, migration 00061, new addie/lesson components, addie/email/teamSeatInvite) |
| `0aa9dfd` | WIP doc carry-forward (additional reviewer-fleet outputs, handoffs, production tracker) |
| `3483323` | Cherry-picked Phase 0 deliverable from the deleted `feature/addie-v2` (recovery plan rewrite, design spec, DECISIONS entry, MASTER + CHRONOLOGY rows, 5 review docs, 3 curriculum docs, 2 canvas scripts) |

### Session bonus — preview-bypass for paid surfaces

| Commit | What |
|---|---|
| `c7076d7` | Added `SKIP_ENROLLMENT_GATE` bypass to the ADDIE paid-tier route (3-layer safety mirroring `previewBypass.ts`): production hard floor + explicit env opt-in + no auto-fire. CLAUDE.md already documented the env var; this PR wired it. |

---

## How to launch locally

```bash
COMING_SOON=false \
SKIP_ENROLLMENT_GATE=true \
PREVIEW_AUTH_BYPASS=true \
npm run dev
```

Three flags unlock everything:
- `COMING_SOON=false` — bypasses the holding-page gate
- `SKIP_ENROLLMENT_GATE=true` — synthetic dev enrollment so paid content renders
- `PREVIEW_AUTH_BYPASS=true` — auth-layout redirect skipped when Supabase IS configured

Or — if you're signed in as `jlgilmore2+0523-1@gmail.com` — the real
`course_enrollments` + `addie.entitlements` rows I inserted let you walk
the gated surfaces without any env flags.

Dev server is currently running on `http://localhost:3000` (background ID
`brqnapasr`).

---

## What's still open (in priority order)

### Architecture / wiring not yet done

1. **Full M4 body sync back to the seed.** M4.2 / M4.3 / M4.4 / M5.3 body_md updates are live in the DB via direct UPDATE; the seed files only have M4.1 in full. Re-running the seeds against a fresh Supabase would revert those four bodies. Cleanup task: pull the live bodies out and paste them into the appropriate UPSERT VALUES blocks in `supabase/seed/m4_addie.sql` and `m5_addie.sql`.
2. **M3.3 KCs.** The existing knowledge_checks on `m3.3` (now 3.3a) are still the original 5-pattern questions. They survive the title rename but several are about patterns 2–5 that now live in m3.3b. Re-author the m3.3 KCs to be default-brief-only; the m3.3b KC (one question) ships in PR18 and is fine.
3. **SeatAllocationTree mount point.** Component is built (`src/components/addie/foundation/SeatAllocationTree.tsx`) but isn't mounted on any route. Pick: `/foundation/for-community-banks` "plan your deployment" section, M3.5 gate sidebar, or standalone `/foundation/seats`.
4. **WorkbenchPackBuilder `onSave` wiring.** Currently the Save button just sets local React state. It needs to POST to `/api/addie/toolbox/items` (or equivalent) with `type='workbench_pack'` and the Pack JSON. The component takes an `onSave` prop — the wiring is "pass an onSave that does the POST" wherever it gets mounted.
5. **M4 lesson page integration of the 3-pane `PaidWorkbenchShell`.** The Shell component exists. The M4 lessons currently render WorkbenchPackBuilder inside the standard `EmbeddedExercise` "Try it" frame, which works but doesn't use the 3-pane layout the spec calls for.

### Product calls needed

6. **G6 toolbox route consolidation.** `/my-toolbox` (learner-facing) and `/dashboard/toolbox` (operator surface) coexist. Are they intentionally distinct or should one redirect into the other?

### Verification / QA

7. **Mobile + Playwright QA pass** on the migrated lessons (iPhone 13 mini viewport per Branch Mgr Devon's tighter target).
8. **G3 result-page CTA repositioning** — verify against current `ResultsViewV2` shape; Vera's original finding may already be addressed.
9. **G5 Stripe `success_url`** — E2E walk to confirm which of three candidate URLs fires post-checkout.

### Operator-only

10. **Push `feature/addie-v1` to origin** for a Vercel preview URL. First push of the session per CLAUDE.md requires explicit approval.
11. **Promotion path to `main`.** This branch is the ADDIE blank-slate rebuild per the branch-scoped CLAUDE.md note. The 2026-05-23 promotion decision (in DECISIONS.md) needs revisiting before any merge.

### Cleanup

12. **`addie-v1-stash/` directory** (683 MB) still on disk, now gitignored. Delete or move out of the worktree when the prior-session backup is no longer needed.

---

## Known footguns for the next operator

- **The dev-bypass enrollment record returned by `SKIP_ENROLLMENT_GATE`** has `id='dev-bypass'` and no real DB row. API endpoints that look up the enrollment by `user_id` (e.g. `/api/courses/save-onboarding`, `/api/courses/submit-activity`) bypass the local cache and hit Supabase directly — those will return "Enrollment not found or access denied" unless a real row exists. The fix is one of: (a) seed a real enrollment row for the testing account (this session did so for `jlgilmore2+0523-1@gmail.com`); (b) extend each API route with the same NODE_ENV+SKIP_ENROLLMENT_GATE bypass.
- **The seed UPSERTs for m3.3, m4.1–m4.5, m5.3, m5.5 contain stale body_md** (matches the pre-session state for m3.3 / m5.5, and the legacy Skill body for m4.x). Live DB has the new content. **Don't re-run the seed without first syncing the seed files** to the live state (open item #1 above), or the bodies will revert.
- **Worktree CLAUDE.md** (this branch) carries a `BRANCH-SCOPED — Foundation Course rebuild on ADDIE` note saying the branch intentionally diverges from main. Treat this branch's docs and code as in-flight; don't promote unilaterally to main.

---

## Numbers

| | |
|---|---|
| Total commits this session | 32 |
| New PRs landed | 24 (PR1–PR24) plus 3 WIP-triage commits + 1 cherry-pick + 4 handoff/reconciliation commits |
| Migrations applied to live Supabase | 2 (`00073`, `00074`) |
| New lesson rows in DB | 2 (`m3.3b`, `m4.5`) |
| New lesson_track_variant rows | 5 (m1.1, m3.1, m3.4, m4.4, m5.2 — all leadership) |
| Total leadership-track variants now live | 10 / 24 (CEO Bill target met) |
| Body_md content rewritten | m3.3, m4.1, m4.2, m4.3, m4.4, m4.5, m5.3, m5.5 |
| Title changes | m3.3, m4.1, m4.2, m4.3, m4.4, m5.3 |
| Ordinal renumber | m3.3 (3), m3.3b (4), m3.4 (4→5), m3.5 (5→6) |
| Dev account enrollment / entitlement rows seeded | 2 (`jlgilmore2+0523-1@gmail.com`) |

The build is real, the DB matches it, and the local dev server demonstrates
it. The deploy remains operator-gated per CLAUDE.md.
