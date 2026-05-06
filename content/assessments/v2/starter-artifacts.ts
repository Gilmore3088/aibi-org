// Dimension-keyed starter artifacts for the post-assessment breakdown.
// Each banker who completes the assessment gets ONE artifact tied to their
// lowest-scoring dimension — copy/pasteable markdown they can take to a
// colleague this week.
//
// Voice: McKinsey-tight, banker-direct. Three concrete actions for the
// week, one starter prompt that works in any chat tool, one clear citation
// strip. No marketing, no AI buzzwords.
//
// To keep the artifact useful, the same body ships across all four tiers
// for a given dimension. Tier-specific framing is added at render time as
// a one-line preface chosen by the caller.

import type { Dimension } from './types';

export interface StarterArtifact {
  readonly title: string;
  readonly subtitle: string;
  readonly filename: string; // .md suggested filename
  readonly body: string; // markdown body (no front matter)
}

const ARTIFACTS: Record<Dimension, StarterArtifact> = {
  'current-ai-usage': {
    title: 'A 30-day "AI use map" for your institution',
    subtitle: 'Find where AI is already happening — and where it is not.',
    filename: 'aibi-current-ai-usage.md',
    body: `# A 30-day "AI use map" for your institution

Most community banks underestimate how much AI is already in use inside
their walls. The Operations team is using a transcription tool. A loan
officer is asking ChatGPT to summarize a credit memo. Marketing is
generating copy. Nobody has written it down.

The first move is observation, not policy.

## Three things you can do this week

1. **Send one question to every department head.** "Are you, or anyone on
   your team, using any AI tool — paid or free, sanctioned or not — for
   work? List what, who, and how often." Set a 7-day deadline.
2. **Build a single-page registry.** One row per tool: tool name, who
   uses it, what data they put into it, whether it is paid by the bank.
   Spreadsheet is fine. The point is to make the picture visible.
3. **Bring the registry to the next leadership meeting.** Do not propose
   action yet. Just present what is happening so leadership shares the
   same picture.

## A starter prompt to send to your team

> I am building a one-page registry of every AI tool in use across our
> institution. Please reply by Friday with: (1) tool name, (2) who on
> your team uses it, (3) what kinds of work they use it for, (4) whether
> the bank pays for it. No tool is too small. No use is too informal.
> The goal is visibility, not enforcement.

## Why this is the right first step

You cannot govern what you cannot see. Examiners will eventually ask;
the AIEOG AI Lexicon (US Treasury, Feb 2026) explicitly defines an
"AI use case inventory" as a baseline expectation. Building it before
the exam is easier than building it during one.

## Citations

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
`,
  },

  'experimentation-culture': {
    title: 'A "safe sandbox Friday" template',
    subtitle: 'Give every banker on your team 60 minutes of permission to try something.',
    filename: 'aibi-safe-sandbox-friday.md',
    body: `# A "safe sandbox Friday" template

Adoption does not happen in mandatory training. It happens when a
teller, a back-office analyst, or a branch manager finds one thing that
saves them 20 minutes on a Tuesday — and tells the person next to them.

You do not need a vendor or a budget to start that. You need permission
and a structure.

## Three things you can do this week

1. **Pick one Friday.** Block 60 minutes on every banker's calendar.
   Title: "Safe Sandbox — try one AI tool on a real task."
2. **Pick the boundaries.** No customer PII, no financial data, no
   proprietary documents. Public information and synthetic examples
   only. Write this on the invite.
3. **Make sharing the cost of admission.** Ask each participant to
   submit one short note: what they tried, what worked, what did not.
   Compile and circulate. The list itself becomes your seed library.

## A starter prompt for your invite

> This Friday is our first Safe Sandbox hour. Pick one task you do
> regularly — drafting an email, summarizing a document, writing a
> follow-up — and try it with [tool name]. Use only public information
> or made-up examples. No customer data, no internal numbers. Bring
> back one thing that worked and one thing that did not. We learn
> together or not at all.

## Why this is the right first step

A learning culture is built from observed behavior, not stated values.
The institutions that move fastest from early-stage AI to coordinated
programs are the ones whose staff have already experimented enough to
know what is real. Sixty minutes a month is the cheapest investment in
that you can make.

## Citations

- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
- Getting Started in AI, Jack Henry & Associates, 2025
`,
  },

  'ai-literacy-level': {
    title: 'A 20-minute AI literacy primer for your team',
    subtitle: 'The minimum vocabulary every banker needs before policy, before tools, before anything.',
    filename: 'aibi-ai-literacy-primer.md',
    body: `# A 20-minute AI literacy primer for your team

You cannot ask staff to use AI safely if half of them think it is
magic and the other half think it is autocomplete. A short, shared
vocabulary closes the gap faster than anything else.

This primer is meant to be read aloud at a stand-up or shared as a
one-pager in a team meeting. It defines four terms.

## The four words every banker should be able to use

**Hallucination.** When an AI tool produces an answer that sounds
right but is fabricated. The model does not know it is wrong. The
banker is the only person who can catch it.

**Context window.** What the AI can "see" right now. Anything outside
that window — a document you did not paste, a fact from last quarter
— is not part of the answer. If the answer feels strangely confident,
ask: did I give it the right context?

**Prompt.** The instruction you give the tool. A vague prompt produces
a vague answer. A precise prompt — role, task, constraints, audience —
produces something useful. Prompt quality is your job, not the tool's.

**Human in the loop.** A banker reviews and accepts every AI output
before it leaves the institution. No AI output goes to a customer, a
regulator, or a board paper without a human signature. This is not
optional.

## Three things you can do this week

1. **Read the primer aloud at one team meeting.** Twenty minutes.
2. **Write the four definitions on a wall in the back office.**
3. **Add the four terms to your next monthly all-staff email** with
   one sentence each.

## A starter prompt to test understanding

> Ask three colleagues this week: "What is an AI hallucination, in
> your own words?" If you cannot get three good answers, you have not
> built shared vocabulary yet — and that is the real work.

## Citations

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026 — official definitions for hallucination, AI governance, HITL
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
`,
  },

  'quick-win-potential': {
    title: 'Three quick-win candidates for community banks',
    subtitle: 'Concrete, low-risk, AI-assistable tasks where the time savings are obvious.',
    filename: 'aibi-quick-win-candidates.md',
    body: `# Three quick-win candidates for community banks

The wrong first AI project is a customer-facing chatbot. The right
first AI project is something boring, internal, and high-volume that
nobody on your staff actually enjoys doing.

Three candidates that meet that bar.

## Candidate 1 — Meeting summaries

Most committee meetings produce minutes that nobody reads. AI
transcription + summarization can compress a 90-minute ALCO or credit
committee into a one-page action register in five minutes. No customer
data is involved. The output is reviewed by an attendee before it
circulates.

**Time saved per meeting:** ~60 minutes for the secretary. Multiply by
your committee count.

## Candidate 2 — Internal policy and procedure search

Every community bank has a 200-page policy manual that staff cannot
search effectively. A retrieval-augmented assistant trained on your
own policy corpus answers "what is our wire transfer limit for new
customers" in seconds, with the source paragraph cited.

This is the most defensible "AI for banking" use case the AI Playbook
(Cornerstone, 2025) names. PII never leaves your environment.

**Time saved per query:** 5–10 minutes per staff lookup. Multiply by
hundreds of lookups per month.

## Candidate 3 — Variance narrative drafting

The 5-day-close finance team writes the same kind of paragraph every
month: "non-interest expense up 3% driven by..." A drafted-by-AI,
edited-by-finance variance narrative cuts this from hours to minutes,
and the data never leaves a board-internal context.

**Time saved per close:** 4–8 hours for the finance lead.

## Three things you can do this week

1. **Pick one of these three.** Not all three. One.
2. **Find the one staffer who already complains about that task most.**
   Ask them to be the pilot.
3. **Time the current process before you change anything.** A baseline
   you can quote later is worth more than a forecast.

## A starter prompt

> I am looking for our institution's first AI project. The candidates
> I am evaluating: meeting summaries, policy search, and variance
> narrative drafting. Which of the three would save the most staff
> time at our institution this quarter, given how my team currently
> spends their hours?

## Citations

- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
- FDIC Quarterly Banking Profile — efficiency ratio context, Q4 2024
`,
  },

  'leadership-buy-in': {
    title: 'The one-page AI brief for your board or CEO',
    subtitle: 'A template that gets leadership aligned without a vendor pitch.',
    filename: 'aibi-leadership-brief.md',
    body: `# The one-page AI brief for your board or CEO

Most board AI conversations start with a vendor demo and end without a
decision. A one-page brief — written by you, not by a vendor — flips
the order. The board gets a picture they trust before the pitches arrive.

## The five sections

**1. What is happening today.** Two to three sentences naming the
AI tools already in use across the institution and roughly how many
staff use them. (You wrote this in the AI use map, if you have one.)

**2. What our peers are doing.** One sentence with one citation. Per
Bank Director's 2024 Technology Survey, 66% of community banks are
discussing AI budget. Naming this neutrally — "two-thirds of our peer
group is in the conversation" — sets the table without selling.

**3. What we know we do not know.** Three to five bullets. Examples:
"We do not have a written acceptable-use policy. We do not know
whether staff are entering customer information into public tools.
We do not have a model risk inventory."

**4. What we are proposing for the next 90 days.** One paragraph.
Examples: complete an AI use registry; establish a written
acceptable-use policy aligned to SR 11-7 and TPRM guidance; pilot
one internal-only use case; train every staff member on a four-term
literacy primer.

**5. What we are explicitly not doing.** Customer-facing AI. Vendor
selection. Major investment. The board needs to see the boundary
as clearly as the action.

## Three things you can do this week

1. **Draft the brief.** Aim for 400 words. Edit it down to 250.
2. **Run it past one trusted peer at another community bank.** Ask
   if it makes sense to them. Do not ask if it is good.
3. **Schedule it as a 15-minute item, not a presentation.** This is
   alignment, not a sale.

## A starter prompt to draft the brief

> Help me draft a one-page board brief on our community bank's AI
> approach for the next 90 days. The brief should have five sections:
> (1) what is happening today, (2) what peers are doing, (3) what we
> know we do not know, (4) what we are proposing, (5) what we are
> explicitly not doing. Keep it under 400 words. No marketing
> language. No "transformative" or "revolutionary." Match the tone
> of a credit memo.

## Citations

- Bank Director 2024 Technology Survey, via Jack Henry & Associates 2025
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
- Interagency Guidance on Third-Party Relationships: Risk Management, FDIC / OCC / Fed, 2023
`,
  },

  'security-posture': {
    title: 'A starter Acceptable Use Policy for AI tools',
    subtitle: 'Six clauses that close the highest-risk gaps in 30 minutes.',
    filename: 'aibi-acceptable-use-policy-starter.md',
    body: `# A starter Acceptable Use Policy for AI tools

Your highest near-term AI risk is not a model failure. It is a teller
pasting a customer's date of birth into a public chat tool to ask it
to summarize an email. A short, written policy closes that gap faster
than any technical control.

Six clauses. Adapt the language to your institution. Run the final
version past your compliance officer and legal counsel before adoption.

## The six clauses

**1. No customer PII or NPI in public AI tools.** No names, account
numbers, dates of birth, addresses, SSNs, balances, or transaction
details may be entered into any AI tool that is not on the bank's
approved list. Synthetic or redacted examples are permitted.

**2. No internal financial figures in public AI tools.** Pre-release
earnings, board materials, examination findings, and confidential
strategy may not be entered into any AI tool that is not on the
bank's approved list.

**3. Human review of every output.** No AI-generated content may be
sent to a customer, a regulator, a vendor, or a board member without
review and approval by a named bank employee.

**4. Approved tools list.** [List the tools your bank has approved.
Start with one or two — do not list everything you can think of.] All
other AI tools require IT and compliance review before use.

**5. Reporting.** If a banker realizes they have entered restricted
information into an unapproved tool, they must report it to [named
person] within 24 hours. Reports made in good faith do not result in
disciplinary action.

**6. Annual acknowledgement.** Every staff member who uses any AI
tool — paid or free — signs this policy at hire and annually
thereafter.

## Three things you can do this week

1. **Adopt the policy or a redlined version of it within 30 days.**
   Perfect is the enemy of written.
2. **Hold one 15-minute town hall** to walk through the six clauses.
   Read them out loud. Ask for questions.
3. **Add the policy as a slide in next month's all-staff training.**

## A starter prompt to redline the policy

> I am drafting an AI Acceptable Use Policy for our community bank.
> Below is a starter version. Help me identify clauses that may be
> too strict or too loose for an institution our size, and suggest
> language tightenings. Do not introduce new clauses unless you can
> tie them to a specific federal banking regulation. [Paste the
> policy here.]

## Citations

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026 — third-party AI risk, AI governance
- Interagency Guidance on Third-Party Relationships: Risk Management, FDIC / OCC / Fed, 2023
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
- ECOA / Regulation B, Consumer Financial Protection Bureau
`,
  },

  'training-infrastructure': {
    title: 'A 90-day staff AI training calendar',
    subtitle: 'A monthly cadence built from things you already do — no LMS purchase required.',
    filename: 'aibi-training-calendar.md',
    body: `# A 90-day staff AI training calendar

You do not need a learning management system to start. You need a
calendar entry that recurs and a trusted person to lead it. Three
months is enough to build the muscle.

## The 90-day calendar

**Month 1 — Literacy.** One 30-minute all-staff session on the four
foundational terms (hallucination, context window, prompt, human in
the loop). Reading the AIEOG AI Lexicon definitions out loud is fine.
Then: every staffer takes the AiBI free readiness assessment for their
role.

**Month 2 — Practice.** One 60-minute department session per week.
Each department picks one task they do regularly. They watch a
demonstration of doing it with an AI tool, then practice it
themselves. No customer data. The output of the session is one
saved prompt that the department keeps.

**Month 3 — Roll-up.** One 45-minute leadership review. Every
department head presents: what task we tried, what worked, what
did not, one example we can replicate next quarter. The bank's
first internal "playbook" comes out of this meeting.

## Three things you can do this week

1. **Block the recurring calendar entries** for the next 12 weeks
   before you do anything else.
2. **Pick the trusted person who runs each session.** It does not
   have to be the same person for all three. It does have to be
   someone whom staff respect.
3. **Set the success metric in advance.** At the end of 90 days,
   the bank should have: a written acceptable-use policy, a saved
   prompt library by department, and one documented quick-win pilot.

## A starter prompt for your trusted facilitator

> I am running a 30-minute introductory session for our community
> bank's staff on responsible AI use. The four concepts I want to
> cover are: hallucination, context window, prompt, and human in
> the loop. Help me draft a session outline that includes one real
> banking example for each concept and one small group exercise.
> Keep the tone conversational. Avoid jargon and avoid the words
> "revolutionary" and "transformative."

## Citations

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- Getting Started in AI, Jack Henry & Associates, 2025
- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
`,
  },

  'builder-potential': {
    title: 'A "first internal builder" project brief',
    subtitle: 'How to find the one banker on your team who can build, not just use.',
    filename: 'aibi-internal-builder-brief.md',
    body: `# A "first internal builder" project brief

Every community bank has one person — often a younger analyst, a
recent hire, an operations associate — who could build a small
internal AI workflow if given permission and a target. Naming that
person early matters more than buying a vendor solution.

## What makes someone a candidate

- Curiosity about how things work, not just whether they work
- Comfort writing — emails, memos, documentation
- Has shown up to one of your safe-sandbox sessions on their own
- Is not currently the IT department (the goal is operational, not
  technical)
- Has demonstrated good judgment with sensitive information

## The first project

**Pick a single department.** Operations is usually the easiest.

**Pick a single repetitive task.** Drafting standard customer
response letters. Compiling weekly exception reports. Summarizing
the policy manual for new hires.

**Set a 30-day boundary.** The builder works on it for one hour a
day. At day 30 they show what they made to the department head.
The artifact is internal-only, no customer data, no production use.

## Three things you can do this week

1. **Identify the candidate.** One person, by name.
2. **Give them the brief.** Walk them through the boundaries: one
   department, one task, 30 days, internal-only, no PII.
3. **Block 30 minutes on day 30** to review what they built.

## A starter prompt for the builder

> I am building a small internal AI workflow for our [department]
> team's [task]. The workflow must use only public or synthetic
> information — no customer data, no internal financial figures.
> Help me design the workflow in three steps: (1) what input the
> workflow takes, (2) what the AI tool does with that input, (3)
> what output a banker reviews before it is used. Keep the design
> simple enough that I can build it in 30 days at one hour per day.

## Why this matters

The institutions that compound AI capability over the next three
years will be the ones that develop internal builders, not the ones
that buy the most vendor solutions. One named builder beats one
unnamed budget every time.

## Citations

- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
- Hybrid Multi-Cloud AI Strategy, SS&C Managed IT, 2025
`,
  },
};

export function getStarterArtifact(dimension: Dimension): StarterArtifact {
  return ARTIFACTS[dimension];
}

// ── Tier-keyed prefaces ─────────────────────────────────────────────────────
//
// The artifact body is identical across all four tier bands — "what to do" is
// the same regardless of where you are. What changes is HOW the reader should
// receive the work: a Starting Point bank treats the artifact as a foundation;
// a Ready-to-Scale bank treats it as a codification instrument.
//
// Rendered as a small callout above the markdown body on /results/in-depth/[id]
// and inside the downloadable starter-artifact card on the free-results page.
// Generic by design — a single preface works for any of the 8 dimension
// artifacts because it speaks to the reader's posture, not the dimension.

import type { Tier } from './scoring';

export interface TierPreface {
  readonly headline: string;
  readonly body: string;
}

export const TIER_PREFACES: Record<Tier['id'], TierPreface> = {
  'starting-point': {
    headline: 'Start at step 1.',
    body: 'These three actions are written for institutions just beginning to think about AI. Nothing is in place yet, and that is fine. The value is in the order — do not try to skip to step 3.',
  },
  'early-stage': {
    headline: 'Treat step 1 as a checkpoint.',
    body: 'You are past the "should we?" stage. Some of step 1 may feel familiar — use it to confirm what you already suspect rather than discover it. The harder work, and the leverage, begins in step 2.',
  },
  'building-momentum': {
    headline: 'This is your audit instrument.',
    body: 'You have real traction. Run steps 1–2 quickly to surface what is NOT yet documented. The institution-wide leverage is in step 3 — bring it to leadership as a structured artifact, not a status update.',
  },
  'ready-to-scale': {
    headline: 'Codify what already works.',
    body: 'You are operating ahead of your peer group. Use this artifact to formalize the practices that got you here so the next cohort inherits them. Step 3 becomes a board reporting cadence, not a one-off action.',
  },
};

// Per-dimension override of the preface BODY. The headline stays
// tier-keyed (4 strings) because it speaks to posture; the body becomes
// dimension+tier specific (32 strings) because the actual work changes
// by dimension. When a caller passes both tier and dimension, we render
// the tier-keyed headline plus the dimension-specific body.
//
// 8 dimensions × 4 tier bands = 32 body strings.
const DIMENSION_TIER_BODIES: Record<Dimension, Record<Tier['id'], string>> = {
  'current-ai-usage': {
    'starting-point':
      'AI use exists in your bank already; you just have not seen it. The 30-day map is a sanitized observation exercise — collect first, decide later. Step 1 is not optional.',
    'early-stage':
      'You know AI is happening. The map turns informal awareness into a written artifact you can show examiners or the board. Step 1 may surface tools you forgot about.',
    'building-momentum':
      'Your registry probably exists in someone’s head. Step 1 is the formalization. Bring step 3’s leadership presentation as a quarterly cadence, not a one-off.',
    'ready-to-scale':
      'You already have an AI tool inventory. Use this artifact to standardize the format so it survives staff turnover and travels to peer institutions on request.',
  },
  'experimentation-culture': {
    'starting-point':
      'Experimentation has to feel safe before it can be useful. Step 1 picks one workflow with a clear before/after; step 3 protects whoever ran it from blame if it fails. Without step 3, step 1 never happens.',
    'early-stage':
      'You have one or two experiments in flight. Step 1 will tell you which deserve real measurement. Resist the urge to scale before you can describe the result in numbers.',
    'building-momentum':
      'Your team experiments without permission already. Step 1 makes the experiment fund formal so it scales. Step 3 ensures findings reach beyond the team that ran them.',
    'ready-to-scale':
      'Experiments are routine for you. The risk now is parallel teams running unconnected pilots. Step 3 becomes a quarterly synthesis — what is worth keeping, what is not.',
  },
  'ai-literacy-level': {
    'starting-point':
      'Most staff cannot distinguish "AI got it wrong" from "I prompted it wrong." Step 1 is hands-on, not a slide deck. Skip the lecture format for the live tool walkthrough.',
    'early-stage':
      'Some staff are confident; most are guessing. Step 1 separates the two so training targets the right group. Build the curriculum around the gaps step 1 surfaces.',
    'building-momentum':
      'You have pockets of strong literacy. Step 1 is now an audit, not a baseline survey — find who could mentor others. Step 3 turns those people into the training engine.',
    'ready-to-scale':
      'Literacy is broadly good. Step 1 stress-tests the edges: brand-new hires, board members, customer-facing roles in regulated channels. The weakest link is now the metric.',
  },
  'quick-win-potential': {
    'starting-point':
      'Pick one workflow. Just one. Step 1 tells you which. The temptation will be to pick the most exciting; step 3 says pick the most repetitive.',
    'early-stage':
      'You have candidate workflows but have not committed. Step 1 picks based on volume × pain × low-risk-on-error. Anything else is premature.',
    'building-momentum':
      'Quick wins are landing. Step 3 protects against scope creep — the win has to be ship-able in 30 days or it is a project, not a quick win.',
    'ready-to-scale':
      'Quick-win selection is mature. The risk is decision fatigue at scale. Step 3 becomes a per-team quota so leadership does not have to triage every candidate.',
  },
  'leadership-buy-in': {
    'starting-point':
      'Leadership cannot endorse what they have not seen working. Step 1 is small enough to demonstrate without budget; step 3 turns the demo into a capability ask.',
    'early-stage':
      'Leadership is curious. Step 1 builds the narrative they will repeat to the board. Without step 3, curiosity becomes a one-time experiment.',
    'building-momentum':
      'You have leadership attention. Step 3 is the cadence — quarterly, written, board-shareable. Without that rhythm, attention reverts to the next priority.',
    'ready-to-scale':
      'Leadership is fully behind it. Step 3 becomes succession planning — who carries this if the sponsor leaves? Documented support survives staff turnover.',
  },
  'security-posture': {
    'starting-point':
      'Security posture is the highest-cost dimension to fix late. Start at step 1 — observation, not policy. Resist the urge to write rules before you know what people are actually doing.',
    'early-stage':
      'You have a draft posture. Step 1 finds the gaps between draft and practice. Step 3 turns the gaps into a sequenced remediation plan, not a wall of red flags.',
    'building-momentum':
      'Posture is real but uneven across departments. Step 1 audits the laggards; step 3 creates the cross-department review cadence.',
    'ready-to-scale':
      'Your posture is the peer benchmark. Step 3 turns it into shareable artifacts — vendor questionnaires, AUC templates — that travel to peer institutions and earn examiner respect.',
  },
  'training-infrastructure': {
    'starting-point':
      'Training has to outlive the trainer. Step 1 builds a 30-minute onboarding video, not a course. Step 3 makes it required reading, not optional.',
    'early-stage':
      'You have ad-hoc training. Step 1 turns it into a documented artifact someone other than you can run. Step 3 schedules it; otherwise it never happens.',
    'building-momentum':
      'Training cadence exists. Step 1 is the audit — who has not completed it? Step 3 closes the loop with a refresh cycle.',
    'ready-to-scale':
      'Training is institutional. Step 3 becomes the certification track — internal credentials that staff can put on their LinkedIn, which anchors retention.',
  },
  'builder-potential': {
    'starting-point':
      'Most institutions have one or two latent builders — staff who already automate things in Excel. Step 1 finds them. Step 3 protects their time so they can build something.',
    'early-stage':
      'You have identified your builders. Step 1 gives them one real problem; step 3 connects them to leadership so the builds become institutional, not personal.',
    'building-momentum':
      'Builders are productive. Step 1 audits what they have shipped; step 3 turns the best work into reusable templates for non-builders.',
    'ready-to-scale':
      'Builders are a known asset. Step 3 turns their work into a hiring/retention asset — show prospects what builders ship here.',
  },
};

/**
 * Returns the tier preface — when a dimension is provided, the body is
 * dimension-specific; otherwise falls back to the generic tier-keyed body.
 * The headline is always tier-keyed (4 strings, by design).
 */
export function getTierPreface(
  tierId: Tier['id'],
  dimension?: Dimension,
): TierPreface {
  const headline = TIER_PREFACES[tierId].headline;
  const body = dimension
    ? DIMENSION_TIER_BODIES[dimension][tierId]
    : TIER_PREFACES[tierId].body;
  return { headline, body };
}
