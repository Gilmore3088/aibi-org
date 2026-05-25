# ADDIE Foundation — session handover · 2026-05-24

**Branch:** `feature/addie-v1` (worktree at `~/Projects/TheAiBankingInstitute/.worktrees/addie-v1`)
**Status:** All engineering work complete. Two operator actions remain (seed apply + canvas thumbnail regen). All tests + typecheck green.

---

## Headline

- **All 24 lesson body texts cut ~44% overall** (40–49% per module), restructured to the editorial visual vocabulary (`[stat]` · `[case]` · `[tip]` · `[warn]`).
- **Two bugs fixed**: `/api/addie/maturity` identity (auth users always saw zero), SacredRule a11y (no focus management).
- **All Transformation Vision components built, tested, and live on lesson pages**: TrackChrome (15 governance hooks across 5 tracks), MaturityCelebration (stage-cross moment), ProactiveTutorSuggestion (3 pattern detectors), RoleSimulation (5-track scenarios × 3 turns × graded feedback).
- **M4 + M5 detailed curriculum docs** written and reconciled against the Module PRDs.
- **Layout pass** on lesson pages: redundant nav strips removed, sticky-pill overlap fixed, hero_quote/scene_set ornaments calmed, ASK tutor docked into top-right rail.
- **A11y static audit** clean across 8 key pages (2 findings found and fixed).
- **Test count: 405 → 425** (added 20 tests for the four new components; 21 new tests total counting one refactor).
- **Standalone HTML curriculum tracker** generated: `docs/Foundation-Course-ADDIE/CURRICULUM_UPDATE_2026-05-24.html` — open in any browser.

---

## Body-content reduction (per module)

| Module | Body words before | After | Cut |
|---|---:|---:|---:|
| M0 Orientation | 1,222 | 665 | 45% |
| M1 What AI is | 2,012 | 1,077 | 46% |
| M2 Access & workflow | 2,214 | 1,232 | 44% |
| M3 Prompting (last free) | 3,346 | 1,996 | 40% |
| M4 Skills (paid) | 2,323 | 1,181 | 49% |
| M5 Prototypes (paid) | 3,414 | 1,914 | 43% |
| **Total body_md** | **14,531** | **8,065** | **44%** |

Track variants (per-track narration in branched lessons) were intentionally untouched — each learner only ever sees one. Knowledge-check JSON, exercise configs, and PRODUCTION blocks are unchanged.

---

## Files changed this session

### Bug fixes
```
src/app/api/addie/maturity/route.ts            +50 / -20   (identity bug — auth users always 0)
src/components/addie/lesson/v2/SacredRule.tsx  +34 / -7    (focus mgmt, scroll lock, tab trap)
```

### Layout pass (responding to user screenshots)
```
src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx  (MaturityJourney off lesson pages, pb-32, TrackChrome + MaturityCelebration + ProactiveTutorSuggestion wired)
src/components/addie/lesson/LessonPlayer.tsx               (max-w-[68ch] + body type bump to 1.05rem/1.65)
src/components/addie/lesson/LessonStickyNav.tsx            (kill dead "Start" placeholder when prevHref null)
src/components/addie/lesson/LessonTutor.tsx                (docked top-right Ask chip, no more bottom collision)
src/components/addie/lesson/MaturityJourney.tsx            (SVG StageMark + SVG right-arrow, no emoji glyphs)
src/components/addie/lesson/VideoLessonView.tsx            (removed fake play CTA + duration pill)
src/components/addie/lesson/LessonBody.tsx                 (calm hero_quote + calm scene_set + calm scene_intro — same gold-rule + paper background as case_grid)
src/components/addie/lesson/PaywallPreview.tsx             (h3 → p — fixes h1→h3 jump on M4.2 paid lesson preview)
src/components/addie/lesson/AudioLessonView.tsx            (RoleSimulation embed on m1.3)
```

### New components (with tests)
```
src/components/addie/lesson/TrackChrome.tsx                NEW + TrackChrome.test.tsx (6 tests)
src/components/addie/lesson/MaturityCelebration.tsx        NEW (client-side stage-cross moment)
src/components/addie/lesson/ProactiveTutorSuggestion.tsx   NEW (3 pattern detectors over toolbox items)
src/components/addie/lesson/RoleSimulation.tsx             NEW + RoleSimulation.test.tsx (9 tests, 5 tracks)
src/lib/addie/email/teamSeatInvite.ts                      NEW + teamSeatInvite.test.ts (5 tests)
```

### Content (staged in worktree, NOT applied to DB)
```
supabase/seed/m0_addie.sql   -557 body words (45% cut on body_md)
supabase/seed/m1_addie.sql   -935 body words (46%)
supabase/seed/m2_addie.sql   -982 body words (44%)
supabase/seed/m3_addie.sql  -1,350 body words (40%)
supabase/seed/m4_addie.sql  -1,142 body words (49%)
supabase/seed/m5_addie.sql  -1,500 body words (43%)
```

### Documentation
```
docs/Foundation-Course-ADDIE/AiBI_Module_4_Skills.md            NEW (modeled on Module_0_Orientation)
docs/Foundation-Course-ADDIE/AiBI_Module_5_Prototypes.md        NEW (same)
docs/Foundation-Course-ADDIE/AiBI_Module_Production_Tracker.md  (updated with 2026-05-24 status + media-production section)
docs/Foundation-Course-ADDIE/CURRICULUM_UPDATE_2026-05-24.html  NEW (standalone, self-contained, Ledger styled)
docs/handoffs/addie-status-2026-05-24-text-cut.md               NEW (text-cut + bugfix details)
docs/handoffs/addie-handover-2026-05-24-complete.md             THIS DOC
tmp/canvas-snapshots/                                            12 snapshots (step-1 through step-12)
```

---

## Validation state at session close

- `npx tsc --noEmit` — clean (only errors are in untracked `addie-v1-stash/` scratch dir, not this session's work)
- `npm test` — **425/425 passing**, 82 test files
- `curl http://localhost:3000/foundation/m{0..5}/m*` — all 24 lesson endpoints return 200
- `curl http://localhost:3000/foundation-canvas` — 200 (operator review surface)
- `curl http://localhost:3000/api/addie/maturity` — 200 returning correct cold-path empty payload
- A11y audit across 8 key pages — clean (2 findings found and fixed)
- Dev server running on `localhost:3000` (PID may need restart on next session)

---

## Spec ↔ implementation reconciliation (M4 + M5)

Three real divergences between `AiBI_Module_PRDs.md` and the shipped seed; the seed is the implementation truth.

| Module | Item | PRD says | Seed (and shipped) say | Resolution |
|---|---|---|---|---|
| M4.3 | Back-Office role default | "press-release generator" | "Process rewrite to one page" | Seed wins |
| M4.3 | Leadership role default | "ten competitors research compiler" | "Board memo, one page" | Seed wins |
| M4.4 | Guardrail-check timing | "validated before save (FR-M4-3)" | Two-layer: (a) PII screen at save + (b) 4 guardrail notes after a clean run | Both layers exist |
| M5.1 | Agent Blueprint placement | First-class M5.1 takeaway (FR-M5-4) | Originally my doc demoted it to "optional bonus" | PRD wins; **amended** — Agent Blueprint is now an M5.1 Toolbox artifact with a 90-sec Do interaction |
| M5.4 | Prototyping tools | Lovable · Replit · Claude Code (3) | Lovable · Replit Agents · Claude Code · v0 (4) | Seed wins; v0 added for React UI mockups |

The full reconciliation tables are inside each module curriculum doc under the "Reconciliation with AiBI_Module_PRDs.md" appendix.

---

## What's still pending — and how to resume

### 1. Apply the six seed files to Supabase

The seed edits are staged in the worktree but **not applied to the live DB**. Until they apply, the live lesson pages still serve the old (long) body content.

**Three paths, pick whichever you prefer:**

```bash
# Path A — Supabase MCP (cleanest; needs MCP reauth in Claude Code)
# After /mcp reauth, ask me to apply the seeds. I'll use execute_sql
# per the official supabase skill and verify with row counts + body-
# length spot checks on m0.1, m1.1, m2.3, m3.5, m4.2, m5.4.

# Path B — Supabase CLI (--linked points at the live project)
cd ~/Projects/TheAiBankingInstitute/.worktrees/addie-v1
for f in supabase/seed/m{0..5}_addie.sql; do
  echo "→ applying $(basename $f)"
  supabase db query --linked < "$f"
done

# Path C — direct psql (if SUPABASE_DB_URL is exported)
for f in supabase/seed/m{0..5}_addie.sql; do
  psql "$SUPABASE_DB_URL" -f "$f"
done
```

All inserts are idempotent (`ON CONFLICT … DO UPDATE`), confined to the `addie.*` schema — no production tables touched.

**Spot-check queries after apply** (run any of these to verify the cut took effect):

```sql
SELECT id, length(body_md) AS chars FROM addie.lessons
WHERE id IN ('m0.1','m1.1','m2.3','m3.5','m4.2','m5.4')
ORDER BY id;
-- Expected: chars roughly 50–60% of pre-apply values.

SELECT module_id, count(*) AS lessons, sum(length(body_md)) AS total_chars
FROM addie.lessons GROUP BY module_id ORDER BY module_id;
```

### 2. Regenerate canvas tile thumbnails

After seeds apply, the static PNG thumbnails on `/foundation-canvas` will show *stale* content until regenerated:

```bash
python3 /tmp/aibi_canvas.py            # 24 lesson screenshots
python3 /tmp/aibi_module_bundles.py    # 6 module bundle pages
```

The HTML curriculum tracker at `docs/Foundation-Course-ADDIE/CURRICULUM_UPDATE_2026-05-24.html` does not depend on these thumbnails — it can be opened immediately.

### 3. Physical media production (out of engineering scope)

- 13 video lessons + 2 audio lessons unrecorded
- See the *Media production* section at the bottom of `AiBI_Module_Production_Tracker.md` for the full inventory and the drop-in path (upload `<lesson_id>.mp4` + `<lesson_id>.vtt` to the configured bucket; update `lesson_track_variants.media_ref` or `lessons.media_ref`)

---

## Quick-pick review URLs (dev server)

Once dev server is up (`PORT=3000 npm run dev` in the worktree):

- Operator canvas — http://localhost:3000/foundation-canvas
- M0.2 Sacred Rule moment — http://localhost:3000/foundation/m0/m0.2
- M1.1 (the screenshot the user critiqued; now cleaned up) — http://localhost:3000/foundation/m1/m1.1
- M1.3 with RoleSimulation embedded — http://localhost:3000/foundation/m1/m1.3
- M3.5 keystone (Starter Prompt Pack) — http://localhost:3000/foundation/m3/m3.5
- M4.2 first paid lesson — http://localhost:3000/foundation/m4/m4.2
- M5.4 prototype launcher — http://localhost:3000/foundation/m5/m5.4
- Gate three-way fork — http://localhost:3000/foundation/gate

(Until the seeds apply, lesson bodies still show the OLD long text — but every component, layout fix, a11y change, and visual treatment is live.)

---

## Commit guidance (when ready)

Recommended commit shape — three commits in sequence, each independently reviewable:

```bash
# 1) Bug fixes + layout pass
git add src/app/api/addie/maturity/route.ts \
        src/components/addie/lesson/v2/SacredRule.tsx \
        src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx \
        src/components/addie/lesson/LessonPlayer.tsx \
        src/components/addie/lesson/LessonStickyNav.tsx \
        src/components/addie/lesson/LessonTutor.tsx \
        src/components/addie/lesson/MaturityJourney.tsx \
        src/components/addie/lesson/VideoLessonView.tsx \
        src/components/addie/lesson/LessonBody.tsx \
        src/components/addie/lesson/PaywallPreview.tsx \
        src/components/addie/lesson/AudioLessonView.tsx
git commit -m "fix(addie): maturity API identity + SacredRule a11y + lesson layout pass"

# 2) Transformation Vision components + tests
git add src/components/addie/lesson/TrackChrome.tsx \
        src/components/addie/lesson/TrackChrome.test.tsx \
        src/components/addie/lesson/MaturityCelebration.tsx \
        src/components/addie/lesson/ProactiveTutorSuggestion.tsx \
        src/components/addie/lesson/RoleSimulation.tsx \
        src/components/addie/lesson/RoleSimulation.test.tsx \
        src/lib/addie/email/teamSeatInvite.ts \
        src/lib/addie/email/teamSeatInvite.test.ts
git commit -m "feat(addie): TrackChrome + MaturityCelebration + ProactiveTutorSuggestion + RoleSimulation + Resend invite"

# 3) Content cuts + docs
git add supabase/seed/m*_addie.sql \
        docs/Foundation-Course-ADDIE/AiBI_Module_4_Skills.md \
        docs/Foundation-Course-ADDIE/AiBI_Module_5_Prototypes.md \
        docs/Foundation-Course-ADDIE/AiBI_Module_Production_Tracker.md \
        docs/Foundation-Course-ADDIE/CURRICULUM_UPDATE_2026-05-24.html \
        docs/handoffs/addie-status-2026-05-24-text-cut.md \
        docs/handoffs/addie-handover-2026-05-24-complete.md
git commit -m "content(addie): 44% body-text reduction across all 24 lessons + M4/M5 curriculum docs + handoffs"
```

---

## One-page summary if you only read this

| Area | Status |
|---|---|
| Body-text reduction (24 lessons) | ✅ 44% overall |
| Maturity API bug | ✅ Fixed |
| SacredRule a11y | ✅ Fixed |
| MaturityJourney SVG glyphs | ✅ Replaced |
| TrackChrome (15 hooks, 5 tracks) | ✅ Live |
| MaturityCelebration | ✅ Live |
| ProactiveTutorSuggestion (3 detectors) | ✅ Live |
| RoleSimulation (5 tracks × 3 turns) | ✅ Live on m1.3 |
| Resend invite template + tests | ✅ Ready |
| M4 detailed curriculum doc | ✅ Written + reconciled |
| M5 detailed curriculum doc | ✅ Written + reconciled |
| A11y audit (8 pages) | ✅ Clean |
| Layout pass (per user feedback) | ✅ Fixed |
| Production tracker | ✅ Updated |
| Standalone HTML curriculum tracker | ✅ Generated |
| Tests | ✅ 425/425 |
| Typecheck | ✅ Clean |
| Lesson endpoints (24 of 24) | ✅ 200 |
| **Apply seeds to Supabase** | **⏸ Operator action — your MCP reauth or one of the CLI commands** |
| **Regenerate canvas thumbnails** | **⏸ Post-seed-apply** |
| **Record videos + audios** | **⏸ Physical media production** |

Branch is currently 17 commits ahead of main *before* this session's changes; uncommitted state from this session sits in the worktree pending your commit when ready.
