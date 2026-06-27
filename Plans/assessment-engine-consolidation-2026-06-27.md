---
title: Assessment engine consolidation (Phase 2)
status: proposed
created: 2026-06-27
supersedes-premise: "collapse assessment v2/v3/v4 into 1"
owner-tasks: tasks/assessment-engine-consolidation.md
---

# Assessment engine consolidation — Phase 2

## TL;DR — the original premise was wrong, and that's the headline

The repo-cleanup audit framed the assessment versions as "4 redundant copies to
collapse into 1." Investigation (2026-06-27) proved they are **not versions of one
assessment** — they are **three distinct, live assessment products** (plus the v1
legacy, already deleted in Phase 1):

| Code | Product | Taken via | Dimensions | Questions |
|------|---------|-----------|------------|-----------|
| **v2** | Foundation **course post-assessment** (proficiency check after the course) | `courses/foundation/program/post-assessment/*`, `api/courses/save-post-assessment` | 8 (`current-ai-usage`, `experimentation-culture`, …) | — |
| **v3** | **Free readiness** assessment (the public funnel entry) | `assessment/_lib/useAssessmentV3`, `/assessment` | 12 (`strategic-value`, `approved-tool-path`, …) | 12 |
| **v4** | **In-depth + team** diagnostic ($99 / team) | `assessment/in-depth/_lib/useAssessmentV4`, `api/assessment/in-depth/submit` | 8 (`ai-access-architecture`, `model-risk-validation`, …) | 48 |

The taxonomies are completely disjoint. The storage layer (`src/lib/supabase/user-profiles.ts`)
is already version-aware and has explicit v3↔v4 transition logic — i.e., multiple live versions
are a designed product concept, not accidental drift.

**Conclusion: there is NO "4 → 1" consolidation to do.** Merging the scoring/taxonomies
would break three separate product experiences and is explicitly out of scope. The genuine
redundancy (v1, dead per-version satellites, dead components) was already removed in Phase 1
(`chore/repo-cleanup-consolidation`, merged to local main `5eb6cbfb`, ~19k LOC).

## The ONE real opportunity (optional DRY, not a product change)

Each product re-declares the same **version-agnostic machinery**. That is the only thing worth
de-duplicating, and only if we want to — it is polish, not a correctness fix:

- Identical structural types: `AssessmentOption`, `AssessmentQuestion` (same shape in v2/v3/v4 `types.ts`).
- The generic scoring shape: `getTier*(total)`, `getDimensionScores(...)`, `DimensionScore`
  (same algorithm, different thresholds/labels per product).
- Question-selection/rotation: `selectQuestions` / `selectAllQuestions` (same logic).
- PDF/result rendering helpers that are taxonomy-parametric.

### Target structure
```
content/assessments/
  _core/                 <- NEW: shared engine, taxonomy-agnostic
    types.ts             (AssessmentOption, AssessmentQuestion, DimensionScore, Tier shape)
    scoring.ts           (generic getDimensionScores, tier-from-thresholds helper, rotation)
    pdf.ts               (taxonomy-parametric PDF helpers)
  v2/ v3/ v4/            <- KEEP: each = its own Dimension taxonomy + questions + thresholds,
                            importing _core. NO behavior change.
```
Each product stays a distinct module; it just stops re-declaring the engine.

## Plan (incremental, reversible, behavior-frozen)

> Work on a worktree branch (`chore/assessment-core`), never on `main`. tsc + build + vitest after every step.

- **Step 0 — Golden tests first (non-negotiable).** Before touching anything, add parity tests:
  fixed answer vectors → exact (score, tier, dimension breakdown) for each of v2/v3/v4. These
  must pass IDENTICALLY before and after every later step. This is the safety net.
- **Step 1 — Extract `_core/types.ts`.** Define the shared structural interfaces once; re-export
  them from each version's `types.ts` (back-compat) so the ~60 consumers don't move yet. Verify.
- **Step 2 — Extract `_core/scoring.ts`.** Move the generic `getDimensionScores` + a
  `tierFromThresholds(total, thresholds)` helper into core. Rewrite v2/v3/v4 `scoring.ts` to call
  core with their own thresholds, keeping `getTierV2/V3` + the v4 helpers as thin wrappers so
  public signatures are unchanged. Golden tests must stay green.
- **Step 3 — Extract `_core/rotation.ts` + PDF helpers** the same way.
- **Step 4 — Optional tidy:** once consumers are stable, migrate them to import from `_core`
  directly and drop the back-compat re-exports. Run knip to confirm no new dead exports.
- **Step 5 — Verify end-to-end:** tsc 0 errors, `next build`, full vitest, golden tests, and
  **mobile QA of all three flows** (free 12q, in-depth 48q, course post-assessment) per the
  "Assessment First — no regressions without mobile testing" rule. Confirm scores/tiers/reports
  byte-identical to pre-refactor.

## Do NOT
- Do **not** merge the three taxonomies or normalize their dimensions — they measure different
  things for different products.
- Do **not** change question ids/order/weights (would require a `readiness_answers` data migration).
- Do **not** delete v2 — it is the live course post-assessment, not legacy.

## Acceptance criteria
- A single `content/assessments/_core/` consumed by all three products.
- v2/v3/v4 reduced to taxonomy + questions + thresholds (no duplicated engine code).
- Golden parity tests prove zero scoring/tier/report changes.
- tsc/build/vitest green; knip shows no new dead; mobile QA signed off.

## Effort / recommendation
Medium (1–2 focused sessions). **Recommendation: this is optional.** Phase 1 already removed the
real waste. Do Phase 2 only if the duplicated engine code is actively causing maintenance pain;
otherwise the three products are correct as-is and this can wait. Naming nit worth doing cheaply:
the `v2/v3/v4` directory names imply "versions" — renaming to `course-post`, `free-readiness`,
`in-depth` would remove the confusion that produced this whole misread (but it touches ~70 import
paths, so bundle it with Step 4 if pursued).
