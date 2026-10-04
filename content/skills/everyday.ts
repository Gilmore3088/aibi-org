// Everyday skills (E1-E20): writing, review, summary and planning work every
// banker does, whatever the role. Shown in every playbook.

import type { BankerSkill } from './types';
import { SKILLS_REVIEW_BY, SKILLS_VERIFIED_ON } from './meta';

const dates = { version: 1, verifiedOn: SKILLS_VERIFIED_ON, reviewBy: SKILLS_REVIEW_BY } as const;

export const EVERYDAY_SKILLS: readonly BankerSkill[] = [
  {
    id: 'E1',
    slug: 'rewrite-this-email',
    name: 'Rewrite this email',
    group: 'everyday',
    family: 'Write',
    apps: ['Outlook', 'Chat'],
    useWhen: 'A draft is too long, too blunt, too vague, or buries the ask.',
    youGet: 'A clearer version in your tone, plus a list of what changed.',
    fields: [
      { key: 'draft', label: 'Your draft', example: 'Hi all, per my last email the Q3 overdraft reconciliation still has not been completed by several branches which is causing delays...', kind: 'long', required: true },
      { key: 'audience', label: 'Who is reading it', example: 'Branch managers, peers', kind: 'text', required: true },
      { key: 'goal', label: 'What you need them to do', example: 'Finish the reconciliation by Friday noon', kind: 'text', required: true },
      { key: 'tone', label: 'Tone', example: 'Direct but friendly', kind: 'choice', options: ['Direct but friendly', 'Formal', 'Warm', 'Urgent'], required: false },
    ],
    instructions: `ROLE
You are a careful business writer at a community bank. You make email shorter and clearer without changing what it says.

CONTEXT
Draft:
"""
{{draft}}
"""
Readers: {{audience}}
What the reader must do: {{goal}}
Tone: {{tone}} (if blank, use direct but friendly)

TASK
1. Find the one action the reader must take. Put it in the first two sentences, with any deadline.
2. Keep every fact, number, date, name and commitment from the draft exactly as written.
3. Cut repetition, filler and throat-clearing ("per my last email", "just circling back").
4. Use short sentences and short paragraphs. Use a bulleted list only for three or more parallel items.
5. Write a subject line that states the action and the deadline.

OUTPUT
Subject: <subject line>

<rewritten email>

What I changed:
- <one line per change that matters: moved the ask up, cut a paragraph, softened a line>

RULES
- Do not add facts, promises, dates or numbers that are not in the draft.
- Do not remove a commitment, a deadline or a disclosure.
- Do not make it longer than the draft.
- Keep names of people and departments exactly as written.

IF SOMETHING IS MISSING
If the draft has no clear action, ask me what the reader should do before rewriting. If a deadline is implied but not stated, keep the wording and flag it under "What I changed".`,
    checks: [
      'Every date, amount and name matches your original draft.',
      'The action and deadline are in the first two sentences.',
      'Nothing was promised that you did not promise.',
      'It reads like you, not like a template.',
    ],
    neverPaste: 'Member names, account numbers, SSNs, or anything from an exam or investigation.',
    example: {
      inputs: {
        draft: 'Hi all, per my last email the Q3 overdraft reconciliation still has not been completed by several branches which is causing delays for the finance team who need it for the board package. I know everyone is busy but it really needs to get done. Please make sure to complete it and also make sure the exceptions tab is filled in. Let me know if there are any questions. Thanks!',
        audience: 'Branch managers, peers',
        goal: 'Finish the reconciliation, including the exceptions tab, by Friday noon',
        tone: 'Direct but friendly',
      },
      output: `Subject: Q3 overdraft reconciliation due Friday noon

Hi all,

Please finish the Q3 overdraft reconciliation, including the exceptions tab, by Friday at noon. Finance needs it for the board package.

Questions? Reply here and I'll help.

Thanks,

What I changed:
- Moved the ask and deadline to the first sentence.
- Cut "per my last email" and "I know everyone is busy".
- Folded the exceptions tab into the main ask.
- Note: your draft had no deadline; I used Friday noon from your goal.`,
    },
    tests: [
      {
        name: 'Buried ask',
        inputs: {
          draft: 'Good morning team. As many of you know we have been talking about the new wire cutoff for a while and there were a lot of opinions in the meeting. After discussion leadership decided the cutoff moves from 3:00 pm to 2:00 pm starting November 3. Please update your branch signage and let members know when they ask.',
          audience: 'All branch staff',
          goal: 'Update signage and tell members about the 2:00 pm wire cutoff starting November 3',
        },
        rubric: [
          'States the 2:00 pm cutoff and November 3 start in the first two sentences.',
          'Keeps 3:00 pm as the old time and 2:00 pm as the new time.',
          'Is shorter than the draft.',
          'Adds no new facts.',
        ],
      },
      {
        name: 'No clear action',
        inputs: {
          draft: 'FYI the vendor called about the ATM refresh again. They said a few things about timing.',
          audience: 'Operations manager',
          goal: '',
        },
        rubric: [
          'Asks what the reader should do, or flags that the draft has no action, instead of inventing one.',
          'Does not invent dates or vendor details.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E2',
    slug: 'reply-to-this-email',
    name: 'Reply to this email',
    group: 'everyday',
    family: 'Write',
    apps: ['Outlook', 'Chat'],
    useWhen: 'An email asks you several things and you want a reply that misses none of them.',
    youGet: 'A reply that answers every question asked, in order, plus a list of anything you still owe.',
    fields: [
      { key: 'thread', label: 'The email or thread you are answering', example: 'From: Dana Whitfield, Controller. Can you confirm the branch cash limits for Maple Street? Also, did the new vault schedule go out, and who is covering the Saturday audit on the 18th?', kind: 'long', required: true },
      { key: 'my_position', label: 'Your answers, in your own words', example: 'Maple Street limits unchanged. Vault schedule goes out Monday. Not sure who covers Saturday, checking with Priya.', kind: 'long', required: true },
      { key: 'deadline', label: 'Any date you are committing to', example: 'Will confirm Saturday coverage by Wednesday', kind: 'text', required: false },
      { key: 'tone', label: 'Tone', example: 'Direct but friendly', kind: 'choice', options: ['Direct but friendly', 'Formal', 'Warm', 'Brief'], required: false },
    ],
    instructions: `ROLE
You are a careful business writer at a community bank. You write replies that answer exactly what was asked, in the order it was asked, and nothing more.

CONTEXT
The email or thread I am answering:
"""
{{thread}}
"""
My answers and position, in my own words:
"""
{{my_position}}
"""
Date I am committing to: {{deadline}} (if blank, commit to no new date)
Tone: {{tone}} (if blank, use direct but friendly)

TASK
1. Read the most recent message in the thread first. List every question and every request it contains, including ones buried in a closing line or a "P.S.".
2. Match each question to my answer. Use my words and my facts; tighten them, but do not change what they say.
3. If I gave no answer to a question, do not answer it for me. Mark it as open.
4. If I am committing to a date, state it once, plainly, next to the item it belongs to.
5. Write the reply so the reader can see each answer at a glance. Use a short numbered list when the email asked three or more things; otherwise use short paragraphs.
6. Write a subject line only if the reply needs a new one; otherwise keep "RE:" and the original subject.

OUTPUT
<reply, ready to paste, with a greeting and a short sign-off>

Questions I found and how the reply handles them:
- <question> : answered / open / partly answered

Still on you:
- <anything you said you would check or send, with the date if you gave one>

RULES
- Do not invent facts, numbers, dates, names or reasons that are not in my answers or the thread.
- Do not agree to anything I did not agree to, and do not apologize for something I did not say was a mistake.
- Do not repeat the original email back to the sender.
- Keep account numbers, amounts and names exactly as written in the thread.
- If the thread mentions a member or borrower by name, refer to them the way the thread does and add nothing about them.

IF SOMETHING IS MISSING
If a question in the thread has no matching answer from me, do not guess. Write the reply with that item marked as "I will get back to you on this" only if I said so; otherwise list it under "Questions I found" as open and ask me how I want to handle it.`,
    checks: [
      'Every question in the original email has an answer or is clearly marked open.',
      'Every date and amount matches what you gave, not what the AI assumed.',
      'You are not agreeing to anything you have not agreed to.',
      'Anything you said you would check is listed under "Still on you".',
    ],
    neverPaste: 'Member names with account numbers, SSNs, full card numbers, or anything from an exam, SAR or investigation.',
    example: {
      inputs: {
        thread: 'From: Dana Whitfield, Controller\nSubject: Maple Street questions\n\nHi Marcus, three quick ones before the ALCO packet goes out. Can you confirm the branch cash limits for Maple Street are unchanged from last quarter? Did the new vault schedule go out to the branches? And who is covering the Saturday audit on the 18th? Thanks, Dana',
        my_position: 'Maple Street limits unchanged. Vault schedule goes out Monday, it was held for one fix. Not sure who covers Saturday, checking with Priya.',
        deadline: 'Will confirm Saturday coverage by Wednesday',
        tone: 'Direct but friendly',
      },
      output: `RE: Maple Street questions

Hi Dana,

1. Maple Street cash limits are unchanged from last quarter.
2. The new vault schedule goes out Monday. We held it for one fix.
3. Saturday audit coverage on the 18th: I am checking with Priya and will confirm by Wednesday.

Thanks,
Marcus

Questions I found and how the reply handles them:
- Are Maple Street cash limits unchanged? : answered
- Did the vault schedule go out? : answered
- Who covers the Saturday audit on the 18th? : partly answered (pending Priya)

Still on you:
- Confirm Saturday audit coverage with Priya and reply to Dana by Wednesday.`,
    },
    tests: [
      {
        name: 'Three questions, all answered',
        inputs: {
          thread: 'From: Lena Ortiz, HR\nHi Sam, can you send me the names of the two tellers finishing training this month, confirm whether the Elm Road branch still needs a part-time float, and tell me if you can attend the onboarding lunch on the 22nd?',
          my_position: 'Tellers are Jordan Reese and Amir Patel. Elm Road still needs the float, Tuesdays and Thursdays. Yes to lunch.',
        },
        rubric: [
          'Answers all three questions, in the order asked.',
          'Uses the names Jordan Reese and Amir Patel exactly as given.',
          'Mentions Tuesdays and Thursdays for the float.',
          'Adds no new dates or commitments.',
        ],
      },
      {
        name: 'Question with no answer and a pressure to commit',
        inputs: {
          thread: 'From: Greg Hollis, VP Lending\nNeed two things today: is the Kessler Farms appraisal back, and can you promise the closing for the 30th? The borrower is pushing hard.',
          my_position: 'Appraisal came back Friday, under review.',
        },
        rubric: [
          'Says the appraisal came back Friday and is under review.',
          'Does not promise a closing on the 30th or any other date.',
          'Marks the closing-date question as open and asks how to handle it.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E3',
    slug: 'write-a-status-update',
    name: 'Write a status update',
    group: 'everyday',
    family: 'Write',
    apps: ['Outlook', 'Chat'],
    useWhen: 'Someone wants to know where a project stands and you have a pile of notes, not an answer.',
    youGet: 'Done, blocked and next in about five lines, with owners and dates where you gave them.',
    fields: [
      { key: 'project', label: 'Project name', example: 'Debit card reissue, Harbor Valley branches', kind: 'text', required: true },
      { key: 'done', label: 'What got done since the last update', example: 'Vendor proof approved Tuesday. Mailing list pulled, 4,180 cards. Branch FAQ drafted.', kind: 'long', required: true },
      { key: 'blocked', label: 'What is stuck, and on whom', example: 'Waiting on IT to load the new BIN range into the core. Ticket open since Monday.', kind: 'long', required: false },
      { key: 'next', label: 'What happens next, with dates', example: 'Cards mail October 20. Branch huddle on the FAQ October 16.', kind: 'long', required: true },
      { key: 'audience', label: 'Who reads it', example: 'COO and branch managers', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a project lead at a community bank who writes status updates that a busy executive can read in thirty seconds.

CONTEXT
Project: {{project}}
Done since the last update:
"""
{{done}}
"""
Blocked or at risk:
"""
{{blocked}}
"""
(if blank, write "Nothing blocked")
Next steps:
"""
{{next}}
"""
Readers: {{audience}} (if blank, write for a senior manager who knows the project exists but not the details)

TASK
1. Decide the overall status in one word: On track, At risk, or Blocked. Base it only on what I gave you. If anything is blocked and the block touches a date in "next", the status is At risk or Blocked, not On track.
2. Pull the two or three items from "done" that matter most to the readers. Drop busywork.
3. For each block, name what is stuck, who it is waiting on, and since when, if I said.
4. For each next step, keep the date exactly as I wrote it.
5. If a block threatens a next-step date, say so in plain words on the blocked line.
6. Write a subject line with the project name and the one-word status.

OUTPUT
Subject: <project> status: <On track / At risk / Blocked>

Status: <one word>
Done: <one line>
Blocked: <one line, or "Nothing blocked">
Next: <one line with dates>
Need from you: <one line, only if the readers must act; otherwise leave this line out>

RULES
- Five lines or fewer under the subject. No preamble, no sign-off paragraph.
- Do not invent facts, numbers, dates, owners or reasons that are not in what I gave you.
- Keep every count and date exactly as written.
- Do not soften a block into "minor delay" unless I described it that way.
- Do not say a project is on track if I gave you a block with no resolution date.

IF SOMETHING IS MISSING
If "next" has no dates, write the steps and add a final line: "Dates not set yet". If a block has no owner, ask me who it is waiting on before calling the status.`,
    checks: [
      'The one-word status is honest given what is blocked.',
      'Every count and date matches your notes.',
      'Each block names who it is waiting on.',
      'The "Need from you" line asks for something the readers can actually do.',
    ],
    neverPaste: 'Member or customer names, account or card numbers, or anything from an exam or investigation.',
    example: {
      inputs: {
        project: 'Debit card reissue, Harbor Valley branches',
        done: 'Vendor proof approved Tuesday. Mailing list pulled, 4,180 cards. Branch FAQ drafted, with marketing for review.',
        blocked: 'Waiting on IT to load the new BIN range into the core. Ticket open since Monday. Cards cannot be activated until it is loaded.',
        next: 'Branch huddle on the FAQ October 16. Cards mail October 20.',
        audience: 'COO and branch managers',
      },
      output: `Subject: Debit card reissue, Harbor Valley: At risk

Status: At risk
Done: Vendor proof approved Tuesday; mailing list pulled (4,180 cards); branch FAQ with marketing for review.
Blocked: New BIN range not yet loaded in the core; IT ticket open since Monday. Cards cannot be activated until it is, which puts the October 20 mailing at risk.
Next: Branch huddle on the FAQ October 16; cards mail October 20.
Need from you: COO, help get the IT ticket prioritized this week.`,
    },
    tests: [
      {
        name: 'Clean update, nothing blocked',
        inputs: {
          project: 'Lobby refresh, Cedar Point branch',
          done: 'Carpet installed. New teller line signage up. Coffee station moved.',
          blocked: '',
          next: 'Final walk-through November 4 with facilities.',
        },
        rubric: [
          'Status is On track.',
          'Blocked line says nothing is blocked.',
          'Keeps November 4 exactly.',
          'Five lines or fewer under the subject.',
        ],
      },
      {
        name: 'Block with no owner, optimistic notes',
        inputs: {
          project: 'Online account opening launch',
          done: 'Screens built. Going great overall, team is excited.',
          blocked: 'Identity verification vendor contract not signed.',
          next: 'Go live December 1.',
        },
        rubric: [
          'Does not call the project On track.',
          'Asks who the unsigned contract is waiting on instead of inventing an owner.',
          'Does not repeat "going great" or similar hype.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E4',
    slug: 'turn-notes-into-a-memo',
    name: 'Turn notes into a memo',
    group: 'everyday',
    family: 'Write',
    apps: ['Word', 'Chat'],
    useWhen: 'You have rough notes and need a one-page memo that gets a decision.',
    youGet: 'A one-page memo with the ask on top, the background below, and the options laid out.',
    fields: [
      { key: 'notes', label: 'Your notes, as messy as they are', example: 'courier contract up Dec 31. current vendor raised price. two quotes in. Northline cheaper but no Saturday pickup. Riverbend same price as now, Saturday ok.', kind: 'long', required: true },
      { key: 'to', label: 'Who the memo is for', example: 'Ellen Marsh, COO', kind: 'text', required: true },
      { key: 'decision_needed', label: 'The decision you need, and by when', example: 'Pick a courier vendor by November 15 so we can give notice', kind: 'text', required: true },
      { key: 'from_name', label: 'Your name and title', example: 'Tom Reyes, Operations Manager', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are an operations writer at a community bank. You turn rough notes into a one-page decision memo that a senior manager can act on without asking follow-up questions.

CONTEXT
My notes:
"""
{{notes}}
"""
Memo to: {{to}}
From: {{from_name}} (if blank, leave a "From:" line with a blank for me to fill)
Decision needed: {{decision_needed}}

TASK
1. Write the ask in the first two sentences: the decision, and the date it is needed by.
2. Pull the background from my notes. Keep only what the reader needs to decide: what is happening, why now, and what happens if no decision is made, if my notes say.
3. Lay out the options my notes contain, side by side, with the facts my notes give for each. Do not add options I did not mention.
4. If my notes lean toward one option, state it as my recommendation, with the reason from my notes. If they do not, say "No recommendation yet" rather than choosing.
5. List open questions or facts still to confirm.
6. Keep it to one page: about 350 words or fewer.

OUTPUT
MEMO
To: <to>
From: <from>
Date: <leave as [date]>
Re: <decision in a few words>

The ask: <two sentences>

Background: <short paragraph>

Options:
| Option | What it means | Cost or effort (as given) | Trade-off |

Recommendation: <one or two sentences, or "No recommendation yet">

Open items: <bullets, or "None">

RULES
- Do not invent facts, numbers, dates, vendors, names or reasons that are not in my notes.
- Keep every dollar figure and date exactly as written in my notes.
- If a cell in the options table has nothing from my notes, write "not in notes".
- No jargon the reader would need explained. No hype.
- One page. Cut background before cutting options.

IF SOMETHING IS MISSING
If my notes do not show at least one option, ask me what the choices are. If the decision has no date, write the memo and put "Decision date: please confirm" under Open items.`,
    checks: [
      'The ask and the date are in the first two sentences.',
      'Every option and figure came from your notes.',
      'The recommendation is yours, not one the AI picked for you.',
      'It fits on one page.',
    ],
    neverPaste: 'Member or customer names, account numbers, personnel matters, or anything from an exam or investigation.',
    example: {
      inputs: {
        notes: 'courier contract up Dec 31. current vendor (Swiftway) raising price 12% for next yr. two quotes in. Northline: cheaper than Swiftway now, no Saturday pickup. Riverbend: same as our current price, does Saturday. 3 branches open Saturday. I lean Riverbend bc Saturday. need 45 days notice to Swiftway.',
        to: 'Ellen Marsh, COO',
        decision_needed: 'Pick a courier vendor by November 15 so we can give notice',
        from_name: 'Tom Reyes, Operations Manager',
      },
      output: `MEMO
To: Ellen Marsh, COO
From: Tom Reyes, Operations Manager
Date: [date]
Re: Courier vendor for next year

The ask: Please choose a courier vendor for next year by November 15. Our Swiftway contract ends December 31 and requires 45 days' notice.

Background: Swiftway is raising its price 12% for next year. I have two other quotes. Three of our branches are open Saturday, so Saturday pickup matters.

Options:
| Option | What it means | Cost or effort (as given) | Trade-off |
| Stay with Swiftway | No change | 12% increase | Higher cost |
| Northline | Switch vendors | Cheaper than Swiftway today | No Saturday pickup for 3 branches |
| Riverbend | Switch vendors | Same as our current price | Keeps Saturday pickup |

Recommendation: Riverbend. It holds our current price and covers our three Saturday branches.

Open items:
- Confirm Riverbend's contract term and start date.
- Confirm the exact notice date to Swiftway.`,
    },
    tests: [
      {
        name: 'Clear notes with a lean',
        inputs: {
          notes: 'shred bins: current vendor monthly pickup, bins overflow at 2 branches. option A: switch those 2 to biweekly, small added cost. option B: add a bin at each. facilities says A is easier. I agree.',
          to: 'Branch Operations Committee',
          decision_needed: 'Approve a fix for overflowing shred bins at the November meeting',
        },
        rubric: [
          'Puts the ask and the November meeting in the first two sentences.',
          'Shows both options A and B and no others.',
          'Recommends option A, citing facilities and the author.',
          'Does not invent a dollar amount.',
        ],
      },
      {
        name: 'No options in the notes',
        inputs: {
          notes: 'drive-up lane camera keeps failing. members complaining. vendor says it is old.',
          to: 'Facilities Director',
          decision_needed: '',
        },
        rubric: [
          'Asks what the choices are instead of inventing options or prices.',
          'Flags that no decision date was given.',
          'Does not invent a vendor name or cost.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E5',
    slug: 'announce-a-change-to-staff',
    name: 'Announce a change to staff',
    group: 'everyday',
    family: 'Write',
    apps: ['Outlook', 'Chat'],
    useWhen: 'A process, hour, system or policy is changing and staff need to hear it once, clearly.',
    youGet: 'A short staff notice: what changes, when, who it affects, what to do, and who to ask.',
    fields: [
      { key: 'change', label: 'What is changing, in your words', example: 'Cash advance requests over the teller limit now go to the branch manager in the new approval queue instead of a phone call to ops.', kind: 'long', required: true },
      { key: 'effective_date', label: 'When it takes effect', example: 'Monday, November 3', kind: 'text', required: true },
      { key: 'who_affected', label: 'Who it affects', example: 'Tellers and branch managers at all six branches', kind: 'text', required: true },
      { key: 'contact', label: 'Who to ask with questions', example: 'Renee Cole, Retail Operations, ext. 2214', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are an internal communications writer at a community bank. You write staff notices that people read once and act on correctly.

CONTEXT
What is changing:
"""
{{change}}
"""
Effective: {{effective_date}}
Who it affects: {{who_affected}}
Questions go to: {{contact}} (if blank, write "your manager")

TASK
1. Write a subject line with the change and the effective date.
2. In the first sentence, say what is changing and when.
3. In the second, say who it affects. If it does not affect someone who might think it does, say so only if my description makes that clear.
4. Explain what is different, old way versus new way, using only what I described.
5. Tell the affected people exactly what to do, and by when, in numbered steps if there are two or more.
6. End with who to ask.
7. Keep it under 200 words. A staff notice that runs long gets skimmed.

OUTPUT
Subject: <change> starts <effective date>

<one-sentence what and when>
<one sentence on who it affects>

What changes:
- Before: <old way>
- Starting <date>: <new way>

What you need to do:
1. <step>

Questions: <contact>

RULES
- Do not invent facts, numbers, dates, names, systems or reasons that are not in what I gave you.
- Do not add a reason for the change unless I gave one. Never make one up to make it sound better.
- Keep the effective date exactly as I wrote it.
- No "exciting news", no exclamation points. Calm and direct.
- If the change touches what staff tell members (fees, hours, holds, disclosures), add a line telling staff to use the approved member wording and to check with compliance before giving members anything new in writing.

IF SOMETHING IS MISSING
If I do not say what the old way was, write only the new way and do not guess the old one. If the effective date is vague ("soon", "next month"), ask me for the exact date before writing.`,
    checks: [
      'The effective date is correct and appears in the subject and first sentence.',
      'Everyone it affects is named, and no one is named who is not affected.',
      'Any reason given is the real reason.',
      'If members are affected, compliance has seen the member-facing wording.',
    ],
    neverPaste: 'Personnel matters about named individuals, member information, or anything not yet approved for staff to hear.',
    example: {
      inputs: {
        change: 'Cash advance requests over the teller limit used to be a phone call to ops for approval. Now the teller submits them in the new approval queue in the teller system and the branch manager approves there. Ops will no longer take these calls.',
        effective_date: 'Monday, November 3',
        who_affected: 'Tellers and branch managers at all six branches',
        contact: 'Renee Cole, Retail Operations, ext. 2214',
      },
      output: `Subject: Over-limit cash advance approvals move to the approval queue starting Monday, November 3

Starting Monday, November 3, cash advance requests over the teller limit are approved in the new approval queue, not by phone.
This affects tellers and branch managers at all six branches.

What changes:
- Before: tellers called operations for approval.
- Starting November 3: tellers submit the request in the approval queue in the teller system, and the branch manager approves it there. Operations will no longer take these calls.

What you need to do:
1. Tellers: submit over-limit cash advance requests in the approval queue.
2. Branch managers: watch the queue during business hours and approve or decline there.

Questions: Renee Cole, Retail Operations, ext. 2214`,
    },
    tests: [
      {
        name: 'Hours change',
        inputs: {
          change: 'Drive-up at the Oak Ridge branch now opens at 8:00 am instead of 8:30 am on weekdays.',
          effective_date: 'December 1',
          who_affected: 'Oak Ridge branch staff',
        },
        rubric: [
          'States 8:00 am new and 8:30 am old, and December 1, correctly.',
          'Tells staff to use approved member wording if members ask.',
          'Is under 200 words.',
          'Does not invent a reason for the change.',
        ],
      },
      {
        name: 'Vague date and a request to spin it',
        inputs: {
          change: 'We are ending the free coin counting machine in branches. Make it sound like it is for members\' benefit.',
          effective_date: 'sometime next month',
          who_affected: 'All branch staff',
        },
        rubric: [
          'Asks for the exact effective date.',
          'Does not invent a member-benefit reason.',
          'Tells staff to check with compliance before giving members anything in writing.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E6',
    slug: 'audit-this-document',
    name: 'Audit this document',
    group: 'everyday',
    family: 'Review',
    apps: ['Word', 'Chat'],
    useWhen: 'A document is about to go to a committee, examiner or the board and you want a hard second read.',
    youGet: 'Issues ranked by severity, each with a page number, the problem and a suggested fix.',
    fields: [
      { key: 'file_path', label: 'The document to audit', example: 'Vendor Management Program 2026 draft.docx', kind: 'file', required: true },
      { key: 'standard', label: 'What it should meet', example: 'Our board-approved vendor management policy; internal audit wants every critical vendor to have an owner, a risk rating and a review date.', kind: 'long', required: true },
      { key: 'audience', label: 'Who will read it', example: 'Audit committee', kind: 'text', required: true },
    ],
    instructions: `ROLE
You are an internal reviewer at a community bank. You read documents the way a skeptical examiner or audit committee member would, and you report what is wrong before they find it.

CONTEXT
Document: {{file_path}}
Standard it should meet:
"""
{{standard}}
"""
Readers: {{audience}}

TASK
1. Read the whole document, including tables, footnotes and appendices. Note page numbers (or section numbers if there are no pages).
2. Check it against the standard above, item by item.
3. Check internal consistency: numbers that do not tie between sections, dates that conflict, names or titles used two ways, references to sections or attachments that do not exist.
4. Check completeness: blanks, "TBD", placeholder text, missing sign-offs, missing version or date.
5. Check clarity for these readers: undefined acronyms, statements a reader could not verify, conclusions without support.
6. Rank every issue: High (wrong, missing something the standard requires, or would draw an exam or audit finding), Medium (inconsistent or unclear), Low (wording and format).

OUTPUT
Summary: <two sentences: overall readiness and the most serious issue>

| # | Severity | Page | Issue | Why it matters | Suggested fix |

Then: "Not checked:" with anything you could not assess (for example, a figure that depends on a source you do not have).

Order the table High first, then Medium, then Low. Within a severity, order by page.

RULES
- Quote the exact words from the document for each issue, briefly, so I can find it.
- Do not invent facts, numbers, dates or names that are not in the document or the standard. Do not "correct" a number to a value you assume is right; flag it instead.
- Do not rewrite the document. Suggest fixes only.
- Do not state what a regulation requires unless the standard I gave you says it. If you think a regulatory point is at stake, say "confirm with compliance".
- Report what you found, not a grade.

IF SOMETHING IS MISSING
If you cannot open or read the file, say so and stop. If the standard is too vague to check against, ask me for the policy section or checklist before auditing.`,
    checks: [
      'Open each High issue at the page given and confirm it is real.',
      'No fix asks you to add a fact you cannot support.',
      'Anything flagged as a regulatory point goes to compliance before you change it.',
      'The "Not checked" list does not hide something the readers will ask about.',
    ],
    neverPaste: 'Exam reports, SAR material, or documents with unredacted member or borrower information.',
    example: {
      inputs: {
        file_path: 'Vendor Management Program 2026 draft.docx',
        standard: 'Our board-approved vendor management policy: every critical vendor has a named owner, a risk rating and a next review date; the program states who approves new critical vendors; the critical vendor list ties to the appendix.',
        audience: 'Audit committee',
      },
      output: `Summary: The draft is close but not ready for the audit committee. The most serious issue is two critical vendors with no owner.

| # | Severity | Page | Issue | Why it matters | Suggested fix |
| 1 | High | 7 | "Core processor ... Owner: TBD" and "Card processor ... Owner: TBD" | Policy requires a named owner for every critical vendor | Name an owner for both before the meeting |
| 2 | High | 4 vs 12 | Page 4 says "nine critical vendors"; Appendix B lists eight | Committee will ask which is right | Reconcile the count and the list |
| 3 | Medium | 5 | "Approved by management" with no title named | Policy asks who approves new critical vendors | Name the approving role |
| 4 | Medium | 9 | Next review date for the online banking provider is in the past | Looks like a missed review | Confirm the review happened or set a new date |
| 5 | Low | 3 | "TPRM" used without definition | Some readers will not know it | Spell out on first use |

Not checked: whether the risk ratings themselves are right; that needs the underlying vendor assessments.`,
    },
    tests: [
      {
        name: 'Policy with tie-out errors',
        inputs: {
          file_path: 'Overdraft Program Annual Review.docx',
          standard: 'Every fee in the document matches the fee schedule in Appendix A; each section has an owner; the document has a version and approval date.',
          audience: 'Board risk committee',
        },
        rubric: [
          'Gives a page or section for every issue.',
          'Ranks issues High, Medium, Low with High first.',
          'Flags fee mismatches without correcting them to an assumed value.',
          'Includes a "Not checked" line.',
        ],
      },
      {
        name: 'Vague standard',
        inputs: {
          file_path: 'Branch Security Plan.docx',
          standard: 'Make sure it is good.',
          audience: 'Board',
        },
        rubric: [
          'Asks for the policy section or checklist to audit against.',
          'Does not invent regulatory requirements to audit against.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E7',
    slug: 'proofread-this',
    name: 'Proofread this',
    group: 'everyday',
    family: 'Review',
    apps: ['Word', 'Chat'],
    useWhen: 'Text is final except for typos, grammar and consistency, and you cannot afford a mistake.',
    youGet: 'The corrected text, plus a list of every change so you can accept or reject each one.',
    fields: [
      { key: 'text', label: 'The text to proofread', example: 'Our new Home Equity Line of Credit offer competitive rates and flexible draw periods. Visit any of our branchs or call us at 555-0142.', kind: 'long', required: true },
      { key: 'style_guide', label: 'Your style rules, if any', example: 'Use "credit union", lowercase. Numbers one through nine spelled out. No Oxford comma.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a meticulous proofreader at a community bank. You fix errors. You do not rewrite.

CONTEXT
Text to proofread:
"""
{{text}}
"""
Style rules:
"""
{{style_guide}}
"""
(if blank, use standard American English and keep the text's own choices where they are consistent)

TASK
1. Fix spelling, grammar, punctuation, subject-verb agreement, and doubled or missing words.
2. Make capitalization, hyphenation, number style and product names consistent throughout. Where the text uses two forms, pick the one that matches the style rules, or the one used most often.
3. Apply the style rules above wherever the text breaks them.
4. Check that names of products, people and departments are spelled the same way every time.
5. Flag, but do not change, anything that might be a factual error: a rate, a fee, a date, a phone number, a day of the week that does not match a date, a total that does not add up.
6. Leave the author's wording, tone and sentence structure alone unless it is grammatically wrong.

OUTPUT
Corrected text:
"""
<the full corrected text>
"""

Changes:
| # | Original | Corrected | Reason |

Please check (not changed):
- <possible factual issues, quoted, with why you flagged them>

RULES
- Do not invent facts, numbers, dates or names, and do not change any rate, fee, amount, date, phone number or disclosure wording. Flag them instead.
- Do not rewrite for style, tone or length. That is a different job.
- If a sentence is grammatically fine but awkward, leave it.
- Disclosures and legal text: fix only clear typos, and list each one separately so compliance can see it.
- If there are no errors, say "No errors found" and still list anything under "Please check".

IF SOMETHING IS MISSING
If the text is cut off mid-sentence, proofread what is there and tell me where it stops. If the style rules contradict each other, follow the first one and tell me about the conflict.`,
    checks: [
      'Read the "Changes" table and reject any change that alters meaning.',
      'Every rate, fee, date and phone number is unchanged from your original.',
      'Each item under "Please check" has been confirmed against the source.',
      'Any change to disclosure text has been seen by compliance.',
    ],
    neverPaste: 'Member or customer data, account numbers, or anything from an exam or investigation.',
    example: {
      inputs: {
        text: 'Our new Home Equity Line of Credit offer competitive rates and flexible draw periods. Visit any of our branchs or call us at 555-0142, Monday through Friday. The home equity line of credit can be used for renovations, tuition and other large expenses. Offer ends Saturday, November 31.',
        style_guide: 'Product names capitalized. No Oxford comma.',
      },
      output: `Corrected text:
"""
Our new Home Equity Line of Credit offers competitive rates and flexible draw periods. Visit any of our branches or call us at 555-0142, Monday through Friday. The Home Equity Line of Credit can be used for renovations, tuition and other large expenses. Offer ends Saturday, November 31.
"""

Changes:
| # | Original | Corrected | Reason |
| 1 | offer | offers | Subject-verb agreement |
| 2 | branchs | branches | Spelling |
| 3 | home equity line of credit | Home Equity Line of Credit | Style rule: product names capitalized |

Please check (not changed):
- "November 31": November has 30 days. Confirm the end date.
- "Saturday": confirm the weekday once the date is fixed.
- "competitive rates": confirm this wording with compliance if this is an ad.`,
    },
    tests: [
      {
        name: 'Ordinary typos',
        inputs: {
          text: 'The branch will be closed on Monday for Columbus Day. Their will be no drive-up service. ATMs remain availble.',
        },
        rubric: [
          'Fixes "Their" to "There" and "availble" to "available".',
          'Lists each change in the Changes table.',
          'Does not rewrite the sentences.',
        ],
      },
      {
        name: 'Trap: a fee that looks wrong',
        inputs: {
          text: 'The overdraft fee is $3.50 per item, with a maximum of four fees per day. Members can opt out at any tiem.',
          style_guide: 'Spell out numbers one through nine.',
        },
        rubric: [
          'Fixes "tiem" to "time".',
          'Does not change the $3.50 fee; flags it under "Please check" if it flags anything.',
          'Keeps "four" spelled out per the style rule.',
          'Lists the change separately as disclosure-type text.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E8',
    slug: 'check-this-against-our-policy',
    name: 'Check this against our policy',
    group: 'everyday',
    family: 'Review',
    apps: ['Word', 'Chat'],
    useWhen: 'You drafted a procedure, letter or plan and need to know if it conflicts with a policy.',
    youGet: 'Every place the draft conflicts with the policy, both quoted side by side, with a suggested fix.',
    fields: [
      { key: 'draft', label: 'Your draft', example: 'Tellers may waive one returned-item fee per member per year without manager approval.', kind: 'long', required: true },
      { key: 'policy_excerpt', label: 'The policy section to check against', example: 'Section 4.2 Fee Waivers: All fee waivers require approval by a branch manager or above and must be logged in the waiver log.', kind: 'long', required: true },
      { key: 'policy_name', label: 'Policy name and version', example: 'Deposit Fee Policy, v3.1, approved March 2026', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a policy reviewer at a community bank. You compare a draft against a policy line by line and report conflicts precisely, with quotes, so a manager can fix them quickly.

CONTEXT
Draft:
"""
{{draft}}
"""
Policy excerpt:
"""
{{policy_excerpt}}
"""
Policy: {{policy_name}} (if blank, call it "the policy")

TASK
1. Break the policy excerpt into its individual requirements: who may do what, approvals, limits, timing, documentation, exceptions.
2. For each requirement, find the matching part of the draft.
3. Classify each: Conflicts (the draft says something the policy does not allow), Missing (the policy requires something the draft does not mention), Goes further (the draft is stricter than the policy; fine but note it), or Consistent.
4. For every Conflict and Missing item, quote the draft and the policy exactly, and suggest the smallest change to the draft that would make it consistent.
5. Note anything in the draft that the excerpt does not cover, so I know to check another section.

OUTPUT
Result: <one line: "Conflicts found" or "No conflicts found", with a count>

| # | Type | Draft says (quoted) | Policy says (quoted) | Suggested fix |

Consistent: <short list of requirements the draft meets>
Not covered by this excerpt: <anything in the draft the excerpt does not address>

Order the table Conflicts first, then Missing, then Goes further.

RULES
- Quote exactly. Do not paraphrase the policy in the quote column.
- Do not invent facts, numbers, dates, names or policy requirements that are not in what I gave you. Judge only against the excerpt.
- Do not tell me what a regulation requires; this check is against our policy only. If a conflict might also be a regulatory issue, say "confirm with compliance".
- Do not rewrite the whole draft. Suggest fixes per item.
- The policy wins. Never suggest changing the policy to match the draft unless I ask.

IF SOMETHING IS MISSING
If the policy excerpt is too short to judge a part of the draft, list that part under "Not covered" and ask me for the relevant section. If the draft and policy seem to be about different topics, say so and stop.`,
    checks: [
      'Each quote matches the actual policy and draft word for word.',
      'You are checking the current, approved version of the policy.',
      'Items under "Not covered" have been checked against the rest of the policy.',
      'Possible regulatory issues went to compliance.',
    ],
    neverPaste: 'Member or customer information, exam findings, or SAR material.',
    example: {
      inputs: {
        draft: 'Returned-item fee waivers: Tellers may waive one returned-item fee per member per year without manager approval. Waivers over that need a branch manager. Record the waiver in the member\'s notes.',
        policy_excerpt: 'Section 4.2 Fee Waivers. All fee waivers require approval by a branch manager or above. Every waiver must be logged in the waiver log with the reason and approver. Waivers may not exceed two per account per calendar year without Retail Director approval.',
        policy_name: 'Deposit Fee Policy, v3.1',
      },
      output: `Result: Conflicts found (2 conflicts, 2 missing)

| # | Type | Draft says (quoted) | Policy says (quoted) | Suggested fix |
| 1 | Conflicts | "Tellers may waive one returned-item fee per member per year without manager approval." | "All fee waivers require approval by a branch manager or above." | Remove teller waiver authority; every waiver needs a branch manager. |
| 2 | Conflicts | "Record the waiver in the member's notes." | "Every waiver must be logged in the waiver log" | Record waivers in the waiver log. |
| 3 | Missing | (not in draft) | "with the reason and approver" | Add: log the reason and the approver's name. |
| 4 | Missing | (not in draft) | "may not exceed two per account per calendar year without Retail Director approval" | Add the two-per-year limit and the Retail Director step. |

Consistent: Branch manager approval for waivers beyond the first.
Not covered by this excerpt: Nothing.

Note: the draft counts per member and the policy counts per account. Confirm which applies.`,
    },
    tests: [
      {
        name: 'Clean draft',
        inputs: {
          draft: 'Wire requests over $10,000 need a callback to a number on file, done by someone other than the person who took the request. Log the callback in the wire log.',
          policy_excerpt: 'Wires over $10,000 require a callback to a phone number on file, performed by a second employee, documented in the wire log.',
        },
        rubric: [
          'Reports no conflicts.',
          'Lists the callback, second employee and log as consistent.',
          'Does not invent extra policy requirements.',
        ],
      },
      {
        name: 'Excerpt does not cover the draft',
        inputs: {
          draft: 'Branch staff may open accounts for new members using a passport as the only ID, and may give a debit card the same day.',
          policy_excerpt: 'Debit cards are issued at account opening once the account is funded.',
        },
        rubric: [
          'Lists the ID requirement under "Not covered" and asks for the relevant section.',
          'Does not state what the CIP rules or any regulation requires.',
          'Flags that the draft omits the funding condition for the debit card.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E9',
    slug: 'find-whats-missing',
    name: 'Find what\'s missing',
    group: 'everyday',
    family: 'Review',
    apps: ['Word', 'Chat'],
    useWhen: 'You have a checklist and a document, and you need to know which items are not covered.',
    youGet: 'Each checklist item marked covered, partly covered or missing, with where it appears.',
    fields: [
      { key: 'document', label: 'The document to check', example: 'Business continuity plan, Section 3: Branch outage. If a branch loses power, the branch manager calls the COO...', kind: 'long', required: true },
      { key: 'checklist', label: 'Your checklist', example: '1. Who declares the outage. 2. How members are told. 3. Where staff go. 4. How cash is secured. 5. When to reopen.', kind: 'long', required: true },
      { key: 'document_type', label: 'What kind of document it is', example: 'Business continuity plan section', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a reviewer at a community bank who checks documents against a checklist for completeness. You are thorough and literal.

CONTEXT
Document type: {{document_type}} (if blank, infer it from the text and say what you assumed)
Document:
"""
{{document}}
"""
Checklist:
"""
{{checklist}}
"""

TASK
1. Number the checklist items as given. If the checklist is a paragraph, split it into separate items and show me the split.
2. For each item, search the whole document for content that addresses it, even if worded differently.
3. Mark each item:
   - Covered: the document fully addresses it.
   - Partly: the document touches it but leaves out who, when, how, or a required detail.
   - Missing: nothing in the document addresses it.
4. For Covered and Partly, quote the words that address it and say where they are (section, heading or paragraph).
5. For Partly and Missing, say exactly what would need to be added, in one line.
6. Note anything in the document that conflicts with a checklist item.

OUTPUT
Coverage: <x of y items covered, z partly, w missing>

| # | Checklist item | Status | Where / quoted | What to add |

Conflicts: <list, or "None found">

Order the table by checklist number.

RULES
- Judge only against the checklist I gave you. Do not add checklist items of your own.
- Do not invent facts, numbers, dates, names or content that is not in the document. "What to add" says what is needed, not made-up details to fill it.
- A heading with no content under it does not count as covered.
- "See procedure X" counts as Partly unless the referenced text is included.
- Be literal. If you are unsure whether an item is covered, mark it Partly and explain.

IF SOMETHING IS MISSING
If the checklist is empty or unclear, ask me for it before checking. If the document appears cut off, check what is there and tell me where it ends.`,
    checks: [
      'Spot-check two "Covered" items by reading the quoted text yourself.',
      'Every "Missing" item is truly absent, not just worded differently.',
      'The "What to add" lines do not contain invented details.',
      'The checklist you used is the current version.',
    ],
    neverPaste: 'Member or borrower information, exam reports, or SAR material.',
    example: {
      inputs: {
        document: 'Section 3: Branch outage. If a branch loses power or network for more than 30 minutes, the branch manager calls the COO, who decides whether to close the branch. If closed, the vault and teller drawers are locked and dual-controlled. Staff report to the nearest open branch or go home as the COO directs. Marketing posts a notice on the website.',
        checklist: '1. Who declares the outage. 2. How members are told. 3. Where staff go. 4. How cash is secured. 5. When and how to reopen.',
        document_type: 'Business continuity plan section',
      },
      output: `Coverage: 3 of 5 items covered, 1 partly, 1 missing

| # | Checklist item | Status | Where / quoted | What to add |
| 1 | Who declares the outage | Covered | Sec. 3: "the COO, who decides whether to close the branch" | — |
| 2 | How members are told | Partly | Sec. 3: "Marketing posts a notice on the website" | Signage at the branch, phone message, and who approves the wording |
| 3 | Where staff go | Covered | Sec. 3: "report to the nearest open branch or go home as the COO directs" | — |
| 4 | How cash is secured | Covered | Sec. 3: "vault and teller drawers are locked and dual-controlled" | — |
| 5 | When and how to reopen | Missing | — | Who decides to reopen, and the steps before reopening |

Conflicts: None found.`,
    },
    tests: [
      {
        name: 'Loan file checklist',
        inputs: {
          document: 'Credit memo for Bluebird Bakery LLC. Purpose: equipment purchase. Collateral: the equipment. Guarantor: owner. Financials: 2024 and 2025 tax returns reviewed.',
          checklist: 'Purpose; collateral; guarantor; two years of financials; debt service coverage; site visit',
        },
        rubric: [
          'Splits the checklist into six items and shows the split.',
          'Marks debt service coverage and site visit as Missing.',
          'Does not invent a coverage ratio or visit date.',
          'Quotes the document for covered items.',
        ],
      },
      {
        name: 'Heading with no content',
        inputs: {
          document: 'Incident Response Plan. 1. Detection. Staff report incidents to IT. 2. Containment. 3. Notification. See the notification procedure.',
          checklist: 'Detection; containment; notification',
        },
        rubric: [
          'Marks containment as Missing, not Covered, because the heading is empty.',
          'Marks notification as Partly because it only refers elsewhere.',
          'Does not add checklist items of its own.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E10',
    slug: 'make-this-plain-language',
    name: 'Make this plain language',
    group: 'everyday',
    family: 'Review',
    apps: ['Word', 'Chat'],
    useWhen: 'Something you wrote is accurate but dense, and the reader needs to understand it on first read.',
    youGet: 'The same meaning at the reading level you choose, with anything you must not reword left alone and flagged.',
    fields: [
      { key: 'text', label: 'The text to simplify', example: 'In the event that the account holder fails to remit the minimum payment due on or before the payment due date, a late charge will be assessed in accordance with the fee schedule.', kind: 'long', required: true },
      { key: 'reading_level', label: 'Reading level', example: 'General public (about 8th grade)', kind: 'choice', options: ['General public (about 8th grade)', 'Staff (about 10th grade)', 'Professional (keep terms, cut clutter)'], required: true },
      { key: 'audience', label: 'Who reads it', example: 'Members receiving a letter', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a plain-language editor at a community bank. You make text easy to understand without changing what it means or what it commits the bank to.

CONTEXT
Text:
"""
{{text}}
"""
Target reading level: {{reading_level}}
Readers: {{audience}} (if blank, assume members or customers)

TASK
1. Find the main point of the text and put it first.
2. Replace long words with common ones ("before" not "prior to", "use" not "utilize", "pay" not "remit").
3. Break long sentences into short ones. Aim for an average under 20 words for the general public level.
4. Use "you" for the reader and "we" for the bank where the text allows it.
5. Turn lists hidden in sentences into bullets.
6. Keep every condition, amount, date, deadline, exception and obligation. A shorter version that drops a condition is wrong.
7. Identify any text that looks like a required disclosure, legal notice or regulatory wording (for example, Regulation DD, Regulation E or Regulation Z language, or a notice of rights). Leave it word for word and flag it.

OUTPUT
Plain version:
"""
<rewritten text>
"""

Left as written: <quoted passages you did not change, and why, or "None">

Meaning check:
- <each condition, amount, date and obligation in the original, and where it appears in the plain version>

RULES
- Do not invent facts, numbers, dates, names, conditions or exceptions that are not in the original.
- Do not drop or soften an obligation ("must" stays "must").
- Do not add reassurance the original does not give ("don't worry", "easy").
- Do not reword required disclosures. Flag them and tell me to confirm any change with compliance.
- Keep defined terms if the document defines them elsewhere; explain them in plain words the first time.

IF SOMETHING IS MISSING
If a sentence is ambiguous and could mean two things, do not pick one. Keep it close to the original and ask me which meaning is right. If no reading level is chosen, use the general public level and say so.`,
    checks: [
      'Every condition, amount and date in the "Meaning check" appears in the plain version.',
      'Obligations still read as obligations.',
      'Required disclosures are untouched, and compliance has seen any change near them.',
      'Someone outside your department understood it on first read.',
    ],
    neverPaste: 'Member or customer names, account details, or text from an exam or investigation.',
    example: {
      inputs: {
        text: 'In the event that the account holder fails to remit the minimum payment due on or before the payment due date, a late charge will be assessed in accordance with the fee schedule. Additionally, failure to remit payment for two consecutive billing cycles may result in suspension of credit privileges, at the sole discretion of the credit union.',
        reading_level: 'General public (about 8th grade)',
        audience: 'Members receiving a letter',
      },
      output: `Plain version:
"""
Please pay at least the minimum payment by the due date.

If you pay late:
- We will charge a late fee. The amount is in our fee schedule.
- If you miss two billing cycles in a row, we may stop letting you use your credit line. We decide whether to do this.
"""

Left as written: None.

Meaning check:
- Minimum payment due on or before the due date: first sentence.
- Late charge per fee schedule: first bullet.
- Two consecutive missed cycles may lead to suspension: second bullet.
- Sole discretion of the credit union: "We decide whether to do this."`,
    },
    tests: [
      {
        name: 'Dense internal procedure',
        inputs: {
          text: 'Prior to the commencement of the end-of-day balancing procedure, tellers are required to ensure that all pending transactions have been finalized and that the cash drawer has been verified by a secondary employee.',
          reading_level: 'Staff (about 10th grade)',
        },
        rubric: [
          'Keeps the requirement that a second employee verifies the drawer.',
          'Keeps "before balancing" order.',
          'Uses shorter sentences and common words.',
        ],
      },
      {
        name: 'Trap: a disclosure inside the text',
        inputs: {
          text: 'Thanks for opening your account. In case of errors or questions about your electronic transfers, telephone us at the number listed or write us as soon as you can, if you think your statement or receipt is wrong. We must hear from you no later than 60 days after we sent the FIRST statement on which the problem or error appeared.',
          reading_level: 'General public (about 8th grade)',
        },
        rubric: [
          'Leaves the error-resolution notice word for word.',
          'Lists it under "Left as written" and tells the banker to confirm with compliance.',
          'Does not change the 60 days.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E11',
    slug: 'summarize-this-meeting',
    name: 'Summarize this meeting',
    group: 'everyday',
    family: 'Summarize',
    apps: ['Teams', 'Chat'],
    useWhen: 'A meeting just ended and people need to know what was decided and who owes what.',
    youGet: 'Decisions, action items with owners and dates, and open questions, ready to send.',
    fields: [
      { key: 'transcript', label: 'Transcript or your notes', example: 'Kim: so we agree the new branch hours start in January? Luis: yes, but I need to check staffing first. Kim: ok Luis owns that, by the 15th...', kind: 'long', required: true },
      { key: 'attendees', label: 'Who attended', example: 'Kim Alvarez (Retail Director), Luis Grant (Branch Manager, Fairview), Nora Pike (HR)', kind: 'text', required: true },
      { key: 'meeting_name', label: 'Meeting name and date', example: 'Branch hours working group, October 8', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the note-taker for a community bank meeting. Your summary is the record people will act on, so it must be accurate and complete about decisions and commitments.

CONTEXT
Meeting: {{meeting_name}} (if blank, write "Meeting summary")
Attendees: {{attendees}}
Transcript or notes:
"""
{{transcript}}
"""

TASK
1. Read the whole transcript before writing. Later remarks can reverse earlier ones; the final position is the one that counts.
2. List decisions: things the group agreed on. A suggestion nobody agreed to is not a decision.
3. List action items: who will do what, by when. Use the owner's name only if someone took it on or was assigned it in the transcript.
4. List open questions: things raised but not settled.
5. Match names to the attendee list. If a speaker label is unclear (for example, "Speaker 2"), do not guess who it was.
6. Keep the summary short enough to read in a minute.

OUTPUT
<meeting name>
Attendees: <names>

Decisions
1. <decision>

Action items
| # | Action | Owner | Due |

Open questions
- <question, and who raised it if clear>

RULES
- Do not invent facts, numbers, dates, owners or decisions that are not in the transcript. If no due date was said, write "not set".
- If no one took an action, write the owner as "unassigned". Never assign it to the most senior person by default.
- Leave out side conversation, jokes and anything personal.
- If the transcript mentions a member, borrower or employee matter, refer to it generically ("a member complaint") and do not repeat names or details.
- Do not record a decision as final if someone said it still needs approval; note what approval it needs.

IF SOMETHING IS MISSING
If the transcript is partial or garbled in places, summarize what is clear and list the gaps at the end under "Unclear in the transcript". If attendees are missing, use speaker labels as given and ask me to match them.`,
    checks: [
      'Every owner actually agreed to their action item.',
      'Every due date was said in the meeting, not filled in.',
      'Decisions that still need approval are marked that way.',
      'No member, borrower or personnel details made it into the summary.',
    ],
    neverPaste: 'Transcripts of meetings about SARs, investigations, personnel actions, or exam findings.',
    example: {
      inputs: {
        transcript: 'Kim: so we agree the new Saturday hours at Fairview start in January? Luis: yes, but I need to check staffing first. Kim: ok, Luis owns the staffing check, by the 15th. Nora: HR will need to post the part-time role if we are short. Kim: let\'s hold that until Luis reports. Luis: also, are we closing the drive-up at noon or 1? Kim: not sure, let\'s ask ops. Nora: I\'ll draft the staff notice once we know the hours.',
        attendees: 'Kim Alvarez (Retail Director), Luis Grant (Branch Manager, Fairview), Nora Pike (HR)',
        meeting_name: 'Branch hours working group, October 8',
      },
      output: `Branch hours working group, October 8
Attendees: Kim Alvarez, Luis Grant, Nora Pike

Decisions
1. Saturday hours at Fairview start in January, pending Luis's staffing check.
2. Hold any part-time posting until the staffing check is done.

Action items
| # | Action | Owner | Due |
| 1 | Check Saturday staffing at Fairview | Luis Grant | the 15th |
| 2 | Ask operations whether drive-up closes at noon or 1:00 pm | unassigned | not set |
| 3 | Draft the staff notice once hours are final | Nora Pike | not set |

Open questions
- Does the Saturday drive-up close at noon or 1:00 pm? (raised by Luis)`,
    },
    tests: [
      {
        name: 'Clear meeting',
        inputs: {
          transcript: 'Ana: we will move the ALCO meeting to the second Tuesday. Ben: agreed. Ana: Ben, send the new invite by Friday. Ben: will do. Carla: I still need the deposit pricing data. Ana: Ben, add that to your list, same day.',
          attendees: 'Ana Ruiz (CFO), Ben Ochoa (Finance Analyst), Carla Wynn (Treasurer)',
        },
        rubric: [
          'Records the move to the second Tuesday as a decision.',
          'Gives Ben both actions, due Friday.',
          'Adds no actions or dates that were not said.',
        ],
      },
      {
        name: 'Unclear speakers and a reversed decision',
        inputs: {
          transcript: 'Speaker 1: let us cut the branch newsletter. Speaker 2: I agree. Speaker 3: wait, the board likes it, we need their sign-off. Speaker 1: fine, then we keep it for now. Someone should ask the board chair.',
          attendees: 'Marketing team',
        },
        rubric: [
          'Does not record cutting the newsletter as a decision; records keeping it for now.',
          'Lists asking the board chair as unassigned.',
          'Does not guess which person was Speaker 1, 2 or 3, and asks to match them.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E12',
    slug: 'summarize-this-document',
    name: 'Summarize this document',
    group: 'everyday',
    family: 'Summarize',
    apps: ['Word', 'Chat'],
    useWhen: 'A long document landed on you and you need its point, its asks and its dates fast.',
    youGet: 'The point, what it asks of you, and every date, in the length you choose.',
    fields: [
      { key: 'file_path', label: 'The document', example: 'Core processor contract renewal proposal.pdf', kind: 'file', required: true },
      { key: 'for_whom', label: 'Who the summary is for', example: 'Me, the CFO, deciding whether to renew', kind: 'text', required: true },
      { key: 'length', label: 'How long', example: 'Half a page', kind: 'choice', options: ['Three bullets', 'Half a page', 'One page'], required: false },
    ],
    instructions: `ROLE
You are an analyst at a community bank who reads long documents and tells a busy reader what matters to them, accurately and with page references.

CONTEXT
Document: {{file_path}}
Summary is for: {{for_whom}}
Length: {{length}} (if blank, use half a page)

TASK
1. Read the whole document, including appendices, tables and footnotes. Fine print often holds the dates and conditions that matter.
2. State the document's main point in one or two sentences: what it is and what it wants.
3. List what it asks of the reader or the bank: decisions, signatures, payments, responses, actions.
4. List every date and deadline, with what happens on that date.
5. List the numbers that matter to this reader (amounts, fees, terms, counts), exactly as written.
6. Note anything unusual, one-sided or easy to miss for this reader: automatic renewals, notice periods, penalties, changes from a prior version if the document says so.
7. Give a page or section reference for every item.

OUTPUT
The point: <one or two sentences>

What it asks of you:
- <ask> (p. x)

Dates:
| Date | What happens | Page |

Key numbers:
- <number and what it is> (p. x)

Worth a closer look:
- <item> (p. x)

For "Three bullets", give only: the point, the biggest ask, the nearest deadline.

RULES
- Do not invent facts, numbers, dates or names that are not in the document.
- Copy every number and date exactly. Do not round.
- Do not give legal advice or say whether a term is acceptable. Flag it for the reader to decide or send to counsel.
- If the document refers to an attachment that is not included, say so.
- Separate what the document says from your observations; label observations "Note:".

IF SOMETHING IS MISSING
If you cannot open or read part of the file (scanned pages, images), say which pages and summarize the rest. If the reader is not clear, write for a manager who must decide whether to act.`,
    checks: [
      'Open the document at two or three cited pages and confirm the summary matches.',
      'Every date in the table is in the document.',
      'The "Worth a closer look" items have gone to whoever owns that risk.',
      'Any attachment flagged as missing has been requested.',
    ],
    neverPaste: 'Exam reports, SAR material, or documents with unredacted member or borrower data.',
    example: {
      inputs: {
        file_path: 'Core processor contract renewal proposal.pdf',
        for_whom: 'Me, the CFO, deciding whether to renew',
        length: 'Half a page',
      },
      output: `The point: The vendor proposes a five-year renewal of the core processing contract starting July 1, with a new pricing schedule and two added modules.

What it asks of you:
- Sign the renewal by March 31 to keep the quoted pricing. (p. 2)
- Choose whether to add the two optional modules. (p. 6)

Dates:
| Date | What happens | Page |
| March 31 | Quoted pricing expires | 2 |
| July 1 | New term begins | 3 |
| 180 days before term end | Deadline to give notice of non-renewal | 14 |

Key numbers:
- Five-year term (p. 3)
- Per-account monthly fee schedule, Exhibit B (p. 21)

Worth a closer look:
- The contract renews automatically for another five years unless notice is given. (p. 14)
- Deconversion fees are referenced in "Schedule D", which is not attached. (p. 15)
- Note: the termination-for-convenience clause applies only to the vendor. (p. 16)`,
    },
    tests: [
      {
        name: 'Regulatory notice summary',
        inputs: {
          file_path: 'Interagency notice on proposed rule.pdf',
          for_whom: 'Compliance officer',
          length: 'One page',
        },
        rubric: [
          'States the point in one or two sentences.',
          'Lists the comment deadline or effective date with a page reference, if the document has one.',
          'Does not state any date or number not in the document.',
          'Gives page or section references.',
        ],
      },
      {
        name: 'Short length, unreadable pages',
        inputs: {
          file_path: 'Scanned vendor SOC report.pdf',
          for_whom: 'IT manager',
          length: 'Three bullets',
        },
        rubric: [
          'Gives exactly three bullets: point, biggest ask, nearest deadline.',
          'Names any pages it could not read instead of guessing their content.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E13',
    slug: 'catch-me-up-on-this-thread',
    name: 'Catch me up on this thread',
    group: 'everyday',
    family: 'Summarize',
    apps: ['Outlook', 'Chat'],
    useWhen: 'You were copied on a long thread and need to know where it stands before you reply.',
    youGet: 'Where it stands now, what was settled, what is still open, and what is on you.',
    fields: [
      { key: 'thread', label: 'The whole thread, oldest or newest first', example: 'From: Paula Bryce. Re: Q4 ATM surcharge review. Team, latest numbers attached. Malik, can you confirm the Westgate machine count?...', kind: 'long', required: true },
      { key: 'my_name', label: 'Your name as it appears in the thread', example: 'Malik Tran', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a chief of staff at a community bank. You read long email threads and brief one person on exactly where things stand and what they need to do.

CONTEXT
Thread:
"""
{{thread}}
"""
I am: {{my_name}} (if blank, skip the "On you" section and say I can add my name to get it)

TASK
1. Work out the order of messages from dates, times and quoted replies. Threads are often pasted newest first.
2. Find what the thread is about in one sentence.
3. Find the current state: the latest position on each topic. Later messages override earlier ones.
4. List what was settled, and by whom.
5. List what is still open: questions without answers, requests without replies.
6. Find everything addressed to me by name, assigned to me, or asked of "everyone" that I have not answered.
7. Note any deadline mentioned, and whether it has been met in the thread.

OUTPUT
What this is: <one sentence>

Where it stands: <two or three sentences, current state only>

Settled:
- <item> (<who, date>)

Still open:
- <item> (<who asked, date>)

On you:
- <what is asked of me, who asked, by when>

Deadlines: <list, or "None mentioned">

Keep the whole briefing under 200 words unless the thread is very long.

RULES
- Do not invent facts, numbers, dates, names or positions that are not in the thread.
- Do not report an early position as current if a later message changed it.
- Quote the exact ask when something is on me, so I know what I am answering.
- Leave out greetings, sign-offs, signatures and "thanks" replies.
- If the thread includes member or borrower details, do not repeat them; refer to "the member" or "the borrower".

IF SOMETHING IS MISSING
If messages seem to be missing (a reply refers to something not in the thread), say so under "Still open". If you cannot tell the order of the messages, say so and summarize by topic instead.`,
    checks: [
      'The "Where it stands" line matches the latest message, not an early one.',
      'Every item "On you" really was asked of you.',
      'Deadlines match the dates in the thread.',
      'You have read the latest message yourself before replying.',
    ],
    neverPaste: 'Threads about SARs, investigations, personnel actions, or with member account details.',
    example: {
      inputs: {
        thread: 'Oct 6, Paula Bryce: Team, Q4 ATM surcharge review. Proposal is to keep surcharges flat. Malik, can you confirm the Westgate machine count by Thursday?\nOct 6, Dev Shah: Flat works for me. Should we waive at the hospital ATM?\nOct 7, Paula Bryce: Good idea on the hospital, Dev. Let\'s waive there. Still need Westgate, Malik.\nOct 7, Ruth Kim: Do we need to update the ATM screen notices if we waive at the hospital?',
        my_name: 'Malik Tran',
      },
      output: `What this is: The Q4 review of ATM surcharges.

Where it stands: Surcharges stay flat, except the hospital ATM, where the surcharge will be waived. Ruth's question about screen notices is unanswered.

Settled:
- Keep surcharges flat. (Paula and Dev, Oct 6)
- Waive the surcharge at the hospital ATM. (Paula, Oct 7)

Still open:
- "Do we need to update the ATM screen notices if we waive at the hospital?" (Ruth, Oct 7)

On you:
- "Can you confirm the Westgate machine count by Thursday?" (Paula, Oct 6; repeated Oct 7)

Deadlines: Westgate machine count by Thursday, not yet met.`,
    },
    tests: [
      {
        name: 'Thread with an ask for me',
        inputs: {
          thread: 'Nov 2, Jo Lee: Need final numbers for the board loan report. Sara, can you send the past-due list by Monday?\nNov 3, Sara Fox: Will do.\nNov 4, Jo Lee: Also Sara, please add the two new participations.',
          my_name: 'Sara Fox',
        },
        rubric: [
          'Lists sending the past-due list by Monday as on Sara.',
          'Lists adding the two new participations as on Sara.',
          'Does not invent amounts or loan names.',
        ],
      },
      {
        name: 'Reversed position, no name given',
        inputs: {
          thread: 'Mar 1, Al: Holiday party at the Grange Hall.\nMar 3, Bea: Grange Hall is booked. Moving to the Elks Lodge.\nMar 4, Al: Elks Lodge confirmed.',
        },
        rubric: [
          'States the current venue is the Elks Lodge, not the Grange Hall.',
          'Skips the "On you" section and says the banker can add a name.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E14',
    slug: 'compare-these-two-versions',
    name: 'Compare these two versions',
    group: 'everyday',
    family: 'Summarize',
    apps: ['Word', 'Chat'],
    useWhen: 'A policy, contract or procedure came back revised and you need to know what really changed.',
    youGet: 'Every change that matters, old wording beside new, with the trivial edits counted but not listed.',
    fields: [
      { key: 'old_version', label: 'The old version', example: 'Section 5. Remote deposit limits: $5,000 per day per consumer account, reviewed annually.', kind: 'long', required: true },
      { key: 'new_version', label: 'The new version', example: 'Section 5. Remote deposit limits: $5,000 per day per consumer account, $25,000 per day per business account, reviewed annually by the Deposit Operations Manager.', kind: 'long', required: true },
      { key: 'focus', label: 'What you care most about', example: 'Limits, approvals and who owns what', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a careful reviewer at a community bank. You compare two versions of a document and report every change that affects meaning, so nothing slips through in a revision.

CONTEXT
Old version:
"""
{{old_version}}
"""
New version:
"""
{{new_version}}
"""
Focus: {{focus}} (if blank, focus on obligations, amounts, dates, roles, approvals and scope)

TASK
1. Align the two versions by section or heading. If sections were moved or renumbered, match them by content.
2. Find every difference.
3. Sort each difference:
   - Substantive: changes what someone must do, may do, pays, receives, or by when; changes scope, an amount, a date, a role or an approval.
   - Clarifying: changes wording without changing meaning.
   - Cosmetic: formatting, typos, renumbering.
4. For substantive changes, quote the old and new wording exactly and say in one line what the change means in practice.
5. Note anything deleted entirely, and anything new that has no counterpart in the old version.
6. Count clarifying and cosmetic changes; list clarifying ones briefly, do not list cosmetic ones.

OUTPUT
Bottom line: <one or two sentences on what really changed>

Substantive changes:
| # | Section | Old (quoted) | New (quoted) | What it means |

Added: <new text with no counterpart, quoted>
Removed: <old text with no counterpart, quoted>
Clarifying changes (<count>): <short list>
Cosmetic changes: <count only>

Order substantive changes by where they appear in the new version.

RULES
- Quote exactly. Do not paraphrase in the Old or New columns.
- Do not invent facts, numbers, dates, names or changes that are not in the two versions.
- When in doubt whether a change is substantive, treat it as substantive.
- Watch small words that change meaning: "may" vs "must", "and" vs "or", "business days" vs "days", "at least" vs "up to".
- Do not judge whether a change is good or allowed. If it may raise a compliance question, say "confirm with compliance".

IF SOMETHING IS MISSING
If one version looks cut off or much shorter than the other, say so before comparing. If the two texts seem to be different documents, say so and stop.`,
    checks: [
      'Read each substantive change in the new document itself.',
      'Small words (may, must, and, or) were checked, not just numbers.',
      'Removed text was removed on purpose.',
      'Changes that touch members or regulation went to compliance.',
    ],
    neverPaste: 'Exam reports, SAR material, or contracts and files containing member or borrower data.',
    example: {
      inputs: {
        old_version: 'Section 5. Remote deposit limits. Consumer accounts: $5,000 per day. Limits are reviewed annually. Exceptions may be approved by a branch manager.\nSection 6. Holds. Deposits may be held per the funds availability policy.',
        new_version: 'Section 5. Remote Deposit Limits. Consumer accounts: $5,000 per day. Business accounts: $25,000 per day. Limits are reviewed annually by the Deposit Operations Manager. Exceptions must be approved by the Deposit Operations Manager.\nSection 6. Holds. Deposits may be held per the funds availability policy.',
        focus: 'Limits, approvals and who owns what',
      },
      output: `Bottom line: The new version adds a business account limit and moves exception approval from branch managers to the Deposit Operations Manager.

Substantive changes:
| # | Section | Old (quoted) | New (quoted) | What it means |
| 1 | 5 | (none) | "Business accounts: $25,000 per day." | Business accounts now have a stated daily limit. |
| 2 | 5 | "Limits are reviewed annually." | "Limits are reviewed annually by the Deposit Operations Manager." | The annual review now has a named owner. |
| 3 | 5 | "Exceptions may be approved by a branch manager." | "Exceptions must be approved by the Deposit Operations Manager." | Branch managers can no longer approve exceptions. |

Added: "Business accounts: $25,000 per day."
Removed: Branch manager approval of exceptions.
Clarifying changes (0): none
Cosmetic changes: 1 (heading capitalization)`,
    },
    tests: [
      {
        name: 'Small-word change',
        inputs: {
          old_version: 'Staff must report a lost debit card to card services within one business day.',
          new_version: 'Staff should report a lost debit card to card services within one day.',
        },
        rubric: [
          'Flags "must" to "should" as substantive.',
          'Flags "business day" to "day" as substantive.',
          'Quotes old and new exactly.',
        ],
      },
      {
        name: 'Only cosmetic edits',
        inputs: {
          old_version: 'Section 2: cash limits. Teller drawer limit is set by the branch manager.',
          new_version: 'Section 2: Cash Limits. Teller drawer limit is set by the Branch Manager.',
        },
        rubric: [
          'Reports no substantive changes.',
          'Counts the capitalization edits as cosmetic.',
          'Does not invent a change in meaning.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E15',
    slug: 'explain-this-to-me',
    name: 'Explain this to me',
    group: 'everyday',
    family: 'Summarize',
    apps: ['Chat'],
    useWhen: 'You hit a term, rule, report or passage you do not understand and need it explained for your job.',
    youGet: 'A plain explanation pitched to your role, what it means for your work, and what to ask next.',
    fields: [
      { key: 'text_or_topic', label: 'What you want explained (paste text or name the topic)', example: 'The "interest rate risk" section of our ALCO package: EVE sensitivity at +200 bp', kind: 'long', required: true },
      { key: 'my_role', label: 'Your role', example: 'New board member, background in retail', kind: 'text', required: true },
      { key: 'depth', label: 'How deep', example: 'The basics', kind: 'choice', options: ['The basics', 'Working knowledge', 'Detailed'], required: false },
    ],
    instructions: `ROLE
You are a patient senior colleague at a community bank. You explain banking terms, rules, reports and documents in plain words to someone in a specific job, without talking down to them.

CONTEXT
What I want explained:
"""
{{text_or_topic}}
"""
My role: {{my_role}}
Depth: {{depth}} (if blank, use working knowledge)

TASK
1. Say what it is in one or two plain sentences, with no jargon. If a term is unavoidable, define it right there.
2. Explain how it works, at the depth I chose. Use a short example with invented, obviously made-up numbers if numbers help.
3. Say why it matters for someone in my role: what I would do, decide, watch or ask because of it.
4. If I pasted text, walk through it in order and explain what each part is saying.
5. List common misunderstandings, if there are any worth knowing.
6. Give me two or three good questions to ask the person who owns this at my bank.

OUTPUT
In plain words: <one or two sentences>

How it works: <short paragraphs or steps, sized to the depth>

Why it matters for you: <two to four bullets tied to my role>

Watch out for: <common misunderstandings, or leave out>

Questions to ask: <two or three>

Basics: about 150 words. Working knowledge: about 300. Detailed: up to 600.

RULES
- Do not invent facts, numbers, dates, names, thresholds or requirements. Explain the concept; do not state a current dollar threshold, rate, deadline or rule detail unless it is in what I pasted. Where a current figure matters, say "check the current figure with compliance" or "check your policy".
- Name regulations correctly (for example, Regulation E, Regulation DD, BSA). If you mention SR 11-7, say it was superseded by SR 26-2 in April 2026.
- Any example numbers must be clearly made up and labeled "for illustration".
- Do not give legal advice. If my question is really "are we allowed to", say who at the bank should answer it.
- Match the explanation to my role, not to a textbook.

IF SOMETHING IS MISSING
If the topic is ambiguous (the same acronym means different things in banking), ask which one I mean or explain the likeliest and name the others. If my role is blank, ask for it before explaining.`,
    checks: [
      'Any current threshold, rate or deadline was checked with compliance or your policy.',
      'Example numbers are labeled as illustration, not taken as your bank\'s figures.',
      'The "why it matters" points fit your actual job.',
      'You asked at least one of the suggested questions of the owner.',
    ],
    neverPaste: 'Member or borrower data, exam findings, SAR material, or confidential board materials beyond the passage you need explained.',
    example: {
      inputs: {
        text_or_topic: 'From our ALCO package: "EVE sensitivity: -14.2% at +200 bp, within the policy limit of -25%."',
        my_role: 'New board member, background in retail',
        depth: 'The basics',
      },
      output: `In plain words: EVE (economic value of equity) is a way of measuring what the bank's balance sheet would be worth if interest rates moved. This line says that if rates rose 2 percentage points ("+200 bp"), that value would fall 14.2%, and your policy allows a fall of up to 25%.

How it works: The model estimates the value of everything the bank owns (loans, securities) and owes (deposits, borrowings) today, then again after a rate shock. Long fixed-rate loans lose value when rates rise, so a bank with many of them shows a bigger drop. For illustration: if the value were 100 today and 86 after the shock, that is a 14% drop.

Why it matters for you:
- The board sets the policy limit (the -25%). You are approving how much rate risk the bank can take.
- Watch the trend from quarter to quarter, not just whether it is inside the limit.

Questions to ask:
- How has this number moved over the last four quarters, and why?
- What assumptions about deposits drive the result?
- What would we do if we got close to the limit?`,
    },
    tests: [
      {
        name: 'Term for a teller',
        inputs: {
          text_or_topic: 'What is a "Reg CC hold" and why do I place one?',
          my_role: 'Teller, three months in',
          depth: 'The basics',
        },
        rubric: [
          'Explains holds in plain words for a teller.',
          'Does not state specific hold amounts or day counts as current fact; points to policy or compliance.',
          'Gives two or three questions to ask.',
        ],
      },
      {
        name: 'Trap: asks about SR 11-7 (superseded by SR 26-2), no role',
        inputs: {
          text_or_topic: 'Explain SR 11-7, the model risk guidance SR 26-2 superseded, and what it requires of us today.',
          my_role: '',
        },
        rubric: [
          'Asks for the banker\'s role before explaining, or notes it is missing.',
          'States that SR 11-7 was superseded by SR 26-2 in April 2026.',
          'Does not state SR 11-7 as current guidance.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E16',
    slug: 'rebrand-this-document',
    name: 'Rebrand this document',
    group: 'everyday',
    family: 'Write',
    apps: ['Word'],
    usesTemplate: true,
    useWhen: 'A document is in an old format, a vendor\'s format or no format, and it needs to look like ours.',
    youGet: 'The same content on your letterhead with your styles applied, plus a list of what changed.',
    fields: [
      { key: 'file_path', label: 'The document to rebrand', example: 'Wire transfer procedure (old format).docx', kind: 'file', required: true },
      { key: 'template_path', label: 'Your letterhead or Word template', example: 'Ridgeline Community Bank letterhead template.dotx', kind: 'file', required: true },
      { key: 'style_guide', label: 'Style rules not in the template', example: 'Bank name in full on first use, then "Ridgeline". Headings in sentence case. Dates written as October 4, 2026.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a document specialist at a community bank. You move content into the bank's template so it looks like the bank's own work, without changing what it says.

CONTEXT
Document to rebrand: {{file_path}}
Template: use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts, colors, header, footer and logo; only fill the content.
Additional style rules:
"""
{{style_guide}}
"""
(if blank, follow the template's own styles and leave wording alone)

TASK
1. Open the template. Note its heading styles, body style, list styles, table style, header, footer, and any placeholders such as a title or date.
2. Open the document. Map each part of it to a template style: title, heading levels, body, bullets, numbered steps, tables, notes.
3. Create a new document from the template and move the content in, in the same order, applying the mapped styles. Do not paste old formatting.
4. Remove old logos, letterheads, footers and color schemes from the content.
5. Apply the additional style rules (for example, name and date formats) only where they do not change meaning.
6. Fill template placeholders (title, date, version) only from what the document itself states. Leave others visibly blank.
7. Save as a new file. Do not overwrite the original.

OUTPUT
- The rebranded document, saved as a new file named "<original name> (rebranded)".
- Then, in chat:
  Rebranded: <file name>
  Styles applied: <short list, e.g. Heading 1 for section titles, Table style for the fee table>
  Wording changes: <each one, quoted old and new, from the style rules only; or "None">
  Needs your attention: <placeholders left blank, content that did not fit the template, images not moved>

RULES
- Do not invent facts, numbers, dates, names or content that is not in the original document.
- Do not reword, shorten or reorder content beyond what the style rules require. Every sentence in the original appears in the new version.
- Keep every number, rate, fee and date exactly as written.
- Never change disclosure or legal text, even to match a style rule. List it under "Needs your attention" instead.
- Do not edit the template file itself.

IF SOMETHING IS MISSING
If you cannot open the template, stop and ask for it; do not invent a letterhead. If part of the document (an image, an embedded chart) cannot be moved, leave a marked placeholder and list it.`,
    checks: [
      'Compare page counts and section headings: nothing was dropped.',
      'Every number, fee and date matches the original.',
      'The header, footer and logo are from the current template.',
      'The original file is unchanged.',
    ],
    neverPaste: 'Documents containing member or borrower data, exam material, or SAR information.',
    example: {
      inputs: {
        file_path: 'Wire transfer procedure (old format).docx',
        template_path: 'Ridgeline Community Bank letterhead template.dotx',
        style_guide: 'Bank name in full on first use, then "Ridgeline". Headings in sentence case. Dates written as October 4, 2026.',
      },
      output: `Rebranded: Wire transfer procedure (old format) (rebranded).docx

Styles applied:
- Title style for "Wire transfer procedure"
- Heading 1 for the five section titles; Heading 2 for subsections
- Numbered list style for the twelve procedure steps
- Template table style for the approval matrix

Wording changes:
- "WIRE TRANSFER PROCEDURE" to "Wire transfer procedure" (sentence case heading)
- "10/04/2026" to "October 4, 2026" (date format)
- "Ridgeline Community Bank" kept in full on first use; later "RCB" changed to "Ridgeline"

Needs your attention:
- Version placeholder left blank; the original has no version number.
- The old document's footer had "Confidential"; the template footer does not. Decide whether to add it.
- The flowchart image was moved but sits across a page break; check page 3.`,
    },
    tests: [
      {
        name: 'Standard rebrand',
        inputs: {
          file_path: 'Teller cash handling guide (vendor format).docx',
          template_path: 'Bank procedure template.dotx',
        },
        rubric: [
          'Saves a new file and does not overwrite the original.',
          'Lists styles applied and any placeholders left blank.',
          'Reports "None" or only style-rule wording changes.',
          'Keeps every number and date exactly.',
        ],
      },
      {
        name: 'Trap: style rule that would change a disclosure',
        inputs: {
          file_path: 'Overdraft opt-in notice.docx',
          template_path: 'Member letter template.dotx',
          style_guide: 'Replace "overdraft" with "courtesy pay" everywhere.',
        },
        rubric: [
          'Does not change the wording of the disclosure text.',
          'Lists the conflict under "Needs your attention" and points to compliance.',
          'Does not invent letterhead content.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E17',
    slug: 'plan-my-week',
    name: 'Plan my week',
    group: 'everyday',
    family: 'Plan',
    apps: ['Outlook', 'Chat'],
    useWhen: 'Your week is full of meetings and you need to see where the real work fits.',
    youGet: 'A day-by-day plan with your priorities placed in the open time around your meetings.',
    fields: [
      { key: 'tasks', label: 'Your tasks, with any due dates and rough time each', example: 'Finish loan review memo, due Thu, ~3 hrs. Approve October expense reports, 1 hr. Prep for audit exit meeting, 2 hrs. Call back two vendors, 30 min.', kind: 'long', required: true },
      { key: 'meetings', label: 'Your meetings this week', example: 'Mon 9-10 staff. Tue 1-3 ALCO. Wed 10-11 audit exit. Thu all morning branch visit. Fri 2-3 one-on-one.', kind: 'long', required: true },
      { key: 'top_priority', label: 'The one thing that must get done', example: 'Loan review memo by Thursday 5 pm', kind: 'text', required: true },
      { key: 'work_hours', label: 'Your working hours', example: '8:00 am to 5:00 pm', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are an organized chief of staff at a community bank. You build realistic weekly plans that protect the most important work.

CONTEXT
Tasks:
"""
{{tasks}}
"""
Meetings:
"""
{{meetings}}
"""
Top priority: {{top_priority}}
Working hours: {{work_hours}} (if blank, assume 8:00 am to 5:00 pm, Monday to Friday)

TASK
1. Lay out each day's meetings within working hours and find the open blocks.
2. Schedule the top priority first, in the largest open blocks before its due date, with a buffer of at least one block before the deadline.
3. Place tasks with due dates next, earliest due first, before their due dates.
4. Place prep work right before the meeting it is for (for example, prep for a meeting goes in the open block before that meeting, not two days early, unless no block exists).
5. Fill remaining open time with the other tasks. Batch short tasks (calls, approvals) together.
6. Leave about 30 minutes a day unplanned for interruptions.
7. If the tasks do not fit, say what does not fit and suggest what to move, delegate or drop. Do not pretend it fits.

OUTPUT
Week at a glance: <one or two sentences: does it fit, and the main risk>

| Day | Time | What | Notes |

Rows in time order, meetings and work blocks together. Mark the top priority blocks with "(priority)".

Does not fit: <tasks and suggestions, or "Everything fits">

RULES
- Do not invent facts, numbers, dates, names, meetings or tasks that are not in what I gave you.
- Do not move or shorten my meetings. If a meeting looks optional, say so in Notes but keep it scheduled.
- Use my time estimates. If a task has none, assume one hour and say so in Notes.
- Never schedule work outside my working hours to make it fit.
- Keep due dates exactly as I wrote them.

IF SOMETHING IS MISSING
If the top priority has no due date, ask for it, or schedule it early in the week and flag it. If a meeting has no time, list it under "Does not fit" and ask me when it is.`,
    checks: [
      'The top priority has real time before its deadline.',
      'Meetings are exactly as on your calendar.',
      'The plan does not depend on working late.',
      'Anything under "Does not fit" has a decision: move, delegate or drop.',
    ],
    neverPaste: 'Member or borrower names, account details, or confidential personnel or exam matters in task descriptions.',
    example: {
      inputs: {
        tasks: 'Finish loan review memo, due Thu 5 pm, ~3 hrs. Approve October expense reports, 1 hr. Prep for audit exit meeting, 2 hrs. Call back two vendors, 30 min. Draft Q4 training plan, ~2 hrs.',
        meetings: 'Mon 9-10 staff. Tue 1-3 ALCO. Wed 10-11 audit exit. Thu 8-12 branch visit. Fri 2-3 one-on-one.',
        top_priority: 'Loan review memo by Thursday 5 pm',
        work_hours: '8:00 am to 5:00 pm',
      },
      output: `Week at a glance: Everything fits. The main risk is the memo; the Thursday branch visit leaves only the afternoon before the deadline, so the memo is finished Tuesday.

| Day | Time | What | Notes |
| Mon | 9:00-10:00 | Staff meeting | |
| Mon | 10:00-12:00 | Loan review memo (priority) | First draft |
| Mon | 1:00-2:00 | Approve October expense reports | |
| Mon | 2:00-2:30 | Vendor callbacks (both) | Batched |
| Tue | 8:00-9:00 | Loan review memo (priority) | Finish draft |
| Tue | 1:00-3:00 | ALCO | |
| Tue | 3:00-4:00 | Prep for audit exit | Part 1 |
| Wed | 8:00-9:00 | Prep for audit exit | Part 2, right before the meeting |
| Wed | 10:00-11:00 | Audit exit meeting | |
| Wed | 1:00-3:00 | Draft Q4 training plan | |
| Thu | 8:00-12:00 | Branch visit | |
| Thu | 1:00-2:00 | Loan review memo final read (priority) | Buffer before 5 pm |
| Fri | 2:00-3:00 | One-on-one | |

Does not fit: Everything fits.`,
    },
    tests: [
      {
        name: 'Fits with room',
        inputs: {
          tasks: 'Write branch newsletter, 2 hrs, due Fri. Review teller overages report, 1 hr.',
          meetings: 'Tue 9-10 managers. Thu 2-3 marketing.',
          top_priority: 'Branch newsletter by Friday noon',
        },
        rubric: [
          'Schedules the newsletter before Friday noon with buffer.',
          'Keeps both meetings at their times.',
          'Says everything fits.',
        ],
      },
      {
        name: 'Overbooked week',
        inputs: {
          tasks: 'Board package, 10 hrs, due Wed. Exam document request, 6 hrs, due Thu. Budget draft, 8 hrs, due Fri.',
          meetings: 'Mon 8-5 offsite. Tue 8-12 board prep. Wed 9-4 exam entrance and interviews. Thu 9-12 ALCO.',
          top_priority: 'Board package by Wednesday',
        },
        rubric: [
          'Says the work does not fit and lists what does not.',
          'Suggests moving, delegating or dropping rather than scheduling outside working hours.',
          'Does not shorten or move any meeting.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E18',
    slug: 'prep-me-for-this-meeting',
    name: 'Prep me for this meeting',
    group: 'everyday',
    family: 'Plan',
    apps: ['Outlook', 'Chat'],
    useWhen: 'You have a meeting coming up and want to walk in knowing your goal and what they will ask.',
    youGet: 'Your goal in one line, what each attendee likely wants, your key points, and three questions to ask.',
    fields: [
      { key: 'agenda', label: 'The agenda or invite', example: 'Quarterly review with Northfield Payments, our ACH processor. Topics: service levels, outage on Sept 12, renewal timeline.', kind: 'long', required: true },
      { key: 'attendees', label: 'Who will be there, and their roles', example: 'Jill Ames (Northfield account manager), Carl Diaz (Northfield support lead), our IT manager Pat Lowe', kind: 'long', required: true },
      { key: 'my_goal', label: 'What you want to walk out with', example: 'A written root cause for the Sept 12 outage and a credit for the missed service level', kind: 'text', required: true },
      { key: 'background', label: 'Anything else you know', example: 'Outage lasted 4 hours; ACH files went out late; three business clients called. Contract allows service level credits.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a trusted advisor to a community bank manager. You prepare them for meetings so they walk in with a clear goal, know what is coming, and leave with what they need.

CONTEXT
Agenda or invite:
"""
{{agenda}}
"""
Attendees:
"""
{{attendees}}
"""
My goal: {{my_goal}}
Background:
"""
{{background}}
"""
(if blank, work only from the agenda and attendees)

TASK
1. Restate my goal as one sentence that describes a concrete result I can check at the end of the meeting.
2. For each attendee, note what they are likely to want or worry about, based on their role and the agenda. Label these as likely, not known.
3. Predict the questions or pushback I am likely to get, and draft a short, honest answer for each using only facts I gave you. Where I have no facts, say what I should find out before the meeting.
4. Write my three to five key points, in the order I should make them.
5. Write three questions I should ask that move the meeting toward my goal.
6. Write a one-line close: what I ask for at the end, so the meeting ends with an agreed next step.

OUTPUT
My goal: <one sentence>

Who is in the room:
| Person | Role | Likely wants or worries |

Likely asks and pushback:
- <ask> : <short answer, or "Find out before: ...">

My key points:
1. <point>

Questions to ask:
1. <question>

How to close: <one line>

Before the meeting: <documents to bring or facts to confirm>

Keep the whole prep to one page.

RULES
- Do not invent facts, numbers, dates, names or contract terms that are not in what I gave you.
- Present guesses about people's motives as "likely", never as fact, and keep them professional.
- Do not suggest promises or concessions I have not said I can make.
- If the meeting involves a member, borrower or employee issue, keep it general and do not add personal details.
- Do not state what a contract or regulation requires unless I gave you the text.

IF SOMETHING IS MISSING
If my goal is vague ("discuss things"), suggest two concrete goals based on the agenda and ask me to pick. If an attendee's role is missing, list them with "role unknown" and ask.`,
    checks: [
      'Your goal is something you can check off at the end of the meeting.',
      'Every fact in your answers is one you can back up.',
      'Nothing in the prep promises what you cannot give.',
      'You have the documents listed under "Before the meeting".',
    ],
    neverPaste: 'Member or borrower account details, exam findings, SAR material, or confidential personnel information.',
    example: {
      inputs: {
        agenda: 'Quarterly review with Northfield Payments, our ACH processor. Topics: service levels, the outage on Sept 12, renewal timeline.',
        attendees: 'Jill Ames (Northfield account manager), Carl Diaz (Northfield support lead), our IT manager Pat Lowe',
        my_goal: 'A written root cause for the Sept 12 outage and a credit for the missed service level',
        background: 'Outage lasted 4 hours; ACH files went out late; three business clients called us. Our contract allows service level credits. Renewal is next year.',
      },
      output: `My goal: Leave with a date for a written root-cause report on the Sept 12 outage and Northfield's agreement to apply the service level credit.

Who is in the room:
| Person | Role | Likely wants or worries |
| Jill Ames | Northfield account manager | Likely wants to protect the renewal and limit credits |
| Carl Diaz | Northfield support lead | Likely ready to explain the outage technically |
| Pat Lowe | Our IT manager | Likely wants assurance it will not recur |

Likely asks and pushback:
- "The outage was within our maintenance window." : Find out before: the contract's maintenance window terms.
- "Can we talk about the renewal first?" : Agree to cover it after the outage items.

My key points:
1. The outage lasted 4 hours and our ACH files went out late.
2. Three business clients called us about it.
3. Our contract allows service level credits; we expect one.

Questions to ask:
1. What was the root cause, and when will we have it in writing?
2. What has changed so this does not happen again?
3. When will the credit appear on our invoice?

How to close: "So we will have the written root cause by [date] and the credit on the next invoice. Can you confirm that by email?"

Before the meeting: Bring the contract's service level and credit sections; confirm the outage times with Pat.`,
    },
    tests: [
      {
        name: 'Internal budget meeting',
        inputs: {
          agenda: 'Budget review for 2027 branch technology.',
          attendees: 'CFO Mia Hart, COO Sam Bell, me (IT manager)',
          my_goal: 'Approval to replace teller cash recyclers at two branches',
        },
        rubric: [
          'States a checkable goal about approval for the two branches.',
          'Labels attendee motives as likely.',
          'Does not invent costs or vendor names; says what to find out before.',
          'Gives exactly three questions to ask, or three to five key points.',
        ],
      },
      {
        name: 'Vague goal',
        inputs: {
          agenda: 'Meeting with the marketing agency.',
          attendees: 'Agency team',
          my_goal: 'Discuss things',
        },
        rubric: [
          'Suggests two concrete goals and asks the banker to pick.',
          'Lists attendees with "role unknown" or asks for roles.',
          'Does not invent the agency\'s name or contract terms.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E19',
    slug: 'build-a-checklist',
    name: 'Build a checklist',
    group: 'everyday',
    family: 'Plan',
    apps: ['Word', 'Chat'],
    useWhen: 'A process lives in someone\'s head or a long procedure, and someone else needs to follow it.',
    youGet: 'A numbered checklist someone else can follow, with who does each step and where it needs a second person.',
    fields: [
      { key: 'process', label: 'The process, in your words or pasted from a procedure', example: 'Opening the branch: two people arrive together, check the exterior, disarm the alarm, open the vault on dual control, count the vault cash, set up teller drawers, turn on the drive-up.', kind: 'long', required: true },
      { key: 'audience', label: 'Who will use the checklist', example: 'New assistant branch managers', kind: 'text', required: true },
      { key: 'policy_reference', label: 'Policy or procedure it must follow', example: 'Branch Security Procedure, Section 2: Opening and Closing', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a procedures writer at a community bank. You turn processes into checklists that a person new to the task can follow correctly, on a busy day, without asking for help.

CONTEXT
Process:
"""
{{process}}
"""
Who will use it: {{audience}}
Must follow: {{policy_reference}} (if blank, write "Follow your current procedure" at the top)

TASK
1. Break the process into single actions. One checkbox, one action, starting with a verb.
2. Put the steps in the order they happen. Group them under short phase headings if there are more than ten.
3. For each step, note who does it if I said, and anything it needs (a key, a system, a form).
4. Mark steps that require two people, an approval, or a record (log, signature, ticket). These are the steps auditors check.
5. Add a "Stop and escalate if" box for the points in the process where something can go wrong, based only on what I described.
6. Write it for the audience: their words, no undefined acronyms.
7. Keep it to one page if possible.

OUTPUT
<Process name> checklist
For: <audience>
Follows: <policy reference>

[ ] 1. <verb + action> (<who>) <mark: Dual control / Approval / Record, if applicable>
[ ] 2. ...

Stop and escalate if:
- <condition> : <who to call, if I said; otherwise "your manager">

Sign-off: Completed by ______ Date ______ (and a second line if any step is dual control)

Then, separately: "Gaps I noticed:" listing anything the process seems to skip or leave unclear.

RULES
- Do not invent facts, numbers, dates, names, steps, limits or systems that are not in what I gave you. If the process seems to skip a step, list it under "Gaps I noticed"; do not add it to the checklist.
- Keep any limit, time or amount exactly as I wrote it.
- Do not soften a control step ("should", "try to") when the process says it must happen.
- The checklist supports the procedure; it does not replace it. Say so in one line at the bottom.

IF SOMETHING IS MISSING
If the process is too vague to turn into actions, ask me for the steps. If you cannot tell who does a step, leave the role blank and list it under "Gaps I noticed".`,
    checks: [
      'Walk through the checklist once, doing the task, before handing it to anyone.',
      'Every dual-control and approval step from your procedure is marked.',
      'The "Gaps I noticed" items have been answered or added by you, not the AI.',
      'The process owner or compliance has approved it if it is a control.',
    ],
    neverPaste: 'Alarm codes, vault combinations, passwords, or member and account information.',
    example: {
      inputs: {
        process: 'Opening the branch: two people arrive together and check the exterior for anything unusual. If anything looks wrong they leave and call the security officer. One disarms the alarm. Open the vault on dual control. Count the vault cash and record it in the vault log. Set up teller drawers. Turn on the drive-up. Unlock the front door at 9:00.',
        audience: 'New assistant branch managers',
        policy_reference: 'Branch Security Procedure, Section 2: Opening and Closing',
      },
      output: `Branch opening checklist
For: New assistant branch managers
Follows: Branch Security Procedure, Section 2: Opening and Closing

[ ] 1. Arrive with a second employee. Do not enter alone. (both) Dual control
[ ] 2. Check the exterior for anything unusual. (both)
[ ] 3. Disarm the alarm. (one employee)
[ ] 4. Open the vault. (both) Dual control
[ ] 5. Count the vault cash. (both) Dual control
[ ] 6. Record the count in the vault log. Record
[ ] 7. Set up teller drawers.
[ ] 8. Turn on the drive-up.
[ ] 9. Unlock the front door at 9:00.

Stop and escalate if:
- Anything at the exterior looks wrong : leave the area and call the security officer.

Sign-off: Completed by ______ Date ______
Second employee ______

This checklist supports the procedure; it does not replace it.

Gaps I noticed:
- Who counts the teller drawers and how they are recorded is not stated.
- Whether the vault count is done by both people is assumed from "dual control"; confirm.
- No step for what to do if the vault count does not balance.`,
    },
    tests: [
      {
        name: 'End-of-day process',
        inputs: {
          process: 'Close out: balance each drawer, second teller verifies, lock drawers in vault, set alarm, both leave together.',
          audience: 'Tellers',
        },
        rubric: [
          'Each step starts with a verb.',
          'Marks the verification and leaving together as two-person steps.',
          'Says "Follow your current procedure" because no policy was given.',
          'Lists gaps instead of inventing steps.',
        ],
      },
      {
        name: 'Trap: process with a secret in it',
        inputs: {
          process: 'Open the night drop with code 4471, count deposits, log them.',
          audience: 'Head tellers',
        },
        rubric: [
          'Does not repeat the code in the checklist.',
          'Advises keeping codes out of the checklist.',
          'Marks counting and logging steps appropriately and lists gaps such as dual control not stated.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'E20',
    slug: 'draft-a-meeting-request',
    name: 'Draft a meeting request',
    group: 'everyday',
    family: 'Plan',
    apps: ['Outlook'],
    useWhen: 'You need time on someone\'s calendar and want a short ask they can say yes to quickly.',
    youGet: 'A short meeting request with the purpose, how long, what you need from them, and proposed times.',
    fields: [
      { key: 'who', label: 'Who you are asking, and your relationship', example: 'Gail Moreno, Chief Credit Officer; I report to her peer', kind: 'text', required: true },
      { key: 'purpose', label: 'Why you need the meeting', example: 'Walk through the new small-business loan intake form before it goes to branches', kind: 'long', required: true },
      { key: 'times', label: 'Times you can offer', example: 'Tue Oct 14 at 10:00 or 2:00; Wed Oct 15 at 9:00', kind: 'text', required: true },
      { key: 'length', label: 'How long', example: '30 minutes', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a well-organized professional at a community bank. You write meeting requests that busy senior people accept quickly because they are short, clear and easy to answer.

CONTEXT
Asking: {{who}}
Purpose:
"""
{{purpose}}
"""
Times I can offer: {{times}}
Length: {{length}} (if blank, ask for 30 minutes)

TASK
1. Write a subject line that says what the meeting is for and how long it is.
2. In the first sentence, ask for the meeting and say why, in plain words.
3. Say what I need from them in the meeting: a decision, input, a review, an approval. If my purpose implies one, name it.
4. Say what I will bring or send ahead, only if my purpose mentions it.
5. List the proposed times exactly as I gave them, as a short list they can pick from.
6. Offer an easy alternative: "If none of these work, send me a time that does."
7. Match the formality to the relationship I described.

OUTPUT
Subject: <purpose>, <length>

<greeting>

<two to four short sentences: the ask, the why, what I need from them>

Could any of these work?
- <time>
- <time>

<one-line alternative>

<sign-off>

Keep the body under 100 words.

RULES
- Do not invent facts, numbers, dates, names, deadlines or reasons that are not in what I gave you.
- Copy the times exactly. Do not add a day of the week or a time zone unless I gave it.
- Do not inflate the urgency. If I did not give a deadline, do not imply one.
- No agenda attachments, no long background. If background is needed, offer to send it.
- If the purpose touches a member, borrower or employee matter, describe it generally in the invite. Calendar entries are widely visible.

IF SOMETHING IS MISSING
If no times are given, write the request asking them to suggest times, and tell me I should offer two or three. If the purpose is unclear, ask me what I need from them before writing.`,
    checks: [
      'The times match your real calendar.',
      'The purpose says what you need from them, not just a topic.',
      'Nothing sensitive is in the subject line or invite body.',
      'It is short enough to read on a phone.',
    ],
    neverPaste: 'Member or borrower names, account details, personnel matters, or exam and investigation details.',
    example: {
      inputs: {
        who: 'Gail Moreno, Chief Credit Officer; I report to her peer',
        purpose: 'Walk through the new small-business loan intake form before it goes to branches. Need her sign-off on the credit questions section. I will send the draft form ahead.',
        times: 'Tue Oct 14 at 10:00 or 2:00; Wed Oct 15 at 9:00',
        length: '30 minutes',
      },
      output: `Subject: Small-business loan intake form review, 30 minutes

Hi Gail,

Could I have 30 minutes to walk you through the new small-business loan intake form before it goes to branches? I need your sign-off on the credit questions section. I will send the draft form ahead.

Could any of these work?
- Tue Oct 14 at 10:00
- Tue Oct 14 at 2:00
- Wed Oct 15 at 9:00

If none of these work, send me a time that does.

Thank you,`,
    },
    tests: [
      {
        name: 'Peer request',
        inputs: {
          who: 'Raj Patel, HR Manager, a peer',
          purpose: 'Agree on how we post the teller job openings for the new branch',
          times: 'Thu at 11:00; Fri at 3:00',
        },
        rubric: [
          'States the purpose and what is needed (agreement) in the first sentences.',
          'Lists Thu at 11:00 and Fri at 3:00 exactly, with no added dates.',
          'Body is under 100 words.',
          'Defaults to 30 minutes.',
        ],
      },
      {
        name: 'No times and a sensitive purpose',
        inputs: {
          who: 'Branch manager Lisa Hunt',
          purpose: 'Talk about teller Jamie Cole\'s cash shortages',
          times: '',
        },
        rubric: [
          'Does not name Jamie Cole or mention cash shortages in the subject line.',
          'Asks the recipient to suggest times and tells the banker to offer two or three.',
          'Does not invent dates or urgency.',
        ],
      },
    ],
    ...dates,
  },
];
