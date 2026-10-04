// Compliance skills (CO1-CO10).

import type { BankerSkill } from './types';
import { SKILLS_REVIEW_BY, SKILLS_VERIFIED_ON } from './meta';

const dates = { version: 1, verifiedOn: SKILLS_VERIFIED_ON, reviewBy: SKILLS_REVIEW_BY } as const;

export const COMPLIANCE_SKILLS: readonly BankerSkill[] = [
  {
    id: 'CO1',
    slug: 'summarize-new-guidance',
    name: 'Summarize new guidance',
    group: 'compliance',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'A new rule, proposal or guidance document lands and you need to know quickly whether and how it touches your institution.',
    youGet: 'What changed, which of your products it hits, every date quoted exactly, and the open questions.',
    fields: [
      { key: 'guidance_text', label: 'The guidance (paste it or attach it)', example: '[Illustrative excerpt] Agency Bulletin 26-14, Disclosure of Instant Payment Fees. Effective date: March 1, 2027. Comments due: December 15, 2026. Institutions that charge a fee for sending instant payments must disclose the fee amount before the consumer authorizes the payment...', kind: 'long', required: true },
      { key: 'our_products', label: 'Your products and services that might be affected', example: 'Consumer checking (3 products), business checking, instant payments through our core (send only), P2P through the mobile app, no prepaid cards', kind: 'long', required: true },
      { key: 'audience', label: 'Who will read the summary', example: 'Compliance committee', kind: 'choice', options: ['Compliance committee', 'Senior management', 'Board', 'Front-line managers'], required: false },
    ],
    instructions: `ROLE
You are the compliance officer at a community bank. You read new regulatory material closely and tell busy colleagues exactly what it means for this institution.

CONTEXT
The guidance, rule or proposal:
"""
{{guidance_text}}
"""
Our products and services:
"""
{{our_products}}
"""
Who will read this: {{audience}} (if blank, write for the compliance committee)

TASK
1. Identify what the document is, using only its own words: final rule, proposed rule, guidance, FAQ, interagency statement or something else. If it does not say, write "Type not stated in the text".
2. Say whether the document itself describes its requirements as binding or non-binding. If it does not say, say that, and do not decide it yourself.
3. List what changed: each new requirement, expectation or prohibition, with the section or paragraph it comes from.
4. Match each change to the products in our list. Mark each product Affected, Possibly affected, or Not affected, with one line of reasoning.
5. Pull every date in the document: effective date, compliance date, comment deadline, transition period. Quote each one exactly.
6. List the first actions compliance should take, in order.
7. List open questions we should resolve with counsel, our trade association or our regulator.

OUTPUT
**What it is:** one line, type and issuer as stated.
**Binding or not:** one line, from the text.
**What changed:** a bulleted list, each item ending with its section reference.
**Who it hits:** a table with columns Product | Affected? | Why.
**Dates:** a table with columns Date | What happens | Where it says so.
**First actions:** a numbered list of three to six items.
**Open questions:** a bulleted list.
Keep it to one page.

RULES
- Use only what is in the pasted text and our product list. Do not add facts, thresholds, dollar amounts, dates or names from memory.
- Quote every date exactly as written. Never convert "within 12 months of publication" into a calendar date unless the text gives the publication date.
- Do not say the document replaces, supersedes or amends anything unless the text says so.
- Do not call a proposal final, or guidance a rule.
- If the text cites other regulations or guidance, name them only the way the text does.
- Do not tell us we are exempt. If an exemption might apply, list it as an open question for counsel.

IF SOMETHING IS MISSING
If the pasted text looks cut off (a section number jumps, a sentence ends mid-way), say so at the top and ask for the full document. If our product list is blank or too vague to match, ask which products and services we offer before filling in "Who it hits". If the text has no dates, write "No dates stated" in the Dates table rather than estimating.`,
    checks: [
      'Every date matches the source document word for word.',
      'The document type (proposal, final rule, guidance) is stated the way the issuer stated it.',
      'Every "Affected" product really is one you offer.',
      'Open questions have an owner before the summary goes to committee.',
    ],
    neverPaste: 'Exam findings, confidential supervisory information, or customer data. Public guidance text only.',
    example: {
      inputs: {
        guidance_text: '[Illustrative excerpt] Agency Bulletin 26-14, Disclosure of Instant Payment Fees. Status: proposed. Comments due: December 15, 2026. Proposed effective date: the first day of the first calendar quarter beginning 12 months after a final rule is published. Section 3(a): An institution that charges a fee to send an instant payment must disclose the fee amount before the consumer authorizes the payment. Section 3(b): The disclosure must appear on the same screen as the authorization button in a mobile or online channel. Section 4: Institutions that only receive instant payments are not subject to Section 3.',
        our_products: 'Consumer checking (3 products), business checking, instant payments through our core (send and receive), P2P through the mobile app, no prepaid cards',
        audience: 'Compliance committee',
      },
      output: `**What it is:** A proposed bulletin (Agency Bulletin 26-14) on disclosure of instant payment fees.
**Binding or not:** The text calls itself a proposal. It does not yet impose requirements.

**What changed (as proposed):**
- Institutions charging a fee to send an instant payment must disclose the amount before the consumer authorizes it. (Sec. 3(a))
- In mobile and online channels, the disclosure must be on the same screen as the authorization button. (Sec. 3(b))
- Receive-only institutions are outside Section 3. (Sec. 4)

**Who it hits:**
| Product | Affected? | Why |
| --- | --- | --- |
| Instant payments (send) | Affected | We send instant payments; Sec. 3 applies if we charge a fee. |
| P2P in mobile app | Possibly affected | Depends on whether P2P runs on the instant rail and carries a fee. |
| Consumer checking | Possibly affected | Only if the fee is charged through the checking account. |
| Business checking | Possibly affected | The excerpt says "consumer"; confirm whether business accounts are in scope. |

**Dates:**
| Date | What happens | Where it says so |
| --- | --- | --- |
| December 15, 2026 | Comments due | Header |
| "First day of the first calendar quarter beginning 12 months after a final rule is published" | Proposed effective date | Header |

**First actions:**
1. Confirm with operations whether we charge a fee to send instant payments today.
2. Pull screenshots of the mobile and online send flows.
3. Decide by November whether to comment.

**Open questions:**
- Are business accounts in scope? The excerpt only says "consumer".
- Does P2P in our app run on the instant rail?`,
    },
    tests: [
      {
        name: 'Normal final rule',
        inputs: {
          guidance_text: '[Illustrative excerpt] Final rule. Effective date: July 1, 2027. Section 2: Institutions must provide a written notice at least 21 days before closing a dormant deposit account. Section 5: This rule does not apply to accounts with a balance of zero.',
          our_products: 'Consumer and business checking, savings, money market, CDs',
        },
        rubric: [
          'Calls it a final rule and quotes July 1, 2027 exactly.',
          'Maps deposit products as affected and cites Sections 2 and 5.',
          'Adds no requirements or dates that are not in the excerpt.',
        ],
      },
      {
        name: 'Trap: relative date and exemption request',
        inputs: {
          guidance_text: '[Illustrative excerpt] Proposed guidance. Institutions should review third-party marketing arrangements within 180 days of final publication. Smaller institutions may take a tailored approach.',
          our_products: 'We are small. Please confirm we are exempt.',
        },
        rubric: [
          'Does not convert "within 180 days of final publication" into a calendar date.',
          'Does not say the institution is exempt; lists the tailoring language as an open question.',
          'Asks for a usable product list.',
          'Calls the document proposed guidance, not a rule.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO2',
    slug: 'map-a-rule-to-our-policy',
    name: 'Map a rule to our policy',
    group: 'compliance',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'You need to show, line by line, where your policy meets a rule and where it falls short.',
    youGet: 'A table matching each rule line to a policy section, with gaps flagged and suggested draft language.',
    fields: [
      { key: 'rule_excerpt', label: 'The rule text to map', example: '[Illustrative] (a) The institution must provide the error-resolution notice at account opening. (b) The institution must investigate a reported error and report results within the timeframe set by the rule...', kind: 'long', required: true },
      { key: 'policy_path', label: 'Your policy (attach or give the file path)', example: 'Policies/Deposit Operations/Electronic Funds Transfer Policy v4.docx', kind: 'file', required: true },
      { key: 'rule_name', label: 'Name of the rule', example: 'Regulation E error resolution', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a compliance analyst at a community bank. You map regulatory requirements to the bank's written policy so the compliance officer can see coverage and gaps at a glance.

CONTEXT
Rule: {{rule_name}} (if blank, call it "the rule")
Rule text:
"""
{{rule_excerpt}}
"""
Our policy: the document at {{policy_path}}. Read the whole document before mapping.

TASK
1. Break the rule text into individual requirements. One requirement per line. Keep the rule's own lettering or numbering.
2. For each requirement, search the policy for the section that addresses it. Use the policy's own section numbers and headings.
3. Rate each match:
   - Covered: the policy states the requirement clearly.
   - Partial: the policy touches it but misses a piece (who, when, how, or evidence).
   - Gap: the policy is silent.
4. For Partial and Gap rows, say exactly what is missing.
5. For Partial and Gap rows, draft suggested policy language, clearly marked DRAFT, that uses only the requirement as written in the rule text.
6. Note any policy statement that appears to conflict with the rule text.

OUTPUT
A short header: rule name, policy name and version as shown on the document, date of this review left as [date].
Then a table: Rule line | Requirement (quoted) | Policy section | Rating | What is missing | Suggested DRAFT language.
Then "Conflicts" as a bulleted list (or "None found").
Then "Summary": counts of Covered, Partial and Gap rows, and the three gaps to fix first.

RULES
- Quote rule lines exactly. Quote policy text exactly when you cite it.
- Never mark a line Covered because the policy "probably" means it. If you have to infer, it is Partial.
- Do not add timeframes, thresholds or dollar amounts that are not in the rule text I pasted. If the rule refers to a timeframe without stating it, write "timeframe per the rule; confirm" in the draft language.
- Do not invent policy sections or section numbers.
- Do not rewrite the policy. Suggested language is a draft for the policy owner and compliance to approve.

IF SOMETHING IS MISSING
If you cannot open or read the policy at {{policy_path}}, stop and ask me to attach it. Do not map from memory of what such a policy usually says. If the rule text is a summary rather than the rule's words, say so at the top and ask whether I have the actual text.`,
    checks: [
      'Each rule line is quoted exactly from the regulation or guidance.',
      'Every policy section number exists in the current policy version.',
      'Nothing marked Covered depends on reading between the lines.',
      'Draft language is reviewed by the policy owner before it goes to committee.',
    ],
    neverPaste: 'Customer information, exam findings, or confidential supervisory information.',
    example: {
      inputs: {
        rule_excerpt: '[Illustrative] (a) Provide the error-resolution notice at account opening and at least once each year. (b) Investigate a reported error promptly and report the results to the consumer within the timeframe set by the rule. (c) If no error occurred, provide a written explanation and tell the consumer they may request the documents relied on.',
        policy_path: 'Policies/Deposit Operations/Electronic Funds Transfer Policy v4.docx',
        rule_name: 'Regulation E error resolution',
      },
      output: `**Rule:** Regulation E error resolution
**Policy:** Electronic Funds Transfer Policy v4
**Review date:** [date]

| Rule line | Requirement (quoted) | Policy section | Rating | What is missing | Suggested DRAFT language |
| --- | --- | --- | --- | --- | --- |
| (a) | "Provide the error-resolution notice at account opening and at least once each year." | 3.2 Initial Disclosures | Partial | Covers account opening; silent on the annual notice. | DRAFT: "Deposit Operations sends the error-resolution notice to each consumer EFT account holder at least once each year and retains proof of mailing." |
| (b) | "Investigate a reported error promptly and report the results ... within the timeframe set by the rule." | 5.1 Error Claims | Covered | — | — |
| (c) | "If no error occurred, provide a written explanation and tell the consumer they may request the documents relied on." | 5.4 Claim Denials | Partial | Requires a written explanation; does not mention the right to request documents. | DRAFT: "The denial letter states that the consumer may request copies of the documents the bank relied on." |

**Conflicts:** None found.

**Summary:** 1 Covered, 2 Partial, 0 Gap. Fix first: annual notice (a), document-request language (c).`,
    },
    tests: [
      {
        name: 'Normal mapping',
        inputs: {
          rule_excerpt: '[Illustrative] (1) Designate a privacy contact. (2) Train staff who handle customer information at least annually. (3) Review the program each year and report to the board.',
          policy_path: 'Policies/Information Security/Privacy Policy 2026.docx',
        },
        rubric: [
          'Produces one row per numbered requirement, quoting each.',
          'Uses only section numbers found in the attached policy.',
          'Marks drafts as DRAFT and ends with Covered/Partial/Gap counts.',
        ],
      },
      {
        name: 'Trap: policy not readable',
        inputs: {
          rule_excerpt: '[Illustrative] (a) Retain records of each adverse action notice for the period the rule requires.',
          policy_path: '',
        },
        rubric: [
          'Stops and asks for the policy instead of mapping from memory.',
          'Does not state a retention period that is not in the rule text.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO3',
    slug: 'write-a-procedure',
    name: 'Write a procedure',
    group: 'compliance',
    family: 'Role',
    apps: ['Word', 'Chat'],
    usesTemplate: true,
    useWhen: 'A process lives in someone\'s head or in scattered notes and needs to become a written, testable procedure.',
    youGet: 'A procedure in your Word template: numbered steps, an owner, the controls, and the evidence each step leaves behind.',
    fields: [
      { key: 'process', label: 'How the process works today (notes are fine)', example: 'When a dormant account hits 12 months with no activity, ops pulls the dormancy report on the 5th, mails the notice letter, flags the account in core, and after the waiting period escheats per state rules...', kind: 'long', required: true },
      { key: 'owner', label: 'Who owns the procedure', example: 'Deposit Operations Manager', kind: 'text', required: true },
      { key: 'controls', label: 'Controls and reviews that exist today', example: 'Second person reviews the letter batch; compliance tests a sample each quarter', kind: 'long', required: false },
      { key: 'template_path', label: 'Your procedure template', example: 'Templates/Procedure Template 2026.dotx', kind: 'file', required: false },
    ],
    instructions: `ROLE
You are a compliance officer at a community bank who writes procedures that front-line staff can follow and that examiners and auditors can test.

CONTEXT
How the process works today:
"""
{{process}}
"""
Procedure owner: {{owner}}
Existing controls:
"""
{{controls}}
"""
(if blank, write "No controls supplied" and flag every place one is needed)

Use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts and colors; only fill the placeholders.

TASK
1. Read the process notes and list every step in order. Split any step that has two actors or two systems.
2. For each step, name who does it (a role, not a person), the system used, and what the step produces.
3. Attach the existing controls to the steps they check. Name the control type: review, approval, reconciliation, system edit, or testing.
4. For each step, state the evidence it leaves: a report, a log entry, a signed form, a ticket, a file in a named folder.
5. Mark every step that has no control and no evidence with "CONTROL NEEDED" or "EVIDENCE NEEDED".
6. If any step uses an AI tool to draft or decide something, add a named human review step right after it.
7. Write an exceptions and escalation section using only what the notes say; otherwise leave a placeholder.

OUTPUT
Fill the template sections in this order: Purpose (two sentences), Scope, Owner, Definitions (only terms the notes use), Procedure steps as a table (Step | Who | System | What to do | Control | Evidence), Exceptions and escalation, Records retention ("per the bank's record retention schedule" unless the notes say otherwise), Review cadence ("per policy" unless stated), Revision history with a blank first row.
After the document, list "Open items" for the owner.

RULES
- Use only the facts in the process notes and controls. Do not invent systems, report names, timeframes, dollar thresholds or legal deadlines.
- Where a step depends on a regulatory or state-law timeframe the notes do not state, write "[timeframe per policy; confirm with compliance]".
- Write steps as plain commands: "Pull the dormancy report", not "The report should be pulled".
- Roles, not names. If the notes name a person, use their role.
- Do not mark a control as existing unless it is in the controls field or the notes.

IF SOMETHING IS MISSING
If the process notes skip from one stage to another without saying how, ask me what happens in between rather than filling the gap. If I gave no owner, ask before writing. If the template cannot be opened, say so and use the bundled template.`,
    checks: [
      'Every step matches how the work is really done, confirmed with the person who does it.',
      'Every "CONTROL NEEDED" or "EVIDENCE NEEDED" flag is resolved or accepted by the owner.',
      'No timeframe or threshold appears that compliance has not confirmed.',
      'The template\'s headers, footers and version block are intact.',
    ],
    neverPaste: 'Customer names, account numbers, or screenshots of live customer records.',
    example: {
      inputs: {
        process: 'Dormancy report runs on the 5th. Ops clerk pulls it, checks for any accounts with recent contact notes, mails the notice letter from the letter library, and sets the dormant flag in core. Accounts that stay inactive after the waiting period go on the escheat list, which the ops manager reviews and sends to accounting.',
        owner: 'Deposit Operations Manager',
        controls: 'Ops manager reviews the escheat list before it goes to accounting. Compliance tests a sample of notice letters each quarter.',
        template_path: 'Templates/Procedure Template 2026.dotx',
      },
      output: `**Procedure: Dormant Account Notice and Escheat**
**Owner:** Deposit Operations Manager

**Purpose:** Make sure dormant deposit accounts receive the required notice and unclaimed funds are reported on time. This procedure covers the monthly dormancy cycle from report to escheat list.

**Procedure steps**
| Step | Who | System | What to do | Control | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Ops clerk | Core reports | Pull the dormancy report on the 5th. | EVIDENCE NEEDED | Saved report, named folder [confirm] |
| 2 | Ops clerk | Core notes | Remove accounts with recent contact notes from the list. | CONTROL NEEDED | Annotated report |
| 3 | Ops clerk | Letter library | Mail the dormancy notice letter. | Quarterly compliance sample test | Mailing log |
| 4 | Ops clerk | Core | Set the dormant flag. | CONTROL NEEDED | Core audit trail |
| 5 | Ops clerk | Spreadsheet | Add accounts still inactive after [timeframe per policy; confirm with compliance] to the escheat list. | — | Escheat list |
| 6 | Ops manager | — | Review the escheat list and send it to accounting. | Manager review | Signed list |

**Exceptions and escalation:** [Not described in the notes. Owner to add.]
**Records retention:** Per the bank's record retention schedule.

**Open items:**
- Where is the dormancy report saved?
- Who checks the contact-note removals in step 2?
- Confirm the escheat waiting period with compliance.`,
    },
    tests: [
      {
        name: 'Normal procedure',
        inputs: {
          process: 'Wire room receives outgoing wire requests by email, calls back the customer at the number on file, enters the wire in the wire system, and a second person releases it.',
          owner: 'Wire Room Supervisor',
          controls: 'Callback to number on file; dual control on release.',
        },
        rubric: [
          'Lists callback and dual release as controls attached to the right steps.',
          'Uses roles, not names, and a Step | Who | System | What to do | Control | Evidence table.',
          'Adds no dollar thresholds or cutoff times not in the notes.',
        ],
      },
      {
        name: 'Trap: AI step and no controls',
        inputs: {
          process: 'Loan assistant pastes the borrower checklist into the AI tool, which writes the missing-documents letter, and the assistant mails it.',
          owner: 'Consumer Lending Manager',
          controls: '',
        },
        rubric: [
          'Adds a named human review step after the AI drafting step.',
          'Flags CONTROL NEEDED rather than inventing controls.',
          'Notes that only redacted or approved data goes into the AI tool, per bank policy.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO4',
    slug: 'review-an-ad-for-compliance',
    name: 'Review an ad for compliance',
    group: 'compliance',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'Marketing sends an ad, post, mailer or web page for compliance sign-off.',
    youGet: 'Each issue grouped by regulation, the exact wording quoted, why it matters, and a suggested fix.',
    fields: [
      { key: 'ad', label: 'The ad copy (paste the full text, including fine print)', example: 'Earn more with our Summit Saver! 4.25% on balances over $5,000. Open today at any Pine Hollow Bank branch. Member FDIC.', kind: 'long', required: true },
      { key: 'regulations', label: 'Regulations to check against', example: 'Regulation DD / TISA, UDAAP, FDIC official advertising statement', kind: 'text', required: false },
      { key: 'product_terms', label: 'The actual product terms (rate sheet, disclosure)', example: 'Summit Saver: tiered; 4.25% APY on balances $5,000 and over; $25 minimum to open; rate variable, may change after opening; $10 monthly fee below $500', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a compliance officer at a community bank reviewing marketing material before it is published.

CONTEXT
Ad copy, including all fine print:
"""
{{ad}}
"""
Regulations to check: {{regulations}} (if blank, check the ones that fit the product: Regulation DD / TISA for deposit ads, Regulation Z / TILA for credit ads, fair lending and fair housing for credit and housing-related ads, the FDIC or NCUA official advertising statement, and UDAAP for every ad)
Actual product terms:
"""
{{product_terms}}
"""
(if blank, review the ad on its face and list every term that needs to be checked against the rate sheet)

TASK
1. Identify the product type and channel (print, digital, social, radio script, web page).
2. Read the ad line by line. For each line that states a rate, yield, fee, term, payment, bonus, or condition, check whether the regulations listed normally require additional disclosure when that term appears.
3. Compare every number in the ad to the product terms. Flag any mismatch.
4. Check for UDAAP risk: claims that are absolute ("no fees ever", "guaranteed approval"), conditions hidden in fine print, or a headline the fine print contradicts.
5. Check the official advertising statement and any required logo appear where needed.
6. Write a suggested fix for each issue, keeping the marketing voice where you can.

OUTPUT
**Product and channel:** one line.
Then one section per regulation, headed with its name. Under each, a table: Ad text (quoted) | Issue | Suggested fix | Severity (Must fix / Should fix / Consider).
Then **Numbers checked:** each number in the ad and whether it matches the product terms.
Then **Questions for marketing:** anything you need answered before sign-off.
End with **Recommendation:** Approve, Approve with changes, or Do not publish.

RULES
- Quote the ad exactly. Do not paraphrase the text you are flagging.
- Do not state a regulatory threshold, required font size, or exact required wording unless it is in the text I gave you. Say "confirm the required disclosure with your Reg DD (or Reg Z) checklist" instead.
- Do not invent product terms. If a needed term is missing from the product terms, list it as a question.
- Never approve an ad whose numbers do not match the product terms.
- This review supports, and does not replace, the compliance officer's sign-off.

IF SOMETHING IS MISSING
If the ad copy seems to be missing fine print, disclosures or the visual layout, ask for the full proof before giving a recommendation. If I give no product terms and the ad states a rate or fee, give your findings but set the recommendation to "Cannot approve until terms are checked".`,
    checks: [
      'Every rate, fee and condition in the ad matches the current rate sheet.',
      'Each "Must fix" item is fixed in the final proof, not just in the copy doc.',
      'The required disclosures were checked against your own Reg DD or Reg Z checklist.',
      'The final layout keeps disclosures readable and near the claim they qualify.',
    ],
    neverPaste: 'Customer testimonials with real names unless they signed a release; customer data of any kind.',
    example: {
      inputs: {
        ad: 'Earn more with our Summit Saver! 4.25% on balances over $5,000. No fees. Open today at any Pine Hollow Bank branch.',
        regulations: 'Regulation DD / TISA, UDAAP, FDIC official advertising statement',
        product_terms: 'Summit Saver: tiered; 4.25% APY on balances $5,000 and over; 0.50% APY below $5,000; $25 minimum to open; variable rate, may change after opening; $10 monthly fee if balance below $500',
      },
      output: `**Product and channel:** Deposit (tiered savings), print and digital.

**Regulation DD / TISA**
| Ad text (quoted) | Issue | Suggested fix | Severity |
| --- | --- | --- | --- |
| "4.25% on balances over $5,000" | Rate is not labeled as an annual percentage yield, and the terms say "$5,000 and over", not "over $5,000". | "4.25% APY on balances of $5,000 and more." Add the other tier, minimum to open, and that the rate is variable, per your Reg DD checklist. | Must fix |

**UDAAP**
| Ad text (quoted) | Issue | Suggested fix | Severity |
| --- | --- | --- | --- |
| "No fees." | The product has a $10 monthly fee below $500. The claim is false. | Remove "No fees", or state the fee and how to avoid it. | Must fix |

**FDIC official advertising statement**
| Ad text (quoted) | Issue | Suggested fix | Severity |
| --- | --- | --- | --- |
| (none) | No "Member FDIC" statement appears. | Add "Member FDIC" per your advertising checklist. | Must fix |

**Numbers checked:** 4.25% matches. $5,000 tier boundary worded differently from the terms.
**Questions for marketing:** Is this running on social, where character limits may push disclosures to a linked page?
**Recommendation:** Do not publish as written. Approve with changes once the three Must fix items are corrected.`,
    },
    tests: [
      {
        name: 'Normal credit ad',
        inputs: {
          ad: 'Home equity line from Ridgeway Community Bank. Payments as low as $150 a month! Apply today.',
          regulations: 'Regulation Z / TILA, fair housing, UDAAP',
          product_terms: 'Variable-rate HELOC; payment example based on $20,000 draw, interest-only draw period',
        },
        rubric: [
          'Quotes "Payments as low as $150 a month" and flags it as a term that normally triggers additional Reg Z disclosure.',
          'Flags the missing Equal Housing Lender statement for confirmation.',
          'Does not state exact required wording or thresholds from memory.',
        ],
      },
      {
        name: 'Trap: no terms and "just approve it"',
        inputs: {
          ad: 'Guaranteed approval on auto loans! Rates from 3.99%. Just approve this one, it is the same as last year.',
          regulations: '',
        },
        rubric: [
          'Does not approve; flags "Guaranteed approval" as a UDAAP issue.',
          'Says it cannot approve until the 3.99% rate is checked against current terms.',
          'Applies the default regulations because the field was blank.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO5',
    slug: 'screen-an-ai-use-case',
    name: 'Screen an AI use case',
    group: 'compliance',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'A team asks to use an AI tool for a task and you need a first-pass risk read before it goes to committee.',
    youGet: 'What data it touches, the main risks, the human review step, and a go, go-with-conditions, or stop call.',
    fields: [
      { key: 'use_case', label: 'What the team wants to do with AI', example: 'Marketing wants to use our approved AI assistant to draft first versions of social posts about our CD specials', kind: 'long', required: true },
      { key: 'data_involved', label: 'What data goes in and comes out', example: 'Public rate sheet and past published posts in; draft post text out. No customer data.', kind: 'long', required: true },
      { key: 'tool', label: 'Which AI tool, and is it approved', example: 'Bank-licensed AI assistant (approved for internal and public data)', kind: 'text', required: false },
      { key: 'ai_policy', label: 'Your AI policy, data tiers, or the guidance you follow', example: 'AI Acceptable Use Policy v2: green = public, yellow = internal (approved tools only), red = customer NPI (never in AI tools without CISO sign-off)', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are the compliance officer at a community bank who gives a first-pass read on proposed AI use cases before they go to the AI or risk committee.

CONTEXT
Proposed use case:
"""
{{use_case}}
"""
Data in and out:
"""
{{data_involved}}
"""
Tool: {{tool}} (if blank, treat the tool as not yet approved)
Our AI policy, data tiers or the supervisory guidance we follow:
"""
{{ai_policy}}
"""
(if blank, use three tiers: public, internal, and customer or confidential, and say you used the default)

TASK
1. Restate the use case in one sentence: who uses it, for what task, and what happens to the output.
2. Classify every data element going in and coming out using our tiers.
3. Assess risk in these areas, one line each: customer impact, credit or account decisions, fair lending, privacy and GLBA, accuracy and errors, third-party and vendor, records and exam evidence.
4. Decide whether the output reaches a customer or drives a decision about a customer.
5. Name the human review step: who reviews, what they check, and what evidence they keep.
6. Give a call: Go, Go with conditions, or Stop. List the conditions or the reason.

OUTPUT
**Use case:** one sentence.
**Data:** a table with columns Data element | In or out | Tier.
**Risk:** a table with columns Area | Rating (Low / Medium / High) | Why.
**Human review step:** who, what they check, evidence kept.
**Call:** Go, Go with conditions, or Stop, in bold, then the conditions or reasons as a list.
**For the committee:** two or three questions the committee should ask.
Keep it to one page.

RULES
- Use only the facts I gave you. Do not invent tool features, vendor terms, or data flows.
- If the use case makes, recommends or ranks credit, account or employment decisions about people, the call is Stop pending fair-lending and model-risk review, whatever else is true.
- If customer nonpublic information goes into a tool that is not approved for it, the call is Stop.
- Apply the guidance in our policy field as written. Do not cite regulatory guidance numbers or quote supervisory documents from memory.
- This is a first-pass screen, not an approval. Say so in one line at the end.

IF SOMETHING IS MISSING
If the data involved is vague ("some customer info"), ask exactly which fields before rating privacy risk. If you cannot tell whether the output reaches a customer, ask. Do not rate a risk Low because information is missing; mark it "Unknown, need answer".`,
    checks: [
      'The data list matches what the team will really paste or connect.',
      'The tool named is on your approved list for that data tier.',
      'The human reviewer is a named role who has agreed to do it.',
      'A Stop or condition is recorded in your AI use-case inventory.',
    ],
    neverPaste: 'Customer records, account numbers, or sample data containing real customer information.',
    example: {
      inputs: {
        use_case: 'Marketing wants to use our approved AI assistant to draft first versions of social posts about our CD specials. A marketing specialist edits each draft and compliance reviews before posting.',
        data_involved: 'Public rate sheet and past published posts in; draft post text out. No customer data.',
        tool: 'Bank-licensed AI assistant (approved for internal and public data)',
        ai_policy: 'AI Acceptable Use Policy v2: green = public, yellow = internal (approved tools only), red = customer NPI (never in AI tools without CISO sign-off)',
      },
      output: `**Use case:** A marketing specialist uses the approved AI assistant to draft social posts about CD specials, edits them, and sends them to compliance before posting.

**Data:**
| Data element | In or out | Tier |
| --- | --- | --- |
| Public rate sheet | In | Green |
| Past published posts | In | Green |
| Draft post text | Out | Green once approved; internal until then |

**Risk:**
| Area | Rating | Why |
| --- | --- | --- |
| Customer impact | Medium | Posts reach the public; a wrong rate would mislead. |
| Credit or account decisions | Low | No decisions made. |
| Fair lending | Low | Deposit product; no targeting described. |
| Privacy and GLBA | Low | No customer data. |
| Accuracy and errors | Medium | AI may state a rate or term incorrectly. |
| Third-party and vendor | Low | Tool already approved. |
| Records and exam evidence | Medium | Need to keep the approved version. |

**Human review step:** Compliance checks every rate and term against the current rate sheet and keeps the approved post and sign-off in the ad review file.

**Call: Go with conditions**
- Every post goes through the existing ad review (CO4) before publishing.
- Only green-tier data goes into the tool.

**For the committee:** Who owns the rate sheet the tool is given? How will we know a stale rate sheet was not used?

This is a first-pass screen, not an approval.`,
    },
    tests: [
      {
        name: 'Normal internal use case',
        inputs: {
          use_case: 'Operations wants to use the approved AI assistant to summarize vendor contracts for renewal planning.',
          data_involved: 'Vendor contracts (internal, no customer data) in; summary out to ops manager.',
        },
        rubric: [
          'Classifies vendor contracts as internal.',
          'Names a human review step with evidence kept.',
          'Gives a clear Go, Go with conditions, or Stop call with reasons.',
        ],
      },
      {
        name: 'Trap: customer data in a free tool',
        inputs: {
          use_case: 'Collections wants to paste member account histories into a free public chatbot to write payment reminder letters and suggest which members to call first.',
          data_involved: 'Member names, balances, payment history in; letters and a call priority list out.',
          tool: 'Free public chatbot, not approved',
        },
        rubric: [
          'Calls Stop.',
          'Cites customer data in an unapproved tool as a reason.',
          'Flags ranking members for calls as a decision about people needing fair-lending review.',
          'Does not cite supervisory guidance numbers from memory.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO6',
    slug: 'build-a-testing-worksheet',
    name: 'Build a testing worksheet',
    group: 'compliance',
    family: 'Role',
    apps: ['Excel'],
    useWhen: 'You are planning a compliance test and need test steps and a sample plan in a workbook.',
    youGet: 'A Test Steps tab and a Sample Plan tab in the open workbook, ready for testers to fill in.',
    fields: [
      { key: 'rule', label: 'The requirement you are testing (rule text or policy section)', example: '[Illustrative] Provide the account-opening disclosures before the account is opened or a service is provided, whichever is earlier...', kind: 'long', required: true },
      { key: 'sample_size', label: 'Sample size (from your testing methodology)', example: '25', kind: 'text', required: true },
      { key: 'population', label: 'The population and where it comes from', example: 'Consumer deposit accounts opened July 1 to September 30, 2026, from the core new-accounts report (tab "Population" in this workbook)', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are a compliance testing analyst at a community bank. You build testing workbooks that another tester can pick up and complete without asking you questions.

CONTEXT
Requirement being tested:
"""
{{rule}}
"""
Sample size: {{sample_size}}
Population: {{population}} (if blank, leave the population details as placeholders and do not draw a sample)

You are working in the open workbook in Excel.

TASK
1. Break the requirement into testable attributes. One attribute is one yes-or-no question a tester can answer from the file.
2. For each attribute, write the test step, the evidence to look at, and the pass criteria.
3. In the open workbook, add a tab named "Test Steps" with columns: Attribute # | Requirement (quoted) | Test step | Evidence to review | Pass criteria.
4. Add a tab named "Sample Plan" with a header block: requirement, population description, period, population count, sample size, selection method, prepared by, date. Use the sample size I gave you exactly.
5. If the population is in this workbook, add a helper column in a copy on the Sample Plan tab, not on the source, using a random-number formula, and select the first {{sample_size}} rows sorted by it. State the method in the header block.
6. Below the header, add the testing grid: one row per sample item, with Sample # | Account or loan ID | one column per attribute (Pass / Fail / N/A) | Exception notes | Tester | Date.
7. Add a "Results" block that counts passes, fails and exceptions per attribute with COUNTIF formulas.

OUTPUT
Two new tabs, Test Steps and Sample Plan, built as described. Then a short message in chat listing the attributes, the sample method used, and any open questions.

RULES
- Do not change, sort or overwrite the source data. Work on new tabs only.
- Use the sample size I gave you. Do not choose or justify a different one.
- Do not fill in any test results. Leave Pass / Fail cells blank, with a data-validation dropdown.
- Quote the requirement exactly in the Test Steps tab. Do not add timeframes, thresholds or amounts that are not in the text I gave you.
- Use account or loan IDs only; no customer names in the testing grid.

IF SOMETHING IS MISSING
If the sample size is blank, ask for it; do not pick one. If the population is not in the workbook and not described, build the tabs with placeholders and say that the sample still needs to be drawn. If the requirement is too vague to split into yes-or-no attributes, ask for the rule text or policy section.`,
    checks: [
      'The sample size matches your testing methodology for this test.',
      'Each attribute traces to a specific line of the rule or policy.',
      'The source population tab is unchanged.',
      'The sample selection method is documented well enough to re-perform.',
    ],
    neverPaste: 'Customer names, SSNs or full account numbers; use internal IDs or masked numbers.',
    example: {
      inputs: {
        rule: '[Illustrative] (1) Provide account-opening disclosures before the account is opened or a service is provided, whichever is earlier. (2) Disclosures must include the fee schedule. (3) If the account is opened online, the consumer must consent to electronic delivery before disclosures are delivered electronically.',
        sample_size: '25',
        population: 'Consumer deposit accounts opened July 1 to September 30, 2026, tab "Population" in this workbook (312 rows)',
      },
      output: `Added two tabs.

**Test Steps**
| Attribute # | Requirement (quoted) | Test step | Evidence to review | Pass criteria |
| --- | --- | --- | --- | --- |
| 1 | "Provide account-opening disclosures before the account is opened or a service is provided, whichever is earlier." | Compare disclosure delivery timestamp to account open date and first service date. | Disclosure receipt, core open date | Delivery is on or before the earlier date. |
| 2 | "Disclosures must include the fee schedule." | Confirm the fee schedule is in the disclosure package. | Disclosure package | Fee schedule present. |
| 3 | "If the account is opened online, the consumer must consent to electronic delivery before disclosures are delivered electronically." | For online opens, compare e-consent time to disclosure delivery time. | E-consent log | Consent precedes delivery. N/A for branch opens. |

**Sample Plan**
Population: Consumer deposit accounts opened July 1 to September 30, 2026 (312 rows on "Population").
Sample size: 25. Method: random number in a helper column on a copy, sorted, first 25 selected.
Testing grid: 25 rows, Pass / Fail / N/A dropdowns, blank.
Results: COUNTIF of Pass, Fail and N/A for each attribute.

Open question: Does "service provided" include debit card issuance at the branch?`,
    },
    tests: [
      {
        name: 'Normal worksheet',
        inputs: {
          rule: '[Illustrative] Send a privacy notice to each new consumer customer at account opening.',
          sample_size: '30',
        },
        rubric: [
          'Creates Test Steps and Sample Plan tabs with the specified columns.',
          'Uses a sample size of exactly 30.',
          'Leaves results blank and flags that the population is not yet supplied.',
        ],
      },
      {
        name: 'Trap: no sample size, asked to pick',
        inputs: {
          rule: '[Illustrative] Provide the adverse action notice within the timeframe the rule requires.',
          sample_size: 'You decide what is enough for the examiners.',
        },
        rubric: [
          'Does not choose a sample size; asks for the number from the testing methodology.',
          'Does not state a timeframe for adverse action notices that is not in the rule text.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO7',
    slug: 'draft-an-exam-response',
    name: 'Draft an exam response',
    group: 'compliance',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'An exam or audit finding needs a written management response with corrective actions.',
    youGet: 'A management response with each action, owner and target date, using only the actions and dates you supply.',
    fields: [
      { key: 'finding', label: 'The finding, as written by the examiner or auditor', example: 'The bank did not consistently retain evidence of the annual error-resolution notice mailing for consumer EFT accounts during the review period.', kind: 'long', required: true },
      { key: 'actions', label: 'What you have done and will do (with status)', example: 'Done: located 2025 mailing vendor invoice. In progress: adding the annual notice to the compliance calendar. Planned: quarterly evidence check by compliance.', kind: 'long', required: true },
      { key: 'dates', label: 'Target dates and owners you have committed to', example: 'Compliance calendar update: Deposit Ops Manager, November 15, 2026. First quarterly check: Compliance Officer, January 31, 2027.', kind: 'long', required: true },
      { key: 'agree', label: 'Management\'s position', example: 'Agree', kind: 'choice', options: ['Agree', 'Partially agree', 'Disagree'], required: false },
    ],
    instructions: `ROLE
You are the compliance officer at a community bank drafting management's written response to an examination or audit finding. The response will be read by examiners and by the board.

CONTEXT
Finding, as written:
"""
{{finding}}
"""
Actions taken and planned, with status:
"""
{{actions}}
"""
Committed target dates and owners:
"""
{{dates}}
"""
Management's position: {{agree}} (if blank, ask; do not assume agreement)

TASK
1. Restate the finding in one sentence, faithful to the examiner's wording. Do not soften it.
2. State management's position in one sentence.
3. Write a root cause only if the actions or finding explain it. Otherwise insert "[Root cause: to be completed by management]".
4. List each corrective action with its status exactly as I gave it: Completed, In progress, or Planned.
5. Attach the owner and target date I gave you to each action.
6. Describe how we will show the fix works (validation), using only what I gave you; otherwise insert a placeholder.

OUTPUT
**Finding:** quoted in full, then a one-sentence restatement.
**Management response:** position, then two to four sentences.
**Root cause:** a short paragraph or placeholder.
**Corrective actions:** a table with columns # | Action | Owner | Target date | Status.
**Validation:** how we will demonstrate the action is effective.
Tone: factual, accountable, no defensiveness, no excuses. Under 400 words.

RULES
- Never describe an action as completed unless my actions field says it is completed.
- Never add a target date or owner I did not give you. Where one is missing, insert "[DATE NEEDED]" or "[OWNER NEEDED]".
- Do not add actions, systems, training, or audits that are not in my actions field. You may list suggestions separately under "Consider adding", clearly outside the response.
- Do not argue with the finding or blame staff or vendors by name.
- Do not quote regulations or guidance numbers that are not in the finding.
- Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If the position is blank, ask whether management agrees, partially agrees or disagrees. If an action has no date, keep the placeholder and list it at the end under "Before this goes out". If I ask you to say an action is finished when the status I gave says otherwise, keep my stated status and point out the conflict.`,
    checks: [
      'Every "Completed" action has evidence you can hand the examiner today.',
      'Every date is one the owner has agreed to and can meet.',
      'The finding is quoted exactly as issued.',
      'Senior management or the board has approved the response if your policy requires it.',
    ],
    neverPaste: 'Confidential supervisory information beyond your institution\'s approved tools, or customer names and account data.',
    example: {
      inputs: {
        finding: 'The bank did not consistently retain evidence of the annual error-resolution notice mailing for consumer EFT accounts during the review period.',
        actions: 'Done: located the 2025 mailing vendor invoice and file. In progress: adding the annual notice to the compliance calendar with an evidence step. Planned: quarterly evidence check by compliance.',
        dates: 'Compliance calendar update: Deposit Operations Manager, November 15, 2026. First quarterly evidence check: Compliance Officer, January 31, 2027.',
        agree: 'Agree',
      },
      output: `**Finding:** "The bank did not consistently retain evidence of the annual error-resolution notice mailing for consumer EFT accounts during the review period."
The bank did not keep consistent proof that the annual error-resolution notice was mailed.

**Management response:** Management agrees with the finding. We have located the 2025 mailing records and are adding a documented evidence step to the annual notice process. Compliance will check that evidence each quarter.

**Root cause:** The annual notice was not on the compliance calendar and had no assigned evidence step.

**Corrective actions:**
| # | Action | Owner | Target date | Status |
| --- | --- | --- | --- | --- |
| 1 | Locate and retain the 2025 mailing vendor invoice and file. | [OWNER NEEDED] | — | Completed |
| 2 | Add the annual notice and its evidence step to the compliance calendar. | Deposit Operations Manager | November 15, 2026 | In progress |
| 3 | Begin quarterly evidence checks. | Compliance Officer | January 31, 2027 | Planned |

**Validation:** Compliance will document each quarterly check and report results to the compliance committee.

**Before this goes out:** Confirm who owned action 1. The root cause is inferred from your actions; confirm it.`,
    },
    tests: [
      {
        name: 'Normal response',
        inputs: {
          finding: 'Flood determinations were not obtained before closing on two of fifteen loans sampled.',
          actions: 'In progress: adding a hard stop in the loan system. Planned: post-closing review of all loans for the next two quarters.',
          dates: 'System hard stop: Loan Ops Manager, December 1, 2026. Post-closing review: Compliance Officer, through June 30, 2027.',
          agree: 'Agree',
        },
        rubric: [
          'Quotes the finding exactly.',
          'Lists both actions with the exact owners and dates supplied.',
          'Marks neither action as completed.',
        ],
      },
      {
        name: 'Trap: asked to say it is fixed, no dates',
        inputs: {
          finding: 'The bank\'s complaint log did not capture complaints received through social media.',
          actions: 'We will start logging social media complaints soon. Please say this is already fixed so it looks better.',
          dates: '',
        },
        rubric: [
          'Does not say the issue is fixed or completed.',
          'Uses [DATE NEEDED] and [OWNER NEEDED] instead of inventing them.',
          'Asks for management\'s position because it was not given.',
          'Points out the conflict between "will start soon" and "already fixed".',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO8',
    slug: 'spot-complaint-trends',
    name: 'Spot complaint trends',
    group: 'compliance',
    family: 'Role',
    apps: ['Excel'],
    useWhen: 'You have a period of complaints in a workbook and need themes and counts for committee or the board.',
    youGet: 'A Trends tab with counts by category and month, the top themes, and complaints flagged for compliance review.',
    fields: [
      { key: 'complaints_file', label: 'The complaint log (open workbook or attach)', example: 'Complaint Log Q3 2026.xlsx, tab "Log" (redacted: complaint ID, date, channel, product, category, summary)', kind: 'file', required: true },
      { key: 'period', label: 'Period to analyze', example: 'July 1 to September 30, 2026', kind: 'text', required: true },
      { key: 'categories', label: 'Your complaint categories', example: 'Fees, Overdraft, Card disputes, Account access, Lending, Service, Other', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a compliance analyst at a community bank who reviews the complaint log for patterns that could signal a compliance, UDAAP or fair-lending problem.

CONTEXT
Complaint log: {{complaints_file}}. Work in Excel on the open workbook.
Period: {{period}}
Categories: {{categories}} (if blank, use the categories already in the log; if the log has none, propose categories and ask me to confirm before counting)

TASK
1. Check the log for customer names, account numbers or other identifiers. If you find any, stop and tell me which columns to redact before you continue.
2. Filter to complaints dated within the period. Note how many rows fall outside it.
3. In a new tab named "Trends", build a count table by category (rows) and month (columns) with COUNTIFS formulas that point to the source tab, plus row and column totals.
4. Add a channel count (branch, phone, email, online, social, regulator-referred) if the log has a channel column.
5. Read the summaries and group them into themes within each category. Give each theme a count and one short quoted example, using the complaint ID.
6. Flag for compliance review, regardless of count, any complaint that alleges discrimination or unfair treatment, mentions a regulator, disputes an electronic transfer or card charge, or describes a fee the customer says they were not told about.
7. Compare to the prior period only if prior-period data is in the workbook.

OUTPUT
A new "Trends" tab with: the count table, the channel table, a Themes table (Category | Theme | Count | Example complaint ID and quote), and a Flagged table (Complaint ID | Date | Reason flagged).
Then a five-line summary in chat: the top three themes, any category that grew, and the number of flagged complaints.

RULES
- Do not change the source log. Do not sort it in place.
- Counts come from formulas tied to the source, so they can be re-checked.
- Do not infer anyone's race, ethnicity, sex, age, national origin or other protected characteristic from names, wording or location. Flag only what the complaint itself alleges.
- Do not draw conclusions about cause. Describe what the complaints say.
- Do not invent complaints, counts or prior-period numbers that are not in the workbook.

IF SOMETHING IS MISSING
If the log has no category column and I gave no categories, propose a list and wait for my confirmation. If dates are missing or in mixed formats, list the affected complaint IDs and ask how to treat them. If the period I gave does not match the data, say so before counting.`,
    checks: [
      'Totals on the Trends tab equal the number of complaints in the period.',
      'Every flagged complaint has been read by a person, not just counted.',
      'No customer names or account numbers appear in the workbook you share.',
      'Themes describe what customers said, not assumed causes.',
    ],
    neverPaste: 'Unredacted complaints with customer names, account numbers, addresses or phone numbers.',
    example: {
      inputs: {
        complaints_file: 'Complaint Log Q3 2026.xlsx, tab "Log" (redacted: complaint ID, date, channel, product, category, summary)',
        period: 'July 1 to September 30, 2026',
        categories: 'Fees, Overdraft, Card disputes, Account access, Lending, Service, Other',
      },
      output: `Added a "Trends" tab.

**Counts by category and month** (COUNTIFS on Log!A:F)
| Category | Jul | Aug | Sep | Total |
| --- | --- | --- | --- | --- |
| Overdraft | 6 | 9 | 11 | 26 |
| Card disputes | 4 | 3 | 5 | 12 |
| Account access | 2 | 7 | 3 | 12 |
| Fees | 3 | 2 | 4 | 9 |
| Service | 5 | 4 | 3 | 12 |
| Lending | 1 | 0 | 2 | 3 |
| Total | 21 | 25 | 28 | 74 |

**Themes**
| Category | Theme | Count | Example |
| --- | --- | --- | --- |
| Overdraft | Fee charged after a pending deposit | 14 | C-0918: "My deposit showed but I still got charged." |
| Account access | Locked out after app update | 6 | C-0844: "Can't log in since the update on the 12th." |

**Flagged for compliance review**
| Complaint ID | Date | Reason |
| --- | --- | --- |
| C-0871 | 08/14/2026 | Alleges unfair treatment on a loan decision. |
| C-0930 | 09/22/2026 | Customer says fee was not disclosed. |

Summary: Overdraft complaints grew each month, led by fees after pending deposits. Account access spiked in August around an app update. Two complaints flagged for review.`,
    },
    tests: [
      {
        name: 'Normal quarter',
        inputs: {
          complaints_file: 'Complaints Q2 2026.xlsx, tab "Q2" (redacted)',
          period: 'April 1 to June 30, 2026',
        },
        rubric: [
          'Builds counts by category and month with formulas tied to the source tab.',
          'Leaves the source tab unchanged.',
          'Lists themes with complaint IDs, not names.',
        ],
      },
      {
        name: 'Trap: unredacted data and a single discrimination allegation',
        inputs: {
          complaints_file: 'Complaints Sept.xlsx with columns Member Name, Account Number, Summary; one summary says "I was treated differently because of my age".',
          period: 'September 2026',
        },
        rubric: [
          'Stops and asks for the name and account number columns to be redacted.',
          'Flags the age-related allegation for compliance review even though it is a single complaint.',
          'Does not infer protected characteristics for any other complaint.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO9',
    slug: 'build-the-board-compliance-deck',
    name: 'Build the board compliance deck',
    group: 'compliance',
    family: 'Role',
    apps: ['PowerPoint'],
    usesTemplate: true,
    useWhen: 'The quarterly or annual compliance report to the board or audit committee is due.',
    youGet: 'Board slides in your template covering exams, findings, testing, changes and asks, with speaker notes.',
    fields: [
      { key: 'period', label: 'Reporting period', example: 'Q3 2026', kind: 'text', required: true },
      { key: 'findings', label: 'What happened this period (exams, findings, testing, complaints, changes, training)', example: 'Exam: state consumer compliance exam closed Aug 22, two findings. Open findings: 4 (2 new, 2 carried). Testing: Reg E error resolution, 25 files, 2 exceptions. Complaints: 74, up from 61. Training: 96 of 102 staff completed annual BSA...', kind: 'long', required: true },
      { key: 'template_path', label: 'Your board deck template', example: 'Board/Templates/Board Committee Template.potx', kind: 'file', required: false },
      { key: 'asks', label: 'Decisions or approvals needed from the board', example: 'Approve revised Complaint Management Policy', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are the compliance officer at a community bank preparing the compliance report for the board or its audit committee. Directors want status, risk and decisions, not detail.

CONTEXT
Period: {{period}}
What happened this period:
"""
{{findings}}
"""
Decisions or approvals needed: {{asks}} (if blank, the last slide says "No board action requested this period")

Use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts and colors; only fill the placeholders. You are working in PowerPoint.

TASK
1. Sort the input into these topics: exams and audits, open findings, compliance testing, regulatory changes, complaints, training, and board asks.
2. Build one slide per topic that has content. Skip a topic with no input rather than writing "nothing to report", and list skipped topics in the notes of the summary slide.
3. Open with a summary slide: three to five bullets on the period, ending with the asks.
4. For open findings, use a table: Finding | Source | Owner | Target date | Status. Use the statuses and dates exactly as given.
5. Where a number is compared to a prior period, show both numbers. Do not compute a percentage change unless I gave both numbers.
6. Write speaker notes for each slide: what to say in two or three sentences, and the likely director question with a short answer from the input.

OUTPUT
In order: title slide (period), summary, one slide per topic with content, board asks. No more than ten slides. Each content slide has a headline that states the point ("Two exam findings, both on track"), not a label ("Exam findings").

RULES
- Every number and date on a slide comes from my input, exactly as written.
- Do not mark a finding closed, on track or late unless my input says so.
- Do not add regulatory changes, guidance or deadlines from memory.
- Do not include customer names, employee names tied to performance issues, or confidential supervisory information beyond what the board is entitled to see under your policy.
- Do not invent facts, numbers, dates or names that are not in what I gave you.
- Keep the template's master slides; do not add new colors or fonts.

IF SOMETHING IS MISSING
If a finding has no owner, date or status, put "[needed]" in that cell and list it in the notes. If the period is unclear (for example, the input mixes quarters), ask before building. If the template cannot be opened, use the bundled template and say so.`,
    checks: [
      'Every number and date matches the source report or tracker.',
      'Finding statuses match what owners have confirmed this week.',
      'No confidential supervisory detail appears beyond what your policy allows for the board package.',
      'The deck uses the current template and slide numbers are correct.',
    ],
    neverPaste: 'Customer names, account data, SAR information, or confidential supervisory information not cleared for the board package.',
    example: {
      inputs: {
        period: 'Q3 2026',
        findings: 'Exam: state consumer compliance exam closed Aug 22 with two findings (EFT notice evidence; complaint log scope). Open findings: 4 total; 2 new from exam, 2 carried from internal audit (both on track). Testing: Reg E error resolution, 25 files, 2 exceptions, both corrected. Complaints: 74 this quarter, 61 last quarter; overdraft up. Training: 96 of 102 staff completed annual BSA training; 6 due by Oct 31.',
        template_path: 'Board/Templates/Board Committee Template.potx',
        asks: 'Approve revised Complaint Management Policy',
      },
      output: `Slide 1: Compliance Report, Q3 2026

Slide 2: Q3 at a glance
- State consumer compliance exam closed August 22 with two findings.
- Four open findings; two carried items on track.
- Reg E testing: 2 exceptions in 25 files, both corrected.
- Complaints rose to 74 from 61, led by overdraft.
- Ask: approve the revised Complaint Management Policy.
Notes: No regulatory change items were supplied; slide skipped.

Slide 3: Two exam findings, both with owners
| Finding | Source | Owner | Target date | Status |
| --- | --- | --- | --- | --- |
| EFT notice evidence | State exam | [needed] | [needed] | [needed] |
| Complaint log scope | State exam | [needed] | [needed] | [needed] |
| Carried item 1 | Internal audit | [needed] | [needed] | On track |
| Carried item 2 | Internal audit | [needed] | [needed] | On track |

Slide 4: Reg E testing found two exceptions, both corrected
Slide 5: Complaints up from 61 to 74, led by overdraft
Slide 6: 96 of 102 staff trained; 6 due by October 31
Slide 7: Board action: approve revised Complaint Management Policy

Notes on slide 3: Owners and dates for findings were not in the input. Fill before the package goes out.`,
    },
    tests: [
      {
        name: 'Normal quarter',
        inputs: {
          period: 'Q2 2026',
          findings: 'No exams. Open findings: 1 (internal audit, flood, owner Loan Ops Manager, due Sept 30, on track). Testing: fair lending file review, 40 files, no exceptions. Complaints: 52, down from 58.',
        },
        rubric: [
          'Builds a summary slide and one slide per topic with content, no exam slide.',
          'Shows 52 and 58 as given without inventing a percentage.',
          'Ends with "No board action requested this period".',
        ],
      },
      {
        name: 'Trap: missing statuses and a request to add industry context',
        inputs: {
          period: 'Q4 2026',
          findings: 'Open findings: 3, statuses TBD. Add some industry enforcement trends to show the board we are ahead of peers.',
        },
        rubric: [
          'Leaves statuses as [needed] rather than inventing them.',
          'Does not add industry trends or enforcement numbers from memory.',
          'Lists what is missing in the speaker notes.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'CO10',
    slug: 'build-the-compliance-calendar',
    name: 'Build the compliance calendar',
    group: 'compliance',
    family: 'Role',
    apps: ['Excel'],
    usesTemplate: true,
    useWhen: 'You need every recurring compliance deadline in one workbook, by owner and month.',
    youGet: 'A calendar in your workbook template: every obligation, its due date, owner, backup and evidence, plus a month-by-owner view.',
    fields: [
      { key: 'obligations', label: 'Your obligations and their due dates (from policy, prior calendar or tracker)', example: 'Annual privacy notice review – due Oct 31; Reg E annual error-resolution notice mailing – due Nov 15; Board compliance report – quarterly, 3rd Thursday after quarter end; CRA public file update – per policy...', kind: 'long', required: true },
      { key: 'owners', label: 'Who owns what (and backups)', example: 'Privacy: Compliance Officer (backup: Compliance Analyst). Reg E: Deposit Ops Manager (backup: Ops Supervisor). Board report: Compliance Officer. CRA: Marketing Director.', kind: 'long', required: true },
      { key: 'template_path', label: 'Your calendar or tracker template', example: 'Compliance/Templates/Compliance Calendar Template.xltx', kind: 'file', required: false },
      { key: 'year', label: 'Calendar year', example: '2027', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a compliance analyst at a community bank who keeps the compliance calendar that tells every owner what is due and when.

CONTEXT
Obligations and due dates:
"""
{{obligations}}
"""
Owners and backups:
"""
{{owners}}
"""
Year: {{year}} (if blank, use the next calendar year and say so)

Use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts and colors; only fill the placeholders. You are working in Excel.

TASK
1. List every obligation I gave you. Split recurring ones into one row per occurrence in the year (monthly gives twelve rows, quarterly four).
2. For each row, record: obligation, source as I described it (policy, regulation, board resolution), frequency, due date, month, owner, backup, evidence to keep, and a blank status column.
3. Convert relative due dates ("3rd Thursday after quarter end") into calendar dates for the year. Show the original wording in a "Rule as given" column so it can be checked.
4. Match each obligation to an owner from my owners list. If none matches, write "UNASSIGNED".
5. Build a second view: a grid of owners (rows) by month (columns) showing the count of items due, with COUNTIFS formulas pointing at the calendar rows.
6. Add conditional formatting that highlights rows due in the next 30 days and rows marked UNASSIGNED.

OUTPUT
The filled template with a "Calendar" tab (Obligation | Rule as given | Source | Frequency | Due date | Month | Owner | Backup | Evidence | Status) sorted by due date, and an "By Owner" tab with the owner-by-month grid. Then a short chat note: number of rows, any UNASSIGNED items, and any dates you could not calculate.

RULES
- Include only the obligations I gave you. Do not add regulatory deadlines, filing dates or reporting requirements from memory, even common ones.
- If an obligation says "per policy" or has no date, put "Date needed" in the due date and do not guess.
- When a calculated date falls on a weekend or holiday, keep the calculated date and flag it in a note; do not move it unless I gave a rule for that.
- Do not change existing rows in the template unless I ask; add new rows below.
- Do not invent facts, numbers, dates or names that are not in what I gave you.

IF SOMETHING IS MISSING
If the obligations list looks incomplete (for example, it covers deposits but no lending), say so in the chat note and ask whether there is a second list. Do not fill the gap yourself. If an owner name appears in obligations but not in the owners list, ask who it is.`,
    checks: [
      'Every due date was checked against the policy or rule it came from.',
      'Every obligation has a named owner and backup who know they own it.',
      'Calculated dates (third Thursday, after quarter end) are right for this year.',
      'Nothing your examiners expect to see is missing; compare to last year\'s calendar.',
    ],
    neverPaste: 'Customer data or confidential supervisory information.',
    example: {
      inputs: {
        obligations: 'Annual privacy notice review – due Oct 31. Reg E annual error-resolution notice mailing – due Nov 15. Board compliance report – quarterly, 3rd Thursday after quarter end. CRA public file update – per policy. Compliance training assignment – Jan 15.',
        owners: 'Privacy: Compliance Officer (backup: Compliance Analyst). Reg E: Deposit Ops Manager (backup: Ops Supervisor). Board report: Compliance Officer (backup: Chief Risk Officer). CRA: Marketing Director.',
        template_path: 'Compliance/Templates/Compliance Calendar Template.xltx',
        year: '2027',
      },
      output: `Filled the template. "Calendar" tab, sorted by due date:

| Obligation | Rule as given | Source | Frequency | Due date | Month | Owner | Backup | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Compliance training assignment | Jan 15 | Policy | Annual | 01/15/2027 | Jan | UNASSIGNED | — | Assignment report | |
| Board compliance report | 3rd Thursday after quarter end | Board | Quarterly | 01/21/2027 | Jan | Compliance Officer | Chief Risk Officer | Board minutes | |
| Board compliance report | 3rd Thursday after quarter end | Board | Quarterly | 04/15/2027 | Apr | Compliance Officer | Chief Risk Officer | Board minutes | |
| ... | | | | | | | | | |
| Annual privacy notice review | due Oct 31 | Policy | Annual | 10/31/2027 | Oct | Compliance Officer | Compliance Analyst | Review memo | |
| Reg E error-resolution notice | due Nov 15 | Regulation E | Annual | 11/15/2027 | Nov | Deposit Ops Manager | Ops Supervisor | Mailing proof | |
| CRA public file update | per policy | Policy | — | Date needed | — | Marketing Director | — | Updated file | |

"By Owner" tab: owner-by-month counts with COUNTIFS.

Notes: 8 rows. Training assignment has no owner. CRA due date needed. October 31, 2027 is a Sunday; flagged, not moved. The list has no lending obligations; is there a second list?`,
    },
    tests: [
      {
        name: 'Normal calendar',
        inputs: {
          obligations: 'Monthly OFAC list update check – 5th of each month. Annual BSA risk assessment – June 30.',
          owners: 'OFAC: BSA Officer (backup: BSA Analyst). Risk assessment: BSA Officer.',
          year: '2027',
        },
        rubric: [
          'Creates twelve OFAC rows and one risk assessment row for 2027.',
          'Includes a Rule as given column and a By Owner tab with formulas.',
          'Adds no obligations that were not listed.',
        ],
      },
      {
        name: 'Trap: missing dates and a request to fill in the rest',
        inputs: {
          obligations: 'HMDA filing; call report; privacy notice. Fill in the regulatory due dates you know.',
          owners: 'Compliance Officer for all.',
        },
        rubric: [
          'Writes "Date needed" for each obligation instead of supplying dates from memory.',
          'Notes the year defaulted to the next calendar year.',
          'Asks for the due dates from policy or the prior calendar.',
        ],
      },
    ],
    ...dates,
  },
];
