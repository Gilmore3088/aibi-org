# Free Assessment PDF — Redesign Spec

**Status:** Draft for review · awaiting approval before plan-writing
**Date:** 2026-05-25
**Owner:** James Gilmore
**Replaces:** The v2-era dimension-keyed results UI + print pipeline in `src/app/assessment/_components/ResultsViewV2.tsx` and `src/app/assessment/results/print/[id]/page.tsx` + its 13 print components

---

## 1. Purpose

The free assessment is the primary top-of-funnel conversion mechanism. Today its output (an on-screen results page + downloadable PDF) is hardcoded to v2's 8 readiness dimensions. As of 2026-05-25, the assessment questions have shipped as v3 (12 flat topics, one question per topic, 12–48 score range, four tier bands). The output now needs to match.

This document specifies the redesign of that output as **a substantive personalized PDF that doubles as a real piece of editorial content**, designed to earn email capture and route the reader toward the $99 In-Depth Assessment.

## 2. Audience and reading context

- **Reader:** Community bank or credit union CEO, COO, CIO, or Chief Risk Officer. Non-technical to semi-technical. Median age ~55. Time-poor.
- **First read:** On the screen, immediately after submitting email. They will scan, not read.
- **Second read:** Printed or PDF, before or after a board / management meeting. They will read carefully.
- **Forwarded read:** Sent to the CIO or compliance lead. The forwarder writes "what do you make of this?"

Implication: The PDF must work as both a 90-second scan and a 30-minute read. The web version must capture interest in the first 10 seconds and animate enough to feel current. The print version must look like editorial content the reader is proud to circulate.

## 3. Product positioning (locked)

| Tier | Product | Role in this PDF |
|------|---------|------------------|
| Free | Assessment + this PDF | Substantive, full framework education, abbreviated action plan. Earns trust. |
| $99 | In-Depth Assessment | The "rich output" upgrade. 48-question matrix, full 90-day plan with named owners, board pack, vendor TCO, KYC/AML readiness. **Primary CTA.** |
| Coming Soon | AiBI-Foundation course ($295) | Self-paced training. **Mentioned, marked Coming Soon, not actively sold yet.** |
| Always-available | Executive Briefing (Calendly) | Secondary CTA. "30 min, complimentary, answers questions the PDF could not." |

## 4. Document architecture

The PDF is a **two-act report**:

```
ACT I — Diagnosis (~9 pages)
  ├─ Page 1   Cover (institutional document cover, tier as hero)
  ├─ Page 2   Signature Insight (numbered pattern observations)
  ├─ Page 3   Critical Gap 1/3 (weakest topic)
  ├─ Page 4   Critical Gap 2/3
  ├─ Page 5   Critical Gap 3/3
  ├─ Page 6   12-Topic Readout (ledger table, weakest-first)
  ├─ Page 7   Abbreviated Action Plan (one tight page)
  ├─ Page 8   What Comes Next (CTA — editorial layout)
  └─ Page 9   Act II divider

ACT II — Framework Appendix (~15 pages)
  ├─ Page 10  Act II opener + 2026 context
  ├─ Pages 11–12  Phase 1 — Foundational Literacy
  ├─ Pages 13–14  Phase 2 — Bounded Autonomy
  ├─ Pages 15–16  Phase 3 — Infrastructure Modernization
  ├─ Pages 17–18  Phase 4 — Multi-Agent Orchestration
  ├─ Pages 19–20  Phase 5 — Autonomous Enterprise
  ├─ Page 21  Reference — Hype vs. Reality (KYC/AML readiness table)
  ├─ Page 22  Reference — Global Regulatory Baselines
  ├─ Page 23  Reference — Baseline Controls for 2026
  └─ Page 24  Back cover (Institute lockup + briefing CTA)
```

**Build vs. Buy and the 48-question maturity matrix** are explicitly **excluded** from the free PDF. They are the depth the $99 In-Depth buyer gets exclusively.

## 5. Act I — page-by-page detail

### Page 1 · Cover

**Direction locked:** Institutional document cover.

- Top row: Institute lockup (left, two-line `THE AI BANKING / INSTITUTE` in Geist 700 caps, line 2 in `--ledger-soft`); version mono kicker top-right (`2026 · v3`).
- Center: doc label kicker `AI READINESS ASSESSMENT`, then tier name in Newsreader 56pt as the hero (`Building Momentum`), 3px gold tier-band beneath, institution name below in body sans.
- Bottom: 3-cell mono meta strip — `Score 36 / 48 · Tier 3 of 4 · Generated 14 May 2026`.
- Background: ledger-paper. No imagery on the cover proper (imagery placement option C — cover photo lives on the inside front facing page, see §7).

### Page 2 · Signature Insight

**Direction locked:** Pattern detection — three numbered observations.

- Kicker: `Signature Insight · Page 2`.
- Page title: Newsreader, ~22pt: "What your answers show."
- Subtitle: "Three patterns that recur across your twelve dimensions."
- Three numbered observations (`01`, `02`, `03`) in mono gold, each with a bold sans headline + 2 sentences of context. Rule-separated.
- **Type:** body bumped to 14pt for screen and print legibility (per feedback).
- **Generation:** observations are templated against the answer pattern (see §10).

### Pages 3–5 · Critical Gap 1/3, 2/3, 3/3

**Direction locked:** Two-column "you vs. target" as primary, maturity-ladder strip folded in at footer.

Each page:
- Top bar: 3px ink rule, topic name in Newsreader 26pt (left), "Critical Gap · 1 of 3 · Topic 05" in mono kicker (right).
- Two-column grid:
  - **Left:** `WHERE YOU ARE` label, score in oxblood mono 30pt, your answer in Newsreader 13pt.
  - **Right:** `WHERE TO GET TO` label, target score in navy mono 30pt, level-4 answer text.
- Framework band: full-width parch panel with navy left-edge rule. Carries the relevant 2026 framework excerpt (~3 sentences), with source kicker at the bottom.
- Footer strip: the 4-step maturity climb SVG (the one we kept from option A) — line + 4 nodes, oxblood "YOU" marker on level 1, navy "TARGET" marker on level 4, dashed gold climb path between them.
- Page footer: Institute kicker + page number `04 / 24`.

### Page 6 · 12-Topic Readout

**Direction locked:** Ledger table, sorted weakest-first.

- Kicker `Section II · Topic Readout`, ink rule.
- Title: "The twelve dimensions, in rank order."
- Subtitle: total score (e.g., "Sorted weakest first. Each dimension scored on a 1–4 maturity ladder. Score total: 24 / 48.").
- Table columns: `#`, `Dimension` (Newsreader 12pt), `Level` (4-dot strip), `Score` (mono right-aligned), `Status` (tag: Critical gap / Developing / Strength).
- Score and dot colors: oxblood for 1–2 with gap tag, ink for 3, navy for 4 with strength tag.

**Card variant is not used here.** Cards reserved for the prompt/tool library elsewhere in the product.

### Page 7 · Abbreviated Action Plan

**Direction locked:** One tight page, three stacked sub-sections.

- Kicker `Section III · Abbreviated Action Plan`, ink rule.
- Title: "What to do, in the next 90 days."
- Sub-section 1: **Three moves** — 3-card row. Each card: gold mono `Move 01`, Newsreader 13pt move title, body sans 11pt explanation. Each move tied to one of the three critical gaps.
- Sub-section 2: **30 / 60 / 90 timeline** — left-column mono date band (`Days 1–30`), right-column body. Dotted-rule separators.
- Sub-section 3: **Three decisions to make** — numbered list. Each item: bold decision name + the two options in muted text.

The three sub-sections (Top 3 moves · 30/60/90 · Decisions) all live on one page — no spread.

### Page 8 · What Comes Next (CTA)

**Direction default (B, editorial):**

- Kicker `Section IV · What comes next`, ink rule.
- Title: Newsreader 32pt — "You've seen the diagnosis."
- Drop-cap lede in Newsreader 19pt: short paragraph framing the choice.
- Gold-edged parch `Why` band — one paragraph explaining what In-Depth adds (48 questions, full 90-day plan, vendor TCO, KYC/AML readiness, board pack).
- Three numbered next-steps (rule-separated):
  - `01` **The In-Depth Assessment** — primary (parch fill, ink type) — "$99 · One-time · Instant access" → `Start →`
  - `02` **Executive Briefing** — "Complimentary · 30 minutes" → `Book →`
  - `03` **AiBI-Foundation course** with `Coming Soon` pill — muted — "$295 · Available later in 2026" → `Notify me →`

### Page 9 · Act II divider

Half-page parch field. Mono kicker `ACT II`, Newsreader 36pt — "The framework, in five phases." One paragraph in Newsreader 14pt explaining why the rest follows. Page number 09 / 24.

## 6. Act II — framework appendix

**Direction default (B, re-edited tighter and re-cut):**

The source content is the "Unified AI Transformation Guide" the user provided 2026-05-25. It is re-edited for tighter prose (target ~30% reduction) and re-cut into the structure below. Pages 11–20 are phase pages (2 each); pages 21–23 are reference pages.

Each phase = a 2-page spread:
- **Left page (opener):** kicker `Phase N · Title`, full-width photo banner (see §7), one-line caption, Newsreader 36pt phase headline, one-paragraph lede.
- **Right page (content):** "Individual Milestone" + "Enterprise Assessment" + any phase-specific tables (KYC, A2A protocol, etc.), typeset in the Ledger system.

Phases:
1. **Foundational Literacy** — agentic systems, the 12-question triage (referencing the reader's actual scores)
2. **Bounded Autonomy** — risk classification, HITL, the regulatory alignment list
3. **Infrastructure Modernization** — SLMs, data sovereignty, token-ready core
4. **Multi-Agent Orchestration** — A2A protocol, neural-compliance frameworks, the A2A advantage table
5. **Autonomous Enterprise** — human amplifier, maturity dimensions (note: the 48-question matrix from the source is **dropped**, replaced by a 5-dimension summary)

Reference pages:
- **Hype vs. Reality** (KYC/AML readiness table from the source, typeset)
- **Global Regulatory Baselines** (4-region table from the source)
- **Baseline Controls for 2026** (the four controls: Logging, Named Ownership, Confidence Thresholds, Fallback Rules)

## 7. Visual system

### Typography

- **Newsreader:** display, ledes, headlines, body in editorial passages (drop caps, pullquotes)
- **Geist:** UI labels, sans body in dense content, buttons, kickers when not mono
- **JetBrains Mono:** all kickers, metadata, version pills, score numbers, captions

No italics anywhere (per `base.css` global rule). Emphasis via color + weight.

Size scale (PDF print, 8.5" × 11"):
- Page titles: 26–32pt Newsreader 500
- Section titles: 18–22pt Newsreader 500
- Body editorial: 13–14pt Newsreader regular, 1.55 line-height
- Body sans: 12–13pt Geist
- Kicker mono: 9–11pt, 0.18em tracking, uppercase
- Score numbers: 24–36pt JetBrains Mono 500, tabular-nums

### Color (Ledger tokens only)

| Token | Role |
|---|---|
| `--ledger-bg` `#ECE9DF` | Page field (rarely used in PDF) |
| `--ledger-paper` `#F4F1E7` | Page background |
| `--ledger-parch` `#E4E0D2` | Recessed bands (framework excerpts, "Why" bands) |
| `--ledger-ink` `#0E1B2D` | Primary text |
| `--ledger-ink-2` `#1F2A3F` | Secondary text |
| `--ledger-muted` `#4F5C6E` | Subdued meta, photo captions |
| `--ledger-soft` `#8C95A8` | Wordmark line 2; faint text |
| `--ledger-accent` `#7C5814` | Gold — emphasis, primary CTA, kickers on dark surfaces |
| `--ledger-accent-2` `#1E3A5F` | Navy — target scores, framework left-edge |
| `--ledger-weak` `#8E3B2A` | Oxblood — critical gap scores, "you are at level 1" markers |
| `--ledger-rule` `#D5D1C2` | Hairline divider |

### Spacing

- Page margins: 6–7% of page width on all sides
- Internal spacing: 16pt minor / 26pt major / 40pt section breaks

### Motion (web-results page only)

- Page transitions: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- Number count-ups: 800ms on first reveal
- SVG line-draws: 1.2–1.6s on critical visuals (tier dial / phase journey / maturity ladder)
- No skeleton shimmers, no parallax, no scroll-jacking, no spring physics
- All motion respects `prefers-reduced-motion`

## 8. Imagery

### Sourcing (locked)

**AI-generated** (FLUX-Pro / Midjourney v6 or successor), shot to brief, post-treated in Photoshop / equivalent to the Ledger palette.

### Treatment spec

- Light desaturation only (~75% saturation retained — preserve photographic feel)
- Single, recognizable subject per image
- Square or 4:3 crops, contained on page
- No moody vignettes, no dark-corner gradients, no overlaid headlines (when used as banner)
- Optional fine grain overlay at <8% opacity for editorial texture
- Captions in mono mute, uppercase kicker line + one Newsreader title line: e.g., `PLATE III · SOVEREIGNTY` / "A bank facade, morning light."

### Placement (default C — high-leverage moments only)

| Page | Image | Size | Notes |
|---|---|---|---|
| Page 1 (Cover) | None on cover itself | — | Cover stays text-driven for institutional feel |
| Page 2 (Signature Insight) | Optional small inset top-right | 88×88 | Skip on MVP |
| Pages 3–5 (Critical Gaps) | None | — | Stay text-driven |
| Page 6 (Readout) | None | — | Data page |
| Page 7 (Action Plan) | None | — | Dense page |
| Page 8 (CTA) | None | — | Editorial-text page |
| Page 9 (Act II divider) | One photo, half-page banner | 8.5"×4" | Sets visual tone for Act II |
| Phase openers (×5) | One photo each | 8.5"×6" | Banner, contained, light treatment |
| Page 24 (Back cover) | Optional half-page institute lockup imagery | — | Skip on MVP |

**Total: 6 photos in the MVP** (1 Act II divider + 5 phase openers). Adding inset photos on Signature Insight + back cover bumps to 7–8 if you want it later.

### Subject library (briefs for image generation)

To be drafted as part of implementation. Examples:
- "A vault interior, low light, brass and oak detail, morning."
- "A bank facade, three-story limestone, morning sun, midwest small town."
- "A ledger book open on a desk, fountain pen, calm."
- "Architectural model of a building, top-down view, soft shadows."

Subjects favor architecture, materials, light, paper — not people, not screens, not abstract tech imagery. Keeps it editorial and timeless.

## 9. Data wiring

The PDF generator pulls from:

| Field | Source | Used on page |
|---|---|---|
| `score` (12–48) | `assessment_responses.score` | Cover, all score references |
| `tierId` | derived via `getTierV3(score)` | Cover headline, tier interpretation |
| `tier.label` `headline` `summary` | `v3/scoring.ts` `tiers` | Cover, Tier section |
| `answers[]` (length 12) | `assessment_responses.answers` | All gap detail pages |
| `topicScores: Record<Dimension, 1..4>` | derived from answers + question dimensions | Topic readout, gap selection |
| `email` `institutionName` `firstName` | capture-email | Cover meta strip |
| `generatedAt` | `assessment_responses.created_at` | Cover, page footers |
| Three weakest topics | sorted ascending, first 3 | Critical Gap pages 3–5 |
| Pattern observations | generated from answer pattern (see §10) | Signature Insight |
| Tier-conditional copy variants | tier-keyed string maps | Tier interpretation, action plan, CTA framing |

Storage shape (`user_profiles` or `assessment_responses`):
- `readiness_score: integer` (12–48)
- `readiness_max_score: integer` (48 for v3; In-Depth still 192)
- `readiness_tier_id: text` (`starting-point` | `early-stage` | `building-momentum` | `ready-to-scale`)
- `readiness_topic_breakdown: jsonb` — `Record<v3.Dimension, { score: number; maxScore: number }>`
- **No** `readiness_dimension_breakdown` (v2-keyed) for v3 rows — old column can stay for v2 In-Depth rows; new v3 rows use the new column or store under `readiness_topic_breakdown` to keep types distinct.

## 10. Generative copy (the personalization layer)

Some copy is templated, some is fully generated, some is tier-keyed.

| Surface | Approach |
|---|---|
| Tier headline/summary | Static per tier (4 variants, in `tiers` already) |
| Signature insight (3 observations) | Templated against answer pattern. Rule-based v1: detect high-low score spread, detect policy-without-enforcement pattern, detect compliance mid-band. LLM-assisted v2: send the answer vector to Claude with a brief; cache by answer vector hash. |
| Critical gap framework excerpt | Static map: topic id → curated 2–3 sentence excerpt from the 2026 transformation guide |
| Three moves | Static map: topic id → 3-sentence move recommendation. Selected by which 3 topics are weakest. |
| 30/60/90 sequencing | Tier-keyed default + critical-gap overlay |
| Three decisions | Tier-keyed default |
| CTA framing paragraph | Static |

LLM-assisted generation is **optional** for v1. The PDF works without it; LLM enrichment is a polish layer that can ship after.

## 11. Web results page vs. print PDF

Two surfaces, same content, different treatment:

| Aspect | Web results page | Print PDF |
|---|---|---|
| URL | `/results/{profileId}` | `/results/{profileId}/print` or downloadable |
| Layout | Same page sequence, scrollable | Same page sequence, paginated |
| Motion | SVG line-draws, count-ups, scroll-triggered fade-ins | Static |
| Imagery | Same images, may have subtle parallax (≤4px) | Static |
| Footer | Sticky CTA bar (In-Depth $99) | Page-by-page footer |
| Print-friendliness | `@media print` rules render print PDF inline | N/A |

The web page is what loads immediately after email capture. The PDF is downloadable from the web page and emailed via Resend.

## 12. Out of scope (explicitly excluded)

- The In-Depth ($99) PDF — separate spec
- The Foundation course post-assessment recommendations — separate spec; remains on v2 dimensions until v3 expansion is designed
- v2 → v3 data migration for existing `user_profiles` rows — they keep v2 fields; new rows use v3 fields; the print page detects which to render
- Image generation, captioning, and treatment workflow — separate plan
- Email body design (Resend transactional template) — separate spec
- A/B testing of CTA variants — separate plan
- Plausible / Vercel analytics events for the new surfaces — included in plan, not specified here in detail

## 13. Defaults baked into this spec (flag if wrong)

- CTA layout: **Editorial (B)** — drop-cap + numbered next-steps. Quieter, on-brand. If you prefer the louder primary-card (A), say so and I'll swap.
- Act 2 approach: **Re-edited tighter (B)** — your content, ~30% prose reduction, re-cut into 5 phases + 3 reference sections. If you'd rather reproduce verbatim, say so.
- Imagery count: **6 photos (C)** — Act II divider + 5 phase openers. If you want photos on every non-data page (A) or only phase openers (B), say so.

## 14. Open questions

- **Wordmark on cover:** Two-line lockup as in the design system (`THE AI BANKING / INSTITUTE`) or a single-line treatment for the PDF context?
- **Page numbering:** mono `04 / 24` style as shown, or simpler `4`?
- **Plate captions:** the "Plate I · Runtime" phrasing was a mockup choice; do plate-style captions feel right or too precious?
- **Per-topic image:** should each critical-gap page get its own small inset image (bumps to 9+ photos), or stay text-only as defaulted?
- **Email PDF delivery:** does the email contain the PDF as attachment, or just a link back to the web results page?

## 15. Implementation impact (informational, not part of this spec)

This spec replaces:
- `src/app/assessment/_components/ResultsViewV2.tsx` — full rewrite as `ResultsViewV3.tsx`
- `src/app/assessment/_components/ResultsDashboard.tsx` — full rewrite
- `src/app/assessment/results/print/[id]/page.tsx` — full rewrite to v3 schema
- All 13 print components under `src/app/assessment/results/print/_components/` — replaced with new components keyed to the page sequence in §4
- `src/app/api/capture-email/route.ts` — extended to persist v3 topic breakdown
- `src/lib/supabase/user-profiles.ts` — extended with v3 columns

In-Depth ($99) flow remains on v2 components — unaffected.

## 16. Approval

When the user signs off, the next step is to invoke the `writing-plans` skill to produce an implementation plan. No code work begins until the plan is approved.

---

*End of spec.*
