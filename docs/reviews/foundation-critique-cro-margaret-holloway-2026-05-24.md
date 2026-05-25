# Foundation Course Critique — Margaret Holloway, CRO, Cascade Community Bank ($1.2B)

**Reviewer profile:** 26 yrs banking · former FDIC examiner (8 yrs) · CRCM · ICBA risk committee · oversees 14-person risk/audit team at a $1.2B, 14-branch Pacific NW community bank
**Reviewed:** all 24 lessons (M0.1 → M5.5) + post-M3 gate · risk_compliance track variants · 2026-05-24
**Methodology:** Walked every lesson via the dev server at localhost:3000 and pulled body_md from `addie.lessons` and `addie.lesson_track_variants` for the risk_compliance track. Applied SR 11-7, FFIEC IT Handbook, the Interagency TPRM Guidance (Jun 2023), OCC Bulletin 2023-17 on third-party risk, the AIEOG AI Lexicon (Feb 2026), and standard UX heuristics (Nielsen, Sweller cognitive load, NN/g onboarding, WCAG 2.1 AA).

---

## Headline (3 bullets)

- The free side (M0–M3) is the strongest banker-facing AI orientation I have seen — short, sourced, and refreshingly free of the "AI-powered transformation" cant that has wasted my staff's time for two years. I would put my 14-person risk/audit team through M0–M3 tomorrow.
- The paid side (M4–M5) is honest about what it is — a builder ramp — but at a $1.2B community bank the "builder" rung is exactly where my governance program needs a fence, not a ladder. M5.4 sends learners to four named vendor tools without one paragraph on third-party risk, MNPI exposure on prototype hosts, or my model risk inventory obligations.
- The course conflates "data discipline" with "AI risk management." The single rule in M0.2 — never paste customer data — is necessary and well done, but it is roughly 12% of what an examiner expects from an institution running staff-built AI workflows. If we deploy this course alone, my staff will leave thinking they understand the rules. They will not.

---

## What works (specific, with lesson IDs)

- **M0.2 — "Describe the situation, not the person."** This is the single most useful sentence in any AI training I have reviewed. The side-by-side `[case:bad]` ("Customer Jane Doe, account 4471, balance twelve hundred dollars…") and the `[case:good]` rewrite are exactly the muscle a teller, an MSR, or a junior compliance analyst needs. The follow-on warning that *"This course's sandbox blocks sensitive paste. Real tools do not."* is honest about the training-wheels problem and earns trust.
- **M1.1 — "predictive token engine."** Three properties (training cutoff · no live knowledge · hallucination as a property) is the right mental model for non-technical staff. The phrase "Hallucination is a property, not a bug" pre-empts the most dangerous misconception I see in my shop: that the model has guessed *wrong* this time and would normally guess *right*.
- **M1.4 — `[case:bad] Letting the model invent a citation.`** Calls out fabricated regulatory citations in board memos — the exact failure mode I have already caught twice in the last six months. Pairing it with "Go fetch the live text — SR 11-7, OCC bulletins, Reg E — always" is correct.
- **M2.1 — SSO routing call-out.** *"Once you have clicked 'Continue with [institution]' the account is wired to your employer. Read the screen."* This is the kind of granular, operational detail I cannot get an enterprise GRC trainer to put in writing. Useful.
- **M3.1 — Role · Task · Context · Format.** A taxonomy that maps to how a compliance analyst already writes — audience first, then constraints. The `[warn]` on context being "where data-discipline breaks" is correctly placed.
- **M3.4 — Banking no-nos drill.** The borderline cases (SAR-number-visible-in-second-sentence; vendor proposal marked Confidential) are well chosen. The MNPI warning at the end — *"passing data-discipline does not make a use case safe"* — is the single most regulator-aware sentence in the course.
- **Risk & Compliance track variant on M0.2** explicitly names *exam findings, MRAs, MRIAs, SAR/BSA filings, draft narratives, audit workpapers, control test results, supervisory communications* as off-limits. That list is closer to right than anything else in the course. It would survive an exam interview.
- **The gate copy** ("No countdowns, no scarcity. … There is no cohort opening soon.") is institutionally credible. Trust signal. Keep it.

---

## What's weak or wrong — Foundation gaps for my team

- **(severity: high) — "Public material" is treated as a binary, not a process — M0.2, M2.3, M3.1.** M2.3 tells the learner to "give it a public passage as context (optional) — interagency advisory paragraph, public CFPB summary, another bank's press release." At Cascade, even public material from CFPB goes through a controlled channel before it leaves my staff's workstation as part of an analytical artifact, because *what we ask about* a public document can itself reveal supervisory posture or pre-decisional thinking. The course nowhere acknowledges that institutional approval gates exist between "the document is public" and "I can paste it into a consumer LLM and ask my question." This is the gap most likely to produce an exam finding for a learner who completes the course and goes back to work confident.

- **(severity: high) — No mention of SR 11-7, FFIEC, or the AIEOG lexicon inside the actual lesson body — all 24 lessons.** SR 11-7 is named only in the gate marketing copy ("The rules align with SR 11-7") and the m1.4 case-good narration. The course never explains that the assistant's outputs are themselves "model" outputs under most examiner readings of SR 11-7's effective-challenge and inventory requirements, and that a saved "Skill" in M4 — used recurrently to draft member-facing or board-facing text — is exactly what my model risk function has to inventory and validate. A learner who walks out of M4 having built ten "Working Skills" has just created ten unvalidated models. The course does not say this.

- **(severity: high) — M5.4 sends learners to Lovable / Replit / v0 / Claude Code with no third-party risk frame.** *"Builders will sometimes suggest 'a sample of real customer data.' Answer: no. Synthetic. Always."* is correct but insufficient. Under the Interagency TPRM Guidance (Jun 2023) and OCC Bulletin 2023-17, my institution owes vendor due diligence on each of these platforms before any staff member uses them with *any* institution-derived material — including a PRD that names internal teams, business processes, or non-public product directions. The course treats "synthetic data" as the whole control. It is one control.

- **(severity: high) — "Working Skill" naming convention will fail under examination — M4.3.** The lesson tells the learner: *"Not at that bar? Say so in the name ('draft, needs one more pass'). The Toolbox does not judge; clarity does."* In an exam, an MRA writer does not care what the Toolbox judged. They care that there is no version history, no approver, no validation evidence, and no documented use boundary on an artifact a learner is recurrently running against rule text. The course should either (a) brand these as personal sandboxes that may not be used on member- or regulator-facing work without institutional governance, or (b) provide a governance frame for the Toolbox itself. It does neither.

- **(severity: med) — "Hallucination" is taught but verification discipline is not — M1.1, M1.4.** *"Read every output like a loan file. Verify citations."* sounds right but is two sentences long across the whole course. My staff need to know: do they verify every claim, or only load-bearing ones? Against what — the source provided, the original regulation, or both? With what evidence retained? The course teaches the failure mode (fabricated citation) without teaching the protocol. A learner will read this as "be careful" and not as "here is the four-step verification you owe before a model output enters a workpaper."

- **(severity: med) — MNPI is named once, in M3.4 — and never defined.** A compliance analyst will know what MNPI means. A teller, an MSR, or a marketing coordinator on the same course will not. The MNPI warning is the most important non-PII control in the course; it deserves its own card with a plain-English definition (non-public material whose disclosure could move markets, harm members, or pre-empt a regulator) and three concrete community-bank examples (M&A discussion, pending product launch, exam matter under negotiation).

- **(severity: med) — "BSA officer" usage is wrong in M5.2 — risk-track sounds off.** The M5.2 example reads *"Transfer to BSA officer?"* as a workaround for a teller hold question. A BSA officer at a community bank handles suspicious-activity work; teller-hold questions route to deposit operations or the branch manager. Small thing but the kind of detail a 25-year banker notices and that erodes trust in the whole curriculum.

- **(severity: med) — The risk_compliance M1.3 audio script overclaims "governance fluency."** *"Three: the governance question lands on your desk."* — then promises that "when an examiner asks how your institution evaluates generative AI vendors under the Interagency TPRM Guidance, or how staff are trained on data discipline, you have answers grounded in the same tools your colleagues are using." A course built around the consumer Claude/ChatGPT chat surface does not in fact prepare a CCO to answer that examiner question. It prepares them to answer "how do your staff use these tools personally." Those are different questions. The marketing voice is writing a check the curriculum cannot cash.

- **(severity: med) — M2.2 "Embedded copilot" treatment is too soft.** *"Confirm with IT before trusting any copilot with internal documents."* understates the issue. M365 Copilot reads everything the user has access to under Microsoft Graph — including SharePoint sites the user forgot they were on. The licensing-vs-tenant problem the lesson hints at is actually a data-leakage and access-review problem that I would not let an MSR resolve "with IT" alone.

- **(severity: low) — M3.3 chain-of-thought pattern.** Useful for analytical work; risky for member-facing drafts because it produces preamble that occasionally surfaces internal reasoning the bank would not want disclosed. The `[warn]` about how to suppress preamble is good; what is missing is a note that *the model's reasoning trace is itself a draft you have to read before deleting* — there have been cases where the preamble named a fabricated internal policy that the final output assumed as fact.

- **(severity: low) — M5.1 agent treatment is honest but the framing is inconsistent.** It correctly tags agents `[case:bad]` and warns "not yet ready for member-facing flows." Then immediately tells learners that agents are *"Useful for internal prototypes; never on systems of record without a real review point."* The "internal prototypes" carve-out is exactly where staff will rationalize building unreviewed agents against shadow data. Tighten this.

- **(severity: low) — No mention of consumer-tool data retention.** Claude.ai, ChatGPT consumer, and Gemini consumer all retain inputs for training (default) unless the user opts out per-tool. The course never tells a learner to check that setting. A "public passage" pasted into a consumer tool that trains on it is no longer a leakage problem, but the bank's *frame* around a public document — the question we asked, the constraints we set — is itself proprietary process. Course should at minimum point to the per-tool opt-out toggles.

---

## UX findings (modern UX principles)

- **(Mental model, Norman) — finding — M0.1, M0.2, M1.1 — the metaphor "treat the model as a sharp new analyst who started this morning" is the best one-line mental model in the course (M3.1). It should land in M0.1, not in M3.1, because it shapes everything before it. Move it forward.**
- **(Progressive disclosure) — finding — M3.4 (Banking no-nos drill) is gated behind M3.1–M3.3 in nav order, but a learner who only does the drill gets 80% of the safety value with 20% of the cognitive load. Surface a "skip to the drill" affordance for time-pressed managers; this is the lesson I would put in front of an officer who has fifteen minutes.**
- **(Cognitive load, Sweller — intrinsic vs extraneous) — finding — M3.3 lists *five* prompt patterns with overlapping use cases. Five is past the working-memory limit (3–4) for first exposure. Pattern 4 (Constraints) and Pattern 1 (Role+Task+Format) are operationally indistinguishable to a learner who has not yet built a skill. Collapse to three patterns or visually demote two as "advanced — see M4."**
- **(Information scent, Pirolli) — finding — Gate page CTA "Pay $295" and "Save my work" share visual weight, but the third option ("Take the assessment · $99") is buried as link text inside a card. A CRO making a buying decision for 14 seats cares most about the institutional ($199/seat, 10 min) lane — it is correctly present but the scent from M3.5 → gate does not predict it; M3.5 only mentions "the three-way gate" while the gate is in fact four-way (continue / save / assess / team). Reconcile the count.**
- **(Recognition rather than recall, Nielsen) — finding — M4.3's "track default" badges are good. M5.3's nine PRD sections are listed once and then never re-surfaced in M5.4's prototype build. Learner has to recall the sections while pasting their PRD into Lovable. Carry the PRD section list into M5.4 as a docked reference.**
- **(Feedback loops) — finding — M3.4 drill has after-answer feedback ("Strong calibration on PII; revisit borderline cases…") — exactly right. M2.3 sandbox does not have any rubric for *"did the response I got back actually meet the brief I gave?"* — the learner is told to "read slowly" but not what to read for. Add a 3-question check ("Did it answer the audience? Did it stay in length? Did it invent anything?").**
- **(Trust signals) — finding — M1.4 cites *FDIC Quarterly Banking Profile, Q4 2024* inline on the efficiency-ratio stat. Excellent. No other quantitative claim in the 24 lessons carries an inline citation. The "15-minute lessons" / "twenty minutes, not an hour" / "half a day's work, compressed to twenty minutes" claims are credible but unsupported; a CRO presenting this to a board will be asked where these came from.**
- **(Onboarding, Whitenton/NN/g) — finding — M0.1 establishes course shape (6 · 24 · <15m) but never tells a non-technical learner what to do if a lesson breaks (sandbox not responding, save failing, model down). The course has no visible escape hatch. A teller who hits an error at M2.3 and cannot ask anyone is gone.**
- **(Hick's law) — finding — M5.4 presents four prototyping tools (Lovable, Replit Agents, Claude Code, v0) with one-line descriptions. For a banker, four is too many — the right count is one with two alternatives clearly labelled "if you already use X." The "match to your PRD" indicator helps but is invisible until the learner has a PRD; reverse the flow.**
- **(Accessibility, WCAG 2.1 AA) — finding — Cannot evaluate fully without keyboard/screen-reader walk-through, but the rendered gate page has good landmark structure (`<main>`, `<nav aria-label="Foundation Course">`, `aria-current="page"`) and the reading-progress bar carries `role="progressbar"` with min/max/valuenow. One concern: the `addie-chip` (track switcher) is `aria-haspopup="dialog"` with `aria-expanded="false"` — the chip label "Track" should announce the *current* track too, not just the affordance.**
- **(Aesthetic + minimalist design, Nielsen) — finding — the Ledger aesthetic (parchment, mono caps for metadata, no shadows) communicates "consulting materials, not SaaS" exactly as intended. This is a trust win with a CRO audience. Keep.**
- **(Error prevention) — finding — M2.3 says "the sandbox blocks paste of account-number / SSN / full-name patterns." Good. Then M4.2 says "the runner enforces the same PII screen." Good. Neither tells the learner what the screen actually catches and what it does not. A learner who tests the limit by pasting a fake-but-realistic record gets blocked and trusts the screen too far. Show the regex shape (last-4 patterns, SSN-shaped numbers, account-number-shaped numbers) explicitly.**
- **(User control + freedom, Nielsen) — finding — Saved artifacts can be "versioned" (M4.2) but the course never shows how to roll back, diff, or delete. Learners who save a skill they later regret have no documented exit. For a CRO this matters: an artifact a staff member created and "saved" is now an institutional record under our records-retention policy.**

---

## Track-variant review (risk_compliance)

The risk_compliance variants are the strongest evidence the course's authors talked to people who work in a compliance shop. Specific reactions:

- **M0.2 risk variant** correctly names MRAs, MRIAs, SAR narratives, supervisory communications. This list is the right floor. I would add: *findings-tracker entries even in summary form*, *open audit issues prior to management response*, and *internal investigation work product under privilege*. The current list reads as if it were drafted from FFIEC-handbook headings; the additions come from the operational reality of a 14-person risk shop.
- **M1.3 risk variant audio script** is well-written and lands the three observations cleanly. The overclaim I noted above ("governance fluency" sufficient for an examiner question about TPRM) is the only real flaw.
- **M2.4 worksheet for risk_compliance** is the most useful worksheet in the course. The seventh field — *"One thing I would never put through any AI tool, no matter how convenient"* — is a control I would adopt as a written attestation from every staff member who completes the course. Lift this concept.
- **M3.5 risk variant** correctly identifies the under-prompted-document problem (plain-English regulatory summaries that never get written because the people who could write them are absorbing the rule). The starter prompt — "You are a compliance analyst at a community bank. Summarize the Reg E change below for branch tellers…" — is one I would put in production tomorrow.
- **M4.3 risk variant ("Reg-E summarizer skill")** is the clearest articulation in the course of what a "skill" actually delivers. This is the lesson that justifies the paid tier for my compliance team. Specifically.
- **What is missing in the risk track:** zero coverage of the BSA Officer's specific use case (typology research, SAR narrative drafting from anonymised facts, customer-risk-rating documentation language). Zero coverage of CRA documentation language. Zero coverage of fair-lending letter drafting. The track defaults to "Reg-E summariser" everywhere, which serves about half of my team.

---

## Gate experience (post-M3, three-way fork)

Counted four options on the rendered page, not three. The lessons (M3.5 `[warn]` and M0.1 narration) describe it as three-way. Reconcile the count.

On its merits:

- **Pacing:** Correct. M3 ends with the Starter Prompt Pack and the gate appears immediately. A learner who built three working prompts has earned the right to decide. The "no countdowns, no scarcity" copy is the right tone for a community-bank CRO audience that has been pitched too many fake deadlines by core-banking vendors.
- **Pricing legibility:** $295 single learner / $199/seat × 10-seat minimum / $99 assessment. Legible. The $199/seat math ($1,990 minimum) is in the range I would approve from discretionary training spend without going to the CFO; that is good product design.
- **What is missing from the gate:** A clear statement of what the institutional tier *does not* include. Specifically: per-seat learner content (their saved prompts, conversations, skill artifacts) — *is it visible to the institutional admin or not?* The gate copy says *"privacy-respecting, no learner content exposed"* — good — but my procurement team will want this in writing in a BAA or DPA before I can sign. The course should link to its data-processing terms from the gate.
- **The "Save my work" option** is the right escape hatch and reads as honest. Keep it.

---

## Paid modules (M4 + M5) — would you pay $295 to put 14 staff through this?

**Short answer: I would pay $295 × 14 = $4,144 for M0–M4 if M4 carried a governance overlay, and I would refuse to send the team through M5 as a unit.**

**M4 — Skills:**

- M4.1's framing ("locked choices + input slots") is correct and useful. A parameterised prompt is exactly the right operational unit.
- M4.2's four-step builder (Source · Lock choices · Name slots · Save) is well-paced.
- **Problem:** the entire M4 sequence is silent on the model risk inventory implications. A "Working Skill" saved by a compliance analyst that runs recurrently against Reg E updates and feeds language into board-readable summaries is, under any reasonable reading of SR 11-7, a model. We owe it identification, validation, ongoing monitoring, and a documented owner. M4 builds the artifact and walks away.
- **Fix:** add a Module-end card before the M4 → M5 hand-off that says, in plain English: *"If a skill you built will be used recurrently to draft material that leaves your desk, tell your model risk or compliance leadership before you put it into production. Saved here is not the same as approved there."*

**M5 — Prototypes:**

- M5.1's honesty about agents (drift, plausible-wrong steps, "not yet ready for member-facing flows") is the best agent treatment I have seen in a bank-targeted course.
- M5.2's problem-framing worksheet is good consulting craft.
- M5.3's PRD section is genuinely useful and rare — most bankers cannot brief a builder.
- **Problem with M5.4:** the course sends a 25-year compliance officer who has never written code to Lovable / Replit / v0 / Claude Code with a PRD that names internal teams, business processes, and recurring pain points. Those PRDs *are* institutional information. The course's only control is "synthetic data only" — which addresses customer data and not the institutional-knowledge leak. A PRD pasted into Lovable that describes our internal hold-resolution workflow is now a trade-secret problem.
- **Would I let my 14-person team build prototypes in M5? No.** I would let a small, named, governance-aware subset (the CCO, the model risk lead, and possibly the BSA officer) work through M5 as research, with the explicit understanding that any prototype that leaves the course requires a vendor-onboarding workflow before it sees institutional material.

**Net:** $295 for M0–M4 with a governance addendum is fair. M5 needs an institutional-tier track that explicitly walks through TPRM onboarding of the prototyping vendor *before* the build step. Today it does not.

---

## Verdict: should Cascade Community Bank deploy this?

**Yes for M0–M3, conditionally for M4, no for M5 — as currently scoped.**

**What I would do tomorrow:**
1. Roll M0–M3 to all 220 FTEs as required training, paired with a one-page Cascade-specific addendum that names our approval channel for any AI use beyond the four `[case:good]` patterns the course teaches. Estimated cost: zero (free tier). Estimated value: high — the data-discipline rule and the banking no-nos drill are worth the deployment by themselves.
2. Pilot M4 with the 14-person risk/audit team at $295 × 14 = $4,144, paired with a Cascade governance overlay that pre-stages the model-risk-inventory question. Re-evaluate after one quarter against actual saved skills and whether they are being used as we expected.
3. Do not deploy M5 as a team curriculum. Send the CCO and the model risk lead through M5 individually as professional development. Treat any prototype that emerges as a vendor-onboarding event, not a course completion.

**What I would tell the course authors:**

The free side is the best banker-facing AI orientation I have reviewed in two years of being pitched them. The paid side is honest, well-paced, and well-written — and that is exactly what makes it dangerous if a bank deploys it without an institutional governance overlay. The course teaches *use* and gestures at *governance*. At a community bank our size, those are not the same lesson, and the next examiner cycle will not grade them on the same curve.

Add a Module 6 — "How to govern what you just learned to build." I would pay for that one too.

— **Margaret Holloway**
   Chief Risk Officer, Cascade Community Bank
   2026-05-24
