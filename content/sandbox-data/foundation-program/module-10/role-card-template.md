# Role Use-Case Card — Template

> Fill in each of the four fields below. Keep the language specific.
> "Drafts customer emails" is too broad; "Drafts the response template
> for routine fee-waiver requests, which the retail manager reviews
> before send" is the right level.

---

## 1. Role + Use Case

**My role:** [e.g., Retail Branch Manager]

**The AI-assisted task:** [One sentence describing what gets produced.]

Example: *"Drafts the response template for routine fee-waiver requests,
which I review before tellers use it at the counter."*

---

## 2. Sample Input Shape

**What the input looks like:** [Describe the shape, not the specific
content. Use placeholders.]

Example: *"A typical fee-waiver request has a member's
relationship-length statement, the specific fee amount, the date, and a
short narrative of the circumstance. The prompt receives a sanitized
version with name → [MEMBER], amount → [FEE_AMT], date → [DATE], and
the narrative shape only."*

**PII handling note:** [What is stripped before AI, and where the
sanitization happens.]

Example: *"Names + account numbers are replaced with placeholders before
the prompt. Sanitization happens at my desk before paste — there is no
automated PII scrubbing in this workflow yet."*

---

## 3. Output Review Owner + Review Step

**Who reviews:** [Named role, not "someone".]

**What they check:** [Specific items.]

Example: *"Retail manager reviews each template before tellers use it.
Checks: (1) no member name appears in the template body; (2) the fee
amount is correctly placeholdered; (3) the closing language matches our
brand voice; (4) the template names a clear next step for the member."*

**Review evidence:** [How review is recorded.]

Example: *"Retail manager initials the template version + date in our
shared review register."*

---

## 4. Failure Mode I Will Watch For

**The most likely failure for this workflow:** [Specific. Name what
goes wrong, not "AI errors".]

Example: *"The template starts to read as a form letter because the AI
defaults to corporate language. The next sanity check is whether a
banker would actually send this — if it doesn't sound like our branch,
the template needs an edit before approval."*

**My one-step escalation:** [Who I tell if the failure mode hits.]

Example: *"If a template I built starts being used without review (skipped
or rubber-stamped), I tell the retail manager and we re-set the review
cadence."*

---

## Save this card

When all four fields are filled, save this as a `.md` file in your
personal Toolbox library. Naming convention: `role-{your-role}-{use-case}.md`.
The card is the artifact you bring to your committee or auditor.
