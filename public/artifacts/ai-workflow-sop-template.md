# AI Workflow SOP Template

A reusable Standard Operating Procedure for a single AI-assisted workflow at a community bank or credit union. Copy this file, fill in each field, and store alongside the workflow it governs.

---

## 1. Workflow identity

| Field | Value |
|---|---|
| Workflow name | _e.g., Adverse-action letter drafting_ |
| Owning team | _e.g., Consumer Lending Ops_ |
| Workflow owner (name + role) |  |
| Effective date |  |
| Version | 1.0 |
| Next review date | _90 days from effective_ |

## 2. Purpose

State, in two sentences, what this workflow produces and why an AI assist is appropriate. Include the regulatory or operational rule the workflow must satisfy.

## 3. Tool

| Field | Value |
|---|---|
| AI tool name + version |  |
| Hosting (SaaS, private cloud, on-prem) |  |
| Vendor risk-tier rating |  |
| Approved by InfoSec (date) |  |

## 4. Inputs

List every input the user is permitted to paste or upload, and the maximum data class allowed. Anything not on this list is prohibited.

- Allowed inputs:
- Prohibited inputs (NPI, PII, account numbers, regulator correspondence, etc.):
- Data-class ceiling for this workflow: _Public / Internal / Confidential / Restricted_

## 5. Prompt scaffold

Paste the canonical prompt used for this workflow. Pin a version of it; do not let staff freelance.

```
Role: ...
Context: ...
Task: ...
Format: ...
Constraints: ...
Review checklist (model must self-check): ...
```

## 6. Expected output

Describe the shape, length, and tone of an acceptable output. Include one approved sample below.

```
Sample output (gold standard)
...
```

## 7. Human review checkpoint

| Step | Reviewer | Pass criteria |
|---|---|---|
| Output generated |  | Matches expected format |
| Substantive review |  | Claims verified against source documents |
| Compliance check |  | Disclosures, fair-lending phrasing, adverse-action reasons traceable |
| Final approval |  | Signed-off before customer-facing use |

The reviewer must be a different human from the prompter for any output that reaches a customer, regulator, board member, or external counterparty.

## 8. Approval gate

- Who may release the output: _role + name_
- What evidence is captured at release: _output, prompt, input, reviewer, timestamp_
- Where evidence is stored: _system + retention period_

## 9. Failure modes and escalation

| If this happens | Then |
|---|---|
| Model output references a fact not in the source | Discard and regenerate; log incident |
| Output contains a phrase on the fair-lending screen | Route to Compliance before sending |
| User pasted prohibited data | Notify InfoSec within one business day; revoke tool access pending review |
| Tool unavailable | Fall back to the manual procedure documented in §11 |

## 10. Metrics

Track monthly:

- Volume run through this workflow
- Average reviewer-edit distance (proxy for output quality)
- Escalations triggered (count + category)
- Time saved vs. manual baseline

## 11. Manual fallback

Document the pre-AI procedure so the team can revert if the tool is unavailable or fails audit.

## 12. Change log

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | _date_ | _name_ | Initial release |

---

_The AI Banking Institute — AI Workflow SOP Template._
_Aligned with SR 11-7 (model risk), Interagency TPRM Guidance, and the AIEOG AI Lexicon (Treasury / FBIIC / FSSCC, Feb 2026)._
