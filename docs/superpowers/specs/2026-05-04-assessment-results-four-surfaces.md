# Assessment Results — Four-Surface Program (Umbrella)

**Date:** 2026-05-04
**Status:** Draft (awaiting user review). Umbrella program — Spec 1 detailed below; Specs 2/3/4 have sibling stub files to be filled in via dedicated brainstorms.
**Owner:** James Gilmore
**Build commitment:** All four surfaces. Sequential spec → plan → ship per surface. No mega-spec.
**Predecessors:**
- `docs/superpowers/specs/2026-05-04-dynamic-assessment-results.md` — original PRD
- 10 micro-polish skill passes on `src/app/assessment/_components/ResultsViewV2.tsx` (audit → arrange → distill → normalize → harden → clarify → delight → adapt → quieter → onboard)
**Sibling specs (to be brainstormed in order):**
- `docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md` — PDF download (advocacy)
- `docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md` — Email follow-up sequence (conversion)
- `docs/superpowers/specs/2026-05-04-assessment-results-spec-4-return-url.md` — Return-to URL (working artifact + future peer benchmarks)

---

## Strategic Frame (Umbrella for Specs 1–4)

The assessment results experience currently tries to do four jobs on one HTML page:

| Job | What it means |
|---|---|
| Advocacy | A tool the assessment-taker hands to their CEO / risk committee / board |
| Conversion | A sales asset that drives Executive Briefing booking or AiBI Foundations enrollment |
| Authority | A credibility play — proof The AI Banking Institute knows community banking |
| Utility | A working artifact the user actually uses for the next 30 days |

Doing four jobs on one surface produces a brief that is "thin in places" — the audit's term. The strategic move is **one surface per job**, sharing the same underlying data:

| Surface | Job | Spec |
|---|---|---|
| On-screen briefing (this spec) | Utility — first read + this week | **Spec 1** (now) |
| Downloadable PDF | Advocacy — board-ready, citation-dense | Spec 2 |
| Email follow-up sequence | Conversion — timed nudges, tier-specific | Spec 3 |
| Return-to URL | Working artifact — refreshable, shareable, foundation for peer benchmarks | Spec 4 |

Specs 2–4 are **separate spec → plan → ship cycles**. This document is Spec 1 only.

---

## Spec 1 Job Statement

> The on-screen briefing helps a banker who just submitted their email understand their AI readiness situation in 5 minutes and know what to do this week. It is read once, used as a working artifact for the next 7 days, and abandoned (the PDF and email sequence carry the long tail).

The brief is no longer the artifact users print, save, share, or come back to. Spec 1's only job is the first read.

## What This Spec Does NOT Do

- **Generate a PDF.** No `@react-pdf` or Puppeteer. The "Save your results as a PDF" affordance and `PrintButton` are removed. Spec 2 builds real PDF generation.
- **Send any follow-up email.** No ConvertKit drip wiring, no transactional follow-up. The on-screen brief stops promising "we'll email you tomorrow." Spec 3 builds the sequence.
- **Provide a return-to URL.** No tokens, no `/results/<id>` route, no save-this-link affordance. Spec 4 builds persistence + return.
- **Add peer benchmarking.** Per `CLAUDE.md` Decisions Log (2026-04-15) peer benchmarks remain blocked on N≥30 per segment. Out of scope until Phase 1.5+.
- **Forward-reference the other surfaces.** No "we're emailing you" placeholder, no "PDF coming soon" badge. The brief ships clean — when each subsequent spec ships, that spec adds its own affordance to the brief.
- **Change the assessment instrument** (questions, scoring, dimensions). Out of scope.
- **Change the email gate flow** (capture, validation, rate-limiting). Out of scope.
- **Reshape any other route** (`/coming-soon`, `/for-institutions`, `/courses/*`). Out of scope.

---

## Final Structure (After Cuts and Merges)

The brief remains a single-page diagnose-first editorial scroll. Order unchanged.

| # | Section | Status | Notes |
|---|---|---|---|
| 0 | Briefing header | **Keep** | Eyebrow + date + headline + orient line ("A 5-minute read · …"). The orient-line copy must stop referencing "Save or print at the bottom" since print affordance is removed (see Acceptance Criteria). |
| 1 | Diagnosis (tier + score + persona) | **Keep** | ScoreRing + persona one-liner. Already distilled. |
| 2 | Big Insight | **Keep** | Tier-keyed editorial card on dark background. |
| 2b/3 | Implications | **Merged** | Keep Section 2b's lensed `dl` (operational / risk / cost). **Drop Section 3** entirely (the tier-keyed `insightBullets` list with the terra left rail). |
| 4 | Strengths and gaps | **Keep** | Critical / Developing / Strong groupings. |
| 5 | Your first move (fastest ROI) | **Keep** | The centerpiece value moment. Quieter pass already softened it. |
| 6 | Starter prompt | **Keep** | Copy + Try in ChatGPT. The collapsed printable-artifact `<details>` stays — it's already progressive disclosure, no visual cost. |
| 7 | 7-day plan | **Keep** | Numbered timeline. The actionable conclusion. |
| 8 | ~~Future Vision~~ | **Cut** | "A Practitioner-Ready institution" bullets. Aspirational, not actionable this week. Belongs in Spec 2 (PDF) where advocacy framing earns its place. |
| 9 | ~~Next Steps trio~~ | **Cut** | Training / Strategic Planning / Governance cards. Replaced by **§9-new**. |
| 9-new | **Tier-keyed CTA card** | **NEW** | One card. Content varies by tier. See "Tier-keyed CTA mapping" below. |
| 10 | ~~Footer Close~~ | **Cut** | Generic brand close. Belongs on PDF cover or email signature. |
| Appendix | Full diagnostic | **Keep** | Collapsed `<details>` showing all 8 dimension bars. Unchanged. |
| Bottom | NewsletterCTA | **Keep** | Existing newsletter signup component. Unchanged. |
| Bottom | ~~PrintButton + "Save as PDF" copy~~ | **Cut** | Real PDF download replaces it (Spec 2). Until Spec 2 ships, the affordance is simply absent. |
| Bottom | ~~`.print-footer` block~~ | **Cut** | Print-only brand line (`<strong>The AI Banking Institute</strong>` + tier/email/score restate). No longer needed since the on-screen brief stops being the printable artifact. The print stylesheet itself in `globals.css` stays — it still serves users who print via browser, just less prominently. |

### Resulting on-screen length

Currently: ~770 lines (post-distill). Target after cuts: ~550 lines. Net change: roughly −150 lines of section copy/markup, +30 lines for the tier-keyed CTA card. User-perceived scroll length: roughly 30% shorter.

---

## Tier-keyed CTA Mapping (§9-new)

The four tier IDs live in `@content/assessments/v2/scoring`. The card content lives alongside in `@content/assessments/v2/personalization` as a new `TIER_CLOSING_CTA` constant.

| Tier (id) | Card eyebrow | Card headline | Card body | CTA label | CTA href |
|---|---|---|---|---|---|
| `starting-point` | Your next move | Get your team trained on AI fundamentals. | Skills come first. AiBI Foundations teaches working AI use to bankers in 12 short modules — your team can start this week. | Enroll your team in AiBI Foundations | `/courses/aibi-p` |
| `early-stage` | Your next move | Get your team trained on AI fundamentals. | You have momentum. Lock it in with AiBI Foundations — your bankers learn the same patterns repeatable across the institution. | Enroll your team in AiBI Foundations | `/courses/aibi-p` |
| `building-momentum` | Your next move | Walk through these results with us. | You're ready for a roadmap conversation, not a course. An Executive Briefing translates this report into a phased plan with leadership at the table. | Request an Executive Briefing | `/for-institutions/advisory` |
| `ready-to-scale` | Your next move | Talk to us about Leadership Advisory. | You don't need foundations — you need ongoing AI judgment at the leadership level. Leadership Advisory is fractional CAIO work for institutions with internal momentum. | Request a conversation | `/for-institutions/advisory` |

**Card visual treatment**: same card chrome as the current Section 9 "Training" primary card — `border-2 border-terra` (the only `border-2` left on the page after quieter), `rounded-[3px]`, `bg-linen`, terra-on-linen CTA button. One card. Centered or full-width inside the `max-w-3xl` column.

**No Governance card.** The Governance content (AI Use Policy, SR 11-7 alignment, AIEOG Lexicon) moves to Spec 2's PDF where it earns its space in the appendix. On-screen, it would be a non-actionable third option — exactly what we cut.

---

## Acceptance Criteria

A merged PR closes Spec 1 if and only if:

1. **Cuts applied verbatim**: The following are removed from `ResultsViewV2.tsx`:
   - Section 8 (`FUTURE_VISION`-rendering block, including the `aria-labelledby="section-8-heading"` section element and its `SectionAnchor`)
   - Section 9 (the entire `<div className="grid gap-5 md:grid-cols-3">` containing the Training / Strategic Planning / Governance `<article>` elements)
   - Section 10 (the `FOOTER_CLOSE`-rendering `<section>`)
   - Section 3 (the `What this means / In practice:` section using `insightBullets` and `TIER_INSIGHTS`)
   - The `PrintButton` invocation and surrounding `<div className="mt-12 text-center">` block
   - The `<div className="print-footer">` block
2. **Imports cleaned**: `FUTURE_VISION`, `FOOTER_CLOSE`, `RECOMMENDED_PATH_INTRO`, `TIER_INSIGHTS` no longer imported from `@content/assessments/v2/personalization` if not used elsewhere. `PrintButton` import removed. `getStarterArtifact`, `StarterArtifactCard` stay (used by the kept §6 collapsed details).
3. **New tier-keyed CTA**: A new `TIER_CLOSING_CTA` constant ships in `content/assessments/v2/personalization.ts` matching the table above, typed as `Record<Tier['id'], { eyebrow: string; headline: string; body: string; ctaLabel: string; ctaHref: string }>`. A new `<section>` renders it after Section 7 (the 7-day plan). The CTA `<a>` carries `data-print-hide="true"` for users who do print via browser.
4. **Header orient-line copy updated**: The current `"A 5-minute read · Save or print at the bottom"` line drops the `· Save or print at the bottom` clause. New copy: `"A 5-minute read"`. Single mono-cap metadata line.
5. **No forward-mentions**: grep confirms no occurrences of `pdf`, `email you`, `we'll send`, `save this link`, or `bookmark` (case-insensitive) added to `ResultsViewV2.tsx` in this PR.
6. **Visual regressions absent**: The page renders without runtime errors; `npx tsc --noEmit` clean; `npm run build` clean (no orphaned imports or unused variables).
7. **Brand discipline preserved**: No new sage or cobalt usages introduced (per CLAUDE.md pillar discipline). No new `border-2` introduced beyond the tier-keyed CTA card.
8. **Print stylesheet correctness**: The corrected `body > header, body > footer` print-CSS scoping from the recent adapt pass remains intact (do not regress).
9. **Leftover personalization data**: The constants being cut (`FUTURE_VISION`, `FOOTER_CLOSE`, `RECOMMENDED_PATH_INTRO`, `TIER_INSIGHTS`) are **deleted** from `personalization.ts`, not left dangling. The Plan C-style versioning rules in CLAUDE.md don't apply here — this is content config, not LLM-facing prompt data.
10. **Mobile parity**: The new tier-keyed card renders cleanly at 375px viewport (iPhone SE) — no horizontal scroll, CTA touch target ≥44px tall.

---

## File Changes Summary

| File | Change |
|---|---|
| `src/app/assessment/_components/ResultsViewV2.tsx` | Remove §3, §8, §9 trio, §10, PrintButton block, print-footer block. Add §9-new tier-keyed card. Update orient-line copy. |
| `content/assessments/v2/personalization.ts` | Add `TIER_CLOSING_CTA`. Remove `FUTURE_VISION`, `FOOTER_CLOSE`, `RECOMMENDED_PATH_INTRO`, `TIER_INSIGHTS`. |
| `src/app/assessment/_components/PrintButton.tsx` | Delete file (no other consumers — verify with grep). |
| `src/app/assessment/_components/StarterArtifactCard.tsx` | Untouched. Used by §6's collapsed details which we keep. |
| `src/app/assessment/_components/StarterPrompt.tsx` | Untouched. |
| `src/app/assessment/_components/NewsletterCTA.tsx` | Untouched. |
| `src/app/assessment/_components/ScoreRing.tsx` | Untouched. |
| Other files | None. |

### Files explicitly NOT changing

- `src/app/assessment/page.tsx` — assessment flow logic untouched
- `src/lib/email-capture/rate-limit.ts` — rate-limit untouched
- `supabase/migrations/*` — no DB changes
- `src/middleware.ts` — no routing changes
- `src/app/globals.css` — print CSS scoping (already corrected) untouched

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Cutting §10 (Footer Close) leaves the brief ending on the new tier-keyed CTA which feels promotional. | The CTA card is editorial in tone (one quiet "Your next move" eyebrow), and the appendix below softens the close. |
| Removing PrintButton kills the only "save my results" affordance until Spec 2 ships. | Acceptable risk — Spec 2 is next in the pipeline. If Spec 2 slips beyond ~2 weeks, we add a temporary "Print this page" browser hint in a follow-up commit. |
| Cutting §3 removes tier-keyed behavioral pattern bullets that some users found grounding. | The lensed `dl` rows in the merged §2b cover similar territory at a higher level. If user testing reveals a gap, restore §3 in a follow-up — the data (`TIER_INSIGHTS`) is in git history. |
| Tier-keyed CTA may misroute Building Momentum users who would convert better to AiBI Foundations than to a Briefing. | Tracked as a Plausible custom event (`closing_cta_click` with `props: { tier, destination }`) — wired in this spec's plan. We can flip the mapping in a 5-line PR after 30 days of data. |

---

## Open Questions (Tracked for Follow-up Specs, Not Blockers)

- **Spec 2 (PDF)**: Server-rendered (Puppeteer / `@react-pdf/renderer`) or styled HTML print? — TBD in Spec 2 brainstorm.
- **Spec 3 (email)**: How many emails? Triggered by score/tier or by time? — TBD in Spec 3 brainstorm.
- **Spec 4 (return-URL)**: Anonymous token or full account auth? Reuse Supabase user_profiles? — TBD in Spec 4 brainstorm.
- **Future**: Once Spec 4 ships, peer benchmarking unlocks at N≥30 per segment per CLAUDE.md.

---

## What We Are Leaving Out (Single Source of Truth)

This section consolidates every item *not* shipping in Spec 1 so you can audit the omissions in one place. If something feels missing from the brief and isn't on this list, that's a spec gap — flag it.

### A. Content cut from the on-screen brief

| Item | Where it lives now | Where it goes (if anywhere) |
|---|---|---|
| Section 3 — "What this means in practice" tier-keyed bullets | `ResultsViewV2.tsx` lines using `insightBullets` + `TIER_INSIGHTS` | Deleted. Lensed `dl` rows in §2b cover similar territory at a higher level. Data preserved in git history. |
| Section 8 — "Future Vision" / "A Practitioner-Ready institution" bullets | `ResultsViewV2.tsx` `FUTURE_VISION`-rendering block | Moves to **Spec 2 (PDF)** appendix where advocacy framing earns its space. Removed from on-screen entirely. |
| Section 9 — Training / Strategic Planning / Governance trio | `ResultsViewV2.tsx` `<div className="grid gap-5 md:grid-cols-3">` | Replaced on-screen by single tier-keyed CTA. Full trio content (especially Governance / SR 11-7 / AIEOG) moves to **Spec 2 (PDF)** + **Spec 3 (email)**. |
| Section 10 — Footer Close (`FOOTER_CLOSE.headline` + `body`) | `ResultsViewV2.tsx` print-avoid-break section | Moves to **Spec 2 (PDF)** cover page or back cover. Possibly Spec 3 email signature. Removed from on-screen. |
| `PrintButton` component invocation + "Save your results as a PDF using your browser's print dialog" caption | Bottom of `ResultsViewV2.tsx` | Deleted. Replaced by real PDF download in **Spec 2**. |
| `PrintButton.tsx` source file | `src/app/assessment/_components/PrintButton.tsx` | Deleted (verify no other consumers via grep before deleting). |
| `<div className="print-footer">` block (brand line + tier/email/score restate, print-only) | Bottom of `ResultsViewV2.tsx` | Deleted. PDF (Spec 2) carries this in proper layout, not as a print-CSS afterthought. |
| Header orient-line clause "· Save or print at the bottom" | Briefing header | Trimmed — line becomes just "A 5-minute read". |

### B. Personalization data deleted (not orphaned)

These constants are removed from `content/assessments/v2/personalization.ts`. We are deleting them, not commenting them out, not leaving them dangling. They're recoverable from git if needed.

- `FUTURE_VISION` (5-bullet aspirational vision)
- `FOOTER_CLOSE` (`headline` + `body`)
- `RECOMMENDED_PATH_INTRO` (4 tier mistake intros — used only by §9 trio H2)
- `TIER_INSIGHTS` (4×4 tier behavioral bullets — used only by §3)

`TIER_CLOSING_CTA` is **added**.

`PERSONAS`, `BIG_INSIGHT`, `GAP_CONTENT`, `RECOMMENDATIONS`, `STARTER_PROMPTS`, `SEVEN_DAY_PLAN`, `FINANCIAL_IMPLICATIONS` are **kept**.

### C. Features/affordances explicitly NOT in this spec

| Feature | Why deferred | Which spec picks it up |
|---|---|---|
| PDF generation (server-rendered or styled HTML print) | Real artifact requires its own design — Puppeteer vs `@react-pdf/renderer`, page templates, citation-dense layout | **Spec 2** |
| Email follow-up sequence (drip / nudges / tier-specific) | Requires ConvertKit wiring, content authoring per tier, send-time logic, unsubscribe handling | **Spec 3** |
| Return-to URL (`/results/<token>`, persistence beyond session) | Requires schema (anonymous tokens vs full auth), refresh logic, share-link semantics | **Spec 4** |
| Peer benchmarking ("you scored higher than X% of $1B community banks") | Per `CLAUDE.md` Decisions Log 2026-04-15, blocked on N≥30 per segment | Phase 1.5+, post-Spec 4 |
| FDIC / NCUA institution enrichment (auto-detect institution size from name) | Out of scope for first read; better as part of Spec 4 return-experience | Phase 1.5+ |
| Shareable result URLs (with privacy controls) | Subset of Spec 4 | **Spec 4** |
| Forward-mentions of Specs 2/3/4 in the on-screen brief ("we'll email you", "save this link", "PDF coming soon") | Each spec adds its own affordance when it ships. No placeholder copy now. | When each respective spec ships |
| Changes to the assessment instrument itself (questions, scoring, dimensions, scoring breakpoints) | Out of scope — instrument is locked | N/A |
| Changes to the email gate / capture flow / rate-limiting | Out of scope — capture flow is locked | N/A |
| Changes to `/coming-soon`, `/for-institutions`, `/courses/*` routes | Out of scope — only `ResultsViewV2.tsx` and its content config change | N/A |

### D. Visual / structural choices considered and rejected

These came up during brainstorming and were rejected. Recording them so future-you doesn't relitigate.

- **Flipping order to "act-first, diagnose-below"**: rejected. Editorial diagnose-first arc preserved per user direction.
- **Tabs / two-panel split / aggressive accordion-by-default**: rejected. Single linear scroll preserved.
- **Keeping both §2b lensed `dl` AND §3 tier-keyed bullets**: rejected as redundant for a 5-minute read. Kept §2b only.
- **Single-tier CTA (just AiBI Foundations, or just Briefing)**: rejected. Tier-keyed mapping picked because audience differs meaningfully across tiers.
- **No closing CTA at all (brief just ends)**: rejected. Too risky for revenue if Spec 3 email sequence ships late.
- **"Get the board-ready PDF" placeholder/teaser**: rejected. Spec 1 ships clean — no fake affordances.

### E. Things that might surprise you (callouts)

- **The `.print-footer` block is gone, but the print stylesheet itself stays.** `@media print` rules in `globals.css` (recently scope-fixed in the adapt pass) remain — they still serve the small minority who hit `⌘P` in browser. The on-screen brief is just no longer engineered to be the printable artifact.
- **The `<details>` "Show printable starter artifact" inside §6 stays.** It's collapsed by default, so it doesn't add visual noise, and it gives users a tactile "I got something" moment before Spec 2 ships. Reconsider deleting in Spec 2 if PDF carries the artifact better.
- **`NewsletterCTA` at the bottom stays.** It's the existing weekly-brief signup, distinct from the deferred Spec 3 (assessment-results follow-up sequence). Two different lists, two different jobs.
- **`StarterArtifactCard.tsx` and `StarterPrompt.tsx` are untouched.** They both keep working in §6.

---

## Self-Review Notes (Inline)

- **Placeholder scan**: No "TBD", "TODO", or vague requirements within Spec 1 scope. Open Questions section explicitly scopes TBDs to follow-up specs.
- **Internal consistency**: Cuts table, Acceptance Criteria, and File Changes Summary all enumerate the same removals.
- **Scope check**: Spec 1 is one cohesive change to one component + one content file + one component-file deletion. Implementable in a single plan.
- **Ambiguity check**: §9-new card visual treatment explicitly references existing primary CTA chrome to avoid "what does this look like?" ambiguity. Tier-keyed copy is in the table verbatim — no interpretation needed.
