-- supabase/seed/m1_addie.sql
-- Module 1 — What generative AI is. Free tier · 4 lessons.
-- Idempotent: every INSERT uses ON CONFLICT ... DO UPDATE so re-running
-- this file just refreshes content. DO NOT APPLY directly — orchestrator
-- runs the seed wave.
--
-- Layout per the Production Tracker §M1:
--   1.1 video        · 10 min · not branched · takeaway none
--   1.2 interactive  · 12 min · not branched · takeaway ai_toolkit_map
--                                exercise:  m1-2-tool-landscape
--   1.3 audio        ·  8 min · BRANCHED ×5 · takeaway none
--   1.4 video        ·  9 min · not branched · takeaway none
--
-- Banking-realistic content only. No real bank names. No PII. No MNPI.
-- No account numbers. Synthetic scenarios only.

----------------------------------------------------------------------
-- 1. addie.modules — one row
----------------------------------------------------------------------
INSERT INTO addie.modules (id, ordinal, title, tier, summary, published)
VALUES (
  'm1',
  1,
  'What generative AI is',
  'free',
  'Models, tools, capabilities and limits — without the hype',
  true
)
ON CONFLICT (id) DO UPDATE
  SET ordinal   = EXCLUDED.ordinal,
      title     = EXCLUDED.title,
      tier      = EXCLUDED.tier,
      summary   = EXCLUDED.summary,
      published = EXCLUDED.published;

----------------------------------------------------------------------
-- 2. addie.lessons — 4 rows
----------------------------------------------------------------------

-- 1.1  What it actually is (and isn't) — video, 10 min
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
) VALUES (
  'm1.1',
  'm1',
  1,
  'What it actually is (and isn''t)',
  'video',
  10,
  false,
  NULL,
  NULL,
  $body$
## SCRIPT (verbatim)

> "Before we talk about what generative AI can do for you, let's get honest about what it actually is — because most of the noise you've been hearing is people skipping this part.
>
> A modern model — Claude, ChatGPT, Gemini, the rest of them — is a **predictive token engine**. That is the whole thing. You give it some text, it produces the next most-plausible chunk of text, then the next, then the next, until it stops. It doesn't *know* anything. It doesn't *believe* anything. It doesn't have a window into your bank's core, your loan tape, or this morning's news. It is pattern-completion at scale.
>
> Three properties drop out of that, and they matter for every decision you'll make in this course.
>
> **One: there is a training cutoff.** The model was trained on a snapshot of text that ended on a specific date. Anything after that date — a rate change, a new rule, the OCC bulletin from last Tuesday — it doesn't know unless you tell it. There is no live wire to the internet, no live wire to your core, no live wire to your e-mail. If you want it to know something, you put it in the prompt.
>
> **Two: no real-time knowledge means no real-time anything.** It cannot check a balance. It cannot look up today's prime. It cannot read a member's file. If the answer requires a fact that lives in a system, you bring the fact to the model — the model does not go get it.
>
> **Three: hallucination is a property, not a bug.** Because the engine's job is to produce the most plausible next chunk of text, when it doesn't have the answer it will still produce something that *sounds* like an answer. Confident, fluent, and wrong. That is not the model malfunctioning. That is the model doing exactly what it was built to do. Your job — every single time — is to read the output like a banker reads a loan file: assume nothing, verify the numbers, check the citations, decide whether to use it.
>
> Hold those three together and you have the right mental model for everything that follows. It is a *predictive token engine*, with a *training cutoff*, and *no live knowledge of your bank*. That is what you are working with. It is genuinely useful, and it is not magic."

## PRODUCTION

- Cold open on a single dense card: **predictive token engine**, animated to print one chunk at a time as the narrator says it.
- Build three labelled columns as the narrator names them: *Training cutoff · No live knowledge · Hallucination as a property*. Each column gets a one-line plain-English restatement underneath.
- Tone is dry and reassuring. No alarm music. No "this changes everything" rhetoric.
- Closing card holds the three properties together for 4 seconds before the knowledge check.
$body$,
  true
)
ON CONFLICT (id) DO UPDATE
  SET module_id              = EXCLUDED.module_id,
      ordinal                = EXCLUDED.ordinal,
      title                  = EXCLUDED.title,
      modality               = EXCLUDED.modality,
      duration_min           = EXCLUDED.duration_min,
      is_branched            = EXCLUDED.is_branched,
      exercise_id            = EXCLUDED.exercise_id,
      takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
      body_md                = EXCLUDED.body_md,
      published              = EXCLUDED.published;

-- 1.2  Tool landscape: assistants vs. builders — interactive, 12 min
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
) VALUES (
  'm1.2',
  'm1',
  2,
  'Tool landscape: assistants vs. builders',
  'interactive',
  12,
  false,
  'm1-2-tool-landscape',
  'ai_toolkit_map',
  $body$
## SCRIPT (intro)

> "There are roughly a thousand AI tools that look like they do the same thing. They don't. Almost every one of them is in one of two buckets, and once you can tell the buckets apart you stop being confused about which tool to reach for.
>
> **Assistants** are thinking partners. You talk, they talk back. Claude, ChatGPT, Gemini, Copilot, NotebookLM, Perplexity. Same shape: a chat window. Same job: help you read, write, summarise, decide.
>
> **Builders** are construction crews. You describe what you want, they produce running software — a page, a small app, a working prototype. Lovable, Replit Agents, v0, Cursor, Claude Code, Stitch. You don't chat with them the same way. You brief them.
>
> The exercise on this page is a sort. We give you the twelve tools we'll reference across this course. You place each one in the right quadrant of a 2×2 — the horizontal axis is the one that matters (assistant or builder), the vertical axis is informational only (most have a free tier and a paid tier).
>
> Three rules. **One:** when you're not sure, look at the verb. If the marketing says *chat / summarise / draft*, it's an assistant. If it says *build / ship / deploy*, it's a builder. **Two:** several tools straddle the line — Claude Code is Claude, with hands; Copilot writes code but lives inside chat. We've put a hint under each tool. **Three:** when you submit, we score the horizontal axis only and reveal the vendor link for the tools you placed correctly. Save the result — that becomes your AI Toolkit Map, the first artifact in your Toolbox."

## PRODUCTION

- The sortable matrix is the screen. No video. Narration above plays once on first visit; replay button after.
- After submission, the page reveals which quadrant was right for the horizontal axis and surfaces vendor links for correct placements.
- The saved placement is stored as the **AI Toolkit Map** artifact.
$body$,
  true
)
ON CONFLICT (id) DO UPDATE
  SET module_id              = EXCLUDED.module_id,
      ordinal                = EXCLUDED.ordinal,
      title                  = EXCLUDED.title,
      modality               = EXCLUDED.modality,
      duration_min           = EXCLUDED.duration_min,
      is_branched            = EXCLUDED.is_branched,
      exercise_id            = EXCLUDED.exercise_id,
      takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
      body_md                = EXCLUDED.body_md,
      published              = EXCLUDED.published;

-- 1.3  Why this matters for your role — audio, 8 min, BRANCHED ×5
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
) VALUES (
  'm1.3',
  'm1',
  3,
  'Why this matters for your role',
  'audio',
  8,
  true,
  NULL,
  NULL,
  $body$
## SHARED INTRO

> "This lesson is the one where the course speaks directly to your seat. Up to now we have been talking about what generative AI *is*. Now we are going to talk about what it changes about *your* week — specifically — at a community bank or credit union. The audio you are about to hear is the variant for the track you picked in orientation. If you ever want to hear what another role hears, you can switch tracks from your profile and replay. Headphones in. Eight minutes."

## PRODUCTION

- Audio player only on this lesson page. The per-track audio script lives in `addie.lesson_track_variants` rows below and is rendered by the player based on the learner's `profile.track`.
- A transcript toggle reveals the variant's text under the player.
- A single quiet visual: a thin gold rule under the track name, mono caps.
$body$,
  true
)
ON CONFLICT (id) DO UPDATE
  SET module_id              = EXCLUDED.module_id,
      ordinal                = EXCLUDED.ordinal,
      title                  = EXCLUDED.title,
      modality               = EXCLUDED.modality,
      duration_min           = EXCLUDED.duration_min,
      is_branched            = EXCLUDED.is_branched,
      exercise_id            = EXCLUDED.exercise_id,
      takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
      body_md                = EXCLUDED.body_md,
      published              = EXCLUDED.published;

-- 1.4  Good vs. bad use in a bank — video, 9 min
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
) VALUES (
  'm1.4',
  'm1',
  4,
  'Good vs. bad use in a bank',
  'video',
  9,
  false,
  NULL,
  NULL,
  $body$
## SCRIPT (verbatim)

> "Generative AI inside a community bank is mostly boring, and that is the point. The wins are not flashy. They are *fewer minutes spent on the second draft, more minutes spent with the member in front of you*. Let's walk five examples — three that are good uses, two that look tempting and are bad uses. None of these are real institutions. The numbers are made up. The patterns are real.
>
> **Good use one — rewriting a member letter for clarity.** A back-office colleague drafts an overdraft notice. It is technically correct and almost unreadable. They paste the generic, *anonymised* draft into an assistant — no names, no account numbers — and ask: *plain English at an eighth-grade reading level, warm, two sentences shorter*. They read the result, edit a verb, send it. Twenty minutes, not an hour. The member gets a letter they can actually understand.
>
> **Good use two — turning a long PDF into a one-page summary.** A compliance analyst is handed a forty-page interagency guidance document. They drop the *public* PDF into a summariser, ask for a structured one-pager with section headers and direct quotes for anything load-bearing. They read the summary against the original, fix two paraphrases that softened the rule, and bring the one-pager to their weekly. The whole guidance now fits on one page their committee will actually read.
>
> **Good use three — a first-pass training quiz.** A learning lead has new-hire material on wire fraud red flags. They ask an assistant to draft fifteen multiple-choice questions and answers grounded in the material they pasted in. They throw out four, rewrite three, keep eight. They have a quiz in twenty minutes that would have taken half a day.
>
> **Bad use one — pasting a member's full file to draft a denial letter.** Name, account number, income, the lot. This is the rule from orientation, and it is the one to be religious about. The fix is to describe the *situation*: *a small-business member with a thin credit file is being declined for an unsecured line — draft a respectful denial that explains the decision factors at a high level and points to next steps.* Same letter. None of the file.
>
> **Bad use two — letting the model invent a citation.** A leader asks an assistant for the exact text of a regulation, the model produces a paragraph that sounds exactly like a regulation, and it goes into a board memo. The paragraph is plausible and partly wrong. The fix is mechanical: anything the model claims is a citation, you go fetch the actual citation from the actual source before it leaves your desk. Always.
>
> The pattern across all five is the same. **Good uses bring public or anonymised material to the model and use the model to compress, rewrite, or draft.** **Bad uses either send the model sensitive material or trust it to remember facts it never actually had.** Get that pattern, and you can sort almost any new use case in under a minute."

## PRODUCTION

- Five labelled cards build in sequence as the narrator works through each example. Good uses in `--ledger-ink`, bad uses in `--ledger-weak` (oxblood).
- Close on the pattern card: two columns titled *Good* and *Bad*, each with the one-line pattern from the closing paragraph.
- All institutions and people in the examples are unnamed.
$body$,
  true
)
ON CONFLICT (id) DO UPDATE
  SET module_id              = EXCLUDED.module_id,
      ordinal                = EXCLUDED.ordinal,
      title                  = EXCLUDED.title,
      modality               = EXCLUDED.modality,
      duration_min           = EXCLUDED.duration_min,
      is_branched            = EXCLUDED.is_branched,
      exercise_id            = EXCLUDED.exercise_id,
      takeaway_artifact_type = EXCLUDED.takeaway_artifact_type,
      body_md                = EXCLUDED.body_md,
      published              = EXCLUDED.published;

----------------------------------------------------------------------
-- 3. addie.lesson_track_variants — 5 rows for m1.3
----------------------------------------------------------------------

-- Risk & Compliance
INSERT INTO addie.lesson_track_variants (lesson_id, track, body_md, media_ref)
VALUES (
  'm1.3',
  'risk_compliance',
  $variant$
> "If you sit in risk or compliance at a community bank or credit union, generative AI changes the shape of your week before it changes the shape of your program. Three honest observations.
>
> First, the reading load. You spend hours each week inside guidance, advisories, and exam letters. A capable assistant turns a forty-page interagency document into a structured one-pager you can mark up — section headers, direct quotes for the load-bearing language, a plain-English summary at the top. It does not replace your read. It compresses the second and third reads so you can spend that time on the parts that actually matter to your institution.
>
> Second, the drafting load. Risk assessments, vendor questionnaires, policy crosswalks, internal memos. The first draft of any of these is craft work an assistant does well, when you give it public or anonymised material to work from. The model will not know your control environment. You bring the facts; it shapes the prose.
>
> Third, and this is the one regulators will ask about: the same tools your business lines are starting to use are tools you now have to govern. You cannot govern what you do not understand. The point of the next few modules is not to make you a power user. It is to give you enough fluency that when an examiner asks how your institution evaluates generative AI vendors, or how staff are trained on data discipline, you have answers grounded in the same tools your colleagues are using on Monday morning. That is the deliverable. Not enthusiasm — competence."
$variant$,
  NULL
)
ON CONFLICT (lesson_id, track) DO UPDATE
  SET body_md   = EXCLUDED.body_md,
      media_ref = EXCLUDED.media_ref;

-- Customer-Facing
INSERT INTO addie.lesson_track_variants (lesson_id, track, body_md, media_ref)
VALUES (
  'm1.3',
  'customer_facing',
  $variant$
> "If your seat puts you in front of members or customers — frontline, retail, lending — generative AI does not replace the conversation. It cleans up the work *around* the conversation so the conversation itself can be better.
>
> Three places this shows up. First, written follow-ups. The note after a difficult call. The plain-English explanation of an overdraft policy. The retention message to a small-business owner thinking about leaving for a fintech. These are the second-tier drafts you write at the end of the day when you are tired. An assistant can take a generic, anonymised version of the situation — never the member's file — and give you a calm, warm first draft in thirty seconds. You read it, you edit, you send. The member gets a better letter. You go home.
>
> Second, comprehension. A new disclosure, a new product sheet, a new regulation that touches what you say at the desk. An assistant can give you a one-page summary, a list of likely member questions, and a suggested answer for each. You vet it against your training and your manager's guidance, but you do not start from a blank page.
>
> Third, objection-handling practice. You can role-play a tough conversation with an assistant — *a member is upset that a card was declined while they were traveling* — and run it three different ways before you have it for real. It is a low-stakes rehearsal room you did not have last year.
>
> What does not change: every word that goes to a real member still gets a human read. The model is your prep partner. You are still the one at the desk."
$variant$,
  NULL
)
ON CONFLICT (lesson_id, track) DO UPDATE
  SET body_md   = EXCLUDED.body_md,
      media_ref = EXCLUDED.media_ref;

-- Back-Office Process
INSERT INTO addie.lesson_track_variants (lesson_id, track, body_md, media_ref)
VALUES (
  'm1.3',
  'back_office',
  $variant$
> "Back office and operations is where this technology pays for itself first, quietly, by collapsing the time spent on the work nobody likes doing.
>
> Three concrete places. First, internal documentation. The process memo nobody has updated in eighteen months. The procedure that is correct on paper and confusing in practice. An assistant takes the existing memo — no customer data, just the procedure — and rewrites it for clarity, flags the steps that contradict each other, and proposes a one-page quick reference for the team. You review, you correct, you publish. A week of rewrite collapses to an afternoon.
>
> Second, marketing copy from a public source of truth. A new branch hours change. A new product launch. A holiday closure. An assistant drafts the website note, the lobby card text, and the social post in your institution's voice from a single brief. You edit for tone, your compliance partner signs off, you publish. The pipeline gets faster without getting sloppier — because the human reads have not changed.
>
> Third, structured data wrangling on safe inputs. Reformatting a vendor's CSV into your template. Cleaning the column headers on a public spreadsheet. Drafting a JSON example for an integration partner. Boring work. The kind of work that takes thirty minutes and breaks your concentration for two hours.
>
> What does not change: anything with a member's name attached stays out of public tools. The rule from orientation is your floor here, not your ceiling."
$variant$,
  NULL
)
ON CONFLICT (lesson_id, track) DO UPDATE
  SET body_md   = EXCLUDED.body_md,
      media_ref = EXCLUDED.media_ref;

-- Technical
INSERT INTO addie.lesson_track_variants (lesson_id, track, body_md, media_ref)
VALUES (
  'm1.3',
  'technical',
  $variant$
> "If you are on the IT side of a community bank or credit union, you have probably already been doing some of this and quietly not telling anyone. The point of this course is to make it explicit, repeatable, and defensible.
>
> Three places it lands. First, code and configuration. Reading an unfamiliar codebase, drafting a one-off script, explaining a stack trace, sketching a config file. An assistant — or a coding-shaped assistant like Claude Code or Cursor — is a competent pair-programmer for the work that does not justify pulling a colleague off something more important. You still own the merge. The assistant just gets you to the merge faster.
>
> Second, vendor evaluation. Your institution will be sold AI features by every vendor on your stack over the next eighteen months. You will be the person who has to ask whether the data flow makes sense, whether the contract terms hold up, whether the vendor's own model use is governed. Module five touches a vendor checklist; the deeper work is in the specialist track after this course. For now, fluency is the goal — you cannot ask the right questions about generative AI in a vendor demo if you have never used one.
>
> Third, the boring win — drafting documentation. Runbooks, change tickets, post-incident notes. The writing that you know you should produce and that always slips. An assistant takes your bullet points and produces a complete first draft. You review, correct, publish. The institutional memory gets better.
>
> The rule that protects all of this: no credentials, no production data, no customer records in a public tool. Ever. Build the habit now."
$variant$,
  NULL
)
ON CONFLICT (lesson_id, track) DO UPDATE
  SET body_md   = EXCLUDED.body_md,
      media_ref = EXCLUDED.media_ref;

-- Leadership
INSERT INTO addie.lesson_track_variants (lesson_id, track, body_md, media_ref)
VALUES (
  'm1.3',
  'leadership',
  $variant$
> "If you are running a community bank or credit union, or running a meaningful part of one, the question on your desk is not *should we use AI*. The question is *what is the smallest competent next step*, and *how do we tell whether the result is real*. Three observations from the seat you are in.
>
> First, the strategic risk is not adoption. It is uneven adoption. You will not find out about most of your institution's generative AI use from a memo. You will find out about it because a colleague mentions it in a one-on-one, or because a vendor demos a feature your team already turned on. Your job in this module is not to become a power user. It is to acquire enough fluency that when your CIO, your CRO, and your head of retail are in the room talking about AI, you can ask the questions that close the loop.
>
> Second, the operational opportunity is not at the model. It is at the workflow. The wins inside a community institution look like *thirty per cent less time on second drafts in compliance*, *a faster turn on member follow-ups in retail*, *a shorter cycle on vendor diligence in IT*. None of those headlines win at a conference. All of them show up in the efficiency ratio if you let them.
>
> Third, the governance question is the one regulators are already asking and will keep asking. By the end of this course you will have personally produced a working prompt, a saved skill, and a small prototype. That is not the deliverable for your institution. It is the deliverable for *you* — the experiential floor that lets you chair the AI conversation without outsourcing it. Everything else builds on that floor."
$variant$,
  NULL
)
ON CONFLICT (lesson_id, track) DO UPDATE
  SET body_md   = EXCLUDED.body_md,
      media_ref = EXCLUDED.media_ref;

----------------------------------------------------------------------
-- 4. addie.knowledge_checks — 10 items across the 4 lessons
----------------------------------------------------------------------

-- m1.1 — 3 checks
INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0001-0000-0000-000000000001', 'm1.1', 1,
 'A model produces a confident answer to a question you suspect it does not actually know. What is the most accurate way to describe what happened?',
 '[
   {"id":"a","label":"The model malfunctioned and should be reported.","correct":false,"explanation":"It did not malfunction. It produced the most-plausible next chunk of text, which is its job."},
   {"id":"b","label":"The model hallucinated — produced plausible-sounding text without grounding. This is a property of the engine, not a bug.","correct":true,"explanation":"Correct. Hallucination is the predictable behaviour of a predictive token engine when it lacks the answer."},
   {"id":"c","label":"The model searched the internet and got the wrong page.","correct":false,"explanation":"It did not search the internet. It has no live wire to anything outside the prompt."},
   {"id":"d","label":"The model accessed a stale cache that needs clearing.","correct":false,"explanation":"There is no cache to clear. The behaviour comes from how the engine is built."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0001-0000-0000-000000000002', 'm1.1', 2,
 'You ask a model about a rate change announced this morning. Why does it not know?',
 '[
   {"id":"a","label":"It has a training cutoff and no live wire to today''s news.","correct":true,"explanation":"Correct. The model was trained on text up to a fixed date; anything after that date must be supplied in the prompt."},
   {"id":"b","label":"Your subscription does not include news access.","correct":false,"explanation":"This is about how the engine is built, not a subscription tier."},
   {"id":"c","label":"It only learns from sources it deems credible.","correct":false,"explanation":"It does not learn at the moment you ask. The training is offline and historical."},
   {"id":"d","label":"It refuses to discuss financial information.","correct":false,"explanation":"It is willing to discuss the topic. It just does not have today''s fact."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0001-0000-0000-000000000003', 'm1.1', 3,
 'Which best describes what a modern generative model fundamentally does?',
 '[
   {"id":"a","label":"Looks up the answer in a knowledge base curated by experts.","correct":false,"explanation":"There is no curated knowledge base inside the model. It is parameters."},
   {"id":"b","label":"Reasons step-by-step from first principles to a verified answer.","correct":false,"explanation":"It can imitate that pattern, but the underlying mechanism is next-token prediction."},
   {"id":"c","label":"Predicts the next most-plausible chunk of text, again and again, until it stops.","correct":true,"explanation":"Correct. That is the engine. The capabilities and the limits both flow from this."},
   {"id":"d","label":"Searches the open internet in real time and synthesises sources.","correct":false,"explanation":"Some products bolt search on top. The base model does not search."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

-- m1.2 — 2 checks
INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0002-0000-0000-000000000001', 'm1.2', 1,
 'A new tool''s marketing leads with the verb "ship." Which bucket is it most likely in?',
 '[
   {"id":"a","label":"Assistant — a chat-shaped thinking partner.","correct":false,"explanation":"Assistants talk back. Builders ship things."},
   {"id":"b","label":"Builder — a construction crew that produces running software from a brief.","correct":true,"explanation":"Correct. Verbs like build, ship, deploy point to a builder."},
   {"id":"c","label":"Search engine.","correct":false,"explanation":"Not the right bucket for this course."},
   {"id":"d","label":"It cannot be classified without trying it.","correct":false,"explanation":"The verb test gets you most of the way before you ever open the product."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0002-0000-0000-000000000002', 'm1.2', 2,
 'In the tool-landscape matrix, the vertical axis (free tier ↔ paid tier) is:',
 '[
   {"id":"a","label":"Graded the same as the horizontal axis.","correct":false,"explanation":"Only the horizontal axis is graded; the vertical axis is informational."},
   {"id":"b","label":"Informational only — useful context, but not part of the right-or-wrong sort.","correct":true,"explanation":"Correct. Pricing tiers change often; the assistant-vs-builder distinction is the durable one."},
   {"id":"c","label":"A measure of model quality.","correct":false,"explanation":"Pricing is not a quality signal."},
   {"id":"d","label":"Restricted to enterprise-only tools.","correct":false,"explanation":"Most tools on the map have a free tier."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

-- m1.3 — 2 checks (apply across tracks)
INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0003-0000-0000-000000000001', 'm1.3', 1,
 'The role-specific audio you just heard frames generative AI as a change to:',
 '[
   {"id":"a","label":"The technology itself, which you must now learn end-to-end.","correct":false,"explanation":"The point is the shape of your week, not deep technical mastery."},
   {"id":"b","label":"The shape of the work you already do — fewer minutes on the second draft, more minutes on the part that matters.","correct":true,"explanation":"Correct. Each track frames the change in terms of the work the listener already owns."},
   {"id":"c","label":"Your job title.","correct":false,"explanation":"No track suggests that."},
   {"id":"d","label":"Your institution''s strategic plan.","correct":false,"explanation":"Strategy is the leadership track''s emphasis, but the universal point is the weekly work."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0003-0000-0000-000000000002', 'm1.3', 2,
 'Can you switch tracks later and hear another role''s audio?',
 '[
   {"id":"a","label":"No — the track choice is permanent.","correct":false,"explanation":"You can change track from your profile at any time."},
   {"id":"b","label":"Yes — change the track on your profile and replay the lesson.","correct":true,"explanation":"Correct. The lesson re-renders the correct variant for the active track."},
   {"id":"c","label":"Only on the paid tier.","correct":false,"explanation":"Track switching is free."},
   {"id":"d","label":"Only with admin approval.","correct":false,"explanation":"It is a self-serve setting."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

-- m1.4 — 3 checks
INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0004-0000-0000-000000000001', 'm1.4', 1,
 'Which of the following is the cleanest example of a good use of generative AI in a community bank?',
 '[
   {"id":"a","label":"Pasting a member''s full file into a public tool to draft a denial letter.","correct":false,"explanation":"Sensitive data into a public tool — this is a bad use, every time."},
   {"id":"b","label":"Asking an assistant to rewrite an anonymised overdraft notice in plainer English at an eighth-grade reading level.","correct":true,"explanation":"Correct. Anonymised input, compression/rewrite task, human edit and send."},
   {"id":"c","label":"Letting the model invent a regulatory citation for a board memo.","correct":false,"explanation":"Plausible-sounding citations need to be verified against the actual source."},
   {"id":"d","label":"Asking the model for today''s prime rate and trusting the answer.","correct":false,"explanation":"It has no live wire to today''s rate; the answer would be a guess."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0004-0000-0000-000000000002', 'm1.4', 2,
 'The model produces what looks like a direct quote from a regulation. What is the right next step before it leaves your desk?',
 '[
   {"id":"a","label":"Trust it — quoted text in the output is reliable.","correct":false,"explanation":"Quoted text in model output is not automatically a real citation."},
   {"id":"b","label":"Fetch the actual citation from the actual source and verify the quote word-for-word.","correct":true,"explanation":"Correct. Verify every load-bearing citation against the source."},
   {"id":"c","label":"Ask the model to confirm the citation is real.","correct":false,"explanation":"The model has no way to verify itself. It will likely double down."},
   {"id":"d","label":"Strip the citation entirely.","correct":false,"explanation":"You do not have to strip it — you have to verify it."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options) VALUES
('11111111-0004-0000-0000-000000000003', 'm1.4', 3,
 'The general pattern that separates good uses from bad uses inside a bank is:',
 '[
   {"id":"a","label":"Good uses bring public or anonymised material to the model to compress, rewrite, or draft; bad uses send the model sensitive material or trust it to remember facts it never had.","correct":true,"explanation":"Correct. That is the one-line pattern from the closing card."},
   {"id":"b","label":"Good uses are always automated; bad uses always involve a human.","correct":false,"explanation":"Humans are in the loop for the good uses too."},
   {"id":"c","label":"Good uses are paid features; bad uses are free.","correct":false,"explanation":"Tier has nothing to do with it."},
   {"id":"d","label":"Good uses produce short outputs; bad uses produce long ones.","correct":false,"explanation":"Length is not the test."}
 ]'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET lesson_id = EXCLUDED.lesson_id,
      ordinal   = EXCLUDED.ordinal,
      prompt    = EXCLUDED.prompt,
      options   = EXCLUDED.options;

----------------------------------------------------------------------
-- 5. addie.exercises — m1-2-tool-landscape (NOT an LLM exercise)
----------------------------------------------------------------------
-- The interactive is a sortable matrix rendered client-side by
-- src/components/addie/interactives/m1/ToolLandscapeMatrix.tsx. The
-- ground-truth categorisation lives inside preset_context_blocks[0].body
-- (server-side only), which the lesson API route ships to the client because
-- this exercise does not call an LLM — the "tools" payload IS the content.
-- system_prompt is a no-op stub; gating limits any accidental provider call.

INSERT INTO addie.exercises (
  id, lesson_id, mode, track_variant,
  system_prompt, lever_directives,
  task_scaffold, levers, data_slots,
  preset_context_blocks,
  default_provider, allow_provider_switch,
  gating, entitlement, published
) VALUES (
  'm1-2-tool-landscape',
  'm1.2',
  'single',
  NULL,
  '-- not an LLM exercise; rendered by m1/ToolLandscapeMatrix --',
  '{}'::jsonb,
  'Sort each tool into the quadrant that best fits how you would actually reach for it.',
  '[]'::jsonb,
  '[]'::jsonb,
  $preset$[
    {
      "id": "tools",
      "label": "tools to classify",
      "body": "[{\"name\":\"Claude\",\"hint\":\"Anthropic''s chat assistant — long-context reading, drafting, decision support.\",\"ground_truth_category\":\"assistant\",\"vendor_url\":\"https://claude.ai\"},{\"name\":\"ChatGPT\",\"hint\":\"OpenAI''s chat assistant — broad general-purpose thinking partner.\",\"ground_truth_category\":\"assistant\",\"vendor_url\":\"https://chat.openai.com\"},{\"name\":\"Microsoft Copilot\",\"hint\":\"Assistant embedded in Microsoft 365 — Word, Outlook, Teams.\",\"ground_truth_category\":\"assistant\",\"vendor_url\":\"https://copilot.microsoft.com\"},{\"name\":\"Google Gemini\",\"hint\":\"Google''s chat assistant — integrates with Workspace.\",\"ground_truth_category\":\"assistant\",\"vendor_url\":\"https://gemini.google.com\"},{\"name\":\"NotebookLM\",\"hint\":\"Google''s grounded assistant — summarises and Q&As over documents you upload.\",\"ground_truth_category\":\"assistant\",\"vendor_url\":\"https://notebooklm.google.com\"},{\"name\":\"Perplexity\",\"hint\":\"Assistant-style answer engine with live citations.\",\"ground_truth_category\":\"assistant\",\"vendor_url\":\"https://www.perplexity.ai\"},{\"name\":\"Lovable\",\"hint\":\"Builder — describe an app, get a running web app.\",\"ground_truth_category\":\"builder\",\"vendor_url\":\"https://lovable.dev\"},{\"name\":\"Replit Agents\",\"hint\":\"Builder — agentic coding inside Replit''s online IDE.\",\"ground_truth_category\":\"builder\",\"vendor_url\":\"https://replit.com\"},{\"name\":\"v0\",\"hint\":\"Builder — Vercel''s UI generator that ships React components.\",\"ground_truth_category\":\"builder\",\"vendor_url\":\"https://v0.dev\"},{\"name\":\"Cursor\",\"hint\":\"Builder-flavoured assistant — an IDE that writes and edits your code with you.\",\"ground_truth_category\":\"builder\",\"vendor_url\":\"https://cursor.com\"},{\"name\":\"Claude Code\",\"hint\":\"Builder — Claude with hands; reads and edits files in a real project.\",\"ground_truth_category\":\"builder\",\"vendor_url\":\"https://www.anthropic.com/claude-code\"},{\"name\":\"Stitch\",\"hint\":\"Builder — Google''s tool for going from prompt to UI design and front-end code.\",\"ground_truth_category\":\"builder\",\"vendor_url\":\"https://stitch.withgoogle.com\"}]"
    }
  ]$preset$::jsonb,
  'anthropic',
  false,
  '{"maxOutputTokens":1,"maxOutputChars":1}'::jsonb,
  'free',
  true
)
ON CONFLICT (id) DO UPDATE
  SET lesson_id             = EXCLUDED.lesson_id,
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
