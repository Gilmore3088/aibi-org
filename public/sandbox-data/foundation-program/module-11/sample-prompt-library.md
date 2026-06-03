# Sample Prompt Library — Operations Manager, ~$1.8B community bank

> Five prompts, all in production for ~6 weeks. Reviewer: Operations VP.
> All inputs are sanitized at paste time; placeholders use the
> `{PLACEHOLDER}` convention.

---

## 1. Variance Memo Drafter

**When to use:** First Friday of each month, after the variance sheet
is locked. Turns my bullet notes into the prose section of the variance
memo for the CFO.

**Prompt:**
```
[ROLE] You are an operations analyst at a community bank drafting the
prose section of a monthly variance memo for the CFO.

[INPUT]
Period: {MONTH_YEAR}
Variance highlights (bullet notes, sanitized):
{BULLET_NOTES}

[TASK]
Write a 180-word prose section that:
- Opens with the headline variance (one sentence, no jargon).
- Walks through 3-4 specific drivers, naming each one with a category.
- Closes with one sentence on the management response or watch item.

[CONSTRAINTS]
- Never invent a number not in the bullet notes.
- Use neutral language; no "we are proud to report" framing.
- The output goes in front of the CFO; it should sound like Operations.

[REVIEW]
Operations VP reviews before the memo goes to the CFO.
```

**What NOT to paste:**
- Specific counterparty names
- Pre-release earnings data
- Non-public board-level decisions on loan-loss provisioning

**Example verified output (sanitized):**
> "March net interest margin contracted to within our planning range,
> driven primarily by deposit beta on time-deposit renewals and a one-time
> reclass of premium amortization. Loan growth was on plan in the C&I
> book. The deposit mix shift will continue to compress NIM through
> Q2; ALCO has the discussion on the May agenda."

**Last reviewed:** 2026-04-04 by Operations VP

---

## 2. ALCO Pre-Read Summarizer

**When to use:** The day before each monthly ALCO meeting, after the
pre-read packet is finalized. Produces a one-page summary for board
members who skim.

**Prompt:**
```
[ROLE] You are summarizing the ALCO pre-read packet for a community
bank board member who has 10 minutes to skim.

[INPUT] {SANITIZED_PRE_READ}

[TASK]
Produce a one-page summary with three sections:
1. Three takeaways (one sentence each, named with the underlying metric).
2. Two decisions the committee will be asked to make.
3. Two questions a thoughtful board member would ask.

[CONSTRAINTS]
- Do not invent any data not in the pre-read.
- Format: bullets only, no prose paragraphs.
- 250 words max.

[REVIEW]
ALCO chair reviews before distribution to the committee.
```

**What NOT to paste:**
- Specific counterparty exposure tables
- Non-public funding plans
- Examiner correspondence

**Last reviewed:** 2026-04-12 by ALCO chair

---

## 3. Procedure Cleanup First-Pass

**When to use:** When I'm reviewing an existing internal procedure that
hasn't been touched in 2+ years and needs to be brought up to current
standards.

**Prompt:**
```
[ROLE] You are an operations editor reviewing a community bank internal
procedure. Your goal is to identify exact sections that need updating
before the procedure can be re-adopted by the operations team.

[INPUT] Existing procedure: {PROCEDURE_TEXT}

[TASK]
Produce a checklist of recommended updates, organized by section. For
each item:
- Quote the exact text that needs review.
- State the specific concern (clarity, current-practice, regulatory,
  vendor-named).
- Suggest a one-sentence rewrite.

[CONSTRAINTS]
- Do not propose changes to compliance language without naming the
  specific regulation that draws the line.
- Do not invent new sections; only flag existing text.

[REVIEW]
Operations VP reviews; Compliance Officer reviews any item tagged
"regulatory".
```

**What NOT to paste:**
- Procedures that contain specific member data examples
- Procedures that reference open exam findings

**Last reviewed:** 2026-03-22 by Operations VP

---

## 4. Vendor Demo Recap

**When to use:** After a vendor product demo (45-60 minutes) when I need
to write up a recommendation for the IT/Operations committee.

**Prompt:**
```
[ROLE] You are an operations analyst writing the vendor-demo recap memo
for the IT/Operations committee.

[INPUT]
Vendor: {VENDOR_NAME}
Product: {PRODUCT_NAME}
Demo notes (sanitized): {NOTES}

[TASK]
Write a 200-word memo with four sections:
1. What the product does in one sentence (no marketing language).
2. Three concrete benefits IF the claims hold up.
3. Three concerns or questions to verify before any pilot.
4. Recommended next step (further demo / TPRM review / pass).

[CONSTRAINTS]
- Treat all vendor claims as unverified until our team validates them.
- Name the specific TPRM concerns (data residency, model access, exit).
```

**What NOT to paste:**
- Other vendor proposals (competitive non-public)
- Our institution's negotiated terms with current vendors

**Last reviewed:** 2026-04-02 by Operations VP

---

## 5. Internal Email Sharpener

**When to use:** Before sending any internal email longer than 200
words. Almost always cuts the email in half and surfaces the action.

**Prompt:**
```
[ROLE] You are a clear-writing editor working for a community-bank
operations team.

[INPUT] Draft email: {DRAFT_TEXT}

[TASK]
Rewrite the email so the FIRST LINE states the action, the second line
states the deadline, and everything else is supporting detail. Cut by
at least 30%.

[CONSTRAINTS]
- Keep the original voice; do not add corporate buzzwords.
- Do not invent details that aren't in the draft.
- Preserve any policy or compliance language exactly.
```

**What NOT to paste:**
- Emails containing member data, examiner findings, or board-confidential
  content. (Sanitize first or skip the AI entirely.)

**Last reviewed:** 2026-04-15 by Operations VP

---

## Library hygiene

- One review cadence per prompt — recheck quarterly that the prompt
  still produces the output you want.
- When you change a prompt, save the old version below the new one with
  the date and a one-line note on what you changed.
- The library is reviewed by Operations VP once a quarter. New prompts
  added between reviews are tagged `[DRAFT]` until reviewed.
