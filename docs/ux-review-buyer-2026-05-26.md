---
reviewer: Banker buyer advocate (independent, Reviewer 3 of 3)
date: 2026-05-26
branch: feature/redesign-mockup-system
lens: Community-bank/credit-union CEO/COO/CRO evaluating $99 / $295 / institutional spend
---

# Review — Banker buyer lens

## Executive summary

- **Would a CRO forward this to the board today? Conditionally yes, but only `/about`, `/security`, and the two research articles survive forwarding intact.** Everything else has at least one trust-leak that would invite a back-channel "what is this, really?" call before the board meeting.
- **The single strongest selling line in the corpus — "the credential your examiner respects" — is present on `/education` and the home product trio, but missing exactly where the $295 decision is made (`/courses/foundation/program/purchase`).** That page leads with "AI Banking Foundation." as its H1 and never uses the examiner frame. This is the most consequential omission on the site.
- **The two long-form research articles (`/research/ai-governance-without-the-jargon` and `/research/what-your-efficiency-ratio-is-hiding`) are by a wide margin the most credible artifacts in this build.** They cite GAO-25-107197, AIEOG (Feb 2026), SR 11-7, TPRM, ECOA/Reg B, BSA, FDIC Quarterly Banking Profile Q4 2024, Cornerstone 2025, and Jack Henry 2025 — all with publisher + year. Every other page should be measured against these.
- **The anti-positioning line "No software seats. No vendor lock-in." is load-bearing per CLAUDE.md, and it has been restored on `/for-institutions` and `/security`** — but it is absent from the home, the assessment landing, and (critically) `/education`, where a buyer is comparing AiBI against vendor-led training products and most needs the contrast.
- **Several pages still carry SaaS-product voice that contradicts the editorial-first posture.** "One command center. Three places it sends you." and "Inside the platform" on the home page sound like Notion or Linear marketing, not an Institute. Banker buyers are predisposed to distrust software vendors selling them governance; this drift hurts.

---

## Per-page findings

### 1. `/` (Home) — Verdict: passes with two voice drifts and one trust gap

The hero lede ("Train people to use AI without losing control. Independent AI assessment and education for community banks and credit unions … workflows your examiner respects.") is on the money. The product trio (Free / $99 / $295) ladder is clearly priced and labeled, and "the credential your examiner respects" appears in the $295 tile.

- **HIGH — SaaS voice drift in two section heads.**
  - `"Inside the platform / One command center. Three places it sends you."` and `"Learner Command Center"` read like a product-tour for a B2C app. The Institute brands itself as an Institute, not a platform; "command center" is the exact register a community-bank CRO has been pitched ten times by vendors selling AI governance dashboards. Recommend recasting to something like "How the Institute is laid out" / "One starting view. Three places it sends you."
- **HIGH — Anti-positioning absent from home.** "No software seats. No vendor lock-in." is the differentiator the institutional buyer is looking for, and it is missing here. It belongs in the hero subhead or directly under the product trio. Without it, a quick scan of the platform tabs (Sandbox / Toolbox / Teams) reads as "AI Banking Institute is a SaaS product."
- **MEDIUM — "Build confidence. Keep control."** closing line is good but the preceding paragraph ("A practical path for financial professionals to assess, train, practice, and document AI-supported work") is the only place "financial professionals" appears instead of "community bankers." Use the specific audience name.
- **MEDIUM — Regulatory references are absent from the home.** A compliance officer scanning the homepage cannot tell whether the curriculum is regulator-aligned without clicking into `/security`. One sourced line in the trust strip (e.g. "Aligned with SR 11-7, TPRM, ECOA/Reg B, AIEOG Lexicon") would carry significant weight at zero copy cost.
- **LOW — "Built for banks, credit unions, and regulated teams"** in the eyebrow widens the audience past "community banks and credit unions that anchor towns." Drift toward generic "regulated teams" weakens the targeting language CLAUDE.md identifies as canonical.

### 2. `/about` — Verdict: forwards to the board cleanly

This page is in the strongest shape. The triple-shot opener — "For the community banks and credit unions that anchor towns — not the twenty largest banks" / "Built on regulator-aligned criteria. Tuition published. Methodology published." / the founder backstory — is exactly the institutional pitch this audience expects. The Six Principles section is regulator-grade voice ("Curriculum maps to SR 11-7, TPRM, ECOA / Reg B, and the AIEOG lexicon — not as a footnote, as the structure"). The FDIC 8,400 monument is sourced ("FDIC + NCUA · 2025").

- **LOW — "We turn bankers into builders."** is the canonical tagline and lands well. No issue. Flag only that the page uses the tagline in the mission block but the global footer/header lockup uses "Regulated Intelligence" — two competing brand lines on the same page is mildly diluting. Decision needed about which is primary.
- **LOW — No regulator-reference table or sourced statistics on the page itself.** The Six Principles cite SR 11-7 / TPRM / ECOA/Reg B / AIEOG by name (good), but a board-forwardable About page benefits from one further sourced number (e.g. FDIC efficiency ratio gap, GAO-25-107197 reference) to demonstrate the methodology in action rather than only described.

### 3. `/assessment` — Verdict: passes for the free funnel, but the "no email gate" promise mismatches reality

The lede ("See where you stand. Find the dimension dragging you down. Twelve questions, three minutes…") is correctly altitude-set. The Try-it preview (4 sample questions, live score, no email needed) is a strong trust move — bankers can see how scoring works before committing. The three-tier pricing card (Free / $99 / Custom) is on-page and clear.

- **BLOCKER — Step 2 in "How it works" still reads "62/100. Tier. Top gap. Inline, no email gate."** This contradicts the actual flow per CLAUDE.md ("Assessment Tool — The Most Important Feature": full report gated behind email at step 13). A buyer reads that step, decides this is the painless option, then encounters the gate and feels misled. Already flagged in the copy audit; restating because it is the single most damaging line on a high-traffic page.
- **HIGH — $99 In-Depth tile lists "Examiner-ready PDF" and "30-day refund" but no regulatory framework names.** Compare to `/security` which leads with SR 11-7 / TPRM / ECOA / AIEOG. The In-Depth is the $99 conversion artifact — its tile should name at least one framework to justify the price tag against free alternatives.
- **HIGH — Missing $79/seat at 10+ volume break on the In-Depth tile.** `/education` and the home product trio both quote "$99 · $79 at 10+ by request" — `/assessment` drops the volume tier. Volume pricing is what a COO is scanning for when sizing an institution-wide test.
- **MEDIUM — Sample report mock shows score 62 with no "Sample" treatment in the heading.** The lede above the mock does say "See a sample report" and the mock is labeled "Sample report" — acceptable. But a CRO skimming might screenshot and circulate without the surrounding context. Recommend a small "Illustrative — your score will differ" caption on the mock itself.
- **LOW — "Best for [free|$99|institution]" lines are crisp; "Most Popular" pill on $99 is the right merchandising signal for the conversion target.**

### 4. `/education` — Verdict: serviceable now, was the worst regression; one anti-positioning gap remains

The catalog content is restored. The Free Assessment tile, In-Depth tile with $99 / $79-at-10 pricing, AiBI-Foundation tile with $295 / $199-at-10 / lifetime access, and the AiBI-S/AiBI-L waitlist callout are all present. "Build the credential your examiner respects" appears verbatim under the Course heading. "Tuition published. Methodology published." is also there.

- **HIGH — "No software seats. No vendor lock-in." absent.** This is the page where a buyer is comparing AiBI against vendor-led offerings (CSI, Jack Henry training portals, Cornerstone academies, the Big Four consulting tracks). The differentiation line belongs here, not just on `/for-institutions`.
- **MEDIUM — "Scored on reviewed work — not a multiple-choice quiz"** is good and present. Recommend repeating it inside the AiBI-Foundation tile body, not just in the section sub-head, so it survives a card-only scan.
- **MEDIUM — No regulator citations on the page.** Unlike `/security` and the research articles, `/education` is silent on SR 11-7 / TPRM / ECOA / AIEOG even though the headline frame is "credential your examiner respects." A compliance officer evaluating spend wants to see the curriculum maps to a named framework.
- **MEDIUM — "Use our assessments to measure you or your team's readiness"** is grammatically loose ("measure you" reads odd). Recommend "Measure where you and your team stand."
- **LOW — AiBI-S/AiBI-L tile is honest ("ship after the Foundation is validated with real learners") and that honesty is on-brand. Keep.**

### 5. `/security` — Verdict: this is the page a compliance officer forwards

Almost everything here works. The lede names SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon with proper attribution ("published by the US Treasury, FBIIC, and FSSCC in February 2026, the first official cross-agency vocabulary for financial AI governance"). The six chapters are framed at the right altitude — "The never-paste list," "Private cloud vs. public model," "Shadow AI discovery," "Examiner readiness." The closing "No software seats. No vendor lock-in." anti-positioning is present.

- **MEDIUM — The free guide form asks for name, work email, and institution — appropriate. But the page never states what happens after the form submit (PDF delivered immediately? Followed by a sequence?).** A compliance officer is sensitive to what they are signing up for. One line of clarity ("You'll receive the PDF immediately. We send the AI Banking Brief fortnightly; unsubscribe anytime.") would reduce friction.
- **LOW — "If your board has been asking whether AI is safe for a regulated institution, the answer is not a brochure. It is a framework."** is a strong line. Keep.
- **LOW — Footer subhead reads "Teach the boundary. Document the verdict. Ship safely."** — "Ship safely" is mildly tech-startup voice for this audience. Banker register would be "Use it safely" or "Operate safely." Minor.

### 6. `/for-institutions` — Verdict: structurally strong, one chrome regression flagged in copy audit

The headline "Capability — not a platform" with the subhead "An education engagement for community banks and credit unions. No software seats. No vendor lock-in." nails the institutional buyer's frame. The five-step "Assess. Train. Document. Govern. Consult." spine is exactly the order a CRO would expect. The sizer (staff count × asset class × department picker producing per-seat price + total + rollout window) is a high-trust artifact — it shows the institution will not be quoted by surprise.

- **HIGH — "Workbench Packs and Toolbox artifacts become your AI use-case inventory — examiner-ready out of the box"** is strong but the "AI use-case inventory" term is the AIEOG Lexicon's term verbatim. Surface that attribution explicitly: "your AI use-case inventory (an AIEOG Lexicon governance baseline)." It signals to the CRO that the product authors actually know what regulators are reading.
- **MEDIUM — Dashboard demo shows "First National · Sample" with department scores.** Label the "Training needed" / "High risk gap" / "Ready" verdicts as "illustrative thresholds, configurable per institution" — otherwise a buyer wonders if these cutoffs are baked in.
- **MEDIUM — "Fractional Chief AI Officer"** appears in the Leadership Advisory tile. Per CLAUDE.md ("Leadership Advisory" — describe as "fractional Chief AI Officer" when shape matters) this is correct usage. Good.
- **LOW — "Direct line to founder"** in the Advisory tile is appropriate at this stage but should sunset as the team scales. Flag for future copy review, not now.
- **LOW — The footer subhead "Train the people who already run the bank"** is the cleanest one-liner on the site for this audience. Keep.

### 7. `/research/ai-governance-without-the-jargon` — Verdict: gold-standard. Forwards to a regulator without embarrassment

This article alone could close a $295 sale to a careful compliance officer. Every framework is named with publisher and year, the GAO-25-107197 frame is correctly cited, the AIEOG Lexicon definitions are quoted verbatim (hallucination, AI governance, AI use case inventory, HITL, third-party AI risk, explainability), and the "55% of institutions have no AI governance framework" stat is sourced to Gartner via Jack Henry 2025. The closing "55% are not waiting for more regulation. They are waiting for someone to make the existing frameworks usable" is the kind of editorial voice the brand promises.

- **LOW — The CTA at the end ("Get a governance baseline in 45 minutes … No obligation. No sales pitch. 45 minutes.")** is appropriately quiet. Recommend that every research article carry this exact CTA — consistency builds the funnel pattern.
- **LOW — No issues. This is the model for the rest of the site.**

### 8. `/research/what-your-efficiency-ratio-is-hiding` — Verdict: also strong, one consistency note already flagged in audit

Sourcing is rigorous (FDIC CEIC 1992–2025, FDIC Quarterly Banking Profile Q4 2024, Bank Director 2024 via Jack Henry, Cornerstone Advisors 2025 AI Playbook with named tools — Ocrolus, Informatica, Fathom, UiPath, Pega, Power Automate, Nintex). The worked example at a $300M-asset community bank with $12M net revenue ("$1.08M in annual operational capacity — the equivalent of three to four FTE salaries") is the kind of specific dollar number that lands in a board meeting.

- **MEDIUM — Lede says "nine-point gap"; meta/audit notes inconsistency with "ten-point gap" elsewhere.** Already P4 in the copy audit. Confirming the inconsistency exists and matters: bankers compute spreads in basis points and will notice.
- **LOW — "Governance first, deployment second, measurement third"** is the kind of regulator-grade sequencing this audience trusts. Strong line.
- **LOW — BankFind Suite reference is a generous addition** — it gives the reader a free tool to verify the Institute's own claim, which is exactly the trust posture an editorial-first brand should take.

### 9. `/courses/foundation/program/purchase` — Verdict: the highest-stakes page, missing the strongest sales line

This is the $295 decision moment. The page does the structural work: 12 modules with minutes, 395-minute total, format, credential, what-you-will-be-able-to-do checklist, required outputs (Acceptable Use card / three saved prompts / reviewed work product / final practical assessment), lifetime access promise, FAQ with refund terms.

- **BLOCKER — H1 reads "AI Banking Foundation."** Per CLAUDE.md the canonical token is "AiBI-Foundation." This is the cert page lineage. Also already in the copy audit. Restate: the page banner does say "Enroll · AiBI-Foundation" but the body H1 is the wrong name.
- **BLOCKER — "Earn the AiBI-Foundation credential your examiner respects" is absent.** This is the strongest line in the corpus for this audience and it is missing from the page where it would do the most work. The current value-prop sentence ("every community banking employee can write better, summarize faster, think clearer, and avoid risky AI mistakes") is generic — could describe any AI literacy course. The examiner line is the differentiator. Add it to the hero block.
- **HIGH — No regulatory framework names on the page.** A CFO/COO authorizing $295 (or $199 × 10 seats = $1,990) needs at least one named framework reference to defend the spend. "Curriculum maps to SR 11-7, TPRM, ECOA / Reg B, and the AIEOG lexicon" should appear at module-list level.
- **HIGH — FAQ item 4 — "Continuing-ed recognition with state banking associations is in progress."** This is honest but feels like a "trust me" claim. Either name one or two associations the Institute is in conversation with, or remove the line until it is concrete. A CRO will read "in progress" as "no."
- **MEDIUM — FAQ item 7 (refund): "Finish Module 01 and its first exercise. Within fourteen days of enrollment, ask for a full refund. No exit interview."** Strong, specific, honest. Keep.
- **MEDIUM — The Pillar 01/02/03/04 (Awareness · Understanding · Creation · Application) labels appear in the curriculum block.** Per CLAUDE.md the 4-pillar structure is content frame only, not visual grammar. Confirmed not branded as a pillar product. Fine.
- **MEDIUM — "You must be signed in to enroll. Sign in to enroll"** above the Stripe CTA is a friction point. The text doesn't explain why sign-in is required (it ties the enrollment to a Supabase row for course access). One line: "Sign in so we can link your enrollment to your dashboard" would convert better than the bare instruction.
- **LOW — "$199 at 10+ seats"** team pricing visible on the page. Good.

### 10. `/my-toolbox` — Verdict: best demo of "show the artifact" on the site; one buzzword hit

The page does the showing-not-telling work well. The full KYC Refresh prompt is rendered verbatim with inputs, outputs, review checklist, and a "Last reviewed: 2026-04-18 · Reviewer: Lisa M." attribution. The six-category structure (Prompt Library / Workflow SOPs / Risk Checklists / Role Playbooks / Skill Builders / Reference Cards) maps to what a banker actually wants. Reference Cards specifically calling out "SR 11-7 in 1 page" and "AIEOG Lexicon" is the kind of artifact that justifies the price.

- **HIGH — "A working kit, not a PDF graveyard"** and "The work product, not the white paper" are the two best one-liners on this page. Keep both and use the second on `/education` too.
- **MEDIUM — "AI Banking Institute — Turning Bankers into Builders"** is the page title — good. But the eyebrow/breadcrumb reads "Toolbox preview · 18 sample assets · Demo" — the word "Demo" is correct but a banker may parse it as "this is a salesperson's mockup." Recommend "Preview · sample assets" without the "Demo" tag.
- **MEDIUM — "Tagged by role, ready to copy"** in the categories intro is good but "ready to copy" is a low-trust verb for examiner-aware buyers; "ready to use" or "ready to adapt" reads more institutional.
- **MEDIUM — "Each one has tested craft and a review checklist baked in"** — "tested craft" is internal jargon. A banker doesn't know what "tested craft" means. Recommend "drafted by practitioners and validated against a review checklist."
- **LOW — Per the copy audit there are 4× "unlock" hits in the underlying PromptCardsExperience.** Not directly visible in this fetched HTML but called out in the audit as a banned-word block. Reconfirm.

---

## Buyer-journey gaps

The trust ladder is mostly intact but breaks at two specific rungs:

| Rung | From | To | Status |
|---|---|---|---|
| 1 | Home | Free assessment | **OK** — clear path, accurate price |
| 2 | Free assessment | $99 In-Depth | **Soft break** — `/assessment` step-2 promises "no email gate," then the actual flow gates at step 13. The contradiction lives at the rung where the buyer first commits trust. |
| 3 | $99 In-Depth | $295 Course | **Hard break** — `/courses/foundation/program/purchase` drops the "examiner respects" line and the regulatory frame. A buyer arriving from In-Depth has been sold on examiner-readiness; the purchase page does not reinforce it. |
| 4 | $295 Course | Institutional engagement | **OK** — `/for-institutions` carries the full anti-positioning and the five-step spine. Sizer is excellent. |
| 5 | Institutional → Briefing | Calendly booking | **At-risk** — `/briefing-preview` hardcodes Calendly URL twice per the copy audit. If those dead-link, the entire ladder collapses at the final rung. |

Two cross-page issues compound:

- **Anti-positioning ("No software seats. No vendor lock-in.")** appears on `/for-institutions` and `/security` but not on `/`, `/assessment`, `/education`, or `/courses/foundation/program/purchase` — i.e. it is missing on every page where the buyer is comparing AiBI against alternatives.
- **Examiner-readiness frame ("credential your examiner respects" / "examiner-ready PDF" / "examiner-ready out of the box")** appears on `/`, `/education`, `/assessment`, and `/for-institutions`. It is missing on `/courses/foundation/program/purchase` (the actual conversion page) and inconsistent on `/security` (which uses "examiner readiness" as a chapter title but not as a sales frame).

---

## Compliance signal inventory

A compliance officer scans for named frameworks the way a creditor scans for collateral. Here is what they find:

| Page | SR 11-7 | TPRM | ECOA / Reg B | AIEOG | FDIC | GAO-25-107197 | BSA/AML |
|---|---|---|---|---|---|---|---|
| `/` | — | — | — | — | — | — | — |
| `/about` | named | named | named | named | 8,400 (FDIC+NCUA) | — | — |
| `/assessment` | — | — | — | — | — | — | — |
| `/education` | — | — | — | — | — | — | — |
| `/security` | named (lede) | named (lede) | named (lede) | named (lede) | — | — | — |
| `/for-institutions` | — | — | — | AIEOG term used ("AI use-case inventory") but unattributed | — | — | — |
| `/research/ai-governance-without-the-jargon` | full chapter | full chapter | full chapter | full chapter w/ 6 terms | — | named (lede) | full chapter |
| `/research/what-your-efficiency-ratio-is-hiding` | named | — | — | — | named × 2 (CEIC, QBP Q4 2024) | — | named |
| `/courses/foundation/program/purchase` | — | — | — | — | — | — | — |
| `/my-toolbox` | named (in 1 reference card) | — | — | named (in 1 reference card) | — | — | — |

**Pages that should but don't carry compliance signal:** `/`, `/assessment`, `/education`, `/courses/foundation/program/purchase`. Three of those are conversion pages.

---

## Top 5 highest-impact fixes (ranked)

| # | Fix | Where | Effort |
|---|---|---|---|
| 1 | Add "Earn the AiBI-Foundation credential your examiner respects" to the hero block on `/courses/foundation/program/purchase`, and restate the H1 to "AiBI-Foundation" (canonical credential token). Single highest-leverage trust move on the site. | `/courses/foundation/program/purchase` | 30 min |
| 2 | Fix the `/assessment` step-2 line "Inline, no email gate" — it actively misleads at the front of the funnel. (Already P0 in the copy audit; re-listing because of the buyer impact.) | `/assessment` | 15 min |
| 3 | Add "No software seats. No vendor lock-in." anti-positioning to `/`, `/education`, and `/courses/foundation/program/purchase`. Three lines of copy that recover the load-bearing differentiator on the three conversion pages where it is currently absent. | three pages | 30 min |
| 4 | Add one sourced compliance-frame line ("Curriculum maps to SR 11-7, TPRM, ECOA/Reg B, and the AIEOG AI Lexicon") to `/`, `/assessment`, `/education`, and `/courses/foundation/program/purchase`. Each page becomes board-forwardable. | four pages | 45 min |
| 5 | Recast the two SaaS-voice section heads on `/` ("Inside the platform / One command center" → "How the Institute is laid out / One starting view"), and remove "Demo" from the `/my-toolbox` breadcrumb. Closes the residual "is this just another vendor?" read. | two pages | 20 min |

**Total estimate for the top 5: ~2.5 hours of copy edits.** All five compound: the same buyer is comparing trust signals across pages on a single session.

---

## Closing read

The redesign-mockup-system branch reads as the product of an Institute that has done the regulatory reading. The two research articles, `/about`, `/security`, and `/for-institutions` would survive a board forwarding. `/my-toolbox` shows the artifact at the altitude this audience expects. The conversion pages — `/`, `/assessment`, `/education`, `/courses/foundation/program/purchase` — drift toward SaaS register and drop the compliance signals that the rest of the site has earned the right to lean on. The fix is not new content; it is propagating the language that already works on the other half of the site onto the half where the money changes hands.
