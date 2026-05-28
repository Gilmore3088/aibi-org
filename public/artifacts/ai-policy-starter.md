# AI Acceptable Use Standard — Starter

A practical starter policy for a community bank or credit union beginning to permit AI tool use. Adapt the bracketed sections, run it through Legal and Compliance, and ratify it at the right committee before publishing internally.

---

## 1. Purpose

This standard defines how employees of [Institution] may use AI tools in the course of their work, what data may be processed by those tools, how outputs are reviewed before release, and how incidents are handled. It applies to all employees, contractors, interns, and board members.

## 2. Definitions

- **AI tool** — any software that uses a generative or predictive model, whether standalone (e.g., a chat assistant) or embedded in another vendor product (e.g., a CRM with AI features).
- **Customer data** — non-public personal information (NPI) as defined by GLBA, including but not limited to account numbers, balances, SSNs, dates of birth, and contact information tied to an identified consumer.
- **Approved tool** — an AI tool that has passed InfoSec review, has a current vendor risk-tier rating, and appears on the institution's _Approved AI Tools List_ maintained by [owner].
- **Use case** — a specific, repeating workflow in which an AI tool is used to produce a defined output.

## 3. Allowed uses

Employees may use an approved AI tool for:

- Drafting internal-only summaries, agendas, meeting notes, and project briefs.
- First-draft writing for internal training, internal memos, and internal communications.
- Research, definitions, and explanations of public regulatory or industry concepts.
- Personal productivity (calendar drafting, email drafting against generic templates).

All such uses are subject to the data-class rule in §5 and the review rule in §6.

## 4. Prohibited uses

Employees may not use any AI tool — approved or otherwise — for:

- Adverse-action notices, fair-lending decisions, or any customer-facing communication that affects credit, account access, or fee waivers, unless a documented workflow SOP exists for that use case and a human in the documented review role approves the output before release.
- Suspicious Activity Reports, Currency Transaction Reports, or any BSA / AML filing or supporting narrative, except as a research aid; final filings are human-authored.
- Investment, fiduciary, or insurance recommendations to a customer.
- Pasting customer NPI, examiner correspondence, board materials marked confidential, or vendor contracts marked confidential into any AI tool that is not on the Approved Tools List as cleared for that data class.
- Any use case not listed on the institution's AI Use-Case Inventory.

## 5. Data-class rule

Each approved AI tool carries a data-class ceiling: _Public_, _Internal_, _Confidential_, or _Restricted_. Employees may only input data at or below that tool's ceiling. Customer NPI is _Restricted_ by default and may only be processed by tools explicitly cleared for that class.

When in doubt, treat data as Restricted.

## 6. Review rule

Any AI-generated output that reaches a customer, a regulator, the board, a counterparty, or an external auditor must be reviewed and approved by a human in a documented role before release. That reviewer must be a different human from the prompter. The reviewer is responsible for the final content; the AI tool is not a defense.

## 7. Tool approval

A new AI tool — or a new AI feature within an existing vendor product — may not be used in production until:

1. InfoSec has reviewed the vendor against the institution's TPRM (Third-Party Risk Management) standard.
2. Legal has reviewed the data-processing terms and confirmed alignment with GLBA and any state privacy obligations.
3. Compliance has classified the use case on the Use-Case Inventory and assigned a risk tier.
4. The tool appears on the Approved AI Tools List maintained by [owner].

Pilots are permitted under a written pilot agreement that specifies scope, duration, data class, and reviewer.

## 8. Incident handling

An AI-related incident includes, but is not limited to: prohibited data pasted into an unapproved tool; a customer-facing output released without human review; a model hallucination that reached a customer or regulator; a vendor disclosure of an AI security breach.

Employees must report any suspected incident to [Incident Owner] within one business day. The Incident Owner logs it in the AI Incident Register, notifies [Compliance / InfoSec / Legal] as required, and convenes the AI Governance Committee within five business days if the incident is material.

## 9. Ownership

| Function | Owner role |
|---|---|
| Standard owner |  |
| Use-Case Inventory owner |  |
| Approved AI Tools List owner |  |
| Incident Register owner |  |
| Board reporting cadence |  |

## 10. Review cadence

This standard is reviewed at minimum annually, and re-ratified at the [committee name] meeting. Material updates trigger an out-of-cycle review.

---

## Appendix A — Regulatory anchors

- **SR 11-7** (Federal Reserve, Model Risk Management) — applies to any AI tool whose output materially affects a credit, capital, or operational decision.
- **Interagency TPRM Guidance** — governs vendor AI features the same way it governs any third-party service.
- **ECOA / Reg B** — applies to any AI use that touches lending decisions or adverse-action notices.
- **GLBA** — governs customer NPI in all AI processing.
- **BSA / AML** — limits AI use in suspicious activity detection and reporting workflows.
- **AIEOG AI Lexicon** (Treasury / FBIIC / FSSCC, Feb 2026) — the official definitions the institution uses for hallucination, AI governance, AI use-case inventory, human-in-the-loop, third-party AI risk, and explainability.

## Appendix B — Change log

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | _date_ | _name_ | Initial release |

---

_The AI Banking Institute — AI Acceptable Use Standard, starter template._
_This document is a starting point, not legal advice. Adapt it with your Legal, Compliance, and InfoSec partners before publication._
