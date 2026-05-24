-- supabase/seed/m4_addie.sql
-- Module 4 — Automating the repetitive (skills).
-- PAID tier (foundation_individual / foundation_team_seat). First paid module.
-- 4 lessons: 4.1 video · 4.2 skill builder · 4.3 role skill (branched ×5)
-- · 4.4 test/refine/guardrail-check.
--
-- A "skill" here is an addie.toolbox_items row of type='skill' whose
-- body_md is JSON-encoded {exerciseId, fixedLeverSelections, slotSchema,
-- presetIds?} — the live shape consumed by sandbox-service/src/handlers/skill.ts.
-- m4.2 and m4.3 produce that JSON. m4.4 executes it via /api/skill/run and
-- appends a guardrails note.
--
-- Branching: m4.3 follows m3.5's pattern — a single exercise with a `track`
-- lever exposing 5 options; per-track narration lives in lesson_track_variants.
-- We do NOT duplicate the exercise five times.
--
-- The m4-2 / m4-3 / m4-4 exercises are non-LLM scaffolds (gating clamped to
-- maxOutputTokens:1, maxOutputChars:1) — they exist so the lesson dispatch
-- can resolve an exercise_id and forward the preset_context_blocks to the
-- React widget. The widgets call the toolbox API directly to save skills
-- and call /api/skill/run to execute them.
--
-- All body_md heredocs are wrapped in dollar-quoted strings; multi-line
-- JSON inside jsonb is collapsed to a single line to dodge Postgres's
-- 0x0a-escape error that hit M0/M3 in earlier waves.

-- =====================================================================
-- 1. Module — PAID
-- =====================================================================
INSERT INTO addie.modules (id, ordinal, title, tier, summary, published)
VALUES (
  'm4',
  4,
  'Automating the repetitive: skills',
  'paid',
  'Turn one good prompt into a reusable skill — your private library.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  ordinal   = EXCLUDED.ordinal,
  title     = EXCLUDED.title,
  tier      = EXCLUDED.tier,
  summary   = EXCLUDED.summary,
  published = EXCLUDED.published;

-- =====================================================================
-- 2. Lessons (4)
-- =====================================================================

-- Lesson 4.1 — What a skill is (video, ~10 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm4.1',
  'm4',
  1,
  'What a skill is',
  'video',
  10,
  false,
  NULL,
  NULL,
  $LESSON$
A skill is one of your good prompts, saved with the choices already made, ready to run on new material on Monday morning without retyping anything. That is the whole concept. Everything else in this module is mechanics — and the mechanics are what take you from a clever one-off prompt to a personal library your team can rely on.

## SCRIPT (verbatim)

> "Three things to understand about skills before you build one. They make every other decision in this module obvious.
>
> **One: saved beats remembered, every single time.** You wrote a strong prompt in Module 3 — role, task, context, format, the constraint that stopped the model inventing citations. Two weeks from now, when a new SR letter drops or a similar member complaint hits the queue, you will not retype that prompt from scratch. You will either reach for the saved version, or you will write a worse one because you are in a hurry. Saving the prompt is the move. Locking the choices that made it work is the move underneath the move.
>
> **Two: a skill is two parts — locked choices, and input slots.** Locked choices are the decisions that make your prompt work for this shape of task — the role the model plays, the audience it writes for, the length, the constraint about citations, the closing instruction to flag what was missing. These do not change between runs; you set them once. Input slots are the bits that do change every time — the rule excerpt, the complaint summary, the vendor category. You name each slot, you give it a one-line help label, and the skill prompts you for it the next time you run it. That is the whole anatomy.
>
> **Three: a skill is not an agent.** It does not run on its own. It does not chain into other skills. It does not browse the web or read your inbox. It is one named, parameterised prompt with the choices locked and the slots labelled. That bounded scope is the feature, not the limitation — it is what makes the skill safe to hand to a colleague, safe to run on a regular cadence, and safe to defend in front of a regulator. Agents are Module 5; today we are building one reliable named prompt at a time.
>
> Hold those three together. Saved beats remembered, the anatomy is choices plus slots, and the scope is bounded on purpose. If you can build one of these, you can build twenty. That personal library is what makes the rest of Module 4 worth the price."

> [tip] Pick your first skill from the prompt in your Starter Prompt Pack you have run at least twice already. A skill is most useful when it codifies something you have done by hand enough times to know what the locked choices should be.

> [warn] Resist the temptation to build a skill that does five things. A skill that summarises, drafts, and audits in one run is three skills jammed together, and it will be hard to debug when one of the three drifts. One skill, one shape of task. Build twenty narrow skills, not three wide ones.

## PRODUCTION

- Cold open on a card titled "saved beats remembered," then build the two-part anatomy diagram (locked choices on the left, input slots on the right, the unified skill in the middle) as the narrator names each part.
- Reference card at the close: "A skill is one named, parameterised prompt — bounded scope is the feature."
- Hand off to 4.2 with a single line: "Now you build one."
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

-- Lesson 4.2 — Build your first skill (interactive skill builder, ~15 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm4.2',
  'm4',
  2,
  'Build your first skill',
  'interactive',
  15,
  false,
  'm4-2-build-first-skill',
  'skill_template',
  $LESSON$
The Skill Builder below takes one of the prompts you already wrote in Module 3 and turns it into a saved, parameterised template you can run next week with new material. Four steps. Fifteen minutes. You walk out with a Skill Template artifact in your Toolbox and a working understanding of the difference between a one-off prompt and a saved skill.

## SCRIPT (verbatim)

> "Four steps in the builder. Each one takes a minute or two. Skip any of them and the skill works once and breaks the second time.
>
> **One: pick a source exercise.** The most natural choice is one of the prompts from your Starter Prompt Pack — the Reg-E summariser, the member-comms reply, the vendor checklist, whichever recurs most in your week. If you would rather start from the side-by-side A/B exercise in 3.2, the builder accepts that too — you lock in the audience and length you preferred and turn it into a saved skill. Either way, the source decides what controls the skill exposes.
>
> **Two: lock the choices.** For each control the source exercise carried — role, audience, length, format, the constraints you added — make a decision. Either fix it (always teller audience, always five bullets, always 'do not invent citations') or mark it 'let me choose at run time.' Fixed choices give you consistency; runtime choices give you flexibility. Most working skills are mostly fixed with one or two runtime levers — that is the right ratio and the builder defaults to it.
>
> **Three: name your input slots.** These are the bits that change every run. Give each slot a short, banker-readable name — 'rule_excerpt' not 'input_1,' 'complaint_summary' not 'text' — and a one-line help label that future-you will read in a hurry. The help label is where you remind yourself what kind of material goes in: 'paste the public regulatory text only — no member identifiers,' or 'describe the situation in two sentences, no names.' Slots without help labels become trip-hazards three months later.
>
> **Four: save.** The saved skill becomes a Skill Template artifact in your Toolbox. Lesson 4.3 will turn it into a Working Skill tuned to your role. Lesson 4.4 will run it on new material and add the guardrail notes that travel with the skill. Each save is versioned, so you can keep iterating without losing the version that already worked.
>
> Hold those four together. Source, locked choices, named slots, save. The pattern works for every shape of task and it scales — by the end of this module you will have built three skills using exactly the same four steps."

> [tip] Name your skill the way you would name a procedure document, not the way you would name a file. "Reg summary for tellers" is a name your future self will recognise. "untitled_skill_v3_FINAL" is not.

> [warn] The skill runner enforces the same PII screen the sandbox does. A slot value that trips the screen — a real name plus an account number, a full SSN, a draft SAR narrative — is rejected before the model sees it. The screen is not a substitute for the data-discipline rule; it is a backstop. The habit is still yours.

## PRODUCTION

- Skill Builder is the screen. Narration above plays once on first visit.
- Four step indicators across the top fill in as the learner advances; each one carries the one-line description from the SCRIPT.
- Save button highlights once all four steps are complete; the saved Skill Template appears in a sidebar Toolbox preview.
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

-- Lesson 4.3 — Build a skill for your role (interactive, branched ×5, ~15 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm4.3',
  'm4',
  3,
  'Build a skill for your role',
  'interactive',
  15,
  true,
  'm4-3-role-skill',
  'skill',
  $LESSON$
The Skill Builder is back, this time pre-loaded with a starting point tuned to your role. Per-track framing sits below this paragraph; the builder defaults to the source exercise and slot labels most useful for that track. You can take the defaults, or you can swap the source and rename the slots — the framework is identical to 4.2.

## SCRIPT (verbatim)

> "Three things to do differently this time, even though the builder looks the same.
>
> **One: trust the pre-load — then question it.** Your track variant pre-loads the source exercise and slot labels we have seen work well for that role. Read them. If they fit your week, accept the defaults and move to step two. If they do not — if you are a compliance officer who reads more vendor questionnaires than SR letters, or a back-office lead whose recurring task is press releases rather than process memos — swap the source. The track defaults are a starting point, not a verdict.
>
> **Two: tune the locked choices to your institution, not just your role.** Two community banks the same size will have different language for the same thing — 'member' versus 'customer,' 'branch' versus 'store,' 'CCO' versus 'BSA officer.' Edit the locked role text and the constraint language so the output sounds like your institution at a glance. A skill that lands in your tone the first time you read it is a skill you will keep using; one that needs a tone edit every run will quietly disappear from your Toolbox.
>
> **Three: save as a Working Skill, not a draft.** A Working Skill is the version you would hand to a colleague today and trust them to use without retraining. If yours is not at that bar yet, that is fine — but say so in the name ('Reg summary for tellers — draft, needs one more pass') so future-you knows what you are looking at. The Toolbox does not judge; clarity does.
>
> Hold those three together. Trust the pre-load, tune to your institution, save honestly. The next lesson runs this exact skill on new material and walks the guardrail check that turns it from a working skill into a defensible one."

> [tip] If your role's pre-loaded source does not match your seat, treat that as a signal worth a note. The Toolbox tracks which track-default sources get most often swapped, and the swap pattern feeds back into the curriculum for the next cohort.

> [warn] Do not save a Working Skill with the test placeholder text still in the input slots. Empty slots are correct; placeholders like "[paste rule here]" can leak into a real run if you are tired. The builder warns; the warning is worth heeding.

## PRODUCTION

- Skill Builder pre-loads per `profile.track`. Track-defaulted controls show a small "track default" badge that the learner can override.
- Save button writes a Working Skill to the Toolbox under a Module-4 collection.
- Hand-off card after save: "Run this skill on new material" → links to 4.4.
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

-- Lesson 4.4 — Test, refine, guardrail-check (interactive, ~12 min)
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm4.4',
  'm4',
  4,
  'Test, refine, guardrail-check',
  'interactive',
  12,
  false,
  'm4-4-test-refine',
  NULL,
  $LESSON$
A skill that has never been run on new material is a guess. This lesson turns it into a verified piece of your toolkit — and attaches the guardrail notes that travel with the skill the next time you or a colleague runs it.

## SCRIPT (verbatim)

> "Three moves, in order. They look small. Together they are the difference between a clever saved prompt and a defensible piece of work.
>
> **One: run the skill on realistic new material.** Pick one of the skills you built in 4.2 or 4.3 from the list below. Fill the input slots with realistic synthetic material — a public regulator text the skill has not seen, a described situation in your own words, a generic vendor proposal stripped of identifiers. Run it. Read the output as if it had just landed in your inbox at 3pm on a busy Thursday: would you send it, forward it to your manager, or fix it first? Be honest. The point of the run is to find the gap between what you hoped for and what showed up.
>
> **Two: walk the four-question guardrail check.** The right-hand panel asks four short questions, and you write a one-line note for each. Does the output cite anything that does not appear in the slot material? Would you be comfortable sending this to a member or a regulator as-is? Where does it need a human pass before it leaves your screen? What is the one input pattern that would break this skill? The four notes attach to the skill's saved record so future-you, or a colleague you hand it to, opens it already knowing where the soft spots are.
>
> **Three: refine and re-save.** If the output drifted in a predictable way — invented citations, drifted off tone, missed the audience — edit the locked choices in the skill (add a constraint, sharpen the role, tighten the format) and re-run. The Toolbox versions skills automatically, so the previous version is still there if you change your mind. When the output lands cleanly twice in a row on different inputs, mark the skill 'verified' and move on. Two clean runs is the bar; perfection is a trap.
>
> Hold those three together. Real run, four-question check, refine and re-save. The data-discipline rule keeps customer data out at the input. The guardrail check keeps weak output from getting forwarded. Both layers travel with the skill — and when you hand a skill to a colleague, you are handing them both the saved prompt and your notes on what to watch for. That is the move that turns a clever prompt into a piece of work your team can rely on."

> [tip] Save your guardrail notes in the same plain-English voice you would use in a hand-off conversation. "Watch for invented Reg numbers — verify against the source text" reads better in three months than "validate citation accuracy."

> [warn] A skill that needs more than four guardrail notes is probably trying to do too much. Split it into two smaller skills, each with one or two notes, and you will end up with two pieces of work you trust instead of one piece of work you do not.

## PRODUCTION

- Skill runner is the main surface; guardrail-check panel docks to the right.
- After the four notes are written, the "verified" badge becomes available; clicking it stamps the skill record and updates the Toolbox listing.
- Module-end summary card surfaces the count of verified skills the learner built across 4.2, 4.3, and 4.4.
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
-- 3. Track variants for m4.3 (5 tracks)
-- =====================================================================
INSERT INTO addie.lesson_track_variants (lesson_id, track, body_md, media_ref)
VALUES
(
  'm4.3',
  'risk_compliance',
  $TV$
### Build a skill for your role — Risk & Compliance

The Reg-E summarizer is the skill compliance shops talk about wanting
and rarely build, because the only people who could build it are the
ones absorbing the rule. This is the lesson that builds it.

Start from your m3.5 prompt — the one that turned a public regulation
into a teller-readable summary. The Skill Builder pre-loads it as the
source. Lock the role to "compliance analyst at a community bank,"
lock the audience to "branch tellers," lock the length to "five bullets
under 150 words, ending with a one-line reader-aloud." Leave the input
slot named "rule excerpt" — that is the thing that will change every
time a new SR letter or interagency statement drops.

Save it as something you will recognize in your Toolbox next quarter:
"Reg summary for tellers" works. The next time CFPB or the Fed posts
a public update, you open the skill, paste the relevant excerpt into
the rule_excerpt slot, and the summary writes itself in the same shape
every time. That consistency is what turns the skill into something
your team can actually rely on.
$TV$,
  NULL
),
(
  'm4.3',
  'customer_facing',
  $TV$
### Build a skill for your role — Customer-Facing

The member-comms clarifier is the skill that pays for the course in
the first month. Branch teams spend hours every week rewriting the
same stiff internal explainers into language a member can read at the
window. A saved skill does that rewrite the same way every time, in
the calm tone you would want your name on.

Start from your m3.5 prompt — the empathetic fee-complaint reply.
The Skill Builder pre-loads it as the source. Lock the role to
"teller trainer at a community bank," lock the tone to "calm and
empathetic," lock the format to "under 120 words, two next steps at
the end." Name the input slot "situation_description" — never an
account number, never a member name, always the abstract.

Save it as "Member fee-complaint reply." When the next fee dispute
shows up in the inbox, open the skill, type a one-paragraph
description of what happened, and the reply comes back in the shape
your branch manager already approved. The seventh time you run it
the time-savings will start to feel structural rather than personal.
$TV$,
  NULL
),
(
  'm4.3',
  'back_office',
  $TV$
### Build a skill for your role — Back-Office Process

The competitor-research compiler is the back-office skill that
quietly compounds. Marketing, product, and ops all need the same
shape of brief — "what are ten community banks of our size doing
about X" — and it lands as a different ad-hoc request every quarter.
Build the skill once, run it whenever the question changes.

Start from your m3.5 prompt — the internal-process-memo rewrite or
the campaign-brief template, whichever you wrote. The Skill Builder
pre-loads both as candidate sources. Lock the role to "operations
lead at a community bank," lock the format to "one-page operator
summary," lock the constraint to "no real customer data, no internal
strategy." Name the input slot "source_material" — the long internal
memo, the campaign goal, the competitor list.

Save it as "Process rewrite to one page." Re-run on the next memo
that lands too long for anyone outside the owning team to read.
The output's consistency is what makes it forwardable, and what
makes it forwardable is what makes it worth running at all.
$TV$,
  NULL
),
(
  'm4.3',
  'technical',
  $TV$
### Build a skill for your role — Technical

The vendor-due-diligence Q&A drafter is the IT skill the rest of
the bank does not realize you need until you have it. Every business
unit eventually asks about a new AI vendor, and every time the
security committee needs the same shape of checklist, and every time
someone in IT writes it from scratch. Saved skill ends that cycle.

Start from your m3.5 prompt — the vendor due-diligence checklist.
The Skill Builder pre-loads it as the source. Lock the role to
"IT manager at a community bank evaluating an AI vendor," lock the
format to "10 items, grouped by data handling / model risk / vendor
stability / exit, output as a checklist," lock the constraint to
"no real vendor names, no real customer data." Name the input slot
"vendor_category" — "agent-style tool," "document automation
platform," "voice-bot for the contact center," whatever shape the
ask takes.

Save it as "Vendor DD checklist generator." When the next ask comes
in, open the skill, type the category, hand the output to the
security committee. The consistency is the value: the committee gets
a checklist in the same shape every time, which means they can
review it on the same instinct every time.
$TV$,
  NULL
),
(
  'm4.3',
  'leadership',
  $TV$
### Build a skill for your role — Leadership

The board-deck digest is the leadership skill that turns half a day
of staring at the page into ten minutes of editing. You will reuse
this skill three times a quarter — once for the board, once for the
exec team, once for the all-hands — and every time the underlying
material changes but the shape of what you want stays the same.

Start from your m3.5 prompt — the board talking-points memo. The
Skill Builder pre-loads it as the source. Lock the role to "advising
the CEO of a community bank," lock the format to "one-page memo:
three opportunities, three risks, one recommended next step, two
questions for management," lock the constraint to "no confidential
specifics; speak in general terms a board would recognize." Name the
input slot "topic_brief" — "AI strategy," "deposit competition,"
"core-platform decision," whichever the next board cycle needs.

Save it as "Board memo, one page." The next time the chair asks for
talking points on a topic with a two-day lead time, open the skill,
type a paragraph of context into topic_brief, and edit the output
instead of writing it. The shape's consistency is what makes the
board recognize the format, and recognition is what gets it read.
$TV$,
  NULL
)
ON CONFLICT (lesson_id, track) DO UPDATE SET
  body_md   = EXCLUDED.body_md,
  media_ref = EXCLUDED.media_ref;

-- =====================================================================
-- 4. Knowledge checks (~8)
-- Deterministic UUIDs: a0000000-0000-4000-a000-00000000f4XX (valid hex).
-- =====================================================================
INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options)
VALUES
(
  'a0000000-0000-4000-a000-00000000f411'::uuid,
  'm4.1', 1,
  'In one sentence, what is a "skill" in this course?',
  '[
    {"id":"a","label":"A saved, parameterized prompt — locked choices plus named input slots — that you run on new material","correct":true,"explanation":"That is the working definition for Module 4 and the shape every exercise here produces."},
    {"id":"b","label":"An autonomous agent that runs in the background without your input","correct":false,"explanation":"Agents are Module 5. A skill does not run on its own; you run it."},
    {"id":"c","label":"A model fine-tuned on your bank''s data","correct":false,"explanation":"Skills do not change the model. They wrap a saved prompt around it."},
    {"id":"d","label":"A piece of software the IT team installs on your laptop","correct":false,"explanation":"A skill is a saved prompt template, not installed software."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f412'::uuid,
  'm4.1', 2,
  'Which of these is a "locked choice" rather than an "input slot" in a skill?',
  '[
    {"id":"a","label":"The new regulation excerpt you are summarizing this week","correct":false,"explanation":"That changes every run — it is an input slot."},
    {"id":"b","label":"The audience the summary is written for (always branch tellers)","correct":true,"explanation":"Audience does not change between runs — it is locked once at build time."},
    {"id":"c","label":"The complaint description you paste in today","correct":false,"explanation":"That changes every run — it is an input slot."},
    {"id":"d","label":"The vendor name the security committee is asking about","correct":false,"explanation":"That changes every run — it is an input slot."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f421'::uuid,
  'm4.2', 1,
  'In the Skill Builder, you mark the "length" lever as "let learner choose at run time." What happens the next time you run the skill?',
  '[
    {"id":"a","label":"The skill prompts you to pick a length each time you run it","correct":true,"explanation":"Levers marked as choose-at-run-time become a run-time prompt. Locked levers do not."},
    {"id":"b","label":"The skill picks a random length each time","correct":false,"explanation":"Skills do not randomize choices."},
    {"id":"c","label":"The skill defaults to medium length silently","correct":false,"explanation":"The whole point of leaving a lever unlocked is that you decide at run time."},
    {"id":"d","label":"The skill refuses to run","correct":false,"explanation":"Unlocked levers are valid; they just get asked at run time."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f422'::uuid,
  'm4.2', 2,
  'Why does the Skill Builder ask you to name your input slots with a short help label?',
  '[
    {"id":"a","label":"The help label is required by the model provider","correct":false,"explanation":"It is not a provider requirement; it is a usability requirement."},
    {"id":"b","label":"Future-you (or a colleague) needs to know what to paste in when running the skill three months from now","correct":true,"explanation":"A slot named \"x1\" with no label is useless in six months. The label is the skill''s memory of what the slot is for."},
    {"id":"c","label":"The label sets the maximum length of the input","correct":false,"explanation":"Length caps come from the exercise''s data slot config, not the label."},
    {"id":"d","label":"The label is the only field that gets saved","correct":false,"explanation":"The label is one of several saved fields."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f431'::uuid,
  'm4.3', 1,
  'Your role variant of Lesson 4.3 pre-loads a source exercise and suggested slot labels. Can you override them?',
  '[
    {"id":"a","label":"No — the role variant locks them in","correct":false,"explanation":"The role variant suggests defaults; the Skill Builder still lets you swap the source and rename the slots."},
    {"id":"b","label":"Yes — the defaults are a starting point; the Skill Builder lets you swap the source exercise and rename the slots","correct":true,"explanation":"Role variants pick sensible defaults; the builder is fully editable from there."},
    {"id":"c","label":"Only if you switch tracks first","correct":false,"explanation":"Track does not gate the builder controls — it just changes defaults."},
    {"id":"d","label":"Only after you save once","correct":false,"explanation":"You can edit before the first save."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f441'::uuid,
  'm4.4', 1,
  'What does the guardrail check at the end of Lesson 4.4 actually save?',
  '[
    {"id":"a","label":"A pass/fail score the system uses to block the skill","correct":false,"explanation":"The check is a human-judgment artifact — it does not block the skill."},
    {"id":"b","label":"A set of one-line notes that attach to the skill so future-you knows what to watch for","correct":true,"explanation":"The notes are a human-judgment record that travels with the skill; they make the skill safer to hand off."},
    {"id":"c","label":"A copy of the model''s output for audit","correct":false,"explanation":"Outputs are not retained on the skill record; the notes are."},
    {"id":"d","label":"Nothing — the check is purely advisory and disappears","correct":false,"explanation":"The notes persist on the skill''s saved body."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f442'::uuid,
  'm4.4', 2,
  'A teammate asks if it is OK to put a real customer''s complaint text into the situation_description slot. What is your answer?',
  '[
    {"id":"a","label":"Yes — the skill runner anonymizes it for you","correct":false,"explanation":"The skill runner enforces a PII screen but does not anonymize on your behalf."},
    {"id":"b","label":"No — the data-discipline rule applies inside skills exactly as it does in the sandbox; describe the situation in the abstract","correct":true,"explanation":"Skills do not relax the rule. The slot is for descriptions of situations and public material — never identifiable customer text."},
    {"id":"c","label":"Yes — paid tier removes the rule","correct":false,"explanation":"The paid tier expands what you can build, not what you can paste."},
    {"id":"d","label":"Only if the customer has consented in writing","correct":false,"explanation":"Customer consent is not the right framework for whether to paste content into an AI tool."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-00000000f443'::uuid,
  'm4.4', 3,
  'You ran your skill and the output is technically correct but slightly off-tone. What is the right move from inside Lesson 4.4?',
  '[
    {"id":"a","label":"Save and forget — close enough","correct":false,"explanation":"Off-tone output that gets forwarded becomes a habit. Fix it once now and the fix sticks."},
    {"id":"b","label":"Open the skill in the builder, edit the locked tone choice, save a new version, re-run","correct":true,"explanation":"That is the refinement loop the lesson is teaching — the skill is versioned, so you can iterate without losing the prior version."},
    {"id":"c","label":"Switch providers and hope it lands differently","correct":false,"explanation":"Provider-swapping is a knob you can use, but it does not fix a locked-choice problem in the skill itself."},
    {"id":"d","label":"Delete the skill and start over","correct":false,"explanation":"Versioning exists exactly so you do not have to start over."}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  lesson_id = EXCLUDED.lesson_id,
  ordinal   = EXCLUDED.ordinal,
  prompt    = EXCLUDED.prompt,
  options   = EXCLUDED.options;

-- =====================================================================
-- 5. Exercises (3) — all non-LLM scaffolds whose React widgets produce
-- skills (executable via /api/skill/run). Gating clamped to 1 token /
-- 1 char so any accidental sandbox-service call returns immediately.
-- entitlement='paid' on all three.
-- =====================================================================

-- Exercise m4-2-build-first-skill — rendered by m4/SkillBuilder
INSERT INTO addie.exercises (
  id, lesson_id, mode, track_variant,
  system_prompt, lever_directives,
  task_scaffold, levers, data_slots, preset_context_blocks,
  default_provider, allow_provider_switch, gating, entitlement, published
)
VALUES (
  'm4-2-build-first-skill',
  'm4.2',
  'single',
  NULL,
  '-- not an LLM exercise; rendered by m4/SkillBuilder --',
  '{}'::jsonb,
  'Build a skill from one of your starter prompts. Pick a source exercise, lock the levers you want fixed, name your input slots, save.',
  '[]'::jsonb,
  '[]'::jsonb,
  $PCB$[{"id":"builder_sources","label":"Available source exercises","body": "[{\"exercise_id\":\"m3-5-real-use-cases\",\"label\":\"Real use cases (the prompt you wrote in 3.5)\",\"leversAvailable\":[{\"key\":\"role\",\"label\":\"Role\",\"options\":[{\"id\":\"risk_compliance\",\"label\":\"Risk & Compliance\"},{\"id\":\"customer_facing\",\"label\":\"Customer-Facing\"},{\"id\":\"back_office\",\"label\":\"Back-Office Process\"},{\"id\":\"technical\",\"label\":\"Technical\"},{\"id\":\"leadership\",\"label\":\"Leadership\"}]}],\"suggestedSlots\":[{\"key\":\"use_case_brief\",\"label\":\"Use-case brief\",\"help\":\"A one-paragraph description of the task you want the prompt to handle. No PII.\"}]},{\"exercise_id\":\"m3-2-ab-output\",\"label\":\"A/B output (audience + length)\",\"leversAvailable\":[{\"key\":\"audience\",\"label\":\"Audience\",\"options\":[{\"id\":\"tellers\",\"label\":\"Branch tellers\"},{\"id\":\"managers\",\"label\":\"Branch managers\"},{\"id\":\"execs\",\"label\":\"Bank executives\"}]},{\"key\":\"length\",\"label\":\"Length\",\"options\":[{\"id\":\"short\",\"label\":\"Under 100 words\"},{\"id\":\"medium\",\"label\":\"About 150 words\"},{\"id\":\"long\",\"label\":\"About 250 words\"}]}],\"suggestedSlots\":[{\"key\":\"reg_text\",\"label\":\"Regulation excerpt\",\"help\":\"A short public regulation excerpt. No PII.\"}]}]"}]$PCB$::jsonb,
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

-- Exercise m4-3-role-skill — rendered by m4/SkillBuilder with track-aware defaults
INSERT INTO addie.exercises (
  id, lesson_id, mode, track_variant,
  system_prompt, lever_directives,
  task_scaffold, levers, data_slots, preset_context_blocks,
  default_provider, allow_provider_switch, gating, entitlement, published
)
VALUES (
  'm4-3-role-skill',
  'm4.3',
  'single',
  NULL,
  '-- not an LLM exercise; rendered by m4/SkillBuilder (role-skill mode) --',
  '{}'::jsonb,
  'Build a Working Skill tuned to your role. The builder pre-selects the source exercise and slot labels that fit your track; swap them if you want.',
  '[]'::jsonb,
  '[]'::jsonb,
  $PCB$[{"id":"builder_sources","label":"Available source exercises","body": "[{\"exercise_id\":\"m3-5-real-use-cases\",\"label\":\"Real use cases (the prompt you wrote in 3.5)\",\"leversAvailable\":[{\"key\":\"role\",\"label\":\"Role\",\"options\":[{\"id\":\"risk_compliance\",\"label\":\"Risk & Compliance\"},{\"id\":\"customer_facing\",\"label\":\"Customer-Facing\"},{\"id\":\"back_office\",\"label\":\"Back-Office Process\"},{\"id\":\"technical\",\"label\":\"Technical\"},{\"id\":\"leadership\",\"label\":\"Leadership\"}]}],\"suggestedSlots\":[{\"key\":\"use_case_brief\",\"label\":\"Use-case brief\",\"help\":\"A one-paragraph description of the task. No PII.\"}]},{\"exercise_id\":\"m3-2-ab-output\",\"label\":\"A/B output (audience + length)\",\"leversAvailable\":[{\"key\":\"audience\",\"label\":\"Audience\",\"options\":[{\"id\":\"tellers\",\"label\":\"Branch tellers\"},{\"id\":\"managers\",\"label\":\"Branch managers\"},{\"id\":\"execs\",\"label\":\"Bank executives\"}]},{\"key\":\"length\",\"label\":\"Length\",\"options\":[{\"id\":\"short\",\"label\":\"Under 100 words\"},{\"id\":\"medium\",\"label\":\"About 150 words\"},{\"id\":\"long\",\"label\":\"About 250 words\"}]}],\"suggestedSlots\":[{\"key\":\"reg_text\",\"label\":\"Regulation excerpt\",\"help\":\"A short public regulation excerpt. No PII.\"}]}]"},{"id":"track_defaults","label":"Per-track defaults","body":"{\"risk_compliance\":{\"sourceExerciseId\":\"m3-5-real-use-cases\",\"lockedLevers\":{\"role\":\"risk_compliance\"},\"slots\":[{\"key\":\"use_case_brief\",\"label\":\"Rule excerpt\",\"help\":\"Paste the public regulator text you want summarized. No PII.\"}],\"suggestedTitle\":\"Reg summary for tellers\"},\"customer_facing\":{\"sourceExerciseId\":\"m3-5-real-use-cases\",\"lockedLevers\":{\"role\":\"customer_facing\"},\"slots\":[{\"key\":\"use_case_brief\",\"label\":\"Situation description\",\"help\":\"A one-paragraph abstract description of the member situation. No names, no account numbers.\"}],\"suggestedTitle\":\"Member fee-complaint reply\"},\"back_office\":{\"sourceExerciseId\":\"m3-5-real-use-cases\",\"lockedLevers\":{\"role\":\"back_office\"},\"slots\":[{\"key\":\"use_case_brief\",\"label\":\"Source material\",\"help\":\"Paste the long internal memo or campaign brief you want rewritten. No customer data.\"}],\"suggestedTitle\":\"Process rewrite to one page\"},\"technical\":{\"sourceExerciseId\":\"m3-5-real-use-cases\",\"lockedLevers\":{\"role\":\"technical\"},\"slots\":[{\"key\":\"use_case_brief\",\"label\":\"Vendor category\",\"help\":\"What kind of AI vendor or tool the security committee is being asked to evaluate. No real vendor names.\"}],\"suggestedTitle\":\"Vendor DD checklist generator\"},\"leadership\":{\"sourceExerciseId\":\"m3-5-real-use-cases\",\"lockedLevers\":{\"role\":\"leadership\"},\"slots\":[{\"key\":\"use_case_brief\",\"label\":\"Topic brief\",\"help\":\"A paragraph of context on the board-deck topic. No confidential specifics.\"}],\"suggestedTitle\":\"Board memo, one page\"}}"}]$PCB$::jsonb,
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

-- Exercise m4-4-test-refine — rendered by m4/SkillTester
INSERT INTO addie.exercises (
  id, lesson_id, mode, track_variant,
  system_prompt, lever_directives,
  task_scaffold, levers, data_slots, preset_context_blocks,
  default_provider, allow_provider_switch, gating, entitlement, published
)
VALUES (
  'm4-4-test-refine',
  'm4.4',
  'single',
  NULL,
  '-- not an LLM exercise; rendered by m4/SkillTester --',
  '{}'::jsonb,
  'Pick one of your saved skills, fill the slots with realistic material, run it, then walk the guardrail check.',
  '[]'::jsonb,
  '[]'::jsonb,
  $PCB$[{"id":"guardrails","label":"Guardrail prompts","body": "[{\"id\":\"g_source\",\"prompt\":\"Does the output cite or quote anything that was not in the slot material you provided?\",\"why\":\"Invented citations are the most common quiet failure. If the model named a rule or source that was not in your input, the skill needs a stronger constraint.\"},{\"id\":\"g_sendable\",\"prompt\":\"Would you be comfortable sending this to a member, a regulator, or a board chair as-is?\",\"why\":\"If the answer is no, write down what a human would need to fix before forwarding. That is the skill''s required human pass.\"},{\"id\":\"g_regulator\",\"prompt\":\"Could a regulator credibly question any specific claim in this output?\",\"why\":\"Outputs that read confidently but cannot be traced are the ones that cause trouble later. Note which claims need backup.\"},{\"id\":\"g_tone\",\"prompt\":\"Is the tone right for your audience — calm where it needs to be, direct where it needs to be?\",\"why\":\"Tone drift is the easiest thing to fix at the locked-lever stage. If the skill is off-tone, the fix is in the builder, not in editing each run.\"},{\"id\":\"g_specificity\",\"prompt\":\"Is the output specific enough to be useful, or is it generic?\",\"why\":\"Generic output usually means the slot input was thin. Note whether the slot description needs more guidance, or whether the prompt needs another constraint.\"},{\"id\":\"g_handoff\",\"prompt\":\"If you handed this skill to a colleague tomorrow, what one note would you want them to read first?\",\"why\":\"That note is the skill''s most valuable piece of guardrail — the lived experience of having run it once.\"}]"}]$PCB$::jsonb,
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
