# Foundation Course Critique — Bill Hagedorn, CEO, First Plains Bank & Trust ($380M)

**Reviewer profile:** 32 yrs banking · 11 yrs CEO · ICBA federal delegate · non-technical · 58 · rural community-bank context (5 branches NE/KS, 60 FTE, KDOB + FDIC examiners)
**Reviewed:** all 24 lessons + the three-way gate · 2026-05-24
**Methodology:** Walked every lesson on the leadership track; checked the published curriculum docs against the lesson body copy in `addie.lessons`; pulled the five `leadership` track variants from `addie.lesson_track_variants`; tested the prose against the two things I have to do this fall — answer my board chair's "what's our AI strategy?" question, and not lose money to a bad pilot.

---

## Headline (three bullets)

- **The course gives me language I can use on Monday morning** — not generic AI buzz, but a small list of plain phrases ("describe the situation, not the person"; "training cutoff · no live knowledge · hallucination is a property"; "the strategic risk is not adoption, it is uneven adoption") that I can drop into a board memo, an exam interview, or a hallway conversation with my CRO. That's the test I came here to run, and the course mostly passes it.
- **It does not pretend to be more than it is, and that's a credit to the author** — there's no "deploy an agent next quarter" nonsense, no FFIEC-aware-training pablum, no vendor co-marketing, and M5.1 explicitly tells me agents aren't ready for member-facing flows. That kind of restraint is rare in this space and is the main reason I would let my staff in here at all.
- **But it doesn't yet tell me, the CEO, what to BUY** — by the end of M5 I have a prototype URL and a "ship one artifact a week" suggestion. I do not have a one-page management framework for deciding which AI investments to fund in 2026, what the risk appetite statement should say, or how to brief KDOB at the next safety-and-soundness exam. For $5,310 in seat licenses I expected the leadership track to close that gap, and it stops short.

---

## What works (with lesson IDs)

**M0.2 — "The one rule that matters: data discipline."** The single best lesson in the course. The named-vs-anonymised side-by-side ("Customer Jane Doe, account 4471…" → "A customer is upset about an overdraft fee…") is exactly the worked example I'd want every one of my 60 FTE to see before they touch ChatGPT. The leadership variant adds the right escalation — board materials, M&A, MNPI, capital plans, personnel — and the line *"If something would be considered MNPI before public release, it stays out of every AI tool until release, including the ones your team has approved"* is the kind of sentence I'd hand to my CRO and say "make this the policy."

**M1.1 — "What it actually is (and isn't)."** Calling a model a *"predictive token engine"* and giving me three properties — *training cutoff · no live knowledge · hallucination as a property* — is more useful than the last six AI webinars I've sat through combined. I can repeat those three lines to my board in 30 seconds and they will leave the room less anxious, not more. The "read every output like a loan file" line is community-bank-native; I can use it.

**M1.3 (leadership variant) — the three-observation monologue.** This is the lesson I came for: *"the strategic risk is not adoption — it is uneven adoption."* That is precisely the conversation I am not having yet at First Plains. Pairing it with the FDIC efficiency-ratio frame (community-bank median ~65% vs. industry-wide 55.7%) lands as a banker arguing with another banker, not a SaaS vendor selling a dashboard. The Bank Director 66% / Gartner 55% governance stats are correctly attributed, which I checked against the citation table in CLAUDE.md.

**M1.4 — "Good vs. bad use in a bank."** The two `[case:bad]` cards are good — *"Pasting a member's full file to draft a denial letter"* and *"Letting the model invent a citation"* — and the warn line *"A model that invents a citation is doing exactly what it was built to do. The verification habit lives with you"* is a defensible policy statement. I'd read this verbatim into the minutes of my AI risk committee when we stand one up.

**M3.4 — "Banking no-nos: spot the violation."** Twelve scenarios, *"calibration is the metric, not speed,"* with explicit fixes. This is the kind of drill I'd actually pay for. And the warn — *"Passing data-discipline does not make a use case safe. Asking a public tool to draft a press release about a non-public product launch passes PII rules and still violates MNPI"* — distinguishes PII from MNPI, which 90% of the AI training in this market does not.

**M5.1 — "What an agent is — honestly."** The frame — *"Assistant (every loop) → Skill (shorter loop) → Agent (loop runs inside bounds)"* — is the cleanest taxonomy I've seen. The tip *"Spot an oversold agent demo: 'What happens if step 3 returns a plausibly wrong result?' If the answer is a hand-wave, there is no review point"* is a question I will ask the next three core-vendor reps that pitch me, and it will save me money.

**The gate copy in M3.5.** *"Pay to continue into M4–M5; give us an email to keep your Pack; or decline and walk away. The Pack is yours either way."* That is not extractive. It's honest. After 3 modules of real value I do not resent the gate; I resent the *opposite* — sites that gate before they prove they know my industry.

---

## What's weak — gaps for a community-bank CEO and his board

**1. There is no "what do we do as an institution" deliverable.** M5.5 closes with three personal choices — deepen a skill, bring a peer along, or build out the prototype. Those are individual-practitioner choices. I run a $380M bank with a board that will ask me "so what did you decide?" The course gives 18 of my staff each a Toolbox; it does not give me an **AI governance one-pager**, a **risk appetite statement template**, or an **AI use-case inventory format** I can take to KDOB. The PRD describes a $99 Readiness Assessment that supposedly produces a "scorecard · plan · ideas+prompts · CTAs," but that is a separate purchase. For the leadership track I expected the deliverable to be folded into M5 itself — a one-page **institutional readiness brief** authored by the learner. As shipped, the leadership track ends with the same prototype URL as the customer-facing track. That is a miss.

**2. Regulator literacy is asserted, not demonstrated.** The off-limits list in M0.2 (leadership variant) is good. But across 24 lessons I never see **SR 11-7** named in a way that shows the author understands it ("model risk management" is one phrase; that's a 24-page guidance document with specific lifecycle requirements). I never see **Interagency TPRM Guidance** mapped to "your AI vendor is a third party and so is OpenAI." I never see the **AIEOG Lexicon** invoked at the right moment — when the course is teaching me to define "hallucination" or "HITL." The CLAUDE.md banned-phrase list rightly forbids "FFIEC-aware training," but the course has not yet replaced that with substantive regulator content. For a CEO buying 18 seats, the regulatory framing is the part I cannot get from a consultant for two days. The course needs to lean harder into it, with named documents, dates, and one-line plain-English restatements per the M1.1 pattern.

**3. The leadership track variants are too few, and they speak past a $380M bank in places.** Only five lessons branch (M0.2, M1.3, M2.4, M3.5, M4.3) — that means in 19 of 24 lessons my leadership-track learner sees the generic body. The branched variants themselves are well-written, but read past a small bank. *"once for the board, once for the exec team, once for the all-hands"* (M4.3) assumes my exec team is a different group from my all-hands; at 60 FTE those are the same room. *"AI strategy, deposit competition, core-platform decision"* — the deposit-competition framing is real for me, but a banker writing this clearly has a $5B+ bank in their head. None of it is wrong, but none of it reads as *"this was written by someone who's chaired a $380M bank's board."* That is the test you should care about.

**4. The cost frame is unaddressed.** Free M0–M3 across 60 FTE is great. Paid M4–M5 at $295 × 18 = $5,310 is real money — that's a full quarterly board-packet print run, or two months of my AI-curious associate's salary loaded. The course never tells me **what I get in M4–M5 that a community-bank CEO cannot get from M0–M3 plus a one-day off-site.** M4 is "build a skill" (one named, parameterised prompt). M5 is "write a PRD and stand up a prototype." That's useful for my CRO and maybe my head of retail, but for a teller it's mostly noise. So the buy is really 4–6 paid seats, not 18. The course should help me **figure out which 4–6** — a "who in your institution gets M4–M5" decision tree somewhere in M3.5 or M5.2. That single page would justify the seat-license math.

**5. The "worst case if my loan officer takes this course and starts using ChatGPT" question is partly answered, not fully.** M0.2 and M1.4 cover the data-discipline floor well. But the course does not explicitly warn about **hallucinated regulatory citations in adverse-action letters**, **disparate-impact risk if a model is used for loan-decision drafting**, or **the third-party-risk angle of every consumer LLM** (OpenAI, Google, Anthropic are vendors my CRO has never diligenced). M5.1's *"Do not put a draft in front of a member, connect it to a system of record, or give it permission to move money"* is good but generic. The leadership track in particular should carry one lesson — call it *M3.6 (leadership): What can go wrong, by department* — that walks the CEO through the three or four worst-case scenarios that put a community bank in an MRA. That would be the single most valuable lesson you could add for me.

**6. The Readiness Assessment funnel reads up-sell-y at first glance, but I think it's defensible.** $99 to get a four-deliverable scorecard, plan, prompts, and CTAs — fine, that's a reasonable price for a small bank president to write a personal check for. What I would NOT accept is if it became a constant in-course nag. The single mention in M5.5 (*"AiBI-S, AiBI-L; neither open yet; no scarcity script"*) is honest. Keep it that way. If the assessment shows up as a CTA in three or more places across M0–M5, it will start to read as a funnel and undermine the trust the course has built.

---

## UX findings (executive-oriented)

**Information density — pass.** I read M1.1, M1.4, and M5.1 on my phone with the WSJ open in the other tab. Each lesson is genuinely under 15 minutes, and most are closer to 8. The script-card format (a `[stat]` opener, three `[case:good]` cards, a `[tip]`, a `[warn]`) is the right shape for an executive — I can screenshot the `[save]` line and forward it to my chief of staff in 30 seconds. That is exactly the time-efficient brief I want.

**Authority + trust signals — strong, with one concern.** The Ledger aesthetic (parchment, ink, gold accent, oxblood for destructive only) lands as authoritative. The "no emoji, no exclamation points, banned words: supercharge / unlock / revolutionize / leverage / synergy" rule is visible in the prose — I never once cringed at marketing voice. The concern: at certain points the editorial voice slips into a slightly *too* world-weary register (M5.5 *"You finished. You now hold a Data Discipline Card… That is not AI literacy. That is a practice."*). It's good writing, but two or three notches more institutional and one notch less New Yorker would land better with my board chair, who is a retired ag-bank president.

**Decision-readiness at M5 — fail, as noted above.** I cannot, on the strength of M0–M5, write the AI strategy memo my board chair asked for. I can write a *better* one than I could before, because I have language and a frame. But I do not have a recommended next step at the institutional level. The course gives me 90 days of personal practice — it does not give me a 12-month institutional plan.

**Accessibility for non-techs — pass, mostly.** "Predictive token engine" is the only technical phrase that needs the gloss it gets. "PRD," introduced in M5.3, is unpacked. "Skill" as a noun is reframed cleanly in M4.1. The branched variants do not assume the leadership learner has touched a model before, which is correct — most CEOs haven't. One nit: M5.4 ("Build a prototype") sends me to "one of four prototyping tools" outside the course for an hour. As a CEO I will not do that homework; you should expect every leadership-track learner to skip M5.4 and you should design M5.5 to land cleanly without it.

**Brand consistency — high.** The course is recognisably the same product as the rest of the Institute's site. The wordmark, the typography (Newsreader / Geist / JetBrains Mono), the gold-accent discipline — it reads like Harvard Business Publishing tooled for community banks. That's the right room to be in.

**Reading level — good.** Prose is plain, sentences are short, statistics are tabular and sourced. The 65% FDIC efficiency-ratio number is the right hook — I checked it against the citation table and it traces to FDIC CEIC data and the Q4 2024 QBP. That number will survive my CFO's eye-roll, which is the only audit that matters.

**Trust artifacts — sourced statistics survive a check.** I spot-checked the Bank Director 2024 / 66% number (Jack Henry "Getting Started in AI," 2025, attributing Bank Director — confirmed via the CLAUDE.md citation register). I spot-checked the FDIC ~65% community-bank median (FDIC QBP / CEIC — confirmed). The course does not include any of the AI-vendor-marketing statistics that contaminate most banking-AI content. That alone is worth something.

---

## Track variants (leadership) — does it speak to a $380M-bank CEO?

Five branched lessons; here is the read on each:

- **M0.2 (off-limits, leadership)** — Excellent. Board materials, M&A, MNPI, personnel, capital plans. The pattern advice ("Help me frame talking points… No: 'Here is our draft plan, sharpen it.'") is exactly the discipline I'd write into our acceptable-use policy.
- **M1.3 (why this matters, leadership)** — Excellent. The three-observation monologue is the leadership-track centerpiece. The "uneven adoption" framing is correct and useful. Slightly over-written but I'll forgive it because the substance is right.
- **M2.4 (where AI fits, leadership)** — Adequate. The worksheet items (board memo, meeting notes, two-voice staff comms, town-hall talking points) match my actual week. Item 4 ("a strategic question I want to think out loud about") is the highest-value prompt of the seven.
- **M3.5 (real use cases, leadership)** — Adequate. The "board talking-points memo" Starter Prompt is the right first prompt. Three is too few for the leadership track — I'd want one prompt for board prep, one for regulator-letter drafting (anonymised), and one for the all-hands.
- **M4.3 (build a skill, leadership)** — Adequate. "Board memo, one page" is the right reusable skill. But the leadership track should also walk me through a **second** skill — call it "Vendor proposal first-pass triage." That's the work I personally do most often.

**Net:** the leadership track is well-aimed but thin. Five branched lessons is the floor; ten would make this a leadership product. The generic body in the remaining 19 lessons is fine, but it is the *un-branched* version — meaning my $380M-bank CEO is consuming the same M3.1 prompt anatomy as my back-office associate. That's not wrong, but it's not a leadership *track* either; it's a generic course with five leadership grace notes.

---

## Gate experience (the three-way fork)

I have not pixel-walked the gate render (the worktree route exists at `src/app/(addie)/foundation/gate/page.tsx`, 15 lines, dispatching to a `GateScreen` component); my read is on the design intent as expressed in M3.5's closing copy and the PRD §6.4 reference. The three options — **Pay** (continue M4–M5), **Email-to-keep** (save the Toolbox), **Decline** (→ $99 Readiness Assessment nurture) — are honest and well-staged. After M0–M3 the learner has produced (per M0.2 / M1.2 / M2.3 / M2.4 / M3.5): a Data Discipline Card, an AI Toolkit Map, a First Conversation transcript, a Where-AI-Fits worksheet, and a Starter Prompt Pack. That is enough sunk cost that the email gate does not read as extractive. The "decline → Readiness Assessment" branch needs to be careful not to feel like a downsell; I'd recommend framing it as *"not ready to commit to M4–M5? Take the institutional Readiness Assessment first to figure out where to invest"* rather than as a parallel SKU.

---

## Paid modules (M4 + M5) — would you fund $5,310 to put 18 staff through this?

Honestly? **No, not as currently shaped.** M4 (skills) and M5 (prototypes) are the right material for **4–6 of my 60 FTE** — my CIO-equivalent (we share an IT director with a correspondent), my BSA officer, my chief lending officer, my chief of retail, and maybe one or two associates who already use AI on their own time. For those 4–6, the $295 buy is fair. **That's $1,180–$1,770, not $5,310.**

The remaining 12 of the 18 I'd originally budgeted should get the **free M0–M3 across all 60 FTE** treatment and stop there. M4–M5 are builder modules; most of my staff are not builders and never will be. The course author knows this — M5.1's "Assistant / Skill / Agent" frame implies it — but the course does not yet help me *make the seat-allocation call*. That decision tree, dropped into M3.5 or as a CEO-track sidebar, would turn me from a $5,310 buyer to a $1,500-plus-free-licenses buyer, and I would be a happier customer for it.

**Versus a two-day consultant at, say, $5K–$8K all-in:** the course wins. A consultant gives me a deck I'll forget in six weeks. The course gives my staff a Toolbox they open Monday morning, and gives me a vocabulary that compounds. The cost-per-FTE math (free × 60 + $295 × 6 = ~$30/FTE) is unbeatable for staff fluency. Where the consultant still wins is **institutional decision support** — and that's the gap I keep flagging.

---

## Verdict: deploy at First Plains Bank & Trust?

**Yes, with the following plan and the following requests to the author.**

**Plan:**
1. **All 60 FTE through M0–M3 (free)** in Q3 2026, with a one-hour internal launch session in which I personally read M0.2 (the data-discipline rule) aloud and tell my staff "this is the floor, and the floor is the policy."
2. **6 paid M4–M5 seats** for my IT director, BSA officer, CLO, CRO, head of retail, and one rotation slot. Budget: ~$1,770.
3. **I personally take the $99 Readiness Assessment** to see if it gives me the institutional brief the course itself doesn't.
4. **Board update in October** — I'll bring three artifacts from my own Toolbox to the board meeting: the Data Discipline Card, the Board-Memo-One-Page skill, and one prototype URL. That is a more credible "what's our AI strategy?" answer than any deck.

**Requests to the author (in plain order of how much they would move my buying decision):**

1. **Add an institutional readiness deliverable to the leadership track** — a one-page board brief the CEO authors in M5, not a separate $99 purchase.
2. **Add a "what can go wrong, by department" lesson** — the worst-case-scenarios walkthrough that explicitly names hallucinated citations in adverse-action letters, disparate-impact risk in loan drafting, and the third-party-risk angle on consumer LLMs.
3. **Add a seat-allocation decision tree** for the CEO buyer — "who in your institution actually gets value from M4–M5."
4. **Deepen regulator literacy** — name SR 11-7 by section, name the AIEOG Lexicon at the moment it's most useful, name Interagency TPRM Guidance when teaching the third-party-risk angle.
5. **Add five more leadership-track branches** — currently five of 24; ten of 24 would turn this from "course with leadership grace notes" into "leadership track."

I'm not going to pay $295 × 18 if the answer at the end is "use ChatGPT carefully." Show me what my bank does differently in 90 days, in writing, in M5 — and I'll come back and buy the AiBI-L when it's open.

— **William "Bill" Hagedorn**, President & CEO, First Plains Bank & Trust, McCook, NE / Norton, KS / 2026-05-24
