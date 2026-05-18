# Free Assessment Output Revision — Task List

Plan: [`../Plans/free-assessment-output-revision.md`](../Plans/free-assessment-output-revision.md)

Five tracks. Each track lands as one focused commit. Track 1 first
(highest conversion leverage). Tracks 2–5 in order, but any of 3/4/5
can ship in parallel once 1 and 2 are in.

---

## Track 1 — CTA hierarchy reshuffle

- [x] T1.1 Extend `TierClosingCta` type in `content/assessments/v2/personalization.ts` to carry `primary`, `secondary`, `tertiary` (was one card; now three ranked CTAs)
- [x] T1.2 Rewrite `TIER_CLOSING_CTA` so tiers 1–3 have Foundation primary, In-Depth $99 secondary, Executive Briefing tertiary; tier 4 has Advisory primary, Foundation secondary
- [x] T1.3 Update `ResultsViewV2.tsx` Section 9 closing block to render the trio (one prominent card + two text links)
- [x] T1.4 Replace `print/_components/NextStepsTrio.tsx` so PDF reflects the same ranked trio (currently renders three side-by-side; rebuild as primary card + two secondary stacks)
- [x] T1.5 Update Plausible `purchase_initiated` event firing so Foundation clicks from the free results page are tagged `source: 'free-results-primary'`
- [x] T1.6 Build, type-check, eyeball each tier on `localhost:3000/assessment` and the print route

## Track 2 — Copy revisions (no structure change)

- [x] T2.1 Rewrite `PERSONAS` one-liners in `personalization.ts` — plainspoken, operationally specific, no abstract language
- [x] T2.2 Rewrite `BIG_INSIGHT` so each tier sentence sounds like an editorial pull-quote, not a memo bullet
- [x] T2.3 Compress `FINANCIAL_IMPLICATIONS` per-tier blocks by ~20% (Operational / Risk / Cost rows)
- [x] T2.4 Compress `GAP_CONTENT` explanations to the same density target; preserve `impacts` + `whatGoodLooksLike` lists
- [x] T2.5 Banned-phrase grep: `rg -i "ffiec-aware|aibi-practitioner|aibi-p\b" content/ src/` — must return zero
- [x] T2.6 Citation sweep: every statistic in copy has a named source + year inline or in `GovernanceCitations`

## Track 3 — "What This Looks Like in Practice"

- [x] T3.1 Add `PRACTICE_PICTURE` map in `personalization.ts` (or new file) — per-tier × per-role (operations, compliance, managers, executives) one-paragraph copy
- [x] T3.2 Build `PracticePicture` on-screen component in `src/app/assessment/_components/` — four-row dl, role label left, body right
- [x] T3.3 Slot `PracticePicture` into `ResultsViewV2.tsx` between Section 1 (Diagnosis) and Section 2 (Big Insight)
- [x] T3.4 Build `PracticePicture` print component in `print/_components/` — single PDF page, same data
- [x] T3.5 Insert print component into `print/[id]/page.tsx` between `ExecSummary` and `LensedImplications`
- [x] T3.6 Verify print pagination — must not push back-cover to page 12+

## Track 4 — Maturity ladder

- [x] T4.1 Define ladder data — six rungs, label + one-line description; mapping from `Tier['id']` to rung index
- [x] T4.2 Build `MaturityLadder` on-screen component — vertical rail with "you are here" pin on the user's rung
- [x] T4.3 Slot ladder into `ResultsViewV2.tsx` after the Strengths and Gaps section
- [x] T4.4 Build `MaturityLadder` print component — landscape-friendly, one PDF page, same data
- [x] T4.5 Slot print component after `StrengthsAndGaps` in `print/[id]/page.tsx`
- [x] T4.6 Accessibility: aria-current="step" on the user's rung, full rung list readable by screen readers

## Track 5 — Signature insight callout

- [x] T5.1 Add the signature line as a constant in `personalization.ts` (single source — both surfaces import it)
- [x] T5.2 Build `SignatureInsight` on-screen treatment — italic Newsreader on parchment, hairline rule above and below, no card chrome
- [x] T5.3 Slot between Diagnosis and the new PracticePicture in `ResultsViewV2.tsx`
- [x] T5.4 Mirror in PDF — slot between `ExecSummary` and `PracticePicture` print component
- [x] T5.5 Confirm reads correctly in print (italic font subset present)

## Ship gate

### Automated — done

- [x] G1 `npm run build` clean — zero TypeScript errors
- [x] G2 `npm run lint` clean
- [x] G3 Banned-phrase grep clean (see T2.5)

### Track 6 (richer visuals) — added mid-session

- [x] T6.1 Dashboard band (`ResultsDashboard`) — score ring + tier seal + 8 ranked bars + rung ribbon
- [x] T6.2 Practice Picture as 2×2 quadrant grid
- [x] T6.3 Strengths section chart-led, then deep-dive on critical only
- [x] T6.4 PDF cover report card — score, rung seal, top-3 weakest
- [x] T6.5 Type-size bump across all new surfaces
- [x] T6.6 PDF generation works on macOS (platform gate)
- [x] T6.7 Puppeteer Chrome isolation (no tabs in user browser)

### 🔒 HUMAN — needs the user

These cannot be completed by Claude. They require a real browser
session and the user's eyes:

- [ ] **🔒 HUMAN H1** Walk all four tier results on `/assessment` end-to-end (desktop + iPhone Safari). Verify on each tier:
  - Dashboard band: score ring, 8 dimension bars (weakest first), tier seal "Rung N of 6", footer ribbon
  - Signature insight italic band reads correctly
  - Practice Picture renders as 2×2 grid (not a stacked list)
  - Big Insight dark callout visible
  - Strengths chart: zone legend, 8 bars with percent labels, 50%/75% markers
  - Maturity ladder: terra-pinned current rung, dimmed below, hollow above
  - Closing CTA: Foundation $295 primary (tiers 1–3) or Advisory primary (tier 4)
- [ ] **🔒 HUMAN H2** Walk the four tier PDFs at `/assessment/results/print/<profileId>` (or via the Download PDF button). Verify cover report card, page numbering 1–14, no orphaned hairlines, no awkward page breaks
- [ ] **🔒 HUMAN H3** Confirm Plausible fires `purchase_initiated` with `source: 'free-results-primary'` on Foundation CTA click from the free results page (check Plausible dashboard live view)
- [ ] **🔒 HUMAN H4** Open PR `feature/free-assessment-output-revision` → `main`, request review, merge when green

### How to run H1 / H2 quickly

```
cd ~/Projects/aibi-free-assessment-revision
npm run dev   # → http://localhost:3000
```

Test profile already in Supabase with cached PDF:
`0894264b-629b-40b6-a4b9-f4d5acf0044f`

To get fresh profiles for each tier, run the assessment four times
selecting all-Strongly-Disagree, mixed-low, mixed-high,
all-Strongly-Agree.
