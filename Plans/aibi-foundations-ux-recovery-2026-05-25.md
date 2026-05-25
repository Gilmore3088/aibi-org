---
status: active
created: 2026-05-25
owner-tasks: tasks/aibi-foundations-ux-recovery.md
---

# AiBI Foundations — UX Recovery Plan (2026-05-25)

## WHY

The 2026-05-25 product review (CEO/CMO/Product lens) and the parallel
2026-05-24 reviewer fleet (CEO Bill Hagedorn $380M, CRO Margaret Holloway
$1.2B, Branch Mgr Devon Reyes $480M CU, Sr PM Vera Kowalczyk e2e flows)
converge on a structural concern: the current Foundation Course product
experience does not yet support the strategic ambition or the $295 / $1k+
price points. The blunt verdict was *"the team is building **pages**, not
an experience."*

This plan converts that finding into tracked work and explicitly separates
issues that are real (apply to learner-facing surfaces) from issues that
reflect operator-tool scaffolding the reviewer was misreading as learner UI.

---

## DECISIONS LOCKED 2026-05-25

Four directional calls made by the founder this session — quoted in the
plan body wherever they shape downstream work. No further re-framing of
these without a Decisions Log entry.

| # | Decision | Status |
|---|---|---|
| 1 | **Adopt the Guided Lesson Shell extraction + migrate M0–M3 onto it as Phase 1.** | ✅ Locked |
| 2 | **Replace M4's "AI Work Profile" artifact with the Workbench Pack** as the primary paid takeaway. | ✅ Locked |
| 3 | **M5 stays "Projects and Context (Write a Project Brief)" per the curriculum spine** (M3 = Prompts · M5–M6 = Skills · M8 = Agents · M10–M12 = Ideas + Prototypes), **re-threaded so the Project Brief feeds a real Workbench Pack run** (not the old AI Work Profile). | ✅ Locked |
| 4 | **Tagline remains "Turning Bankers into Builders."** | ✅ Locked |

**Note on curriculum framing.** The user's "prompts → skills → agents →
ideas → prototypes" framing maps onto the existing curriculum spine in
`content/courses/foundation-program/`:

| Curriculum module (existing) | Maps to |
|---|---|
| M3 Prompting Fundamentals | **Prompts** |
| M5 Projects and Context (Write a Project Brief) | **Skills** |
| M6 Files and Document Workflows | **Skills** |
| M8 Agents and Workflow Thinking | **Agents** |
| M10 Role-Based Use Cases | **Ideas** |
| M11 Personal Prompt Library | **Ideas** |
| M12 Final Foundation Lab | **Prototypes** |

M4 (Your AI Work Profile → **Your Workbench Pack**) is the bridge between
Prompts and Skills. Decision #2 changes the M4 artifact; it does not move
the spine.

---

## AUDIT FINDINGS (2026-05-25)

Specific phrases the original 2026-05-25 product review called out, audited
against the live code on `feature/addie-v1`:

| Phrase | Where it appears |
| --- | --- |
| `FEEL SEEN`, `MENTAL MODEL`, `MICRO-CHECK`, `BUILD YOUR KIT`, `SEE IT HAPPEN` | **0 occurrences** in learner-facing `body_md` seeds or component code (per `grep -REn` 2026-05-25). These were instructional-design beats in earlier PRDs; they never made it into shipped seeds. |
| `Design Canvas`, `Module Bundle`, `captured at 1280`, `deep-linked`, `pre-fired` | **0 occurrences** in `src/`. They live only in `scripts/aibi_canvas.py` + `scripts/aibi_module_bundles.py`, the operator-only review system gated to `OPERATOR_EMAILS` at `/foundation-canvas/*`. Learners never see them. |
| `video in production` placeholder | Pre-redesign m0.1 content; current `M01Experience` (commit `038db0b`, refined in `a3a5fa4`) renders the new onboarding screen with no video placeholder. |
| Footer-leakage between lesson steps | PDF-export artifact of the canvas-bundle pipeline (iframes inside one tall HTML), not the live UI. |

**Conclusion.** Part of the 2026-05-25 review reacted to operator-tool
scaffolding (the canvas PDF format) interpreted as learner-facing. The
operator surface has been retitled (commit pending: `scripts/aibi_canvas.py`
and `scripts/aibi_module_bundles.py` updated to make the operator framing
explicit) so future reviews don't trigger the same reaction.

**The rest of the critique is real and applies to the live product** —
captured below and corroborated by the 2026-05-24 reviewer fleet.

---

## WHAT THE 2026-05-24 REVIEWER FLEET SAYS (consensus + new findings)

### Strong consensus — what is working and must not regress

- **M0–M3 is the strongest banker-facing AI orientation any of the
  reviewers have seen in two years.** All three banker personas (CEO,
  CRO, Branch Mgr) would deploy M0–M3 across their institutions
  tomorrow.
- **M0.2 "describe the situation, not the person"** — universally the
  standout lesson. Bill: "best single thing in here." Devon:
  "laminate it on the teller line." Margaret: "the single most useful
  sentence in any AI training I have reviewed."
- **M1.1 mental model** (training cutoff · no live knowledge ·
  hallucination as a property) — universal praise for the three-line
  frame.
- **M3.4 Spot-the-Violation drill** — universally cited as the lesson a
  CCO would log for compliance evidence.
- **Ledger aesthetic + editorial voice** lands as "consulting
  materials, not SaaS" — exactly the intended trust signal. No
  reviewer asked us to brighten the palette or add motion.
- **The gate copy** ("no countdowns, no scarcity. Your progress and
  artifacts are kept.") is trust-positive and must stay.

### Net-new findings the prior plan did not yet capture

1. **(CRO) Model risk inventory gap.** Every saved Skill in M4 is
   technically a model under SR 11-7 (recurrent use against rule
   text, feeding board-readable summaries = unvalidated model). The
   Workbench Pack must carry `version` + `approver` + `use-boundary`
   metadata — this directly validates Decision #2's shape and adds
   required fields to it.

2. **(CRO) Public-material-as-process.** M2.3 / M3.1 treat "public"
   as a binary. Even CFPB-public material goes through institutional
   approval before leaving a workstation as part of an analytical
   artifact. The course nowhere acknowledges this — a learner
   completes M0.2 and confidently does the wrong thing on Monday.

3. **(CRO) Workbench Pack name already appears in M5.5 copy with no
   lesson producing one.** Direct evidence the concept exists in copy
   but not in code — fix in Phase 2 along with Decision #2.

4. **(CEO) Institutional readiness deliverable missing.** Leadership
   track ends with the same prototype URL as the customer-facing
   track. CEOs need a one-page governance brief authored *inside*
   M5 (a Board AI Brief / Risk Appetite Statement template), not
   punted to the $99 assessment.

5. **(CEO) Only 5 of 24 lessons branch.** That makes this a course
   with leadership grace notes, not a leadership track. Floor for a
   credible leadership product is 10/24 branched.

6. **(CEO) Seat-allocation decision tree for the buyer.** $295 × 18
   = $5,310 is unjustified without a "who in your institution gets
   M4–M5" decision tree. The course should help a CEO choose 4–6
   paid seats, not sell 18. That single page would turn ambivalent
   buyers into committed ones.

7. **(Branch Mgr) Vocabulary gate.** SR 11-7, MNPI, OCC, Reg E,
   ECOA/Reg B, PRD, chain-of-thought, few-shot — all undefined on
   first use. A six-week MSR glazes over. Hover glossary or plain-
   English aside required on first appearance.

8. **(Branch Mgr) "<15 min" promise breaks at M3.** Honest timings:
   M3.2 ~25min, M3.3 ~22min, M3.4 ~20–30min, M3.5 ~35–45min. The
   trust-building hook on M0.1 cracks at the conversion finale.
   Either retime the promise or split the long lessons.

9. **(Branch Mgr) No "what does an AI tool look like" onboarding.**
   M0.1 talks course shape, M0.2 talks data discipline, M1.1 jumps
   to token prediction — a learner who has never opened
   Claude/ChatGPT reaches M2.3 still not knowing what the input
   box looks like.

10. **(Branch Mgr) Skill-portability question unanswered.** Does a
    saved Working Skill work *outside* the Toolbox in the learner's
    sanctioned tool? The "recipe vs kitchen" paragraph is missing.
    If the answer is no, the M4 artifact dies the moment the tab
    closes.

11. **(Vera/E2E) Systems arc broken even though content arc is sharp.**
    Four front doors (`/assessment`, `/foundation`, the gate,
    `/results`), zero hallways. iOS Safari memory eviction kills
    sessionStorage. Post-Stripe identity binding has three
    candidate landing URLs. Two toolbox routes (`/my-toolbox` vs
    `/dashboard/toolbox`) split the canonical "where my work lives"
    surface.

12. **(Vera) Result page buries the peak.** Three-CTA stack (Pay $295
    / Buy $99 / Free course) sits *on top of* the score reveal.
    The Hick's-law cost-shape parity problem fires *before* the
    gate — at the result page — and again at the gate. The score
    moment should breathe.

13. **(Vera) No "Welcome back, [first name]" carry-through.** System
    captures name at the email gate, immediately forgets it on
    `/foundation`. Five lines of code, large emotional payoff.

14. **(Vera + comprehensive audit) M4.2 SkillBuilder save UX does not
    yet render four-field metadata (F8 deferred).** The paid peak
    moment under-delivers on the artifact that justifies $295.
    Folds into Decision #2 — when we ship the Workbench Pack
    artifact, the four-field metadata becomes the Pack's
    governance fields.

---

## WHAT IS REAL AND NEEDS WORK (organized)

### 1. Design-system reset (high — Phase 1)

The prior plan correctly flagged that the project lacks codified shell
templates. Today's M0 has two custom shells (`M01Experience`,
`M02Experience`) and every other lesson runs through the generic
`LessonPlayer`. The migration plan
(`docs/Foundation-Course-ADDIE/AiBI_Lesson_Shell_Migration.md`) exists
but only m0.2 was migrated; the surface has not been generalized.

**Three target shells:**

1. **Guided Lesson Shell** *(Phase 1 — Decision #1 locked)* — for
   M0–M3. One focused step at a time, right-rail Coach/Toolbox,
   single bottom nav. This is roughly what `LessonStepShell`
   already does. Job: extract it from M02Experience, make it the
   canonical lesson container, migrate the other free lessons
   onto it.
2. **Paid Workbench Shell** *(Phase 2)* — for M4+. Three-pane
   layout (source / controls / output), review bar, save/export.
   Does not exist today.
3. **Artifact Review Shell** *(Phase 3)* — for save moments. Today
   `DataDisciplineCardArtifact` is the only worked example.
   Generalize to cover Prompt Moves Card, Workbench Pack,
   Compliance Review, etc.

### 2. Paid-module value — M4 Workbench Pack (high — Phase 2)

**Decision #2 locked.** M4's primary takeaway changes from "AI Work
Profile" to **Workbench Pack**, with the artifact shape consolidated
from the prior plan + the CRO's governance requirements:

```
Workbench Pack {
  // Pedagogical core (from the 2026-05-25 review)
  source_packet
  prompt_used
  first_output
  review_tags
  improved_output
  questions_to_confirm
  final_work_product

  // Governance metadata (from CRO Margaret, addressing SR 11-7)
  version
  approver            // null while in personal-use; named on team deploy
  use_boundary        // "personal sandbox" | "named-task production"
  validation_notes    // four-question guardrail check from M4.4
}
```

This is a real product decision that changes:
- `AiBI_Module_4_Skills.md` curriculum doc
- `addie.lessons.takeaway_artifact_type` enum
  (currently has `skill_template`; adds `workbench_pack`)
- M4 interactives (`SkillBuilder` → `WorkbenchPackBuilder`)
- The save flow (a Pack is *one composite artifact*, not three
  separate Skill rows)
- M5.5 closing copy (currently references "Workbench Pack" as if
  it already exists)

### 3. M5 re-thread, not re-scope (medium — Phase 2)

**Decision #3 locked.** M5 stays "Projects and Context: Write a Project
Brief" per the curriculum spine. The re-thread:
- Where M5 today seeds the AI Work Profile, it now seeds **a new
  Workbench Pack** by giving the learner a Project Brief that
  drives the Pack on a real project of their own.
- M4 teaches Pack mechanics on synthetic banking scenarios; M5
  teaches the Brief skill so the learner can run the Pack
  against their actual work.

This **also** addresses CEO Bill's "institutional readiness deliverable"
finding: the leadership-track variant of M5's Project Brief can be the
Board AI Brief / Risk Appetite Statement template. **Add to Phase 2
scope.**

### 4. Vocabulary + onboarding pass (medium — Phase 1)

**New scope from Branch Mgr Devon.** Plain-English asides on first use
for: SR 11-7, MNPI, OCC, Reg E, ECOA/Reg B, PRD, chain-of-thought,
few-shot. Add a 30-second "here is the input box, here is the output"
onboarding still or screenshot before M1.1 introduces token
prediction. Lift into Phase 1 because it lives in lesson body copy
the Shell migration is already touching.

### 5. Timing honesty (medium — Phase 1)

**New scope from Branch Mgr Devon.** The "<15 min per lesson" promise on
M0.1 breaks at M3 for non-technical learners. Two options:
- Retime the promise on M0.1 to a banded estimate ("8–25 min;
  longer drills clearly flagged"), OR
- Split M3.2 (A/B sandbox), M3.3 (5 patterns), M3.4 (12 scenarios),
  M3.5 (build 3 prompts) into shorter lessons.

Recommended: retime on M0.1; split M3.3 into 3.3a (default brief)
and 3.3b (advanced patterns) because Pair 1 also flagged M3.3 as
cognitive-overload. Lift into Phase 1.

### 6. Typography pass (medium — Phase 1)

Mono uppercase only for metadata, status, breadcrumb (already the
rule). Body kicker labels (e.g., "What you will leave able to") at
most 0.18em tracking, never the dominant element on a beat. Folds
into the Shell migration because the Shell is the typography
contract.

### 7. Funnel + systems arc (high — Phase 4)

**New scope from Vera's E2E audit.** Phased after the content/shell
work because these are wiring problems, not lesson problems:

- `sessionStorage` → `localStorage` with TTL for assessment
  flight-state (iOS Safari memory eviction kills sessionStorage).
- "Welcome back, [first name]" personalization on `/foundation`
  after captured email (5 lines of code, large payoff).
- Move three-CTA stack OFF the result page; let the score
  breathe. CTAs after a scroll affordance.
- Demote Decline below the gate's three-card grid; surface it
  as small tertiary text affordance.
- Stripe `success_url` → `/foundation/welcome?session_id=...`
  that mints auth + greets by name within 200ms.
- Consolidate `/my-toolbox` vs `/dashboard/toolbox` (pick one
  canonical; redirect the other).
- `ResultsViewV2` dynamic import — add a `loading` skeleton.
- Email subjects lead with the score, not the brand.

### 8. Navigation discipline (low — incremental)

Mostly already done on v2-shell routes. On legacy `LessonPlayer`
routes, duplication remains. Tracks as each lesson migrates onto the
Shell (Phase 1).

### 9. GTM positioning (high / out of engineering scope)

Original 2026-05-25 review recommended repositioning off "Turning Bankers
into Builders." **Decision #4 locked: tagline kept.** Re-evaluate
after Phase 2 lands; the course experience will tell us whether the
framing is honest. The "AI Opportunity Mapper" lead-magnet idea
parks for later founder/CMO consideration.

---

## PHASING (revised after decisions locked)

This plan does **not** adopt the original review's 30-day cadence
verbatim. Phase 1 starts as soon as the user signs off on this revised
plan.

### Phase 0 (today, 2026-05-25)

- [x] Document the audit + critique synthesis in this plan
- [x] Lock the four directional decisions (Decisions Locked section
      above)
- [ ] Strip prototype-board framing from the operator canvas
      captures (`scripts/aibi_canvas.py` + `scripts/aibi_module_bundles.py`
      retitled — committed on `feature/addie-v1`, carry forward to
      addie-v2 or land separately)
- [ ] Append a `DECISIONS.md` entry with the four locked decisions

### Phase 1 — Guided Lesson Shell + content polish

**Goal:** every free lesson (M0–M3, 12 lessons + M0.1 + M0.2) runs
on the same canonical `LessonStepShell`. Typography, timing, and
vocabulary asides land as part of the migration so we don't touch
the same files twice.

**Workstream A: Shell extraction**
- A1. Extract `LessonStepShell` from `M02Experience` into a generic
      component with documented prop contract
- A2. Document the Shell's prop contract in
      `docs/Foundation-Course-ADDIE/AiBI_Lesson_Shell_Migration.md`
      (extend the existing migration doc)
- A3. Identify the legacy lessons currently running through
      `LessonPlayer` and `M01Experience` (audit + list)

**Workstream B: M0–M3 migration**
- B1. Migrate M0.1 from `M01Experience` to `LessonStepShell`
      (preserve the onboarding screen content; this is where the
      "what does an AI tool look like" frame from Finding #9 lands)
- B2. Migrate M1.1–M1.4 onto the Shell
- B3. Migrate M2.1–M2.4 onto the Shell
- B4. Migrate M3.1–M3.5 onto the Shell

**Workstream C: Inline content polish (lands inside each migration commit)**
- C1. Plain-English asides on first use: SR 11-7, MNPI, OCC, Reg E,
      ECOA/Reg B, chain-of-thought, few-shot (PRD is M5, handled later)
- C2. Retime the M0.1 promise card to a banded estimate
- C3. Split M3.3 into 3.3a (default brief) + 3.3b (advanced patterns)
- C4. Typography-restraint pass: mono caps only for metadata/status/
      breadcrumb; body kickers ≤ 0.18em tracking

**Workstream D: Acceptance**
- D1. All 13 free lessons render through the same Shell
- D2. Zero TypeScript errors on `npm run build`
- D3. Mobile pass on iPhone 13 mini (Branch Mgr's tighter target)
- D4. Reviewer walk-through with the locked-design system Shell
      contract document open alongside the live URL

**Phase 1 explicitly does NOT touch:**
- M4 / M5 lessons (Phase 2)
- Funnel wiring / state machine (Phase 4)
- Assessment flow (Phase 4)

### Phase 2 — Workbench Pack + M5 re-thread

**Goal:** ship the Workbench Pack as M4's primary paid artifact;
re-thread M5's Project Brief to feed it; add the leadership-track
institutional brief variant.

- E1. Add `workbench_pack` to
      `addie.lessons.takeaway_artifact_type` enum (migration)
- E2. Build the Paid Workbench Shell (three-pane: source / controls
      / output + review bar + save)
- E3. Build `WorkbenchPackBuilder` (replaces / extends
      `SkillBuilder`)
- E4. Update `AiBI_Module_4_Skills.md` curriculum doc to reflect
      Workbench Pack
- E5. Update M4 lesson seeds (M4.1–M4.4) to produce the Pack
- E6. Re-thread M5 Project Brief lesson to drive a Pack run
- E7. Add leadership-track variant of M5 Project Brief:
      Board AI Brief + Risk Appetite Statement template (addresses
      CEO Bill's institutional-deliverable gap)
- E8. Update M5.5 closing copy to match (currently references
      Workbench Pack that doesn't exist)

### Phase 3 — Artifact Review Shell + leadership-track depth

- F1. Generalize `DataDisciplineCardArtifact` into a typed Artifact
      Review Shell
- F2. Variants for: Prompt Moves Card, Workbench Pack, Compliance
      Review
- F3. Add 5 more leadership-track branches (current floor 5/24; CEO
      target 10/24)
- F4. Add "what can go wrong, by department" lesson (CEO Bill's
      worst-case walkthrough)
- F5. Add seat-allocation decision tree for the institutional buyer

### Phase 4 — Funnel wiring (Vera's findings)

- G1. `sessionStorage` → `localStorage` (TTL 24h) for assessment
      flight-state
- G2. "Welcome back" personalization on `/foundation` after email
      capture
- G3. Result-page CTA repositioning (let the score breathe)
- G4. Gate cost-shape parity fix (demote Decline below the grid)
- G5. Stripe `success_url` + auth-binding flow
- G6. Toolbox route consolidation
- G7. `ResultsViewV2` loading skeleton
- G8. Email subject lines lead with score

---

## NOT IN SCOPE FOR THIS PLAN

- The original review's pricing / AI Opportunity Mapper / enterprise
  buyer deck recommendations (founder/CMO work, not engineering)
- The 11-phase / 30-day cadence from the original review's task list
  (treat that as a wish list; phasing matches actual cadence)
- Tagline change (Decision #4: keep — founder call)
- Course-scope re-framing beyond the four locked decisions
  (per the `lock and refine, don't re-reframe` working agreement)

---

## OPEN QUESTIONS THAT STILL NEED USER INPUT

The four directional decisions are locked. Phase-2-and-beyond work
still has open product questions that should be resolved before each
phase starts:

1. **(Phase 2) Workbench Pack — singular composite artifact, or a
   parent artifact with linked child rows?** The schema sketch above
   treats it as one composite document. If we need per-field
   versioning, child rows might be better. Default: composite,
   revisit if version diffing requires more granularity.

2. **(Phase 2) Skill portability — does the Pack export to plain
   markdown the learner can paste into Claude/ChatGPT outside the
   Toolbox?** Branch Mgr Devon's "recipe vs kitchen" finding makes
   this the conversion question for paid users. Recommended:
   yes, with a copy-to-clipboard affordance on every Pack page.

3. **(Phase 3) How many leadership branches before we ship the
   leadership-track refresh?** CEO target is 10/24 (currently 5).
   That's 5 new branched-variant authoring jobs. Estimate before
   committing.

4. **(Phase 4) Result-page CTA repositioning — at the score reveal,
   what is the *one* primary CTA?** Vera's recommendation: let
   the score breathe; surface a single "Start the free course"
   after a scroll affordance. The Pay $295 / Buy $99 / Free course
   triangle moves to a separate CTA block below or on the
   `/foundation` landing.

---

## SOURCES THIS PLAN INTEGRATES

- `Plans/aibi-launch-spec-v2.md` — canonical product ladder
- `docs/reviews/foundation-comprehensive-audit-2026-05-24.md`
- `docs/reviews/foundation-critique-ceo-bill-hagedorn-2026-05-24.md`
- `docs/reviews/foundation-critique-cro-margaret-holloway-2026-05-24.md`
- `docs/reviews/foundation-critique-branch-mgr-devon-reyes-2026-05-24.md`
- `docs/reviews/e2e-4-flow-audit-vera-kowalczyk-2026-05-24.md`
- `docs/Foundation-Course-ADDIE/AiBI_Module_4_Skills.md`
- `docs/Foundation-Course-ADDIE/AiBI_Module_5_Prototypes.md`
- `docs/Foundation-Course-ADDIE/CURRICULUM_UPDATE_2026-05-24.html`
- `content/courses/foundation-program/module-{1..12}.ts` (curriculum spine)
- `CLAUDE.md` (brand + tagline history, banned phrases, color tokens)
- Memory entries: `feedback_lock_and_refine`,
  `project_m4_workbench_pack`, `project_foundation_course_design`,
  `feedback_demo_realism_and_card_concept`
