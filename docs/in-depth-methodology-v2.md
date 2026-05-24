---
title: In-Depth Readiness Assessment — Methodology
version: v2.0
audit-fix: A17 — foundation-comprehensive-audit-2026-05-24
last-revised: 2026-05-24
owner: The AI Banking Institute
status: published
---

# In-Depth Readiness Assessment — Methodology

> A community bank or credit union pays $99 for the In-Depth Assessment.
> The deliverable is a personalised diagnostic — composite score, eight
> dimension scores, regulatory crosswalk, ninety-day action register,
> ideas + prompts pack. The audit
> [`foundation-comprehensive-audit-2026-05-24`](./reviews/foundation-comprehensive-audit-2026-05-24.html)
> named the absence of a methodology document — pillar assignments
> undefended, scoring bands unjustified, no version stamp — as the gap
> between "board-readable" and the marketing claim of "exam-defensible."
> This document closes that gap.

## 1. What the assessment measures

The instrument scores **eight dimensions** of AI readiness across the
community-banking operating context. Each dimension is six questions in
the In-Depth flow (one question per dimension in the free 12-Q flow).

| # | Dimension                | Pillar     | What it scores                                                        |
|---|--------------------------|------------|-----------------------------------------------------------------------|
| 1 | Current AI Usage         | Stack      | Where AI shows up in the work today, by department + tool             |
| 2 | Experimentation Culture  | Strategy   | Whether trying new things is sanctioned, observed, and reported       |
| 3 | AI Literacy Level        | Talent     | Shared vocabulary, mental models, and member-facing fluency           |
| 4 | Quick Win Potential      | Strategy   | Workflows that pay back quickly — visibility, owner, measurement      |
| 5 | Leadership Buy-In        | Strategy   | Senior sponsorship, calendar time, board-level reporting              |
| 6 | Security Posture         | Risk       | Written policy, vendor controls, model & tool inventory, MNPI hygiene |
| 7 | Training Infrastructure  | Talent     | Mechanism to bring fluency to staff at scale + accountability         |
| 8 | Builder Potential        | Talent     | Named people who can take a workflow from idea to shipped artifact    |

### 1.1 Pillar assignment rationale

The four pillars (Strategy · Risk · Stack · Talent) are derived from the
Cornerstone Advisors *AI Playbook for Banks and Credit Unions (2025)*
operating model. Each dimension belongs to exactly one pillar; the
mapping is enforced in `src/app/assessment/in-depth/results/[id]/_lib/derive.ts`
(`PILLAR_BY_DIMENSION`).

- **Strategy** carries the demand-side dimensions — what the institution
  decides to want from AI, who sponsors it, where wins are visible.
- **Risk** is single-dimension (Security Posture) because risk is the
  dimension a regulator will ask about first. Concentrating it here
  keeps the regulatory crosswalk's floor-driven status calibration
  (audit A7) cleanly mapped.
- **Stack** is single-dimension (Current AI Usage) because the
  inventory of tools-in-use is the supply-side reading; everything else
  in the Stack column is operational consequence, scored under Talent
  or Risk.
- **Talent** carries the three dimensions where outcome depends on
  people, not procurement: literacy, training, and builder bench.

## 2. Scoring rubric

### 2.1 Raw score and normalised composite

Each of the 48 questions is scored 1–4. Raw score range is **48–192**.
The composite is normalised to **percent of max** with the single
canonical function `composeScore(dimensionBreakdown)` in
`content/assessments/v2/scoring.ts` (audit A1, 2026-05-24 fix).

> ⚠ **Single source of truth:** the in-depth submit path
> (`/api/assessment/in-depth/submit`) and the Briefing display
> (`InDepthBriefingView.tsx`) both call `composeScore`. Storage and
> display cannot drift — see the equivalence tests in
> `content/assessments/v2/scoring.test.ts`.

### 2.2 Phase rubric — 50 / 75 / 90 percent of max

| Phase         | Composite pct-of-max | Tier id              | Editorial alias  |
|---------------|----------------------|----------------------|------------------|
| Curious       | < 50%                | `starting-point`     | Starting Point   |
| Coordinated   | ≥ 50% and < 75%      | `early-stage`        | Early Stage      |
| Programmatic  | ≥ 75% and < 90%      | `building-momentum`  | Building Momentum|
| Native        | ≥ 90%                | `ready-to-scale`     | Ready to Scale   |

Per-dimension status uses the same 50 / 75 / 90 thresholds, applied to
each dimension's pct-of-max (audit A1 follow-up). A dimension at 65% is
"Coordinated" both as a dimension reading and as a composite reading.

### 2.3 Threshold rationale

The 50 / 75 / 90 thresholds are deliberately **asymmetric** to reflect
the asymmetric difficulty of progress:

- **The < 50% band is wide** because early movement is noisy: a single
  coordinated change can lift a low-scoring institution several points
  across multiple dimensions.
- **The 75% threshold tightens** because the distance from "experiments
  are happening" to "the program is coordinated" is earned in smaller,
  harder increments — written policy, named owner, repeatable measure.
- **The 90% threshold tightens further** because "Native" is rare in
  community banking today. The bar is intentionally higher than peer
  benchmarks; we will widen the band only when the cohort dataset
  supports the calibration honestly.

The thresholds are calibrated against the maturity ladder evidence in
the FDIC Quarterly Banking Profile (Q4 2024 efficiency ratios, community
median ~65%) and the Jack Henry *Getting Started in AI (2025)* report
(66% of banks discussing AI budget, 55% with no governance, 48% lacking
business-impact clarity — all via Gartner Peer Community).

## 3. Regulatory crosswalk — floor-driven posture

Chapter 04 of the Briefing maps the user's posture against six
reference frameworks. Each row is bound to one or more v2 dimensions;
the row's status is derived from the **floor** of those dimensions'
percentages (not the average). Rationale: examiners do not grade on the
mean; one weak control is the finding.

| Reference                       | Bound dimensions                                  |
|---------------------------------|---------------------------------------------------|
| SR 11-7 (Model Risk Management) | Security Posture · Current AI Usage               |
| FFIEC IT Handbook               | Security Posture · Leadership Buy-In              |
| NCUA 24-CU-XX                   | Leadership Buy-In · Security Posture              |
| FinCEN AML Guidance             | Experimentation Culture · Security Posture        |
| CFPB Fair Lending               | Security Posture · Builder Potential              |
| GLBA Safeguards                 | Security Posture · Training Infrastructure        |

Status thresholds on the floor pct: < 50% → **Exam risk** · 50–74% →
**Coordinated** · 75–89% → **Defensible** · ≥ 90% → **Top decile**.
The implementation lives at
`src/app/assessment/in-depth/results/[id]/_components/InDepthBriefingView.tsx::personalizeRegulatoryRow`
(audit A7).

## 4. What the score claims, and what it does not

### 4.1 What it claims

- A directional reading of where the institution sits on a recognisable
  maturity ladder.
- A named limiting capability — the dimension that, raised one tier,
  most lifts the overall posture.
- A regulator-aligned posture map — exam-readable, not exam-substitute.
- An action register keyed to the lowest-scoring dimensions, with named
  pillars and effort estimates.

### 4.2 What it does NOT claim

- **It is not a model-risk audit.** The instrument does not substitute
  for an SR 11-7 review, an Interagency TPRM assessment, or any
  internal control review.
- **It is not a peer benchmark.** The community-bank cohort dataset
  does not yet support calibrated peer ranking; benchmarks will appear
  when the data supports them honestly.
- **It is not a regulatory finding.** The score is a self-reported
  diagnostic. It is not produced by, sponsored by, or filed with any
  examining authority.
- **It is not predictive of revenue or efficiency impact.** Readiness
  reflects capability and posture, not outcomes. Outcome measurement is
  the work of pilots — Module 5 and beyond.

## 5. Reliability and review schedule

- **Per-row check.** Migration `00062_reconcile_readiness_tier.sql`
  enforces a hard invariant: for any row with a stored dimension
  breakdown, the stored `readiness_tier_id` must equal the tier derived
  by re-running `composeScore` on that breakdown. Drift raises a
  deploy-blocking exception.
- **Unit-level check.** `content/assessments/v2/scoring.test.ts` proves
  equivalence between `getTierInDepth`, `composeScore`, and
  `tierFromPct` at every boundary score (47/48, 95/96, 143/144,
  172/173). The 89.58% pct rounding mistake is the test we wrote to
  guard against.
- **Re-read cadence.** The Briefing surfaces a 90-day re-read date.
  Institutions are encouraged to re-run the instrument at that point;
  the delta between snapshots is the brief for leadership, not the
  absolute score.
- **Methodology revision.** This document is versioned (`v2.0` as of
  2026-05-24). Future rubric changes — band widening once peer
  benchmarks are honest, additional dimensions, weighting — will land
  with a new methodology version, a migration that backfills affected
  rows, and a regenerated equivalence test set.

## 6. Reference documents

| Document                                              | Publisher                                                 | Date         |
|-------------------------------------------------------|-----------------------------------------------------------|--------------|
| AIEOG AI Lexicon                                      | US Treasury / FBIIC / FSSCC                               | Feb 2026     |
| AI Playbook for Banks and Credit Unions               | Cornerstone Advisors                                      | 2025         |
| Getting Started in AI                                 | Jack Henry & Associates (via Gartner Peer Community)      | 2025         |
| FDIC Quarterly Banking Profile                        | FDIC                                                      | Q4 2024      |
| GAO-25-107197 — AI in financial services              | US Government Accountability Office                       | May 2025     |
| SR 11-7 Guidance on Model Risk Management             | Federal Reserve / OCC                                     | 2011 (active)|
| Interagency Guidance on Third-Party Risk Management   | FRB / OCC / FDIC                                          | 2023         |
| FFIEC IT Handbook — Management, Architecture, Ops     | FFIEC                                                     | 2021         |

## 7. Filing reference

Every In-Depth report carries a filing reference (e.g. `AIBI-3F8B92A7`)
derived from the `user_profiles.id`. Quote it on any advisory call.
The filing is the audit trail; this methodology document is the
calibration trail. Together they constitute the assessment's defensible
authority.

---

*Methodology v2.0 — published 2026-05-24 under audit-fix A17.
Comments to `hello@aibankinginstitute.com`.*
