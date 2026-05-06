# Decision-Grade Assessment Results — Design Spec

**Date:** 2026-05-06
**Status:** Brainstormed; awaiting user review before writing implementation plans
**Supersedes / extends:** `2026-05-04-assessment-results-four-surfaces.md` (and the three sub-specs from that sprint). This work upgrades the *content and shape* of the four surfaces shipped in that sprint; it does not re-architect the surfaces themselves.

## The Gap We Are Closing

The current report reads as **smart strategic commentary**. We need it to read as **decision-grade operational intelligence** — the kind of document a banker can take to their CEO, board, or examiner and defend.

Today's report diagnoses. The next version must operationalize, defend, and show a path. It must feel like an executive operating briefing, not a PDF summary of a quiz.

The tagline anchors everything: **Turning Bankers into Builders.** The report should make a banker feel they are on a path *to becoming the builder*, not on a path to "institutionalized AI" (an end-state we explicitly retire — see Bucket A.1).

## Locked Decisions From Brainstorm (2026-05-06)

1. **Ship all four buckets (A → B → C → D) in waves.** No partial commitment. Each bucket gets its own implementation plan and PR; shipped in order so later buckets can build on earlier ones without guessing.
2. **Maturity model: keep the 4-tier system** (`Starting Point`, `Early Stage`, `Building Momentum`, `Ready to Scale`). Drop "Strategic Differentiation" — destination is *builders*, not platform supremacy. Enrich each tier with maturity-stage substance (see A.1).
3. **All four surfaces in scope:** free 12Q on-screen results, paid 48Q In-Depth, downloadable PDF, owner-bound `/results/[id]` permalink. No surface gets a watered-down version.
4. **No peer benchmarking in this work.** Honors the 2026-04-15 park (N≥30 per segment threshold). Revisit when data exists. The report must instead earn its authority through framework, not comparison.
5. **Branding stays "AI Readiness Assessment."** Public name unchanged. "Operating maturity" is supporting language inside the report — section labels, framing copy, internal architecture — not a public rebrand.

## Surfaces In Scope

| Surface | Render | Where the upgrade lands |
|---------|--------|--------------------------|
| `/assessment` results screen (free 12Q) | CSR | All four buckets, pared to fit on-screen scrollable layout |
| `/assessment/in-depth` results (paid 48Q) | CSR | All four buckets at full depth — this is the surface that justifies $99–199 |
| PDF (`/assessment/results/print/[id]`) | SSR | Print-fidelity version of the in-depth report |
| `/results/[id]` (owner-bound permalink) | SSR | Same content as in-depth on-screen results, with shareability framing |

The free 12Q result is a **trailer**. The in-depth report is the **feature film**. The free result must give enough operational value to be respectable on its own, and must make the upgrade feel necessary (Bucket D).

## Non-Goals

- Not rebuilding the four delivery surfaces themselves (they shipped in PRs #40–#43)
- Not adding peer benchmarking (parked)
- Not adding new dimensions beyond the existing 8
- Not changing the question pool
- Not changing tier thresholds (12–48 scale, equal-spaced 9-point bands per 2026-05-05 decision)
- Not building a separate "Banking AI Operating Maturity Assessment" product

---

# Bucket A — Diagnostic Framework

The foundation everything else sits on. Ships first.

## A.1 — Four-Tier Maturity Architecture

Keep tier names. Add maturity-stage substance to each. Each tier becomes a stage in a visible journey, not just a score band.

| Tier | Stage Substance | What's true at this stage | What blocks progress to next stage |
|------|-----------------|----------------------------|-------------------------------------|
| **Starting Point** | Individual Experimentation | A few people use AI privately. No shared knowledge. No policy. | No leadership signal; no permission to use AI on bank work; no place to share what works. |
| **Early Stage** | Team Adoption | Pockets of AI use within teams. Informal best practices emerging. Still unsanctioned. | No governance frame; no measurement; no executive sponsor. |
| **Building Momentum** | Program Building | AI use is sanctioned. There's a policy, an inventory, named owners. Real workflows exist but are fragile. | No defensible measurement; security/compliance retrofit is incomplete; institutional knowledge lives in individuals. |
| **Ready to Scale** | Operational Integration | AI is part of how work gets done across multiple departments. Governance is operating, not theoretical. Measurement is producing budget-defensible numbers. | The next move is the *builder* move: building bank-specific tools, not just adopting vendor tools. |

**Visible journey artifact:** every report shows the tier ladder with "You are HERE" and the named blocker(s) holding the institution at the current stage.

## A.2 — Score Authority Layer

The current scoring (`2/4`, `8/12`) feels arbitrary because it lacks framework context. Add:

- **Scale meaning:** state what the 12–48 scale represents (overall capability index across 8 dimensions, 4 questions per dimension currently for in-depth; pro-rated for free 12Q).
- **Threshold logic:** explain why the bands are 9 points wide (equal-spaced; not arbitrary).
- **Per-dimension thresholds:** for each of the 8 dimensions, name the dimension-specific maturity meaning at each tier (e.g., Governance at "Building Momentum" means *policy exists, inventory exists, named owner exists*).
- **What the score does and does not claim:** explicit framing that this is a self-reported readiness index, not an audit. This earns trust by *not* overclaiming.

## A.3 — Cross-Cutting Governance & Risk Layer

Today: governance is one of 8 categories.
Required: governance is **also** a layer overlaid on every recommendation.

For each recommendation in Bucket B, surface:
- **Risk level** (Low / Moderate / Elevated)
- **Governance complexity** (None / Policy update / Formal review)
- **Data sensitivity** (Public / Internal / Confidential / NPI)
- **Human review requirement** (Optional / Recommended / Required)
- **Examiner defensibility** (one-line answer to "what would you tell an examiner")

This is rendered as a compact governance strip beneath each recommendation block. It is the single feature that most distinguishes this from a generic AI assessment.

## A.4 — Banking-Role Segmentation

Replace generic terms ("operations teams", "front-line staff") with named banking functions. Recommendation copy and example workflows reference real seats:

- Deposit operations
- Loan operations / underwriting support
- BSA/AML support
- Treasury management
- Branch leadership
- Compliance review
- Marketing
- Collections
- Card operations

The starter-artifact library (`content/assessments/v2/starter-artifacts.ts`) gets a banking-role variant overlay so the same dimension-keyed artifact reads as written-for-this-seat.

---

# Bucket B — Executive Ammunition

Ships second. Depends on Bucket A's tier substance and governance layer.

## B.1 — Laddered Recommendations (Replace Single "First Move")

Every recommendation block becomes a three-rung ladder:

| Rung | Horizon | Owner | Example |
|------|---------|-------|---------|
| Immediate Move | This week | Individual | "Run a 30-minute prompt-sharing lunch with three colleagues." |
| 30-Day Move | This month | Team | "Stand up a shared workflow capture doc. Capture five repeated prompts with named owners." |
| Executive Move | This quarter | Leadership | "Bring AI usage inventory + governance gap to next ALCO/board meeting; request named AI sponsor." |

The current "First Move" copy is preserved as the seed for the Immediate rung; the other two rungs are new.

## B.2 — Executive Defense Layer (Defensible Metrics)

A new section titled **"Metrics Leadership Can Defend"** with banking-relevant operational metrics, each with a stated formula and a named target/baseline framing.

Examples:
- Hours saved per employee per month (formula + how to baseline)
- Document drafting time reduction (before/after measurement protocol)
- Policy summarization cycle time
- Meeting note processing time
- Email drafting acceleration
- Audit prep time reduction
- Workflow cycle-time compression

Each metric: formula, baseline collection method, suggested measurement cadence, what the number lets leadership *claim* (the defensibility line).

## B.3 — Six-Stage Adoption Journey Arc

The report is structured around the explicit arc:

**Current State → Risk State → Opportunity State → Implementation Path → Measurement System → Leadership Defense**

These are the section headers (or section grouping) of the in-depth report. Each section has a clear purpose:

1. **Current State** — score, tier, dimension breakdown (existing content)
2. **Risk State** — what's exposed today (governance, data, examiner exposure) — new
3. **Opportunity State** — what's possible at the next tier (specific, banking-rolewise) — new
4. **Implementation Path** — the laddered recommendations (B.1)
5. **Measurement System** — the defensible metrics (B.2)
6. **Leadership Defense** — one-page executive summary the user can paste into a board memo — new

## B.4 — Measurable 7-Day Plan

The existing 7-day plan stays but becomes measurable. Day 5 ("measure time saved") gets:

- A baseline worksheet (5 task types × current minutes-per-task)
- An estimated annualized savings calculator (uses existing ROI calc shape)
- A leadership summary template (one paragraph + the calculated number)

User produces *evidence* by day 7. That evidence is the artifact they paste into a leadership Slack/email.

---

# Bucket C — Visualization & Information Density

Ships third. Depends on Bucket A (dimensions, tiers) being locked.

## C.1 — Eight-Dimension Radar

A radar chart across the 8 dimensions for the in-depth report (and PDF). Calls out:

- **Strongest dimension** (the accelerator)
- **Weakest dimension** (the limiter)
- **Limiting bottleneck** (the dimension that, if raised one tier, lifts the overall tier)

Free 12Q result gets a simplified version (it only has partial dimension coverage — pro-rated, with explicit "based on 12 questions" framing).

## C.2 — Tier Progression Visual

Horizontal four-stage track. "You are HERE" marker. Each stage shows: short name, named blocker to next stage, estimated typical timeline (directional, no false precision). Renders consistently across screen + PDF.

## C.3 — Governance Risk Strip

Compact horizontal strip rendered beneath each recommendation block. Shows the five governance attributes from A.3 as labeled chips. Color-disciplined: cobalt for governance signals (per Pillar B color rule).

## C.4 — Information Density Pattern

Adopt a consistent layout primitive — the **operating briefing card** — used for every recommendation, metric, and risk callout. Each card:

- One-line claim (display)
- Two- to three-line elaboration (body)
- Governance strip (chips)
- Action / measurement footer

This becomes the visual grammar of the report. Replaces the looser stacked-section layout in the current PDF.

---

# Bucket D — Positioning & Funnel

Ships fourth. Depends on Buckets A–C existing because the upsell language must reference real differences.

## D.1 — Free → Paid Upgrade Path (Explicit)

The free 12Q report ends with an explicit framing block:

> This report identifies your **directional readiness** across 8 dimensions, sampled with 12 questions.
>
> The In-Depth Assessment diagnoses operational blockers, governance gaps, workflow maturity, and institutional scaling risks across all 8 dimensions with 48 questions — and produces the Leadership Defense one-pager you can paste directly into a board memo.

CTA copy + visual treatment makes the upgrade feel necessary, not optional.

## D.2 — Supporting Language Layer

Insert "operating maturity" framing copy throughout — as section labels, intro paragraphs, footers — without renaming the product. Examples:

- Section title: *Your AI Operating Maturity*
- Intro line: *A maturity diagnostic for community banks and credit unions.*
- Footer: *Part of the AI Readiness Assessment, The AI Banking Institute.*

Brand name unchanged: **AI Readiness Assessment**. Operating maturity is the *frame*, not the *name*.

## D.3 — In-Depth Report Cover/Title Treatment

The in-depth PDF gets a cover page that reads as a consulting deliverable:

- Institution name (if captured)
- Report title (e.g., *AI Readiness Report — Community Bank Edition*)
- Date
- Tier badge
- AI Banking Institute seal (existing)

This is the surface that makes a banker say *"I want to email this to my CEO."*

---

# Implementation Waves

Each wave = one implementation plan + one PR + one review cycle.

| Wave | Bucket | Why this order |
|------|--------|----------------|
| 1 | A | Foundation. Tiers, scoring authority, governance layer, banking taxonomy. Nothing else can be designed without these locked. |
| 2 | B | Content + structure. The journey arc (B.3) restructures the report; laddered recs (B.1), defensible metrics (B.2), and measurable 7-day plan (B.4) populate the new shape. |
| 3 | C | Visual layer. Radar, progression visual, governance strip, density pattern. Builds on A's data + B's content blocks. |
| 4 | D | Funnel + positioning. Upgrade copy, supporting language, cover page. Naturally last because it sells what A–C built. |

Waves can pipeline: while Wave 2 implementation is in PR review, Wave 3 brainstorming can begin. Worktree isolation per wave.

# Files Likely Touched

(Indicative, not exhaustive — to be detailed in each wave's plan.)

- `content/assessments/v2/scoring.ts` — tier substance, threshold framing
- `content/assessments/v2/personalization.ts` — laddered recs, governance metadata, banking-role variants
- `content/assessments/v2/starter-artifacts.ts` — banking-role overlays
- `content/assessments/v2/pdf-content.ts` — journey arc structure, defensible metrics, leadership defense one-pager
- `src/app/assessment/results/print/_components/*` — restructure to journey arc; new components for governance strip, radar, progression visual, operating-briefing-card
- `src/app/assessment/page.tsx` (and in-depth equivalent) — on-screen results restructure
- `src/app/results/[id]/page.tsx` — same on-screen content
- New: `content/assessments/v2/maturity.ts` — tier substance, blockers, banking-role taxonomy as a single source of truth consumed by all surfaces

# Open Questions (Resolve Before Wave 1 Plan)

1. **Estimated timelines on the progression visual (C.2)** — directional ranges or omit entirely? Risk: false precision. Recommendation: omit numeric timelines; use qualitative "next move" framing instead.
2. **Banking-role overlay scope (A.4)** — overlay on top of existing artifacts (lighter lift) or rewrite each starter artifact per role (heavier, more authentic)? Recommendation: overlay for Wave 1; revisit per-role rewrites if user feedback warrants in Wave 2 retrospective.
3. **Free 12Q radar (C.1)** — show all 8 dimensions with partial-coverage shading, or only show the dimensions actually sampled? Recommendation: all 8 with explicit shading, since hiding dimensions reduces the upgrade signal.

These resolve as inline decisions during Wave 1 planning, not in this spec.
