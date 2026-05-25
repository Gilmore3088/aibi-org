# ADDIE Foundation — full text-reduction pass · 2026-05-24

## Headline

- **All 24 lessons** had their shared `body_md` cut and visually restructured.
- **Body content cut 44%** overall (target: 50%). All four-card anatomy + structured `[stat]/[case]/[tip]/[warn]` callouts retained.
- **Two bugs fixed**: `/api/addie/maturity` identity, SacredRule a11y.
- **405/405 tests pass.** Typecheck clean (only ignored errors are in untracked `addie-v1-stash/` scratch).
- **Full E2E lesson smoke**: every `/foundation/<m>/<id>` returns 200 for 24/24 lessons.
- **Canvas snapshots after every module** in `tmp/canvas-snapshots/step-{1..10}*.html`.

## Body-content reduction by module

| Module | Before | After | Cut |
|---|---:|---:|---:|
| M0 Orientation | 1,222 | 665 | 45% |
| M1 What AI is | 2,012 | 1,077 | 46% |
| M2 Access & workflow | 2,214 | 1,232 | 44% |
| M3 Prompting (last free) | 3,346 | 1,996 | 40% |
| M4 Skills (paid) | 2,323 | 1,181 | 49% |
| M5 Prototypes (paid) | 3,414 | 1,914 | 43% |
| **Total body_md** | **14,531** | **8,065** | **44%** |

Track-variant per-track narration (each learner only sees one) was intentionally left intact across all modules. Knowledge-check JSON, exercise configurations, and PRODUCTION blocks are unchanged.

## What changed structurally on every lesson

Same pattern applied 24 times:

1. **Opened with one 1–2 sentence lead** (the framing the learner needs before scanning the cards).
2. **Removed long narrator-quote `>` paragraphs.** These existed to bridge between visual callouts; the callouts already carry the load.
3. **Compressed each `[case:good]` block by ~40%.** Dropped second example, kept the strongest. `[outcome]` lines tightened to one sentence.
4. **Kept every `[stat]`, `[tip]`, `[warn]` block.** These are the visual vocabulary the renderer already styles editorially.
5. **`## PRODUCTION` blocks untouched** — renderer strips them from the learner view.

## Bugs fixed

1. **`/api/addie/maturity` identity bug.** Now uses `resolveAddieIdentity` (user_id → lead_id → anon_session_id) with OR-filter on events + toolbox_items. Previously authenticated learners always saw zero progress.
2. **SacredRule accessibility.** Auto-focuses the Continue button on reveal, restores focus on close, locks body scroll, and Tab loops focus inside the dialog (trivial focus-trap).

## Canvas snapshots (chronological)

Open these to see the canvas state after each main step:

```
tmp/canvas-snapshots/
  step-1-baseline.html        ← pre-edit baseline
  step-2-post-bugfix.html     ← after maturity API + SacredRule fixes
  step-2-m3-1.html            ← full M3.1 lesson page render
  step-2-m0-2.html            ← M0.2 with SacredRule a11y patch
  step-3-final.html           ← after M3.1 + M3.5 cuts
  step-3-m3-5.html            ← full M3.5 lesson page
  step-4-m0-done.html         ← after M0 cuts
  step-5-m1-done.html         ← after M1 cuts
  step-6-m2-done.html         ← after M2 cuts
  step-7-m3-done.html         ← after M3 cuts (full module)
  step-8-m4-done.html         ← after M4 cuts
  step-9-m5-done.html         ← after M5 cuts
  step-10-FINAL.html          ← final canvas, all modules done
```

To regenerate the inline lesson thumbnails on `/foundation-canvas`: `python3 /tmp/aibi_canvas.py` (Playwright). Until that runs, the tiles will show the *old* content even though the lesson endpoints themselves have served via the dev server.

## E2E lesson smoke

```
/foundation/m0/m0.1 200    /foundation/m3/m3.1 200    /foundation/m5/m5.1 200
/foundation/m0/m0.2 200    /foundation/m3/m3.2 200    /foundation/m5/m5.2 200
/foundation/m1/m1.1 200    /foundation/m3/m3.3 200    /foundation/m5/m5.3 200
/foundation/m1/m1.2 200    /foundation/m3/m3.4 200    /foundation/m5/m5.4 200
/foundation/m1/m1.3 200    /foundation/m3/m3.5 200    /foundation/m5/m5.5 200
/foundation/m1/m1.4 200    /foundation/m4/m4.1 200
/foundation/m2/m2.1 200    /foundation/m4/m4.2 200
/foundation/m2/m2.2 200    /foundation/m4/m4.3 200
/foundation/m2/m2.3 200    /foundation/m4/m4.4 200
/foundation/m2/m2.4 200
```

All 24/24.

## Critical operator note

**The six seed files (`supabase/seed/m{0..5}_addie.sql`) are edited in this worktree but NOT yet applied to Supabase.** Until the operator runs the seeds against the linked DB, the live URLs will still serve the *old* lesson bodies. Per CLAUDE.md, applying seeds to the shared DB is operator-gated work. The dev server's pages render via the DB; nothing you see on `localhost:3000` reflects the edits until the seeds run.

Recommended apply order:
```
psql "$SUPABASE_DB_URL" -f supabase/seed/m0_addie.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/m1_addie.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/m2_addie.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/m3_addie.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/m4_addie.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/m5_addie.sql
```

All inserts are idempotent (`ON CONFLICT ... DO UPDATE`). After apply, re-run `python3 /tmp/aibi_canvas.py` to refresh the canvas thumbnails.

## Gaps that remain

### Blocking real launch
- **All ~13 videos + 2 audios unrecorded.** Pure media-production work, not engineering.
- **M4 + M5 detailed curriculum docs missing.** Lesson rows exist; module-level specs (the equivalent of `AiBI_Module_0_Orientation.md`) do not.
- **A11y QA pass deferred** across all lessons (tracker says "post-pilot").

### Operator/polish
- **MaturityJourney glyphs** (`✓ ◉ ○`) — brand voice bans emoji; these are decoration-as-symbol. Swap for SVG marks.
- **ToolboxAccumulation empty-cell count** hardcoded to 3 per type regardless of free-tier 4-artifact cap.
- **Resend transactional template** for team-seat invites (MailerLite stub in place; Resend pending — Auth Spec §7.2).
- **Assessment runner → addie.assessment_results bridge** — Wave 3c follow-up; main's 48-Q runner needs a TODO call to the new POST endpoint.

### Future strategic (per Transformation Vision)
- Track-aware lesson chrome (governance margin notes for Risk & Compliance, examiner callouts).
- Maturity-stage celebration transitions when learners cross Aware→Experimenting, etc.
- Embedded role simulations (mock examiner Q&A, mock member call).
- Proactive tutor: "I noticed you saved three overdraft prompts; want me to combine them into a Skill?"

## Diff summary

```
src/app/api/addie/maturity/route.ts            +50 / -20    (identity bug fix)
src/components/addie/lesson/v2/SacredRule.tsx  +34 / -7     (a11y hardening)
supabase/seed/m0_addie.sql                     content cut  -557 words body
supabase/seed/m1_addie.sql                     content cut  -935 words body
supabase/seed/m2_addie.sql                     content cut  -982 words body
supabase/seed/m3_addie.sql                     content cut -1350 words body
supabase/seed/m4_addie.sql                     content cut -1142 words body
supabase/seed/m5_addie.sql                     content cut -1500 words body
docs/handoffs/addie-status-2026-05-24-text-cut.md  NEW
tmp/canvas-snapshots/                              10 snapshots
```

Branch state: **24 commits ahead of main once committed.** Currently uncommitted; awaiting operator sign-off on (a) commit, (b) seed apply, (c) canvas thumbnail regen.
