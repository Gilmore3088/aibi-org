---
title: GTM Copy Review — feature/redesign-mockup-system
date: 2026-05-26
framework: operator-supplied GTM parameters
reviewer: Claude (Opus 4.7, GTM copywriting analyst)
scope: 15 user-facing routes
---

# GTM Copy Review

The operator's intuition is correct: legacy language and the legacy Ledger
visual grammar have re-entered the codebase on the AiBI-S and AiBI-L pages.
The mockup-system redesign has been ported faithfully on the home, free
assessment, In-Depth landing, /education, /for-institutions, /my-toolbox,
and (mostly) /research surfaces. The Specialist and Leader pages were never
ported — they still render in Ledger-era tokens, with retired italics, with
"Prototype" leaked into user-visible copy, and with internal inconsistency
about whether AiBI-S is a self-paced track-picker or a 6-week live cohort.

## Critical findings (operator-flagged regressions)

### `/courses/aibi-s` — FAILS GTM REVIEW

`src/app/courses/aibi-s/page.tsx`

This page is the entry to a $1,495 product. It currently reads as an
internal prototype scaffold, not a product landing page.

- **Line 29** — Component is literally named `AiBISPrototypeLanding`. Not
  user-visible, but the name itself signals this page never graduated to
  product.
- **Line 34** — Visible kicker: `"AiBI-S · Banking AI Specialist · Prototype"`.
  Ships the word "Prototype" to the prospect. Direct violation of the
  banned-phrase list (operator called this out by name).
- **Line 36** — H1 is `"Choose your track"`. Lacks benefit. Frame is
  procedural ("choose"), not outcome ("Earn an AiBI-S credential in your
  function"). No subhead beneath it carries a benefit either.
- **Line 38–41** — The lede explains the credentialing rule before any
  value proposition. The reader has been told zero about *why* AiBI-S
  exists before being asked to pick a track.
- **Line 39** — `<span className="italic">track</span>`. Italics are
  retired site-wide per `base.css`'s universal kill rule and the explicit
  Design Context note. Even if the rule blanks visual italics, the markup
  intent leaks into screen readers.
- **Line 55** — `"Active in prototype →"` — Second occurrence of the
  banned "Prototype" leakage, on every active card.
- **No pricing.** No CTA hierarchy. No deliverable preview. No social
  proof. No FAQ. No prerequisite explainer.
- **Routing inconsistency:** the only "active" track links straight into
  the LMS at `/courses/aibi-s/ops`, not the purchase page. A prospect who
  hasn't paid can drill into "the prototype" with no checkout step
  surfaced.
- **Internal product-shape contradiction:** this landing describes a
  self-paced 5-track picker. The /purchase page (see below) describes a
  6-week live cohort with weekly Zoom sessions. Two different products
  under one credential code.

Verdict: this page needs a full rewrite, not a copy pass.

### `/courses/aibi-s/purchase` — FAILS GTM REVIEW

`src/app/courses/aibi-s/purchase/page.tsx`

- **Lines 20, 23–31** — Describes AiBI-S as `"Six weeks, live cohort"`
  with weekly 90-minute Zoom sessions, capstone, peer review. This
  contradicts the public landing's "self-paced prototype" framing.
- **Line 109** — Lede uses `font-serif italic`. Retired italics; same
  Ledger-era styling.
- **Line 106, 142, 165, 174, 215, 217, 287** — Every primary surface
  uses `--color-ink`, `--color-parch`, `--color-linen`, `--color-slate`
  — the **Terra/Sage/Cobalt legacy palette**, two systems behind the
  current Mockup target. CLAUDE.md says these are dropped from migrated
  surfaces.
- **Line 129** — `"AiBI-S requires completion of the AiBI-Foundation
  (AiBI-Foundation) course."` The parenthetical re-states its own
  antecedent. Reads as a stale find-and-replace artifact from the
  AiBI-Practitioner → AiBI-Foundation rename.
- **Line 217** — Disabled button label: `"Complete AiBI-Foundation First"`
  — sentence-case. Mockup spec requires mono UPPERCASE for buttons.
  Same violation on lines 91 and 287 on the public landing where the
  Ledger UPPER tracked-mono is used (correct for Ledger, but the rest
  of the page is also Ledger so it stays internally consistent — and
  internally stale).
- **Line 277** — Back link reads `"Back to Course Overview"`. Title Case.
  Mockup-system links should be sentence-case.

### `/courses/aibi-l` — FAILS GTM REVIEW

`src/app/courses/aibi-l/page.tsx`

This is the most expensive product on the site ($2,800 individual /
$12,000 team). It reads as the Ledger-era PRD draft, not a 2026-05-26
mockup-system page.

- **Line 3** — Source-comment: `"Cobalt accent color throughout (AiBI-L
  = governance / Pillar B)"`. Internal only, but evidence that this file
  was never touched in the brand refresh — pillar discipline is retired.
- **Line 62** — H1 wraps the word `Leader` in `italic`. Italics retired.
- **Line 65** — Lede: `font-serif italic text-xl … text-[color:var(--color-slate)]`.
  Italic + legacy Slate token.
- **Lines 110, 121** — Pricing cards on `--color-linen`. Legacy token.
- **Lines 142, 145, 175, 241, 281** — Six more instances of `italic` and
  `font-serif italic` markup. Every section heading and lede uses italics
  as the visual hook.
- **Line 93** — Primary CTA label: `"Request Workshop"`. Verb-first is OK,
  but pairs poorly with the secondary `"View Sessions"` (also verb-first,
  but two competing primary-weight CTAs in the hero — one is `ink-2` solid,
  one is bordered, but both are large mono-uppercase pills, so visual
  hierarchy is weak).
- **Line 279** — H2: `"Ready to lead your institution's AI strategy?"`
  Question framing — the mockup-system voice is declarative-editorial
  ("Lead your institution's AI strategy."). Question marks are not
  banned but read as conversion-funnel boilerplate, not editorial.
- **No social proof, no founder name, no Calendly embed.** Workshop
  inquiry is the conversion event but the page never says who is
  facilitating, when sessions have happened, or what bankers have said
  about it.

### `/courses/aibi-l/request` — NEEDS WORK

- **Lines 90, 126, 128** — Same `font-serif italic` + legacy `--color-slate`
  pattern. The H1 "Request a *Workshop*" italicizes "Workshop" — same
  retired-italic violation.
- **Line 120** — `<span className="text-[color:var(--color-slate)]">Request
  Workshop</span>` — passive label inside a Link that's already labeled
  Request Workshop in the parent. Redundant.
- Form intake is functional but copy gives no expectation about
  response time or what happens after submit.

### `/courses/aibi-s/ops` — NEEDS WORK

- **Line 69** — `font-serif italic` H1 on the dark band. Retired italics.
- **Line 92** — `"{count} units available in prototype"` — third surface
  shipping the word "prototype" to learners. Even paid users see this.

## Banned-phrase audit

| File:Line | Verbatim | Rule violated | Severity |
|---|---|---|---|
| `src/app/courses/aibi-s/page.tsx:34` | `AiBI-S · Banking AI Specialist · Prototype` | Internal-language leak ("Prototype" on a product landing) | HIGH |
| `src/app/courses/aibi-s/page.tsx:55` | `Active in prototype →` | Same | HIGH |
| `src/app/courses/aibi-s/ops/page.tsx:92` | `{n} units available in prototype` | Same; visible to paid learners | HIGH |
| `src/app/courses/aibi-s/page.tsx:39` | `<span className="italic">track</span>` | Italics retired site-wide | MEDIUM |
| `src/app/courses/aibi-s/purchase/page.tsx:106, 109, 228, 254` | `italic` / `font-serif italic` | Italics retired | MEDIUM |
| `src/app/courses/aibi-l/page.tsx:62, 65, 142, 145, 175, 241, 281` | `italic` / `font-serif italic` (×7) | Italics retired | MEDIUM |
| `src/app/courses/aibi-l/request/page.tsx:90, 126, 128` | `italic` / `font-serif italic` | Italics retired | MEDIUM |
| `src/app/assessment/in-depth/page.tsx:91, 142, 144, 159, 188, 248, 265` | `font-serif italic`, `em … italic` | Italics retired | MEDIUM |
| `src/app/courses/aibi-l/page.tsx:3` (comment) | `Pillar B` | Pillar discipline retired (internal only — keep an eye) | LOW |
| `src/app/page.tsx:482` | `Help users find their next best step.` | "users" → "you" rule (Voice section) | MEDIUM |
| `src/app/assessment/take/page.tsx:91` | `gives users a clearer signal` | Same | MEDIUM |
| `src/app/research/six-ways-ai-fails-in-banking/page.tsx:106` | `As users become more familiar with an AI tool's fluency…` | Same | LOW (research/long-form, more forgiveable) |
| `src/app/assessment/in-depth/page.tsx:126, 311` | `seat below to unlock it` / `Per-seat pricing of $79 unlocks` | "unlock" — operator flagged this; partial fix only | HIGH |
| `src/app/assessment/in-depth/purchased/page.tsx:18, 77, 133, 173` | `assessment is unlocked` (×3) + `Playground unlock with the AiBI-Foundation course.` | "unlock" still everywhere on Stripe success page | HIGH |
| `src/app/dashboard/page.tsx:180` | `Your In-Depth Assessment is unlocked.` | Same | HIGH |
| `src/app/results/page.tsx:195` | `the next unlock is documentation` | Same | MEDIUM |
| `src/app/courses/page.tsx:269, 271, 290` | `Toolbox unlocked` / `Course completion unlocks the full Toolbox` / `the unlocked Toolbox` | Same | HIGH |
| `src/app/courses/foundation/program/quick-wins/QuickWinsClient.tsx:238` | `unlocked — download it from your…` | Same | MEDIUM |
| `src/app/courses/foundation/program/_components/ProgramModuleCard.tsx:111` | `Complete the previous module to unlock` | Same | MEDIUM |
| `src/app/courses/foundation/program/_components/ModuleNavigation.tsx:61–62` | `Complete all activities to unlock the next module` | Same; tooltip + aria-label both | MEDIUM |
| `src/app/courses/foundation/program/toolkit/page.tsx:465` | `Go to Module {n} to unlock this artifact` | Same | MEDIUM |
| `src/app/prompt-cards/PromptCardsExperience.tsx:79, 134, 149, 152, 286, 410` | `Unlock`, `Unlock full library`, `Unlock cards`, `Unlocking...` | Same; "unlock" is the entire UX vocabulary of this surface | HIGH |
| `src/app/certifications/exam/foundation/page.tsx:133` | `to unlock the exam` | Same | MEDIUM |
| `src/app/playbooks/[role]/page.tsx:178` | `The playbook unlocks real tools.` | Same | MEDIUM |
| `src/app/assessment/in-depth/dashboard/page.tsx:95` | `Full Playground and Build tabs unlock with AiBI-Foundation.` | Same | MEDIUM |
| `src/app/courses/aibi-s/purchase/page.tsx:129` | `AiBI-S requires completion of the AiBI-Foundation (AiBI-Foundation) course.` | Redundant parenthetical — stale rename artifact | MEDIUM |
| `src/app/for-institutions/samples/efficiency-ratio-workbook/page.tsx:178, 204` | `Foundations cohort` (plural) | "AiBI Foundations" plural retired; should be "Foundation course" | LOW |
| `src/app/assessment/_components/ResultsView.tsx:152` | `The AI Foundations course before investing…` | Same | LOW |
| `src/app/courses/page.tsx:55` | `title: 'Prompt Foundations'` | Plural "Foundations" leakage (here it's a different artifact name, but still confusing-adjacent) | LOW |

**Banned phrases NOT found** (good news): `supercharge`, `revolutionize`,
`leverage`, `synergy`, `AI-powered`, `FFIEC-aware`, `AiBI-Practitioner`,
`AiBI-P` (bare), `BAI-[A-Z]`, `AiBi` (single-lower-i). The bigger
substitution sweep took. The remaining failures are concentrated in
**"unlock" (~30 instances)** and **italics (~17 instances on flagged
pages alone)**.

**Exclamation points in body copy:** none found in user-visible copy.

## Per-page scorecard

| Page | Benefit-first | Scannable | CTA hierarchy | Consistent terms | Voice | Overall |
|---|---|---|---|---|---|---|
| `/` | ✓ | ✓ | ✓ | ✓ | mostly (one "users") | **A−** |
| `/assessment` | ✓ | ✓ | ✓ | ✓ | ✓ | **A** |
| `/assessment/in-depth` | ✓ | ✓ | ✓ | mostly | ✗ (italics, "unlock" ×2) | **B−** |
| `/assessment/in-depth/purchased` | ✓ | ✓ | ✓ | ✓ | ✗ ("unlock" ×4) | **C+** |
| `/courses/aibi-s` | ✗ | ✓ | ✗ (no purchase CTA) | ✗ (contradicts /purchase) | ✗ ("Prototype" ×2, italics) | **F** |
| `/courses/aibi-s/purchase` | ✓ | ✓ | ✓ | ✗ (cohort vs prototype) | ✗ (italics, legacy tokens, redundant copy) | **D** |
| `/courses/aibi-s/ops` | mostly | ✓ | ✓ | ✗ ("prototype" leak) | ✗ (italic H1) | **C** |
| `/courses/aibi-l` | ✓ | ✓ | mid (two big buttons) | ✓ | ✗ (italics ×7, legacy palette) | **C−** |
| `/courses/aibi-l/request` | mostly | ✓ | ✓ | ✓ | ✗ (italics ×3, legacy palette) | **C+** |
| `/education` | ✓ | ✓ | ✓ | ✓ | ✓ | **A−** |
| `/for-institutions` | ✓ | ✓ | ✓ | ✓ | ✓ | **A−** |
| `/about` | ✓ | ✓ | ✓ | ✓ | ✓ | **A** |
| `/security` | ✓ | ✓ | ✓ | ✓ | ✓ | **B+** |
| `/research` | ✓ | ✓ | ✓ | ✓ | ✓ (one "users" in long-form OK) | **A−** |
| `/my-toolbox` | ✓ ("A working kit, not a PDF graveyard.") | ✓ | ✓ | ✓ | ✓ | **A** |
| `/courses/foundation/program/purchase` | ✓ | ✓ | ✓ | ✓ | ✓ | **A−** |

The pattern is unambiguous: every page that has been ported to the mockup
system reads cleanly. Every page that's still in Ledger-era markup
(everything under `/courses/aibi-s/*`, `/courses/aibi-l/*`, plus the
In-Depth `purchased` page) reads stale.

## CTA inventory

Verb-led, consistent across pages — the assessment funnel uses a tight
verb set:

- **Take the assessment** (home hero, /assessment hero, /assessment 3×, /not-found, two research pages) — primary verb across funnel. Good.
- **View the curriculum** (home hero secondary) — verb-led, descriptive.
- **Explore AiBI-Foundation** (NextStepCards ×2) — consistent.
- **Join AiBI-S Waitlist** / **Join AiBI-L Waitlist** (NextStepCards) — verb-led, specific.
- **Enroll in AiBI-Foundation** (assessment in-depth, dashboard, aibi-s/purchase prerequisite). Consistent.
- **Request Workshop** (aibi-l ×3 + aibi-l/request) — consistent verb; mono UPPER.
- **Start Track** / **Resume** (aibi-s/ops) — consistent, verb-led.
- **Back to Course Overview** (aibi-s/purchase) — Title Case in a sea of sentence-case back links elsewhere. Inconsistency.
- **Complete AiBI-Foundation First** (aibi-s/purchase disabled button) — Title Case in mono-UPPER button system. Should be `COMPLETE AIBI-FOUNDATION FIRST` or, better, "FINISH FOUNDATION TO ENROLL".
- **Get the AiBI Prompt Cards** (/prompt-cards) — verb-led. Fine. But the surface itself is the worst "unlock" offender on the site.

**Single-action label inconsistencies worth fixing:**
- Same destination (Calendly Executive Briefing) labeled "Book a briefing" (about page) but no Calendly CTA at all on `/courses/aibi-l`, where it would convert hardest.
- "Enroll in AiBI-Foundation" (sentence-case mono) and "ENROLL IN AIBI-FOUNDATION" (Title→UPPER in the aibi-s/purchase prerequisite block) — same target, different casing.

## Top 10 fixes (ranked by conversion impact)

1. **`src/app/courses/aibi-s/page.tsx`** — full rewrite. Delete the
   "Prototype" labels. Decide whether AiBI-S is self-paced track-picker
   or 6-week cohort and align this page with `/purchase`. Add a hero
   benefit headline ("Earn the AiBI-S credential in your function"),
   pricing block, one primary CTA pointing to `/courses/aibi-s/purchase`.
   *Why:* this is a $1,495 page that today reads as a scaffold.
2. **`/courses/aibi-l/page.tsx`** — port to mockup system. Replace
   every `font-serif italic` and every `--color-*` legacy token with
   Inter + `--ink`/`--gold`/`--cream`/`--slate-*`. Drop the seven
   italic spans. Add a Calendly fallback near the bottom-CTA.
   *Why:* most expensive product on the site, currently visually
   indistinguishable from a draft.
3. **`/courses/aibi-s/purchase/page.tsx`** line 129 — change to
   `"AiBI-S requires completion of the AiBI-Foundation course."`
   *Why:* the parenthetical reads as a search-replace failure and
   undermines confidence at the checkout step.
4. **All `unlock` copy in `/prompt-cards`** — this surface is built
   around the banned verb. Refactor to "Save the full library" /
   "Saved" / "Saving…" / "Get the cards". *Why:* 6 violations in one
   component, and the operator has explicitly banned "unlock".
5. **`/assessment/in-depth/purchased/page.tsx`** lines 18, 77, 133, 173
   — change "unlocked" → "ready" / "open" / "available". *Why:* this
   is the Stripe-success page, the first paid touchpoint, and it
   carries four banned-word instances.
6. **`/courses/page.tsx`** lines 269, 271, 290 — change "Toolbox
   unlocked" → "Toolbox open" or "Toolbox available"; "Course
   completion unlocks the full Toolbox" → "Finish the course to
   open the full Toolbox". *Why:* high-visibility catalog page.
7. **`src/app/page.tsx`** line 482 — `"Help users find their next
   best step."` → `"Help your team find their next best step."` (or
   `"Find your next best step."`). *Why:* on the home hero band, in
   a 44px headline, "users" reads as SaaS-tech-language exactly where
   the brand is trying to sound editorial.
8. **`/courses/aibi-s/ops/page.tsx`** line 92 — `"{n} units available
   in prototype"` → `"{n} units in this track"`. *Why:* paid learners
   see "prototype" on their course page.
9. **`/courses/aibi-l/page.tsx`** line 279 — `"Ready to lead your
   institution's AI strategy?"` → `"Lead your institution's AI
   strategy."` *Why:* matches the declarative-editorial voice and
   removes the rhetorical question.
10. **All `font-serif italic` lede styling on `/courses/aibi-s/*`
    and `/courses/aibi-l/*`** — remove. Italics are retired
    site-wide; emphasis is now weight + color. *Why:* this is a
    visual-system rule, but it reads as a copy/voice failure
    because italic ledes set a different *register* (literary-quote
    voice) than the rest of the site.

## What's working — templates for the stragglers

Three pages set the bar:

- **`/my-toolbox`** — H1 `"A working kit, not a PDF graveyard."` is
  a 7-word benefit-led, specific, slightly editorial line. No italics,
  no banned phrases, no jargon. The whole page reads from this hook.
- **`/for-institutions`** — H1 `"Capability — not a platform."` does
  the same thing: defines the product by what it isn't, in five words.
  Pricing surfaced, deliverables surfaced, CTA hierarchy clear.
- **`/assessment`** — H1 `"See where you stand. Find the dimension
  dragging you down."` Benefit-first (see + find), concrete
  ("dimension"), specific outcome ("dragging you down"). One primary
  CTA repeated in hero and close.

The AiBI-S and AiBI-L pages should be ported to that voice and that
visual register before the next push. The fix is mechanical — the same
substitutions, applied to the same six files — but the impact is
disproportionate because those are the two highest-priced products on
the site.

---

**Files referenced (verbatim quotes drawn from):**
- `/Users/jgmbp/Projects/TheAiBankingInstitute/.worktrees/redesign-mockup-system/src/app/courses/aibi-s/page.tsx`
- `…/src/app/courses/aibi-s/purchase/page.tsx`
- `…/src/app/courses/aibi-s/ops/page.tsx`
- `…/src/app/courses/aibi-l/page.tsx`
- `…/src/app/courses/aibi-l/request/page.tsx`
- `…/src/app/page.tsx`
- `…/src/app/assessment/in-depth/page.tsx`
- `…/src/app/assessment/in-depth/purchased/page.tsx`
- `…/src/app/courses/page.tsx`
- `…/src/app/prompt-cards/PromptCardsExperience.tsx`
- `…/src/app/courses/foundation/program/_components/ProgramModuleCard.tsx`
- `…/src/app/courses/foundation/program/_components/ModuleNavigation.tsx`
- `…/src/app/dashboard/page.tsx`
