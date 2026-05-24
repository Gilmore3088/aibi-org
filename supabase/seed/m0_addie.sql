-- supabase/seed/m0_addie.sql
-- Module 0 — Orientation. Seed-only. INSERT ... ON CONFLICT DO UPDATE so
-- re-running is safe. No schema changes. Per the M0 curriculum doc
-- (docs/Foundation-Course-ADDIE/AiBI_Module_0_Orientation.md).

-- =====================================================================
-- 1. Module
-- =====================================================================
INSERT INTO addie.modules (id, ordinal, title, tier, summary, published)
VALUES (
  'm0',
  0,
  'Orientation',
  'free',
  'How this works + the one rule that governs everything that follows.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  ordinal   = EXCLUDED.ordinal,
  title     = EXCLUDED.title,
  tier      = EXCLUDED.tier,
  summary   = EXCLUDED.summary,
  published = EXCLUDED.published;

-- =====================================================================
-- 2. Lessons
-- =====================================================================

-- Lesson 0.1 — How this course works + your Toolbox (video, ~7 min)
-- Not branched; the track-picker interaction itself is rendered by the
-- player after the body_md narration. No Toolbox artifact in v1 (the
-- "Course Roadmap" is a light setup artifact, not an addie.artifact_type).
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm0.1',
  'm0',
  1,
  'How this course works + your Toolbox',
  'video',
  7,
  false,
  NULL,
  NULL,
  $LESSON$
## SCRIPT (verbatim)

> "If you have been hearing about AI for the last couple of years and feeling somewhere between curious and quietly nervous, you are in the right room. You do not need to be technical. You do not need to have used any of this before. By the end of this course, you will not just understand generative AI — you will have built something with it that is useful to your actual job. Let's start with how this works."

> [stat] 6 · 24 · <15m | The full shape of this course | Six modules, ~24 lessons, every lesson under fifteen minutes. Free through Module 3; paid for Modules 4–5. Designed to do between meetings.

> "Three things to know before we go anywhere — how it is built, what makes it different, and what costs money. Then you pick your track and we get going.
>
> **One: how it is built.** Six short modules. No lesson is longer than fifteen minutes, so you can do this between meetings. We start simple — what this stuff even *is* — and each module asks a little more of you, until you are framing a problem and building a working prototype. You do not skip ahead; each step earns the next.
>
> **Two: the Toolbox — the part that makes this course different.** In most training you walk away with a certificate and a vague feeling. Here, you walk away with tools you actually use. Every lesson, you create something real — a prompt, a reusable skill, eventually a small app — and it is saved to your Toolbox. By the end you have a kit you can open on Monday morning and put to work. The course's real output is not a badge. It is the Toolbox.
>
> **Three: what is free and what is not — because we would rather just tell you.** The first four modules, including this one, are free. That is where you learn to *use* AI well. After Module 3 there is a gate. Beyond it, you learn to *build* — and that part is paid. There is one small catch even in the free part: to *keep* what you make, you give us an email at the gate, or you upgrade. Nothing saves anonymously. That is it. No surprises."

> [save] **From "I've heard of it" → "I built it."** That is the arc. Six modules. Twenty-four lessons. One Toolbox at the end you open on Monday morning.

> "Last thing before you start: this course adapts to your role. A compliance officer and a teller and a CIO should not get the same examples — so pick the track closest to your day. You can change it any time. The track picker renders below as part of the lesson."

> [tip] If you came from the Readiness Assessment, your track is pre-selected and labelled "Set from your assessment." Change it if your day-to-day shape has shifted; otherwise leave it as is and move on.

## PRODUCTION

- Cold open warm and human; this beat exists to lower the temperature. Tone is dry-reassuring, never cheerleader.
- The `[stat]` card carries the shape of the course as three numbers (6 · 24 · <15m) — sets reader expectation in one glance.
- After the SCRIPT block, the TrackPicker component renders five large tappable cards. Track choice persists to `profile.track` and drives every branched lesson downstream.
- Closing recap: nothing visual; the `[save]` card already carries the line the learner will screenshot.
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

-- Lesson 0.2 — The one rule that matters: data discipline (video, ~8 min)
-- Branched: each track has its own "off-limits in your world" passage
-- (lesson_track_variants below). Takeaway artifact: Data Discipline Card.
-- Exercise: the off-limits sorter (rendered by m0/OffLimitsSorter).
INSERT INTO addie.lessons (
  id, module_id, ordinal, title, modality, duration_min,
  is_branched, exercise_id, takeaway_artifact_type, body_md, published
)
VALUES (
  'm0.2',
  'm0',
  2,
  'The one rule that matters: data discipline',
  'video',
  8,
  true,
  'm0-2-off-limits-sorter',
  'data_discipline_card',
  $LESSON$
## SCRIPT (verbatim)

> "Before you touch a single AI tool, there is one rule. Just one. Get this right, and everything else in this course is safe to explore — you can be as bold and curious as you want. Get it wrong, and it is the kind of mistake that ends up in an exam finding. So let's make it simple and make it stick."

> [stat] 1 | The single rule that governs everything in this course | Never put customer or confidential data into an AI tool. Get this right and the rest is safe to explore.

> "The rule reads simply. **Never put customer or confidential data into an AI tool.** No names tied to accounts. No account numbers, card numbers, or Social Security numbers. No customer financials. And nothing material that is not public yet. The elevator test: if you would be uncomfortable reading it aloud in a crowded elevator, it does not go in."

> [save] **Describe the situation, not the person.** Strip the name. Strip the number. Generalise the case. The help is almost always available from the anonymised version — and now you have not handed anything to anyone.

> "Why so strict? Once you paste something into a tool, you have handed it to a system you do not control. Depending on the tool, that text can be stored, reviewed, or used in ways you cannot take back. For a bank, that is not just awkward — it is a regulatory and reputational problem. Consumer chat apps and enterprise tools handle data differently, and most people cannot tell which is which in the moment. So we do not gamble. We use one habit that works everywhere."

> "Here is the part people miss: this rule almost never stops you from getting the help you want. You describe the situation instead of the person. Watch the same ask, two ways."

> [case:bad] The naming version — never type this
> "Customer Jane Doe, account 4471, balance twelve hundred dollars, is furious about an overdraft fee from last week. Help me draft a calm reply that explains the fee."
> [outcome] You have just handed a real member, a real account number, and a real balance to a vendor you do not control. This is the kind of thing that ends up in an exam finding.

> [case:good] The situation version — always type this
> "A customer is upset about an overdraft fee they feel was unfair. Help me draft a calm, empathetic reply that explains the fee and offers next steps."
> [outcome] Same help. Zero risk. Same letter quality, none of the file.

> [warn] Inside this course our practice sandbox is built so you literally cannot paste sensitive data — there are guardrails. But out in the real tools, on your own, there are no guardrails. The habit is what keeps you safe when the training wheels come off.

> "The next section makes it concrete for your role. Five quick sort items — which of these is safe to share with an AI tool, which has to be anonymised first, which never goes in at all. Five answers; ninety seconds."

## PRODUCTION

- Open on the single big rule card (the `[stat]` block). Tone is serious-but-calm — this is the guardrail that *enables* boldness, not a scolding.
- The `[save]` callout fixes the most-important line on screen for the screenshot.
- The two `[case:bad]` and `[case:good]` cards sit side-by-side on desktop, stacked on mobile. Oxblood rule on the bad, ink rule on the good. The headline difference (named vs. anonymised) is the visual lesson.
- After the SCRIPT block, the off-limits sorter renders with the learner's track-specific items (see `OffLimitsSorter` and the per-track `addie.lesson_track_variants` rows below).
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
-- 3. Track variants for m0.2 (5 tracks)
-- =====================================================================

-- Upsert pattern: delete-then-insert per (lesson_id, track) is safe because
-- the table's PK is (lesson_id, track). We use ON CONFLICT DO UPDATE.

INSERT INTO addie.lesson_track_variants (lesson_id, track, body_md, media_ref)
VALUES (
  'm0.2',
  'risk_compliance',
  $TV$
### Off-limits in your world — Risk & Compliance

In risk and compliance, the things you handle every day are exactly the
things an AI tool must never see. Treat the following as off-limits in any
consumer or unapproved AI tool, full stop:

- Exam findings, MRAs, and MRIAs — wording, scope, or timing.
- SAR and BSA filings, draft narratives, or any reference that ties a
  filing to a specific subject.
- Audit workpapers, control test results, and remediation trackers tied
  to named systems or people.
- Consumer complaint records that carry names, account numbers, or
  contact details.
- Anything marked confidential, privileged, or supervisory.

You can still get the help you want. Public CFPB rule summaries, generic
explanations of Reg E or Reg DD, plain-language drafts of internal
training material, and "describe the situation" framings of customer
issues are all fair game. When the question requires real detail, take
the detail out before you ask. Strip names, account fragments, dollar
amounts, and dates that would let a reader reverse-engineer the case.
The pattern is the same every time: ask about the type of issue, not the
specific record.

If a question feels close to the line, route it through the same channel
you would use for any supervisory communication — your CCO, your audit
liaison, or your model risk function. The habit you build in this lesson
is the same one you would defend in an examination.
$TV$,
  NULL
),
(
  'm0.2',
  'customer_facing',
  $TV$
### Off-limits in your world — Customer-Facing

On the front line, the speed and pressure of the work is the risk. The
tools that make your job easier are the same tools that can swallow a
customer's information in one paste. Treat the following as off-limits
in any consumer or unapproved AI tool:

- Account numbers, card numbers, and SSNs — full or partial.
- Balances, transaction history, or fee detail tied to a real name.
- Loan or membership applications and anything attached to them
  (paystubs, IDs, statements).
- Income, employment, and asset data, including verbal disclosures
  written down later.
- Anything pulled from a credit report or credit bureau response.

This rule does not stop you from getting real help. Generic objection
handling, fee explanations written in plain language, friendly script
drafts for common questions, and de-identified summaries of recurring
issues are all safe. When you want help with a real conversation, type
the shape of it: "A member is upset about a returned-item fee and feels
it was unfair — draft a calm, empathetic reply that explains the fee
and offers next steps." You get the help. The member's data never
leaves the system it lives in.

If you are not sure whether a tool is approved for member data, the
answer is no. Use the approved channel, or strip the detail and ask
about the pattern.
$TV$,
  NULL
),
(
  'm0.2',
  'back_office',
  $TV$
### Off-limits in your world — Back-Office Process

Back-office work runs on lists and files. Many of those lists are the
quietest source of risk in the building, because they look like
spreadsheets and feel routine. Treat the following as off-limits in any
consumer or unapproved AI tool:

- Customer lists of any kind — for campaigns, mailers, segmentation, or
  reactivation.
- Transaction files, payment exports, and statement runs.
- Non-public internal financials — branch P&Ls, channel margins,
  pre-release performance numbers.
- Employee PII — names tied to compensation, HR matters, or performance.
- Contact data — emails, phone numbers, addresses — used for outreach.

The help is almost always available without the file. You can ask for a
cleaner version of an internal process memo, draft a press release about
a public product launch, rewrite operations procedures for clarity, or
think through campaign concepts in the abstract. When the work needs
real records, do the work in the approved system and bring only the
question to the AI tool. The pattern: "Here is the shape of the data;
suggest a way to segment it." Never: "Here is the data."

If you would have to email a list to a vendor under contract for the
same task, an AI tool is not the place to short-circuit that process.
$TV$,
  NULL
),
(
  'm0.2',
  'technical',
  $TV$
### Off-limits in your world — Technical

In IT, the off-limits list is broader than customer PII. You are also
the steward of the credentials and configurations that protect
everything else. Treat the following as off-limits in any consumer or
unapproved AI tool:

- Credentials, passwords, API keys, tokens, and connection strings — in
  any form, including "just for debugging."
- System logs that contain customer PII, session identifiers, or
  authentication artifacts.
- Network diagrams, firewall rules, and security configurations.
- Source code containing embedded secrets, internal hostnames, or
  proprietary algorithms.
- Database exports, even small samples, that contain real customer
  records.

You can still get a lot of value out of an AI tool. Generic error
messages, sanitized stack traces, language and framework questions,
checklists for vendor due diligence, and architecture sketches with no
identifiers attached are all fair use. When the question is about real
code or real logs, redact aggressively — placeholder secrets,
synthetic hostnames, fake user IDs — or rebuild a minimal reproducer
without the sensitive surface area. The pattern: "Here is a five-line
reproducer that triggers the same error." Never: "Here is the prod
log."

If a sample feels too convenient to redact, that is a signal to keep
it inside the approved system and ask the AI tool a more general
question.
$TV$,
  NULL
),
(
  'm0.2',
  'leadership',
  $TV$
### Off-limits in your world — Leadership

At the leadership level, the off-limits list is short but extremely
high-stakes. The information that crosses your desk is the kind a
regulator, an attorney, or a journalist would want a transcript of.
Treat the following as off-limits in any consumer or unapproved AI
tool:

- Board materials — packets, minutes, draft resolutions, dissenting
  notes.
- M&A and strategic plans — targets, valuations, structures, timelines.
- Earnings or financial results before public release (MNPI of any
  shape).
- Personnel and HR matters — comp decisions, performance issues,
  investigations.
- Confidential financials — capital plans, liquidity stress results,
  internal forecasts.

You can still get genuine leverage out of these tools. Public banking
trends, summaries of regulator speeches, framing exercises for
strategy talks, and high-level outlines of board presentations with no
confidential specifics are all safe. When the work needs real detail,
do the thinking in the approved environment and bring only the
abstract question to the AI tool. The pattern: "Help me frame talking
points on AI strategy for a community bank board, focused on risk and
opportunity." Never: "Here is our draft plan, sharpen it."

If something would be considered MNPI before public release, it stays
out of every AI tool until release, including the ones your team has
approved. The discipline you set here is the discipline your bank
inherits.
$TV$,
  NULL
)
ON CONFLICT (lesson_id, track) DO UPDATE SET
  body_md   = EXCLUDED.body_md,
  media_ref = EXCLUDED.media_ref;

-- =====================================================================
-- 4. Knowledge checks (3 per lesson, 6 total)
-- =====================================================================
-- Stable UUIDs so re-runs hit the same rows.

INSERT INTO addie.knowledge_checks (id, lesson_id, ordinal, prompt, options)
VALUES
(
  'a0000000-0000-4000-a000-000000000011'::uuid,
  'm0.1', 1,
  'How long is the longest lesson in this course?',
  '[
    {"id":"a","label":"30 minutes","correct":false,"explanation":"Lessons are deliberately short — never more than 15 minutes."},
    {"id":"b","label":"15 minutes or less","correct":true,"explanation":"Every lesson is capped at 15 minutes so it fits between meetings."},
    {"id":"c","label":"45 minutes","correct":false,"explanation":"Lessons are short on purpose — 15 minutes is the ceiling."},
    {"id":"d","label":"It varies by track","correct":false,"explanation":"Length is uniform; only the examples branch by track."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-000000000012'::uuid,
  'm0.1', 2,
  'What do you have to do to keep something you create in the free portion?',
  '[
    {"id":"a","label":"Nothing — saves are automatic","correct":false,"explanation":"Nothing saves anonymously in the free tier."},
    {"id":"b","label":"Give an email at the gate, or upgrade","correct":true,"explanation":"Free saves require an email at the gate; the paid tier removes that requirement."},
    {"id":"c","label":"Pay $99 for the Readiness Assessment","correct":false,"explanation":"The Readiness Assessment is a separate product, not the way to keep your free Toolbox items."},
    {"id":"d","label":"Print it before leaving the page","correct":false,"explanation":"Printing is not how saves work; the system saves to your Toolbox once you give an email or upgrade."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-000000000013'::uuid,
  'm0.1', 3,
  'Can you change your role track later in the course?',
  '[
    {"id":"a","label":"No — your first choice is locked","correct":false,"explanation":"The track is changeable any time from your account settings."},
    {"id":"b","label":"Only before Module 3","correct":false,"explanation":"You can change track at any point in the course."},
    {"id":"c","label":"Yes, at any time","correct":true,"explanation":"You can switch tracks whenever your role or your interest shifts."},
    {"id":"d","label":"Only by contacting support","correct":false,"explanation":"You change it yourself in account settings."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-000000000021'::uuid,
  'm0.2', 1,
  'Which of these can safely go into a consumer AI tool?',
  '[
    {"id":"a","label":"A customer name plus their account number","correct":false,"explanation":"Names tied to accounts are exactly what the rule forbids."},
    {"id":"b","label":"A SAR narrative with identifiers removed","correct":false,"explanation":"SAR content is supervisory; even redacted versions stay out of unapproved tools."},
    {"id":"c","label":"An anonymized situation, e.g. a customer is upset about a fee","correct":true,"explanation":"Describing the situation rather than the person keeps the help available and the data safe."},
    {"id":"d","label":"A list of cardholders for a mailer","correct":false,"explanation":"Customer lists are off-limits in any consumer AI tool."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-000000000022'::uuid,
  'm0.2', 2,
  'What is the move when you need help on something that involves real customer details?',
  '[
    {"id":"a","label":"Paste the details, then ask the tool to forget them","correct":false,"explanation":"You cannot ask a tool to forget; once pasted, the data is out."},
    {"id":"b","label":"Describe the situation, not the person","correct":true,"explanation":"Generalize the case so the model can help you without ever seeing the record."},
    {"id":"c","label":"Use a private-browsing window","correct":false,"explanation":"The browser mode does not change how the AI provider handles the input."},
    {"id":"d","label":"Trust the enterprise version of the same tool","correct":false,"explanation":"Even enterprise tools require approval and data-handling controls; do not assume."}
  ]'::jsonb
),
(
  'a0000000-0000-4000-a000-000000000023'::uuid,
  'm0.2', 3,
  'True or false: this course''s sandbox will stop you from pasting an account number.',
  '[
    {"id":"a","label":"True — and the same guardrails apply in every AI tool","correct":false,"explanation":"The sandbox does have guardrails — but real tools do not. The habit is what keeps you safe outside this course."},
    {"id":"b","label":"True — but real tools will not, so the habit is yours","correct":true,"explanation":"The course sandbox blocks sensitive paste patterns. Outside the course there are no guardrails, so the discipline has to be yours."},
    {"id":"c","label":"False — the sandbox does not check what you paste","correct":false,"explanation":"It does check. The point is that real tools generally do not."},
    {"id":"d","label":"False — only the paid sandbox has that check","correct":false,"explanation":"The PII check is built into the sandbox from day one, not gated to paid."}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  lesson_id = EXCLUDED.lesson_id,
  ordinal   = EXCLUDED.ordinal,
  prompt    = EXCLUDED.prompt,
  options   = EXCLUDED.options;

-- =====================================================================
-- 5. Exercise — off-limits sorter for m0.2
-- =====================================================================
-- Not an LLM exercise. Rendered by the React widget at
-- src/components/addie/interactives/m0/OffLimitsSorter.tsx, which reads
-- preset_context_blocks[0].body for the sortable item set. We use
-- addie.exercises only for uniform lesson.exercise_id dispatch.

INSERT INTO addie.exercises (
  id, lesson_id, mode, track_variant,
  system_prompt, lever_directives,
  task_scaffold, levers, data_slots, preset_context_blocks,
  default_provider, allow_provider_switch, gating, entitlement, published
)
VALUES (
  'm0-2-off-limits-sorter',
  'm0.2',
  'single',
  NULL,
  '-- not an LLM exercise; rendered by m0/OffLimitsSorter --',
  '{}'::jsonb,
  'Sort each item into Off-limits, Allowed, or Needs review. You will get instant feedback on each one. The set adapts to your role track.',
  '[]'::jsonb,
  '[]'::jsonb,
  $PCB$[
    {
      "id": "items",
      "label": "sortable items",
      "body": "[ {\"id\":\"u01\",\"label\":\"A public CFPB rule summary you want to digest\",\"category\":\"allowed\",\"track\":\"all\"}, {\"id\":\"u02\",\"label\":\"An internal email with no customer names that asks for plainer wording\",\"category\":\"allowed\",\"track\":\"all\"}, {\"id\":\"u03\",\"label\":\"A draft meeting agenda about general AI strategy\",\"category\":\"allowed\",\"track\":\"all\"}, {\"id\":\"u04\",\"label\":\"A spreadsheet exported from your core that lists members and balances\",\"category\":\"off_limits\",\"track\":\"all\"}, {\"id\":\"u05\",\"label\":\"A screenshot of a customer dispute form with the name visible\",\"category\":\"off_limits\",\"track\":\"all\"}, {\"id\":\"u06\",\"label\":\"A note that mostly explains a situation but includes one real account number\",\"category\":\"off_limits\",\"track\":\"all\"}, {\"id\":\"u07\",\"label\":\"A vendor proposal you received that is marked Confidential\",\"category\":\"depends_on_review\",\"track\":\"all\"}, {\"id\":\"rc1\",\"label\":\"An internal exam finding you want rephrased for a team summary\",\"category\":\"off_limits\",\"track\":\"risk_compliance\"}, {\"id\":\"rc2\",\"label\":\"A SAR narrative you want help structuring\",\"category\":\"off_limits\",\"track\":\"risk_compliance\"}, {\"id\":\"rc3\",\"label\":\"A general request to summarize Reg E requirements\",\"category\":\"allowed\",\"track\":\"risk_compliance\"}, {\"id\":\"cf1\",\"label\":\"A friendly explanation of how overdraft fees work, no member data\",\"category\":\"allowed\",\"track\":\"customer_facing\"}, {\"id\":\"cf2\",\"label\":\"A member''s account number with their current balance\",\"category\":\"off_limits\",\"track\":\"customer_facing\"}, {\"id\":\"cf3\",\"label\":\"A scanned loan application you want help reviewing\",\"category\":\"off_limits\",\"track\":\"customer_facing\"}, {\"id\":\"bo1\",\"label\":\"An internal process memo with no customer data you want clarified\",\"category\":\"allowed\",\"track\":\"back_office\"}, {\"id\":\"bo2\",\"label\":\"A customer export CSV you want segmented\",\"category\":\"off_limits\",\"track\":\"back_office\"}, {\"id\":\"bo3\",\"label\":\"A press release draft about a public product launch\",\"category\":\"allowed\",\"track\":\"back_office\"}, {\"id\":\"tc1\",\"label\":\"A generic error message you want explained\",\"category\":\"allowed\",\"track\":\"technical\"}, {\"id\":\"tc2\",\"label\":\"A log snippet that includes customer PII\",\"category\":\"off_limits\",\"track\":\"technical\"}, {\"id\":\"tc3\",\"label\":\"A config file that still contains live API keys\",\"category\":\"off_limits\",\"track\":\"technical\"}, {\"id\":\"ld1\",\"label\":\"A request to summarize public trends in community banking\",\"category\":\"allowed\",\"track\":\"leadership\"}, {\"id\":\"ld2\",\"label\":\"Pre-release earnings figures you want help framing\",\"category\":\"off_limits\",\"track\":\"leadership\"}, {\"id\":\"ld3\",\"label\":\"A confidential board deck you want shortened\",\"category\":\"off_limits\",\"track\":\"leadership\"} ]"
    }
  ]$PCB$::jsonb,
  'anthropic',
  false,
  '{"maxOutputTokens": 1, "maxOutputChars": 1}'::jsonb,
  'free',
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
