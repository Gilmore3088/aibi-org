# Foundation course — adversarial critique
**Date:** 2026-05-22 · **Judge:** adversarial, not polite · **Scope:** marketing → assessment → course → certificate

This is the hard read. It is not a celebration of the spec, not a polite rewrite of the PM report, and not an endorsement of the owner's stated direction. Where it disagrees with `Plans/aibi-launch-spec-v2.md`, `docs/foundation-course-modules.md`, or the 2026-05-22 PM report, the disagreement is marked.

---

## 1. The 60-second skeptic test

A community-bank COO lands on `/`. The hero says **"Turning Bankers into Builders."** Below that, in serif italic: *"Independent AI assessment and education for community banks and credit unions."* Then three tiles: free assessment, $99 In-Depth, $295 Foundation.

The single most likely bounce trigger is **the gap between "Builders" and what the tiles actually sell.** A COO reads "builders" as engineers, integrations, or operational change. The tiles offer: a 3-minute quiz, a 20-minute quiz, and a self-paced course about prompting safely. Nothing on this page makes a builder. The third tile's body copy half-admits this — `src/app/page.tsx:99-102`:

> *"Learn how to build the prompts, agents, and AI workflows your daily banking work demands…"*

"Build the prompts" is the tell. A skeptic reads that as: *we relabel typing-into-ChatGPT as "building," and we charge $295 to teach it.* The tagline writes a check the course does not cash. The course teaches **safe, calm AI use**, which is honorable — but the marketing surface is positioned one rung higher than what is delivered. A COO who came expecting workflow automation will bounce on the third tile.

Second bounce trigger, smaller but corrosive: the lede is in italic serif (`font-serif italic` on `page.tsx:36-39`), and CLAUDE.md explicitly says italics were **retired site-wide on 2026-05-21**. A global `* { font-style: normal !important }` rule kills the italic visually, but the *intent* — "the lede is a quote, set apart" — is now expressed as roman serif against roman serif against roman serif. The hero looks visually flat. A `<em>` is wrapped around "Builders" in the H1, which renders identically to the surrounding text. The Ledger refresh decided to use color + weight for emphasis; the homepage did not get the memo.

---

## 2. The promise vs. the proof

**Promise on the homepage:** "Turning Bankers into Builders" + a credential the examiner respects.
**Promise on `/courses/foundation/program`:** "every staff member at a community bank or credit union" can use AI "safely, professionally, and with regulatory confidence."
**Spec promise (`docs/foundation-course-modules.md`):** "safe professional confidence" — not literacy, not building.

These three sentences describe three different products. The course delivers the third one (which is the honest one). The first two are sales copy. The proof gap:

**On "Builders":** Module 8 ("Your First Workflow") is the only module that touches anything resembling building. The spec is explicit: *"You'll hear the word 'agent' a lot. Most of what gets sold as an 'agent' is just this — a few steps chained together. You don't need to build one. You need to know how to map one."* That is the right pedagogical call. It is also the literal opposite of "Turning Bankers into Builders." The course teaches **mapping**, not building. Either change the tagline or change the course; do not run them in parallel and hope no one notices.

**On "the credential your examiner respects":** `src/app/page.tsx:102`. There is no evidence on the site — no examiner endorsement, no regulator citation, no third-party accreditation — that any examiner has heard of this credential, much less respects it. CLAUDE.md's own banned-phrases table forbids "FFIEC-aware training" precisely because regulators do not bless training programs. The "examiner respects" line falls in the same trap, dressed up. A community-bank compliance officer will read it, run a search, find nothing, and downgrade trust on the whole brand.

**On the $99 In-Depth Assessment:** the comparison table on `/assessment/in-depth` (`page.tsx:60-72`) promises a *"ninety-day playbook keyed to your weakest dimension"* and an *"institution rollup dashboard."* Whether those deliverables are at $99-quality (or $999-quality) depends entirely on how the report reads. The site does not show a sample. Asking $99 sight-unseen, with no anonymized sample artifact and no published methodology document, is a higher trust ask than the page acknowledges. Recommend: link to one redacted sample report visible without paying, or expect the conversion rate to floor.

**On the $295 Foundation:** the proof problem is more subtle. The course is genuinely well-designed for "calm professional confidence" (see §8). But $295 is priced against the *Builders* promise and the *credential-respected* promise. Against what it actually delivers — a thoughtful prompting + safety course taught in editorial voice — it's competing with $0 YouTube content and $20/mo ChatGPT itself. The price has to be defended by the credential's perceived weight, and the credential is currently unweighted. The certificate (M12) is deliberately understated, which is right pedagogically but compounds the pricing problem: the artifact the learner takes away does not visibly justify $295 against a skeptical CFO.

---

## 3. The funnel's leaks

Walking the path, marking each drop.

**Home → assessment (`src/app/page.tsx` → `/assessment/start`).** Leak: the homepage offers two CTAs ("Take the assessment" / "View the curriculum") plus three tile CTAs ("Begin the free assessment" / "See the In-Depth" / "View the curriculum"). That's five competing primary actions above the ROI Dossier. The COO who arrived already-curious has no idea which one is for them. The mental model the page wants — a ladder from free → $99 → $295 — is not enforced by visual hierarchy. The tiles are equal weight.

**Assessment intro → questions (`/assessment/start` → `/assessment`).** No major leak; the start page should be lean. Worth verifying that mobile users get straight to Q1 in under three taps.

**Questions → email gate (`/assessment/page.tsx:84-110`).** The H2 is *"Your readiness report is ready."* Then: *"Enter your work email to see your score, tier, eight-dimension breakdown, and a starter artifact keyed to your weakest area."* This is the biggest leak in the funnel and it is by design (per the 2026-05-18 DECISIONS entry reversal). The fix the team made — moving from 8 to 12 questions for more sunk cost — is correct. But the page asks for a work email **and a first name and an institution name** (per the `EmailGate` capture extras on lines 121-124). On a phone, after 12 questions, asking for three fields is one field too many. Drop the institution name to optional with a placeholder; first name is fine. Verify on a real iPhone in low signal.

**Email gate → results.** No major leak if email captures cleanly. One small one: the inline rendering relies on `window.scrollTo(0, 0)` in a `requestAnimationFrame` (`page.tsx:48-57`). On iOS Safari with momentum scroll mid-animation, this occasionally no-ops and the user lands mid-page. Cheap fix: scroll the score heading into view by ref, not the document top.

**Results → `/courses/foundation/program`.** This is the largest unexamined leak. The results page (deferred component `ResultsViewV2`) is supposed to land the user on a recommendation. From the homepage tile copy ("a tailored starter artifact you can take to your team this week"), the implicit promise is that the result connects to the course. The actual route from results into the program page is not visible in `src/app/assessment/page.tsx` — it lives inside `ResultsViewV2`. Whatever's there, the question to answer in QA is: **does the score in any way personalize what the program page shows?** If the result is "Early Stage" and the program page renders the same generic curriculum as for "Ready to Scale," the funnel teaches the user that their assessment was decorative. They will not pay $295 for a decoration.

**`/courses/foundation/program` → `/purchase`.** Looking at `program/page.tsx`, the page is enrollment-aware: it shows `ResumeStrip` and progress for enrolled learners, and a curriculum view for anonymous ones. There is no visible "Buy this course" CTA in the imports shown. Either it lives inside `CourseStructure` or it lives elsewhere. **A skeptic on mobile who scrolled the curriculum and is ready to pay should not have to hunt.** Verify a single, persistent "Enroll · $295" CTA exists above the fold for anonymous users.

**Module 1 → email gate (the M2–3 hop).** Per the PM report, the email-gated free tier (M2–3) is **not implemented**. This is Blocker 02 in the PM report and it is correctly flagged. The current state is that the spec says "free → email → paid" and the build says "free M1 → paid M2-onward" (with M3 carrying a client-side $295 overlay that's UI-only and not server-enforced — Blocker 03). The funnel as-shipped therefore collapses the email-capture rung. **My disagreement with the PM report:** it presents this as a decision the owner needs to make. I would push harder. The single best place to capture an email is **right after M1 finishes**, when the learner has just felt the dopamine hit of seeing AI clean up the Henderson email. Cutting that capture point and paywalling at M2 destroys the only natural lead-magnet moment the course has. Build the email gate before launch — not as a future iteration.

**M3 → M4 paywall.** Even if the M3 client-side overlay is purely cosmetic (it is), it telegraphs an intent that conflicts with the spec. The PM report calls this "Blocker 03" and asks for a reconciliation. A learner who hits a fake paywall on M3 and then a real one on M4 will assume both are real and bail. Either pull the M3 overlay or commit to "M3 is the conversion finale" — but the experience HTMLs `module-1-experience.html` through `module-3-experience.html` cannot disagree with each other.

**M4 → M12.** The biggest content drop in the funnel. The PM report does not flag this clearly enough so I will: **the locked spec for M4 is "Your AI Work Profile" — a guided press-Run sandbox, meeting-notes transformation, tool comparison, identity artifact "My AI Work Profile." The `module-4-experience.html` that was actually built is "The AI Workbench" — a Branch Performance Brief, three-risk operational analysis, compliance review of an auto-loan campaign draft.**

These are not the same module. They are not even the same kind of module. M4-spec is the gentle sandbox debut for a fearful first-time user. M4-built is an analyst lab with multi-section reports about "operational risks" and "what's missing from this dataset" — material that belongs in an AiBI-S/Specialist course, not Foundations. This is the single largest deviation in the build. **Disagreement with the PM report:** its "Curriculum deviations" section, in the part I sampled, calls the build "faithful." The M4 experience HTML is not faithful to the locked M4 spec. Whether the rebuild is *better* than the spec is a separate question; the conversion problem is that the paid-tier debut now feels nothing like the free-tier hook. A learner who calmly cleaned up the Henderson email in M1 and bought based on that vibe will hit M4 and feel they bought a different course.

**M12 → certificate.** Per PM Blocker 01, the certificate is **not auto-triggered on M12 completion.** If the learner finishes the lab and nothing visible happens, the entire finale collapses. The spec is explicit that the certificate is "quiet acknowledgment, NOT celebration theater" — fine — but quiet acknowledgment that requires the learner to find a button is worse than confetti. Ship this before launch.

---

## 4. Curriculum-internal weaknesses

**Over-promising vs. delivery.** The PM report says M4 is "Built this session · 1555 lines HTML." The locked spec for M4 is the sandbox-debut module with "Press Run" as the emotional center, a meeting-notes transformation as the first task, and "My AI Work Profile" as the artifact. The 1555-line HTML delivers a far more ambitious Workbench experience instead. Either the spec needs to be rewritten to match the built artifact, or the built artifact needs to be ripped out and rebuilt against the spec. Carrying both forward is the worst option — the program landing page reads from `foundation-program` content and will describe one module; the learner will experience the other.

**Filler suspects.** Two candidates from the locked specs:

- **Module 7 — "Which Tool, When?"** is the only module with no sandbox and no artifact beyond a "routing cheat sheet." The spec defends this as a judgment module, fine. But its actual content — *"writing tool gives a confident sourceless answer; research tool gives links"* — is one screen of content padded into a 10-12 minute module. A skeptic will read M7 and think *that was a paragraph, not a module.* Consider folding M7 into M4 or M10 and tightening to 11 modules total.
- **Module 11 — "Your AI Toolkit"** is the emotional culmination, but on inspection it is a then→now reveal of cards the learner already has, followed by a "add your own card" exercise. That is a recap with one new beat. The spec explicitly warns *"do not let it become recap/inventory week — it must feel like 'I accidentally built an operating system for my work.'"* Whether the experience HTML clears that bar matters more than any other module's craft, because M11 is the *retention* module. From the PM report's brief description ("then→now reveal of 11 cards in four warm groups"), the risk it lands as inventory is high.

**Tonal drift.** Inspecting M4's built experience HTML, the headings — "Operational risks — what these numbers point to," "What we don't know that would change the picture," "Questions to answer before sharing or acting" — are excellent **analyst voice**. They are **not the calm, low-ego, recognition-first voice** the spec mandates for all 12 modules. The spec's #1 named risk is "tonal drift later." M4-as-built is where the drift began. M8 onward in the experience HTMLs needs a tone audit against M1-M3.

**Banking-specific edge.** The course's strongest banking-specific moments are:
- The Henderson loan email in M1.
- The NCUA-vs-FDIC hallucination in M2.
- The check-hold member reply in M3.
- The adverse-action letter abstraction in M9.
- The deposit-on-hold finale in M12.

That is **five genuine banking moments out of twelve modules.** The rest is generic prompting/safety/workflow content that any "AI for Professionals" course would teach. The course's marketed differentiation — *built exclusively for community banks and credit unions* — is real in those five moments and decorative in the other seven. M5 (Project Brief) uses a "warm member-reply" example but the brief structure is the same one a marketing agency would teach. M6 (Documents) uses "a sample wire-transfer procedure snippet" but the workflow is the same one a law firm or HR team would use. M10 (Roles) is the closest the back half gets to banking-specific content — the role selector is the right move — but the three "iconic moments" ("What matters here?" / "Make it plain." / "Set it up once.") are universal knowledge-work primitives, not banking primitives.

This is fine if the marketing matches. The marketing currently overstates the banking specificity. Either deepen the banking content (M5 should rebuild from a real BSA/AML talking-points draft, M6 from a real Reg E procedure, M11 from a real loan-officer's recurring tasks) or soften the marketing claim. Do not run a generic course under an "exclusively for community banks" banner — that is the exact thing a community-bank COO is sensitized to.

**Signature lines that do real work vs. marketing-by-repetition.** The spec is unusually self-aware about signature lines. The ones that earn their keep:

- *"It's a confident new hire who writes well but doesn't truly understand."* (M2)
- *"You stay in the chair. The tool drafts; you decide."* (M2)
- *"Would I be fine if this showed up outside the bank?"* (M6 → M9)
- *"Strip the specifics, keep the structure."* (M9)
- *"Do it twice? Save it."* (M11)

These are operational — a learner could repeat them to a coworker and the coworker would understand. The ones that are marketing-by-repetition:

- *"You're not 'a natural with AI.' You just know how to ask."* (M3) — empty.
- *"You're not someone who's read about AI anymore. You're someone who's used it."* (M4) — circular.
- *"You've stopped thinking about 'AI tasks.' You're just handling your work."* (M10) — flat.
- *"This stopped being 'AI tools' a while ago."* (M11) — flat.

Every module closes with an "identity close." By M12, the identity-close pattern has become a tell — the learner can predict it. The closes from M3 onward should be cut by half and the survivors made shorter. The "confident new hire" metaphor (M2) is the course's strongest single device; lean on it instead of repeating identity statements module-after-module.

**Is Foundation distinguishable from a generic prompting-for-professionals course?** Honestly: 60% yes, 40% no. The five banking moments and the Ledger editorial voice carry the distinction. The middle six modules (M5–M10, minus the role selector in M10) do not. A graduate of this course and a graduate of a well-written "AI for Lawyers" course would arrive at the same skill ceiling.

---

## 5. Trust and credibility risks

**Where the safety story cracks.** M9 is the safety spine, and the design is right (three colors, "strip the specifics, keep the structure"). But the safety story cracks earlier — M4's "made-up data only · we pay for it · prompt pre-written · nothing to break" reassurance chips are an excellent pedagogical move and a credibility risk. A compliance officer will ask: *what model? hosted where? what is your data-retention policy? do you sign a BAA?* The course does not answer these on any page I read. If the sandbox runs on Anthropic/OpenAI (per the .env documentation in CLAUDE.md), and a learner's curiosity leads them to paste real customer data despite the warnings, **the bank has a problem and so does AiBI.** The course depends on the learner believing "nothing to break" — and that belief is enforced by exactly one warning line. A single highly publicized incident (a teller pastes real data into the sandbox, screenshots it, posts it) collapses the brand. Recommend: a one-page **Sandbox Privacy & Data Handling** doc, linked from M4's reassurance chips, that names the model provider, the no-training assertion, the retention window, and a banked promise that the bank's legal team can show their examiner. Without it, M4's safety story is a vibe, not a policy.

**Unsourced numbers, hand-wave metaphors.** The course is unusually disciplined about *not* using statistics in the learner copy — good. The metaphor problem is real, though. The "confident new hire who writes well but doesn't truly understand" line is repeated across M2, M8, M10 (implicitly). The metaphor is excellent the first time and increasingly worn by the third. By M10 it reads as the course's tic. Rotate it: M2 keeps the metaphor; M8 should reach for a different one (workflow ≠ new hire; workflow = a kitchen line, or an assembly line with stations and a checkpoint).

**Tile 1 copy on the homepage** (`page.tsx:58-61`): *"Twelve questions, three minutes. A score, a tier, and a tailored starter artifact you can take to your team this week."* The "tailored starter artifact" promise is a credibility risk if the artifact is generic. If the same 4 tiers receive the same 4 starter artifacts, "tailored" overstates. If the artifact is genuinely keyed to the learner's weakest dimension (per the email-gate copy on `page.tsx:108`), the language should say *"keyed to your weakest dimension"* on the homepage too. Right now the homepage and the email gate make different promises about the same artifact.

**The certificate — credible or anticlimactic?** The spec deliberately understates the certificate (M12 step 6): no seal, no gold, no score, copy is *"AiBI-Foundation · The AI Banking Institute · [name] can use AI thoughtfully, safely, and practically in real banking work — and has the system to keep getting better at it."*

The case for "credible": every gold-seal, gamified, badge-with-points "AI Master" certificate on the market reads as theater. The Ledger restraint reads as institutional confidence. A community-bank COO who has seen a hundred LinkedIn badges will respond to one that looks like it could hang on an office wall next to a CFA. The understated treatment is *why* it's credible.

The case for "anticlimactic": $295, twelve modules, and the payoff is a serif sentence with the learner's name. A learner who paid out-of-pocket (not employer-reimbursed) will feel underwhelmed. They wanted something to post. They got something to print.

**Pick one:** keep the understatement, **but ship two artifacts** — the editorial certificate (for the wall) **and** a separate, deliberately small, shareable badge image with the same Ledger restraint (for LinkedIn). Two artifacts serve two audiences without compromising the brand's voice. One artifact serves one audience and disappoints the other.

---

## 6. What a hostile competitor would say

> **Just took "AiBI-Foundation." A few honest notes.**
>
> The good: the writing is genuinely nice. Editorial voice, no hype, no "supercharge your bank." That's rare.
>
> The bad: it's a $295 prompting course in a tweed jacket. Twelve modules, maybe four of them are actually about banking — the rest is the same "give it context, check the output, save your prompts" advice you can read in any free Anthropic guide. They call the prompts you save "cards." They are not cards. They are prompts.
>
> The tagline is "Turning Bankers into Builders." Nobody builds anything. You learn to ask ChatGPT politely and check its work. That's a useful skill. It is not building.
>
> The certificate is one sentence on a beige page. They'll tell you it's intentional. Print it and show it to your CFO and ask if it was worth $295.
>
> The "Sandbox" is a chat box with their key on it. There is no published data policy. If you're at a regulated institution, ask your compliance team about that before you let your staff anywhere near it.
>
> Verdict: lovely design, honest pedagogy, oversold. Skip the marketing tier; if you want the substance, Anthropic's free prompting docs will get you 80% of the way there for free, and your bank's compliance officer has views about the other 20%.

---

## 7. The five hardest fixes

Rank-ordered by importance, not ease.

1. **Reconcile M4-spec with M4-built — pick one and ship it.**
   *Why this is worth the disruption:* The paid-tier debut module currently does not match its own locked spec. Whichever direction wins (the calm "Press Run" sandbox debut, or the analyst Workbench), the program landing copy, the M3→M4 transition, and the marketing tile all have to agree. Carrying both forward is the most expensive option.

2. **Publish a Sandbox Privacy & Data Handling page and link it from every sandbox surface.**
   *Why this is worth the disruption:* The entire course's safety credibility rests on the learner trusting the sandbox. That trust is currently asserted in two lines of UI copy. One incident undoes the brand. Compliance officers will ask.

3. **Ship the email-gated M2–3 tier and the auto-triggered M12 certificate (PM Blockers 01–02).**
   *Why this is worth the disruption:* Without the email gate, the free → paid funnel has no lead-capture rung between assessment-results and a $295 paywall — that's a cliff, not a funnel. Without the certificate auto-trigger, the finale collapses silently. These are not nice-to-haves.

4. **Either deepen the banking specificity in M5–M8 with real (anonymized) banking artifacts, or soften the "exclusively for community banks" claim.**
   *Why this is worth the disruption:* The course's pricing and credibility both depend on the banking-specific positioning. The middle six modules currently undercut it. Banks pay for banking; they don't pay for "AI for Professionals" in a banking wrapper.

5. **Fix the homepage tagline-to-product mismatch — drop "Builders" or commit to teaching one real piece of building.**
   *Why this is worth the disruption:* The skeptic's bounce risk in §1 is real. "Turning Bankers into Builders" sells a course that teaches one Make.com / Zapier-class workflow end-to-end, or an Excel + Copilot data task. If the course stays at its current scope, the tagline needs to come down to match. Either change is fine; the gap is what kills it.

---

## 8. What the course gets genuinely right

The voice. The course's editorial register is the best thing I have read in commercial AI training. The discipline against hype, the refusal to use the word "leverage" (caught and called out in the PM audit), the *"the check-points are the point"* line in M8 — this is real craft, not marketing. A community-bank COO who reads M1 and M2 will recognize a colleague's voice, not a vendor's.

The Henderson email in M1 does real work. It is the strongest single demo on the site. The before/after is genuinely persuasive — not because the AI did anything magical, but because the learner sees what *they* could do with thirty extra seconds. That moment is the funnel's actual conversion engine. Protect it.

M2's "confident new hire who writes well but doesn't truly understand" is the metaphor the rest of the field is missing. Most AI safety training reads as fear theater. M2 reads as a senior banker explaining a junior banker to a peer. That is the right register for this audience and it is hard to do.

M9's "strip the specifics, keep the structure" is the safety move that makes the rest of the course work. It is also the line that, by itself, justifies a one-day workshop for any community bank's staff. If a single slide from the course makes it into the lobby of a CISO's office, it should be this one.

The Ledger refresh, where it has landed, is genuinely distinctive. The retired italics, the single accent color, the editorial typography — when these hold (the PM report, the program landing, the certificate face), the brand feels institutional in a market full of SaaS pastel. The homepage hero still has work to do (§1), but the design system is real and most of the course will benefit from it.

The decision to make the certificate quiet rather than gamified is correct. So is the decision to teach mapping rather than building in M8. So is the deliberate restraint in M11 against treating it as inventory week. The spec author understands the pedagogy. The remaining gaps are between spec and build, between marketing and product, and between "calm professional confidence" (what the course delivers) and "Turning Bankers into Builders" (what the homepage promises).

Close the three gaps and the course is genuinely good. Ship them open and the goodness is invisible.
