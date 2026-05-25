# Foundation Course Critique — Priya Subramanian, Sr Operations Analyst, Heritage FSB ($2.1B)

**Reviewer profile:** 6 yrs (2 Big-4 audit + 4 back-office ops at Heritage Federal Savings, $2.1B, ~340 FTE) · Excel + Fiserv DNA every day · ~20 sessions with Copilot · MBA in progress · 29.
**Reviewed:** all 24 lessons (M0.1 → M5.5) + the post-M3 gate · `back_office` track variants pulled from `addie.lesson_track_variants` · 55 knowledge-check items · 13 exercise scaffolds · 2026-05-24.
**Methodology:** Read every `lessons.body_md`, every `back_office` row in `lesson_track_variants`, every `knowledge_checks.options` payload, and every `exercises.task_scaffold`. Walked the rendered lesson pages and the gate. Applied two lenses: a back-office Ops manager's "would I actually run this with 24 analysts?" lens, and a modern UX/learning-design lens (Sweller cognitive load, Bruner scaffolding, worked-examples).
**Disclosure:** I am the person being asked to recommend a $295 × 4 spend. Bias toward skepticism is intentional.

---

## Headline

- The course's strongest move is teaching **data discipline as habit, not policy** (M0.2 → M2.3 → M3.4 → M4.4). That floor is real, it's reinforced six times, and it's the thing my VP would actually pay $295 to instill. Everything else trades on that floor.
- The **free side (M0–M3) is honest and useful** for a back-office analyst. The four-part brief, the five patterns, the side-by-side sandbox, and the M3.5 Starter Prompt Pack are something I would run for the whole 24-person Ops group tomorrow, free.
- The **paid side (M4–M5) is where the bridge starts to wobble.** M4's "skill" is genuinely useful for ops. M5's PRD lesson is shockingly grown-up. But M5.4 walks a non-developer to four prototyping tools whose differences the course does not honestly explain, with no on-rails completion path inside the course itself. For four senior analysts at $1,180, that's the part I have to defend to my VP.

## What works (with lesson IDs)

**M0.2 — data discipline.** "Describe the situation, not the person" is the right single rule, and the off-limits sorter (`m0-2-off-limits-sorter`) re-grounds it per track. The back-office variant is honest about *our* reality: "customer lists for campaigns, mailers, segmentation, or reactivation. Transaction files, payment exports, statement runs. Non-public internal financials — branch P&Ls, channel margins." That is literally my Tuesday afternoon. Not a generic "don't paste PII" — it names the artifacts.

**M1.1 — "predictive token engine."** Cold-opening on the mechanism and treating hallucination as *a property, not a bug* is the framing I would want every analyst on my team to internalize before they touch Copilot for anything load-bearing. The three properties (training cutoff · no live knowledge · hallucination) are the model I wish someone had given me before my first 19 Copilot sessions.

**M1.2 — assistants vs. builders, with the verb test.** Genuinely useful. "Read the verbs in the marketing copy" is the kind of heuristic an analyst can carry into a vendor demo. The 2x2 sort is a forty-five-second mental model that survives contact with a Gartner email.

**M2.4 (back_office variant) — the worksheet.** Seven fields, all of them match my week:
- recurring procedure document I maintain
- report I assemble from the same components every week or month
- exception or research note I write from a template
- long email chain I'd like summarized
- spreadsheet I describe to someone in plain language
- training note for a new teammate
- one thing I'd never put through any AI tool

That is the most accurate description of a Heritage Ops week I have read in any banking-AI material. Including, regrettably, Jack Henry's.

**M3.1 + M3.3 — the four-part brief and five patterns.** Role · Task · Context · Format is the right minimal scaffold. The five patterns (default, few-shot, chain-of-thought, constraints, ask-what's-missing) cover most of what an analyst actually needs. Pattern 4 (constraints — "do not cite any regulation not named in the source; say 'not specified in the source'") is the single most useful sentence in the entire course for someone writing exception narratives.

**M3.4 — the violation drill.** Twelve scenarios with violation / clean / borderline-with-fix is the right shape. Critically, it has *borderline* — that's where ops actually lives. Q1 in the drill (`m3.4#1`) is a textbook loan-officer screw-up that any of us could make at 3pm on a Thursday.

**M3.5 (back_office variant) — the prompt that ships.** "Rewrite the internal process memo below as a one-page operator summary: who owns what, what the trigger is, the three steps, and the escalation path. Plain English, no jargon, under 250 words. The memo contains no customer data." That is a usable prompt. I would put it on my desktop today.

**M4.1–4.2 — the "skill" concept.** Locked choices + named input slots is the right anatomy and the right metaphor. M4.1's warning ("avoid skills that do five things") and M4.2's instruction ("name your skill like a procedure, not a file — 'Reg summary for tellers' beats 'untitled_skill_v3_FINAL'") are exactly the muscle an analyst needs.

**M4.4 — the four-question guardrail check.** Four questions that travel with the saved skill record:
- does it cite anything outside the slot material?
- comfortable sending as-is?
- where does it need a human pass?
- one input pattern that would break it?

This is the only piece of the whole course that I think rises to the level of an *audit artifact* — something a model-risk team would actually look at. If you stripped everything else, kept M0.2, M3.4, and M4.4, you'd still have something defensible.

**M5.3 — the lightweight PRD.** Nine sections, goal/non-goals/users/constraints/success criteria/scope-in/scope-out/dependencies/risks. The "non-goals" insistence and "success criteria must be measurable without asking" rule are both more rigorous than the PRDs I see internally. The lesson is honest about *what good looks like* in a way that, frankly, our project-management training is not.

**The gate (`/foundation/gate`).** "You crossed the free line. Three doors. Pick one." No countdown, no scarcity, "no cohort opening soon, there is no early-bird, choose what fits." The team-buy section at $199/seat (min 10) sits below the individual cards on a parchment field — visible but not pushy. Reassurance strip ("Your progress and artifacts are kept. Come back when you have ten minutes."). After being assessment-walled by every SaaS vendor in banking, this restraint is conspicuous, and good. The "Milestone · Module 3 complete" mono kicker is a nice editorial flourish that doesn't tip into celebration kitsch.

## What's weak — gaps for Ops staff

**1. The course never says the word "spreadsheet" outside the M2.4 worksheet.** This is the single biggest gap for a back-office audience. My week is spreadsheets. So is every back-office analyst's week. The course teaches me to rewrite a *memo*, but the use-case I most want help with — building a recurring reconciliation packet, writing a VLOOKUP variant, drafting a macro to flag exceptions in a payment-export CSV — never appears. The M1.3 back-office audio gestures at it ("structured data wrangling on safe inputs disappears as a friction. Reformatting a vendor's CSV into your template") but the rest of the course doesn't follow through. By M5.4 the prototyping tools are Lovable / Replit / v0 / Claude Code — none of which is Excel.

This matters because the M4 "skill" concept is a saved prompt. Most of my actual reusable artifacts are saved *spreadsheets* with formulas, conditional formatting, and pivot tables. The course doesn't acknowledge that a useful "skill" for an Ops analyst might be a Copilot-in-Excel prompt-with-context, not a Claude system prompt.

**2. The "operations work IS files with PII" problem is named but not resolved.** The M0.2 back-office variant lists the things I can't put in an AI tool. It then says, accurately, "The help is almost always available without the file. You can ask for a cleaner version of an internal process memo, draft a press release about a public product launch, rewrite operations procedures for clarity, or think through campaign concepts in the abstract. When the work needs real records, do the work in the approved system and bring only the question to the AI tool."

That is correct, and it leaves me with: *if my work IS the records, what AI does for me is shrunk to "rewrite my memos."* Which is fine, and worth $0, but it doesn't earn $295. The course never names a single approved-tool pattern (M365 Copilot under our tenant, an internal Bedrock endpoint, a redaction step) that would let an Ops analyst do the work *with* real records. M2.1 mentions sanctioned tools and SSO twice and then drops it. M5 never returns to the question of "what do you build if your data has names attached?" The honest answer is "not yet, not without your bank running its own infra," but the course never says that.

**3. The M2 → M5 bridge has one missing step.** Module 2 ("here's what to do with AI"), M3 (prompts), M4 (saved prompts = skills), M5 (build a prototype). The thing M5 actually wants me to build is a small *app*. Where did the leap from "a saved prompt for memo rewrites" to "a working app prototype with a PRD" come from? M5.1 lists the artifacts the module produces (problem backlog → PRD → prototype URL), and M5.2 frames the problem nicely, but nowhere does the course earn the verb *build* in the title M5.4 "Build a prototype." I've gone from saving prompts to deploying software in one lesson.

**4. M5.4 is the lesson the upgrade decision hinges on, and it punts.** Fifteen minutes of in-course time, then *"the build is the next hour or two outside this course. Bring back a URL."* That is honest but it's also where the $295 stops being a course and starts being a referral to four products with very different shapes that the course does not honestly distinguish:
- **Lovable** — full-stack web app builder, opinionated, deploys for you
- **Replit Agents** — running scripts and small apps in Replit's environment
- **Claude Code** — terminal-based agent that writes real files in a real git repo
- **v0** — React UI mockups, Vercel-flavoured, not a deployable app on its own

The lesson body says "Lovable (pages/apps) · Replit Agents (running scripts) · Claude Code (real files + version control) · v0 (React UI mockups)." That's a fair one-liner each. But the knowledge check for M5.4 (`m5.4#1`) tells me Claude Code is the right pick when "another developer at the bank could pick it up." For an Ops analyst who has not used git, "real files + version control" is a feature I cannot use and an answer I cannot get to. The correct paid-tier teaching here would be a *decision tree* tied to the artifacts I have *(your PRD describes a static info page → Lovable or v0; describes a recurring script you want to run → Replit; describes a tool you want a developer to maintain → Claude Code)*. The course gestures at this with "match to your PRD" but doesn't ship the gesture.

Also: lumping v0 in alongside Lovable suggests the author hasn't actually shipped with either. v0 spits out React component code that you have to put somewhere; Lovable scaffolds and hosts. An ops analyst will get burned picking the wrong one for a process-rewrite tool and conclude AI doesn't work.

**5. Knowledge-check rigor falls off after M3.** M0.1 and M1.1 have three options each, all genuinely plausible distractors. M2.1.1 ("Use a personal hotspot on a work device" / "Ask IT or risk which tool is sanctioned" / "Email a customer file to your personal account") and M3.4.1 (the loan-application paste) are *good* — they punish the second-most-tempting answer, which is how I'd assess my analysts. M5.5.1 is the worst question in the course: it asks which of three ninety-day directions is "wrong," and the correct answer is "none — the lesson is explicit that none of the three directions is wrong." That's not assessment, that's filler. If I see that on a knowledge check I assume the rest are filler too. Pull it.

**6. The "Workbench Pack" appears in M5.1 with no preamble.** M5.1's `[case:good] Skill — the assistant with a job` says: "Set up once; reuse many times against the same shape of task. **The Workbench Pack is five skills.** Human in every loop; the loop is shorter." First mention. The Workbench Pack is not defined in M4 — M4 builds *individual* Working Skills and a `skill_template` artifact. M5.5 then lists it among the artifacts I have produced: "You now hold a Data Discipline Card, an AI Toolkit Map, a First Conversation, a Starter Prompt Pack, **a Workbench Pack**, a Problem Backlog, a PRD, and a prototype URL." Where did the Pack come from? Either an M4 lesson is missing, or M5.1 and M5.5 are referencing an artifact that the curriculum used to produce in an earlier draft and no longer does. From the `artifact_type` enum (`data_discipline_card`, `ai_toolkit_map`, `first_conversation`, `starter_prompt_pack`, `skill`, `skill_template`, `agent_blueprint`, `prd`, `prototype`, `problem_backlog`, `where_ai_fits`), there's no `workbench_pack`. The course is referring to an artifact it does not produce.

**7. The "agent" framing is timid in a way that undersells the M4 skill.** M5.1's `[case:bad] Agent — AI steps that take actions` correctly cautions against today's agents on member-facing flows. Good. But the same lesson then describes the M5.4 prototype-builder tools (Replit Agents, Claude Code) as builders the learner should "brief and trust for an hour." Claude Code *is* an agent — it reads files, writes files, runs commands inside its loop. The course teaches me to be skeptical of agents on m5.1 and then to use one to build my prototype 15 minutes later, without naming the tension. An ops analyst notices that.

## UX findings (modern UX principles)

**Information architecture — the word "skill" arrives late.** The artifact enum names it `skill` and `skill_template`. M2.4 produces `where_ai_fits`. M3.5 produces `starter_prompt_pack`. M4.1 introduces the *word* "skill" formally, but learners have already saved a "Starter Prompt Pack" (which is, definitionally, a collection of skill-shaped things) in M3.5. The concept exists in M3.5; the name lands in M4.1. A learner returning to their Toolbox in week 3 sees "Starter Prompt Pack" and "Working Skill" and reasonably asks: *what is the difference?* The course never explicitly says.

**Concept stability — six names for adjacent things.** From the corpus: *prompt*, *Starter Prompt*, *Starter Prompt Pack*, *Working Skill*, *Skill Template*, *Workbench Pack*, *Toolbox card*, *Toolbox artifact*. The lesson body of m0.1 says "Every lesson produces something real — a prompt, a reusable skill, eventually a small app — and saves it to your Toolbox." Three names in one sentence for "thing you save." If I'm a senior analyst trying to teach a junior teammate what we just did, I have to translate. Pick one of *artifact* or *card* and use it consistently; reserve *skill* for the M4 parameterized object specifically.

**Scaffolding (Bruner) — works for M0–M3, breaks at M4→M5.** M0 → M1 → M2 → M3 each builds on the previous (rule → mechanism → access → prompt-craft). M4 ratchets up correctly (saved prompt → parameterized skill → tested skill). The cliff is M4 → M5. M4 ends with "a verified piece of your toolkit." M5.1 opens with agents, then jumps to writing a PRD by M5.3. Where in the previous four modules did I learn to write requirements documents? Nowhere. M5.3 is a *terrific* PRD lesson — but it's a 200-level lesson dropped into a 100-level course.

**Worked examples (Sweller / Atkinson) — strong in M3, weak in M5.** M3.1 walks through the four-part brief with an accumulating example. M3.3 prints all five patterns in full text. M3.5 (back_office variant) gives me the literal prompt I could paste. By contrast, M5.3 lists the nine PRD sections with one-line guidance each but never shows me a *complete filled-in PRD* for a back-office problem. The lesson body promises "thirty minutes the first time, ten the next" — but I'm a back-office analyst who has never written a PRD. The first time will be ninety minutes if I get it at all, because I don't have a model of what done looks like. Show me one. One worked example would cut the cognitive load in half.

**Discoverability — Toolbox is the right metaphor, finding things in three weeks is the open question.** I save 8+ artifacts across the course. Three weeks later I need the back-office memo-rewrite prompt. Is it in "Starter Prompt Pack" or "Working Skills"? Both? Is the M4 version a *new* artifact or a *revision* of the M3 one? The `toolbox_item_versions` table suggests versioning is built; the lesson body never says how versions are surfaced in the Toolbox UI. Without that, the Toolbox is a graveyard.

**Microcopy — "save your card" is doing too much work.** m0.1 lesson body: "save your card" doesn't appear, but the system prompt language flips between "Save to Toolbox," "Save as artifact," "Add to Pack," "Save it as 'Process rewrite to one page'." Each is fine in isolation; together they read as four different verbs for the same action. Pick one. The brand voice rules ("Saved beats remembered") suggest *save* is the verb, but then *card* (M4.1 says "the card") and *artifact* (the enum, the toolbox table) and *Pack* (M3.5) compete. Memory note: I'm told elsewhere in this project that the user has corrected the team on this — call saved items *prompts* not *cards*. The course is still using *card* in some surfaces.

**Error recovery — track-switching is on a settings page nobody finds.** M1.3 knowledge check `m1.3#2` says: "change the track on your profile and replay the lesson." There is no in-lesson "switch track" affordance. If I misclicked Customer-Facing on the M0 track picker (because I do work with members occasionally, even though I'm Ops), I'm now reading audio variants designed for someone else for 7 lessons before I figure out how to fix it. Surface a small "Switch role view" mono kicker in the lesson chrome.

**Cognitive load — extraneous load spikes on the sandbox lever UI.** I haven't seen the sandbox UI itself but the exercise scaffold for `m3-2-ab-output` references `lever_directives` expressed as JSON; the lesson body refers to "audience swap · length sweep · source swap" as the three runs. If those levers are exposed to the learner as separate UI controls (audience dropdown, length slider, source picker), each lever costs working-memory cycles that should be spent on noticing the *output difference.* Considering m3.2's whole point is to notice how the brief moves the output, the lever UI needs to be minimal — two pre-set runs side-by-side with a single "swap this" toggle is enough. Three controls + a Run button is too many for a teaching surface.

**Pacing — durations are mostly honest, two are not.** `duration_min` field is capped at 15 in the schema (good constraint). 24 lessons average ~11 minutes, totals ~265 minutes (~4.5 hours). That's accurate for free-side reading + watching. The sandbox lessons (m2.3, m3.2, m3.5 at 15 min each) understate; m3.5 in particular asks me to "pick three real tasks · draft four-part briefs + one pattern · run · save" and that is not 15 minutes for someone doing it for the first time. M5.4 says fifteen minutes in-course "then the build is the next hour or two outside" — at minimum say "expect ~2 hours total" up front, not bury the real time after the wall-clock claim.

**The M3.5 → gate transition is the strongest single UX moment.** The lesson script literally says: "After this lesson the three-way gate appears. Pay to continue into M4–M5; give us an email to keep your Pack; or decline and walk away. The Pack is yours either way." That is the right disclosure at the right time and the gate page lives up to it. The "your work is yours either way" framing is what convinces me to give them an email rather than close the tab.

## Track variants (back_office) — does the role lens hold up?

Five branched lessons (m0.2 sorter, m1.3 audio, m2.4 worksheet, m3.5 prompt seed, m4.3 role-skill). Counted from `addie.lesson_track_variants` for `back_office`: only **five** rows exist (m0.2, m1.3, m2.4, m3.5, m4.3). That matches the schema's `is_branched=true` flags. Good fidelity.

**m0.2 back_office** is the strongest variant. Lists exactly the artifacts I touch (customer lists, transaction files, payment exports, branch P&Ls, employee PII, contact data). Names the rule of thumb honestly: "if you would have to email a list to a vendor under contract for the same task, an AI tool is not the place to short-circuit that process." That sentence is worth the page.

**m1.3 back_office audio** quote is good — process memos, marketing copy from public sources, structured data wrangling on safe inputs. "Better procedures, faster public-facing copy, fewer thirty-minute interruptions" is the right pitch for my VP. Half a page; would benefit from one specific named example (a 30-page procedures binder collapsed to a one-page operator card).

**m2.4 back_office worksheet** is excellent (see above).

**m3.5 back_office** prompt is the most useful single artifact in the course. I would deploy this prompt unmodified.

**m4.3 back_office** introduces a "competitor-research compiler" as the example skill. This is the variant that *misses my seat hardest.* Competitor research is a marketing/product job, not a Sr Ops Analyst job. The track is named *Back-Office Process,* and the lesson opens with "Marketing, product, and ops all need the same shape of brief." When you bundle three roles under one track, you end up with an example that fits one of them. An ops-flavoured example would be a *recurring-exception narrative* — same locked role (operations lead), same locked format (one-page operator summary), same constraint, but the input slot is "this week's exception report excerpt (anonymized)." That is the skill I'd actually save.

**The Toolbox seeds are sound.** From the `back_office` variant text, the artifacts a back-office learner walks away with are: m0.2 Data Discipline Card scoped to internal lists/financials/employee PII; m2.4 `where_ai_fits` worksheet seeded with seven recurring procedural artifacts; m3.5 a Starter Prompt Pack centered on memo rewrites and template conversions; m4.3 a "Process rewrite to one page" skill. That set is internally coherent and matches the role. The disconnect is between *that coherent free set* and the M5 prototype — none of the four free artifacts naturally extend into "now build an app."

## Gate experience

Walked through `GateScreen.tsx`. The ink hero with the gold star/milestone kicker, "You crossed the free line. Three doors. Pick one." in 48-point Newsreader is the right tone — celebratory without being congratulatory in the bad way. The three-card grid (Pay · Email · Decline) presents the options as equal-weight, which matches the lesson body's promise. The team-buy section at $199/seat (min 10) gives me a number I can take back to my VP — that's $1,990 for ten seats, vs. $1,180 for four individual at $295. So the team SKU starts paying off at exactly six seats, which is the right break-even for an Ops group of 24.

The footer reassurance strip ("No countdowns · No scarcity · Built for bankers") is the second-strongest single piece of microcopy in the course, after "Describe the situation, not the person."

What I would change at the gate:
- Show me a one-line preview of what's in M4–M5 ("you'll build 2–3 saved skills, write one PRD, ship one prototype"). The course tells me this in m3.5's lesson body but the gate doesn't repeat it. I'm about to spend $295; remind me what I'm buying.
- The "Decline" door routes me to the $99 Readiness Assessment. That's fine but I am being asked to make a buying decision about a $99 thing right after declining a $295 thing, with no time to think. Add a "Save my Pack and email me both options later" path. The course infrastructure has it (the email-to-keep door); the *copy* doesn't surface it.
- The team-buy CTA is below the three personal doors. If you're trying to convert me — the Ops VP's delegate — into a 10-seat decision, move that hero above the individual cards or run an A/B.

## Paid modules (M4 + M5) — would you upgrade 4 analysts at $295 each?

Total ask: $1,180. Equivalent: ~24 hours of senior-analyst time at our loaded rate.

**The M4 case is strong.** Four lessons building one durable concept (skills as locked-choice + named-slot artifacts) with a built-in guardrail-check that produces an *auditable* note record. M4.3 misses the back-office seat in its example but the builder is the same regardless. After M4, each of my four senior analysts would have 1–3 reusable named prompts saved in versioned form. At $295 each, that's $59-$98 per saved prompt, which is overpriced by a factor of 2-3 for the prompt itself but reasonable if you value the discipline and the guardrail check as *training-on-rails for handling AI* rather than as ten artifacts.

**The M5 case wobbles.** M5.1 (agents framing) is good. M5.2 (problem backlog) is good. M5.3 (PRD) is excellent in isolation but feels lifted from a different course. M5.4 hands me off to one of four tools, fairly described but unequally suited to a non-developer, with the actual work happening *outside* the course environment for "an hour or two." M5.5 is a sensible wrap-up audio (not a lesson).

For a Heritage Sr Ops Analyst, M5 produces a PRD and (maybe) a prototype URL. The PRD is genuinely useful as a *thinking artifact* even if no prototype ever gets built. The prototype is genuinely at risk of being something my analyst spent four hours fighting Lovable on, gave up, and quietly closed the tab. The course has no completion telemetry of "what fraction of paid learners actually return with a prototype URL," at least not exposed to me. I would want that number before I sign off on four seats.

**Counter-recommendation: upgrade *two* senior analysts, not four.** The two strongest writers in the group — the ones who already enjoy writing exception narratives — would get the most out of M5.3 in particular. Watch them complete the prototype step. If both ship a working URL in the first month, upgrade the other two. If one ships and one doesn't, the course is doing what it should — selecting *which* of my analysts is a builder-shaped person and which is a using-AI-well-shaped person.

**Counter-counter-recommendation: free-tier the whole group; paid for two.** All 24 analysts get M0–M3 free (no email needed if they don't want to keep the Pack; email-and-keep if they do). Use the M3.5 Starter Prompt Pack as an *Ops-wide* shared library — let the team see each other's saved prompts. Then pay $295 × 2 for the strongest M3 finishers to do M4–M5. Total spend $590 instead of $1,180; team coverage 24 instead of 4. The course's own pricing logic supports this — the gate explicitly lets you keep free artifacts for an email.

Better still if there's a team plan that prices per-seat for the free side too with an admin dashboard — but the team SKU at $199/seat × 10 = $1,990 is full-course-for-ten, which over-buys for my case (paid course content for ten analysts when only 2-4 will ever write a PRD).

## Verdict

Recommendation to my VP:

1. **Roll free M0–M3 to the whole 24-person Ops group.** Two hours of (paid) analyst time each = ~48 hours total. Real return on the M3.5 Starter Prompt Pack alone.
2. **Build a Heritage Ops shared library** of the M3.5 prompts the group produces. Use the M0.2 data-discipline rule as the floor. This is the policy our VP has been asking compliance to write for nine months — the course gives us the working version of it.
3. **Pay for M4–M5 for 2 analysts initially**, $590, with the explicit assignment "complete M5.4 and return with a prototype URL within 30 days." Treat completion of that step as the actual signal, not a credential.
4. **Re-evaluate** at the 30-day mark: if both shipped, fund the other two. If neither shipped, the course is M0–M3 and we use the savings to look at M365 Copilot licensing for the Ops group instead — which is where the real PII-bearing reconciliation work has to live anyway.

Top three things The AI Banking Institute should fix before the next intake:

1. **Reconcile the Workbench Pack.** It's named in M5.1 and M5.5 as if it exists; the data model and lessons don't produce it. Either add an M4 lesson that produces it, or strip the references.
2. **Add a worked example to M5.3.** One end-to-end filled-in PRD per role track, in the lesson body. The current "nine sections with one-line guidance" leaves a non-developer staring at a blank screen.
3. **Make M5.4 honest about the tool-fit decision.** Match each of the four prototyping tools to a *type of PRD shape* on a decision tree, not a list. And acknowledge that for an Ops analyst whose work is files-with-PII, "build a prototype" mostly means "build a synthetic-data demo of a workflow you'd want approved." That's a different artifact than "ship a small app," and it deserves its own framing.

The course is honest in its voice, restrained in its visual grammar, and accurate about its scope. It is not pretending to be more than it is. For the free side, that pays off. For the paid side, it stops short of the bridge it promises.
