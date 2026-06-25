# The Fair-Lending AI Review Checklist

A pre-deployment and recurring-review card for AI-assisted credit decisions, pricing, eligibility, triage, marketing eligibility, and adverse-action support.

Use one review per workflow, product line, or vendor configuration. Keep the completed checklist with the decision record, model-risk file, or compliance review packet.

## Current-law framing

ECOA and Regulation B do not have an "AI exception." AI-assisted credit processes still need documented fair-lending review, adverse-action explainability, human accountability, and outcome monitoring. Although current CFPB rulemaking states that ECOA does not recognize disparate-impact liability, banks should still test AI-assisted credit workflows for protected-basis outcome gaps, proxy-variable risk, and explainability issues as part of fair-lending, model-risk, mortgage/housing, reputation, and governance controls.

Current model-risk guidance, including SR 26-2 where applicable, should be considered when AI supports scoring, recommendations, pricing, decisioning, or other model-like credit processes.

## Scope this review

| Field | Review note |
| --- | --- |
| Product line | |
| AI-assisted workflow | Credit decision, pricing, eligibility, triage, marketing eligibility, adverse-action support, or other |
| Tool / vendor / model | |
| Review type | Pre-deployment, material-change review, periodic monitoring, or issue remediation |
| Mortgage / housing-related credit in scope? | If yes, include applicable Fair Housing Act categories |
| Review owner | |
| Compliance reviewer | |
| Next review date | |

Protected-basis variables identified for testing only, not used as decision inputs unless legally permitted or required. ECOA / Regulation B: race, color, religion, national origin, sex, marital status, age, receipt of public assistance, and exercise of rights under the Consumer Credit Protection Act. Mortgage / housing-related credit: also evaluate Fair Housing Act categories, including disability and familial status where applicable.

Protected-basis and proxy-variable analysis is performed for compliance testing, monitoring, and review; protected-basis variables are not used as decision inputs unless specifically permitted by law and approved by Compliance.

## Pre-deployment review

### Data and design

- [ ] Inputs are limited to approved credit, customer, transaction, or collateral data.
- [ ] No prohibited-basis variable is used as a decision input unless specifically permitted by law and approved by Compliance.
- [ ] Proxy-variable candidates are documented and reviewed by Compliance, Fair Lending, or Model Risk.
- [ ] Data lineage, retention location, and vendor access are documented.
- [ ] The intended human reviewer and approval authority are named.

### Outcome-gap and proxy-risk testing

- [ ] Population tested:
- [ ] Date range:
- [ ] Product line:
- [ ] Sample size:
- [ ] Protected bases tested:
- [ ] Proxy methodology used:
- [ ] Benchmark / non-AI baseline:
- [ ] Materiality threshold:
- [ ] Owner of remediation:
- [ ] Date of next review:

### Adverse-action explainability

- [ ] Reasons are specific, accurate, and traceable to factors actually considered.
- [ ] Reasons are not generic labels such as "model score," "internal policy," or "AI recommendation."
- [ ] Reason codes map to approved adverse-action language and can be reviewed by a human before use.
- [ ] Compliance reviewed sample adverse-action notices generated or influenced by the AI process.
- [ ] Any vendor-generated explanation is tested against the bank's notice standards before use.

### Governance and accountability

- [ ] The business owner, compliance reviewer, model-risk reviewer, and vendor owner are recorded.
- [ ] Approval criteria, exception handling, overrides, and escalation paths are documented.
- [ ] Monitoring cadence is set before launch.
- [ ] Required evidence is stored in the control file, model-risk file, or compliance review packet.

## Recurring review

- [ ] Re-pull protected-basis outcome-gap metrics and compare against the prior period.
- [ ] Review portfolio monitoring indicators such as performance, default, prepayment, override, exception, and pricing patterns where applicable.
- [ ] Recheck proxy-variable risk when data sources, model logic, prompts, cutoffs, policies, or vendor settings change.
- [ ] Sample adverse-action notices generated or influenced by the AI process and confirm reasons remain specific, accurate, and traceable.
- [ ] Re-run the full review after vendor model updates, policy changes, new product lines, or material population shifts.
- [ ] Log findings, accepted risks, remediation owners, due dates, and the next review date.
- [ ] Report material findings to the fair-lending, compliance, model-risk, or governance forum named in policy.

## Review disposition

| Decision | Use when |
| --- | --- |
| Approved for controlled use | Controls, monitoring, and notice review are complete. |
| Approved with remediation | Use may proceed only under documented conditions, owners, and due dates. |
| Hold for revision | Testing, explainability, governance, or evidence is incomplete. |
| Do not use | The process creates unresolved protected-basis, explainability, governance, or legal risk. |

## Stronger review kit

For a complete implementation packet, pair this checklist with The Fair-Lending AI Review Kit:

- Fair-lending AI checklist PDF
- Editable testing worksheet
- Adverse-action sample review log
- Recurring monitoring template

Download the editable worksheet: `/downloads/artifact-fair-lending-ai-review-worksheet.xlsx`

## Sources: cite in the review file

- Equal Credit Opportunity Act
- Regulation B, 12 CFR Part 1002
- CFPB Circular 2022-03, adverse-action notification requirements for complex algorithms
- CFPB Circular 2023-03, adverse-action notice requirements and specific reasons
- SR 26-2 Revised Guidance on Model Risk Management, where applicable
- Fair Housing Act, where mortgage / housing-related credit is in scope
- AIEOG AI Lexicon and Financial Services AI Risk Management Framework
