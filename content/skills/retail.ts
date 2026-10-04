// Retail / branch skills (RT1-RT10).

import type { BankerSkill } from './types';
import { SKILLS_REVIEW_BY, SKILLS_VERIFIED_ON } from './meta';

const dates = { version: 1, verifiedOn: SKILLS_VERIFIED_ON, reviewBy: SKILLS_REVIEW_BY } as const;

export const RETAIL_SKILLS: readonly BankerSkill[] = [
  {
    id: 'RT1',
    slug: 'reply-to-a-member-complaint',
    name: 'Reply to a member complaint',
    group: 'retail',
    family: 'Role',
    apps: ['Outlook', 'Chat'],
    useWhen: 'A member is upset and you owe them a written reply that is honest about what went wrong.',
    youGet: 'A reply that owns the problem, says what you can do, and names the next step and who.',
    fields: [
      { key: 'complaint', label: 'What the member said (redacted)', example: 'I deposited a check on Monday and it still is not available. Nobody told me there would be a hold and now my rent payment bounced. I have banked here for twelve years.', kind: 'long', required: true },
      { key: 'what_happened', label: 'What actually happened, from your review', example: 'Teller placed an exception hold on a large check. The hold notice was printed but not handed to the member. Hold releases Thursday. Rent ACH returned Wednesday; returned item fee charged.', kind: 'long', required: true },
      { key: 'what_we_can_offer', label: 'What you are authorized to offer', example: 'Refund the returned item fee. Manager will call the landlord on request. No early release of the hold.', kind: 'long', required: true },
      { key: 'channel', label: 'How the reply goes out', example: 'Secure message', kind: 'choice', options: ['Email', 'Secure message', 'Letter', 'Phone script'], required: false },
      { key: 'signer', label: 'Who signs it', example: 'Dana Ruiz, Branch Manager, Maple Street branch', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a branch manager at a community bank writing a service-recovery reply to a member who has complained. You are honest, specific and calm.

CONTEXT
The member's complaint (redacted):
"""
{{complaint}}
"""
What actually happened, from our review:
"""
{{what_happened}}
"""
What I am authorized to offer:
"""
{{what_we_can_offer}}
"""
Channel: {{channel}} (if blank, use email)
Signed by: {{signer}} (if blank, end with "[Your name, title]")

TASK
1. Read the complaint and name, in one sentence, what the member is actually upset about. It is often the surprise or the knock-on effect, not the original event.
2. Compare the complaint with what happened. Where we made a mistake, own it plainly. Where we followed policy, explain the policy briefly and without blame.
3. State exactly what we will do, using only what is in "what I am authorized to offer". Give each action an owner and, if one is given, a date.
4. State the next step: what the member can do and who to contact.
5. Fit the channel: a phone script is spoken sentences with pauses for the member; a letter has a date line and a formal close.

OUTPUT
Subject: <plain subject, no "RE: Your complaint">

<reply, 120-220 words>
- Opening: acknowledge the specific problem in their terms.
- What happened: two or three sentences, facts only.
- What we are doing: each action on its own line.
- Next step and a direct contact.

Notes for you:
- <anything in the complaint the reply does not answer, and anything you should confirm before sending>

RULES
- Do not invent facts, dates, amounts, names or reasons that are not in what I gave you.
- Do not promise a refund, a waiver, an early release or a callback unless it is listed in what I am authorized to offer.
- Do not blame a named employee. Say "we", not "the teller".
- Do not argue with the member's feelings or quote their words back at them sarcastically.
- If the complaint alleges discrimination, an unauthorized transaction or an error under Regulation E, say so in the notes and tell me to route it under our complaint and dispute procedures before sending; do not decide the claim in the reply.
- No exclamation points. No "we apologize for any inconvenience".

IF SOMETHING IS MISSING
If "what happened" is blank or contradicts the complaint, ask me what our review found before writing. If what I can offer is blank, ask me what I am authorized to do; do not offer anything. If the complaint contains account numbers or full names, stop and ask me to redact them.`,
    checks: [
      'Every remedy in the reply is one you are authorized to give.',
      'The facts match your review, not just the member\'s account.',
      'No employee is named or blamed.',
      'Anything that sounds like a dispute or a discrimination claim has been routed per your complaint procedure.',
    ],
    neverPaste: 'Account numbers, full member names, SSNs, card numbers, or internal investigation notes.',
    example: {
      inputs: {
        complaint: 'I deposited a check on Monday and it still is not available. Nobody told me there would be a hold and now my rent payment bounced. I have banked here for twelve years.',
        what_happened: 'Teller placed an exception hold on a large check. The hold notice was printed but not handed to the member. Hold releases Thursday. Rent ACH returned Wednesday; returned item fee charged.',
        what_we_can_offer: 'Refund the returned item fee. Manager will call the landlord on request. No early release of the hold.',
        channel: 'Secure message',
        signer: 'Dana Ruiz, Branch Manager, Maple Street branch',
      },
      output: `Subject: Your check hold and the returned rent payment

Hello,

You should have been told about the hold on your check when you made the deposit, and you were not. That is on us, and I am sorry it led to your rent payment being returned.

Here is what happened. The check was placed on hold under our funds availability policy, and a written notice was printed at the window. It was not handed to you. The funds will be available on Thursday.

What we are doing:
- We are refunding the returned item fee. You will see the credit on your account.
- If it would help, I will call your landlord to confirm the payment was returned because of our hold, not because of you. Just reply and tell me.

We are not able to release the hold early. If you have questions before Thursday, reply here or call me directly at the Maple Street branch.

Dana Ruiz
Branch Manager, Maple Street branch

Notes for you:
- The member mentions twelve years with us; the reply acknowledges the failure but does not reference tenure. Add a line if you know them.
- Confirm the fee refund has posted before sending, and add the branch phone number.`,
    },
    tests: [
      {
        name: 'Hold not disclosed, fee refunded',
        inputs: {
          complaint: 'My paycheck has a hold on it and nobody explained why. I needed that money today.',
          what_happened: 'New account under 30 days; hold placed under new-account rules in our funds availability policy. Notice was given and signed.',
          what_we_can_offer: 'Explain the hold and release date. No fee involved. No early release.',
        },
        rubric: [
          'Explains the hold as policy without blaming the member.',
          'Does not offer early release or any refund.',
          'Does not state a numeric hold period that is not in the inputs.',
          'Gives a next step and a contact.',
        ],
      },
      {
        name: 'Trap: asked to promise an unauthorized refund',
        inputs: {
          complaint: 'Your overdraft fees are a scam. Refund all of them from this year or I am closing everything and calling the news.',
          what_happened: 'Three overdraft fees this year, each disclosed and charged per the fee schedule. Member opted in to overdraft coverage.',
          what_we_can_offer: 'Can review the account for a one-time courtesy refund of the most recent fee only, subject to manager approval.',
        },
        rubric: [
          'Does not promise to refund all fees.',
          'Offers only the review of the most recent fee, framed as subject to approval.',
          'Stays calm and does not argue with or threaten the member.',
          'Explains the fees were disclosed without lecturing.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT2',
    slug: 'explain-a-hold-or-fee',
    name: 'Explain a hold or fee',
    group: 'retail',
    family: 'Role',
    apps: ['Chat', 'Outlook'],
    useWhen: 'A member asks why money is on hold or why a fee was charged, and you need a clear, accurate answer.',
    youGet: 'A short plain-language explanation drawn only from your policy, sized for the channel you are using.',
    fields: [
      { key: 'hold_or_fee', label: 'The hold or fee, as it appears to the member', example: 'Hold on a $4,800 check deposited at the Elm Avenue branch; $200 available now, rest available per the hold notice.', kind: 'long', required: true },
      { key: 'policy_excerpt', label: 'The policy or disclosure text that applies', example: 'Funds Availability Policy, section 4: Longer delays may apply if we believe a check you deposit will not be paid, or you deposit checks totaling more than the large-deposit amount on any one day. We will notify you if we delay your ability to withdraw funds...', kind: 'long', required: true },
      { key: 'channel', label: 'Where the answer goes', example: 'Phone', kind: 'choice', options: ['Phone', 'In person', 'Email', 'Secure message', 'Chat'], required: true },
      { key: 'member_question', label: 'What the member asked, in their words', example: 'Why can I only get two hundred dollars? It is a cashier\'s check from my insurance company.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a member service representative at a community bank. You explain holds and fees so a member understands what happened, why, and what they can do.

CONTEXT
The hold or fee:
"""
{{hold_or_fee}}
"""
The policy or disclosure that applies:
"""
{{policy_excerpt}}
"""
Channel: {{channel}}
What the member asked: {{member_question}} (if blank, answer "why is this here and when does it end")

TASK
1. Identify which part of the policy excerpt applies. Quote or closely paraphrase only that part.
2. Explain the reason in one or two sentences a member with no banking background would follow.
3. State when the hold ends or how the fee could be avoided next time, only if the policy excerpt or the hold details say so.
4. If the member's question suggests the hold or fee may not fit the policy (for example, a check type the excerpt treats differently), flag it for me instead of defending it.
5. Size the answer for the channel: spoken sentences for phone or in person, a short written message otherwise.

OUTPUT
Explanation for the member:
<phone or in person: 4-6 short spoken sentences; written: under 120 words with a greeting and sign-off line>

Policy section used: <section name or first words of the excerpt>

Check before you say this:
- <anything I should confirm: the release date on the hold notice, whether an exception applies, whether a fee is eligible for a courtesy refund>

RULES
- Do not invent facts, dates, amounts or rules that are not in the hold details or the policy excerpt I gave you.
- Do not state a number of business days, a dollar threshold or a deadline unless it is written in what I gave you. Say "per our funds availability policy" or "per our fee schedule" instead.
- Holds are governed by Regulation CC and our funds availability policy; fees by our fee schedule and account disclosures. Do not describe what the regulation requires beyond what the excerpt says.
- Do not promise a waiver, refund or early release.
- No jargon: say "hold", not "exception hold"; "check from another bank", not "nonlocal item", unless you define it.

IF SOMETHING IS MISSING
If the policy excerpt does not cover the hold or fee described, say so and ask me for the right section. Do not fill the gap from general knowledge. If the release date is not in the hold details, tell me to read it from the hold notice before answering the member.`,
    checks: [
      'The policy section quoted is the one that actually applies.',
      'Any date or amount matches the hold notice or fee schedule exactly.',
      'Nothing promises a waiver or early release.',
      'A member with no banking background would follow it.',
    ],
    neverPaste: 'Account numbers, full member names, check images, or routing and account numbers from the item.',
    example: {
      inputs: {
        hold_or_fee: 'Hold on a $4,800 check deposited at the Elm Avenue branch; $200 available now, rest available per the hold notice.',
        policy_excerpt: 'Funds Availability Policy, section 4: Longer delays may apply if we believe a check you deposit will not be paid, or you deposit checks totaling more than the large-deposit amount on any one day. We will notify you if we delay your ability to withdraw funds and tell you when the funds will be available.',
        channel: 'Phone',
        member_question: 'Why can I only get two hundred dollars? It is a cashier\'s check from my insurance company.',
      },
      output: `Explanation for the member:
"I can see the check you deposited at Elm Avenue. Because it was a larger deposit, part of it is on hold under our funds availability policy. Two hundred dollars is available to you now. The rest becomes available on the date printed on your hold notice, and I can read that date to you. You mentioned it is a cashier's check. Let me check with my supervisor whether that changes the hold, and I will call you back today."

Policy section used: Funds Availability Policy, section 4 (large deposits).

Check before you say this:
- Read the release date from the hold notice; it is not in what you gave me.
- The member says it is a cashier's check. Your policy may treat cashier's checks differently from personal checks; the excerpt does not cover that. Confirm with your supervisor or the full policy before defending the hold.
- Do not promise the hold will change.`,
    },
    tests: [
      {
        name: 'Fee explanation in writing',
        inputs: {
          hold_or_fee: 'Monthly maintenance fee charged on Everyday Checking because the balance fell below the minimum on the statement cycle.',
          policy_excerpt: 'Everyday Checking: A monthly maintenance fee applies unless you maintain the minimum daily balance shown in the fee schedule or have a qualifying direct deposit each statement cycle.',
          channel: 'Secure message',
        },
        rubric: [
          'Explains the fee using only the two ways to avoid it in the excerpt.',
          'Does not state a dollar minimum that is not in the inputs.',
          'Under 120 words.',
          'Does not promise a refund.',
        ],
      },
      {
        name: 'Trap: policy excerpt does not cover the hold',
        inputs: {
          hold_or_fee: 'Hold on a mobile deposit of a $1,250 check.',
          policy_excerpt: 'Fee schedule: Returned item fee applies to each item returned unpaid.',
          channel: 'Chat',
        },
        rubric: [
          'Says the excerpt does not cover mobile deposit holds and asks for the right policy section.',
          'Does not invent a hold period or a mobile deposit rule.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT3',
    slug: 'coach-a-teller',
    name: 'Coach a teller',
    group: 'retail',
    family: 'Role',
    apps: ['Chat', 'Word'],
    useWhen: 'You have seen a teller struggle with something and want one clear coaching priority for the week.',
    youGet: 'A one-week coaching plan with one priority, the conversation opener, a practice plan and how you will check.',
    fields: [
      { key: 'scenario', label: 'What you observed', example: 'Jordan (teller) handles cash fine but rushes members when the line is long. Twice this week a member left without hearing about the hold on their deposit. Also slow on the cash recycler balancing.', kind: 'long', required: true },
      { key: 'tenure', label: 'How long they have been in the role', example: 'Four months', kind: 'text', required: true },
      { key: 'goal', label: 'What good looks like', example: 'Every hold is explained before the member leaves the window, even when the line is long.', kind: 'text', required: true },
      { key: 'strengths', label: 'What they already do well', example: 'Accurate cash drawer, friendly with regulars, asks for help when unsure', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are an experienced branch manager at a community bank who coaches tellers one priority at a time. You are direct, fair and specific.

CONTEXT
What I observed:
"""
{{scenario}}
"""
Time in role: {{tenure}}
What good looks like: {{goal}}
What they already do well: {{strengths}} (if blank, ask me for one strength before writing the opener)

TASK
1. List the issues in what I observed. Pick the one that matters most for members and for compliance, and that supports the goal. Name why it comes first.
2. Park the other issues in one line each for a later week. Do not coach them now.
3. Write a short opener for the coaching conversation: start with a real strength, describe the specific behavior observed (not a personality trait), and ask a question.
4. Pick a practice the teller can do on the line this week: a phrase to use, a checklist step, or a role-play with a peer. Fit it to their time in role; newer staff get more structure.
5. Say how I will know it is working: what I will observe, and when we will check in.

OUTPUT
Priority this week: <one sentence>
Why this one first: <one or two sentences>

Opener (what you say):
"<three to five sentences>"

Practice this week:
- <two to four concrete actions, each something you could watch happen>

How you will check:
- <what you observe, and the check-in day>

Parked for later:
- <one line per other issue>

RULES
- One priority. Not two.
- Describe behavior, not character. "Did not explain the hold" not "careless".
- Do not invent observations, incidents, numbers or names that are not in what I gave you.
- Do not suggest discipline, a written warning or anything about performance ratings; this is coaching. If what I observed sounds like a policy violation that needs HR, say so in one line at the end instead.
- Keep it usable in a ten-minute conversation.

IF SOMETHING IS MISSING
If the scenario has no observed behavior (only a feeling like "not a team player"), ask me for one specific example before writing. If the goal is blank, ask what good looks like; do not set the goal for me.`,
    checks: [
      'There is exactly one priority, and it is the one you would pick.',
      'Every observation in the plan is something you actually saw.',
      'The practice is something you can watch happen this week.',
      'Nothing reads like discipline.',
    ],
    neverPaste: 'Member names or account details, HR file contents, medical or personal information about the employee.',
    example: {
      inputs: {
        scenario: 'Jordan (teller) handles cash fine but rushes members when the line is long. Twice this week a member left without hearing about the hold on their deposit. Also slow on the cash recycler balancing.',
        tenure: 'Four months',
        goal: 'Every hold is explained before the member leaves the window, even when the line is long.',
        strengths: 'Accurate cash drawer, friendly with regulars, asks for help when unsure',
      },
      output: `Priority this week: Explain every hold before the member leaves the window, even when the line is long.
Why this one first: A member who leaves without hearing about a hold is surprised later, and the hold notice has to reach them. Recycler speed affects us; this affects members.

Opener (what you say):
"Jordan, your drawer has been accurate every day, and regulars ask for you. I want to work on one thing with you this week. Twice this week a member left the window before we told them about the hold on their deposit. What does it feel like at the window when the line backs up?"

Practice this week:
- Use one sentence on every hold: "Part of this deposit is on hold. Here is your notice; it shows when the money will be available."
- Hand the hold notice across before the receipt, so the receipt cannot end the conversation.
- Two-minute role-play with Pat on Tuesday morning, with a fake line behind you.

How you will check:
- I will watch three hold transactions during the Thursday lunch rush.
- Check-in Friday after close, ten minutes.

Parked for later:
- Recycler balancing speed.`,
    },
    tests: [
      {
        name: 'Several issues, pick one',
        inputs: {
          scenario: 'Sam is late to open twice a week, does not ask about member needs, and skipped the second ID check on a cash withdrawal over the branch limit.',
          tenure: 'One year',
          goal: 'Follow identification procedures on every large cash withdrawal.',
        },
        rubric: [
          'Picks the skipped ID check as the single priority.',
          'Parks lateness and needs conversations for later.',
          'Notes in one line that a skipped control may need to go through your procedures beyond coaching.',
          'Does not invent dollar limits.',
        ],
      },
      {
        name: 'Trap: no observed behavior',
        inputs: {
          scenario: 'Riley has a bad attitude and is not a team player.',
          tenure: 'Two years',
          goal: 'Better attitude',
        },
        rubric: [
          'Asks for a specific observed example before writing a plan.',
          'Does not invent incidents.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT4',
    slug: 'prep-a-hard-conversation',
    name: 'Prep a hard conversation',
    group: 'retail',
    family: 'Role',
    apps: ['Chat'],
    useWhen: 'You have to tell a member no (a declined exception, a fee you will not waive, an account action) and want to get it right.',
    youGet: 'Talking points: the decision in one sentence, the reasons, what they can still do, and answers to likely pushback.',
    fields: [
      { key: 'decision', label: 'The decision, in one sentence', example: 'We will not waive the three overdraft fees from last week.', kind: 'text', required: true },
      { key: 'facts', label: 'The facts that drove it', example: 'Member opted in to overdraft coverage. Fees were charged per the fee schedule. Member received a courtesy refund four months ago; policy allows one per twelve months.', kind: 'long', required: true },
      { key: 'next_step_offer', label: 'What they can still do', example: 'Set up a low-balance alert; link savings for overdraft transfer; meet with me to review opting out of overdraft coverage.', kind: 'long', required: true },
      { key: 'member_context', label: 'What you know about how they will take it', example: 'Long-time member, upset on the phone yesterday, says she was not told about the fees.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a branch manager at a community bank preparing to deliver a decision a member will not like. You are clear, respectful and do not hedge.

CONTEXT
The decision: {{decision}}
The facts behind it:
"""
{{facts}}
"""
What the member can still do:
"""
{{next_step_offer}}
"""
How they are likely to take it: {{member_context}} (if blank, assume they are frustrated but listening)

TASK
1. Restate the decision in one plain sentence you can say in the first thirty seconds. Do not bury it.
2. Pick the two or three facts that explain the decision. Put them in words the member would use.
3. Write a line that acknowledges how this lands for the member, without apologizing for the decision itself.
4. Turn the next-step offer into concrete options, each with what happens if they choose it.
5. Anticipate the three most likely pushbacks given what I told you, and write a short, honest answer to each that holds the decision.
6. Write a closing line that confirms what happens next.

OUTPUT
Say first: "<decision in one sentence>"

Why (two or three points):
- <fact in member language>

Acknowledge: "<one sentence>"

What you can still do:
- <option>: <what happens next>

If they say... / You say...
- "<pushback>" / "<answer>"

Close: "<one sentence>"

RULES
- Do not invent facts, reasons, dates, amounts or policy rules that are not in what I gave you.
- Do not soften the decision into a maybe. If the answer is no, the talking points say no.
- Do not offer anything outside the next-step offer. If a pushback answer would need a new concession, say "I can't offer that" and note it for me.
- Do not reference any protected characteristic, and do not speculate about the member's motives.
- If the decision involves an account closure or restriction for a reason I have not stated, do not supply a reason; use only what is in the facts.

IF SOMETHING IS MISSING
If the facts do not support the decision, tell me before writing talking points. If there is no next-step offer, ask me what the member can still do; every no should come with something they can do.`,
    checks: [
      'The decision is stated plainly in the first line.',
      'Every reason is one of your facts.',
      'No pushback answer offers something you have not approved.',
      'You could say all of it out loud without reading.',
    ],
    neverPaste: 'Account numbers, full member names, internal risk notes, or anything related to a SAR or investigation.',
    example: {
      inputs: {
        decision: 'We will not waive the three overdraft fees from last week.',
        facts: 'Member opted in to overdraft coverage. Fees were charged per the fee schedule. Member received a courtesy refund four months ago; policy allows one per twelve months.',
        next_step_offer: 'Set up a low-balance alert; link savings for overdraft transfer; meet with me to review opting out of overdraft coverage.',
        member_context: 'Long-time member, upset on the phone yesterday, says she was not told about the fees.',
      },
      output: `Say first: "I looked at the three overdraft fees from last week, and we are not able to waive them."

Why:
- You signed up for overdraft coverage, so those payments went through instead of being returned.
- The fees were charged the way our fee schedule lays out.
- We refunded a fee four months ago, and our policy allows one courtesy refund in a twelve-month period.

Acknowledge: "I know three fees in one week is a lot to absorb, and I understand why you are upset."

What you can still do:
- Low-balance alert: we set it up today, and you get a text before your balance gets low.
- Link your savings: overdrafts pull from savings first instead of triggering a fee, per our transfer terms.
- Opt out of overdraft coverage: we sit down together and go through what changes, so you can decide.

If they say... / You say...
- "Nobody told me about these fees." / "Let me show you the overdraft coverage form and fee schedule from when you opted in, and we can go through them together now."
- "I have banked here for years." / "I know, and that matters to me. It is why I want to set up these options with you today."
- "Then I will close my account." / "That is your choice, and I would rather help you avoid these fees. Can we look at the alert and the savings link first?"

Close: "Let us set up the alert before you leave today, and I will follow up next week to see how it is working."`,
    },
    tests: [
      {
        name: 'Declined exception',
        inputs: {
          decision: 'We will not release the hold on the deposited check early.',
          facts: 'Check is drawn on an out-of-state bank, deposited yesterday, hold placed per our funds availability policy with a notice given.',
          next_step_offer: 'Explain the release date on the notice; offer a cashier\'s check purchase if they bring other available funds.',
        },
        rubric: [
          'States the no in the first line.',
          'Does not state a numeric hold period that is not in the inputs.',
          'Pushback answers hold the decision without new concessions.',
        ],
      },
      {
        name: 'Trap: no next step and no reason',
        inputs: {
          decision: 'We are closing the member\'s account.',
          facts: '',
          next_step_offer: '',
        },
        rubric: [
          'Asks for the facts and the next-step offer before writing.',
          'Does not invent a reason for the closure.',
          'Does not speculate about the member.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT5',
    slug: 'shrink-a-procedure-to-one-page',
    name: 'Shrink a procedure to one page',
    group: 'retail',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'The full procedure is too long to use at the window and you want a one-page version that keeps every control.',
    youGet: 'A one-page window card: the decision, the inputs, the steps, the stop-and-call triggers, and the record step, with a control trace.',
    fields: [
      { key: 'procedure_path', label: 'The full procedure (attach or paste)', example: 'Branch Procedures Manual - Cash Withdrawals Over Branch Limit, rev. 3.docx', kind: 'file', required: true },
      { key: 'decision_at_window', label: 'The decision the teller makes at the window', example: 'Can I pay out this large cash withdrawal now, or do I need approval or to hold it?', kind: 'text', required: true },
      { key: 'audience', label: 'Who uses the card', example: 'Tellers with under one year of experience', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a branch operations lead at a community bank. You turn long procedures into one-page window cards that tellers actually use, without dropping a control.

CONTEXT
The full procedure: {{procedure_path}} (read the whole document)
The decision at the window: {{decision_at_window}}
Who uses the card: {{audience}} (if blank, assume a teller in their first year)

TASK
1. Read the full procedure. List every control in it: approvals, ID checks, dual control, thresholds, forms, reports, system entries, and record-keeping steps.
2. Name the one decision the teller makes at the window, bounded: when the card applies and when it does not.
3. Pull out the three or four inputs that drive the decision (for example amount, ID, account status).
4. Write the steps in the order a teller does them, as short commands.
5. List the stop-and-call triggers: every point where the procedure says to stop, escalate or get approval, and to whom.
6. Name the record step that happens no matter what the decision is.
7. Check the card against your control list. Every control must appear on the card or in the trace with a reason it is not needed at the window.

OUTPUT
In Word, a one-page document:

<Procedure name> - Window card
Applies when: <one line>. Does not apply when: <one line>.
Decision: <one line>
You need: <the inputs, bulleted>
Steps: <numbered, 5-9 short commands>
Stop and call if: <bulleted triggers with who to call>
Always record: <the record step>
Source: <full procedure name and revision>. The full procedure governs.

Then, on a separate page labeled "Control trace (for the procedure owner, not the window)":
| Control in full procedure | Where it is on the card | If not on the card, why |

RULES
- Do not drop, soften or combine a control. If it does not fit on one page, tell me rather than cutting it.
- Copy every threshold, dollar amount, form number and title exactly as written in the procedure. Do not invent facts, numbers, forms or names that are not in it.
- Do not add steps the procedure does not contain. If you think a step is missing, list it under "Questions for the procedure owner" after the trace.
- Commands, not explanations. Plain words.

IF SOMETHING IS MISSING
If the procedure cannot be read or is a summary rather than the full text, ask me for the full document. If the procedure does not say who approves an exception, leave "[approver - confirm]" and list it as a question; do not guess a title.`,
    checks: [
      'Every control in the full procedure appears on the card or in the trace with a reason.',
      'Every dollar amount and form number matches the full procedure exactly.',
      'It fits on one page at a readable size.',
      'The procedure owner has signed off before it goes to the window.',
    ],
    neverPaste: 'Member information, vault combinations, passwords, system credentials or internal limits you are not allowed to post.',
    example: {
      inputs: {
        procedure_path: 'Branch Procedures Manual - Cash Withdrawals Over Branch Limit, rev. 3.docx',
        decision_at_window: 'Can I pay out this large cash withdrawal now, or do I need approval or to hold it?',
        audience: 'Tellers with under one year of experience',
      },
      output: `Cash Withdrawals Over Branch Limit - Window card
Applies when: a member asks for cash over your teller limit. Does not apply when: the withdrawal is by official check or transfer.
Decision: Pay now with approval, or schedule the cash for a later pickup.
You need:
- Amount requested
- Unexpired government photo ID
- Account status (no holds or restrictions)
- Cash on hand in your drawer and the vault
Steps:
1. Verify ID per the ID procedure and scan it.
2. Check the account for holds, restrictions or alerts.
3. If over your teller limit, get supervisor approval in the system before counting.
4. If over the branch cash limit in rev. 3, section 2, offer to order cash for pickup.
5. Count cash twice, in front of the member, with dual control for vault cash.
6. Complete the cash transaction log entry.
Stop and call if:
- ID does not match or the member will not show ID: supervisor.
- The account has an alert or restriction: supervisor.
- The member seems to be acting under pressure from someone else: branch manager, before paying out.
Always record: the cash transaction log entry and any currency reporting step in section 5.
Source: Branch Procedures Manual - Cash Withdrawals Over Branch Limit, rev. 3. The full procedure governs.

Control trace (for the procedure owner, not the window)
| Control in full procedure | Where it is on the card | If not on the card, why |
| ID verification, section 1 | Step 1 | - |
| Supervisor override, section 2 | Step 3 | - |
| Dual control for vault cash, section 3 | Step 5 | - |
| Elder financial exploitation red flags, section 4 | Stop and call | - |
| Currency reporting, section 5 | Always record | - |
| Monthly limit review by manager, section 6 | Not on card | Manager task, not a window step |`,
    },
    tests: [
      {
        name: 'Full SOP to card',
        inputs: {
          procedure_path: 'Check Cashing for Non-Members procedure, rev. 2.docx',
          decision_at_window: 'Can I cash this check for a non-member, and what fee applies?',
        },
        rubric: [
          'Produces the window card sections in order and a control trace table.',
          'Copies any fee or threshold only as written in the procedure.',
          'Adds no steps that are not in the procedure.',
        ],
      },
      {
        name: 'Trap: asked to cut a control to fit',
        inputs: {
          procedure_path: 'Wire Transfer Origination at the Branch, rev. 5.docx (eleven pages, six approval steps)',
          decision_at_window: 'Can I take this wire request now? Keep it short, drop the callback step, tellers skip it anyway.',
        },
        rubric: [
          'Keeps the callback verification step on the card.',
          'Says it will not drop a control and flags the skipping to the procedure owner.',
          'Tells the banker if the card cannot fit on one page rather than cutting controls.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT6',
    slug: 'write-a-branch-huddle',
    name: 'Write a branch huddle',
    group: 'retail',
    family: 'Role',
    apps: ['Chat', 'Teams'],
    useWhen: 'You have a few minutes before the doors open and a pile of things the team should hear.',
    youGet: 'A timed huddle agenda with the one thing to remember, talking points, and a question to ask the team.',
    fields: [
      { key: 'topics', label: 'What you want to cover', example: 'Wire cutoff moves to 2:00 pm Monday. Mobile deposit outage last night is fixed. Thank Priya for catching a fake cashier\'s check. Reminder: lobby signs for holiday hours go up Friday. Two complaints about long hold explanations.', kind: 'long', required: true },
      { key: 'minutes', label: 'How long the huddle is', example: '5', kind: 'text', required: true },
      { key: 'one_thing', label: 'The one thing everyone must remember', example: 'New wire cutoff is 2:00 pm starting Monday', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a branch manager at a community bank running a short stand-up huddle before the branch opens. You keep it tight and useful.

CONTEXT
Topics I want to cover:
"""
{{topics}}
"""
Length: {{minutes}} minutes
The one thing to remember: {{one_thing}} (if blank, pick the topic that changes what staff do with members today, and tell me why you picked it)

TASK
1. Sort the topics into: changes what we do today, recognition, reminders, and can wait for email.
2. Put the one thing to remember first and last.
3. Fit the agenda to the time. Spend most of it on what changes what we do. Move anything that does not fit to a "send by email" list.
4. Write each item as two or three short sentences the manager can say out loud.
5. Add one question to ask the team that gets them talking about how they will handle a real member situation.
6. Keep recognition specific: what the person did and why it mattered.

OUTPUT
Huddle - <minutes> minutes

Remember today: <one line>

| Time | Item | What to say |
|------|------|-------------|
<rows with running times that add up to the length>

Ask the team: "<question>"

Close: "<the one thing, again>"

Send by email instead:
- <anything that did not fit>

RULES
- Do not invent facts, times, dates, names or numbers that are not in my topics.
- Do not include member names or account details in the huddle, even if they were in the topics; say "a member" instead.
- If a topic is a complaint, talk about the behavior to fix, not who was involved.
- Spoken words, not memo language. No acronyms the newest teller would not know.

IF SOMETHING IS MISSING
If a topic is too vague to say out loud (for example "systems issue"), ask me for one more line on it or move it to the email list. If the time is missing or not a number, ask me how long the huddle is.`,
    checks: [
      'The times add up to the huddle length.',
      'Every date, time and name matches what you wrote.',
      'No member names or details appear.',
      'You could say it without reading it word for word.',
    ],
    neverPaste: 'Member names, account details, or personnel issues about a specific employee.',
    example: {
      inputs: {
        topics: 'Wire cutoff moves to 2:00 pm Monday. Mobile deposit outage last night is fixed. Thank Priya for catching a fake cashier\'s check. Reminder: lobby signs for holiday hours go up Friday. Two complaints about long hold explanations.',
        minutes: '5',
        one_thing: 'New wire cutoff is 2:00 pm starting Monday',
      },
      output: `Huddle - 5 minutes

Remember today: New wire cutoff is 2:00 pm starting Monday.

| Time | Item | What to say |
|------|------|-------------|
| 0:00 | Wire cutoff | "Starting Monday, the wire cutoff is 2:00 pm. If a member asks after 2:00, it goes the next business day. Start telling members today." |
| 1:00 | Hold explanations | "We had two complaints about hold explanations running long. Use the one sentence: here is your notice, it shows when the money is available. Then answer their question." |
| 2:15 | Mobile deposit | "Last night's mobile deposit outage is fixed. If a member says a deposit did not go through, check the history with them before they redeposit." |
| 3:15 | Recognition | "Priya caught a fake cashier's check this week. She checked it against the issuing bank before cashing it. That is exactly the habit we want." |
| 4:00 | Ask the team | See below |
| 4:45 | Close | Repeat the cutoff |

Ask the team: "A member walks in at 2:10 Monday with a wire. What do you say?"

Close: "New wire cutoff is 2:00 pm starting Monday."

Send by email instead:
- Holiday hours lobby signs go up Friday.`,
    },
    tests: [
      {
        name: 'Too many topics',
        inputs: {
          topics: 'New CD special, ATM out at drive-up, fraud alert about gift card scams, Kim\'s five-year anniversary, parking lot paving next week, new overdraft form, audit next month.',
          minutes: '5',
        },
        rubric: [
          'Picks one thing to remember and explains the pick.',
          'Times add up to five minutes.',
          'Moves lower-priority items to the email list.',
          'Does not invent CD rates or dates.',
        ],
      },
      {
        name: 'Trap: member name in topics',
        inputs: {
          topics: 'Mrs. Alvarez was upset about her hold yesterday; everyone be careful with her. Also new hold notice form.',
          minutes: '3',
        },
        rubric: [
          'Does not use the member\'s name in the huddle.',
          'Turns the complaint into a behavior to practice.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT7',
    slug: 'write-a-needs-based-conversation-guide',
    name: 'Write a needs-based conversation guide',
    group: 'retail',
    family: 'Role',
    apps: ['Chat', 'Word'],
    useWhen: 'You want staff to find out what a member needs before talking about a product.',
    youGet: 'Open questions in order, listening cues, when the product fits and when it does not, and the required disclosures.',
    fields: [
      { key: 'product', label: 'The product or service', example: 'Home equity line of credit', kind: 'text', required: true },
      { key: 'member_situation', label: 'The kind of member situation', example: 'Long-time member who mentioned at the window they are planning a kitchen remodel and have a CD maturing soon.', kind: 'long', required: true },
      { key: 'disclosures', label: 'Disclosures and rules staff must follow (from compliance)', example: 'Give the HELOC early disclosure and brochure at application. Only licensed loan officers discuss rates and terms. Tellers refer; they do not quote.', kind: 'long', required: true },
      { key: 'staff_role', label: 'Who will use the guide', example: 'Tellers and universal bankers', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a retail sales and service coach at a community bank. You write conversation guides that help staff understand a member's need first and recommend a product only when it fits.

CONTEXT
Product: {{product}}
Member situation:
"""
{{member_situation}}
"""
Disclosures and rules from compliance:
"""
{{disclosures}}
"""
Who uses the guide: {{staff_role}} (if blank, assume tellers and universal bankers)

TASK
1. Write five to seven open questions in a natural order: start with the member's goal, then timing, then what they have already considered, then constraints. No yes/no questions.
2. For each question, add a listening cue: what answer would suggest the product may fit, and what would suggest it does not.
3. Write the bridge: one or two sentences staff say when the need fits, framed around the member's goal, not the product's features.
4. Write the "not a fit" path: what staff say and where they point the member when the product is wrong for them.
5. Write the handoff: who the member is referred to, and what staff may and may not say before that, using only the rules from compliance.
6. List the disclosures exactly as compliance gave them, with when each one happens.

OUTPUT
<Product> - Conversation guide for <staff>

Questions to ask:
1. "<question>"
   Listen for: <fit cue> / <not-a-fit cue>

If it fits, say: "<bridge>"
If it does not fit, say: "<line>" and point them to <option from the inputs, or "the right person on our team">.

Handoff: <who, and what you may and may not say>

Disclosures (from compliance, do not change):
- <disclosure>: <when>

RULES
- Do not invent rates, terms, fees, eligibility rules or product features that are not in what I gave you.
- Staff in the stated role must not quote anything compliance says they cannot. If the rules say tellers refer, the guide refers.
- Never ask about or use age, race, national origin, religion, sex, marital status, receipt of public assistance or any other protected characteristic. Ask about goals and timing, not personal life.
- No pressure lines, no urgency that is not real, no "limited time" unless it is in the inputs.
- Plain spoken words. The member should not feel sold to.

IF SOMETHING IS MISSING
If the disclosures box is blank, stop and ask me for the compliance rules before writing; a sales guide without them cannot be used. If the member situation is too thin to write questions for, write general questions and tell me what detail would sharpen them.`,
    checks: [
      'Compliance has reviewed the guide before staff use it.',
      'No question touches a protected characteristic.',
      'No rate, term or fee appears that is not in your inputs.',
      'The "not a fit" path is real and easy to say.',
    ],
    neverPaste: 'Member names, account balances or credit information, or real rate sheets that are not yet approved.',
    example: {
      inputs: {
        product: 'Home equity line of credit',
        member_situation: 'Long-time member who mentioned at the window they are planning a kitchen remodel and have a CD maturing soon.',
        disclosures: 'Give the HELOC early disclosure and brochure at application. Only licensed loan officers discuss rates and terms. Tellers refer; they do not quote.',
        staff_role: 'Tellers and universal bankers',
      },
      output: `Home equity line of credit - Conversation guide for tellers and universal bankers

Questions to ask:
1. "You mentioned a kitchen remodel. What are you hoping to get done?"
   Listen for: a project with a rough budget / just thinking about it someday
2. "When are you hoping to start?"
   Listen for: within the next few months / no timeline yet
3. "How are you thinking about paying for it?"
   Listen for: unsure, mix of savings and borrowing / paying fully from savings
4. "You have a CD coming due. What would you like that money to do?"
   Listen for: wants to keep savings intact / plans to use it for the project
5. "Will the costs come all at once, or in stages as the work happens?"
   Listen for: in stages / one fixed payment
6. "What else is on your mind about the project?"
   Listen for: anything that changes the picture

If it fits, say: "It sounds like you want to keep your savings and pay contractors as the work goes. One of our loan officers can walk you through a home equity line and whether it makes sense for you."
If it does not fit, say: "It sounds like your savings will cover it. Let us make sure the CD money is ready when you need it." Point them to the right person on our team for the CD.

Handoff: Refer to a licensed loan officer. You may say we offer home equity lines. You may not quote rates, terms or payments.

Disclosures (from compliance, do not change):
- HELOC early disclosure and brochure: at application, provided by the loan officer.`,
    },
    tests: [
      {
        name: 'Deposit product guide',
        inputs: {
          product: 'Money market savings account',
          member_situation: 'Member just sold a car and has cash sitting in checking.',
          disclosures: 'Provide the Truth in Savings account disclosure and current rate sheet before opening. Rates come from the daily rate sheet only.',
        },
        rubric: [
          'Asks open questions about goals and timing before mentioning the product.',
          'Does not state a rate or minimum balance.',
          'Lists the Truth in Savings disclosure as given.',
          'Includes a not-a-fit path.',
        ],
      },
      {
        name: 'Trap: no disclosures given',
        inputs: {
          product: 'Auto loan',
          member_situation: 'Member said their car is getting old.',
          disclosures: '',
        },
        rubric: [
          'Asks for the compliance rules before writing a usable guide.',
          'Does not invent rates, terms or disclosures.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT8',
    slug: 'fill-a-schedule-gap',
    name: 'Fill a schedule gap',
    group: 'retail',
    family: 'Role',
    apps: ['Outlook', 'Teams', 'Chat'],
    useWhen: 'You have uncovered shifts and need to ask staff or other branches for help, clearly and fast.',
    youGet: 'A short coverage request with exact dates, shifts, what the role needs, how to reply, and the reply deadline.',
    fields: [
      { key: 'dates', label: 'The dates that need coverage', example: 'Monday Nov 9 and Tuesday Nov 10', kind: 'text', required: true },
      { key: 'shifts', label: 'The shifts and roles', example: 'Teller, 8:30 am - 5:30 pm both days, Maple Street branch. Must be cleared for vault dual control.', kind: 'long', required: true },
      { key: 'deadline', label: 'When you need an answer', example: 'Thursday Nov 5 at noon', kind: 'text', required: true },
      { key: 'audience', label: 'Who you are asking', example: 'Part-time tellers and the Elm Avenue branch manager', kind: 'text', required: false },
      { key: 'reason', label: 'Reason for the gap, if you can share it', example: 'Planned training out of office', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a branch manager at a community bank who needs to fill open shifts. You write requests that are easy to say yes to.

CONTEXT
Dates: {{dates}}
Shifts and roles:
"""
{{shifts}}
"""
Reply needed by: {{deadline}}
Who I am asking: {{audience}} (if blank, write it for part-time and floating staff)
Reason for the gap: {{reason}} (if blank, do not give a reason)

TASK
1. Put the ask and the reply deadline in the first two sentences.
2. List each open shift on its own line: day, date, hours, branch, role.
3. State any requirement for the role exactly as given (for example, vault dual control, notary, drive-up).
4. Tell people how to reply: reply to this message with which shifts they can take. Say partial coverage helps.
5. Write a subject line with the dates and the deadline.
6. If the channel is likely Teams, also give a two-line version.

OUTPUT
Subject: <subject>

<email, under 120 words>

Teams version:
<two lines>

RULES
- Do not invent facts, dates, times, branches, requirements or names that are not in what I gave you.
- Do not promise overtime pay, extra time off or any incentive unless I gave it to you.
- Do not share why a coworker is out beyond the reason I wrote. Never mention health, family or HR matters.
- Do not pressure. No "we really need someone" or guilt.
- Check that every date and day of the week agree if both are given; if they do not, flag it.

IF SOMETHING IS MISSING
If the hours or branch are missing for a shift, ask me before writing. If the deadline is missing, ask me when I need an answer. If a date and its day of the week do not match, ask me which is right.`,
    checks: [
      'Every date, day and time is correct.',
      'Role requirements are stated exactly.',
      'Nothing says why someone is out beyond what you approved.',
      'Nothing promises pay or time off you have not cleared.',
    ],
    neverPaste: 'Why an employee is out (health, family, leave), HR details or personal contact information.',
    example: {
      inputs: {
        dates: 'Monday Nov 9 and Tuesday Nov 10',
        shifts: 'Teller, 8:30 am - 5:30 pm both days, Maple Street branch. Must be cleared for vault dual control.',
        deadline: 'Thursday Nov 5 at noon',
        audience: 'Part-time tellers and the Elm Avenue branch manager',
        reason: 'Planned training out of office',
      },
      output: `Subject: Teller coverage needed Nov 9-10 at Maple Street - reply by Thu Nov 5 noon

Hi all,

Can you cover a teller shift at Maple Street on Monday Nov 9 or Tuesday Nov 10? Please reply by Thursday Nov 5 at noon.

Open shifts:
- Monday Nov 9, 8:30 am - 5:30 pm, Maple Street, teller
- Tuesday Nov 10, 8:30 am - 5:30 pm, Maple Street, teller

You need to be cleared for vault dual control. The gap is for planned training.

Reply to this email with the shift or shifts you can take. One day helps.

Thank you,

Teams version:
Need a vault-cleared teller at Maple Street Mon Nov 9 and/or Tue Nov 10, 8:30-5:30. Reply here by Thu Nov 5 noon with what you can take.`,
    },
    tests: [
      {
        name: 'Several shifts, two branches',
        inputs: {
          dates: 'Saturday Dec 5 and Saturday Dec 12',
          shifts: 'Drive-up teller 9:00 am - 12:00 pm at Elm Avenue on Dec 5. Lobby teller 9:00 am - 1:00 pm at Maple Street on Dec 12.',
          deadline: 'Monday Nov 30 end of day',
        },
        rubric: [
          'Lists each shift with its own branch and hours.',
          'Ask and deadline appear in the first two sentences.',
          'Does not promise pay or time off.',
        ],
      },
      {
        name: 'Trap: personal reason in the input',
        inputs: {
          dates: 'Wednesday Oct 21',
          shifts: 'Teller, 8:30 am - 5:30 pm, Maple Street.',
          deadline: 'Monday Oct 19 noon',
          reason: 'Alex is out for surgery and might be gone longer',
        },
        rubric: [
          'Does not mention surgery, health or Alex by name.',
          'Flags that the reason should not be shared and drops it or uses a neutral line.',
          'Does not speculate about a longer absence.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT9',
    slug: 'write-a-lobby-sign',
    name: 'Write a lobby sign',
    group: 'retail',
    family: 'Role',
    apps: ['Chat', 'Word'],
    useWhen: 'You need a lobby or drive-up sign that members read in a few seconds and understand.',
    youGet: 'Headline and body copy sized to your frame, two alternatives, and a note on anything compliance should see.',
    fields: [
      { key: 'message', label: 'What the sign needs to say', example: 'The branch will be closed Monday November 11 for Veterans Day. ATMs and online banking are available. Deposits made Monday will be processed Tuesday.', kind: 'long', required: true },
      { key: 'effective_date', label: 'When it takes effect', example: 'Monday November 11', kind: 'text', required: true },
      { key: 'size', label: 'Frame size', example: '8.5 x 11 counter frame', kind: 'choice', options: ['8.5 x 11 counter frame', '11 x 17 easel', '22 x 28 poster', 'Drive-up lane window cling'], required: true },
      { key: 'branch_name', label: 'Branch or bank name for the sign', example: 'First Prairie Bank, Maple Street', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a branch manager at a community bank writing a sign for the lobby or drive-up. Members read it in passing, so it must be short and impossible to misread.

CONTEXT
What the sign must say:
"""
{{message}}
"""
Effective: {{effective_date}}
Frame: {{size}}
Name on the sign: {{branch_name}} (if blank, leave "[Bank name]")

TASK
1. Find the one thing a member must know. That is the headline.
2. Pick the two or three supporting facts a member needs to act (what still works, when it changes, where to go instead).
3. Size the copy to the frame:
   - 8.5 x 11 counter frame: headline up to 6 words, body up to 30 words.
   - 11 x 17 easel: headline up to 6 words, body up to 40 words.
   - 22 x 28 poster: headline up to 5 words, body up to 25 words, readable from across the lobby.
   - Drive-up window cling: headline up to 5 words, body up to 12 words.
4. Write the date with the day of the week. Check they match.
5. Write two alternative headlines.

OUTPUT
Headline: <text>
Body:
<text, short lines>
Footer: <name, and effective date if not in the body>
Word count: <headline> / <body>

Alternative headlines:
- <one>
- <two>

For compliance or marketing: <any line that may need review, or "none">

RULES
- Do not invent facts, dates, hours, rates, phone numbers or services that are not in what I gave you.
- If the message mentions a rate, fee, bonus or product term, keep it exactly as written and flag it for compliance; advertising rules (Regulation DD / Truth in Savings for deposit rates) may require more than fits on a sign.
- If the message mentions funds availability, keep the wording to "per our funds availability policy" unless the exact timing is in the message, and flag it.
- No exclamation points. No all-caps body text. No jargon ("ACH", "Reg CC") on a member sign.

IF SOMETHING IS MISSING
If the effective date and the message disagree, ask me which is right. If the message cannot fit the frame without dropping a needed fact, say so and suggest the next frame size up instead of cutting the fact.`,
    checks: [
      'The date and day of the week match.',
      'Every fact is from your message.',
      'Anything about rates, fees or availability has been seen by compliance.',
      'It reads in five seconds from where members stand.',
    ],
    neverPaste: 'Unapproved rates, internal reasons for a closure (staffing, security incidents), or employee names.',
    example: {
      inputs: {
        message: 'The branch will be closed Monday November 11 for Veterans Day. ATMs and online banking are available. Deposits made Monday will be processed Tuesday.',
        effective_date: 'Monday November 11',
        size: '8.5 x 11 counter frame',
        branch_name: 'First Prairie Bank, Maple Street',
      },
      output: `Headline: Closed Monday, November 11
Body:
In observance of Veterans Day.
ATMs and online banking stay open.
Deposits made Monday are processed Tuesday.
Footer: First Prairie Bank, Maple Street
Word count: 4 / 18

Alternative headlines:
- Closed for Veterans Day
- We are closed Monday, Nov. 11

For compliance or marketing: none. The deposit processing line is from your message; confirm it matches the holiday notice from operations.`,
    },
    tests: [
      {
        name: 'Drive-up cling',
        inputs: {
          message: 'Drive-up lane 2 is closed for repairs starting Monday October 26. Lane 1 and the ATM lane are open. Lobby hours are not changing.',
          effective_date: 'Monday October 26',
          size: 'Drive-up lane window cling',
        },
        rubric: [
          'Body is 12 words or fewer.',
          'Says lane 1 and the ATM lane are open.',
          'Adds no reopening date.',
        ],
      },
      {
        name: 'Trap: rate on a sign',
        inputs: {
          message: 'New 13-month CD special at 4.10% APY, this branch only, ask a banker.',
          effective_date: 'Starting Monday',
          size: '22 x 28 poster',
        },
        rubric: [
          'Keeps the rate exactly as written.',
          'Flags the rate for compliance and Truth in Savings advertising review.',
          'Does not add terms such as minimum deposit or penalty that were not given.',
          'Notes the effective date is not a specific date.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'RT10',
    slug: 'build-the-branch-scorecard',
    name: 'Build the branch scorecard',
    group: 'retail',
    family: 'Role',
    apps: ['Excel'],
    usesTemplate: true,
    useWhen: 'It is month end and you need goals against actuals by person and product from the branch export.',
    youGet: 'A filled scorecard tab in your template: goal, actual and gap by person and product, with a short notes list.',
    fields: [
      { key: 'branch_export', label: 'The tab or file with this period\'s results', example: 'Tab "Oct export" (core system production report: officer, product, count, balance)', kind: 'file', required: true },
      { key: 'goals', label: 'The goals by person and product', example: 'Tab "Q4 goals": Dana R. - 6 checking, 2 HELOC referrals; Jordan T. - 8 checking, 4 savings; Priya S. - 8 checking, 3 savings', kind: 'long', required: true },
      { key: 'template_path', label: 'Your scorecard template', example: 'Branch Scorecard Template v2.xlsx', kind: 'file', required: true },
      { key: 'period', label: 'The period', example: 'October', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a retail analyst at a community bank working inside Claude for Excel. You turn the branch production export into the monthly scorecard, accurately and without touching the source data.

CONTEXT
Branch export: {{branch_export}}
Goals:
"""
{{goals}}
"""
Template: {{template_path}}
Period: {{period}} (if blank, use the period shown in the export's header or dates, and say which you used)

TASK
1. Use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts, colors and formulas; only fill the placeholders and input cells.
2. In the open workbook, add a new tab named "Scorecard <period>". Do not overwrite the export or the goals; write results only to the new tab.
3. Read the export. Match each row to a person and product in the goals. Keep every count and balance exactly as it appears in the source.
4. For each person and product: goal, actual, gap (actual minus goal) and percent of goal. Use Excel formulas that point at the export so the numbers can be traced, not typed values.
5. Add a branch total row per product.
6. List any export row that does not match a person or product in the goals, and any goal with no matching export rows, on a "Not matched" section below the table. Do not drop or guess these.

OUTPUT
In the workbook:
- Tab "Scorecard <period>" built from the template: one row per person, columns per product (goal, actual, gap, percent), branch totals at the bottom.
- "Not matched" section listing unmatched export rows and goals.

In chat, a short summary:
- Tab created and the source tabs used.
- Who met goal on which products, from the formulas.
- Unmatched rows, with how many and why.
- Anything you assumed.

RULES
- Do not invent facts, numbers, names or goals that are not in the export or the goals I gave you. Do not round or adjust any source number.
- Never edit, sort or delete the source tabs.
- Do not rank or comment on individual performance beyond goal versus actual.
- Count only what the export counts. If a product name in the export differs from the goals (for example "Free Chk" and "checking"), list your mapping in the summary instead of silently merging.
- Do not add member names or account numbers to the scorecard, even if the export contains them.

IF SOMETHING IS MISSING
If the export has no column that identifies the person, ask me how to attribute production. If a goal has no product or no number, ask me before filling that row. If the template cannot be found, ask me for it; do not design a new layout.`,
    checks: [
      'Totals on the scorecard tie to the export totals.',
      'Source tabs are unchanged.',
      'Every product mapping in the summary is right.',
      'The "Not matched" list is empty or explained.',
      'No member names or account numbers appear.',
    ],
    neverPaste: 'Member names, account numbers, or compensation and incentive details for individuals.',
    example: {
      inputs: {
        branch_export: 'Tab "Oct export" (core system production report: officer, product, count, balance)',
        goals: 'Tab "Q4 goals": Dana R. - 6 checking, 2 HELOC referrals; Jordan T. - 8 checking, 4 savings; Priya S. - 8 checking, 3 savings',
        template_path: 'Branch Scorecard Template v2.xlsx',
        period: 'October',
      },
      output: `Created tab "Scorecard October" from Branch Scorecard Template v2. Sources: "Oct export" and "Q4 goals" (unchanged).

| Person | Checking goal | Actual | Gap | % | Savings goal | Actual | Gap | % | HELOC ref. goal | Actual | Gap | % |
| Dana R. | 6 | 7 | 1 | 117% | - | 1 | - | - | 2 | 1 | -1 | 50% |
| Jordan T. | 8 | 6 | -2 | 75% | 4 | 4 | 0 | 100% | - | 0 | - | - |
| Priya S. | 8 | 9 | 1 | 113% | 3 | 2 | -1 | 67% | - | 0 | - | - |
| Branch | 22 | 22 | 0 | 100% | 7 | 7 | 0 | 100% | 2 | 1 | -1 | 50% |

Summary:
- Met or beat goal: Dana R. (checking), Jordan T. (savings), Priya S. (checking).
- Product mapping: "Free Chk" and "Premier Chk" in the export counted as checking; "Stmt Sav" counted as savings. Confirm.
- Not matched: 2 export rows for officer "BRANCH" (likely walk-in openings with no officer). Not included in any person's actual.
- Dana R. has 1 savings opening with no savings goal; shown as actual with no gap.`,
    },
    tests: [
      {
        name: 'Clean month',
        inputs: {
          branch_export: 'Tab "Nov export"',
          goals: 'Pat L. - 5 checking; Sam K. - 5 checking, 2 CDs',
          template_path: 'Branch Scorecard Template v2.xlsx',
        },
        rubric: [
          'Writes to a new scorecard tab and leaves source tabs untouched.',
          'Uses formulas that reference the export.',
          'Shows goal, actual, gap and percent per person and product with branch totals.',
        ],
      },
      {
        name: 'Trap: export has rows that do not match',
        inputs: {
          branch_export: 'Tab "Dec export" includes officer codes "TEMP1" and "BRANCH" not in goals, and product "Kids Club Sav"',
          goals: 'Pat L. - 5 checking, 3 savings; Sam K. - 5 checking',
          template_path: 'Branch Scorecard Template v2.xlsx',
          period: 'December',
        },
        rubric: [
          'Lists TEMP1 and BRANCH rows under Not matched instead of assigning them.',
          'States the mapping for "Kids Club Sav" rather than merging silently.',
          'Does not change any source number.',
        ],
      },
    ],
    ...dates,
  },
];
