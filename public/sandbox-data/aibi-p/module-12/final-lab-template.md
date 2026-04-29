# AiBI-P Final Practitioner Lab Submission — Template

Six sections. Specific. Evidence-based. Yours, not generic.

---

## 1. The Skill

One sentence. Verb + object + boundary.

> _What this AI-assisted workflow does, who runs it, and what it produces._

**Format:**

```
[Role/department] uses AI to [verb + object] from [input description], producing [artifact],
which is reviewed by [named role] before [downstream use].
```

**Example:**

> "The operations team uses AI to draft the prose section of the monthly BSA exception report from sanitized exception summaries, producing a one-page management narrative, which is reviewed by the BSA officer before submission to the audit committee."

**Your skill:** [_______________]

---

## 2. Sample Input

The sanitized version of the input your workflow takes. Include the sanitization rules.

**Sanitization rules:**

- [What gets replaced with a placeholder before paste]
- [What gets removed entirely]
- [What gets rounded or generalized]

**Sanitized example input:**

```
[Paste the actual sanitized example here — what the AI sees on every run]
```

---

## 3. Raw AI Output

What the AI produced for the sample input. Unedited. Paste exactly as the AI returned it.

```
[Raw AI output goes here — verbatim, no edits]
```

If the raw output is long, that's fine. The reviewer wants to see what you actually got, including any awkward phrasing or fabricated details.

---

## 4. Edited Output + Annotations

What the workflow actually produces in practice. Inline annotations explain every correction, removal, or expansion.

Format: edited output as the body, with annotations in `> [ANNOTATION: ...]` blocks immediately after the line they reference.

**Example:**

```
The bank reported 47 BSA exceptions in March 2026, an increase of 8% from February.
> [ANNOTATION: AI said "approximately 50 exceptions, up significantly." I corrected to the actual 47 from our exception register, and replaced "significantly" with the verifiable 8% from the prior month.]

The largest category was structuring alerts (n=18), which the BSA officer reviewed and cleared.
> [ANNOTATION: AI did not have the breakdown by category. I added this paragraph from the BSA officer's notes — AI cannot infer category breakdowns it was not given.]

Three exceptions resulted in SAR filings, in line with the trailing six-month average.
> [ANNOTATION: AI added a sentence about "potential underlying fraud trends." I removed it — that's editorializing the AI cannot support, and it's not the audit committee's job to read AI speculation about fraud trends.]
```

**Your edited output + annotations:** [_______________]

---

## 5. Human Review Notes

The named human review owner, what they check, what they sign off on, and what they would escalate.

**Review owner:** [Named role + name if internal — e.g., "BSA Officer (Jane Smith)"]

**What the reviewer checks:**

1. [Specific check — e.g., "Every numeric figure traces to the underlying exception register."]
2. [Specific check — e.g., "Category breakdowns match the BSA officer's source notes."]
3. [Specific check — e.g., "No AI-generated trend claims appear in the final document."]

**What the reviewer signs off:**

> [Specific sign-off — e.g., "BSA Officer signs the report footer ('Reviewed by [name], [date]') before submission."]

**Escalation triggers:**

- [What would cause the workflow to be paused for review]
- [Who is notified and how]

**Example escalation:** "If a trend claim or unsupported number is found in any submitted report, the workflow is suspended pending review with the audit committee chair. The chair, the BSA officer, and the operations manager are all notified within 24 hours."

---

## 6. Safe AI Use Pledge

Your signed statement. Personal. Specific. Dated.

See the `safe-ai-use-pledge` sample data for the template.

**Pledge text:** [_______________]

**Signed:** [Your name]

**Date:** [YYYY-MM-DD]

**Institution:** [Bank name]

---

## Submission checklist

Before you submit:

- [ ] Section 1 names a specific role + verb + boundary (not "draft emails" — too broad).
- [ ] Section 2 includes actual sanitization rules with examples.
- [ ] Section 3 is the unedited raw AI output (resist the urge to clean up before pasting).
- [ ] Section 4 has at least 3 substantive annotations (not "fixed grammar").
- [ ] Section 5 names a real human reviewer with real check criteria.
- [ ] Section 6 is signed, dated, and bank-named.
- [ ] Every numeric or directional claim in your annotations is verifiable against your real source notes.
