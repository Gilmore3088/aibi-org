# The Bank AI Use-Case Inventory Card

A one-page register for tracking AI workflows, owners, data classes, risk
tiers, human review, evidence, and review cadence.

Use one row per AI-touched workflow. A use case is the task, not only the tool
name. If one vendor supports three workflows, record three rows.

## Maintain it for the right conversations

Maintain the inventory for your AI committee, risk review, vendor oversight,
audit prep, and examiner conversations. Do not treat this card as exam readiness
by itself; it is the starting record that makes oversight possible.

The AIEOG AI Lexicon defines an AI use-case inventory as a maintained record
supporting governance, transparency, and risk management. The Lexicon is an
optional shared-vocabulary tool, not a supervisory mandate.

## Start with the 30-minute AI Inventory Sprint

1. Ask every department where AI, GenAI, embedded AI, or vendor AI features touch
   work today.
2. Separate the workflow from the system name.
3. Classify data class and risk tier separately.
4. Assign one accountable owner.
5. Record human review, evidence retained, last review date, and next review
   date.

## Core register columns

| Column | What to record |
|---|---|
| Workflow | The actual task, not the system name. |
| Tool / vendor | Product, vendor, embedded feature, internal model, or public tool. |
| Use-case status | Proposed, sandbox, approved, restricted, retired, or blocked. |
| Data class | Public, internal, confidential, NPI, or regulated / exam-sensitive. |
| Risk tier | Low, medium, high, or blocked. Keep this separate from data class. |
| Customer impact? | Yes / no. Include whether output may affect service, eligibility, pricing, fraud, collections, or communications. |
| Regulated workflow? | Lending, BSA/AML, fraud, complaints, marketing, HR, regulatory reporting, or none. |
| Owner | A person, not a committee or generic department. |
| Human review | None, sampled, mandatory, second-line, or committee approval. |
| Evidence retained | Prompt, output, ticket, reviewer note, approval, vendor review, or location. |
| Last reviewed | Date the row was last confirmed. |
| Next review | Date or cadence for the next review. |

## Vendor-control add-on

For vendor or embedded AI features, add fields for due diligence status, contract
review, data-use terms, model-training terms, retention/deletion, subcontractors,
breach notice, regulatory access, ongoing monitoring owner, and termination /
data-return plan.

## Risk-tier guide

| Tier | Definition |
|---|---|
| Low | Internal drafting, public or approved internal data, no customer impact, no regulated decision, approved tool, and human review before use. |
| Medium | Internal process support, customer-facing draft content, confidential internal data, or operational workflow support where human review is required. |
| High | Decision support for credit, fraud, BSA/AML, sanctions, complaints, regulatory reporting, customer-impacting workflows, or NPI used only in an approved private environment. |
| Blocked | Public AI tool with NPI, SAR/AML detail, examination-sensitive information, privileged material, security controls, or final regulated decisions. |

## Model-risk note

Where an AI use case informs quantitative, customer-impacting, or regulated
decisions, evaluate whether model-risk controls apply under current guidance,
including SR 26-2 where applicable. For generative AI workflows, maintain
inventory, ownership, data controls, vendor oversight, human review, and review
cadence even when the workflow is not treated as a formal model.

## Sample rows

| Example | Use case | Data class | Risk tier | Required control |
|---|---|---|---|---|
| Low | Summarize public regulator press releases for internal training. | Public | Low | Human editor confirms accuracy before training use. |
| Medium | Draft customer email language using approved templates and no customer data. | Internal | Medium | Marketing and Compliance review before sending. |
| High | Analyze fraud patterns in an approved enterprise environment. | NPI / regulated | High | Mandatory review, vendor controls, evidence retention, quarterly review. |
| Blocked | Enter loan-file details or SAR investigation notes into a public AI tool. | NPI / SAR-sensitive | Blocked | Do not use. Escalate to AI Program Owner and Compliance. |

## Next step

Download the editable AI Use-Case Inventory Spreadsheet:
`/downloads/artifact-ai-use-case-inventory-spreadsheet.xlsx`

Use the spreadsheet to track owner, data class, risk tier, vendor status, human
review, evidence retained, last review, and next review date.

## Adapt before adoption

This card is a starter artifact, not legal or compliance advice. Adapt tier
definitions, approval roles, cadence, data classes, and vendor-control fields to
your institution's size, complexity, charter, regulator, data standards, and
third-party risk program before adoption.

## Source basis

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026 - AI use-case
  inventory definition.
- Financial Services AI Risk Management Framework, February 2026 - financial
  sector AI lifecycle risk management.
- SR 26-2 Revised Guidance on Model Risk Management - where applicable to
  model-risk use cases.
- OCC Bulletin 2026-13 - generative and agentic AI scope nuance.
- Interagency Guidance on Third-Party Relationships: Risk Management - vendor
  and third-party AI features.
