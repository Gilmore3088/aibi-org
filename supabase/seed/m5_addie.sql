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
Assistant, skill, agent. Used interchangeably in trade press; not the same thing. The difference matters the moment you build.

## SCRIPT (verbatim)

> [stat] 3 | Shapes of AI work, by review-loop length | Assistant (every loop) → Skill (shorter loop) → Agent (loop runs inside bounds).

> [case:good] Assistant — the chat box
> Ask, answer, you decide. Everything in M3 lives here. Every step reviewed.
> [outcome] Highest fidelity, slowest cadence. Right for member- or regulator-facing output.

> [case:good] Skill — the assistant with a job
> Set up once; reuse many times against the same shape of task. Your Module 4 Toolbox holds your saved Skills (m4.2 first one, m4.3 role-specific, m4.4 source-aware). Human in every loop; the loop is shorter.
> [outcome] Recurring drafting and analysis. Consistency + speed without giving up review.

> [case:bad] Agent — AI steps that take actions
> Step 1 decides. Step 2 acts. Step 3 checks. Step 4 loops or stops. Inside that loop the agent takes actions — reads, writes, calls APIs — without asking. Today's agents drift, invent plausible-wrong steps, occasionally act outside the loop.
> [outcome] Not yet ready for member-facing flows. Useful for internal prototypes; never on systems of record without a real review point.

> [tip] Spot an oversold agent demo: "What happens if step 3 returns a plausibly wrong result?" If the answer is a hand-wave, there is no review point.

> [warn] Drafts are not deployments. Do not put a draft in front of a member, connect it to a system of record, or give it permission to move money.

> [case:good] The regulator framework that already covers this
> Three documents govern most of what your bank does with AI — none of them are new, all of them apply: **SR 11-7** (model risk management — Skills and agents that produce output used in business decisions are models); **Interagency Guidance on Third-Party Relationships: Risk Management** (June 2023 — every provider in your AI stack is a third party, including Anthropic, OpenAI, Google); **OCC Bulletin 2023-17** (operational resilience for vendor concentration). Add the **AIEOG AI Lexicon** (Feb 2026) for the official US-government working definitions. None of this requires a new program — it requires you to recognise that the program you already have applies.
> [outcome] Your AI prototype is a model run by a third party. SR 11-7 and TPRM are the floor.

## What you build this module
M5.2 → **Problem Backlog**. M5.3 → **PRD**. M5.4 → **Prototype URL**. M5.5 → what comes next.

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
Most early AI projects fail by building the wrong thing well. The fix: write the problem down before you build, in a shape a builder reads in thirty seconds.

## SCRIPT (verbatim)

> [stat] 5 | Five questions, one frame | Who · What breaks · Current workaround · What good looks like · Why now. Three filled frames = Problem Backlog.

> [case:good] Who
> A specific role. "A teller on the consumer line Tuesday afternoon," not "customers" or "the team."
> [outcome] Narrower who → better every other answer.

> [case:good] What breaks
> Concrete moment, not abstract metric. "Tuesday a member calls about a hold; teller needs forty minutes" beats "service times are too long."
> [outcome] Builders build for moments. Consultants chase metrics.

> [case:good] Current workaround
> What the person actually does today. Transfer to BSA officer? Apologise? Even "suffer and the member hangs up" is information.
> [outcome] The workaround tells the builder where the floor is.

> [case:good] What good looks like
> Describe the moment, not the solution. "Teller answers in under five minutes with the right explanation" is a frame. "Deploy an agent" is a guess at the means.
> [outcome] Means are easy. Outcomes are the point.

> [case:good] Why now
> External pressure (regulator, churn, competitor) or year-old pain that just got hot? Tells you whether you have permission or a budget fight ahead.
> [outcome] Pretending not to need to know is not useful.

> [tip] Two problems share the same "who"? The underlying problem is bigger than either symptom — frame it too.

> [warn] Solution-language frames ("we need an agent that monitors holds") cannot be PRD'd — every reader pictures a different agent.

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
  30,
  false,
  'm5-3-prd-builder',
  'prd',
  $LESSON$
One-page PRD. Plan **30 minutes** the first time, 10 the next. The single most useful artifact when you want a builder — model or human — to come back with a real thing.

## SCRIPT (verbatim)

> [stat] 3 | Three rules before nine sections | Contract not wish list · Goal in one sentence · Non-goals stop scope creep.

> [case:good] Contract, not wish list
> Every line is a promise to build or not build. If a sentence doesn't narrow the build, cut it.
> [outcome] Builders read ten pages the same way as one — for what's in scope.

> [case:good] Goal sentence = whole PRD compressed
> Outcome, not feature. "A teller finds the right hold explanation in under two minutes." Not "we will build a hold-explainer skill."
> [outcome] Spend ten minutes on the goal. The other eight sections fall out.

> [case:good] Non-goals stop scope creep
> Two or three lines. "Not replacing the core system. Not handling escalations. Not for customer-facing yet." Every shipped PRD had them.
> [outcome] The most useful section and the one people skip first.

> [tip] Write success criteria right after the goal. If you can't name two or three measurable outcomes immediately, the goal is still fuzzy.

> [warn] "People will say they like it" fails the bar. Measure without asking — time saved, errors avoided, completions before escalation.

## Reference — the nine sections at a glance

Audit A16 (2026-05-24): the nine PRD sections render as one reference
table so the entire artifact shape is visible in one scan, with the
length budget for each section spelled out. The prose paragraphs below
the table remain for the per-section depth.

| # | Section | What goes here | Length budget |
|---|---|---|---|
| 1 | Goal | One sentence. Outcome you want, not the feature you imagine. | 1 sentence |
| 2 | Non-goals | What this is explicitly NOT trying to do. | 2–3 lines |
| 3 | Users | Title, team, what they were doing the minute before. | 1 paragraph |
| 4 | Constraints | What must be true to ship — time, budget, data discipline, regulatory. | 3–5 bullets |
| 5 | Success criteria | Measurable outcomes — time saved, errors avoided, completions before escalation. | 2–3 metrics |
| 6 | Scope (in) | Pieces you are building. More than 7 = too big for one week. | 3–7 bullets |
| 7 | Scope (out) | Pieces you are deferring. Same length as in-scope. | 3–7 bullets |
| 8 | Dependencies | What must be in place before you start, and who owns each. | 2–5 named items |
| 9 | Risks | Two or three ways this gets ugly + the mitigation or de-scope move. | 2–3 risks |

The prose below walks each section in turn. Use the table for the next
PRD you draft; the prose is for the one you stall on.

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
Fifteen minutes here; the build is the next hour or two outside this course. Bring back a URL.

## SCRIPT (verbatim)

> [stat] 4 | Four prototyping tools, four shapes | Lovable (pages/apps) · Replit Agents (running scripts) · Claude Code (real files + version control) · v0 (React UI mockups).

> [case:good] Pick the tool that fits the artifact
> Match the tool to what you are producing, not to the brand you have heard about most. The launcher maps each to the PRD shapes it handles best.
> [outcome] One PRD → one tool → one prototype.

> [case:good] PRD as opening prompt
> Paste the whole document. Constraints and non-goals are what stops the tool drifting into a generic build. Iterate for an hour. The useful version arrives on the second iteration, not the first.
> [outcome] Do not summarise. Paste it all.

> [case:good] Synthetic data only
> Prototype builders have hands — file access, code execution, deploy steps. Invented names, account shapes, amounts. M4's synthetic patterns are the template.
> [outcome] "Paste real records to make the demo land" is the most expensive mistake at this stage.

> [tip] "Done enough" = a stakeholder clicks through, the PRD's core moment works end-to-end, you walk a peer through without apologising. Live link required — screenshot does not count.

> [warn] Builders will sometimes suggest "a sample of real customer data." Answer: no. Synthetic. Always.

> [case:good] Tool · what it produces · where it runs · what IT needs to know
> The four tools land in different blast-radius zones. Match the tool to the artifact AND to your institution's tolerance:
>
> | Tool | What it produces | Where the code runs | Hands on real systems? | IT-handoff line |
> |---|---|---|---|---|
> | **v0** (Vercel) | React UI mockups, design surfaces only | Browser preview + Vercel sandbox | No. Static front-end only. | Lowest blast radius. Treat the output as a wireframe. |
> | **Lovable** | Pages + small web apps with optional Supabase backend | Vendor cloud; you get a shareable URL | Backend only if you wire one up. No access to your stack. | Self-contained vendor app. List the vendor under TPRM before connecting any non-synthetic data. |
> | **Replit Agents** | Running scripts and small apps inside a Replit dev container | Replit cloud container with internet + shell + arbitrary package install | Inside the container, yes. Outside (your machine, your bank's systems) no — unless you explicitly export and run code. | Medium blast radius. Anything the agent installs lives in their environment, not yours. Vendor onboarding required before connecting any real source. |
> | **Claude Code** | Real files + git history on your laptop, runs as you authorise | Your machine. Shell + file system + browser + git access, with explicit-permission prompts. | Yes — within whatever your laptop can reach. | Highest blast radius. Run it from a clean directory, on synthetic data, with `--restrict` permissions until IT signs off on a wider scope. |
>
> [outcome] Pick the smallest blast radius that produces the artifact you actually need. v0 for a UI demo. Lovable for a working web demo. Replit Agents for a script or small backend. Claude Code only when the prototype IS code your team will continue — and then only after IT has scoped its permissions.

> [warn] **Before you ship a URL from any of these tools to a stakeholder**, send the tool name and a one-line description to your IT director. None of these are "free trial" decisions if real bank data is in scope. Under the Interagency TPRM Guidance (June 2023), each is a third-party relationship the moment you connect anything beyond synthetic data.

## PRODUCTION

- Launcher UI lists four prototyping tools as cards, each with a one-line description, a blast-radius badge (low/med/high), and a "match to your PRD" indicator.
- The blast-radius matrix renders inline above the launcher on first visit; collapsible after.
- After the learner returns and submits a URL + description, the launcher shows the saved Prototype artifact in the Toolbox sidebar with the tool's blast-radius badge inherited.
- Closing card: "You shipped a prototype. That is the bridge from banker to builder. The IT-handoff line is what keeps the bridge open."
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
You finished. You now hold a Data Discipline Card, an AI Toolkit Map, a First Conversation, a Starter Prompt Pack, three saved Skills in your Toolbox (M4.2–M4.4), a Problem Backlog, a PRD, and a prototype URL. That is not AI literacy. That is a practice.

## SCRIPT (verbatim)

> [stat] 3 | Three things before you close the tab | Pick one ninety-day direction · Know what comes next · Ship one artifact a week.

> [case:good] Pick one direction for ninety days
> Deepen one skill (become the in-house AI workflow person), bring a peer along (practice → culture), or build out the prototype (draft → real thing).
> [outcome] Pick one. All three at once is how the practice fades by month two.

> [case:good] What comes after Foundation
> AiBI-S (Specialist — Operations, Lending, Risk, IT). AiBI-L (Leader — own AI as a function). Neither open yet; no scarcity script. Keep your Toolbox saved with us to hear first.
> [outcome] You have the artifacts. You do not need the badges to do the work.

> [case:good] Ship one artifact a week
> A refined prompt. A new skill. A tightened PRD. The Toolbox is memory; the work is yours.
> [outcome] The work that compounds is the work that gets shipped.

> [tip] Can't decide on a direction? Default to "bring a peer along." Teaching is the fastest way to find what you actually understand.

> [warn] The fastest way to lose the practice is to wait for permission. Nobody walks up and asks. You start; the conversation about scale comes to you.

> [case:good] For leaders — the institutional brief
> If you are an executive or board member, the practice you finished is one half of the work. The other half is the institutional decision: what does our bank do about AI in the next ninety days, and who decides what? Pull the patterns you have already produced into a one-page brief your board chair, examiner, or peer at the ICBA conference can read in under five minutes.
> [outcome] **AI Governance One-Pager** (printable) — six fields:
> 1. **Scope** — three or four use cases sanctioned (drawn from your Problem Backlog).
> 2. **Off-limits** — the data-discipline rule, named documents (SR 11-7, Interagency TPRM Guidance June 2023, AIEOG AI Lexicon Feb 2026).
> 3. **Vendor list** — every AI provider currently in use, with TPRM status.
> 4. **Roles** — who decides scope, who reviews outputs, who briefs the board.
> 5. **Risk-appetite statement** — what does the bank tolerate (e.g. "internal drafting only; no member-facing or system-of-record automation in the first ninety days").
> 6. **Review cadence** — quarterly, with a single named owner.
>
> This is the document the leadership track has been building toward across M0–M5. It is also the document a community-bank CEO can hand to a KDOB, FDIC, OCC, or NCUA examiner without flinching.

Close the tab. Open one prompt from your Pack. Use it before you stand up.

## PRODUCTION

- Audio lesson — body_md serves as the narration transcript.
- Close on the artifact-count card: list of every Toolbox artifact the learner produced across M0–M5, with a single CTA: "Open your Toolbox."
- The [case:good] **AI Governance One-Pager** renders as a downloadable artifact card for leadership-track learners; for other tracks it renders as an optional preview ("if you bring this to your leadership"). When the Toolbox accumulator includes a Problem Backlog + PRD, the one-pager template pre-fills Scope, Off-limits, and Roles.
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
