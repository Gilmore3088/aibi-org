---
title: Free assessment re-base onto the canonical 8-dimension framework
status: proposed — needs owner sign-off on the three decisions in §3
created: 2026-08-10
implements: DECISIONS.md §Assessments items 1–4
related: Plans/assessment-engine-consolidation-2026-06-27.md
---

# Free assessment re-base — "same map, two resolutions," implemented

## 1. Goal

DECISIONS.md locks the product shape: one readiness framework, two products.
The free assessment keeps its **12 questions in ~3 minutes** but scores the
**same 8 canonical dimensions** as the paid In-Depth diagnostic, normalizes to
the **same 0–100 scale**, and reports the **same maturity-band ladder**, so a
free result is a true low-resolution preview of the paid one.

None of that is implemented yet. Today:

| | Free (v3) — current | Paid (v4) | Free — target |
|---|---|---|---|
| Questions | 12 (1 per dimension) | 48 (6 per dimension) | 12 (unchanged — non-negotiable) |
| Dimensions | 12 bespoke (`strategic-value`, `approved-tool-path`, …) | 8 canonical | same 8 canonical, some with 2 questions |
| Scale | raw 12–48 | normalized 0–100 | normalized 0–100, same formula shape |
| Ladder | 4 tiers (`starting-point` → `ready-to-scale`) | 5 bands (`unstructured` → `advanced`) | same 5 bands as v4 |

The 8 canonical dimensions (v4 ids ↔ DECISIONS names):

| v4 id | DECISIONS name |
|---|---|
| `ai-access-architecture` | Approved AI Access |
| `model-risk-validation` | Model Oversight |
| `compliance-explainability` | Compliance Clarity |
| `data-security-guardrails` | Data Safety |
| `workflow-orchestration` | Workflow Fit |
| `bounded-autonomy-human-review` | Human Control |
| `vendor-risk-interoperability` | Vendor Control |
| `governance-roles-human-capital` | People & Governance |

## 2. Why this is more than a scoring change

1. **MailerLite is keyed on the 4 old tiers.** `src/lib/mailerlite/sequences.ts`
   assigns a per-tier group (`TIER_TO_GROUP_ENV`) that triggers one of 4 tier
   automations, and syncs a `tier_label` field. Moving to 5 bands changes the
   trigger taxonomy, the group env vars, the automation set, and the email
   copy that references tier names. The 12 nurture emails were written for the
   4-tier world.
2. **Storage is version-aware.** `src/lib/supabase/user-profiles.ts` has
   explicit v3↔v4 transition logic and persists `readiness_version`. The
   re-based free assessment should ship as a **new version id (v5)**, not a
   mutation of v3 — historical v3 rows stay interpretable, and the transition
   logic gets a v5↔v4 case instead of rewrites.
3. **Downstream surfaces key on the 12 bespoke dimensions**: results page,
   personalization (`v3/personalization.ts`), starter artifacts
   (`v3/starter-artifacts.ts`, per DECISIONS §7 terminology), asset bands,
   roles, and the result email. All need re-keying to the 8 canonical ids.
4. **The free→paid preview is the point.** After re-base, the free result page
   can show the same band ladder and dimension spine the paid report uses —
   that rendering work is part of this project, not a follow-up.

## 3. Decisions the owner must make before build (gate)

**D1 — Band ladder in the nurture funnel.** The product ladder becomes the 5
v4 bands. The nurture funnel today has 4 automations. Options:

- **(a) Rebuild nurture as 5 band automations.** Cleanest; requires new
  MailerLite groups + automations + email copy review. More dashboard work.
- **(b) Interim mapping 5→4:** keep the 4 automations, map `unstructured` +
  `emerging` → the "Starting Point" track (or similar) until new copy exists.
  Ships sooner; the emails' tier names won't literally match the report band.

Recommendation: **(b) to ship, (a) as a fast follow** — but note the current
4 automations are not yet live (bodies still unpasted per
`docs/launch-finalization.md`), so if nurture go-live hasn't happened by build
time, (a) costs little extra and avoids the mismatch entirely.

**D2 — The 12→8 question mapping.** 12 questions over 8 dimensions means 4
dimensions get 2 questions. Draft proposal from the existing v3 question set
(v3 dimension → canonical dimension):

| Canonical dimension | v3 questions that map onto it | Count |
|---|---|---|
| Approved AI Access | `approved-tool-path` | 1 |
| Model Oversight | `prompting-skill`* | 1 |
| Compliance Clarity | `documentation` | 1 |
| Data Safety | `data-safety-reflexes`, `customer-impact-awareness` | 2 |
| Workflow Fit | `workflow-readiness`, `role-fit` | 2 |
| Human Control | `human-review` | 1 |
| Vendor Control | `vendor-awareness` | 1 |
| People & Governance | `training-culture`, `leadership-visibility`, `strategic-value`* | 3 |

\* Weakest fits — `prompting-skill` is individual capability, not model
oversight, and People & Governance at 3 questions leaves Model Oversight
thin. Expect to **rewrite 2–3 questions** rather than force the mapping; the
owner should approve the final 12-question set and mapping. (The free voice
stays individual per DECISIONS §3 — questions test the person's reflexes
within each institutional dimension.)

**D3 — Free band thresholds.** With 12 questions the raw range is 12–48,
normalized `round((raw − 12) / 36 × 100)`. Reuse v4's `MATURITY_BANDS`
min/max cut points unchanged (0–39 / 40–59 / …) so a band means the same
thing numerically in both products. Owner confirms the band *meaning* copy
reads correctly for the free/individual voice or approves per-product
`meaning` text with shared ids/labels/cuts.

## 4. Implementation plan (behavior-frozen until the switch)

Discipline mirrors `Plans/assessment-engine-consolidation-2026-06-27.md`:
golden tests first, tsc + build + vitest after every step, mobile QA before
merge. Build on a feature branch; single reviewable PR.

- **Step 0 — Freeze current behavior.** Golden tests for v3 (fixed answer
  vectors → exact score/tier/dimension output) so the legacy path provably
  doesn't drift while v5 is built alongside it.
- **Step 1 — `content/assessments/v5/`.** New module: canonical `Dimension`
  type imported from a shared home (see Step 6), 12 approved questions tagged
  with canonical dimensions, `normalize()` for 12–48→0–100, band lookup
  against the shared `MATURITY_BANDS`. Golden tests from D2/D3 fixtures.
- **Step 2 — Storage.** `user-profiles.ts`: accept `version: 'v5'`, add
  v5↔v4 transition handling, keep v3 rows readable. No data migration —
  historical rows keep their version id.
- **Step 3 — Surfaces.** Re-key results page, personalization, starter
  artifacts, asset bands, roles, result email, and PDF to the 8 canonical
  dimensions + 5 bands. Free result page gains the paid-preview framing
  (same band ladder, "the In-Depth report deepens these same 8 dimensions").
  No peer/percentile anything (DECISIONS §5).
- **Step 4 — MailerLite.** Per D1: update `TIER_TO_GROUP_ENV` (and
  `tier_label` values) to band ids, add the group env vars, and stage the
  dashboard automation work in `docs/launch-finalization.md`. Test sends
  before enabling, as already documented there.
- **Step 5 — Switch `/assessment`** from `useAssessmentV3` to the v5 hook.
  v3 code is retired in the same PR only if nothing else imports it —
  otherwise deletion is a fast-follow after the funnel is verified live.
- **Step 6 — Optional but cheap now:** land the `_core/` engine extraction
  from the consolidation plan *for the pieces v5 needs anyway* (shared types,
  band-from-thresholds helper). v5 is a new consumer, so building it against
  `_core` avoids re-declaring the engine a fourth time. Full v2/v4 migration
  to `_core` stays optional/deferred.
- **Step 7 — Verification.** Golden tests green; tsc/build/vitest; mobile QA
  of the free flow end-to-end (12q → result → email → group assignment) plus
  regression pass on In-Depth and course post-assessment; funnel smoke via
  `funnel_scorecard`.

## 5. Explicit non-goals

- **12 questions stays 12** (DECISIONS §2). No question-count changes.
- **v2 (course post-assessment) untouched** — different product, own taxonomy.
- **v4 scoring/questions unchanged** — free re-bases onto v4's frame, never
  the reverse.
- **No merged funnels** — free and paid remain separate products (§3).
- **No peer/percentile/cohort comparison anywhere** (§5).

## 6. Effort

Roughly 2–3 focused sessions of build + one owner review cycle on D1–D3, plus
the MailerLite dashboard pass (owner/operator, ~1 hr including test sends).
The riskiest part is not code — it's D2 question rewrites, which change what
the free score *means*. Get those approved first; everything downstream is
mechanical.
