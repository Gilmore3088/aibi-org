# Sample Prompt Library — Heritage Community Bank Operations

Five working prompts from an operations manager at a $510M community bank. Each entry follows the six-field template. Use the tone, structure, and discipline as the model for your own three.

Last reviewed: 2026-04-01.

---

## 1. Meeting summary — internal committee

**When to use it:** After any internal committee meeting (ALCO, credit, IT steering) where the secretary needs a one-page action register from the meeting notes. Use within 24 hours of the meeting.

**Prompt:**

```
You are a meeting summarization assistant for a community bank committee.

Below are the secretary's notes from a {committee_name} meeting on {meeting_date}.
Produce a one-page summary with:

1. Decisions made (bullet list, each with the decision-maker named)
2. Action items (bullet list, each with owner + due date)
3. Open questions (bullet list — items that need follow-up)
4. Next meeting agenda (3-5 items — what should be discussed next time)

Tone: factual, no editorializing. Quote the secretary's notes verbatim where possible.

Notes:
{meeting_notes}
```

**What-not-to-paste:**
- Do not paste examination findings or CAMELS ratings.
- Do not paste personnel matters (compensation, performance, hiring decisions).
- Do not paste specific borrower names or loan amounts.
- Do not paste pre-release financial figures.
- For all of the above: redact in the source notes BEFORE pasting, or do not use AI for that meeting's minutes.

**Verified example output:** Used for the March 2026 ALCO meeting. Output produced a clean one-page summary; the secretary verified all action items matched her notes before circulating. No fabrication detected.

**Last reviewed:** 2026-04-01.

---

## 2. Internal procedure draft from verbal description

**When to use it:** When a department lead describes a new internal procedure verbally and needs a written first draft to circulate for peer review. Always followed by a peer review step.

**Prompt:**

```
You are a procedure-writing assistant for a community bank.

The {department} lead has described a new internal procedure verbally.
Below is the verbal description, transcribed.

Produce a procedure document with:

1. Procedure title
2. Purpose (1-2 sentences)
3. Trigger event (when this procedure starts)
4. Steps (numbered, each with the role responsible)
5. Approvals required (named roles)
6. Documentation kept (what evidence is filed where)
7. Frequency of review (default: annual)

Tone: precise, no marketing language. If the verbal description is unclear on any of the seven sections, mark that section "[NEEDS LEAD INPUT]" instead of guessing.

Verbal description:
{verbal_description}
```

**What-not-to-paste:**
- Do not paste a procedure that involves customer PII handling without explicit sanitization rules in the procedure itself.
- Do not paste a procedure for examination response — examiners want institution-specific judgment, not AI text.
- Do not paste a procedure for a process subject to regulatory pre-approval (Reg E disputes, BSA/AML escalation) without compliance review of the AI draft before any use.

**Verified example output:** Used in February 2026 to draft the new ATM-cash-replenishment procedure. Output flagged 3 of 7 sections as "[NEEDS LEAD INPUT]" — the lead filled them in within 10 minutes. Procedure went to peer review next day.

**Last reviewed:** 2026-04-01.

---

## 3. Variance narrative — monthly close

**When to use it:** Monthly close, day 5. Finance team has the actuals and bullet-point talking points; AI drafts the prose for the management report. CFO reviews every number before circulation.

**Prompt:**

```
You are a financial reporting assistant for a community bank.

The finance team has produced bullet-point talking points for the monthly variance discussion.
Below are the talking points, anonymized (departments are referred to as "Department A, B, C").

Produce a one-page variance narrative with:

1. Top-line summary (2-3 sentences naming the largest variance and the direction)
2. Department-by-department breakdown (one paragraph per department, citing the talking-point bullets)
3. Items requiring CFO attention (bullet list — anything the talking points flagged as anomalous or surprising)
4. Open items for next month (bullet list — what needs follow-up)

Tone: matter-of-fact, no positive or negative spin. Use the talking-point figures verbatim — do not round, do not interpret beyond what the bullets say.

Talking points:
{talking_points}
```

**What-not-to-paste:**
- Do not paste customer-specific data (account-level details, individual borrower names).
- Do not paste pre-release earnings before they are board-approved.
- Do not paste examination findings or regulator correspondence.
- Do not paste vendor contract pricing.
- Anonymize department names in source data BEFORE pasting.

**Verified example output:** Used for January 2026 close. CFO reviewed and re-anchored two figures the AI had paraphrased ("up about $40k" → "up $42,318" per actuals). One paragraph removed because it inferred a trend not supported by the bullets. Use accepted with corrections.

**Last reviewed:** 2026-04-01.

---

## 4. Customer email response — service recovery template

**When to use it:** Drafting a response to a routine customer service email (fee waiver request, branch hours question, statement issue). NEVER for a complaint involving fraud, dispute, or regulatory matter.

**Prompt:**

```
You are a customer-service drafting assistant for a community bank.

Below is a sanitized version of an inbound customer email (customer name, account number,
and any specific account details have been replaced with placeholders).

Produce a response draft that:

1. Addresses the customer's specific question (do not invent additional services or policies)
2. Uses the bank's voice (warm, direct, never legalistic)
3. References only policies the bank actually offers (do not invent)
4. Ends with the next step the customer should take (call, visit branch, reply with info)
5. Is under 150 words

If the email mentions fraud, dispute, regulatory matter, or anything legally sensitive, return:
"[ESCALATE — this email needs a human, not a draft.]"

Sanitized customer email:
{sanitized_email}
```

**What-not-to-paste:**
- Do not paste the customer's full name, account number, balance, SSN, or any PII.
- Do not paste an email about a Reg E dispute, fraud claim, fair-lending complaint, BSA matter, or anything mentioning examination/regulator.
- Replace all account-specific details with [ACCOUNT] before pasting. If you cannot sanitize easily, do not use AI for that email.

**Verified example output:** Used for a routine fee-waiver question in January 2026. Output produced a 110-word response that the retail manager edited lightly (changed "we appreciate your loyalty" to the bank's actual voice — "thank you for banking with us"). Sent. No issues.

**Last reviewed:** 2026-04-01.

---

## 5. Vendor due-diligence summary

**When to use it:** When evaluating a new technology or AI vendor. Summarize the public sections of the vendor's documentation into a one-page brief for the IT steering committee. Always followed by formal third-party risk assessment.

**Prompt:**

```
You are a vendor evaluation assistant for a community bank's IT steering committee.

Below is publicly available documentation about {vendor_name} (their website pages,
their security white paper, their published API documentation).

Produce a one-page brief with:

1. What the vendor does (1-2 sentences, plain English)
2. Where the vendor stores or processes data (geographic + cloud provider, if disclosed)
3. Compliance certifications claimed (SOC 2, ISO 27001, FedRAMP, etc.)
4. Open questions for due diligence (5-7 questions the steering committee should ask)
5. Initial fit assessment (Strong / Moderate / Weak / Not a fit), with a 1-sentence rationale

Tone: skeptical. If the public materials make claims without evidence, note them as "claimed but unverified." Default to Moderate unless the public materials are unusually clear.

Documentation:
{vendor_documentation}
```

**What-not-to-paste:**
- Do not paste the bank's RFP responses (those contain institution-specific data).
- Do not paste the bank's existing third-party inventory.
- Only public vendor materials. If you have access to a sales-gated document, treat it as confidential and do not paste it.

**Verified example output:** Used in March 2026 to evaluate a workflow-automation vendor. Output produced a clear one-pager with 6 due-diligence questions; the steering committee asked all 6, which surfaced a data-residency concern that killed the deal. Excellent use.

**Last reviewed:** 2026-04-01.

---

## Library hygiene — note for future-you

- Re-test every prompt every 6 months. Models drift; banking practices change. A prompt that worked in 2026-04 may not work in 2026-10.
- Add prompts when a colleague's verbal "I just used AI to do X" sounds reusable. Ask them for the prompt, fill in the six fields, save it.
- Delete prompts that have not been used in 12 months. A library is a tool, not a museum.
- The library lives in the bank's shared drive, not on a personal device. Audit who has access annually.
