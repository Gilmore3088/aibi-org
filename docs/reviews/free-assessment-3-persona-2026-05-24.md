# Free Readiness Assessment — three-persona walk
**Reviewed:** http://localhost:3000/assessment + result page + email gate · 2026-05-24
**Reviewer:** three banker personas, in turn
**Code under review:** `src/app/assessment/page.tsx`, `_components/QuestionCard.tsx`, `_components/EmailGate.tsx`, `_components/ResultsViewV2.tsx`, `_lib/useAssessmentV2.ts`, plus `content/assessments/v2/{questions,rotation,scoring,personalization}.ts`

---

## Janelle Brooks · VP Ops, Sunflower FCU ($340M)
**Mode:** mobile · Panera lunch · 18 minutes available, 12 if she also eats

I clicked the link in Tina's LinkedIn share. The page loaded fast — clean, beige, no popup, no chat widget shoving its face at me. That alone bought maybe ten seconds of patience back. The first thing I saw was a hairline-ruled question card with a tiny "01 / 12" in the corner and a kicker that just said `current-ai-usage` in lowercase, hyphens and all. That looked unfinished. I don't know what "current-ai-usage" is supposed to mean to me as a kicker — is that a category header? A bug? It reads like a developer left a slug in there. A small thing, but on mobile it's the first label my eye lands on. Either title-case it ("Current AI Usage") or hide it.

The first question was **"How are your staff currently using AI tools in their daily work?"** Four options stacked. I read the bottom one first because I always do that — and the bottom one was **"AI tools are integrated into daily workflows across most functions with clear use cases."** No. That's not us. The top one was **"We have not introduced AI tools and staff are not using them in any official capacity."** Also not really us — a couple of my lenders are quietly using ChatGPT on their phones and we both know it. So I picked the second one. The card auto-advanced. I appreciated that. No "Continue" button to hunt for with my thumb.

Then I noticed: **the kicker for every question I got was different.** Question 2 was about leadership-buy-in. Question 3 was experimentation-culture. Question 4 was security-posture and said the words **"SR 11-7"** in the answer text — I have never heard of SR 11-7. That stopped me. I sat there for a second wondering if I was supposed to know that. The wording was: *"We have a governance framework aligned with SR 11-7 and TPRM guidance, reviewed regularly."* I have no idea what that is. There's no tooltip, no "(model risk management guidance)" gloss. I picked option 1 ("no formal guidelines") because that was safe, but I felt a little dumb for it, which is the wrong feeling at question 4 of a sales-funnel diagnostic.

By question 6 the questions were getting long. The fair-lending one — **"How does your institution address fair lending risk in AI-assisted processes?"** — has answers that each run to about 20 words. On the iPhone the whole card barely fits. I had to scroll inside the card to see option 4. Which means it's not actually one-question-per-view on mobile. The promise of the design — the editorial calm — breaks here. Each option's serif text is too big for what it's carrying.

The progress bar is a thin line at the top. I knew I was making progress but I had no number; I had to remember the "06 / 12" in the corner. Fine for me but a more anxious person would have wanted a "halfway there" cue.

I tested what happens if I navigate away. I tapped the URL bar, opened a new tab, came back. **Good news: my answers were still there.** I was on Q7 when I came back. That's table stakes but it worked, and on mobile that matters because Safari kills background tabs all the time.

I tested **going back**. The footer has a "← Back to question 06" link in tiny text. I tapped it. It worked, my answer was still selected. Fine.

I finished in roughly six minutes — longer than three, much shorter than the eight a tear-off magazine quiz would take. Most of that was reading the answer text. The questions themselves are well-written, but they're written for a CFO, not me. A few felt like they were asking the same thing in different words (Q4 about staff tracking and Q5 about review documentation are basically the same question wearing different hats).

Then the score page. Big serif headline: **"Your readiness report is *ready.*"** Cute. Then a paragraph telling me to enter my work email to see "score, tier, eight-dimension breakdown, and a starter artifact keyed to your weakest area." Below that, a two-column box. Left column showed a fake bar chart with labels "Awareness · Use cases · Governance · Data · Skills · Vendor · Comms · Roadmap" with a footer that says *"Sample only — yours will reflect your actual answers."* Right column had the form.

Two things stuck out.

One — the left-column dimension labels (**Awareness · Use cases · Governance · Data · Skills · Vendor · Comms · Roadmap**) are NOT the same names as the dimensions the questions were drawn from (Current AI Usage, Experimentation Culture, AI Literacy Level, Quick Win Potential, Leadership Buy-In, Security Posture, Training Infrastructure, Builder Potential). They're using two different taxonomies in the same product. As a reviewer my B.S. detector pinged: if your sample dashboard shows eight dimensions and your real report shows eight different dimensions, somebody on this team is shipping two versions of the truth. Pick one.

Two — the email gate is honest. The TrustStrip across the bottom says *"No surprise sales calls. Briefings happen by request only. We will not cold-call your line."* That's the right trade for what they're asking. I gave them a gmail address. It scolded me, gently — said add your institution name and a personal email works too. I added "Sunflower Federal Credit Union" and resubmitted. No drama.

The report rendered inline. No "check your inbox." Good. The score ring spun in. Tier said **Early Stage**. Headline said **"You are experimenting but not yet coordinated."** That is exactly correct. Then a "big insight" black-card pullquote, an "implications in operating terms" three-row table (Operational efficiency / Risk management / Cost & dependency), a strengths-vs-gaps chart, and a starter artifact at the bottom.

The starter artifact is the moment of truth. Mine was a markdown deliverable for my weakest dimension. It was real — it was a copy-paste-ready one-pager I could actually use. That's the only part of this whole flow that I'd take screenshots of and send to my CFO. If the rest of the report were as honest as the artifact, the whole funnel would convert.

The closing CTA was three buttons: **"Enroll in AiBI-Foundation · $295"** primary, **"Or take the In-Depth Assessment · $99"** secondary, **"Request an Executive Briefing"** tertiary. Honest stack — no upsell theater. I would not click $295 today. I would click $99 if it gave me the same artifact for all eight dimensions instead of just one. The hook for that isn't on the page.

**Friction list (in order of severity):**
1. Lowercase-hyphenated dimension slugs at the top of every question card — reads as developer leak.
2. SR 11-7 / TPRM / ECOA appear in answer text with no gloss.
3. Long answer text overflows the card on iPhone 13; have to scroll inside the card.
4. Two dimension taxonomies in one product (sample dashboard ≠ real dashboard).
5. No estimated time. "12 questions, ~5 minutes" on the entry would have helped.

**Trust verdict:** Earned it. Loses some points on the SR 11-7 jargon and the dual taxonomy, but the trust strip and the real starter artifact carry it.

**Conversion:** $295 today, no. $99 maybe, if the page told me what's different about it. As written, the secondary CTA is undifferentiated from the primary — both Sound Like Effort.

— *Janelle Brooks*

---

## Russell Chen, Esq. · GC, Pacific Heritage Bank ($1.8B)
**Mode:** iPad · post-conference, office, 9:42 a.m. · triangulating a vendor pitch

I just sat through a 50-minute conference talk where someone used "AI-powered" eleven times and never once mentioned SR 11-7 or ECOA. I want to see if these people are real. I went to AIBankingInstitute.com, found the assessment link, clicked through. The dev environment apparently uses gmail-friendly URLs — fine.

First observation: **the question pool is competent.** I'm reading the v2 questions file as I take it. There are 48 questions across eight dimensions, six per dimension, with four-point Likert answers. The wording on the security-posture and leadership-buy-in dimensions is particularly clean. **Question sp-01** — *"Does your institution currently have an AI governance framework or staff AI use guidelines?"* — has four options that move cleanly from "no formal guidelines; staff use of AI tools is unrestricted and untracked" to "aligned with SR 11-7 and TPRM guidance, reviewed regularly." That is a properly calibrated maturity scale. Whoever wrote these has read the GAO-25-107197 and the AIEOG Lexicon and the FFIEC TPRM guidance. They know who SR 11-7 is. Good.

Now my concerns.

**Concern 1: rotation logic is selecting a 12-question slice from a 48-question pool, and the sampling design is not what the dashboard claims.** The rotation function (`content/assessments/v2/rotation.ts`) guarantees one question per dimension (8 questions, one each) and then takes four random from the remaining 40. So a participant always sees 8 dimensions but with **wildly uneven coverage** — one dimension contributes 1 question worth 1–4 points, another contributes 5 questions worth 5–20 points. The "eight-dimension breakdown" promised on the email gate is therefore not a measurement of eight equally-weighted dimensions. It's a measurement where one dimension is 1 question deep and another is 1 question deep and four others are also 1 question deep and two are 1 question deep. Wait, let me re-read. 8 + 4 = 12. So either two dimensions get 2 questions and six get 1, or one gets 3 and so on, drawn at random. **That means the dimension breakdown in the report is not stable across two takers from the same institution.** Two people at my bank could answer identically on the questions they share and get materially different dimension percentages because they each saw different supplementary questions.

For a free funnel, fine. For something marketed as a "diagnostic" with an "eight-dimension breakdown," questionable. Either run the same 8 + 4 every time (a fixed core set) or be honest in the copy that this is a directional snapshot.

**Concern 2: there's a fallback in the scoring function that fills any unrepresented dimension with `score: 0, maxScore: 4`.** I read `content/assessments/v2/scoring.ts` line 127 — *"Fill in any dimensions not represented in this session with zeros."* Combined with the rotation guarantee of one per dimension, this code path shouldn't fire — but it's there, which tells me the rotation contract isn't fully trusted by downstream code. If anything ever drifts in the rotation, the report will show "0/4 — Training Infrastructure" in red, frightening the participant about a dimension that simply wasn't asked. That's a latent reputational bug.

**Concern 3: the tier thresholds in the live code do not match the thresholds in `CLAUDE.md`.** CLAUDE.md still says *"Ready to Scale (28+) / Building Momentum (22–27) / Early Stage (15–21) / Starting Point (8–14)"* — those are the legacy 8-question thresholds, scored 8–32. The v2 code uses 12–22 / 23–32 / 33–40 / 41–48 on the 12–48 scale. The code is correct for v2. The project's source-of-truth document is stale. I'd flag this in a board review of any vendor.

**Concern 4: the "Where this goes" trust strip is good copy but underclaims.** *"Our records and your newsletter list only if you opt in. Never sold."* Better than 90% of what I see, but no link to a privacy policy, no retention window, no mention of MailerLite or Resend as sub-processors, no GLBA position. A community bank GC reviewing this for staff use will need that. Add a "Privacy and data handling" link.

**Concern 5: the assessment captures `firstName` and `institutionName` as "optional," but the gate then refuses submission if the email is a gmail address and institutionName is empty.** That's a soft requirement masquerading as an optional one. The error message is friendly and survivable; the form labels should match — change "Optional — helps us tailor recommendations" to "Required if using a personal email."

The walk itself: 12 questions in about 4 minutes 10 seconds. I read carefully. Three observations on the question writing —

*Construct validity.* The Builder Potential dimension is the weakest. Question **bp-06** asks: *"Would staff at your institution be willing to spend 30–60 minutes per week learning to build AI-assisted workflow tools?"* The respondent is being asked to predict the behavior of other people, which is a thin signal at best. The four options also slope downward in a way that invites acquiescence — option 4 is the "we already have a culture of staff-driven improvement" answer, which is unflattering to admit you can't choose. I'd replace this with a behavioral-evidence question ("In the past 90 days, how many staff have voluntarily attended an optional tech-learning session?").

*Anchoring.* Question 1 sets the maturity frame, and the four-option ladder is consistent across all 48 items: lowest maturity at top, highest at bottom. Predictable. Once a respondent sees that ladder twice, they're picking position-by-position rather than reading carefully. **The options should be randomized in display order within each question.** This is a one-line code change and would meaningfully improve the data quality.

*Acquiescence.* Option 4 across most questions is the socially desirable answer — formal policy, documented, version-controlled, board-aware. A respondent who wants to look good will drift up. The neutralizing move is to occasionally **reverse** an item — make option 1 the "good" answer for that question — so respondents can't pattern-match. None of the 48 questions does this. The data is therefore biased upward.

The report. The score ring animates. The tier and dimension labels are correct. The "big insight" black card is editorial and arresting. The financial-implications row labels (Operational efficiency / Risk management / Cost & dependency) are exactly what a CFO wants. The starter artifact is a meaningful deliverable — better than I expected from a free funnel. The closing CTA card promotes AiBI-Foundation at $295 with the In-Depth at $99 as secondary. The body copy on "starting-point" reads *"Your score says AI is already being used inside your organization without consistent training or guardrails."* This is a strong line. It assumes shadow IT, which is correct for ~90% of community banks. The body copy on "early-stage" is also fine.

The voice is calmer and more grown-up than I expected. The institution is hiding behind no acronyms. The brand rule from CLAUDE.md — *"In running prose, always use the full name The AI Banking Institute or the Institute"* — is honored in the report copy. The trust strip is honest.

**What I'd require before recommending this to my CEO:**
1. Fix the dual taxonomy (sample dashboard vs real dimensions).
2. Randomize option order within each question.
3. Add at least eight reverse-scored items across the 48 (one per dimension).
4. Document the sampling design somewhere visible — even a one-line footnote: *"Your report is built from 12 questions drawn from a pool of 48 across eight dimensions. Coverage varies; a deeper read is available in the In-Depth Assessment."*
5. Add a privacy policy link beside the email gate.

**Trust verdict:** Cautiously positive. The question pool is real. The rotation logic and the dual taxonomy are vulnerabilities that erode that.

**Conversion:** I would route this to our L&D lead. I would not book the briefing today; I would take the **In-Depth at $99** to see if the deeper instrument fixes the sampling concerns. If it does, then $295 for staff licenses becomes a conversation.

— *Russell Chen, Esq.*

---

## Marcy Olafsson · MSR, North Star CU ($480M), six weeks tenure
**Mode:** laptop at home · 7:30 p.m. · Devon said "see what this is"

OK so I opened the link Devon sent. The page is really pretty? Like a newspaper but a quiet one. There's a thin gold line up top that fills in as I answer. The first question said **"How are your staff currently using AI tools in their daily work?"** and I almost didn't answer it because I'm not "staff" in the sense of deciding what staff does, I'm staff that *is* staffed. I'm six weeks in. I'm a teller who got moved into MSR last week. I don't know what "staff" means in this question — does it mean "the people you work with" or "the people you manage"? I picked "A few individuals experiment on their own" because two of the lenders use ChatGPT but I think it'd be weird if I said nobody uses anything.

The next question was about **"Which departments have adopted AI tools for routine tasks at your institution?"** I don't know our department roster. I know the branch. I know the lenders by name. I know there's somebody in compliance because I once got an email from her. I don't know how many "departments" we have. I picked option 2 because it sounded least like a guess.

Then question 3: **"How often do staff use AI-generated outputs in customer-facing communications?"** I had to think really hard. Then I realized — I don't write customer communications, the lenders do, sometimes Devon does. I have NO IDEA. There was no "I don't know" option. There's no "skip." So I picked option 1, **"Never — we have a blanket prohibition or no awareness that this is occurring."** I'm not sure that's right. I just had to pick something to move on.

This is the thing that bothered me the most: **I felt like I was answering on behalf of the institution and I have been there six weeks.** Devon should be answering this. Or maybe whoever runs operations. I'm going to give him my answers but I want to tell him not to trust them because I made up like half of it. There's no question on the entry page that says *"Who at your institution should take this?"* or *"You'll answer this on behalf of your whole organization — make sure you have visibility into IT, training, governance, and lending."* That framing would have made me close the tab and forward it to Devon, which is probably what should have happened.

Question 4 was about hallucinations. **"Can your staff explain what an AI model hallucination is and why it matters for banking?"** I know what a hallucination is because TikTok told me. None of the other tellers do. I picked option 2 ("A few people, typically IT or compliance, understand it, but frontline staff do not"). That one felt like it fit.

A bunch of the questions used words I had to read twice. **"SR 11-7"** — no idea. **"TPRM"** — no idea. **"ECOA/Reg B"** — I think I had a compliance video about Reg B in onboarding? **"MRM inventory"** — no idea. **"hallucination risk and how to verify outputs"** — OK that one I get. There were six or seven phrases I didn't know. Not enough to make me quit, but enough that I felt like the test was for somebody more senior than me. Which it probably is.

Two of the questions were really long. The fair lending one took up almost my whole screen even on a 13-inch laptop. The training one with the four options about LMS systems and rollout speed — I don't know if we have an LMS. We have a thing called Symphony that I do trainings in. Is that an LMS? Idk.

I got to the end. The score page said **"Your readiness report is *ready.*"** and asked for my work email. My work email is m.olafsson@northstarcu.org. I gave it. I checked the newsletter box because honestly the design is calmer than most newsletters I see and twice a month is fine. I didn't notice a privacy link. I would have looked for one if Devon were doing this.

The report rendered. The number was **22** — Tier said **Starting Point**. Headline: **"You are at the beginning of your AI journey."** That is almost certainly not actually where my credit union is, but it IS where my data was. I was making most of it up.

The big insight card said something like "shadow AI use without guardrails." That sounded scary. The "implications in operating terms" section was three short rows — operational, risk, cost. The risk row used the words "examination findings" which felt grown-up. The strengths-and-gaps chart had eight bars and most of them were low because I picked option 1 a lot when I didn't know what to say.

The starter artifact at the bottom was a real document. Like, I could copy-paste it. It was for our weakest dimension (Security Posture) and it was a one-page draft of an AI Use Policy. **That part was actually cool.** I'm going to send THAT to Devon. He could read it in ten minutes and decide if any of it is useful for us.

The big buttons at the bottom — **"Enroll in AiBI-Foundation · $295"** primary and **"Or take the In-Depth Assessment · $99"** secondary. $295 is a lot for me personally. If Devon paid for it for the branch I'd take it. The $99 one is "more questions" basically, which I do not want to do again unless someone else is answering them.

**Things I wish the assessment had done for me, specifically:**
1. Asked me at the top **who I am** ("teller/MSR" vs "manager/exec" vs "L&D" vs "compliance"). Then either tailored the questions or told me politely *"this assessment works best when answered by an operations or compliance lead — would you like to forward it?"*
2. Had an **"I don't know"** option on every question, scored as missing rather than as option 1. Forcing me to pick option 1 dragged the institution's score down for things I just couldn't see from my desk.
3. Defined terms inline. Even a tiny **(?)** I could tap to see "SR 11-7 = federal model risk management guidance from 2011."
4. Estimated **how long it would take** before I started.
5. Told me **why my email matters** in plain words next to the form, not in the trust strip below. "We'll email you a copy of this so you can forward it to your manager" would have been perfect for me.

**Trust verdict:** I liked them. The design wasn't trying to sell me anything until the end. The artifact at the bottom was an actual thing. I'd send the link to Devon and tell him to take it himself.

**Conversion:** $295 I would not buy on my own. $99 I would not buy on my own. If Devon asked me to take the $99 version with him sitting next to me, sure. Honestly the artifact alone might be enough — I'd want to see what the In-Depth one's artifact looks like before paying $99 for it.

— *Marcy Olafsson*

---

## Joint synthesis (across all three personas)

### What works
- **The question pool is well-written.** Russell would defend the maturity calibration. The four-point ladders are internally consistent and the security/leadership dimensions in particular reflect real federal guidance (SR 11-7, TPRM, ECOA/Reg B, AIEOG Lexicon).
- **Per-question pacing is right.** Auto-advance on click, no "Continue" button, one prompt at a time, sessionStorage survives a tab kill. Janelle came back to her place after a tab swap. This is table stakes done correctly.
- **Editorial design holds.** Hairline rules, the gold progress line, the serif prompts, the mono "01 / 12" counter — these are not generic SaaS shapes. Russell respected it. Marcy noticed it without being able to name it.
- **The starter artifact is the load-bearing trust signal.** All three personas independently flagged it as the moment the assessment stopped feeling extractive. Janelle would screenshot it. Marcy would forward it. Russell would build a vendor evaluation around whether the In-Depth artifact set is as honest.
- **Email gate copy is unusually honest.** The TrustStrip ("Where this goes / What we store / No surprise sales calls") avoids the dark patterns that competing diagnostics use. The "personal email + institution name" soft-gate is gracefully done.
- **Tier-CTA discipline is right.** AiBI-Foundation $295 primary for tiers 1–3; Advisory primary for tier 4 (Ready to Scale). No tier hard-pushes the In-Depth. Honest ranking.
- **Mounting skeleton.** The pre-hydration skeleton at the top of `page.tsx` is a real thoughtful touch. On slow mobile, a blank screen reads as broken; the shape-matched placeholder doesn't.

### What's weak — content
- **Two competing dimension taxonomies in one product.** The EmailGate's "sample dashboard" shows *Awareness · Use cases · Governance · Data · Skills · Vendor · Comms · Roadmap* (8 labels). The real report uses the v2 canonical eight: *Current AI Usage · Experimentation Culture · AI Literacy Level · Quick Win Potential · Leadership Buy-In · Security Posture · Training Infrastructure · Builder Potential*. These do not reconcile. Janelle and Russell both noticed independently. Pick one taxonomy and ship the same names everywhere.
- **Dimension slug kicker leaks developer naming.** Every question card shows the dimension as `current-ai-usage` / `leadership-buy-in` etc. — lowercase, hyphenated, unedited. `DIMENSION_LABELS` is imported elsewhere in the codebase; route the kicker through it.
- **Federal guidance jargon (SR 11-7, TPRM, ECOA/Reg B, MRM) appears inline with no gloss.** This is the right vocabulary for the GC persona. It is dangerously alienating for the MSR persona. A `(?)` tooltip per term solves it without dumbing down.
- **Acquiescence and ordering bias unmanaged.** All 48 questions place the highest-maturity option last (option 4) and the lowest-maturity option first (option 1). A respondent learns the pattern by Q3 and picks position. No reverse-scored items. Option order is deterministic. Both should be fixed.
- **One construct-validity weak spot:** `bp-06` asks the respondent to predict other people's future behavior (would staff spend 30–60 min/week learning to build). Replace with a 90-day behavioral signal.
- **No "I don't know."** Forcing a Likert pick from a respondent who lacks visibility drags the score down for that dimension. For the funnel this isn't fatal; for the diagnostic claim it is.

### What's weak — UX
- **Long answer text overflows the question card on iPhone 13.** Fair-lending question, MRM question, vendor-TPRM question — the bottom option clips below the fold and the user has to scroll inside the card. Either tighten the answer copy to ~12 words max, or reduce serif body size on mobile.
- **No estimated time on entry.** "12 questions, ~5 minutes" before the first question would convert hesitant arrivals.
- **No progress *number*.** The hairline progress bar is calm but doesn't tell you "Q6 of 12" without you scrolling up to the corner. Either thicken the bar with the count or add a midway "Halfway there" marker.
- **No persona-routing at entry.** Marcy answered on behalf of an institution she had six weeks of exposure to. The assessment did not ask her role or warn her this is best answered by an Ops / Compliance / Exec lead.
- **Question card focus management is correct, screen-reader-wise** (prompt heading focused on question change, `radiogroup` with arrow keys). Good.
- **The "Tap an answer to continue" mono caption in the footer reads as instruction-overflow** on desktop where there's no tap. "Select an answer" would generalize.

### What's weak — conversion logic
- **Two paid CTAs ($295 course / $99 In-Depth) sit side by side with insufficient differentiation in the body.** All three personas asked: *what does the $99 actually buy me*? The closing-CTA copy says "Or take the In-Depth Assessment · $99" with no differentiator. The page should answer one question per CTA: "*$99 buys you 48 questions across all eight dimensions and a starter artifact for each weak dimension.*" Without that, the In-Depth reads as a smaller version of the course rather than a deeper version of the free assessment.
- **The tier 4 inversion (Ready to Scale → Advisory primary) is correct but invisible to the modal reader.** Lower-tier readers should still know the Advisory path exists for institutions further along — current copy makes Advisory feel like the "fallback" tertiary CTA across tiers 1–3.
- **No "send this report to my manager" affordance.** Marcy wanted to forward it. Janelle wanted to screenshot it for her CFO. A "Forward this report" or "Email a copy to a colleague" button is a high-leverage second-degree lead.

### What's weak — accessibility
- **The `<em>` tag in the score-page headline** (`Your readiness report is <em>ready.</em>`) will render upright because of the global italics-disabling rule (`* {font-style:normal!important}`), so the visual emphasis the designer intended is gone but the markup is unchanged. The intended emphasis should come from `color` + `font-weight`, not italic.
- **Score ring animation has no `prefers-reduced-motion` respect** that I could see from the component name. Confirm `ScoreRing.tsx` checks the media query.
- **No screen-reader live region** announcing tier + score after the ring animates in. A polite live region with "Your tier is Early Stage. Score: 22 of 48." would close the loop.
- **The free-email error message is in a `role="alert"` `<p>`** — correct. But the message is long and prose-y. Lead with the action ("Add your institution name.") and follow with the explanation.
- **Privacy link is missing.** WCAG 2.1 AA doesn't require it; basic data-handling courtesy does. The TrustStrip should link to a one-paragraph privacy summary.
- **`--ledger-accent` darkened to `#7C5814` for AA contrast** is good (per design-system note). But the gold-on-parch combinations inside `DeliverablePanel` look like they're using `--color-terra` (legacy Terra), not `--ledger-accent`. Audit and migrate.

---

## Question-by-question audit (12 drawn from the v2 pool)

The rotation draws one per dimension + 4 random extras. Below: the eight core dimensions with the most representative question per dimension as it appears in `questions.ts`, plus the four most likely supplementary draws.

| Q# | Dimension | Wording quality | Bias risk | Time-to-answer | Verdict |
|----|-----------|-----------------|-----------|----------------|---------|
| cau-01 | Current AI Usage | Clean, well-calibrated ladder | Low | ~12s | Keep |
| cau-04 | Current AI Usage | "We have a current, audited AI tool inventory with user-level tracking and access controls" — strong on the high end | Moderate (option 4 socially desirable) | ~15s | Keep, reverse-score variant |
| ec-01 | Experimentation Culture | Generic; could apply to any tech | Low | ~10s | Tighten — "How does your institution evaluate new *AI* tools?" |
| ec-03 | Experimentation Culture | "post-mortem" is jargon for some FIs | Low | ~14s | Replace "post-mortem" with "review" |
| all-02 | AI Literacy Level | "Hallucination" is the right vocabulary; specific to banking | Low | ~16s | Keep |
| all-03 | AI Literacy Level | PII / NPI introduced without gloss | Moderate for junior staff | ~16s | Add tooltip |
| qwp-02 | Quick Win Potential | "BSA/AML alert narratives" — bank-specific, good | Low | ~18s | Keep — long but earned |
| qwp-04 | Quick Win Potential | Strong | Low | ~14s | Keep |
| lbi-01 | Leadership Buy-In | Calibration is right | Moderate (acquiescence) | ~12s | Keep, randomize options |
| lbi-04 | Leadership Buy-In | "Board has approved a formal AI governance policy" — strong distinguishing item | Low | ~13s | Keep |
| sp-01 | Security Posture | Excellent calibration; references SR 11-7 + TPRM | High for non-compliance staff | ~22s | Add gloss for SR 11-7/TPRM |
| sp-06 | Security Posture | Fair lending wording is precise | Moderate (long answer text) | ~24s | Tighten answer copy |
| ti-01 | Training Infrastructure | Long stem | Low | ~18s | Tighten stem |
| ti-03 | Training Infrastructure | "LMS" undefined for first-line staff | Moderate | ~14s | Gloss "LMS" |
| bp-02 | Builder Potential | "micro-automation" is jargon | Moderate | ~16s | Replace with "tool or template" |
| bp-06 | Builder Potential | Predicts others' behavior | High (construct validity) | ~14s | Rewrite as behavioral signal |

Overall question pool quality is meaningfully above category average. The two patches that buy the most lift: gloss federal-guidance jargon inline and tighten the long-answer-text questions to fit a phone card.

---

## The email gate (step 13)

**Honesty of the trade.** Excellent for the category. The TrustStrip is the strongest pre-launch trust artifact on the page. The "What you get" panel on the left actually previews the deliverable rather than promising one. The fact that this is one form fold (no "scroll for more") helps. Russell and Janelle both flagged it as honest. Marcy didn't read it carefully but also didn't bounce — which is the right outcome for the gate.

**Mobile keyboard friction.** Janelle on iPhone — the form is at the bottom of a two-column layout that stacks vertically on mobile. The "What you get" panel comes first, then the form. On mobile that means roughly two screen-heights of scroll before the email input. Reorder for mobile: form first, deliverable preview second.

The form fields themselves are correctly configured: `inputMode="email"`, `autoComplete="email"`, `autoComplete="given-name"`, `autoComplete="organization"`. The submit button is `--color-terra` (legacy token — should be `--ledger-accent` post-refresh).

**Recovery if learner backs out.** SessionStorage persists, so a back-out and return resumes at the score phase with the email gate intact. Good. No "save and email me a link to finish later" affordance, which is fine for a 5-minute instrument.

**The auto-skip-if-logged-in branch is a real touch.** Skipping the gate for already-signed-in users via `/api/auth/me` is the kind of detail that compounds trust. Confirm it doesn't double-fire `email_captured` analytics.

**One bug-shaped concern.** The free-email soft-gate validates after submit. A free-email user who *does* provide an institution name sees no friction; one who doesn't provide it sees a long prose error that's also doing teaching. Lead with the action: "Add your institution name." Detail second.

---

## The result page

**Score ring + tier label + dimension breakdown + starter artifact.** This is the strongest part of the product. The ring animates in (confirm `prefers-reduced-motion`), the tier headline is plain English ("You are experimenting but not yet coordinated"), the tier summary is two sentences of advisory voice, the dimension bars are sorted weakest-to-strongest, the strongest/weakest split is honest, and the starter artifact is a working markdown deliverable, not a teaser.

**CTA discipline: In-Depth vs Foundation Course.** Tier 1–3 push Foundation $295 primary, In-Depth $99 secondary, Advisory tertiary. Tier 4 inverts to Advisory primary. This is the right ranking — the next constraint for most free-assessment takers really is capability, not another diagnostic. **What's missing:** the secondary "Or take the In-Depth Assessment · $99" needs *one sentence of differentiation* on the page itself. As written, all three personas asked the same question: *what does $99 buy me that the free one didn't?* Answer it on the page: "*48 questions across all eight dimensions, a starter artifact for each weak dimension, and a printable executive briefing.*"

**Trust artifacts.** The "Implications in operating terms" three-row table (Operational efficiency / Risk management / Cost & dependency) is the right CFO-readable shape. The "big insight" black callout is editorial and arresting without being promotional. The MaturityLadder and PracticePicture sections (which Janelle skimmed past) provide context — confirm they don't read as filler on mobile.

---

## Top 10 issues
1. **Two dimension taxonomies in one product** — sample dashboard vs real dimensions. Fix or unify.
2. **Lowercase-hyphenated dimension slugs** as kicker on every question card.
3. **Federal-guidance jargon inline with no gloss** (SR 11-7, TPRM, ECOA, MRM, LMS).
4. **Long answer text overflows iPhone card** — fair lending, MRM, vendor-TPRM questions.
5. **All 48 questions slope option 1→4 same direction.** No reverse-scored items. Option order is deterministic, not randomized.
6. **No persona-routing at entry.** Junior staff can answer on behalf of institutions they don't have visibility into.
7. **No "I don't know" option.** Drags scores down on dimensions the respondent can't see.
8. **In-Depth $99 secondary CTA is undifferentiated** from the Foundation $295 primary in the closing copy.
9. **CLAUDE.md tier thresholds are stale** (legacy 8–32; code is 12–48). Source-of-truth doc out of sync.
10. **`bp-06` predicts others' behavior** — construct validity weakness in the Builder Potential dimension.

## Top 10 opportunities
1. **Add "(?)" tooltips for federal terms.** One-time content lift, permanent comprehension gain.
2. **Randomize answer order within each question.** One-line code change in `QuestionCard.tsx`.
3. **Reverse-score 8 items (one per dimension).** Edit content only; scoring already handles option points directly.
4. **Persona-routing question at entry:** *"Who's taking this? (Operations · Compliance · Executive · Frontline · Other)"* Branch the question pool or surface a gentle "best answered by..." nudge.
5. **"Send this to my manager / colleague" button on the report.** Second-degree lead at zero cost.
6. **Differentiate the $99 In-Depth in one sentence on the closing card.** Conversion lift.
7. **"~5 minutes" badge on the assessment entry.** Reduces the "should I even start" hesitation.
8. **Privacy-handling link beside the email gate.** A two-paragraph page is enough.
9. **Live region for the score reveal** so screen-reader users get the tier announced.
10. **Confirm `--ledger-accent` migration is complete on `/assessment`** — `EmailGate` still references `--color-terra`.

---

## Verdict per persona

**Janelle** — would complete it, would screenshot the artifact, would not pay today. The path to a $99 sale is one sentence on the closing CTA. The path to a $295 sale is a team-conversation she's not having yet.

**Russell** — would complete it, would route it to L&D, would test the In-Depth at $99 to validate the sampling design before recommending the $295 team license. Trust earned; methodology gaps flagged.

**Marcy** — would complete it on behalf of her institution despite having no business doing so, would forward the artifact to Devon, would not pay personally. The product should have caught her at the door and routed her to Devon.

**Across all three:** the assessment is meaningfully better-written than the category. The shipping concerns are the dual taxonomy, the federal-guidance jargon, and the In-Depth differentiation. Fix those three and the funnel earns its keep.
