# Role Use-Case Card — Template

The artifact you produce in this module. One card per use case. Save your filled cards to your bank's prompt library.

---

## 1. Role + use case

> **Role:** [your role + department]
>
> **Use case (one sentence):** [what the AI helps with — verb + object + boundary]

Example: "Lending team uses AI to draft the prose section of a credit memo from the loan officer's bullet-point notes, before the loan officer writes the analysis section."

---

## 2. Sample input shape

What the AI sees on every run.

> **Type of input:** [text from notes / public document / sanitized customer message]
>
> **Sanitization rule:** [what gets removed before paste — name, account, balance, SSN, email]
>
> **Sanitized example (anonymized):** [paste a sanitized example showing the AI exactly what it will see]

Example sanitization rule: "Replace borrower name with 'Borrower A.' Replace exact loan amount with the rounded magnitude (e.g., '$750k' instead of '$748,213'). Strip address. Keep credit score band ('700-740') but not the exact score."

---

## 3. Output review owner + review step

Who validates AI output before it is used. No AI output goes downstream without a human signature.

> **Review owner:** [named role — chief credit officer, compliance manager, ops lead]
>
> **Review step (one sentence):** [what the reviewer checks for]
>
> **What the reviewer signs off:** [specific criteria]

Example: "Chief credit officer reviews every credit memo prose section before the memo goes to committee. The CCO checks that no metric appears in the prose that is not also in the underlying loan officer's notes — to catch AI fabrication. Sign-off goes in the credit memo footer."

---

## 4. Failure mode to watch

The most likely way this AI workflow goes wrong. Name it now so the reviewer knows what to look for.

> **Most likely failure:** [specific bad output the reviewer must catch]
>
> **Why this is the likely failure:** [what about the task makes this the risk]
>
> **What you do if it happens:** [escalation path]

Example: "Most likely failure: AI fabricates a debt-service coverage ratio that was not in the loan officer's notes. The model fills gaps confidently. The CCO must verify every number traces to the source notes. If a fabricated number escapes review and reaches committee, the workflow is suspended pending a process review."

---

## Save and tag

Tag this card with:

- **Pillar status:** Green / Yellow / Red
- **Frequency:** Daily / Weekly / Monthly / Ad-hoc
- **Last reviewed:** [date]
- **Next review:** [date — minimum every 6 months]

A reviewed card is stale at 6 months. Re-run the card through the AIEOG AI Lexicon's third-party-AI-risk lens annually.
