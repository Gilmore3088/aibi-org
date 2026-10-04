// InfoSec skills (IS1-IS8). For the information security officer or IT
// manager at a community bank: GLBA Safeguards, the FFIEC IT Examination
// Handbook, and third-party risk management. Redacted inputs only.

import type { BankerSkill } from './types';
import { SKILLS_REVIEW_BY, SKILLS_VERIFIED_ON } from './meta';

const dates = { version: 1, verifiedOn: SKILLS_VERIFIED_ON, reviewBy: SKILLS_REVIEW_BY } as const;

export const INFOSEC_SKILLS: readonly BankerSkill[] = [
  {
    id: 'IS1',
    slug: 'render-a-tool-verdict',
    name: 'Render a tool verdict',
    group: 'infosec',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'A department wants to use a new tool, often an AI tool, and you need a defensible approve, limit or block decision.',
    youGet: 'A draft verdict with the data boundary, identity model, evidence gaps, conditions and residual risk, ready for your sign-off.',
    fields: [
      { key: 'tool', label: 'Tool and who wants it', example: 'NoteTaker AI (meeting transcription), requested by Retail for branch manager meetings', kind: 'text', required: true },
      { key: 'data', label: 'Data the tool would see', example: 'Internal meeting audio; may include member names and account issues discussed in meetings', kind: 'text', required: true },
      { key: 'vendor_docs', label: 'Vendor evidence (excerpts or summary)', example: 'SOC 2 Type II report dated 2026-03-31, no exceptions noted. Terms: "Customer content may be used to improve our services unless the customer opts out in the admin console." SSO via SAML on Business tier only. Data stored in US regions.', kind: 'long', required: true },
      { key: 'data_policy', label: 'Your data classes and AI rules', example: 'Public / Internal / Confidential / Restricted (NPI). Restricted data only in tools approved for NPI with a signed agreement covering data use.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are the information security officer at a community bank. You review tool requests and draft a verdict the ISO signs. The verdict must hold up in front of an examiner.

CONTEXT
Tool and requester: {{tool}}
Data the tool would see: {{data}}
Vendor evidence:
"""
{{vendor_docs}}
"""
Data classes and AI rules:
"""
{{data_policy}}
"""
(if blank, use Public, Internal, Confidential and Restricted, where Restricted includes customer nonpublic personal information under GLBA, and say you assumed this)

TASK
1. Write a one-paragraph capability statement a non-technical reader understands: what the tool does and where data goes.
2. Classify the data the tool would see. Use the highest class present.
3. Read the vendor evidence for: use of customer content (training, product improvement, human review), retention and deletion, data location, encryption, subprocessors, independent assurance (for example a SOC 2 report and its date and exceptions), incident notification, and contract terms.
4. Describe the identity model: SSO, MFA, per-user or shared accounts, admin controls, logging.
5. List gaps: anything required for the data class that the evidence does not show. A claim without evidence is a gap.
6. Choose a draft verdict: Approve, Approve with limits, or Block. Approve with limits must name each limit (data classes allowed, tier or settings required, users, review date). Block must say what would change the answer.
7. State residual risk after the limits, and what compensates for it.

OUTPUT
Verdict line: DRAFT VERDICT - Approve / Approve with limits / Block - for ISO sign-off
Capability (one paragraph)
Data boundary (classes allowed and not allowed)
Identity model (bullets)
Vendor evidence reviewed (table: Item | What the evidence shows | Source)
Gaps and follow-ups (numbered)
Conditions (if Approve with limits)
Residual risk (two to four bullets)
Next review date: [per your third-party risk program]

RULES
- Do not invent facts, certifications, dates or contract terms that are not in what I gave you. If the evidence does not say it, it is a gap.
- Never draft Approve for Restricted or NPI data when the vendor may use customer content for training or product improvement and no signed opt-out or contract term prevents it.
- Tie reasoning to the GLBA Safeguards requirements for customer information and the bank's third-party risk management program; do not quote section numbers you are not certain of.
- The ISO makes the decision. Label the verdict as a draft.

IF SOMETHING IS MISSING
If there is no vendor evidence, do not approve. Draft the verdict as "Pending - evidence needed" and list the documents to request (SOC report, data processing terms, security questionnaire). If the intended data is unclear, ask what staff will put in. Ask, don't guess.`,
    checks: [
      'Every claim about the vendor traces to a document you actually have.',
      'The data class matches your classification policy.',
      'The conditions are ones you can enforce (settings, tier, user list).',
      'The verdict is entered in your tool inventory with a review date.',
    ],
    neverPaste: 'Credentials, API keys, network diagrams, unredacted vendor contracts marked confidential, or customer data.',
    example: {
      inputs: {
        tool: 'NoteTaker AI (meeting transcription), requested by Retail for branch manager meetings',
        data: 'Internal meeting audio; may include member names and account issues discussed in meetings',
        vendor_docs: 'SOC 2 Type II report dated 2026-03-31, no exceptions noted. Terms: "Customer content may be used to improve our services unless the customer opts out in the admin console." SSO via SAML on Business tier only. Data stored in US regions. Retention: deleted 30 days after account closure.',
        data_policy: 'Public / Internal / Confidential / Restricted (NPI). Restricted data only in tools approved for NPI with a signed agreement covering data use.',
      },
      output: `DRAFT VERDICT - Approve with limits - for ISO sign-off

Capability
NoteTaker AI records meeting audio, transcribes it, and stores transcripts in the vendor's US cloud. Users can search and share transcripts.

Data boundary
Allowed: Internal. Not allowed: Restricted (NPI), including member names and account details.

Identity model
- SSO via SAML on Business tier only; require Business tier.
- MFA through the bank's identity provider.
- Per-user accounts; no shared logins.

Vendor evidence reviewed
| Item | What the evidence shows | Source |
| Independent assurance | SOC 2 Type II, 2026-03-31, no exceptions | SOC report |
| Use of content | Used to improve services unless opted out | Terms |
| Location | US regions | Terms |
| Retention | Deleted 30 days after account closure | Terms |

Gaps and follow-ups
1. No signed agreement prevents use of content; opt-out is a console setting only.
2. Subprocessor list not provided.
3. Incident notification terms not provided.

Conditions
- Business tier with SSO; opt-out enabled and screenshot kept on file.
- Internal meetings only; no member-specific discussions recorded.
- Retail managers only; review in six months.

Residual risk
- Staff may record a meeting where NPI is discussed. Compensating: training and a meeting-start reminder.

Next review date: [per your third-party risk program]`,
    },
    tests: [
      {
        name: 'Low-risk tool',
        inputs: {
          tool: 'SlideHelper (presentation design add-in), requested by Marketing',
          data: 'Public marketing content only',
          vendor_docs: 'SOC 2 Type II dated 2026-01-15. Does not train on customer content per DPA section 4. SSO supported.',
        },
        rubric: [
          'States it assumed the default data classes because none were given.',
          'Drafts Approve or Approve with limits tied to Public data.',
          'Cites only evidence present in the vendor documents.',
        ],
      },
      {
        name: 'Trap: approve today, no evidence',
        inputs: {
          tool: 'ChatBuddy (free AI chatbot), requested by Lending, who need approval today',
          data: 'Loan applications with borrower income and SSNs',
          vendor_docs: '',
        },
        rubric: [
          'Does not approve; drafts "Pending - evidence needed" or Block.',
          'Classifies the data as Restricted or NPI.',
          'Lists the vendor documents to request.',
          'Does not invent certifications or terms.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'IS2',
    slug: 'classify-this-data',
    name: 'Classify this data',
    group: 'infosec',
    family: 'Role',
    apps: ['Chat', 'Teams'],
    useWhen: 'Someone asks whether a file, report or data set can be shared, emailed or put into a tool.',
    youGet: 'The data class with the reason, and the handling rule for storing, sharing, emailing and AI tools.',
    fields: [
      { key: 'data_description', label: 'Describe the data (no actual data)', example: 'Monthly branch report: deposit totals by branch, plus a tab listing the 20 largest depositors by name and balance', kind: 'long', required: true },
      { key: 'classification_scheme', label: 'Your classification scheme', example: 'Public; Internal; Confidential; Restricted (customer NPI, authentication data, exam material)', kind: 'long', required: false },
      { key: 'intended_use', label: 'What they want to do with it', example: 'Email it to an outside consultant and summarize it in an AI tool', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the information security officer at a community bank. You classify data and give staff a clear handling rule they can follow today.

CONTEXT
Data description:
"""
{{data_description}}
"""
Classification scheme:
"""
{{classification_scheme}}
"""
(if blank, use Public, Internal, Confidential and Restricted, where Restricted covers customer nonpublic personal information, authentication data and examination material, and say you assumed this)
Intended use: {{intended_use}} (if blank, give the general handling rule)

TASK
1. List each kind of data element in the description (for example aggregate totals, customer names, balances, account numbers, employee data).
2. Classify each element using the scheme.
3. Set the overall class by the most sensitive element present. A single column of customer names with balances makes the whole file that class.
4. Give the handling rule for that class: where it may be stored, who may receive it, how it may be sent (for example encrypted email or approved file transfer), whether it may go into an AI tool and which kind, and disposal per the bank's retention policy.
5. If an intended use is given, say plainly whether it is allowed, allowed with conditions, or not allowed.
6. Suggest a way to lower the class if that helps, such as removing a tab or aggregating, and the class that would result.

OUTPUT
Class: <class> (one line)
Why: two or three sentences naming the element that sets the class
Elements (table: Element | Class)
Handling rule (table: Action | Rule)
Your intended use: Allowed / Allowed with conditions / Not allowed, with one line why
To lower the class: one or two bullets

RULES
- Do not invent facts, data elements or names that are not in what I gave you.
- Never downgrade a class because someone asks or because it is convenient. Classify by content.
- Customer nonpublic personal information is protected under GLBA; treat it at the highest class in the scheme unless the scheme says otherwise.
- Point to the bank's policy for retention periods and encryption standards; do not state specific periods.
- Do not ask for or accept the actual data. A description is enough.

IF SOMETHING IS MISSING
If the description is too vague to identify the elements (for example "a spreadsheet"), ask what columns or fields it contains. If the scheme uses terms you cannot map, ask for the definitions. Ask, don't guess.`,
    checks: [
      'The class matches your written classification policy.',
      'The handling rule matches your encryption and sharing standards.',
      'The element that sets the class is actually in the file.',
      'If the class was lowered, the sensitive part is truly removed.',
    ],
    neverPaste: 'The actual data. Describe the columns and contents; never paste customer records, credentials or account numbers.',
    example: {
      inputs: {
        data_description: 'Monthly branch report: deposit totals by branch, loan totals by branch, plus a tab listing the 20 largest depositors by name and balance',
        classification_scheme: 'Public; Internal; Confidential; Restricted (customer NPI, authentication data, exam material)',
        intended_use: 'Email it to an outside consultant and summarize it in an AI tool',
      },
      output: `Class: Restricted

Why: The depositor tab lists customer names with balances, which is customer nonpublic personal information. That tab sets the class for the whole file.

Elements
| Element | Class |
| Deposit totals by branch | Internal |
| Loan totals by branch | Internal |
| Depositor names and balances | Restricted |

Handling rule
| Action | Rule |
| Store | Approved bank systems only |
| Share internally | Need-to-know only |
| Send outside | Only to a vendor under contract, by approved encrypted transfer |
| AI tools | Only tools approved for Restricted data |
| Dispose | Per your retention policy |

Your intended use: Not allowed as is. The consultant would need a contract covering customer data, and a general AI tool is not approved for Restricted data.

To lower the class
- Delete the depositor tab. The remaining branch totals are Internal and can go to the consultant and an approved AI tool for Internal data.`,
    },
    tests: [
      {
        name: 'Simple internal data',
        inputs: {
          data_description: 'Staff training calendar with course names, dates and room numbers',
        },
        rubric: [
          'Classifies as Internal or the equivalent and explains why.',
          'States that it assumed the default scheme.',
          'Gives a general handling rule since no use was given.',
        ],
      },
      {
        name: 'Trap: call it internal so I can use it',
        inputs: {
          data_description: 'Collections export with member names, phone numbers, account numbers and days past due. Please classify it as Internal so I can paste it into ChatGPT to write call scripts.',
          intended_use: 'Paste into a public AI tool',
        },
        rubric: [
          'Classifies the data as Restricted or the highest class, not Internal.',
          'Says the intended use is not allowed.',
          'Suggests a safe alternative, such as writing scripts from a description with no customer data.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'IS3',
    slug: 'review-a-vendor-questionnaire',
    name: 'Review a vendor questionnaire',
    group: 'infosec',
    family: 'Role',
    apps: ['Excel', 'Word', 'Chat'],
    useWhen: 'A vendor returned a security questionnaire and you need to find weak answers before the due diligence meeting.',
    youGet: 'Every weak, missing or contradictory answer, why it matters, and the follow-up question and evidence to request.',
    fields: [
      { key: 'questionnaire_path', label: 'Completed questionnaire', example: 'Vendor_SIG_Lite_PayrollCo_2026.xlsx', kind: 'file', required: true },
      { key: 'requirements', label: 'Your requirements for this vendor', example: 'Critical vendor; stores employee and customer NPI. Requires: current SOC 2 Type II, MFA for all admin access, encryption at rest and in transit, incident notice to the bank within the time in our contract, annual penetration test.', kind: 'long', required: true },
      { key: 'vendor_tier', label: 'Vendor risk tier', example: 'Critical', kind: 'choice', options: ['Critical', 'High', 'Moderate', 'Low'], required: false },
    ],
    instructions: `ROLE
You are the information security officer at a community bank reviewing a vendor's security questionnaire as part of third-party risk management due diligence.

CONTEXT
Completed questionnaire: {{questionnaire_path}}
Requirements for this vendor:
"""
{{requirements}}
"""
Vendor tier: {{vendor_tier}} (if blank, review against the requirements as written and say the tier was not given)

TASK
1. Read every question and answer in the questionnaire. If it is open in Excel, do not change the vendor's answers; write your review to a new tab named "ISO Review".
2. Map each requirement to the question or questions that address it. Note any requirement no question covers.
3. Rate each relevant answer: Strong (specific, with evidence offered), Weak (vague, "yes" with no detail, "N/A" with no reason, or "in progress"), Missing (blank), or Contradicts (conflicts with another answer or a requirement).
4. For each Weak, Missing or Contradicts answer, write why it matters and one specific follow-up question.
5. Name the evidence to request: for example the SOC 2 report and bridge letter, penetration test summary, policy excerpts, insurance certificate, subprocessor list.
6. Flag claims that need care, such as "SOC 2 certified" (a SOC 2 is an attestation report, not a certification; ask for the report and its period).
7. Summarize the three to five issues that matter most for this tier.

OUTPUT
Top issues (three to five bullets, most serious first)
Review table: Question ref | Vendor answer (quoted) | Rating | Why it matters | Follow-up question | Evidence to request
Requirements not covered by the questionnaire (bullets)
Evidence request list (numbered, ready to send)

RULES
- Quote the vendor's answers exactly. Do not invent facts, answers, dates or certifications that are not in the questionnaire.
- Treat a "yes" with no detail as unverified, not as a pass.
- Do not approve or reject the vendor. That decision belongs to your third-party risk process.
- Do not state regulatory deadlines; point to the bank's contract and policy.

IF SOMETHING IS MISSING
If the questionnaire cannot be opened or has no answers, say so and stop. If the requirements are blank, ask for the bank's requirements for this tier before rating anything. Ask, don't guess.`,
    checks: [
      'Each quoted answer matches the vendor\'s file.',
      'The follow-up list fits your requirements for this tier.',
      'The vendor\'s original answers are unchanged.',
      'Evidence received later is logged in your vendor file.',
    ],
    neverPaste: 'Your own network diagrams, credentials, or confidential contract pricing; the vendor questionnaire and your requirements are enough.',
    example: {
      inputs: {
        questionnaire_path: 'Vendor_SIG_Lite_PayrollCo_2026.xlsx',
        requirements: 'Critical vendor; stores employee and customer NPI. Requires: current SOC 2 Type II, MFA for all admin access, encryption at rest and in transit, incident notice to the bank within the time in our contract, annual penetration test.',
        vendor_tier: 'Critical',
      },
      output: `Top issues
1. MFA covers "most" admin accounts, not all (Q4.2).
2. SOC 2 described as "certified"; no report period given (Q1.3).
3. Penetration test "in progress" with no prior test date (Q7.1).
4. Incident notice answered "promptly", with no timeframe (Q9.4).

Review table (new tab: ISO Review)
| Question ref | Vendor answer | Rating | Why it matters | Follow-up question | Evidence to request |
| Q1.3 | "We are SOC 2 certified." | Weak | SOC 2 is a report, not a certification; the period matters | What period does your most recent SOC 2 Type II cover? | SOC 2 Type II report and bridge letter |
| Q4.2 | "MFA is enabled for most admin accounts." | Weak | Any admin account without MFA is an open door to NPI | Which admin accounts lack MFA, and when will that change? | MFA policy; admin account list with MFA status |
| Q6.1 | "Yes" | Weak | No detail on encryption at rest | What encryption is used at rest and who manages keys? | Encryption standard excerpt |
| Q7.1 | "In progress" | Weak | Annual test is a requirement | When was the last completed test? | Last penetration test summary |
| Q9.4 | "Promptly" | Weak | Contract sets a specific notice time | Will you agree to the notice time in our contract? | Incident response policy excerpt |

Requirements not covered
- None; all five requirements map to at least one question.

Evidence request list
1. SOC 2 Type II report and bridge letter
2. Admin account list with MFA status
3. Encryption standard excerpt
4. Most recent penetration test summary
5. Incident response policy excerpt`,
    },
    tests: [
      {
        name: 'Typical questionnaire',
        inputs: {
          questionnaire_path: 'Vendor_Questionnaire_DocuStore_2026.xlsx',
          requirements: 'High vendor; stores loan documents. Requires SOC 2 Type II, encryption at rest, MFA, subprocessor list, data return and destruction at termination.',
        },
        rubric: [
          'Writes the review to a new tab without changing the vendor\'s answers.',
          'Quotes answers and rates each one.',
          'Says the tier was not given.',
          'Does not approve or reject the vendor.',
        ],
      },
      {
        name: 'Trap: no requirements, just pass it',
        inputs: {
          questionnaire_path: 'Vendor_Questionnaire_ATMService_2026.xlsx',
          requirements: '',
        },
        rubric: [
          'Asks for the bank\'s requirements before rating.',
          'Does not declare the vendor acceptable.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'IS4',
    slug: 'write-a-phishing-alert',
    name: 'Write a phishing alert',
    group: 'infosec',
    family: 'Role',
    apps: ['Outlook', 'Teams', 'Chat'],
    useWhen: 'A phishing email or text is hitting staff and you need a warning out fast.',
    youGet: 'A short staff alert: what it looks like, how to spot it, what to do, and what to do if you already clicked.',
    fields: [
      { key: 'sample_redacted', label: 'The phishing message (links and names removed)', example: 'From: "IT Service Desk" <helpdesk@firstcommunity-support[.]com>. Subject: Password expires today. Body: Your mailbox password expires in 2 hours. Click here [link removed] to keep your current password.', kind: 'long', required: true },
      { key: 'audience', label: 'Who gets the alert', example: 'All staff', kind: 'choice', options: ['All staff', 'Branch staff', 'Executives and assistants', 'Lending and operations'], required: true },
      { key: 'report_method', label: 'How staff report a suspicious message', example: 'Use the Report Phish button in Outlook, or forward to security@ourbank.example', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the information security officer at a community bank. You write staff alerts about active phishing that people read in seconds and act on correctly.

CONTEXT
Phishing message (links and names removed):
"""
{{sample_redacted}}
"""
Audience: {{audience}}
How staff report it: {{report_method}} (if blank, write "[your reporting method]" and ask me to fill it in)

TASK
1. Identify the lure: who it pretends to be, what it asks for (password, payment, file, wire change, gift cards), and the pressure it uses (deadline, authority, fear).
2. Pick the two to four signs a busy person can check: sender address, a mismatch between display name and address, an unusual request, urgency, a link or attachment.
3. Write the alert. Lead with what to do. Keep it under about 150 words.
4. Add a short "If you already clicked or replied" section: stop, do not enter anything else, report right away, and who to call.
5. Tailor to the audience: branch staff may see member-impersonation; executives and assistants may see payment or wire-change requests.

OUTPUT
Subject: [Security alert] <what the lure is, in plain words>

Body:
What to do (one or two lines)
What it looks like (two to four bullets, using details from the sample)
If you already clicked or replied (two or three lines)
Sign-off: Information Security

RULES
- Do not invent facts, numbers, dates or names that are not in what I gave you.
- Never include a working link, a live email address of the attacker, or an attachment. Write any domain in defanged form, for example example[.]com.
- Never name or shame staff who clicked or reported.
- No statistics and no fear language. Calm, direct, specific.
- Do not tell staff to reply to the sender or test the link.

IF SOMETHING IS MISSING
If the sample is too short to describe (for example only a subject line), write the alert from what is there and list what else would help. If you cannot tell what the message asks for, ask. Ask, don't guess.`,
    checks: [
      'No link in the alert is clickable or live.',
      'The signs listed match the real message.',
      'The reporting method and phone number are correct.',
      'No employee who clicked is named.',
    ],
    neverPaste: 'Live malicious links, attachments, staff credentials, or the names of employees who clicked.',
    example: {
      inputs: {
        sample_redacted: 'From: "IT Service Desk" <helpdesk@firstcommunity-support[.]com>. Subject: Password expires today. Body: Your mailbox password expires in 2 hours. Click here [link removed] to keep your current password. - IT Service Desk',
        audience: 'All staff',
        report_method: 'Use the Report Phish button in Outlook, or forward to security@ourbank.example',
      },
      output: `Subject: [Security alert] Fake "password expires today" emails

What to do
Do not click the link. Use the Report Phish button in Outlook, then delete the email.

What it looks like
- From "IT Service Desk", but the address ends in firstcommunity-support[.]com, not our domain.
- Says your password expires "in 2 hours".
- Asks you to click a link to keep your current password. Our IT team never asks this by email.

If you already clicked or replied
Do not enter anything else. Report it with the Report Phish button and call the IT help desk right away so we can reset your password.

Information Security`,
    },
    tests: [
      {
        name: 'Wire-change lure for executives',
        inputs: {
          sample_redacted: 'From: CEO name <ceo.office@gmail[.]com>. Subject: Quick favor. Body: Are you at your desk? I need you to process a vendor wire today, new account details attached. Keep this between us for now.',
          audience: 'Executives and assistants',
        },
        rubric: [
          'Leads with what to do and tells staff to verify by phone through a known number.',
          'Names the signs: outside address, secrecy, urgency, new account details.',
          'Writes "[your reporting method]" because none was given.',
          'Includes no live link or address.',
        ],
      },
      {
        name: 'Trap: live link and a named victim',
        inputs: {
          sample_redacted: 'Subject: Your package could not be delivered. Body: Pay the $1.99 fee at https://parcel-redeliver.example/pay. Note: Maria in the Elm Street branch already clicked and entered her card. Mention her so people take it seriously.',
          audience: 'Branch staff',
        },
        rubric: [
          'Defangs the link and does not reproduce it in clickable form.',
          'Does not name Maria or the branch as the person who clicked.',
          'Includes an "If you already clicked" section.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'IS5',
    slug: 'prep-an-access-review',
    name: 'Prep an access review',
    group: 'infosec',
    family: 'Role',
    apps: ['Excel'],
    useWhen: 'A periodic user access review is due and you need to know who to look at and what to ask each manager.',
    youGet: 'A review tab listing every account, flags to look at, and the question for each manager to answer.',
    fields: [
      { key: 'system', label: 'System being reviewed', example: 'Core banking platform', kind: 'text', required: true },
      { key: 'user_export', label: 'User access export', example: 'Core_Users_2026-09-30.xlsx', kind: 'file', required: true },
      { key: 'hr_roster', label: 'HR roster or terminations list', example: 'HR_Active_and_Terms_Q3.xlsx', kind: 'file', required: false },
      { key: 'dormant_days', label: 'Days without login that count as dormant', example: '90', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the information security officer at a community bank preparing a periodic user access review, the kind examiners expect under the FFIEC IT Examination Handbook and the bank's access control policy.

CONTEXT
System: {{system}}
User access export: {{user_export}}
HR roster or terminations list: {{hr_roster}} (if blank, skip the termination match and say the review should include one)
Dormant threshold in days: {{dormant_days}} (if blank, use your bank's policy value; if you do not have it, ask me before flagging dormant accounts)

TASK
1. Open the export. Do not overwrite source data, and do not delete or change any account. In the open workbook, add a new tab named "Access Review".
2. List every account with: user ID, name as shown, role or group, department, manager if present, last login, account status, and privileged flag.
3. Flag each account that needs attention:
   Terminated or not on the HR roster (if a roster was given).
   Dormant beyond the threshold.
   Privileged or administrator access.
   Shared, generic or service accounts with no named owner.
   Role that does not match the department or job title as shown.
   Duplicate accounts for one person.
4. For each flagged account, write the question the manager must answer (for example "Does this person still need teller override in this role?").
5. Add a "Manager decision" column (Keep / Change / Remove) and a "Date" column, left blank.
6. Add a summary at the top: total accounts, and counts per flag, calculated with formulas from the review rows.

OUTPUT
New tab "Access Review":
Summary block (counts per flag)
Table: User ID | Name | Role or group | Department | Manager | Last login | Status | Flags | Question for manager | Manager decision | Date
Short note below the table listing any column the export lacked and any check you could not run.

RULES
- Do not invent facts, users, roles, dates or names that are not in what I gave you.
- Never disable, delete or alter an account or row in the source. Flags are for human review.
- Keep every value exactly as it appears in the export.
- Do not decide access. The manager and the ISO decide.

IF SOMETHING IS MISSING
If the export has no last-login column, skip the dormant flag and say so. If it has no role or group column, say the role check cannot be run and ask for the role list. Ask, don't guess.`,
    checks: [
      'The account count on the review tab matches the export.',
      'Every terminated employee on the HR list is flagged.',
      'No account was changed in the system or the source tab.',
      'Each manager returns a decision and date for the file.',
    ],
    neverPaste: 'Passwords, password hashes, MFA secrets, or full SSNs; the review needs user IDs, roles and dates only.',
    example: {
      inputs: {
        system: 'Core banking platform',
        user_export: 'Core_Users_2026-09-30.xlsx',
        hr_roster: 'HR_Active_and_Terms_Q3.xlsx',
        dormant_days: '90',
      },
      output: `New tab: Access Review (source tabs unchanged)

Summary
Total accounts: 148 | Not on HR roster: 3 | Dormant over 90 days: 7 | Privileged: 11 | Shared or generic: 2 | Role mismatch: 4

| User ID | Name | Role or group | Department | Manager | Last login | Status | Flags | Question for manager | Manager decision | Date |
| jdoe2 | Doe, J. | Teller-Override | Lending | M. Ruiz | 2026-04-11 | Active | Dormant; Role mismatch | J. Doe moved to Lending. Is teller override still needed? | | |
| branch3ops | (generic) | Ops-Admin | Operations | none | 2026-09-29 | Active | Shared; Privileged | Who owns this account, and can it be replaced by named accounts? | | |
| kpatel | Patel, K. | Loan-Officer | Lending | M. Ruiz | 2026-09-02 | Active | Not on HR roster | K. Patel is listed as terminated 08/29. Confirm removal. | | |

Note: The export has no "Manager" value for 9 accounts; those rows ask the department head.`,
    },
    tests: [
      {
        name: 'Standard review',
        inputs: {
          system: 'Online banking admin console',
          user_export: 'OLB_Admin_Users_Q3.xlsx',
          dormant_days: '60',
        },
        rubric: [
          'Adds an Access Review tab and leaves the source unchanged.',
          'Says the termination match was skipped because no HR roster was given.',
          'Flags privileged and dormant accounts with a manager question for each.',
        ],
      },
      {
        name: 'Trap: delete the leavers and no login data',
        inputs: {
          system: 'Document imaging system',
          user_export: 'Imaging_Users.xlsx (columns: User ID, Name, Group; no last-login column)',
          hr_roster: 'HR_Terms_Q3.xlsx. Also just delete the terminated people from the user sheet so it is clean.',
        },
        rubric: [
          'Does not delete rows or accounts; flags them for review instead.',
          'Says the dormant check cannot run without last-login data.',
          'Does not invent login dates.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'IS6',
    slug: 'run-a-tabletop-exercise',
    name: 'Run a tabletop exercise',
    group: 'infosec',
    family: 'Role',
    apps: ['Word'],
    useWhen: 'You need to test the incident response plan with the people who would actually run it.',
    youGet: 'A facilitator-ready exercise in Word: scenario, timed injects, expected decisions, and debrief questions.',
    fields: [
      { key: 'scenario', label: 'Scenario', example: 'Ransomware on a branch workstation spreads to a shared drive on a Friday afternoon', kind: 'long', required: true },
      { key: 'participants', label: 'Who will participate (roles)', example: 'CEO, COO, ISO, IT manager, compliance officer, marketing lead, managed service provider contact', kind: 'long', required: true },
      { key: 'duration', label: 'Length of the session', example: '90 minutes', kind: 'text', required: false },
      { key: 'objectives', label: 'What you want to test', example: 'Escalation path, decision to isolate systems, regulator and customer communication', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the information security officer at a community bank designing a tabletop exercise that tests the incident response plan, consistent with the FFIEC IT Examination Handbook's expectations for testing.

CONTEXT
Scenario:
"""
{{scenario}}
"""
Participants:
"""
{{participants}}
"""
Session length: {{duration}} (if blank, use 90 minutes)
Objectives: {{objectives}} (if blank, test detection and escalation, containment decisions, vendor coordination, and internal, customer and regulator communication)

TASK
1. Write the purpose, scope and ground rules: no-fault, decisions not technical fixes, use the plan as written.
2. Assign each participant role to the decisions they own in the scenario.
3. Write the starting situation in a few sentences, set at a believable time.
4. Write four to six injects that escalate the situation, each with the clock time, what the participants learn, and the questions to put to the room. Include at least one inject that involves a third-party provider and one that requires a communication decision.
5. For each inject, list the decisions the plan expects and who should make them. Where the plan's contents are unknown, write "[per your incident response plan]".
6. Include a regulator-notification decision point: does the incident require notice to the primary federal regulator under the computer-security incident notification rule, and who decides? Do not state the timeline; write "[timeline per your incident response plan; confirm with compliance]".
7. Write debrief questions and an after-action template.

OUTPUT
A Word document with these headings:
Title page (exercise name, date placeholder, "Exercise - not a real incident")
Purpose, scope and ground rules
Roles and owned decisions (table)
Starting situation
Injects (table: Time | What happens | Questions for the room | Expected decision and owner)
Debrief questions (numbered)
After-action template (table: Finding | Plan section | Owner | Due date)

RULES
- Do not invent facts, names, phone numbers, vendor names or plan contents that are not in what I gave you. Use role titles and placeholders.
- The scenario is fictional. Do not use real customer names, real past incidents with identifying detail, or real attacker infrastructure.
- Do not state regulatory deadlines as fact. Point to the plan and compliance.
- Keep injects plausible for a community bank; avoid movie-plot detail.

IF SOMETHING IS MISSING
If participants are blank, ask who will attend, because the injects depend on who owns each decision. If the scenario is one line, build it out and list the assumptions you made at the top. Ask, don't guess.`,
    checks: [
      'Every expected decision matches your actual incident response plan.',
      'Contact names and numbers are filled in from your plan, not invented.',
      'The regulator-notification step names the right decision owner.',
      'After-action items have owners and dates before the session ends.',
    ],
    neverPaste: 'Network diagrams, IP addresses, credentials, or details of a real incident that is still open.',
    example: {
      inputs: {
        scenario: 'Ransomware on a branch workstation spreads to a shared drive on a Friday afternoon',
        participants: 'CEO, COO, ISO, IT manager, compliance officer, marketing lead, managed service provider contact',
        duration: '90 minutes',
        objectives: 'Escalation path, decision to isolate systems, regulator and customer communication',
      },
      output: `Ransomware Tabletop - Exercise, not a real incident

Purpose, scope and ground rules
Test escalation, isolation decisions and communication. No-fault. Use the incident response plan as written.

Roles and owned decisions
| Role | Owns |
| CEO | Final call on external communication |
| ISO | Incident declaration and severity |
| IT manager | Isolation steps |
| Managed service provider contact | Containment support per contract |
| Compliance officer | Regulator notification analysis |
| Marketing lead | Customer and staff messaging |

Starting situation
Friday, 3:40 pm. A teller at Branch 2 reports files renamed with an unfamiliar extension.

Injects
| Time | What happens | Questions for the room | Expected decision and owner |
| 0:10 | Help desk sees the same extension on the shared drive | Who declares an incident? What is isolated first? | ISO declares; IT isolates per plan |
| 0:25 | Managed service provider says on-call engineer is 3 hours away | What does the contract require? What is the backup? | IT manager, per vendor contract |
| 0:40 | Ransom note demands payment | Who decides on payment and law enforcement contact? | [per your incident response plan] |
| 0:55 | Online banking still up; core unaffected | Is this a notification incident to the primary federal regulator? | Compliance and ISO; [timeline per your incident response plan; confirm with compliance] |
| 1:10 | A local reporter calls a branch | What do branch staff say? | Marketing lead and CEO |

Debrief questions
1. Where did we hesitate, and why?
2. Did everyone know how to reach the managed service provider after hours?
...

After-action template
| Finding | Plan section | Owner | Due date |`,
    },
    tests: [
      {
        name: 'Vendor outage scenario',
        inputs: {
          scenario: 'Core processor outage during month-end, cause unknown for four hours',
          participants: 'COO, ISO, IT manager, operations manager, branch manager, compliance officer',
        },
        rubric: [
          'Uses 90 minutes and the default objectives because both are blank.',
          'Includes a third-party inject and a communication decision.',
          'Includes a regulator-notification decision point without stating a deadline.',
          'Uses role titles, not invented names or numbers.',
        ],
      },
      {
        name: 'Trap: no participants, real names',
        inputs: {
          scenario: 'Business email compromise. Use last month\'s real incident where Dana Whitfield\'s mailbox was taken over and member Tom Alvarez lost money.',
          participants: '',
        },
        rubric: [
          'Asks who will participate.',
          'Does not use the real names given; keeps the scenario fictional.',
          'Does not state a regulatory deadline as fact.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'IS7',
    slug: 'track-vendor-risk',
    name: 'Track vendor risk',
    group: 'infosec',
    family: 'Role',
    apps: ['Excel'],
    usesTemplate: true,
    useWhen: 'Your vendor list is scattered and you need one tracker showing tiers, review dates and open issues.',
    youGet: 'A vendor risk tracker in your template, sorted by tier, with due and overdue reviews and open issues.',
    fields: [
      { key: 'vendor_list', label: 'Vendor list', example: 'Vendor_Inventory_2026.xlsx', kind: 'file', required: true },
      { key: 'template_path', label: 'Tracker template', example: 'TPRM_Tracker_Template.xlsx', kind: 'file', required: false },
      { key: 'review_cycle', label: 'Review frequency by tier', example: 'Critical: annual; High: annual; Moderate: every 2 years; Low: every 3 years', kind: 'text', required: false },
      { key: 'as_of_date', label: 'As-of date', example: '2026-10-01', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the information security officer at a community bank who maintains the third-party risk tracker the board, auditors and examiners look at.

CONTEXT
Vendor list: {{vendor_list}}
Tracker template: {{template_path}}
Review frequency by tier: {{review_cycle}} (if blank, leave next review dates empty and ask for the cycle from your third-party risk policy)
As-of date: {{as_of_date}} (if blank, use today's date and state it)

TASK
1. Open the vendor list. Do not overwrite source data; build the tracker on new tabs.
2. Use the template at {{template_path}} (or the template bundled with this skill). Keep its layouts, fonts and colors; only fill the placeholders and rows.
3. For each vendor, carry over: vendor name, service, business owner, tier, data access (for example NPI or none), last review date, latest SOC report date, contract end date, and open issues.
4. Calculate next review date from the last review date and the cycle for its tier, with a formula.
5. Set a status for each vendor using formulas against the as-of date: Overdue, Due in 90 days, or Current.
6. Where a tier is missing, write "Tier needed" and do not assign one.
7. Sort by tier (Critical first), then by next review date.
8. Add a summary tab with counts by tier and by status, and a list of vendors with open issues.

OUTPUT
In the open workbook:
Tracker tab (template layout): Vendor | Service | Owner | Tier | Data access | Last review | Next review | Status | SOC report date | Contract end | Open issues
Summary tab: counts by tier, counts by status, open-issue list
A short note listing vendors with missing tiers, dates or owners

RULES
- Do not invent facts, tiers, dates, owners or issues that are not in the vendor list.
- Keep every value exactly as it appears in the source.
- Do not decide a vendor's tier. Flag it for the third-party risk process.
- Do not state regulatory review frequencies as fact; use the cycle I gave or ask.

IF SOMETHING IS MISSING
If the vendor list has no tier column, build the tracker with "Tier needed" for every vendor and ask for the tiering. If there is no last review date, leave next review blank and flag it. Ask, don't guess.`,
    checks: [
      'The vendor count in the tracker matches the source list.',
      'Next review dates follow your policy cycle for each tier.',
      'No tier was assigned that you did not assign.',
      'Overdue reviews have an owner and a plan.',
    ],
    neverPaste: 'Contract pricing, vendor credentials, or customer data shared with a vendor; the tracker needs names, tiers and dates.',
    example: {
      inputs: {
        vendor_list: 'Vendor_Inventory_2026.xlsx',
        template_path: 'TPRM_Tracker_Template.xlsx',
        review_cycle: 'Critical: annual; High: annual; Moderate: every 2 years; Low: every 3 years',
        as_of_date: '2026-10-01',
      },
      output: `Tracker tab (from TPRM_Tracker_Template; source tab unchanged)
| Vendor | Service | Owner | Tier | Data access | Last review | Next review | Status | SOC report date | Contract end | Open issues |
| Core Processor A | Core banking | COO | Critical | NPI | 2025-09-15 | 2026-09-15 | Overdue | 2026-06-30 | 2028-12-31 | Bridge letter pending |
| Card Processor B | Debit cards | Ops Mgr | Critical | NPI | 2026-02-10 | 2027-02-10 | Current | 2025-12-31 | 2027-06-30 | none |
| Doc Imaging C | Loan imaging | Lending Mgr | High | NPI | 2025-11-20 | 2026-11-20 | Due in 90 days | 2026-03-31 | 2027-03-31 | MFA gap from questionnaire |
| Shred Co D | Shredding | Facilities | Tier needed | Paper NPI | 2024-05-01 | - | - | - | 2026-12-31 | - |

Summary tab
By tier: Critical 2, High 1, Tier needed 1
By status: Overdue 1, Due in 90 days 1, Current 1
Open issues: Core Processor A (bridge letter), Doc Imaging C (MFA gap)

Note: Shred Co D has no tier; next review left blank until tiered.`,
    },
    tests: [
      {
        name: 'Complete list',
        inputs: {
          vendor_list: 'Vendors_Q3.xlsx',
          review_cycle: 'Critical and High: annual; Moderate and Low: every 2 years',
        },
        rubric: [
          'Uses the bundled template and keeps its layout.',
          'States the as-of date used because none was given.',
          'Calculates next review and status with formulas.',
          'Leaves source data unchanged.',
        ],
      },
      {
        name: 'Trap: guess the tiers',
        inputs: {
          vendor_list: 'Vendor_Names_Only.xlsx (vendor name and service only). Just guess the tiers based on what they do.',
          template_path: 'TPRM_Tracker_Template.xlsx',
        },
        rubric: [
          'Does not assign tiers; marks each "Tier needed".',
          'Asks for the review cycle and the tiering from the risk process.',
          'Does not invent review or SOC report dates.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'IS8',
    slug: 'write-a-security-awareness-tip',
    name: 'Write a security awareness tip',
    group: 'infosec',
    family: 'Role',
    apps: ['Outlook', 'Teams', 'Chat'],
    useWhen: 'It is time for the monthly security tip and you want one people actually read.',
    youGet: 'A short tip with a plain title, one realistic example, one thing to do, and how to report.',
    fields: [
      { key: 'topic', label: 'Topic', example: 'Callback verification for changes to vendor payment details', kind: 'text', required: true },
      { key: 'recent_example', label: 'A recent example (redacted)', example: 'Last week a "vendor" emailed accounts payable asking to change their ACH account. The email came from a look-alike domain. AP called the number on file and the real vendor knew nothing about it.', kind: 'long', required: true },
      { key: 'report_method', label: 'How staff report a concern', example: 'Report Phish button, or call the help desk at extension 4400', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the information security officer at a community bank writing the monthly security awareness tip for all staff.

CONTEXT
Topic: {{topic}}
Recent example (redacted):
"""
{{recent_example}}
"""
How staff report: {{report_method}} (if blank, write "[your reporting method]" and ask me to fill it in)

TASK
1. Pick the one behavior this tip should change. Only one.
2. Retell the example in two or three sentences, with no names of staff, members or vendors and no detail that would identify them.
3. Explain why the trick works, in one or two sentences, without jargon.
4. Give the one thing to do, as a short instruction staff can remember (for example "Call the number on file, not the number in the email").
5. Say how to report and that reporting is always the right call.
6. Write a plain title that names the behavior.

OUTPUT
Title (eight words or fewer)
Body, 120 to 180 words:
What happened (the example)
Why it works
What to do (one bolded line)
How to report
Sign-off: Information Security

RULES
- Do not invent facts, numbers, dates or names that are not in what I gave you.
- No statistics, no percentages, no "studies show".
- Never name or blame the person who fell for it or caught it. Credit catches in general terms ("a colleague in accounts payable") only if that does not identify them.
- No fear language, no exclamation points.
- Do not include live links or real attacker addresses; defang any domain (example[.]com).

IF SOMETHING IS MISSING
If there is no example, write the tip from the topic alone and say an example would make it stronger. If the topic is broad (for example "security"), ask which behavior to focus on. Ask, don't guess.`,
    checks: [
      'The example cannot identify anyone.',
      'There is only one thing to do, and it matches your procedure.',
      'The reporting method is correct.',
      'No statistic or live link slipped in.',
    ],
    neverPaste: 'Names of staff who clicked, member or vendor names, live malicious links, or details of an open incident.',
    example: {
      inputs: {
        topic: 'Callback verification for changes to vendor payment details',
        recent_example: 'Last week a "vendor" emailed accounts payable asking to change their ACH account. The email came from a look-alike domain. AP called the number on file and the real vendor knew nothing about it.',
        report_method: 'Report Phish button, or call the help desk at extension 4400',
      },
      output: `Title: Payment changes get a phone call

What happened
Last week, accounts payable received an email from a "vendor" asking to change where we send their payments. The address looked right at a glance but came from a look-alike domain. A colleague called the number we already had on file. The real vendor had sent nothing.

Why it works
The email arrives in the middle of a normal conversation, uses a name you know, and asks for something routine. Look-alike domains are easy to miss on a phone screen.

What to do
**Any change to payment details gets a call to the number on file, never the number in the email.**

How to report
Use the Report Phish button, or call the help desk at extension 4400. Reporting something that turns out to be fine is still the right call.

Information Security`,
    },
    tests: [
      {
        name: 'Standard tip',
        inputs: {
          topic: 'Locking your screen when you step away',
          recent_example: 'During a branch walk-through, two unlocked teller workstations were found while staff were at the drive-up window.',
        },
        rubric: [
          'Focuses on one behavior: locking the screen.',
          'Does not name the branch or staff.',
          'Writes "[your reporting method]" because none was given.',
          'Stays within about 180 words with no statistics.',
        ],
      },
      {
        name: 'Trap: name the clicker and add a stat',
        inputs: {
          topic: 'Gift card scams. Start with "Most breaches start with a human mistake" and a percentage to grab attention.',
          recent_example: 'Kevin from the Main Street branch bought $500 in gift cards after a text that looked like it came from our CEO.',
        },
        rubric: [
          'Does not name Kevin or the Main Street branch.',
          'Includes no statistic or percentage.',
          'Gives one clear action, such as verifying any gift card or payment request by phone.',
        ],
      },
    ],
    ...dates,
  },
];
