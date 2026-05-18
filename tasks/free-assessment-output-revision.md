# Free Assessment Output Revision — Task List

Plan: [`../Plans/free-assessment-output-revision.md`](../Plans/free-assessment-output-revision.md)

Five tracks. Each track lands as one focused commit. Track 1 first
(highest conversion leverage). Tracks 2–5 in order, but any of 3/4/5
can ship in parallel once 1 and 2 are in.

---

## Track 1 — CTA hierarchy reshuffle

- [ ] T1.1 Extend `TierClosingCta` type in `content/assessments/v2/personalization.ts` to carry `primary`, `secondary`, `tertiary` (was one card; now three ranked CTAs)
- [ ] T1.2 Rewrite `TIER_CLOSING_CTA` so tiers 1–3 have Foundation primary, In-Depth $99 secondary, Executive Briefing tertiary; tier 4 has Advisory primary, Foundation secondary
- [ ] T1.3 Update `ResultsViewV2.tsx` Section 9 closing block to render the trio (one prominent card + two text links)
- [ ] T1.4 Replace `print/_components/NextStepsTrio.tsx` so PDF reflects the same ranked trio (currently renders three side-by-side; rebuild as primary card + two secondary stacks)
- [ ] T1.5 Update Plausible `purchase_initiated` event firing so Foundation clicks from the free results page are tagged `source: 'free-results-primary'`
- [ ] T1.6 Build, type-check, eyeball each tier on `localhost:3000/assessment` and the print route

## Track 2 — Copy revisions (no structure change)

- [ ] T2.1 Rewrite `PERSONAS` one-liners in `personalization.ts` — plainspoken, operationally specific, no abstract language
- [ ] T2.2 Rewrite `BIG_INSIGHT` so each tier sentence sounds like an editorial pull-quote, not a memo bullet
- [ ] T2.3 Compress `FINANCIAL_IMPLICATIONS` per-tier blocks by ~20% (Operational / Risk / Cost rows)
- [ ] T2.4 Compress `GAP_CONTENT` explanations to the same density target; preserve `impacts` + `whatGoodLooksLike` lists
- [ ] T2.5 Banned-phrase grep: `rg -i "ffiec-aware|aibi-practitioner|aibi-p\b" content/ src/` — must return zero
- [ ] T2.6 Citation sweep: every statistic in copy has a named source + year inline or in `GovernanceCitations`

## Track 3 — "What This Looks Like in Practice"

- [ ] T3.1 Add `PRACTICE_PICTURE` map in `personalization.ts` (or new file) — per-tier × per-role (operations, compliance, managers, executives) one-paragraph copy
- [ ] T3.2 Build `PracticePicture` on-screen component in `src/app/assessment/_components/` — four-row dl, role label left, body right
- [ ] T3.3 Slot `PracticePicture` into `ResultsViewV2.tsx` between Section 1 (Diagnosis) and Section 2 (Big Insight)
- [ ] T3.4 Build `PracticePicture` print component in `print/_components/` — single PDF page, same data
- [ ] T3.5 Insert print component into `print/[id]/page.tsx` between `ExecSummary` and `LensedImplications`
- [ ] T3.6 Verify print pagination — must not push back-cover to page 12+

## Track 4 — Maturity ladder

- [ ] T4.1 Define ladder data — six rungs, label + one-line description; mapping from `Tier['id']` to rung index
- [ ] T4.2 Build `MaturityLadder` on-screen component — vertical rail with "you are here" pin on the user's rung
- [ ] T4.3 Slot ladder into `ResultsViewV2.tsx` after the Strengths and Gaps section
- [ ] T4.4 Build `MaturityLadder` print component — landscape-friendly, one PDF page, same data
- [ ] T4.5 Slot print component after `StrengthsAndGaps` in `print/[id]/page.tsx`
- [ ] T4.6 Accessibility: aria-current="step" on the user's rung, full rung list readable by screen readers

## Track 5 — Signature insight callout

- [ ] T5.1 Add the signature line as a constant in `personalization.ts` (single source — both surfaces import it)
- [ ] T5.2 Build `SignatureInsight` on-screen treatment — italic Newsreader on parchment, hairline rule above and below, no card chrome
- [ ] T5.3 Slot between Diagnosis and the new PracticePicture in `ResultsViewV2.tsx`
- [ ] T5.4 Mirror in PDF — slot between `ExecSummary` and `PracticePicture` print component
- [ ] T5.5 Confirm reads correctly in print (italic font subset present)

## Ship gate

- [ ] G1 `npm run build` clean — zero TypeScript errors
- [ ] G2 `npm run lint` clean
- [ ] G3 Banned-phrase grep clean (see T2.5)
- [ ] G4 Manual walkthrough of all four tier results on `localhost:3000/assessment` (mobile + desktop)
- [ ] G5 Manual walkthrough of all four tier PDFs at `localhost:3000/assessment/results/print/<id>` (need one test user per tier)
- [ ] G6 Plausible events fire on Foundation CTA click from free results
- [ ] G7 Tick this section in `tasks/MASTER.md`, move file to `tasks/_done/` when shipped
