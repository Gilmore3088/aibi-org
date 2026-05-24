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
## Lesson 5.1 — What an agent is

You will hear three words used interchangeably in the trade press: assistant,
skill, and agent. They are not the same thing, and the difference matters
the moment you start building.

### Assistant, skill, agent — three shapes

An **assistant** is the chat box. You ask, it answers, you decide what to do
with the answer. The conversation is the product. Everything you built in
Module 3 — the four-part brief, the Starter Prompt Pack — lives at this
layer.

A **skill** is the assistant with a job. You set it up once — system
prompt, allowed inputs, what good output looks like — and reuse it many
times against the same kind of task. The Workbench Pack from Module 4 is
five skills. The skill does one thing and does it the same way every time
you call it.

An **agent** is a string of AI steps with a goal. Step one decides what
to do. Step two does it. Step three checks the result. Step four loops
back if the result is not good enough, or stops if it is. Somewhere
inside that loop the agent is allowed to take actions — read a file,
write a record, call an API, send a message — without asking you first.
That is the honest definition. The part that gets oversold is the word
"autonomous." Today's agents are autonomous inside a tight, bounded
sandbox. They get confused outside it. They invent steps that look
sensible and are not. They occasionally take an action you did not
authorize, because the loop did not check carefully enough. None of that
is acceptable on a member-facing banking flow yet.

### Why we teach this in a banking course anyway

Because the **framing** is the same whether the system you build is a
single skill, a three-step automation, or a real agent. Every useful
building block starts with: what is the goal, what are the steps, what
data does each step need, what should it never do, and what is the human
review point. Whether step three is a person or a model, the shape of the
work is identical. The rest of Module 5 is that shape — taught at the
level you can ship this week.

### What you will build in this module

Lesson 5.2 walks you through writing a **problem backlog** — three
problems on your desk that an AI system could plausibly help with, framed
tightly enough that you could brief them to a builder. Lesson 5.3 turns
the best one into a **lightweight PRD** — the one-page document that
keeps any builder honest about what is being built and what is not.
Lesson 5.4 takes that PRD and walks you to one of four prototyping tools
where you will spend an hour outside this course and come back with a
working prototype URL. Lesson 5.5 sends you onward — to the next two
credentials, to the patterns that are emerging in community banking, and
to what is realistic for your next quarter.

### The honesty rule for this module

Anything you prototype here is a draft. Drafts are not deployments. Do
not put a draft in front of a member, do not connect it to a system of
record, do not give it permission to move money. The Foundation Course
does not teach you how to ship a production agent — it teaches you how
to frame, scope, and prototype one well enough that the people who CAN
ship it can build on what you handed them. That is the bridge from
banker to builder, and that is plenty for one course.
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
## Lesson 5.2 — Framing a problem

The single most common failure mode in early AI projects is building the
wrong thing well. Not "the model was bad" — the model was fine. The
problem the team built for was not the problem anyone on the floor
actually had. The fix is to write the problem down before you build, in
a shape that a builder can read in thirty seconds and say either "yes I
can help with that" or "you are pointed at the wrong thing."

### The five questions

The worksheet below walks five short prompts. Each one tightens the
frame. Answer them for one real problem on your desk this week — not a
hypothetical, not a roadmap item, a thing that costs you time or
attention right now.

**Who.** Who has this problem? A specific role at your bank. Not
"customers" — *which* customers. Not "the team" — *which* team. The
narrower this is, the better the rest of the frame gets.

**What breaks.** What does the bad day look like? A concrete moment, not
an abstract metric. "Tuesday afternoon a member calls about a hold and
the teller needs forty minutes to figure out which hold and why." That
sentence is more useful than "service times are too long."

**Current workaround.** What does the person actually do today when this
happens? They do something. Even if it is "they suffer and the member
hangs up." Naming the workaround tells the builder where the floor is.

**What good looks like.** If the problem were solved, what would the
Tuesday afternoon look like instead? Describe the moment, not the
solution. "The teller answers in under five minutes with the right
explanation" is a frame. "We deploy an agent" is not.

**Why now.** Is there an external pressure — a regulator deadline, a
churn spike, a competitor — or is this a problem you have been carrying
for years that just got hot? "Why now" tells you whether you have
permission to build, or whether you are about to fight for budget.

### What you walk out with

Three filled frames are a **problem backlog**. The best one becomes your
Lesson 5.3 PRD. The other two stay in your Toolbox for later — most
people end up building one of them inside the next six months. Save the
backlog.
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
## Lesson 5.3 — A lightweight PRD

A product requirements document does not have to be long. The version
that keeps a small build honest fits on one page, takes thirty minutes
to write the first time and ten minutes the next, and is the single most
useful artifact you can hand a builder — including a model — when you
want a real thing back.

### The nine sections

The builder below walks the same nine sections every working PRD has,
sized for a one-week prototype, not a quarter-long platform.

**Goal.** One sentence. The outcome you want, not the feature you
imagine. "A teller can find the right hold explanation in under two
minutes" is a goal. "We will build a hold-explainer skill" is a feature
disguised as a goal.

**Non-goals.** What this is explicitly NOT trying to do. Non-goals are
how you keep scope from creeping. List two or three. "Not replacing the
core system. Not handling escalations. Not for customer-facing surfaces
yet."

**Users.** Who uses this. Same answer as the "who" in your problem
frame, sharpened. Title, team, what they were doing the minute before
they reach for this.

**Constraints.** What must be true for this to ship. Time, budget, data
discipline, regulatory. "No customer data leaves the bank." "Builds on
top of the tools we already license." "Has to be reviewable by audit."

**Success criteria.** How you will know it worked. Two or three measurable
things. If the only way to know is "people say they like it," you have
not finished this section.

**Scope (in).** The pieces you are building. Bullet list, three to seven
items. If it is more than seven, the prototype is too big for one week.

**Scope (out).** The pieces you are deferring. Same length. Things people
will ask for that you are not going to build this round.

**Dependencies.** What has to be in place before you start, and who owns
each one. Most prototypes stall on a dependency nobody named in advance.

**Risks.** The two or three ways this gets ugly. Be honest. "The model
gets a hold reason wrong and a teller repeats it to a member" is the
risk you must mitigate or de-scope.

### Save the PRD

The PRD builder produces a single markdown file. Save it to your
Toolbox. The link-out tools in Lesson 5.4 read this kind of document
extremely well — pasting your saved PRD into Lovable, Replit, Claude
Code, or v0 is often the entire prompt you need.
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
## Lesson 5.4 — Build a prototype

The in-app time for this lesson is fifteen minutes. The actual build is
the next hour or two of your week, in the tool of your choice, outside
this course. We do not embed the builder — you use your own account,
your own keys, your own work. We hand you the PRD you just wrote and
point you at four tools that will read it and produce something
runnable.

### Pick the tool that fits the shape

The launcher below lists four prototyping tools. Each one is best at a
different shape of build:

- **Lovable** — best for marketing pages, small web apps, anything you
  would have asked a designer-developer to put together in a weekend.
- **Replit Agents** — best when you want a working piece of software at
  the end — a script, a small tool, something that actually runs.
- **Claude Code** — best when you want real files in a real project,
  with version control, that another developer at the bank could pick
  up and continue.
- **v0** — best for UI/UX prototypes that render as React. Strong when
  you need a clickable mockup the team can react to.

Pick one. Open it in a new tab. Paste your PRD as the opening prompt.
Iterate for an hour. Come back when you have a URL.

### What "done enough" looks like

A prototype is not a product. Done enough means: a stakeholder can click
through it, the core moment from the PRD's goal works end-to-end, and
you would be willing to walk a peer through it without apologizing. The
rough edges are fine. The missing edge cases are fine. What is not fine
is a screenshot — you need a live link, even if it is gated behind
auth.

### The data-discipline rule still applies — louder

Everything Module 0 said about not pasting customer data into AI tools
applies tenfold here. A prototype builder is an AI tool with extra
hands. Build against **synthetic data** — invented names, invented
account shapes, invented amounts. If your prototype needs realistic
banking material to show the moment, use the synthetic patterns from
Module 4. Never paste real records to "make the demo more compelling."

### Save the link

When you come back to the launcher below, pick the tool you used, paste
the URL to your prototype, and write a one-paragraph description of
what it does. That is your **Prototype** artifact — saved in your
Toolbox, ready to share when someone asks "what are you working on?"
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
## Lesson 5.5 — Where to go next

You finished. That is the part most people skip past, so do not skip it
yet. Six modules ago you opened this course wondering whether AI was
useful in a community bank or just loud. You now have a Data Discipline
Card you would defend in a meeting, an AI Toolkit Map for your shop, a
First Conversation framing for your team, a Starter Prompt Pack you can
lift on Monday, a Workbench Pack with five working skills, a Problem
Backlog with three real problems, a PRD for the best one, and a
prototype URL you built yourself. That is not "AI literacy." That is a
practice.

### The audio script — what we say at the end

The closing audio (linked here once recorded) walks you through three
things: what realistic looks like for the next ninety days, what we are
building next at the Institute, and how to keep your practice from
fading.

**Realistic for the next ninety days.** Most learners who finish this
course go in three directions, and none of them are wrong. The first is
**deepen one skill** — they pick one of the five Workbench skills,
sharpen it for a month, and quietly become the person at the bank
who can hand-roll a useful AI workflow on demand. The second is
**bring a peer along** — they walk one teammate through the modules,
which is how a practice becomes a culture. The third is **build the
prototype out** — they take the Lesson 5.4 URL, find one stakeholder
who cares, and turn it from a draft into a small real thing.

**What we are building next.** Beyond the Foundation Course, the
Institute is shaping two further credentials — an **AiBI-S
(Specialist)** track that goes deep on one operational area you have
already chosen, and an **AiBI-L (Leader)** track for the people who
will own AI as a function inside their institution. Neither is open
yet. We are not making a promise about dates. We will tell you when
they are ready; saved in your Toolbox is the easiest way to make sure
you hear.

**How to keep the practice.** The practice fades fastest when you stop
shipping. Pick one small artifact a week — a refined prompt, a new
skill, a tightened PRD — and add it to your Toolbox. Open the Toolbox
when a colleague asks you a question you have already answered. The
Toolbox is a memory aid; the work is yours.

Close the tab. Open one prompt from your Pack. Use it before you stand
up from this desk. That is the whole point.
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
