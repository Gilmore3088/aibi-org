// Signal-keyed starter artifacts for the v3 post-assessment breakdown.
//
// Each banker who completes the free Readiness Snapshot gets ONE artifact
// tied to their lowest-scoring signal — copy/pasteable markdown they can
// take to a colleague this week.
//
// Voice: second-person, individual, banker-direct. Three concrete actions
// for the week, one starter prompt that works in any chat tool. No
// marketing, no AI buzzwords. Same body ships across all four tiers for a
// given signal; tier-specific framing is added at render time.
//
// Source: docs/Plans/_assets/aibi-assessment-architecture-2026-05-28.md
// Section 9 ("Starter Artifact Recommendation Logic") plus the
// dimension-level "starter artifacts" lists in Section 4.

import type { Dimension } from './types';

export interface StarterArtifact {
  readonly title: string;
  readonly subtitle: string;
  readonly filename: string;
  readonly body: string;
}

const ARTIFACTS: Record<Dimension, StarterArtifact> = {
  'strategic-value': {
    title: 'A 30-day "candidate task" brief for your own AI use',
    subtitle: 'Pick two tasks in your week worth using AI on — name the friction, name the win.',
    filename: 'aibi-strategic-value.md',
    body: `# A 30-day candidate-task brief

People who get real value out of AI share one trait: they stop using AI in
general and start using AI on specific tasks they own. The shift takes a
week to make and a month to prove.

## Three things you can do this week

1. **List your friction.** Sit with your calendar for fifteen minutes. Circle
   the recurring tasks that take too long and produce roughly the same
   output every time — narratives, summaries, drafts, write-ups, replies.
2. **Pick two candidates.** From the list, pick two where AI could plausibly
   help. Examples: BSA narrative drafting, loan-file summaries, internal
   meeting notes, vendor follow-up emails, prep for an exam request.
3. **Write the half-page brief.** For each task: what you do today, the
   friction, what AI would draft, what you would still review, the win
   you'd measure (time saved, fewer revisions, faster turnaround).

## A starter prompt to use

> Help me write a half-page "candidate task" brief for using AI on
> [DESCRIBE THE TASK] in my work at a community bank. Cover: what I do
> today in three to five bullets, the friction points, the shape of the
> AI assistance, what I would still review myself, and the measurable
> 30-day outcome. Tone: specific, conservative, no vendor jargon.
`,
  },

  'approved-tool-path': {
    title: 'A two-page "approved tools" personal reference card',
    subtitle: 'Build the answer to "which AI tools am I allowed to use at work?" — once.',
    filename: 'aibi-approved-tool-path.md',
    body: `# Your personal approved-tools reference card

Most bankers default to whatever AI tool they found first. The fix is
simple: know what your institution has actually approved, and use it. If
nothing is formally approved, you still need a personal rule.

## Three things you can do this week

1. **Ask the question.** Email your IT or compliance lead one sentence:
   "Which AI tools are approved for staff use, and which are restricted?"
   Save the answer in a file you can refer to.
2. **Build the card.** Make a one-pager: Approved tools (green), Limited
   use (yellow — only for certain data), Off-limits (red). If your
   institution has not classified tools yet, draft your best guess and
   ask compliance to confirm.
3. **Use only the green list.** For thirty days, work only inside approved
   tools. When you hit a gap, write it down — that becomes your case for
   getting a new tool approved.

## A starter prompt to use

> Help me draft a one-page "approved AI tools" reference card for my own
> use. I'll fill in the tool names and data classes. The card should have
> three sections — Approved (green), Limited (yellow, with which data
> classes are allowed), Off-limits (red, with why). Keep the language
> plain enough that a colleague could read it in two minutes.
`,
  },

  'data-safety-reflexes': {
    title: 'A one-page "what never goes in" safe-use card',
    subtitle: 'Build the reflex: know what to strip before you paste anything into AI.',
    filename: 'aibi-data-safety-reflexes.md',
    body: `# Your "what never goes in" safe-use card

The single most common AI mistake at a community bank is pasting customer
data, account numbers, or internal credentials into a public chat tool.
The fix is a reflex: strip first, paste second.

## Three things you can do this week

1. **Make the list.** Write down the categories of information you handle
   that should never go into a public AI tool: customer names, account
   numbers, SSNs, balances, internal credentials, vendor contract terms,
   examiner correspondence, complaint detail, fraud-investigation notes.
2. **Practice the strip.** Take three recent emails or notes. Rewrite them
   with the identifiers and specifics removed but the structure intact.
   That is what should go into AI — the shape of the question, not the
   real data.
3. **Pick a fallback.** Identify the approved internal tool you'd switch to
   when the work genuinely needs the real data. Know how to get to it.

## A starter prompt to use

> Help me draft a one-page personal "safe AI use" reference card for a
> community bank employee. List eight to ten categories of information
> that should never go into a public AI tool, with one-sentence reasons.
> Then list four habits to build — strip first, use approved tools for
> sensitive work, check outputs before sending, know who to ask.
`,
  },

  'prompting-skill': {
    title: 'A "useful answer the first time" prompting starter kit',
    subtitle: 'Five prompt patterns that turn AI from a search bar into a working colleague.',
    filename: 'aibi-prompting-skill.md',
    body: `# Five prompt patterns that pay rent

If you are getting generic answers from AI, the problem is almost always
the prompt. These five patterns — role, format, source, check, edit —
move AI from a glorified search bar to something closer to a working
draftsman.

## Three things you can do this week

1. **Use the five-part frame.** Every prompt for real work should include:
   the role AI is playing, the format you want back, the source material,
   the explicit "check your work" instruction, and what you will edit
   after. Try it on one task and see the difference.
2. **Save what works.** Each time a prompt gets you a useful answer, save
   it. After two weeks you'll have five to ten prompts that consistently
   work for your role — the start of your personal prompt library.
3. **Rewrite the bad ones.** Each time you get a generic answer, rewrite
   the prompt before giving up. Most "AI is useless" experiences are one
   prompt rewrite away from working.

## A starter prompt to use

> Help me draft five reusable prompt templates for my work at a community
> bank as a [YOUR ROLE]. Each template should follow this shape: role,
> format, source material, "check your work" instruction, what I will
> edit. Keep each template tight enough to paste and fill in.
`,
  },

  'role-fit': {
    title: 'A "this is what AI does in my job" one-pager',
    subtitle: 'Stop experimenting in general. Connect AI to three named tasks in your actual role.',
    filename: 'aibi-role-fit.md',
    body: `# A one-pager: AI in your actual job

General AI experiments do not stick. AI tied to three named tasks you
already do every week becomes part of how you work. This is the
difference between "I'm exploring AI" and "I use AI."

## Three things you can do this week

1. **Map your week.** Write down the five tasks that take the most time in
   a typical week. Be specific — "respond to member messages" beats
   "communications."
2. **Pick three for AI.** From the five, pick the three where AI could
   plausibly draft, summarize, classify, or compare. Leave the other two
   alone — not every task benefits from AI.
3. **Run one cycle per task.** For each of the three, do one real-work
   cycle with AI this week. Note what worked, what you had to rewrite,
   what you would do differently next time.

## A starter prompt to use

> Help me identify three tasks in the role of [YOUR ROLE] at a community
> bank where AI would plausibly save time or improve quality. For each
> task, describe: what I do today, the shape of the AI assistance
> (drafting, summarizing, classifying, comparing), and what I would
> still review myself before the output is used.
`,
  },

  'human-review': {
    title: 'A personal "review before send" checklist',
    subtitle: 'Define which AI work needs a second pair of eyes — and exactly which eyes.',
    filename: 'aibi-human-review.md',
    body: `# Your review-before-send checklist

AI output reads confidently even when it is wrong. The fix is not better
AI — it is a deliberate review step. Define what you check, when, and
who else needs to look before the work leaves your desk.

## Three things you can do this week

1. **Tier the work.** Sort your AI-assisted work into three buckets: Low
   (internal notes, drafts no one else sees), Medium (work that goes to a
   colleague), High (work that touches a customer, a regulator, or a
   decision). The review intensity should match the tier.
2. **Write the High-tier rule.** Anything that touches a customer or a
   regulated decision goes to a named second reviewer. Write down who
   that is for each kind of work — the actual name, not a role.
3. **Slow down on the close calls.** When you are not sure if something is
   Medium or High, treat it as High. Examiners do not give partial credit
   for "I thought it was a draft."

## A starter prompt to use

> Help me draft a personal "AI work review" checklist for my role at a
> community bank. The checklist should have three tiers — Low, Medium,
> High — with the criteria that put work in each tier and the review
> step required for each. Include three to five items for the High tier
> that a reviewer would actually check (accuracy of figures, sources for
> claims, customer-facing language, compliance fit, retention).
`,
  },

  'documentation': {
    title: 'A "could a reviewer reconstruct this?" recordkeeping habit',
    subtitle: 'Save the prompt, save the output, save the edits — every time. Three minutes.',
    filename: 'aibi-documentation.md',
    body: `# Save the prompt, save the output, save the edits

AI work that you cannot show to a reviewer or examiner is AI work that
will be questioned. The fix is a three-minute habit: capture the prompt,
the unedited AI output, and what you changed before using it. That is
the evidence trail.

## Three things you can do this week

1. **Pick a location.** Decide where you will save AI work artifacts —
   could be a folder in your work email, a OneNote section, a shared
   drive folder. The format does not matter. Consistency does.
2. **Build the template.** For each AI-assisted item, capture: the date,
   the task, the prompt you used, the unedited output, the edits you
   made, the final version that was used. A short header row is enough.
3. **Backfill one week.** Take last week's AI-assisted work and document
   it now while you can still remember. After that, do it as you go.

## A starter prompt to use

> Help me design a lightweight recordkeeping template for AI-assisted
> work at a community bank. The template should capture the prompt, the
> unedited AI output, the edits I made before use, and the final
> version. Keep it tight enough that filling it in takes under three
> minutes per item. Include a one-line note on retention practice.
`,
  },

  'vendor-awareness': {
    title: 'A "where is AI hiding in my tool stack" inventory worksheet',
    subtitle: 'List every vendor tool you use and flag the AI features — including the quiet ones.',
    filename: 'aibi-vendor-awareness.md',
    body: `# Where is AI hiding in your tool stack?

Most banking software has quietly added AI features in the last eighteen
months. Summarization, drafting, classification, "smart" assistants —
often turned on by default. If you do not know which tools have AI
inside, you cannot manage what data those tools see.

## Three things you can do this week

1. **List your tools.** Write down every vendor tool you use in a typical
   week — core banking, loan origination, ticketing, email, document
   management, BSA software, anything with a login. Aim for fifteen to
   twenty entries.
2. **Flag the AI features.** For each tool, mark Yes / No / Unknown for
   "has AI features." For Unknown, spend two minutes on the vendor's
   product page or release notes. You will be surprised how many have AI.
3. **Note what data each tool sees.** For each AI-flagged tool, write one
   line on what data the AI feature has access to (customer data,
   transaction data, internal records, etc.). That is the conversation
   starter for vendor risk.

## A starter prompt to use

> Help me design a one-page vendor-AI inventory worksheet for an
> individual community bank employee. Columns should include: vendor
> name, primary use, has AI features (yes/no/unknown), AI features in
> use, data the AI sees, notes. Include a brief instruction on how to
> check release notes if "unknown."
`,
  },

  'customer-impact-awareness': {
    title: 'A "where AI touches a customer or regulated decision" map',
    subtitle: 'Map your AI uses against the four obvious regulatory tripwires.',
    filename: 'aibi-customer-impact-awareness.md',
    body: `# Where does AI touch a customer or regulated decision?

When AI helps draft a customer email, prepare a loan summary, generate
adverse-action language, or sort complaints, it has crossed into
regulated territory. The fix is not to stop — it is to know the line.

## Three things you can do this week

1. **List your AI touches.** Write down every place AI assists in your
   work that ends up in front of a customer or feeds a decision.
   Examples: response drafts, marketing copy, complaint summaries,
   account-action explanations, lending narratives.
2. **Match each to a rule.** For each item, note which rule applies —
   ECOA / Reg B (adverse action), UDAAP (fair, accurate, no deception),
   BSA / AML (sensitivity), fair lending (disparate impact). If none
   applies, mark "internal only."
3. **Tighten the review.** For each customer-touching or rule-touching
   item, add the review step you would defend to an examiner — who
   reviewed, what they checked, when, and where it is saved.

## A starter prompt to use

> Help me draft a one-page "customer impact map" for my AI-assisted work
> at a community bank. For each AI use case I list, the map should show:
> what the AI produced, who it ends up in front of (customer, internal,
> regulator), which rule applies (ECOA, UDAAP, BSA, fair lending,
> internal only), and the specific review step before use.
`,
  },

  'workflow-readiness': {
    title: 'A four-step workflow map for one of your recurring tasks',
    subtitle: 'Turn ad-hoc AI use into a written input → AI draft → review → final-output flow.',
    filename: 'aibi-workflow-readiness.md',
    body: `# A four-step workflow map

The difference between an AI chat and an AI workflow is whether anyone
else could reproduce it. The format is the same every time: input, AI
draft, review, final output. If you can write it down, a colleague can
do it. If a colleague can do it, it becomes the institution's work.

## Three things you can do this week

1. **Pick one recurring task.** Choose a task you do regularly where AI
   already helps. BSA narratives, member responses, loan summaries —
   pick the one with the most repetition.
2. **Write the four steps.** Input (what raw material starts the task) →
   AI draft (the prompt, the tool, the output shape) → Review (who
   checks what) → Final output (where it goes, what gets saved).
3. **Hand it to a colleague.** Give the workflow to someone who has not
   done it before. If they can run it without asking you questions, you
   have a workflow. If they cannot, you have a draft.

## A starter prompt to use

> Help me draft a four-step workflow document for using AI on
> [DESCRIBE THE RECURRING TASK] at a community bank. Format: Step 1
> Input (what raw material starts the task), Step 2 AI Draft (the
> prompt template, the tool, the expected output shape), Step 3 Review
> (who reviews, what they check, what they reject), Step 4 Final Output
> (where it goes, what is saved, retention). Tight enough for a
> colleague to follow without asking.
`,
  },

  'training-culture': {
    title: 'A personal AI learning plan — the next six weeks',
    subtitle: 'Stop figuring it out alone. Pick three skills, name three teachers.',
    filename: 'aibi-training-culture.md',
    body: `# Your personal six-week AI learning plan

The bankers who go furthest with AI are not the ones with the best
employer training — they are the ones who own their learning. Pick
three skills, name three sources, and put it on the calendar.

## Three things you can do this week

1. **Pick three skills.** From the gaps you already know about, pick
   three concrete AI skills to build in the next six weeks. Examples:
   prompting for compliance review, building reusable templates, AI
   summarization of long documents.
2. **Name three sources.** For each skill, name one source — could be a
   course, a written guide, a colleague who already does it well, a
   community of practice. "I will figure it out" is not a source.
3. **Calendar it.** Block thirty minutes a week per skill. Six weeks ×
   three skills × thirty minutes = nine hours. That is the difference
   between "I tried" and "I learned."

## A starter prompt to use

> Help me draft a personal six-week AI learning plan for a community bank
> employee in the role of [YOUR ROLE]. Pick three concrete AI skills
> relevant to that role, recommend one starter source for each, and lay
> out a week-by-week practice schedule that fits in thirty minutes per
> skill per week. Be specific about what "done" looks like for each
> skill at the end of week six.
`,
  },

  'leadership-visibility': {
    title: 'A "what does leadership track about AI?" conversation kit',
    subtitle: 'Five questions to ask your manager so you actually know what counts.',
    filename: 'aibi-leadership-visibility.md',
    body: `# A leadership-visibility conversation kit

You cannot align with what you cannot see. If you do not know what your
leadership tracks about AI — what good looks like, what concerns them,
what they want more of — your AI work is guesswork. The fix is one
fifteen-minute conversation.

## Three things you can do this week

1. **Ask the five questions.** Schedule fifteen minutes with your
   manager. Ask: What does leadership want to see from AI use this year?
   What worries leadership about AI? How is AI use being measured? What
   would "exceeding expectations" look like? Where can I see this
   measured?
2. **Take notes you can act on.** Translate the answers into three things
   you will do differently in your AI work this month. If there are no
   action items, the conversation was too abstract — ask again.
3. **Share what you find.** Tell one colleague what you learned. Most
   bankers do not have this conversation; one person sharing it with
   three colleagues quietly raises the floor for the whole team.

## A starter prompt to use

> Help me prepare for a fifteen-minute conversation with my manager about
> AI use at a community bank. The conversation goals are: understand
> what leadership tracks about AI, what good looks like, what worries
> them, and where my work fits. Draft five questions I should ask, plus
> two short follow-up questions for each in case the first answer is
> too general. Tone: professional, curious, not pushy.
`,
  },
};

export function getStarterArtifact(dimension: Dimension): StarterArtifact {
  return ARTIFACTS[dimension];
}
