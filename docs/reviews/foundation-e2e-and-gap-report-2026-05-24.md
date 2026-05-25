# Foundation E2E + Gap Report — 2026-05-24

**Branch:** `feature/addie-v1`
**Working tree:** `/Users/jgmbp/Projects/TheAiBankingInstitute/.worktrees/addie-v1`
**Commits in scope (this session):**
- `7f6d1cb` — whole-course UI specialist audit fixes (HIGH-tier)
- `f93983b` — per-page UI specialist fixes (BLOCKER + HIGH cluster)
- `031fdd4` — added `addie.lessons.objective_md` + `transfer_md` (root cause of lesson-route 404)
- `bc0c147` — M0 v2 data-discipline drill design spec
- `aae499b` — M0 Wave A: PRD content alignment (Strip / Card / Recap)

This report closes out the goals "resolve the specialist reports", "launch end-to-end test", "review original documents and identify where we are missing or gaps", and "PRD: Module 0 Update — Data Discipline."

## 1 · End-to-end checks (code + route layer)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` (excluding `addie-v1-stash/`) | **0 errors** |
| `npx next lint --quiet` | **clean** (only the pre-existing plugin-config conflict warning) |
| Route coverage probe (35 surfaces) | **35 / 35 return 200** |
| `grep -REn 'unlock'` foundation source + components + seeds | 0 user-facing leaks |
| `grep -REn 'AiBI-S/'` lesson components | 0 |
| `grep -REn 'font-newsreader'` foundation source | 0 |
| `grep -REn 'foundation/foundation'` foundation source + components | 1 — a code comment, not a link |
| `grep -En 'fill="#|stroke="#'` `/foundation/security` SVG | 0 |
| `addie.lessons` rows fetchable from server | **YES** (was the lesson-404 blocker; root cause was missing schema columns, not missing tables) |
| Module 0 v2 Strip step (Playwright) | 4 sensitive tokens, "Same work. Safer input.", "Safe situation", "Safe prompt", "Copy prompt" all render after Strip-all |

## 2 · Specialist reports resolved

Seven specialist reports written this session:

| Report | Findings | Status |
| --- | --- | --- |
| Whole-course audit | 25 (0 B · 6 H · 9 M · 10 L) | HIGH addressed in `7f6d1cb`; fix-log notes deferrals |
| `/foundation` home | 8 (0 B · 3 H · 2 M · 3 L) | HIGH addressed in `f93983b` |
| `/foundation/gate` | 10 (1 B · 3 H · 3 M · 3 L) | BLOCKER + 2 of 3 HIGH addressed in `f93983b` |
| `/foundation/m0` + lessons | 20 (2 B · 6 H · 5 M · 7 L) | Module-page BLOCKER addressed; lesson-route 404 fixed in `031fdd4` |
| `/foundation/m3` + m3.5 | 12 (0 B · 2 H · 7 M · 3 L) | HIGH addressed in `f93983b`; seed "unlock" fixed |
| `/foundation/m4` | 12 (1 B · 3 H · 3 M · 4 L) | Lesson-route 404 BLOCKER fixed in `031fdd4`; module-page HIGH addressed in `f93983b` |
| `/foundation/dashboard` + `toolbox` + `team` | 9 (1 B · 1 H · 1 M · 6 L) | BLOCKER (broken `/foundation/foundation/...` link) + HIGH (`font-newsreader` no-op) addressed in `f93983b` |

## 3 · Module 0 v2 PRD — what shipped vs what's deferred

The PRD's six-step drill (Rule / Strip / Sort / Check / Save / Recap) already had its scaffolding on this branch via the `M02Experience` v2 shell. This session aligned the content layer to the PRD; some chrome + new infrastructure work is deferred to follow-up tickets.

### Shipped this session (commit `aae499b`)

| PRD step | Change |
| --- | --- |
| 02 Strip | `AnonymizationFlow` extended from 2 to **4 sensitive tokens** matching the PRD example sentence ("Maria Lopez, account ending 4421, … $128 … wants a response by Friday"). Per-tap feedback (`aria-live="polite"`). "Safe situation" + "Safe prompt" panels reveal on all-stripped. "Copy prompt" button writes the PRD-exact safe prompt to clipboard. "Same work. Safer input." kicker reveals. Radii tightened from 5px to 3px. |
| 05 Save | `DataDisciplineCardArtifact` gained the four PRD subsections previously missing: the pattern line, the Examples block, and the three-column Allowed / Needs Review / Keep Out reference. "When in doubt" copy tightened to PRD wording. |
| 06 Recap | Five-bullet `What you learned` per PRD §10 Screen 6 (was four). |

### Already on this branch (no change needed)

| PRD step | Existing component | Notes |
| --- | --- | --- |
| 01 Rule | `RuleHeroCard` + `SacredRule` overlay | Rule + move + test copy already PRD-aligned. |
| 03 Sort | `OffLimitsSorter` | Three-bucket UI (Allowed / Needs Review / Off-Limits) already present with per-item feedback and track-aware item filtering (7 universal + 3 role-specific per track). |
| 04 Check | `KnowledgeCheck` widget + 3 seeded m0.2 KC rows | Q1, Q2, Q3 prompts and correct-answer rationale already PRD-aligned. Verified live in `addie.knowledge_checks`. |

### Deferred (next-up tickets)

1. **Hybrid AI Coach drawer** (PRD §11 + spec §4). Six static-answer chips + bounded free-text route. Overlaps with the existing `LessonTutor` component — needs its own short design conversation to decide whether to extend `LessonTutor` to surface chips or to ship a separate `LessonCoachDrawer`. Branch-scoped CLAUDE.md does not have an opinion either way.
2. **Six-step chrome polish** — collapse the course outline to a drawer-only mount; bottom sticky CTA on mobile; lesson-progress stepper labels capped at 6 visually-distinct chips.
3. **m0.1 light copy + chrome pass** — PRD scope explicitly includes copy/Toolbox-preview/role-track-confirmation polish on Lesson 1; not touched this session.
4. **Analytics persistence** — PRD §15/§16 events (`StripItActivityResult`, `SortActivityResult`, coach interactions) need to write to `addie.events` rows. The schema accepts arbitrary jsonb payload; only the wiring is missing.
5. **Email capture at card save for anon learners** — branch policy ("every save is a lead") already implies it; verify the existing flow on the Save step routes anon users to the email modal instead of failing silently.

## 4 · Gap analysis vs canonical ADDIE docs

### 4.1 · BLOCKER (resolved this session) · Lesson route 404

**Earlier gap report flagged this as a deployment gap.** Under Supabase MCP inspection, the ADDIE schema is fully deployed in the `addie.*` namespace (24 lesson rows, 6 modules, 55 KCs). Actual root cause: code drift — `loadPayload()` selected `objective_md, transfer_md` columns referenced by `LessonPlayer`'s `LessonObjectiveBeat` + `LessonTransferBeat`, but the migration adding those nullable text columns was never written. Migration `00071_addie_lessons_add_objective_transfer_md.sql` shipped in `031fdd4`. Every lesson route now renders real content (113–130 KB free, 73 KB locked paid).

### 4.2 · HIGH · Media production lag (unchanged)

Module Production Tracker: 0 of 13 planned video lessons recorded. Operator scope, not engineering.

### 4.3 · HIGH · Three Foundation pages not in Screen Inventory (unchanged)

`/foundation/security`, `/foundation/privacy`, `/foundation/terms`, `/foundation/cookies` (duplicates of marketing pages) and `/foundation/for-community-banks`, `/foundation/contact-sales`, `/foundation/pricing` (refresh additions) need entries in `AiBI_Screen_Inventory_Spec.md` §3.1.

### 4.4 · HIGH · Detailed module specs incomplete (unchanged)

M0 · M4 · M5 have curriculum docs. M1, M2, M3 are seed-only. The 2026-05-24 text-density cut shrank body content 44% across modules; without specs, future content edits lose their constitution.

### 4.5 · MEDIUM · Lesson Shell Migration plan exists but not executed (unchanged)

m0.2 is the only lesson on the v2 shell. The other 23 free lessons still render the legacy hero-illustration + scrolling-body template. The migration target is now better-defined since m0.2 received Wave A content alignment.

### 4.6 · MEDIUM · `PaywallPreview` still byte-identical across 9 paid lessons (F10, unchanged)

Whole-course audit follow-up: thread `lessonRow` into the paywall so each locked lesson renders its own teaser, or redirect `/foundation/m4|m5/<lessonId>` → `/foundation/m4|m5` for non-entitled viewers.

### 4.7 · LOW · Tracker checkbox debt

The Module Production Tracker has not been updated to record commits `7f6d1cb`, `f93983b`, `031fdd4`, `bc0c147`, `aae499b`. Per the user's standing rule "tick the tracker in the SAME COMMIT that lands the work" this is a small but real maintenance miss this session.

## 5 · Recommended next actions, in order

1. **Decision: how should the M0 Coach drawer relate to the existing `LessonTutor`?** Extend `LessonTutor` to expose chips OR ship a separate `LessonCoachDrawer`. ~30 min design conversation; then ship.
2. **Chrome polish wave** — outline drawer-only, bottom sticky CTA, six-step visual stepper. Can land in one commit.
3. **m0.1 light copy + chrome pass** — surface the Toolbox preview right rail, confirm role-track on entry, replace any "video in production" placeholder copy with the operational orientation language the PRD specifies.
4. **Analytics persistence** — wire `addie.events` writes for Strip / Sort completions and coach interactions.
5. **F10 — per-lesson PaywallPreview teaser** (whole-course audit follow-up).
6. **Lesson Shell Migration** — roll the v2 shell pattern out from m0.2 to the other 23 free lessons; the M02Experience template is now closer to PRD-shape and the right model.
7. **Author M1, M2, M3 curriculum docs** to bring detailed specs to 6/6.
8. **Update the Module Production Tracker** to record this session's commits.

## 6 · Files committed in this session (chronological)

```
7f6d1cb · fix(foundation-ui): F1-F4, F8, F25 from UI specialist audit
f93983b · fix(foundation-ui): per-page specialist findings — BLOCKER + HIGH cluster
158e94a · docs(reviews): E2E + gap report 2026-05-24 (this file's predecessor)
031fdd4 · fix(addie): add lessons.objective_md + transfer_md (root cause of lesson 404s)
bc0c147 · docs(spec): M0 v2 data-discipline drill design
aae499b · feat(m0.2): wave A — PRD content alignment (Strip / Card / Recap)
```

## 7 · Canvas state

Canvas PNG + PDF bundles regenerated against the live (now-rendering) lesson routes:
- `public/canvas/<lesson>.png` × 25 — refreshed.
- `public/canvas/modules/m0.{png,pdf}` — re-stitched after the Wave A content edits so the strip step's new copy appears in the operator review surface.
- `/foundation-canvas/m0..m5` — all 200; `/foundation-canvas/m3` still appends the post-M3 gate.

`public/canvas/` is gitignored by design — regenerable artefacts; the dev server serves them directly.
