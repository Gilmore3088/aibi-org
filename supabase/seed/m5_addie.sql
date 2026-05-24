-- supabase/seed/m5_addie.sql
-- Module 5 — From idea to prototype: agents and building.
-- Paid tier (gated behind foundation entitlement) · 5 lessons · 3 non-LLM
-- interactive exercises (5.2 worksheet, 5.3 PRD builder, 5.4 prototype launcher)
-- · 1 video (5.1) · 1 audio (5.5). No track variants — none of M5's lessons
-- are branched x5 per the Production Tracker. Seed-only; INSERT ... ON CONFLICT
-- DO UPDATE so re-runs are safe.
--
-- All three exercises are NOT LLM exercises. The prototyping work happens
-- OUTSIDE the sandbox via a link-out (5.4 trusts the learner to paste a URL
-- they own — there is no server-side URL validation in v1; flagged in the
-- M5 build report).
--
-- Honesty rule (see m5.1 narration and m5.5 audio): we describe an agent as
-- "a string of AI steps with a goal," and we are clear that banking should
-- NOT deploy autonomous agents on member-facing flows yet. The framing
-- concepts are transferable; the autonomy is not.

-- =====================================================================
-- 1. Module
-- =====================================================================
INSERT INTO addie.modules (id, ordinal, title, tier, summary, published)
VALUES (
  'm5',
  5,
  'From idea to prototype: agents and building',
  'paid',
  'Frame a problem, write a tight PRD, ship a working prototype this week.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  ordinal   = EXCLUDED.ordinal,
  title     = EXCLUDED.title,
  tier      = EXCLUDED.tier,
  summary   = EXCLUDED.summary,
  published = EXCLUDED.published;

-- =====================================================================
-- 2. Lessons (5)
-- =====================================================================

-- Lesson 5.1 — What an agent is (video, ~12 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm5.1',
  'm5',
  1,
  'What an agent is — honestly',
  'video',
  12,
  false,
  NULL,
  NULL,
  $LESSON$
You will hear three words used interchangeably in the trade press: assistant, skill, and agent. They are not the same thing, and the difference matters the moment you start building. This lesson names the three honestly — and tells you what is and is not realistic to deploy in a community bank in 2026.

## SCRIPT (verbatim)

> "Three shapes. Three honest definitions. Then one rule for the rest of this module."

> [stat] 3 | Shapes of AI work, ordered by how short the human review loop becomes | Assistant (every loop) → Skill (shorter loop) → Agent (the loop runs inside bounds). Whether step three is a person or a model, the shape of the work is identical.

> [case:good] Assistant — the chat box
> You ask, it answers, you decide what to do with the answer. The conversation is the product. Everything from Module 3 — the four-part brief, the Starter Prompt Pack — lives at this layer. Every step is reviewed by a human.
> [outcome] Highest fidelity, slowest cadence. The right shape for any output that goes to a member or a regulator.

> [case:good] Skill — the assistant with a job
> You set it up once — system prompt, allowed inputs, what good output looks like — and you reuse it many times against the same shape of task. The Workbench Pack you built in Module 4 is five skills. The skill does one thing the same way every call. The human is still in every loop; the loop is just shorter.
> [outcome] The right shape for recurring drafting and analysis work. Consistency + speed without giving up review.

> [case:bad] Agent — a string of AI steps that take actions
> Step one decides what to do. Step two does it. Step three checks the result. Step four loops back if the result is not good enough, or stops if it is. Somewhere inside that loop the agent is allowed to take actions — read a file, write a record, call an API, send a message — without asking you first. Today's agents get confused outside their sandbox, invent steps that look sensible and are not, and occasionally take an action the loop did not catch.
> [outcome] Not yet ready for member-facing banking flows. Useful for internal-only prototypes; never connected to systems of record without a real human review point.

> "Hold those three together — assistant in every loop, skill in a shorter loop, agent that takes actions inside bounds — and you have the right map for the rest of this module. The framing for all three is the same: goal, steps, data per step, what to never do, where the human reviews. We teach the shape at the level you can ship this week."

> [tip] The fastest way to spot an oversold agent demo is to ask "what happens if step three returns a result that's plausibly wrong?" If the answer is a hand-wave, the agent has no real review point and should not run anywhere near a member.

> [warn] Anything you prototype in this module is a draft. Drafts are not deployments. Do not put a draft in front of a member, do not connect it to a system of record, do not give it permission to move money. The Foundation Course teaches you how to frame, scope, and prototype well enough that the people who can ship it build on what you handed them. That is the bridge from banker to builder.

## What you will build in this module

Lesson 5.2 walks you through writing a **problem backlog** — three problems on your desk that an AI system could plausibly help with, framed tightly enough that you could brief them to a builder. Lesson 5.3 turns the best one into a **lightweight PRD** — the one-page document that keeps any builder honest about what is being built and what is not. Lesson 5.4 takes that PRD and walks you to one of four prototyping tools where you will spend an hour outside this course and come back with a working prototype URL. Lesson 5.5 sends you onward — to the next two credentials, to the patterns emerging in community banking, and to what is realistic for your next quarter.

## PRODUCTION

- Cold open on the [stat] card "3 shapes" — the loop-shortening diagram is the visual anchor for the whole module.
- The three [case] cards land in order: assistant good, skill good, agent bad — the oxblood "bad" on the agent card is the editorial position, not a value judgment on the technology.
- Closing card: "Draft, not deployment. Banker to builder. That is the bridge."
$LESSON$,
  true
)
ON CONFLICT (id) DO UPDATE SET
  module_id              = EXCLUDED.module_id,
  ordinal                = EXCLUDED.ordinal,
  title                  = EXCLUDED.title,
  modality               = EXCLUDED.modality,
  duration_min           = EXCLUDED.duration_min,
  is_branched            = EXCLUDED.is_branched,
  exercise_id            = EXCLUDED.exercise_id,
  takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
  body_md                = EXCLUDED.body_md,
  published              = EXCLUDED.published;

-- Lesson 5.2 — Framing a problem (worksheet, ~12 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm5.2',
  'm5',
  2,
  'Framing a problem worth building for',
  'worksheet',
  12,
  false,
  'm5-2-problem-frame',
  'problem_backlog',
  $LESSON$
The single most common failure mode in early AI projects is building the wrong thing well. Not "the model was bad" — the model was fine. The problem the team built for was not the problem anyone on the floor actually had. The fix is to write the problem down before you build, in a shape a builder can read in thirty seconds and say either "yes, I can help with that" or "you are pointed at the wrong thing."

## SCRIPT (verbatim)

> "Five questions. Each one tightens the frame. Answer them for one real problem on your desk this week — not a hypothetical, not a roadmap item, a thing that costs you time or attention right now.
>
> **One: who.** Who has this problem? A specific role at your bank. Not 'customers' — which customers. Not 'the team' — which team. 'A teller on the consumer line Tuesday afternoon' is a who. 'The bank' is not. The narrower this is, the better every other answer gets.
>
> **Two: what breaks.** What does the bad day look like? A concrete moment, not an abstract metric. 'Tuesday afternoon a member calls about a hold and the teller needs forty minutes to figure out which hold and why' is more useful than 'service times are too long.' Concrete moments are what a builder can build for. Abstract metrics are what consultants chase.
>
> **Three: current workaround.** What does the person actually do today when this happens? They do something. Even if the something is 'they suffer and the member hangs up.' Naming the workaround tells the builder where the floor is. If the workaround is 'we transfer to the BSA officer,' the prototype needs to be at least as fast and at least as accurate as that. If the workaround is 'nothing — we apologise,' the floor is lower than you might think.
>
> **Four: what good looks like.** If the problem were solved, what would the Tuesday afternoon look like instead? Describe the moment, not the solution. 'The teller answers in under five minutes with the right explanation' is a frame. 'We deploy an agent' is not — that is a guess at the means. Means are easy. Outcomes are the whole point.
>
> **Five: why now.** Is there an external pressure — a regulator deadline, a churn spike, a competitor — or is this a problem you have been carrying for years that just got hot? 'Why now' tells you whether you have permission to build, or whether you are about to fight for budget. Both answers are useful; pretending you do not need to know is not.
>
> Hold those five together. Who, what breaks, current workaround, what good looks like, why now. Three filled frames make a problem backlog. The best one becomes your Lesson 5.3 PRD. The other two stay in your Toolbox for later — most people end up building one of them inside six months."

> [tip] If two of your three problems share the same "who," that is a signal — the underlying problem is bigger than either symptom. Frame the bigger problem too; it usually becomes the better PRD.

> [warn] A problem framed in solution language ("we need an agent that monitors holds") cannot be PRD'd, because every reader will picture a different agent. Force the frame back to outcome language and the conversation gets honest fast.

## PRODUCTION

- Worksheet UI with five labelled fields. Each field shows a faint example pulled from the learner's track.
- Soft progress bar at the top fills as frames are completed; the third filled frame triggers the "Save Problem Backlog" CTA.
- Closing card: "Best frame goes to 5.3. The others stay in your Toolbox for the next six months."
$LESSON$,
  true
)
ON CONFLICT (id) DO UPDATE SET
  module_id              = EXCLUDED.module_id,
  ordinal                = EXCLUDED.ordinal,
  title                  = EXCLUDED.title,
  modality               = EXCLUDED.modality,
  duration_min           = EXCLUDED.duration_min,
  is_branched            = EXCLUDED.is_branched,
  exercise_id            = EXCLUDED.exercise_id,
  takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
  body_md                = EXCLUDED.body_md,
  published              = EXCLUDED.published;

-- Lesson 5.3 — Writing a lightweight PRD (interactive, ~15 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm5.3',
  'm5',
  3,
  'Writing a lightweight PRD',
  'interactive',
  15,
  false,
  'm5-3-prd-builder',
  'prd',
  $LESSON$
A product requirements document does not have to be long. The version that keeps a small build honest fits on one page, takes thirty minutes to write the first time and ten minutes the next, and is the single most useful artifact you can hand a builder — including a model — when you want a real thing back.

## SCRIPT (verbatim)

> "Three things about a working PRD before we walk the nine sections. They are what separates a one-page PRD that ships from a one-page PRD that gets ignored.
>
> **One: a PRD is a contract, not a wish list.** Every line on the page is a promise to build or a promise not to build. Lines that mean neither are noise, and noise is what makes long PRDs unreadable. If a sentence does not narrow the build, cut it. The builder reads ten pages of careful PRD the same way they read one — looking for what is in scope and what is out.
>
> **Two: the goal sentence is the whole PRD compressed.** One sentence, outcome not feature. 'A teller can find the right hold explanation in under two minutes' is a goal a builder can build for. 'We will build a hold-explainer skill' is a feature disguised as a goal, and it tells the builder nothing about whether they succeeded. Spend ten minutes on the goal sentence; the other eight sections fall out of it.
>
> **Three: the non-goals section is what stops scope creep.** Two or three lines. 'Not replacing the core system. Not handling escalations. Not for customer-facing surfaces yet.' Every PRD that ships had non-goals. Every PRD that turned into a quarter-long mess did not. Non-goals are the most useful section and the one people skip first.
>
> Hold those three together — contract not wish list, outcome goal in one sentence, non-goals named explicitly — and the builder walks the remaining six sections in fifteen minutes. The PRD builder below produces a single markdown file. Save it. Lesson 5.4's prototyping tools read this kind of document extremely well; pasting your PRD into Lovable, Replit, Claude Code, or v0 is often the entire prompt you need."

> [tip] Write the success criteria right after the goal, not at the end. If you cannot name two or three measurable outcomes the moment after you write the goal, the goal is still too fuzzy. Tighten the goal first, then the criteria are easy.

> [warn] A success criterion that reads "people will say they like it" fails the bar. The bar is something you could measure without asking anyone — time saved, errors avoided, completions before escalation. If the only signal is sentiment, you cannot tell whether the prototype worked or whether the team is being polite.

## Reference — the nine sections in full

**Goal.** One sentence. The outcome you want, not the feature you imagine.

**Non-goals.** What this is explicitly NOT trying to do. List two or three.

**Users.** Who uses this. Same answer as the "who" in your problem frame, sharpened. Title, team, what they were doing the minute before they reach for this.

**Constraints.** What must be true for this to ship. Time, budget, data discipline, regulatory. "No customer data leaves the bank." "Builds on top of the tools we already license."

**Success criteria.** Two or three measurable things.

**Scope (in).** The pieces you are building. Three to seven bullets. If it is more than seven, the prototype is too big for one week.

**Scope (out).** The pieces you are deferring. Same length.

**Dependencies.** What has to be in place before you start, and who owns each one. Most prototypes stall on a dependency nobody named in advance.

**Risks.** The two or three ways this gets ugly. "The model gets a hold reason wrong and a teller repeats it to a member" is the risk you must mitigate or de-scope.

## PRODUCTION

- PRD builder is the surface. Narration above plays once on first visit.
- Each section field shows the one-line guidance from the SCRIPT as placeholder text.
- "Export as markdown" button highlights once all nine sections have any content; saves to Toolbox.
$LESSON$,
  true
)
ON CONFLICT (id) DO UPDATE SET
  module_id              = EXCLUDED.module_id,
  ordinal                = EXCLUDED.ordinal,
  title                  = EXCLUDED.title,
  modality               = EXCLUDED.modality,
  duration_min           = EXCLUDED.duration_min,
  is_branched            = EXCLUDED.is_branched,
  exercise_id            = EXCLUDED.exercise_id,
  takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
  body_md                = EXCLUDED.body_md,
  published              = EXCLUDED.published;

-- Lesson 5.4 — Build a prototype (interactive + link-out, ~15 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm5.4',
  'm5',
  4,
  'Build a prototype',
  'interactive',
  15,
  false,
  'm5-4-prototype-launch',
  'prototype',
  $LESSON$
The in-app time for this lesson is fifteen minutes. The actual build is the next hour or two of your week, in the tool of your choice, outside this course. We do not embed the builder — you use your own account, your own keys, your own work. We hand you the PRD you wrote in 5.3, point you at four prototyping tools, and ask you to come back with a URL.

## SCRIPT (verbatim)

> "Three things to get right before you open the prototyping tool. The build itself is the easy part once these three are settled.
>
> **One: pick the tool that fits the shape of what you are building.** Four candidates, each best at a different shape. Lovable for marketing pages and small web apps — the things you would have asked a designer-developer to put together in a weekend. Replit Agents when you want a working piece of software at the end, a script or small tool that actually runs. Claude Code when you want real files in a real project with version control that another developer at the bank could pick up and continue. v0 for UI/UX prototypes that render as React and act as clickable mockups your team can react to. Match the tool to the artifact, not to the brand you have heard most about. The launcher below maps each tool to the PRD shapes it handles best.
>
> **Two: open the tool in a new tab and paste your PRD as the opening prompt.** Your saved PRD from 5.3 is a complete brief — goal, non-goals, users, constraints, success criteria, scope. Every modern prototyping tool reads that shape well. Paste the whole document. Resist the urge to summarise; the constraints and non-goals are exactly what stops the tool from drifting into a generic build. Then iterate for an hour. Two hours if the prototype is more involved. The first useful version usually arrives in the second iteration, not the first.
>
> **Three: build against synthetic data, every time.** Everything Module 0 said about not pasting customer data into AI tools applies tenfold here. A prototype builder is an AI tool with extra hands — file system access, code execution, sometimes a deploy step. Use invented names, invented account shapes, invented amounts. If your prototype needs realistic banking material to make the demo land, use the synthetic patterns from Module 4. The temptation to paste real records 'to make the demo more compelling' is the single most expensive mistake learners make at this stage. Do not be the test case.
>
> Hold those three together. Right tool for the shape, PRD as opening prompt, synthetic data only. When you come back, paste the URL into the launcher and write a one-paragraph description of what it does. That is your Prototype artifact — saved in your Toolbox, ready to share when someone asks 'what are you working on?'"

> [tip] "Done enough" means a stakeholder can click through it, the core moment from the PRD's goal works end-to-end, and you would walk a peer through it without apologising. Rough edges fine. Missing edge cases fine. Screenshot not fine — you need a live link, even if it is gated behind auth.

> [warn] The prototype builder will sometimes suggest pulling in "a sample of real customer data to make the demo more realistic." The right answer is always no. Build with synthetic; the demo lands the same and the audit trail stays clean.

## PRODUCTION

- Launcher UI lists four prototyping tools as cards, each with a one-line description and a "match to your PRD" indicator.
- After the learner returns and submits a URL + description, the launcher shows the saved Prototype artifact in the Toolbox sidebar.
- Closing card: "You shipped a prototype. That is the bridge from banker to builder."
$LESSON$,
  true
)
ON CONFLICT (id) DO UPDATE SET
  module_id              = EXCLUDED.module_id,
  ordinal                = EXCLUDED.ordinal,
  title                  = EXCLUDED.title,
  modality               = EXCLUDED.modality,
  duration_min           = EXCLUDED.duration_min,
  is_branched            = EXCLUDED.is_branched,
  exercise_id            = EXCLUDED.exercise_id,
  takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
  body_md                = EXCLUDED.body_md,
  published              = EXCLUDED.published;

-- Lesson 5.5 — Where to go next (audio, ~8 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm5.5',
  'm5',
  5,
  'Where to go next',
  'audio',
  8,
  false,
  NULL,
  NULL,
  $LESSON$
You finished. That is the part most people skip past, so do not skip it yet. Six modules ago you opened this course wondering whether AI was useful in a community bank or just loud. You now have a Data Discipline Card you would defend in a meeting, an AI Toolkit Map for your shop, a First Conversation framing for your team, a Starter Prompt Pack you can lift on Monday, a Workbench Pack with five working skills, a Problem Backlog with three real problems, a PRD for the best one, and a prototype URL you built yourself. That is not AI literacy. That is a practice.

## SCRIPT (verbatim)

> "Three things to settle before you close the tab. They decide whether the practice you just built lasts a quarter or a year.
>
> **One: pick one direction for the next ninety days.** Most learners who finish this course go in three directions and none of them are wrong. The first is deepen one skill — pick one of the five Workbench skills, sharpen it for a month, and quietly become the person at the bank who can hand-roll a useful AI workflow on demand. The second is bring a peer along — walk one teammate through the modules, which is how a practice becomes a culture. The third is build the prototype out — take the Lesson 5.4 URL, find one stakeholder who cares, and turn it from a draft into a small real thing. Pick one. Doing all three at once is how the practice fades by month two.
>
> **Two: know what comes after the Foundation Course.** Beyond this course, the Institute is shaping two further credentials. AiBI-S, Specialist, goes deep on one operational area you have already chosen — Operations, Lending, Risk, IT. AiBI-L, Leader, is for the people who will own AI as a function inside their institution. Neither is open yet. We are not making promises about dates. We will tell you when they are ready, and the easiest way to hear is to keep your Toolbox saved with us. There is no scarcity script here — you have the artifacts, you do not need the badges to do the work.
>
> **Three: keep the practice shipping.** The practice fades fastest when you stop producing artifacts. Pick one small artifact a week — a refined prompt, a new skill, a tightened PRD, a one-page summary you would not have written before. Add it to your Toolbox. Open the Toolbox when a colleague asks you a question you have already answered. The Toolbox is a memory aid; the work is yours, and the work that compounds is the work that gets shipped.
>
> Hold those three together. One direction for ninety days, the next two credentials when they open, and one shipped artifact a week. Close the tab. Open one prompt from your Pack. Use it before you stand up from this desk. That is the whole point."

> [tip] If you cannot decide between the three ninety-day directions, default to "bring a peer along." Teaching someone else what you just learned is the single fastest way to find out what you actually understand and what you only think you do.

> [warn] The fastest way to lose this practice is to wait for permission. Nobody at your institution is going to walk up and ask whether you have started using AI for that recurring task. You will start, you will ship a small thing, and the conversation about scale will come to you because the artifacts are already there.

## PRODUCTION

- Audio lesson — body_md serves as the narration transcript.
- Close on the artifact-count card: list of every Toolbox artifact the learner produced across M0–M5, with a single CTA: "Open your Toolbox."
- Final still: "From 'I've heard of it' → 'I built it.' The bridge held."
$LESSON$,
  true
)
ON CONFLICT (id) DO UPDATE SET
  module_id              = EXCLUDED.module_id,
  ordinal                = EXCLUDED.ordinal,
  title                  = EXCLUDED.title,
  modality               = EXCLUDED.modality,
  duration_min           = EXCLUDED.duration_min,
  is_branched            = EXCLUDED.is_branched,
  exercise_id            = EXCLUDED.exercise_id,
  takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
  body_md                = EXCLUDED.body_md,
  published              = EXCLUDED.published;

-- =====================================================================
-- 3. Knowledge checks (~10 total, ~2 per lesson)
-- =====================================================================

INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options)
VALUES
(
  'a0000000-0000-4000-a000-00000000f511'::uuid,
  'm5.1', 1,
  'What is the honest, current-state definition of an AI agent used in this lesson?',
  '[
    {"id":"a","label":"A chat assistant with a longer memory","correct":false,"explanation":"Longer memory is a feature of assistants, not what makes something an agent."},
    {"id":"b","label":"A string of AI steps with a goal, allowed to take some actions inside a bounded sandbox without asking first","correct":true,"explanation":"That is the definition the lesson uses. The autonomy is real but bounded; the loop is the key part."},
    {"id":"c","label":"A model fine-tuned on banking data","correct":false,"explanation":"Fine-tuning is a separate concern; many agents use general models."},
    {"id":"d","label":"Any AI tool that completes a task end-to-end","correct":false,"explanation":"Too loose — a single skill completes a task end-to-end without being an agent."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f512'::uuid,
  'm5.1', 2,
  'According to the lesson, where should a community bank NOT deploy autonomous agents today?',
  '[
    {"id":"a","label":"In internal back-office automations","correct":false,"explanation":"With human review they are defensible internally; the lesson is more cautious about member-facing flows."},
    {"id":"b","label":"On member-facing flows","correct":true,"explanation":"The lesson is explicit: today''s agents are not acceptable on member-facing banking flows. The framing concepts still apply; the autonomy does not."},
    {"id":"c","label":"In prototype builders","correct":false,"explanation":"Prototyping with agents is encouraged in this module; the line is at production member-facing deployment."},
    {"id":"d","label":"On developer machines","correct":false,"explanation":"Developer experimentation is exactly where agent literacy is built."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f521'::uuid,
  'm5.2', 1,
  'Which of the five problem-frame questions is the lesson''s recommended cure for "we built the wrong thing well"?',
  '[
    {"id":"a","label":"Why now","correct":false,"explanation":"Why now tells you whether you have permission; it does not tell you what to build."},
    {"id":"b","label":"What good looks like — described as a concrete moment, not a solution","correct":true,"explanation":"Naming the moment you want to see tells the builder what shape of help to bring, without anchoring them on a pre-chosen solution."},
    {"id":"c","label":"Current workaround","correct":false,"explanation":"Workaround sets the floor, but does not direct the build."},
    {"id":"d","label":"Who","correct":false,"explanation":"Narrowing the user matters, but does not by itself prevent building the wrong solution."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f522'::uuid,
  'm5.2', 2,
  'What is the deliverable you walk out of Lesson 5.2 with?',
  '[
    {"id":"a","label":"A finished PRD","correct":false,"explanation":"The PRD is the Lesson 5.3 deliverable."},
    {"id":"b","label":"A problem backlog of three filled frames; the best one becomes the 5.3 PRD","correct":true,"explanation":"Three frames is the target. The best one feeds 5.3; the other two stay in your Toolbox for later."},
    {"id":"c","label":"A prototype URL","correct":false,"explanation":"That is Lesson 5.4."},
    {"id":"d","label":"A signed business case","correct":false,"explanation":"Business cases are out of scope for the Foundation Course."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f531'::uuid,
  'm5.3', 1,
  'Why does the PRD include a "non-goals" section?',
  '[
    {"id":"a","label":"To document features for a later phase","correct":false,"explanation":"Future features go in scope-out, not non-goals."},
    {"id":"b","label":"To keep scope from creeping by stating what the build is explicitly NOT trying to do","correct":true,"explanation":"Non-goals are the discipline that prevents the build from quietly absorbing every adjacent ask."},
    {"id":"c","label":"To satisfy audit","correct":false,"explanation":"Audit cares about constraints and risks; non-goals are a project-management tool."},
    {"id":"d","label":"It is optional padding","correct":false,"explanation":"It is one of the most useful sections in the document."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f532'::uuid,
  'm5.3', 2,
  'A success criterion that reads "people will say they like it" fails the lesson''s standard. Why?',
  '[
    {"id":"a","label":"It is too short","correct":false,"explanation":"Length is not the issue."},
    {"id":"b","label":"It is not measurable; the lesson asks for two or three measurable things you can actually check","correct":true,"explanation":"If the only way to know it worked is anecdote, you have not finished the section."},
    {"id":"c","label":"It mentions people","correct":false,"explanation":"People are the right object — the issue is the absence of a measurement."},
    {"id":"d","label":"It is too ambitious","correct":false,"explanation":"It is not ambitious; it is vague."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f541'::uuid,
  'm5.4', 1,
  'Which prototyping tool does the launcher recommend when you want a real project with version control that another developer at the bank could pick up?',
  '[
    {"id":"a","label":"Lovable","correct":false,"explanation":"Lovable is best for marketing pages and small web apps."},
    {"id":"b","label":"v0","correct":false,"explanation":"v0 is best for UI/UX prototypes rendered as React."},
    {"id":"c","label":"Claude Code","correct":true,"explanation":"Claude Code is best when you want real files in a real project that another developer could continue."},
    {"id":"d","label":"Replit Agents","correct":false,"explanation":"Replit Agents is best when you want a working script or small piece of software."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f542'::uuid,
  'm5.4', 2,
  'The prototype builder asks for realistic-looking banking material to make the demo more compelling. What is the correct response under the data-discipline rule?',
  '[
    {"id":"a","label":"Paste a sanitized real record — names removed","correct":false,"explanation":"Sanitizing does not strip the underlying tie to a real member."},
    {"id":"b","label":"Build against synthetic data — invented names, account shapes, and amounts","correct":true,"explanation":"Synthetic data is the rule. If you need bank-realistic shapes, use the synthetic patterns from Module 4."},
    {"id":"c","label":"Skip the demo step","correct":false,"explanation":"The demo is the point — you just do it with synthetic data."},
    {"id":"d","label":"Use a screenshot of a real screen","correct":false,"explanation":"A screenshot of real customer data is still real customer data."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f551'::uuid,
  'm5.5', 1,
  'Which of the three "next ninety days" directions does the lesson present as wrong?',
  '[
    {"id":"a","label":"Deepen one skill","correct":false,"explanation":"Presented as a valid direction."},
    {"id":"b","label":"Bring a peer along","correct":false,"explanation":"Presented as a valid direction."},
    {"id":"c","label":"Build the prototype out","correct":false,"explanation":"Presented as a valid direction."},
    {"id":"d","label":"None — the lesson is explicit that none of the three directions is wrong","correct":true,"explanation":"The lesson names three directions and is explicit that all three are valid finishes."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f552'::uuid,
  'm5.5', 2,
  'What does the lesson say about the AiBI-S (Specialist) and AiBI-L (Leader) credentials?',
  '[
    {"id":"a","label":"They are available now and included with the course","correct":false,"explanation":"They are not yet open. The lesson is explicit about not promising them."},
    {"id":"b","label":"They are being shaped; neither is open yet; no dates are promised","correct":true,"explanation":"That is the framing — direction without a commitment, with a note that the Toolbox is the easiest way to hear when they are ready."},
    {"id":"c","label":"They have been retired","correct":false,"explanation":"They are in development, not retired."},
    {"id":"d","label":"They are paid add-ons inside this course","correct":false,"explanation":"They are separate future credentials, not in-course add-ons."}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  lesson_id = EXCLUDED.lesson_id,
  ordinal   = EXCLUDED.ordinal,
  prompt    = EXCLUDED.prompt,
  options   = EXCLUDED.options;

-- =====================================================================
-- 4. Exercises (3) — all non-LLM, all paid-gated
-- =====================================================================

-- Exercise m5-2-problem-frame — non-LLM problem-framing worksheet.
-- Rendered by src/components/addie/interactives/m5/ProblemFrame.tsx.
INSERT INTO addie.exercises (
  id, lesson_id, mode, track_variant,
  system_prompt, lever_directives,
  task_scaffold, levers, data_slots, preset_context_blocks,
  default_provider, allow_provider_switch, gating, entitlement, published
)
VALUES (
  'm5-2-problem-frame',
  'm5.2',
  'single',
  NULL,
  '-- not an LLM exercise; rendered by m5/ProblemFrame --',
  '{}'::jsonb,
  'Walk five short questions for one real problem on your desk. Three filled frames become a problem backlog you save to your Toolbox.',
  '[]'::jsonb,
  '[]'::jsonb,
  $PCB$[
    {
      "id": "frame_schema",
      "label": "five-question problem frame schema",
      "body": "{\"fields\":[{\"key\":\"who\",\"label\":\"Who has this problem?\",\"help\":\"A specific role at your bank. Narrow is better.\",\"placeholder\":\"Branch tellers who handle holds on Tuesday afternoons.\"},{\"key\":\"what_breaks\",\"label\":\"What breaks?\",\"help\":\"A concrete moment, not an abstract metric.\",\"placeholder\":\"A member calls about a hold and the teller needs 40 minutes to figure out which hold and why.\"},{\"key\":\"current_workaround\",\"label\":\"Current workaround\",\"help\":\"What does the person actually do today?\",\"placeholder\":\"They put the member on hold, page a supervisor, and read three screens.\"},{\"key\":\"what_good_looks_like\",\"label\":\"What good looks like\",\"help\":\"Describe the moment, not the solution.\",\"placeholder\":\"The teller answers in under five minutes with the right explanation.\"},{\"key\":\"why_now\",\"label\":\"Why now\",\"help\":\"External pressure, or a long-standing pain that just got hot?\",\"placeholder\":\"Call volume is up 30 percent and our member-satisfaction survey flagged hold confusion three quarters running.\"}]}"
    }
  ]$PCB$::jsonb,
  'anthropic',
  false,
  '{"maxOutputTokens": 1, "maxOutputChars": 1}'::jsonb,
  'paid',
  true
)
ON CONFLICT (id) DO UPDATE SET
  lesson_id             = EXCLUDED.lesson_id,
  mode                  = EXCLUDED.mode,
  track_variant         = EXCLUDED.track_variant,
  system_prompt         = EXCLUDED.system_prompt,
  lever_directives      = EXCLUDED.lever_directives,
  task_scaffold         = EXCLUDED.task_scaffold,
  levers                = EXCLUDED.levers,
  data_slots            = EXCLUDED.data_slots,
  preset_context_blocks = EXCLUDED.preset_context_blocks,
  default_provider      = EXCLUDED.default_provider,
  allow_provider_switch = EXCLUDED.allow_provider_switch,
  gating                = EXCLUDED.gating,
  entitlement           = EXCLUDED.entitlement,
  published             = EXCLUDED.published;

-- Exercise m5-3-prd-builder — non-LLM lightweight-PRD form.
-- Rendered by src/components/addie/interactives/m5/PRDBuilder.tsx.
INSERT INTO addie.exercises (
  id, lesson_id, mode, track_variant,
  system_prompt, lever_directives,
  task_scaffold, levers, data_slots, preset_context_blocks,
  default_provider, allow_provider_switch, gating, entitlement, published
)
VALUES (
  'm5-3-prd-builder',
  'm5.3',
  'single',
  NULL,
  '-- not an LLM exercise; rendered by m5/PRDBuilder --',
  '{}'::jsonb,
  'Walk the nine sections of a working one-page PRD. Output a markdown file you can paste into any of the Lesson 5.4 prototyping tools.',
  '[]'::jsonb,
  '[]'::jsonb,
  $PCB$[
    {
      "id": "prd_schema",
      "label": "PRD section schema",
      "body": "{\"sections\":[{\"key\":\"goal\",\"label\":\"Goal\",\"help\":\"One sentence. The outcome, not the feature.\",\"placeholder\":\"A teller can find the right hold explanation in under two minutes.\"},{\"key\":\"non_goals\",\"label\":\"Non-goals\",\"help\":\"Two or three things this is explicitly NOT trying to do.\",\"placeholder\":\"Not replacing the core system. Not handling escalations. Not for customer-facing surfaces yet.\"},{\"key\":\"users\",\"label\":\"Users\",\"help\":\"Title, team, what they were doing the minute before they reach for this.\",\"placeholder\":\"Branch tellers mid-call with a member asking about a hold.\"},{\"key\":\"constraints\",\"label\":\"Constraints\",\"help\":\"Time, budget, data discipline, regulatory.\",\"placeholder\":\"No customer data leaves the bank. Builds on tools we already license. Reviewable by audit.\"},{\"key\":\"success_criteria\",\"label\":\"Success criteria\",\"help\":\"Two or three measurable things.\",\"placeholder\":\"Median teller time-to-explanation under 2 minutes; first-call resolution rate up 10 points; zero incidents of incorrect hold reason in a 30-day pilot.\"},{\"key\":\"scope_in\",\"label\":\"Scope (in)\",\"help\":\"Three to seven items you ARE building.\",\"placeholder\":\"Hold-reason lookup; plain-English explanation generator; teller-facing UI; audit log; synthetic test cases; rollout to one branch.\"},{\"key\":\"scope_out\",\"label\":\"Scope (out)\",\"help\":\"What you are deferring.\",\"placeholder\":\"Direct member-facing flow; integration with the call recording system; multilingual support; mobile.\"},{\"key\":\"dependencies\",\"label\":\"Dependencies\",\"help\":\"What has to be in place, and who owns each one.\",\"placeholder\":\"Read-only access to the hold table (owner: core team). Approved AI tool license (owner: IT). Audit sign-off on synthetic data set (owner: compliance).\"},{\"key\":\"risks\",\"label\":\"Risks\",\"help\":\"Two or three honest ways this gets ugly.\",\"placeholder\":\"Model returns a wrong hold reason and the teller repeats it. Mitigation: confidence score and fall-back to human supervisor on any low-confidence response.\"}]}"
    }
  ]$PCB$::jsonb,
  'anthropic',
  false,
  '{"maxOutputTokens": 1, "maxOutputChars": 1}'::jsonb,
  'paid',
  true
)
ON CONFLICT (id) DO UPDATE SET
  lesson_id             = EXCLUDED.lesson_id,
  mode                  = EXCLUDED.mode,
  track_variant         = EXCLUDED.track_variant,
  system_prompt         = EXCLUDED.system_prompt,
  lever_directives      = EXCLUDED.lever_directives,
  task_scaffold         = EXCLUDED.task_scaffold,
  levers                = EXCLUDED.levers,
  data_slots            = EXCLUDED.data_slots,
  preset_context_blocks = EXCLUDED.preset_context_blocks,
  default_provider      = EXCLUDED.default_provider,
  allow_provider_switch = EXCLUDED.allow_provider_switch,
  gating                = EXCLUDED.gating,
  entitlement           = EXCLUDED.entitlement,
  published             = EXCLUDED.published;

-- Exercise m5-4-prototype-launch — non-LLM prototype launcher + save form.
-- Rendered by src/components/addie/interactives/m5/PrototypeLauncher.tsx.
-- NOTE: there is no server-side URL validation for the saved prototype URL
-- in v1. The widget marks the link rel="noopener noreferrer" target="_blank"
-- and persists what the learner pastes. Flag in M5 build report.
INSERT INTO addie.exercises (
  id, lesson_id, mode, track_variant,
  system_prompt, lever_directives,
  task_scaffold, levers, data_slots, preset_context_blocks,
  default_provider, allow_provider_switch, gating, entitlement, published
)
VALUES (
  'm5-4-prototype-launch',
  'm5.4',
  'single',
  NULL,
  '-- not an LLM exercise; rendered by m5/PrototypeLauncher --',
  '{}'::jsonb,
  'Pick a prototyping tool, open it in a new tab with your PRD as the opening prompt, build for an hour, then come back and save your prototype URL.',
  '[]'::jsonb,
  '[]'::jsonb,
  $PCB$[
    {
      "id": "tools",
      "label": "prototyping tools menu",
      "body": "[{\"id\":\"lovable\",\"name\":\"Lovable\",\"url\":\"https://lovable.dev\",\"best_for\":\"Marketing pages, small web apps\"},{\"id\":\"replit\",\"name\":\"Replit Agents\",\"url\":\"https://replit.com\",\"best_for\":\"Working software prototypes\"},{\"id\":\"claude-code\",\"name\":\"Claude Code\",\"url\":\"https://www.anthropic.com/claude-code\",\"best_for\":\"Real files in a real project\"},{\"id\":\"v0\",\"name\":\"v0\",\"url\":\"https://v0.dev\",\"best_for\":\"UI/UX prototypes that render as React\"}]"
    }
  ]$PCB$::jsonb,
  'anthropic',
  false,
  '{"maxOutputTokens": 1, "maxOutputChars": 1}'::jsonb,
  'paid',
  true
)
ON CONFLICT (id) DO UPDATE SET
  lesson_id             = EXCLUDED.lesson_id,
  mode                  = EXCLUDED.mode,
  track_variant         = EXCLUDED.track_variant,
  system_prompt         = EXCLUDED.system_prompt,
  lever_directives      = EXCLUDED.lever_directives,
  task_scaffold         = EXCLUDED.task_scaffold,
  levers                = EXCLUDED.levers,
  data_slots            = EXCLUDED.data_slots,
  preset_context_blocks = EXCLUDED.preset_context_blocks,
  default_provider      = EXCLUDED.default_provider,
  allow_provider_switch = EXCLUDED.allow_provider_switch,
  gating                = EXCLUDED.gating,
  entitlement           = EXCLUDED.entitlement,
  published             = EXCLUDED.published;
