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
