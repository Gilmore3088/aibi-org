# Foundation E2E + Gap Report — 2026-05-24

**Branch:** `feature/addie-v1`
**Working tree:** `/Users/jgmbp/Projects/TheAiBankingInstitute/.worktrees/addie-v1`
**Commits in scope:** `7f6d1cb` (whole-course audit fixes) + `f93983b` (per-page specialist fixes).

This report closes out the goal "resolve the specialist reports once complete · launch end-to-end test · review original documents and identify where we are missing or gaps."

## 1 · End-to-end checks (code + route layer)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` (excluding `addie-v1-stash/`) | **0 errors** |
| `npx next lint --quiet` | **clean** (only the pre-existing plugin-config conflict warning) |
| `git status` (audit-related paths) | clean (committed in `f93983b`) |
| Route coverage probe (35 surfaces) | **35 / 35 return 200** |
| `grep -REn 'unlock' src/app/(addie)/foundation src/components/addie supabase/seed` | 0 user-facing leaks (one occurrence in `m4_addie.sql:489` is the legitimate phrase "leaving a lever unlocked") |
| `grep -REn 'AiBI-S/' src/components/addie/lesson` | 0 |
| `grep -REn 'font-newsreader' src/components src/app/(addie)` | 0 |
| `grep -REn 'foundation/foundation' src/components src/app/(addie)` | 1 — a code comment, not a link |
| Inline-SVG raw hex in `/foundation/security` | 0 |
| `bg-[var(--ledger-parch)]` paired with body prose on MaturityJourney compact strip | replaced with `--ledger-paper` |

**Routes probed (all 200):**

```
/  /assessment  /assessment/in-depth
/foundation  /foundation/security  /foundation/privacy  /foundation/terms  /foundation/cookies
/foundation/for-community-banks  /foundation/contact-sales  /foundation/pricing
/foundation/gate  /foundation/assessment  /foundation/dashboard
/foundation/dashboard/team  /foundation/dashboard/toolbox
/foundation/m0 .. /foundation/m5
/foundation/m0/m0.1  /foundation/m0/m0.2  /foundation/m1/m1.1  /foundation/m3/m3.5
/foundation/m4/m4.1  /foundation/m5/m5.1
/foundation-canvas  /foundation-canvas/m0 .. /foundation-canvas/m5
```

> **Important caveat on the lesson-route 200s.** Next.js' `notFound()` resolves to a 200 with the not-found shell rendered. The m0 and m4 per-page specialists confirmed by HTML diff that **every `/foundation/<moduleId>/<lessonId>` route currently returns the byte-identical not-found page**. This is not a UI bug — see Gap §3 below.

## 2 · Specialist reports resolved

Seven specialist reports landed:

| Report | Findings | Status |
| --- | --- | --- |
| Whole-course audit (`foundation-ui-specialist-audit-2026-05-24.md`) | 25 (0 B · 6 H · 9 M · 10 L) | HIGH addressed in `7f6d1cb`; fix-log notes the deferrals |
| `/foundation` home | 8 (0 B · 3 H · 2 M · 3 L) | HIGH addressed in `f93983b` |
| `/foundation/gate` | 10 (1 B · 3 H · 3 M · 3 L) | BLOCKER + 2 of 3 HIGH addressed in `f93983b` (shared CSS) |
| `/foundation/m0` + lessons | 20 (2 B · 6 H · 5 M · 7 L) | One BLOCKER addressed (radii/shadow on module page); the lesson-route 404 BLOCKER is the deployment gap below |
| `/foundation/m3` + m3.5 | 12 (0 B · 2 H · 7 M · 3 L) | HIGH addressed in `f93983b`; seed "unlock" fixed |
| `/foundation/m4` | 12 (1 B · 3 H · 3 M · 4 L) | BLOCKER = same lesson-route 404; module-page HIGH (CTA contrast + shadow) addressed in `f93983b` |
| `/foundation/dashboard` + `toolbox` + `team` | 9 (1 B · 1 H · 1 M · 6 L) | BLOCKER (broken `/foundation/foundation/...` link) + HIGH (`font-newsreader` no-op on 3 surfaces) addressed in `f93983b` |

**Deferred** (logged in `foundation-ui-specialist-fix-log-2026-05-24.md`):
- F10 — PaywallPreview lesson-specific teaser (structural, separate plan).
- Radii sweep — `rounded-[6px]/[8px]` literals still in `LessonSummaryCard`, `LessonBody`, `NextLessonCTA`, `v2/RuleHeroCard`, `v2/M02Experience`, `v2/DataDisciplineCardArtifact`.
- `<em>`/`not-italic`/`italic-off` cleanup pass.
- Body-on-parch sweep on `DeliverableSection`, `SkillBuilder`, `SeatStatusPill`.
- Lesson Shell Migration (`AiBI_Lesson_Shell_Migration.md`) — 23 of 24 free lessons still on the legacy template.

## 3 · Gap analysis — code vs. canonical ADDIE docs

Cross-referenced shipped state against `docs/Foundation-Course-ADDIE/`:

### 3.1 · BLOCKER · ADDIE schema not deployed to Supabase

**Evidence.** Direct query against the Supabase project the dev server connects to:

```
public.lessons   → MISSING (table not in schema cache)
public.modules   → not verified (further direct queries refused by auto-mode)
```

**Cause.** 34 ADDIE migrations (`supabase/migrations/00037_addie_*.sql` … `00070_addie_*.sql`) plus 6 lesson seeds (`supabase/seed/m{0..5}_addie.sql`) have never been applied to the connected Supabase. Result: `loadPayload()` in `[lessonId]/page.tsx:82` returns `null` because the lessons query finds no row, and `notFound()` fires at line 332.

**Why this is the dominant gap.** Without the schema:
- No lesson surface renders content.
- No paywall gate is exercised (the paid-tier check never matters when no row loads).
- No knowledge-check writes, no Toolbox saves, no track variants.
- The whole free → gate → paid funnel is non-functional in the dev environment.

**What this means for the canvas work.** The `/foundation-canvas/*` operator surfaces still render — they pull lesson rows when present and gracefully render empty when not — but the per-lesson PNG bundles (which were generated previously and live in `public/canvas/`) are the only thing the canvas can show right now.

**What's needed.** Decision + execution by the user:

> ⚠️ APPLY THE 34 ADDIE MIGRATIONS + 6 SEEDS TO THE LINKED SUPABASE PROJECT?

Per branch-scoped CLAUDE.md, applying production migrations requires explicit consent and is out of scope without it. The migrations are non-destructive (additive — new tables in the `addie.*` namespace + companion seeds), but they still touch a shared Supabase instance.

### 3.2 · BLOCKER · Media production lag

The Module Production Tracker (`AiBI_Module_Production_Tracker.md`) is candid: of 13 planned video lessons, **0 are recorded**. Audio lessons 1.3 (×5 track variants) and 5.5 — same. Tracker notes this is "media production — operator work; backend wired." Not an engineering gap, but a launch-blocker if it slips.

### 3.3 · HIGH · Three Foundation pages not in the canonical inventory

The Screen Inventory (`AiBI_Screen_Inventory_Spec.md` §1) lists "roughly 45 screens." Routes that exist in shipped code but are not in the inventory:

| Route | Status |
| --- | --- |
| `/foundation/security`, `/foundation/privacy`, `/foundation/terms`, `/foundation/cookies` | Built but not catalogued — Screen Inventory has `/security` at site level only. The `/foundation/*` variants are likely duplicates of marketing pages and should either be removed or documented as the "in-course" copies. |
| `/foundation/for-community-banks`, `/foundation/contact-sales`, `/foundation/pricing` | Built but not in Screen Inventory §3. Likely additions made during the brand refresh — need a paragraph each in §3.1 (Marketing). |

### 3.4 · HIGH · Detailed module specs incomplete

Tracker calls "detailed specs 3/6" — M0 · M4 · M5 have full curriculum docs (`AiBI_Module_0_Orientation.md`, `AiBI_Module_4_Skills.md`, `AiBI_Module_5_Prototypes.md`). **M1, M2, M3 are seed-only**: rows in `supabase/seed/m{1,2,3}_addie.sql` but no companion curriculum markdown explaining the why/how, knowledge-check rationale, or track-variant copy. The Wave-2b text-density cut shrank body content 44% across modules; without specs, future content edits lose their constitution.

### 3.5 · MEDIUM · Lesson Shell Migration plan exists but not executed

`AiBI_Lesson_Shell_Migration.md` defines the migration target. Only `m0.2` ships the v2 shell (`M02Experience`); the other 23 free lessons still render the legacy hero-illustration + scrolling-body template. The whole-course audit F21 surfaced this; the per-page m0 specialist confirmed v2 introduces its own pattern divergence (`rounded-[5px]`/`[6px]` cards-with-parch-footers, literal ✓/× glyphs as icons). The migration needs a clean target spec before it scales.

### 3.6 · MEDIUM · `PaywallPreview` does not honour the Screen Inventory's per-lesson promise

Screen Inventory §3 implies each lesson page has its own state (anon → upgrade), and the m4 specialist confirms `PaywallPreview` reuses one component across all 9 paid lessons with module-level data only. This is the F10 finding from the whole-course audit; the H1→H2 kicker promotion ships, but the lesson-specific teaser is still owed.

### 3.7 · LOW · Tracker checkbox debt

The Module Production Tracker shows two known-bug fixes for 2026-05-24 already ticked (`/api/addie/maturity` identity + SacredRule a11y) but the tracker has not been amended to record the UI-specialist commits (`7f6d1cb`, `f93983b`). Per the user's standing rule "tick the tracker in the SAME COMMIT that lands the work" this is a small but real maintenance miss this session.

## 4 · Recommended next actions, in order

1. **Decision needed: apply ADDIE migrations + seeds to Supabase** (Gap 3.1). Until this is done, nothing under `/foundation/<moduleId>/<lessonId>` renders content; the canvas review surface is the only window into the curriculum work.
2. **Update the Module Production Tracker** to record `7f6d1cb` + `f93983b` and the per-page reports (Gap 3.7).
3. **Author M1, M2, M3 curriculum docs** to bring detailed specs to 6/6 (Gap 3.4).
4. **Catalogue the seven missing routes** in the Screen Inventory (Gap 3.3).
5. **Execute the deferred radii sweep** across `LessonSummaryCard`, `LessonBody`, `NextLessonCTA`, `v2/*` to retire `rounded-[5/6/8/10/12]px` literals.
6. **F10 — per-lesson PaywallPreview teaser** (whole-course audit follow-up).
7. **Lesson Shell Migration** (Gap 3.5) once a clean v2 target is locked in.

## 5 · Files committed in this session

```
7f6d1cb · fix(foundation-ui): F1-F4, F8, F25 from UI specialist audit
f93983b · fix(foundation-ui): per-page specialist findings (BLOCKER + HIGH cluster)
```

## 6 · Verification surface

The canvas system (`/foundation-canvas`) remains the operator's review surface — every per-module print-to-PDF page renders, with m3 still appending the post-M3 gate. The seven specialist reports live alongside this gap report in `docs/reviews/foundation-ui-specialist-*-2026-05-24.md`; the brief at `foundation-ui-specialist-brief.md` is the contract for re-dispatching the specialist against any future page change.
