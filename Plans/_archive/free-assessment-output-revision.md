---
status: shipped
created: 2026-05-17
shipped: 2026-05-17
owner-tasks: tasks/_done/free-assessment-output-revision.md
shipped-branch: feature/free-assessment-output-revision
shipped-commits:
  - 006ebd1  # T1 CTA rank
  - 01ba011  # T2 copy density –20%
  - 76d2734  # T3 Practice Picture page
  - 38f8464  # T4 Maturity Ladder
  - 853bbe5  # T5 Signature Insight
  - aeb3024  # T6 dashboard + 2×2 + chart + PDF cover
  - aafef31  # T6 type size bump
  - 40448c9  # PDF generation fix (macOS platform gate)
---

# Free AI Readiness Assessment — Output Revision

## Why

The current results page (`src/app/assessment/_components/ResultsViewV2.tsx`)
and 10-page print PDF (`src/app/assessment/results/print/[id]/page.tsx` +
the eleven components in `print/_components/`) are credible but
**under-converting**. They read as consulting memos: dense paragraphs,
abstract language, and a single tier-keyed CTA that splits attention
across three product lines.

The free assessment is supposed to do five things:

1. Make the user feel seen.
2. Give them one useful insight immediately.
3. Show that the Institute understands banking-specific AI adoption.
4. Create curiosity for the full PDF.
5. Position **AiBI-Foundation ($295)** as the natural next step.

It currently does (1)–(4) well and (5) inconsistently.

## What changes

This is a five-track revision. Each track is shippable on its own.

### Track 1 — CTA hierarchy reshuffle

Today the closing CTA is **single-card and per-tier**: Starting Point and
Early Stage push the $99 In-Depth Assessment as primary; Building
Momentum pushes the Executive Briefing; Ready to Scale pushes Leadership
Advisory. Foundation is invisible in the closing CTA, even though it is
the product most likely to move the largest cohort of users.

New behavior:

- **Tiers 1–3** (Starting Point, Early Stage, Building Momentum):
  Foundation $295 is the primary CTA; In-Depth $99 is the secondary
  CTA; Executive Briefing is tertiary.
- **Tier 4** (Ready to Scale): Advisory is the primary CTA (their
  team has already built capability); Foundation is secondary as a
  next-hire path.

This change applies to **the on-screen results view** *and* the PDF. The
on-screen view shows one primary CTA card with two text links beneath
it (secondary, tertiary). The PDF dedicates a single page to the trio
with clear visual ranking.

> **Why this differs from the original PRD:** the PRD called for
> Foundation as the universal primary CTA. Tier-4 institutions have
> already built internal capability — selling them Foundation
> (foundational training) instead of Advisory (fractional CAIO work)
> is a tier mismatch. The original tier-keyed logic is correct on
> tier 4; the bug is that tiers 1–3 should all converge on Foundation.

### Track 2 — Copy revisions (no structure change)

- Reduce paragraph density by ~20% across `personalization.ts`
  (`PERSONAS`, `BIG_INSIGHT`, `GAP_CONTENT`, `FINANCIAL_IMPLICATIONS`).
- Rewrite tier-specific personas in the voice from the PRD:
  professional, plainspoken, encouraging, lightly urgent. Replace
  abstract language ("Governance exists but is uneven") with
  operationally specific language ("Some teams are experimenting,
  but staff are making inconsistent decisions about what tools are
  safe and what data can be used").
- Banned-phrase sweep: ensure no `FFIEC-aware`, no unsourced stats.

### Track 3 — New "What This Looks Like in Practice" page

A recognition page that maps the diagnosis onto four roles (Operations,
Compliance/Risk, Managers, Executives). One short paragraph per role.
Lives near the front of both surfaces:

- **On screen:** new section between "Diagnosis" and "The big insight."
- **PDF:** new component, inserted between `ExecSummary` and
  `LensedImplications`.

This page does the heaviest emotional work in the report. Plainspoken,
not academic. The user's exact words: "They understand us."

### Track 4 — Maturity ladder with "you are here"

A six-rung visual ladder showing where the institution sits today and
what the next stages look like:

```
AI Curiosity → Controlled Experimentation → Building Momentum
  → Operational Adoption → Governed Scale → Institutional Advantage
                    ^
                    you are here
```

The four scoring tiers map onto rungs 1, 2, 3, and 5 of the ladder
(rungs 4 and 6 are aspirational, not measured). The "you are here"
marker pins to the user's current tier. Lives on the on-screen view
(after Strengths and Gaps) and on its own PDF page.

### Track 5 — Signature insight callout

A single, memorable line near the top of both surfaces:

> Most institutions do not fail because employees refuse to use AI.
> They struggle because experimentation spreads faster than
> operational standards.

Renders as a distinct visual treatment (italic display serif on
parchment, with a hairline rule) — small in area, high in presence.
Sits between "Diagnosis" and "What This Looks Like in Practice."

## Out of scope

- New assessment questions (the 12-question pool stays).
- New tier names (Starting Point / Early Stage / Building Momentum /
  Ready to Scale stay; ladder rung names are display-only).
- Stripe / checkout wiring (Foundation $295 already routes through
  the existing checkout flow).
- The In-Depth ($99) results page — that has its own redesign track.

## Success criteria

- The on-screen free results view has Foundation $295 as the primary
  CTA for tiers 1–3 and Advisory primary for tier 4.
- The print PDF runs at 10–11 pages (current is 10), with the new
  "What This Looks Like in Practice" page and the new "Maturity
  Ladder" page replacing nothing (the deleted dense paragraphs are
  the offset).
- A community-bank reader scanning the first three pages reaches
  the "They understand us" feeling without reading any paragraph
  twice.
- Copy passes a banned-phrase sweep: no `FFIEC-aware`, no
  `AiBI-Practitioner`, no unsourced statistics.
- `npm run build` passes with zero TypeScript errors.

## Sequencing

Five tracks. Each one is independently committable and reviewable.
Tasks live in `tasks/free-assessment-output-revision.md`.

| # | Track | Risk | Surfaces |
|---|-------|------|----------|
| 1 | CTA hierarchy reshuffle | Low | screen + PDF |
| 2 | Copy revisions | Low | content/ only |
| 3 | "What This Looks Like" page | Med | screen + PDF |
| 4 | Maturity ladder | Med | screen + PDF |
| 5 | Signature insight callout | Low | screen + PDF |
