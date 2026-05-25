# Foundation Course Critique — Devon Reyes, Branch Ops Manager, North Star CU ($480M)

**Reviewer profile:** 9 yrs credit-union retail · branch manager 3 yrs · associate's degree · non-technical · uses AI on personal phone occasionally · 31
**Reviewed:** all 24 lessons M0–M5 + the gate at `/foundation/gate` · 2026-05-24
**Track applied:** `customer_facing` (the right track for my tellers, MSRs, junior LOs)
**Methodology:** Walked every lesson body and the customer_facing variants; applied front-line-operations and modern UX lenses (cognitive load, mobile, reading level, persuasion, accessibility).

---

## Headline (3 bullets)

- **The data-discipline lesson (M0.2) is the best single thing in here.** "Describe the situation, not the person" is something I can put on a laminated card by the teller line on Monday. That one rule is worth the trip on its own, and the customer-facing track variant lists the off-limits items in language my staff actually use.
- **The course earns my trust on privacy but loses my newer staff on vocabulary.** M1.4 drops "FDIC Quarterly Banking Profile, Q4 2024" and "SR 11-7"; M3.4 introduces "MNPI" in a warn callout with no definition; M5 throws "PRD" around like everyone knows what that is. My six-week MSR will glaze over. Glossary on hover or in-line plain-English would fix most of it.
- **Modules 4 and 5 are not aimed at my branch.** They are aimed at someone at HQ who has slack time, a laptop, and an hour to play in Lovable or Replit. My tellers do not have an hour of uninterrupted time and do not have permission to spin up "prototype URLs." The free side (M0–M3) is genuinely useful for them; the paid side is for a different audience and the gate copy doesn't say so.

---

## What works (with lesson IDs)

**M0.1 sets honest expectations.** "Six modules, 24 lessons, none over fifteen minutes. Free through Module 3; paid for M4–M5." Compare that to every "transformative AI training" pitch I've sat through this year — no upsell theater, no countdown. The 6 · 24 · <15m stat card is exactly the shape my staff want to see before they commit. I screenshotted it and sent it to my CEO.

**M0.2 — the single rule.** "Never put customer or confidential data into an AI tool" plus the side-by-side bad/good cases ("Customer Jane Doe, account 4471…" vs "A customer is upset about an overdraft fee…") is the cleanest privacy moment I've ever seen in vendor training. The `[warn]` line — "This course's sandbox blocks sensitive paste. Real tools do not. The habit is what keeps you safe when the training wheels come off" — is honest in a way that earns my trust. My CCO will appreciate it.

**M1.2's verb-test for tools.** "*Chat · summarise · draft · ask* → assistant. *Build · ship · deploy · generate* → builder." That's the kind of thirty-second heuristic a teller can use after a one-pager. Genuinely useful.

**M1.4's three good / two bad pattern.** Concrete, specific, and the bad cases use the exact mistakes my staff would make (pasting a member's full file to draft a denial letter). The `[tip]` — "If you cannot say your clipboard contents aloud without naming a real customer or unreleased number, the answer is no" — is the second laminated-card line.

**M2.3's First Conversation in a PII-blocking sandbox.** Brilliant onboarding move. My staff have never used the API tools; letting them feel the model without risking a real paste is the right call. The Anthropic provider choice is invisible to them (good — they don't care).

**M3.1's four-part brief (Role · Task · Context · Format).** This is the one mental model that will stick for everyone. It's four words, it rhymes with how my staff already think about writing a memo, and the example accumulates as the lesson plays. Best instructional design moment in the course.

**M3.4's spot-the-violation drill.** Twelve scenarios with violation/clean/borderline calls is exactly the muscle my MSRs need. The `[tip]` to "screenshot the two hardest scenarios" is wise. This is the lesson my compliance officer would want to see logged.

**The customer_facing track variants are written like an actual branch person wrote them.** "Better follow-ups, faster comprehension, a rehearsal room when you need one" (m1.3) is the line that will sell the course to my retail team. The m3.5 variant ("overdraft mechanics. Hold timelines. Why a debit declined when the balance looked fine.") names the exact conversations we have eighty times a week.

**The gate is honest.** "No countdowns, no scarcity. Your progress and artifacts are kept. Come back when you have ten minutes." After a decade of consulting pitches, this is refreshing. The three-way choice (pay $295 / save with email / take the assessment) is clean.

---

## What's weak or missing for my branch staff

| Severity | Finding | Lesson | Fix |
|---|---|---|---|
| **HIGH** | "SR 11-7" appears in M1.4 `[case:bad]` outcome with no definition. An MSR with six weeks of tenure has never heard of it. Same for "OCC bulletins" and "Reg E." | M1.4, M3.1 (Reg E example), M3.2, M3.3 | Add a one-line plain-English aside the first time each acronym appears: "SR 11-7 — the Fed's model risk management guidance, the rulebook for how banks govern AI/model output." Or: hover-glossary. |
| **HIGH** | "MNPI" lands in M3.4's `[warn]` with zero explanation: "passes PII rules and still violates MNPI." Front-line staff don't know that acronym. They'll skip the warning. | M3.4 | Spell it out: "material non-public information." Use the full phrase the first time. |
| **HIGH** | M5 assumes the learner has the authority and time to "spend the next hour or two outside this course" building a prototype in Lovable / Replit. My tellers do not. My junior LOs do not. Even my assistant managers don't have that runway. | M5.4 | The lesson needs an explicit "is this for me?" gate or a "track-aware" version for customer-facing roles that produces a less time-intensive artifact (a polished PRD for the manager to take upstairs, not a live prototype URL). |
| **HIGH** | M4 builds "Skills" on the assumption you can save a parameterized prompt and re-run it. Does my staff's free Claude/ChatGPT account let them save reusable templates with named slots? If the answer is "only in the Toolbox here," the skill dies the moment they close the tab and try to use it in the real tool. The course doesn't say either way. | M4.1, M4.2 | One clear paragraph: "Your saved skill lives in your Toolbox here. To use it at work, copy the template into your sanctioned tool and fill in the slots. The Toolbox is the recipe; your work tool is the kitchen." |
| **MED** | M2.1's IT-firewall scenario assumes my staff will "ask which tool is sanctioned." In a 6-branch CU, asking IT can take three weeks. The lesson reads like it's written for a bank with a mature AI governance program. Mine doesn't have one yet. | M2.1 | Add a sentence: "If your institution has no sanctioned AI tool yet, learn on personal accounts with the data-discipline rule in M0.2. Don't use member data. Don't use work email." |
| **MED** | Nothing in the course teaches **denial letters**. That is one of the highest-stakes, most-rewritten artifacts a junior loan officer produces. ECOA/Reg B compliance plus warm tone plus specific adverse action reasons. It's the exact use case I'd most want a saved skill for. | M3.5 / M4.3 customer_facing variant | Add a denial-letter example in the customer_facing M3.5 or M4.3 variant. Currently only "fee complaint" is shown. |
| **MED** | The "5 patterns" in M3.3 (Default brief · Few-shot · Chain-of-thought · Constraints · Ask what's missing) is five new concepts stacked in one lesson. That's cognitive overload for a non-technical learner. | M3.3 | Split into two lessons (3.3a / 3.3b) or front-load with: "You only need pattern 1 today. The others are a reference card for later." The lesson kind of says this in the `[tip]` ("Default to pattern one") but it's buried. |
| **MED** | M3.4 is a 12-scenario drill. On a phone in the break room with a member walking in, my MSR will start it and never finish. There's no indication you can pause and resume mid-drill. | M3.4 | Make explicit: "Resumable. Each scenario saves on submit." |
| **MED** | "Few-shot" / "chain-of-thought" in M3.3 are jargon a banker has never heard. The lesson explains them but the headings still read like a CS lecture. | M3.3 | Rename the pattern headers to plain English: "Pattern 2 — Show examples first." "Pattern 3 — Make it think out loud." Keep the jargon as a subtitle. |
| **MED** | M4.4's "guardrail check" depends on the learner doing four-question self-review. There's no scaffold showing what a *good* guardrail note looks like vs. a lazy one. | M4.4 | Add one annotated example of a good guardrail-check note set and one weak set. The `[tip]` shows one good example; need a contrast. |
| **LOW** | "Workbench Pack" appears in M5.5 ("you now hold a Data Discipline Card, an AI Toolkit Map, a First Conversation, a Starter Prompt Pack, a Workbench Pack…") but I don't recall a lesson that produces a Workbench Pack. M4 produces Skill Templates and Working Skills — different names. | M5.5 | Reconcile the artifact names. If "Workbench Pack" is the collective name for M4 skills, say so in M4.1. |
| **LOW** | The "AI Banking Brief" / newsletter framing on the gate ("opt in below if you want the Brief") assumes the reader knows what that is. | gate | One-line description: "Our monthly note — banking AI patterns, no promo." |
| **LOW** | The "[stat] ~65%" efficiency-ratio hook in M1.4 is technically accurate but my staff don't think in efficiency ratios. The CFO does. | M1.4 | Either reframe in time-saved terms for the customer_facing track ("twenty minutes per fee dispute reply × four a day × five days") or move the stat to the M1.3 track variant for managers. |

---

## UX findings

**Reading level.** Pulled a sample from M3.1: "*Skip any one and the model fills the gap with someone else's defaults.*" That's an idiom that requires inference. M5.1: "*Step 1 decides. Step 2 acts. Step 3 checks. Step 4 loops or stops.*" That's tighter. The course oscillates between ~10th grade (case cards) and ~13th–14th grade (warn callouts, M5 prose). My staff need ≤10th consistently. **The lesson-body voice — clipped, editorial — works for me; it's a stretch for a six-week MSR.** Specifically:

- M5.3 "Contract not wish list · Goal in one sentence · Non-goals stop scope creep" — this is product-management vocabulary. PRD, scope, dependencies, success criteria. None of this is plain English to a teller.
- M4.1 "*A skill does not chain, browse, or read your inbox.*" — "chain" as a verb in this context isn't general English. My staff hear "chain" and think bike lock.

**Mobile-first.** The lessons are *probably* mobile-readable (Ledger token system implies responsive), but I see several screens that worry me on a phone in a fluorescent-lit break room:

- Side-by-side `[case:bad]` / `[case:good]` cards in M0.2 — the spec says "stacked on mobile," good. But the OffLimitsSorter widget (drag-to-sort) is going to be miserable on a 6-inch screen. Confirm thumb targets ≥44px.
- M3.2's "side-by-side renders show two or three outputs in equal columns" — on a phone, that becomes three tiny columns or vertical stacking that loses the comparison. The diff highlight depends on visual proximity that mobile breaks.
- M3.4 drill: scenario text + 3 call buttons + post-answer feedback in one card. On mobile that's a scroll-heavy card. Test on iPhone 13 mini.

**Time-on-task.** The promise is ≤15 min per lesson. Honest estimates for my non-technical staff:

- M0.1 (intro + track picker): 8 min — realistic
- M0.2 (single rule + sorter): 12 min — realistic if sorter is fast
- M1.1: 6 min — realistic
- M1.2 (sort 12 tools): 18 min — **over** for a non-technical learner
- M2.3 (first sandbox conversation): 20 min — **over**; first AI conversation always takes longer than expected
- M3.2 (three sandbox runs): 25 min — **way over** for a learner thinking about each lever
- M3.3 (five patterns): 22 min reading-only — **over**
- M3.4 (12 scenarios): 20–30 min — **over**
- M3.5 (build 3 starter prompts): 35–45 min — **way over**, and the lesson promises 15
- M4.2, M4.3, M4.4 each: 20–25 min — **over**
- M5.3 (write a 9-section PRD): 40–60 min the first time — the lesson body even admits "Thirty minutes the first time, ten the next."

**The "<15 min" promise on the front of the course is not true past M2.** Either retime the promise or split the longer lessons.

**Cognitive load.** M3.3 introduces 5 new patterns in one lesson — overload. M5.1 introduces assistant + skill + agent + "loop length" + deployment-vs-draft in one lesson. M5.3 introduces 9 PRD sections in one. Each of these is a candidate split.

**Persuasion / Cialdini.** The course mostly avoids manipulation, which I appreciate. The gate uses **no countdowns**, **no scarcity** explicitly — and *says* so. That builds trust. Authority cues (FDIC, OCC, SR 11-7) are present but unanchored for newer staff. Reciprocity is implicit: the free side genuinely delivers, which earns the paid ask.

**Empathy.** M0.1's "*You do not need to be technical*" and M0.2's calm tone ("This is the guardrail that *enables* boldness, not a scolding") land well. But M5 sails past the anxiety of "I have never written a PRD, I do not know what a prototype is, my manager will laugh if I show up with a Lovable URL." That anxiety needs a line.

**Recall vs recognition.** M3.1's four-word mnemonic (Role · Task · Context · Format) is the only true recall asset. Everything else asks recognition — "when you see this situation, do this." That's the right pedagogy for this audience. Good.

**Onboarding curve.** **M0 does not actually show someone where to type in a chat window.** M0.1 talks about the course shape; M0.2 talks about data discipline; M1.1 jumps to "what a model is." A learner who has literally never opened Claude or ChatGPT gets to M2.3 still not knowing what an AI tool *looks like*. There should be a 30-second "Here is the input box. Here is the output area. Here is what 'send' looks like" — ideally as a still image annotated. Many of my staff would benefit from this.

**Feedback loops.** M3.4's drill spec says "after-answer feedback with the anonymisation fix where applicable." That's the right pattern. But the closing summary card example reads: "Strong calibration on PII; revisit borderline cases involving confidential vendor material." For a learner who already missed those scenarios, "revisit borderline cases involving confidential vendor material" is not actionable. It needs a "click here to see the two scenarios you should re-read."

**Accessibility.** The new gold (`--ledger-accent` #7C5814 darkened to AA per the 2026-05-21 fix) is documented as AA-compliant. Good. But the wordmark line 2 in `--ledger-soft` (#8C95A8) is documented as "WCAG-exempt (logotype)" — that's fine for the wordmark itself, but I want to confirm that `--ledger-muted` (#4F5C6E) on `--ledger-paper` (#F4F1E7) hits AA at body sizes. In a fluorescent-lit branch with my reading glasses, light grey on parchment is the contrast complaint I hear most. The CLAUDE.md says darkened for AA — trust but verify on actual lessons.

**Tone risk:** The dry editorial voice is a feature for me but a barrier for some staff. "*Length is a knob, not a virtue.*" (M3.2) is the kind of line my CCO will love and my 22-year-old teller will not parse on first read.

---

## Track variants (customer_facing) review

**The customer_facing variants are the strongest part of the course for my audience.** Specifically:

- **m0.2 off-limits list:** "Account numbers, card numbers, and SSNs — full or partial. Balances, transaction history, or fee detail tied to a real name. Loan or membership applications…" — this is the actual list my staff need. The closing line "If you are not sure whether a tool is approved for member data, the answer is no" is exactly the call I want them to make.
- **m1.3 audio:** "*Better follow-ups, faster comprehension, a rehearsal room when you need one.*" If my staff hear this and nothing else, the course has paid for itself. The rehearsal-room framing for tough conversations is one I had not heard before and is genuinely useful.
- **m2.4 worksheet fields** are correct — fee dispute reply, hold-reason explanation, recurring escalation drafts. These are the exact items my MSRs would fill in.
- **m3.5 customer_facing prose** ("The work that eats the most time on the floor is also the work the model is best at…") — this is the line I'd put on the internal sell-in deck.
- **m4.3 customer_facing skill** (Member fee-complaint reply) — the right first skill for a branch person.

**Gaps in customer_facing track:**

1. **No denial-letter variant.** As above — single biggest miss for junior LOs.
2. **No script-rehearsal sandbox exercise.** The m1.3 audio talks about rehearsing tough conversations, but no lesson actually gives you a sandbox-driven roleplay scenario. M2.3 is a "first conversation" but not a rehearsal-room conversation. The promise is set in m1.3 and not paid off.
3. **No collections / past-due variant.** This is a daily conversation. Mentioned nowhere in the customer_facing track.
4. **The m4.3 variant assumes you have an m3.5 prompt already saved.** What if the learner skipped m3.5 or saved a different prompt? Soft chain dependency that's not flagged.

---

## Gate experience

**What I liked.** The three-way choice (Pay $295 / Save with email / Take the $99 assessment) plus the "Bring the whole team in" bottom section. Honest pricing, honest pitch, no manipulation. "No countdowns, no scarcity. Your progress and artifacts are kept. Come back when you have ten minutes." — that line alone increases my willingness to come back.

**What I'd push back on.**

1. **"You crossed the free line"** as the H1 is a touch adversarial. My instinct on a free-to-paid transition is to lead with what they earned, not what they crossed. "You built five artifacts. Here's what's next." would land softer.
2. **The team option (10-seat minimum)** is the right product for me — I'd buy 30 seats for my branch network. But the gate doesn't tell me what 30 × $X looks like or who to call. "Buy seats" button → ? I want a sense of total cost before I click.
3. **"Same course, billed by seat. Admin invites learners by email."** Good. But I need to see the admin dashboard before I commit. Screenshot or a "see what admins see" toggle would close the deal faster.
4. **"The sandbox blocks PII patterns. The rules align with SR 11-7."** — for a procurement / compliance buyer this is the right reassurance, but SR 11-7 again with no definition for the actual learner.
5. **No "talk to a human" / "ask a question" option.** For a $295 × 30 seats purchase, my CFO is going to want a 15-minute call. There's no CTA for that here.

---

## Paid modules (M4+M5) — would your tellers complete this if your CU paid for it?

**Honest answer: most would not finish M5 on their own time.** Here's the breakdown:

- **M4 (Skills) — yes, for MSRs and junior LOs.** M4.1–4.3 builds a saved member-comms reply they would use in week one. The customer_facing m4.3 variant nails the right first skill. M4.4's verification step is good. They would complete this if I scheduled an hour of paid time. They would not complete it on personal time.
- **M5 (Prototypes) — no, not for my front line.** M5.2 (problem framing) is useful for assistant managers and up. M5.3 (PRD) is squarely a manager's job. M5.4 (build in Lovable / Replit) requires permission, tooling, and 90+ minutes that my staff don't have. M5.5 (where to go next) is fine.

**The honest framing for my audience:**

> *M4 = "build a saved tool you'll actually use." M5 = "learn to brief a builder so you can take this to your manager." If you're never going to build the prototype yourself, M5 is still useful as the language you need to ask for one.*

If the course said that explicitly at the M3→M4 gate, I'd buy seats for everyone. As written, the gate sells the same thing to a teller and a senior VP, and my teller will feel out of place in M5.

---

## Verdict: deploy at North Star CU?

**Yes, with conditions.** I'd run a pilot of 8–10 staff (mix of tellers, MSRs, a junior LO, an assistant manager) through M0–M3 first, on company time, in two 90-minute sessions. If M0–M3 lands — and I believe it will — I'd buy team seats and run the whole staff (~60 of 85) through M0–M3, then a smaller cohort (~10–15, the managers and senior MSRs) through M4–M5.

**Before I commit, I want:**

1. A glossary or hover-definition pass on SR 11-7, MNPI, OCC, Reg E, ECOA/Reg B, PRD, "chain-of-thought," "few-shot." Plain English on first appearance.
2. A 30-second "what an AI tool looks like" onboarding still in M0 — before M1.1 talks about token prediction.
3. A denial-letter and a past-due/collections example added to the customer_facing track variants.
4. An honest retiming of the "<15 minute" promise — or split the longer lessons. The promise is the trust-building hook on M0.1 and it cracks at M3.
5. A "team admin dashboard" screenshot or short video on the gate page.
6. Confirmation that saved skills work *outside* the Toolbox — i.e., the recipe-vs-kitchen paragraph I described above.

**What sells it to my CEO:**

- The data-discipline rule (M0.2) is the cleanest member-privacy training I've seen.
- The Starter Prompt Pack (M3.5) and Member Fee-Complaint Reply Skill (M4.3 customer_facing) are real artifacts my staff would use the day after.
- The course is **not** "AI literacy" theater. It produces things.

**What worries my CEO:**

- "Are my tellers going to start putting member data into ChatGPT on their personal phones because they took this course?" The course's answer (M0.2 + the sandbox PII block) is the right one, but the answer to *that* concern is a one-page handout I'd want bundled — "What your bank should put in writing before this course rolls out." It's not in the docs I reviewed and it should be.

**One line for my staff meeting:**

> *This is the first AI course I've seen that treats you like you've been a banker for nine years, not like you're a tech bro who just discovered prompting.*

That's the line. That's why I'd run it.

— Devon
