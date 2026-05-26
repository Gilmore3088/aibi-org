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
A skill is your good prompt, saved with the choices locked, ready to run on Monday without retyping anything.

## SCRIPT (verbatim)

> [stat] 2 | Parts of every skill | Locked choices (role · audience · length · constraints) + input slots (what changes run-to-run). Set the locked parts once; the slots prompt you next time.

> [case:good] Saved beats remembered, every time
> Strong prompt in M3 — role, task, context, format, the constraint that stopped invented citations. Two weeks later you reach for the saved version or write a worse one in a hurry.
> [outcome] The move underneath the move.

> [case:good] Anatomy — locked choices + input slots
> Locked: role, audience, length, constraints, closing instruction. Slots: rule excerpt, complaint summary, vendor category. Name each slot with a banker-readable label.
> [outcome] Choices freeze. Consistency is automatic.

> [case:good] Bounded scope is the feature
> A skill does not chain, browse, or read your inbox. One named, parameterised prompt. That boundary makes it safe to hand off, safe on a cadence, safe to defend.
> [outcome] Agents are M5. Today: one reliable named prompt.

> [tip] Pick your first skill from a Starter Pack prompt you have run at least twice. You only know the locked choices after using it by hand.

> [warn] Avoid skills that do five things. Three jammed together is hard to debug. Build twenty narrow skills, not three wide ones.

> [case:good] A recurring Skill against rule text is a model under SR 11-7
> A saved prompt you reuse twenty times against the same family of inputs is — under the Federal Reserve's [SR 11-7 framework](https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm) — a "quantitative or qualitative method that produces output to be used in business decisions." That does not make Skills bad. It means treat each Skill as a low-tier model: name it, version it, note the intended use, name the human reviewer, and decide whether it generates anything member-facing or regulator-facing.
> [outcome] Skills you keep get a name, a version, a stated use, and a reviewer. The artifact card in your Toolbox carries those four fields.

> [tip] **Three regulator anchors to remember:** **SR 11-7** (model risk management — applies whenever an output is used in a business decision); **Interagency Guidance on Third-Party Relationships: Risk Management** (June 2023) (TPRM — applies when the model is run by a vendor — i.e. Anthropic, OpenAI, Google); **the AIEOG AI Lexicon** (Feb 2026, Treasury/FBIIC/FSSCC — the official US-government working definitions for hallucination, governance, HITL, third-party AI risk, explainability).

## PRODUCTION

- Cold open on the [stat] card "2 parts" — the anatomy lands before the cases expand it.
- Three [case:good] cards in a 3-up grid: the why, the what, the scope-as-feature.
- Reference card at the close: "A skill is one named, parameterised prompt — bounded scope is the feature."
- Hand off to 4.2 with a single line: "Now you build one."
- The SR 11-7 / TPRM / AIEOG callouts ladder up to the Toolbox artifact metadata — name, version, intended use, reviewer.
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
Take an M3 prompt and turn it into a parameterised template. Four steps, fifteen minutes, one Skill Template in your Toolbox.

## SCRIPT (verbatim)

> [stat] 4 | Four-step builder | Source · Lock choices · Name slots · Save. Skip any one and the skill works once, breaks the second time.

> [case:good] One — pick a source
> A Starter Pack prompt you have run twice. The source decides what controls the skill exposes.
> [outcome] Reg-E summariser, member-comms reply, vendor checklist — pick the recurring one.

> [case:good] Two — lock the choices
> Each control: fix it (always teller audience, always five bullets) or mark "choose at run time." Mostly-fixed with one or two runtime levers is the right ratio.
> [outcome] Consistency where it matters, flexibility where it doesn't.

> [case:good] Three — name your slots
> Short banker-readable name + one-line help label future-you will read in a hurry. "rule_excerpt — paste public reg text only, no identifiers" survives three months.
> [outcome] Unlabelled slots are trip-hazards.

> [case:good] Four — save
> Skill Template lands in your Toolbox. 4.3 tunes it to your role; 4.4 verifies on new material. Every save is versioned.
> [outcome] Iterate without losing the version that worked.

> [tip] Name your skill like a procedure, not a file. "Reg summary for tellers" beats "untitled_skill_v3_FINAL."

> [warn] The skill runner enforces the same PII screen as the sandbox — formatted SSNs (dashed, spaced, dotted), 8–12-digit account-number runs, Luhn-valid payment-card numbers, emails, phone numbers, and DOB-in-context are rejected before the model sees them. Names, free-text descriptions of real members, and paraphrased SAR content are **not** detected by regex. The screen is a backstop; the data-discipline rule lives with you.

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
Same builder, pre-loaded for your role. Per-track framing below; you can take the defaults or swap the source.

## SCRIPT (verbatim)

> [stat] 3 | Three differences this time | Trust the pre-load · Tune to your institution · Save as a Working Skill.

> [case:good] Trust the pre-load — then question it
> Read the defaults. Fit your week? Move on. Don't fit (you read vendor questionnaires more than SR letters)? Swap the source.
> [outcome] Track defaults are a starting point, not a verdict.

> [case:good] Tune to your institution, not just your role
> "Member" vs "customer." "CCO" vs "BSA officer." Edit the locked role and constraint language until the output sounds like your bank at a glance.
> [outcome] A skill that lands in your tone the first read is one you keep using.

> [case:good] Save as a Working Skill
> The version you would hand to a colleague today and trust without retraining. Not at that bar? Say so in the name ("draft, needs one more pass").
> [outcome] The Toolbox does not judge; clarity does.

> [tip] Pre-loaded source doesn't fit your seat? Worth a note — the Toolbox tracks which defaults get swapped most.

> [warn] Never save with placeholder text still in the slots. Empty is correct; "[paste rule here]" can leak into a real run.

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
A skill never run on new material is a guess. Three moves turn it into a verified piece of your toolkit.

## SCRIPT (verbatim)

> [stat] 3 | Three moves | Run on new material · Four-question guardrail check · Refine and re-save.

> [case:good] One — run on new material
> Realistic synthetic input: public reg text the skill has not seen, situation in your own words, generic vendor proposal stripped of identifiers. Read as if it landed at 3pm Thursday — send, forward, or fix?
> [outcome] Find the gap between hoped-for and actual.

> [case:good] Two — four-question guardrail check
> Walk the four prompts below in order. Four notes attach to the saved record. Future-you opens it knowing the soft spots.
> [outcome] One scan, four notes — promotion-or-archive call in under five minutes.

Audit A16 (2026-05-24): the four-question guardrail check renders as a
table so the learner can scan the prompts in one beat and the notes line
up against them on the saved Skill record.

| # | Guardrail question | What a clean answer looks like | Note format on the Skill record |
|---|---|---|---|
| 1 | Did it cite anything outside the slot material? | "No — everything attributed to the input I provided." | "Source-bound" or "Add constraint: cite only from input" |
| 2 | Would you be comfortable sending this as-is? | "Yes" or a one-line list of what you would change first | "Send-ready" or "Soft spot: <what to fix>" |
| 3 | Where does it still need a human pass? | A specific paragraph or claim, not "the whole thing" | "Human pass needed at <paragraph>" |
| 4 | What input pattern would break it? | A realistic edge case in plain English, not a hypothetical | "Watch for: <pattern>" |

> [case:good] Three — refine and re-save
> Drift predictably? Edit locked choices (add a constraint, sharpen the role, tighten the format). Two clean runs on different inputs = verified.
> [outcome] Two clean runs is the bar. Perfection is a trap.

> [tip] Write guardrail notes in plain English. "Watch for invented Reg numbers — verify against source" beats "validate citation accuracy."

> [warn] More than four notes = the skill is trying to do too much. Split it.

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

----------------------------------------------------------------------
-- Phase 2 PR19 — M4 takeaway_artifact_type → workbench_pack (2026-05-25)
--
-- Wires every M4 lesson to the new composite Workbench Pack artifact
-- (recovery plan Decision #2 + DECISIONS 2026-05-25). The PR also
-- opts each lesson into LessonStepShell so the wired render lands at
-- the same time as the artifact-type flip.
--
-- The lesson body_md content below still describes the prior
-- "Skill / Skill Template / Verified Skill" arc — full body re-author
-- is a separate content PR. Until then, the bodies read as legacy
-- text but the SAVE flow produces a Pack via WorkbenchPackBuilder.
--
-- Requires migration 00074 (workbench_pack enum value) to be applied
-- to the linked Supabase first; until then this UPDATE will fail the
-- enum check.
----------------------------------------------------------------------
UPDATE addie.lessons
SET takeaway_artifact_type = 'workbench_pack',
    shell_kind             = 'step'
WHERE id IN ('m4.1', 'm4.2', 'm4.3', 'm4.4');

----------------------------------------------------------------------
-- Phase 3 PR21 — m4.5 "What can go wrong, by department" (2026-05-25)
--
-- CEO Bill Hagedorn's 2026-05-24 single-most-valuable-add request:
-- the worst-case-scenarios walkthrough that explicitly names the
-- failure modes that put a community bank in an MRA. Lives as a new
-- M4 lesson (ordinal 5) — after the M4 Pack-building arc, before M5
-- — so a learner who paid for the M4+M5 entitlement walks through it
-- with a Pack in hand to anchor the abstract risks to a real artifact.
----------------------------------------------------------------------

INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md,
  objective_md, transfer_md, published, shell_kind
)
VALUES (
  'm4.5',
  'm4',
  5,
  'What can go wrong, by department',
  'reading',
  18,
  false,
  NULL,
  NULL,
  $LESSON$
Every AI failure in a bank lives in one of five departments. Naming the worst-case scenario in each one — concretely, with named regulations and named failure modes — is the difference between "AI risk" as a vague worry and "AI risk" as a board memo.

## SCRIPT (verbatim)

> [stat] 5 | Five worst-case scenarios | Lending · Compliance · Operations · Marketing · Leadership. Each one names a specific failure mode that has landed real community banks in real supervisory trouble.

This lesson is the one CEO Bill Hagedorn asked for after walking the 2026-05-24 review: "the single most valuable lesson you could add for me." Use it as the prompt for your bank's own AI risk-committee stand-up — name your version of each scenario, then write the control.

### 1 · Lending — hallucinated reg cites in adverse-action letters

> [case:bad] A junior loan officer pastes a denial summary into a consumer LLM and asks for a "ECOA-compliant adverse action letter." The model produces a clean letter that cites [[Gloss:ECOA / Reg B]] §1002.9(b)(2) — a real section — and quotes language that sounds plausibly like the rule but is not the rule. The officer sends the letter.
> [outcome] The member calls a legal-aid clinic. Six months later, the bank is in fair-lending crosshairs because the citation is wrong AND the reason given was not the actual decisioning reason. The MRA writes itself.

The fix is not "don't use AI" — the fix is the four-question guardrail check (M4.4) on every adverse-action letter draft, with the actual reg text loaded as the [[Gloss:Reg E]] / [[Gloss:ECOA / Reg B]] context AND a human reviewer who reads the cite back against the source. The Pack carries that workflow.

### 2 · Compliance — disparate-impact risk in loan-decision drafting

> [case:bad] A bank's risk team builds a "Skill" that scores loan applications using public underwriting patterns. The Skill runs against 800 applications in a quarter. Nobody validates the score against protected-class outcomes. Six months later an exam pulls fair-lending statistics and the bank's CCO can't explain why the approval rate for one demographic dropped 9 percentage points.
> [outcome] The Skill is, under any reasonable reading of [[Gloss:SR 11-7]], a model. Unvalidated. The fact that it was "just a saved prompt" does not survive the supervisory interview.

This is exactly the M4.4 governance-metadata case (use_boundary = "named-task production") that the Workbench Pack's approver + validation_notes fields exist for. A Pack run recurrently against credit decisions needs a named approver from the model risk function and a documented validation record before it leaves a learner's desktop.

### 3 · Operations — third-party-risk angle on consumer LLMs

> [case:bad] An ops manager builds a prototype in a vendor's web IDE to triage hold-resolution requests faster. The prototype includes a PRD that names the bank's internal workflow, the team that owns it, and three recurring pain points. The PRD is pasted into the vendor tool. Six months later that vendor's terms-of-service get audited and the bank learns the prototype inputs were retained for "service improvement."
> [outcome] The prompt was "anonymous" but the institutional context — the bank's workflow design — was not. That is now a vendor's training data. The Interagency TPRM Guidance (Jun 2023) and OCC Bulletin 2023-17 apply to every consumer LLM the bank's staff touches with institution-derived material.

The fix: any prototype tool used with institution-derived material needs the same vendor-onboarding diligence as a core-banking vendor. M5.4's "blast radius matrix" is the foreground tool; this is the consequence if the matrix is skipped.

### 4 · Marketing — MNPI exposure on pre-release product launches

> [case:bad] A marketing analyst asks a consumer AI tool to draft launch copy for a fee product that has not been publicly announced. The data-discipline rule (M0.2) is followed — no member data, no PII. But the product name, the launch date, the differentiator language, and the targeting strategy are all in the prompt. That is [[Gloss:MNPI]] in a vendor's pipeline.
> [outcome] The launch leaks via a competitor's adjacent training data exposure. The bank's M&A advisor calls. The CCO can't reconstruct who in the org leaked it because everyone was "following the AI policy."

The fix is the MNPI half of the data-discipline rule (M3.4): public material that the bank intends to keep private until release is MNPI until that release happens. The Pack's use_boundary = "personal sandbox" flag covers this — a Pack that touches pre-release material does not leave the sandbox.

### 5 · Leadership — vendor-pitch credulity

> [case:bad] A core vendor pitches an "AI agent" that will "automate the loan approval workflow end-to-end." The CEO is intrigued. The demo is slick. The agent's failure mode — when step 3 of the loop returns a plausibly wrong result — is hand-waved. The bank buys.
> [outcome] Twelve months later the bank has a vendor relationship for a tool that produces auditable decisions only when the vendor's prompts hold, and the bank's model risk function inherited a model they did not write, can not inspect, and can not validate.

The fix is the M5.1 question every CEO should ask the next three vendor reps that walk in: "Show me what happens at step 3 if the model returns a plausibly wrong result. Where is the review point? Who owns the override?" If the answer is a hand-wave, walk.

## Closing

The five scenarios above are not hypothetical. Each one maps to a real supervisory finding pattern from 2023–2025 — public regulator commentary names the shapes, even when individual banks are not named. Your CRO knows these. Your CCO knows these. The point of this lesson is so that you, as the CEO buying 18 seats for your staff, can name them too.

> [tip] Take this lesson into your next AI risk committee meeting. The five scenarios are the agenda.
$LESSON$,
  'Name each department''s worst-case AI failure mode in one sentence, with the named regulation it implicates, sufficient to brief a board chair or examiner unprompted.',
  'Bring this lesson into your next AI risk-committee meeting and use the five scenarios as the agenda — one named owner per scenario, one written control per scenario, by quarter-end.',
  true,
  'step'
)
ON CONFLICT (id) DO UPDATE
SET
  ordinal               = EXCLUDED.ordinal,
  title                 = EXCLUDED.title,
  modality              = EXCLUDED.modality,
  duration_min          = EXCLUDED.duration_min,
  body_md               = EXCLUDED.body_md,
  objective_md          = EXCLUDED.objective_md,
  transfer_md           = EXCLUDED.transfer_md,
  shell_kind            = EXCLUDED.shell_kind,
  published             = EXCLUDED.published;

----------------------------------------------------------------------
-- Phase 3 PR23 — leadership-track variant on m4.4 (2026-05-25)
-- CEO Bill Hagedorn target: 10/24 branched lessons (4th of 4 added).
----------------------------------------------------------------------
INSERT INTO addie.lesson_track_variants (lesson_id, track, body_md, media_ref)
VALUES (
  'm4.4',
  'leadership',
  $VAR$## Test, refine, governance overlay — for the room that decides

The standard m4.4 walks you through a four-question guardrail check on a saved Pack. The leadership version of the same lesson adds one more move on top: deciding whether the Pack you just built is **personal sandbox** or **named-task production**, and what that decision implies for your institution.

### The two-state question

Every Pack lives in one of two states:

- **personal sandbox** — the Pack runs on synthetic inputs only, in your own workbench, for your own thinking. No member-facing outputs. No board-facing outputs. No recurring use against rule text. The governance overlay is light: data discipline, M3.4 violation rules, the four-question guardrail check.

- **named-task production** — the Pack will run recurrently on real institution material to produce outputs that leave the learner's desktop. Under any reasonable reading of [[Gloss:SR 11-7]], that Pack is a model. It needs an approver named, a validation record written, a use boundary documented, and an inventory entry in your model risk function. The Pack carries the governance fields (version, approver, useBoundary, validationNotes) specifically so this transition is documented and re-openable.

### What the CEO does with this

For each Pack your team saves in M4, the CEO's question is:
1. Is this Pack in personal sandbox or named-task production?
2. If production: who is the approver, and what is the validation record?
3. If the answer to (2) is "the learner saved it on their laptop," the Pack is not in production — it is shadow IT, and it needs to be either lifted into your model risk function or pulled back to sandbox use.

This is the conversation that turns the M4 deliverable from "18 staff each have a Toolbox" into "we have a written AI model inventory" — which is the conversation your next examiner is going to want to have.

### The governance fieldset is the artifact

The four governance fields on every Pack (version, approver, use boundary, validation notes) are the artifact a CCO can hand to an examiner. They're small. They're written. They survive personnel turnover. They are exactly the documentation [[Gloss:SR 11-7]] expects.

> [tip] Make the governance fieldset on the WorkbenchPackBuilder a quarterly review. Every Pack flipped to "named-task production" gets a fifteen-minute conversation between the learner who owns it and your model risk lead.
$VAR$,
  NULL
)
ON CONFLICT (lesson_id, track) DO UPDATE SET body_md = EXCLUDED.body_md;

-- Flip m4.4 to is_branched
UPDATE addie.lessons SET is_branched = true WHERE id = 'm4.4';

----------------------------------------------------------------------
-- Phase 2 PR24 — M4 body_md re-author around the Workbench Pack
-- vocabulary (2026-05-25). Replaces the prior Skill / SkillTemplate /
-- VerifiedSkill arc so the body reads consistent with the
-- WorkbenchPackBuilder + workbench_pack takeaway_artifact_type.
--
-- 2026-05-25 follow-up sync: bodies for m4.1–m4.4 mirror the live DB
-- exactly so re-running this seed against a fresh Supabase reproduces
-- the production state (closes the #1 footgun from the
-- 2026-05-25 handoff).
----------------------------------------------------------------------

UPDATE addie.lessons SET title = 'What a Workbench Pack is' WHERE id = 'm4.1';
UPDATE addie.lessons SET title = 'Build your first Pack' WHERE id = 'm4.2';
UPDATE addie.lessons SET title = 'Build a Pack for your role' WHERE id = 'm4.3';
UPDATE addie.lessons SET title = 'Test, refine, governance overlay' WHERE id = 'm4.4';

UPDATE addie.lessons SET body_md = $BODY$
A Workbench Pack is the saved record of one real piece of work moved from input to send-ready output, with the model's contribution shown — and reviewed — in between. It is the M4 unit. The whole module produces a library of them.

## SCRIPT (verbatim)

> [stat] 7 | Seven regions on every Pack | Source · Prompt · First output · Review tags · Improved output · Questions to confirm · Final work product. Plus a small governance strip (version · approver · use boundary · validation notes).

Three things to understand before you build one.

**One: a Pack is not a prompt.** A prompt is one turn. A Pack is the whole sequence — the source you brought, the prompt you sent, what came back, what was wrong with it, what you changed, the questions you confirmed before sending, and the artifact you actually used. Future-you re-opens the Pack and sees not just *what* you produced but *how you got there*.

**Two: a Pack is one composite document, not five separate files.** One row in your Toolbox. Re-openable, re-runnable, exportable as plain markdown so the recipe travels into whatever AI tool your bank has sanctioned. "Copy as Markdown" is the move that makes a Pack useful beyond the Toolbox.

**Three: the governance strip is the documentation a CRO needs.** Use boundary ("personal sandbox" or "named-task production"), version, approver, validation notes. These four fields are why your model risk function can defend the Pack under SR 11-7. Skip them in personal use; fill them the moment a Pack moves into a workflow that touches member-facing work.

> [tip] If you've never seen one before: the Pack on the next lesson loads with a synthetic banking source. Run through the seven regions once before you start thinking about your own work.
$BODY$
WHERE id = 'm4.1';

UPDATE addie.lessons SET body_md = $BODY$
Take a synthetic source through the workbench: input → prompt → output → review → improved → confirm → final. The save lives in your Toolbox as one Workbench Pack you can re-open any time real work shows up that fits the shape.

## SCRIPT (verbatim)

> [stat] 4 | Four moves, four save points | Source the material · Send the prompt · Tag what is wrong with the first output · Sign off on the final. The Pack collects all four.

Four things to do, in order, on the workbench:

**One: bring a source.** The lab loads a synthetic banking artifact — adverse-action letter draft, vendor proposal stub, complaint summary. Real data discipline applies: synthetic only. The source is what the Pack will frame the rest of the work against.

**Two: send a prompt that names role, task, format.** The M3.1 default brief works here. Constraints (3.3b pattern 3) work if the source includes named regulations the model should not invent around. Type the prompt; send.

**Three: review tags.** The first output is almost never the send-ready output. Click the banker-context chips that apply — fabricated citation, tone off for member-facing, too long, missing constraint, MNPI risk, invented number. The tags become your re-prompt context for the improved output.

**Four: confirm + save.** Four questions: did it cite outside the source? Comfortable sending as-is? Where does it need a human pass? What input would break this Pack? Answer; save. The Pack lands in your Toolbox.

> [warn] The PII screen on the input box blocks obvious patterns — account numbers, SSNs, full names. It is a backstop, not a substitute for the data-discipline habit. The habit is what carries when you take the Pack into a tool your bank approved that does not have a screen.
$BODY$
WHERE id = 'm4.2';

UPDATE addie.lessons SET body_md = $BODY$
Same workbench. This time the source is pre-loaded for your role — Reg E summary for compliance, member-comms reply for customer-facing, process memo for back-office, vendor questionnaire for technical, board talking-points for leadership. Tune to your institution, then save.

## SCRIPT (verbatim)

> [stat] 1 | One Pack you would hand to a colleague today | A Pack is not a Pack until you could hand it to a colleague and have them run it cold. That is the bar for a saved Pack on this lesson.

Three moves on a track-defaulted Pack:

**One: trust the pre-load, then question it.** If the source and the suggested prompt fit your week, accept them. If they don't — if you read vendor questionnaires more than Reg E updates — swap the source.

**Two: tune to your institution.** "Member" vs. "customer." "CCO" vs. "BSA officer." Edit the prompt's role and constraint language until the output sounds like your bank at a glance.

**Three: save at the would-hand-to-a-colleague bar.** Not at that bar yet? Flip the use_boundary to "personal sandbox" and the title to draft. The governance strip exists so you can save messy work without pretending it is production.
$BODY$
WHERE id = 'm4.3';

UPDATE addie.lessons SET body_md = $BODY$
A saved Pack is the artifact; the four-question guardrail check is what turns it from a guess into something you would defend. Three moves on every Pack before it leaves the workbench.

## SCRIPT (verbatim)

> [stat] 4 | Four questions every Pack carries | Citations outside the source? · Send as-is? · Where does it need a human pass? · One input pattern that would break it?

**One: run on realistic new material.** A Pack tested only on its training source is a guess. Load a fresh synthetic source — different complaint, different rule excerpt, different proposal — and run the Pack again. Read the output as if it arrived at 3pm Thursday: send, forward, or fix?

**Two: walk the four questions.** Answer each in writing. The Pack's validation_notes field carries the answers — that field is what your model risk function reads when the Pack ever moves to named-task production.

**Three: decide the use boundary.** If the Pack will only ever run on synthetic in your workbench, leave use_boundary at "personal sandbox." If it will be re-run against real institution material with outputs that leave your desktop, flip it to "named-task production" — and the next conversation is with your CRO before the Pack runs again.

> [warn] More than four guardrail notes signals the Pack is doing too much. Split it. Two narrow Packs each defended on four notes beat one wide Pack defended on twelve.
$BODY$
WHERE id = 'm4.4';
