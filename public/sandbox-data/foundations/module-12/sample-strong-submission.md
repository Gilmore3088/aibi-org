# Sample Strong Submission — Heritage Community Bank Operations

Anonymized example of a complete, credentialing-grade AiBI-P final lab submission. Use as the model for level of specificity, tone, evidence, and annotation depth.

Submitter: Operations Manager, Heritage Community Bank ($510M assets, 9-branch community bank).
Submitted: 2026-03-22.

---

## 1. The Skill

The operations team uses AI to draft the prose section of the monthly BSA exception report from sanitized exception summaries, producing a one-page management narrative, which is reviewed by the BSA officer before submission to the audit committee.

---

## 2. Sample Input

**Sanitization rules:**

- Customer names → "Customer A, B, C" (alphabetical order of appearance, no real names).
- Account numbers → fully removed (the prose does not need them).
- Specific dollar amounts → rounded to the nearest $5,000 ("$47,213" → "approximately $45,000").
- SAR-specific narrative content → not pasted (those go in the SAR itself, not the management report).
- Examiner-related content → not pasted (out of scope for management reporting).

**Sanitized example input (March 2026 exception summary):**

```
March 2026 BSA exception summary

Total exceptions reviewed: 47
Categorical breakdown:
- Structuring alerts: 18 (Customers A through H, with Customer C and F escalated to SAR)
- Velocity alerts: 14 (Customers I through S, none escalated)
- High-cash-deposit alerts: 9 (Customers T through W, Customer V escalated to SAR)
- Cross-border alerts: 4 (Customer X, no escalation)
- Other (rounding/edge cases): 2 (no escalation)

SARs filed: 3 (Customers C, F, V)
Average resolution time: 4.2 business days (down from 5.1 in February)
Total false-positive rate: 87% (within historical range of 85-92%)

Trailing six-month SAR rate: 2.8 per month (March: 3, slightly above average)
```

---

## 3. Raw AI Output

```
March 2026 BSA Exception Report — Management Narrative

Heritage Community Bank reviewed approximately 50 BSA exceptions in March, a slight
increase from February. Most exceptions came from structuring concerns, which the BSA
officer reviewed and cleared. The bank filed three SARs during the month.

Resolution time improved compared to last month, demonstrating operational efficiency
gains. The false-positive rate remained within the bank's historical range, suggesting
the underlying transaction monitoring framework continues to function appropriately.

Several exceptions involved high-cash deposits, which may reflect emerging customer
behavior patterns the bank should monitor. The cross-border alerts were minor in
volume and presented no concerning patterns.

Overall, the BSA exception process performed within expected parameters during March,
with three SAR filings consistent with historical norms.
```

---

## 4. Edited Output + Annotations

```
March 2026 BSA Exception Report — Management Narrative

Heritage Community Bank reviewed 47 BSA exceptions in March, a small increase from 43 in February.
> [ANNOTATION: AI said "approximately 50, a slight increase." Replaced with the actual 47 and the verifiable February figure of 43 from the prior report. AI rounded for no reason — the audit committee wants the real number.]

The largest category was structuring alerts (n=18), with two cases (Customers C and F) escalated to SAR filings. Velocity alerts accounted for 14 exceptions, none of which required escalation. High-cash-deposit alerts contributed 9 exceptions, with one case (Customer V) escalated to SAR. Cross-border alerts (n=4) and edge-case rounding exceptions (n=2) did not result in escalations.
> [ANNOTATION: AI omitted the categorical breakdown entirely. I added it from the source exception summary because the audit committee specifically asked for category-level data in the January 2026 meeting. AI cannot infer what's not in the input.]

Three SARs were filed during the month (Customers C, F, V), against a trailing six-month average of 2.8 per month — within normal range.
> [ANNOTATION: AI buried the SAR count in the second paragraph and did not contextualize against the six-month average. I moved it up and added the trailing average from the source data because that's the figure the audit committee uses to assess whether March is anomalous.]

Resolution time averaged 4.2 business days, down from 5.1 in February, reflecting tighter coordination between the BSA officer and the operations queue.
> [ANNOTATION: AI said "improved compared to last month, demonstrating operational efficiency gains." Replaced with the actual figures and a single specific reason. "Operational efficiency gains" is consultancy-speak that the audit committee does not need.]

The false-positive rate of 87% remains within the bank's historical range of 85-92%.
> [ANNOTATION: AI said "remained within the bank's historical range, suggesting the underlying transaction monitoring framework continues to function appropriately." That's editorializing about the framework, which the audit committee evaluates separately. I cut everything after "85-92%."]

Submitted by: Operations Manager
Reviewed by: BSA Officer
Date: 2026-04-04
```

> [META-ANNOTATION: I removed three full paragraphs the AI generated about "emerging customer behavior patterns," cross-border patterns, and "performance within expected parameters." Each was speculative, generic, and not supported by the source data. The audit committee does not need AI inference about behavior patterns; they need the numbers and the BSA officer's interpretation.]

---

## 5. Human Review Notes

**Review owner:** BSA Officer (Sarah Chen, BSA Officer, Heritage Community Bank).

**What the reviewer checks:**

1. Every numeric figure traces to the underlying exception register and the SAR log.
2. Categorical breakdowns match the source data exactly.
3. SAR filings named match the actual filings (case-by-case verification with the SAR log).
4. No AI-generated trend claims, behavioral patterns, or framework assessments appear in the final document.
5. The narrative does not contain any customer-identifying language.

**What the reviewer signs off:**

The BSA Officer signs the report footer ("Reviewed by Sarah Chen, BSA Officer, [date]") before submission to the audit committee.

**Escalation triggers:**

- If a trend claim or unsupported number escapes into any submitted report, the workflow is suspended pending review with the audit committee chair.
- The chair, the BSA officer, and the operations manager are notified within 24 hours.
- The workflow does not resume until the source of the error is identified and the prompt is updated to prevent recurrence.

---

## 6. Safe AI Use Pledge

I, [Operations Manager Name], commit to the following while using AI in my role at Heritage Community Bank:

I will use AI to draft prose for monthly BSA exception reports from sanitized exception summaries, with the BSA Officer reviewing every number against the source register before submission. I will not use AI to generate exception classifications, SAR narratives, or any analysis the audit committee or examiners would expect to be the product of human judgment.

I will not paste customer names, account numbers, balances, addresses, SSNs, examination findings, or any institution-confidential information into any public AI tool. I will use only the bank's approved tool list (currently: Claude via Anthropic API, Microsoft Copilot via the bank's M365 tenant) for any AI-assisted work.

I will document every workflow I build using AI in the bank's prompt library, with sanitization rules, review owners, and failure modes named explicitly. I will re-review every saved prompt every six months.

I understand that AI can confidently produce false outputs, and that catching those false outputs is the human reviewer's responsibility, not the AI's. I will not delegate that responsibility.

I will report any AI workflow that produces an unsupported claim, a fabricated number, or an unauthorized data exposure to the BSA Officer and the Operations Manager within 24 hours of discovery.

Signed: [Operations Manager Name]
Date: 2026-03-22
Institution: Heritage Community Bank

---

## What makes this submission strong

- **Specificity in section 1.** "Drafts the prose section of the monthly BSA exception report" is workflow-specific. "Drafts reports" is not.
- **Real sanitization rules in section 2.** The submitter shows their actual rules, not generic ones.
- **Unedited raw output in section 3.** Including the awkward AI phrases and the AI's overreaches makes section 4 meaningful.
- **Substantive annotations in section 4.** Each annotation says what was wrong with the AI output and why the change matters. Five annotations + one meta-annotation across one document.
- **Named human reviewer in section 5.** Sarah Chen, BSA Officer. Not "a manager" or "compliance" — a specific person.
- **Real, signed pledge in section 6.** Names tools, names workflows, names what they will not do.

The submission would pass credential review.
