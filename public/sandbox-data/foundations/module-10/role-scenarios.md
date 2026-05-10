# Module 10 — Role Use-Case Scenarios

Six community-bank role scenarios. Each names the **green** (safe with the right prompt), **yellow** (needs human review of every output), and **red** (do not use AI for this) version of the same broad task.

---

## Retail Banking

**Broad task:** customer communication

- **Green** — Drafting a generic branch-hours-change email to the full deposit base. No customer-specific info; copy reviewed by the marketing lead before send.
- **Yellow** — Drafting a personalized response to a customer complaint email, where the AI is given a sanitized version of the complaint (no account number, no name) and produces a response template the banker fills in.
- **Red** — Pasting a customer's full complaint email — including their name, account number, and balance — into a public chat tool to "see what AI thinks."

**Review owner for green/yellow:** retail operations manager.
**Failure mode to watch:** AI inventing a policy ("we waive fees in your situation") that the bank does not actually offer.

---

## Lending

**Broad task:** credit memo support

- **Green** — Summarizing a public industry report on small-business lending trends to inform a credit policy review. No borrower data involved.
- **Yellow** — Drafting the structure of a credit memo from the loan officer's notes, where notes have been sanitized (borrower called "Borrower A," income described as "high-six-figures"). The AI produces a memo skeleton; the loan officer writes the actual analysis.
- **Red** — Asking AI to make or rank credit decisions. Asking AI to "score" applicants. Generating denial reasons that will be sent to the applicant. ECOA / Reg B require lender-specific reasoning, not AI-generated explanations.

**Review owner for green/yellow:** chief credit officer.
**Failure mode to watch:** AI confidently adding metrics that were not in the underlying notes (loan-to-value, debt-service coverage) — these need to come from the loan officer's analysis, not invented.

---

## Operations

**Broad task:** procedure documentation

- **Green** — Summarizing the bank's published operations manual sections (already approved, public to all staff) into a shorter quick-reference card.
- **Yellow** — Drafting a new procedure for a process the operations lead describes verbally. AI produces a draft; ops lead and one peer review every line before it becomes policy.
- **Red** — Using AI to generate audit-response procedures. Examiners want institution-specific judgment, not generic AI text.

**Review owner for green/yellow:** operations manager + one designated peer.
**Failure mode to watch:** AI substituting industry generic language for the bank's specific systems and approval flows.

---

## Compliance

**Broad task:** regulatory research

- **Green** — Summarizing the public text of an FFIEC bulletin or interagency guidance into a one-page brief for the compliance committee.
- **Yellow** — Comparing two pieces of public guidance (e.g., SR 11-7 vs. the AIEOG AI Lexicon) on overlapping topics, where the AI's output is treated as a starting outline that the compliance officer expands with the bank's specific posture.
- **Red** — Asking AI to interpret examination findings, draft responses to regulatory inquiries, or substitute for a model risk assessment under SR 11-7. Examiners require institution-specific reasoning.

**Review owner for green/yellow:** compliance officer.
**Failure mode to watch:** AI confidently misciting regulation numbers or section references — every citation must be verified manually before the brief leaves the desk.

---

## Finance

**Broad task:** variance narrative

- **Green** — Drafting the narrative paragraph of a monthly variance report from the finance team's bullet-point talking points (no balances, no specific account names — just dollar magnitudes already in the team's draft notes).
- **Yellow** — Drafting the board-pack variance section using sanitized monthly data (departments anonymized as "Department A, B, C"). The CFO reviews the draft against the actuals before any number leaves the file.
- **Red** — Pasting pre-release earnings, examination CAMELS ratings, or specific account-level data into any public AI tool. This is institution-confidential under any reasonable reading of the bank's information-handling policy.

**Review owner for green/yellow:** CFO or controller.
**Failure mode to watch:** AI rounding numbers or rephrasing in a way that changes what was actually said. The CFO must re-anchor every number to the source actuals.

---

## Executive

**Broad task:** board-pack preparation

- **Green** — Summarizing the public text of a peer call report or industry data into a board-ready bullet list. No internal data involved.
- **Yellow** — Drafting board-meeting talking points from the CEO's notes on strategic priorities, where the notes have been sanitized of specific deal terms, vendor names, and personnel matters.
- **Red** — Putting acquisition target names, regulatory enforcement matters, individual personnel issues, or pre-release financials into any public AI tool. Even if the tool says it does not retain the input, the bank's information policy and the duty of confidentiality say otherwise.

**Review owner for green/yellow:** CEO + chief of staff.
**Failure mode to watch:** AI generating overconfident claims ("our peer institutions are all expanding into this product") without source — every directional claim needs a named source the CEO can cite if asked.

---

## Citations

- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
- Interagency Guidance on Third-Party Relationships: Risk Management, FDIC / OCC / Fed, 2023
- ECOA / Regulation B, Consumer Financial Protection Bureau
- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
