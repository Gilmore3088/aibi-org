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
A modern model is a **predictive token engine**. Pattern-completion at scale. Not knowing, not believing — just producing the next most-plausible chunk of text.

## SCRIPT (verbatim)

> [stat] 3 | Three properties of every model | Training cutoff · No live knowledge · Hallucination as a property. Hold these together and the rest of the course makes sense.

> [case:good] Training cutoff
> The model was trained on text up to a specific date. Anything after — a rate change, last Tuesday's OCC bulletin — it does not know unless you put it in the prompt.
> [outcome] No live wire to the internet, your core, your email.

> [case:good] No live knowledge of your bank
> Cannot check a balance. Cannot look up today's prime. Cannot read a member file.
> [outcome] You bring the fact to the model. The model does not go get it.

> [case:good] Hallucination is a property, not a bug
> When the model has no answer it produces the most plausible one anyway. Confident, fluent, sometimes wrong.
> [outcome] Read every output like a loan file. Verify citations. Decide whether to use it.

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
A thousand AI tools that look the same. Almost every one sits in one of two buckets.

## SCRIPT (verbatim)

> [stat] 2 | Two buckets, one verb-test | Assistants are thinking partners · Builders are construction crews · The verb in the marketing tells you which.

> [case:good] Assistants — thinking partners
> Claude, ChatGPT, Gemini, Copilot, NotebookLM, Perplexity. A chat window. Talk, they talk back. Most of the first year's wins live here: clearer letters, one-page summaries, draft quizzes.
> [outcome] Reach for these to read, write, summarise, decide.

> [case:good] Builders — construction crews
> Lovable, Replit Agents, v0, Cursor, Claude Code, Stitch. You brief them; they produce running software. Touched lightly in Module 5.
> [outcome] Reach for these to build, ship, deploy.

> [case:good] The verb is your tell
> *Chat · summarise · draft · ask* → assistant. *Build · ship · deploy · generate* → builder. The marketing copy is honest even when the rest isn't.
> [outcome] Sort any new AI product in under thirty seconds.

> [tip] Read the vendor's pricing page. The verbs there give the bucket away faster than any review.

> [warn] The bucket is a routing decision, not a religion. Claude Code is a builder when you write code with it, an assistant when you read files with it.

Sort the 12 tools below into the 2×2. Submit. Save the result — that is your AI Toolkit Map.

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

> [stat] 8m | Audio for your role | Eight minutes on what generative AI changes about *your* week, specifically. Switch tracks any time to hear another seat.

> [tip] Headphones in. The audio is your track's variant; the player and transcript render below.

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
The wins are not flashy. Fewer minutes on the second draft; more minutes with the member in front of you. Five examples — three good, two bad.

## SCRIPT (verbatim)

> [stat] ~65% | FDIC Quarterly Banking Profile, Q4 2024 | Community-bank median efficiency ratio. Industry-wide sits at 55.7%. The 10-point gap is exactly where AI savings land — minutes per task, repeated thousands of times a quarter.

> [case:good] Rewriting a member letter for clarity
> Generic, anonymised draft into an assistant. Ask for plain English at an eighth-grade reading level, warm, two sentences shorter. Edit a verb, send.
> [outcome] Twenty minutes, not an hour. Data hands to no one.

> [case:good] Long PDF → one-page summary
> Forty-page interagency document, structured one-pager with section headers and direct quotes for load-bearing language. Read against the original, catch the paraphrases that softened the rule.
> [outcome] The committee actually reads it.

> [case:good] First-pass training quiz from existing material
> Fifteen multiple-choice questions grounded in pasted material. Throw out four, rewrite three, keep eight.
> [outcome] Half a day's work, compressed to twenty minutes.

> [case:bad] Pasting a member's full file to draft a denial letter
> Name, account, income, employer — all of it. The fix: describe the situation, not the person.
> [outcome] Same letter. None of the file.

> [case:bad] Letting the model invent a citation
> Plausible paragraph that sounds like a regulation, ends up in a board memo. Partly wrong.
> [outcome] Go fetch the live text — SR 11-7, OCC bulletins, Reg E — always.

> [tip] Ten-second "before I paste" pause. If you cannot say your clipboard contents aloud without naming a real customer or unreleased number, the answer is no.

> [warn] A model that invents a citation is doing exactly what it was built to do. The verification habit lives with you.

## PRODUCTION

- Five labelled cards build in sequence as the narrator works through each example. Good uses carry the ink rule, bad uses carry the oxblood rule (`--ledger-weak`). Each card has a one-line outcome footer.
- The efficiency-ratio stat card sits high on the page — the data hook that earns the reader's attention before any of the examples land.
- Close on the pattern card: two columns titled Good and Bad, each with the one-line pattern from the closing paragraph.
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
> **One: the reading load gets smaller.** You spend hours each week inside guidance, advisories, and exam letters. A capable assistant turns a forty-page interagency document into a structured one-pager you can mark up — section headers, direct quotes for the load-bearing language, a plain-English summary at the top. It does not replace your read. It compresses the second and third reads so you spend that time on the parts that actually matter to your institution.
>
> **Two: the drafting load gets faster.** Risk assessments, vendor questionnaires, policy crosswalks, internal memos. The first draft of any of these is craft work an assistant does well, when you give it public or anonymised material to work from. The model will not know your control environment. You bring the facts; it shapes the prose. You still own the final read, the citations, and the sign-off.
>
> **Three: the governance question lands on your desk.** The same tools your business lines are starting to use are tools you now have to govern, and you cannot govern what you do not understand. The point of the next few modules is not to make you a power user. It is to give you enough fluency that when an examiner asks how your institution evaluates generative AI vendors under the Interagency TPRM Guidance, or how staff are trained on data discipline, you have answers grounded in the same tools your colleagues are using on Monday morning.
>
> Hold those three together: less reading time, faster drafts, real governance fluency. That is the deliverable from this course. Not enthusiasm — competence."
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
> "If your seat puts you in front of members or customers — frontline, retail, lending — generative AI does not replace the conversation. It cleans up the work around the conversation so the conversation itself can be better.
>
> **One: the written follow-ups get easier.** The note after a difficult call. The plain-English explanation of an overdraft policy. The retention message to a small-business owner thinking about leaving for a fintech. These are the second-tier drafts you write at the end of the day when you are tired. An assistant can take a generic, anonymised version of the situation — never the member's file — and give you a calm, warm first draft in thirty seconds. You read it, you edit, you send. The member gets a better letter. You go home.
>
> **Two: comprehension speeds up.** A new disclosure, a new product sheet, a new regulation that touches what you say at the desk. An assistant gives you a one-page summary, a list of likely member questions, and a suggested answer for each. You vet it against your training and your manager's guidance. You do not start from a blank page.
>
> **Three: rehearsal becomes a real option.** You can role-play a tough conversation with an assistant — a member is upset that a card was declined while they were travelling — and run it three different ways before you have it for real. It is a low-stakes rehearsal room you did not have last year, and it costs you ten minutes.
>
> Hold those three together: better follow-ups, faster comprehension, a rehearsal room when you need one. What does not change: every word that goes to a real member still gets a human read. The model is your prep partner. You are still the one at the desk."
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
> **One: internal documentation gets unstuck.** The process memo nobody has updated in eighteen months. The procedure that is correct on paper and confusing in practice. An assistant takes the existing memo — no customer data, just the procedure — and rewrites it for clarity, flags the steps that contradict each other, and proposes a one-page quick reference for the team. You review, you correct, you publish. A week of rewrite collapses to an afternoon.
>
> **Two: marketing copy from a public source of truth is a thirty-minute job.** A new branch-hours change. A new product launch. A holiday closure. An assistant drafts the website note, the lobby card text, and the social post in your institution's voice from a single brief. You edit for tone, your compliance partner signs off, you publish. The pipeline gets faster without getting sloppier — because the human reads have not changed.
>
> **Three: structured data wrangling on safe inputs disappears as a friction.** Reformatting a vendor's CSV into your template. Cleaning the column headers on a public spreadsheet. Drafting a JSON example for an integration partner. Boring work. The kind that takes thirty minutes and breaks your concentration for two hours. An assistant handles the shape, you keep your concentration.
>
> Hold those three together: better procedures, faster public-facing copy, fewer thirty-minute interruptions. What does not change: anything with a member's name attached stays out of public tools. The rule from orientation is your floor here, not your ceiling."
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
> **One: code and configuration get a pair-programmer.** Reading an unfamiliar codebase, drafting a one-off script, explaining a stack trace, sketching a config file. An assistant — or a coding-shaped assistant like Claude Code or Cursor — is a competent partner for the work that does not justify pulling a colleague off something more important. You still own the merge. The assistant gets you there faster, and it shows its work so you can read every line before it ships.
>
> **Two: vendor evaluation gets serious.** Your institution will be sold AI features by every vendor on your stack over the next eighteen months. You will be the person who has to ask whether the data flow makes sense, whether the contract terms hold up under the Interagency TPRM Guidance, whether the vendor's own model use is governed. Module five touches a vendor checklist; the deeper work lives in the AiBI-S specialist track. For now the goal is fluency. You cannot ask the right questions in a vendor demo if you have never used one of these tools yourself.
>
> **Three: documentation finally gets written.** Runbooks, change tickets, post-incident notes. The writing you know you should produce and that always slips. An assistant takes your bullet points and produces a complete first draft. You review, correct, publish. The institutional memory gets better and your team stops re-solving the same problem every six months.
>
> Hold those three together: code partner, vendor evaluator, documentarian. The rule that protects all of it: no credentials, no production data, no customer records in a public tool. Ever. Build the habit now and the bigger problems never reach you."
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
> "If you are running a community bank or credit union, or running a meaningful part of one, the question on your desk is not should we use AI. The question is what is the smallest competent next step, and how do we tell whether the result is real. Three observations from the seat you are in.
>
> **One: the strategic risk is not adoption — it is uneven adoption.** You will not find out about most of your institution's generative AI use from a memo. You will find out about it because a colleague mentions it in a one-on-one, or because a vendor demos a feature your team turned on six weeks ago. Your job in this module is not to become a power user. It is to acquire enough fluency that when your CIO, your CRO, and your head of retail are in the room talking about AI, you ask the questions that close the loop.
>
> **Two: the operational opportunity is at the workflow, not the model.** The wins inside a community institution look like thirty percent less time on second drafts in compliance, a faster turn on member follow-ups in retail, a shorter cycle on vendor diligence in IT. None of those headlines wins at a conference. All of them show up in the efficiency ratio — community-bank median sits around 65 percent per FDIC, against industry-wide 55.7 percent — if you let them.
>
> **Three: the governance question is the one regulators are already asking, and will keep asking.** Bank Director's 2024 survey found 66 percent of banks discussing AI budget; Gartner says 55 percent have no governance framework yet. By the end of this course you will have personally produced a working prompt, a saved skill, and a small prototype. That is not the deliverable for your institution. It is the deliverable for you — the experiential floor that lets you chair the AI conversation without outsourcing it.
>
> Hold those three together: uneven adoption is the real risk, the workflow is where the win lives, and governance fluency is what keeps the regulator conversation calm. Everything else in this course builds on that floor."
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

----------------------------------------------------------------------
-- 4. Phase 1 Guided Lesson Shell — opt m1.1 into LessonStepShell
--    (2026-05-25). See migration 00073 + LessonStepPlayer.
----------------------------------------------------------------------
UPDATE addie.lessons SET shell_kind = 'step' WHERE id = 'm1.1';
