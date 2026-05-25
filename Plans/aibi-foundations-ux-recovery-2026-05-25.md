---
status: proposed
created: 2026-05-25
owner-tasks: tasks/aibi-foundations-ux-recovery.md
---

# AiBI Foundations — UX Recovery Plan (2026-05-25)

## WHY

The 2026-05-25 product review (CEO/CMO/Product lens, multi-discipline panel) names a structural concern: the current Foundation Course product experience does not yet support the strategic ambition or the $295 / $1k+ price points. The blunt verdict was *"the team is building **pages**, not an experience."*

This plan converts that review into tracked work and explicitly separates issues that are real (apply to learner-facing surfaces) from issues that reflect operator-tool scaffolding the reviewer was misreading as learner UI.

## AUDIT FINDINGS (2026-05-25)

Specific phrases the review called out, audited against the live code on `feature/addie-v1`:

| Phrase | Where it appears |
| --- | --- |
| `FEEL SEEN`, `MENTAL MODEL`, `MICRO-CHECK`, `BUILD YOUR KIT`, `SEE IT HAPPEN` | **0 occurrences** in learner-facing `body_md` seeds or component code (per `grep -REn` 2026-05-25). These were instructional-design beats in earlier PRDs; they never made it into shipped seeds. |
| `Design Canvas`, `Module Bundle`, `captured at 1280`, `deep-linked`, `pre-fired` | **0 occurrences** in `src/`. They live only in `scripts/aibi_canvas.py` + `scripts/aibi_module_bundles.py`, the operator-only review system gated to OPERATOR_EMAILS at `/foundation-canvas/*`. Learners never see them. |
| `video in production` placeholder | Pre-redesign m0.1 content; current `M01Experience` (commit `038db0b`, refined in `a3a5fa4`) renders the new onboarding screen with no video placeholder. |
| Footer-leakage between lesson steps | PDF-export artifact of the canvas-bundle pipeline (iframes inside one tall HTML), not the live UI. |

**Conclusion.** Part of the review reacted to operator-tool scaffolding (the canvas PDF format) interpreted as learner-facing. The operator surface has been retitled today (commit pending: `scripts/aibi_canvas.py` and `scripts/aibi_module_bundles.py` updated to make the operator framing explicit) so future reviews don't trigger the same reaction.

**The rest of the critique is real and applies to the live product** — captured below.

## WHAT IS REAL AND NEEDS WORK

### 1. Design-system reset (high)

The review correctly flags that the project lacks codified shell templates. Today's M0 has two custom shells (`M01Experience`, `M02Experience`) and every other lesson runs through the generic `LessonPlayer`. The migration plan (`docs/Foundation-Course-ADDIE/AiBI_Lesson_Shell_Migration.md`) exists but only m0.2 was migrated; the surface has not been generalized.

**Three target shells named in the review:**

1. **Guided Lesson Shell** — for M0–M3. One focused step at a time, right-rail Coach/Toolbox, single bottom nav. This is roughly what `LessonStepShell` already does. Job: extract it from M02Experience, make it the canonical lesson container, and migrate the other free lessons onto it.
2. **Paid Workbench Shell** — for M4+. Three-pane layout (source / controls / output), review bar, save/export. Does not exist today.
3. **Artifact Review Shell** — for save moments. Today `DataDisciplineCardArtifact` is the only worked example. Generalize to cover Prompt Moves Card, Workbench Pack, Compliance Review, etc.

### 2. Paid-module value (high)

The review's strongest content point: **Module 4 saves "AI Work Profile" today; it should save a "Workbench Pack."**

Workbench Pack contents the review calls out:
- source packet
- prompt used
- first output
- review tags
- improved output
- questions to confirm
- final work product

This is a real product decision that changes the M4 curriculum doc (`AiBI_Module_4_Skills.md`), the takeaway-artifact-type enum (currently includes `skill_template`, doesn't have a `workbench_pack` type), the M4 interactives, and the save flow.

### 3. Module 5 re-scope (medium / strategic)

M5 currently titled *"From idea to prototype"*. The review argues this collides with the "Builders" tagline overpromise and is too technical for the current progression. Recommended replacements:

- Reusable Briefs
- Teaching AI Your Style
- Repeatable Workflows
- Your First Workbench Pack

This is the founder/CEO call, not an engineering call. Plan needs a decision before any M5 build work continues.

### 4. Typography pass (medium)

The review reads typography as "all-caps letter-spaced labels feel hieroglyphic." That's partly a real critique of the Ledger design system's wide use of mono-uppercase kickers — but those kickers ARE the design language. The fix is restraint, not removal:

- Mono uppercase only for metadata, status, breadcrumb (already the rule).
- Body kicker labels (e.g., "What you will leave able to") should be at most 0.18em tracking, never the dominant element on a beat.

### 5. Navigation discipline (low — mostly already done)

The review names duplicate navigation. On the v2-shell routes (m0.1, m0.2) navigation is already single — `LessonStickyNav` is the only bottom bar; CourseSidebar isn't mounted; no duplicate next/back. On legacy `LessonPlayer` routes some duplication remains. Track it; fix as each lesson migrates onto the shell.

### 6. GTM positioning (high / out of engineering scope)

Review recommends:
- Move marketing copy off "Turning Bankers into Builders" until the product earns it.
- Reposition as: *"Safely turn everyday banking work into reviewable AI-assisted outputs."*
- Lead-magnet: AI Opportunity Mapper (leadership scoring tool — score tasks by impact, feasibility, risk, readiness, time saved → recommended training path).

Founder/CMO decision; engineering scope after the call.

## PROPOSED PHASING

This plan does **not** adopt the review's 30-day cadence verbatim. The user should sign off on phasing before any of it ships.

**Phase 0 (today, 2026-05-25, this commit):**
- Document the audit + critique in this plan.
- Strip prototype-board framing from the operator canvas captures so they read explicitly as operator-only review surfaces, not learner UI (`scripts/aibi_canvas.py` + `scripts/aibi_module_bundles.py` retitled).

**Phase 1 (proposed, needs user approval):**
- Extract `LessonStepShell` from M02Experience as the canonical Guided Lesson Shell.
- Migrate the other M0–M3 free lessons onto it (the existing Lesson Shell Migration plan, now with a concrete target).
- Take a typography-restraint pass across the migrated lessons.

**Phase 2 (proposed, needs user approval + product call):**
- Define the Workbench Pack artifact-type in `addie.lessons.takeaway_artifact_type`.
- Build the Paid Workbench Shell.
- Replace the M4 "AI Work Profile" save with a Workbench Pack save.
- Decide M5 direction (re-scope or keep).

**Phase 3 (proposed):**
- Generalize `DataDisciplineCardArtifact` into a typed Artifact Review Shell with variants for each artifact type.

## NOT IN SCOPE FOR THIS PLAN

- The review's GTM, pricing, AI Opportunity Mapper, and enterprise buyer deck recommendations (founder/CMO work, not engineering).
- The 11-phase / 30-day cadence from the review's task list (treat that as a wish list — phasing should match this team's actual cadence).
- Tagline / "Builders" decision (founder call; see `CLAUDE.md` tagline history).

## DECISIONS NEEDED FROM THE USER

1. **Adopt the Guided Lesson Shell extraction + migration as Phase 1?** (Yes / No / Defer.)
2. **Adopt the Workbench Pack as the M4 takeaway artifact type, replacing "AI Work Profile" as primary?** (Yes / No / Modify.)
3. **M5 direction:** keep "From idea to prototype" OR re-scope to Reusable Briefs / Teaching AI Your Style / Repeatable Workflows / First Workbench Pack? (User picks.)
4. **Tagline:** keep "Turning Bankers into Builders" OR reposition per the review? (Founder call.)

Until those four answers land, no further M0-style redesigns. The current direction is solid; the next step has to be a structural product decision, not another module-by-module polish pass.
