# The Bank AI Use-Case Inventory Template

A fillable register for tracking AI tools, data, owners, human review, risk
tier, vendor controls, evidence, approval status, and re-review cadence.

Use one row per AI use case. A use case is the workflow, not just the tool
name. If one vendor supports three workflows, record three rows.

## Intake questions

Ask these before opening a row:

- What business problem does this solve?
- What tool or vendor will be used, and is it institution-provisioned?
- What data enters the tool?
- Does customer/NPI, regulated, examination-sensitive, privileged, or security
  control information enter the tool?
- What output is produced?
- Could the output affect a customer, examiner, control, report, or regulated
  decision?
- Who signs off before use?
- What evidence will be retained?

## Fillable register fields

Build the register as a spreadsheet or table with these columns.

| Column | What to fill in |
|---|---|
| Use Case ID | Stable ID such as AI-OPS-001 or AI-LEND-003. |
| Use Case Name | Plain-English workflow name, not the product name. |
| Business Purpose | The operational, risk, compliance, or customer reason this use case exists. |
| Department | Business line or function that owns the workflow. |
| Named Owner | One accountable person, not a committee. |
| Status | Proposed, intake review, sandbox, approved, restricted, blocked, or retired. |
| Tool/Vendor | Product, vendor, version if known, and whether the tool is public, enterprise, private, or embedded. |
| Deployment Type | Public AI, approved enterprise account, vendor feature, private deployment, or internal model. |
| Approved Tool Status | Approved, pending review, exception, prohibited, or not yet assessed. |
| Data Class | Public, internal, confidential/NPI, regulated, examination-sensitive, or privileged. |
| Customer/NPI Involved | Yes, no, de-identified, tokenized, or approved private environment only. |
| Regulated Process Involved | Credit, fraud, BSA/AML, sanctions, complaints, regulatory reporting, HR, legal, or none. |
| Output Type | Draft, summary, classification, recommendation, score, customer-facing content, report, code, or action. |
| Human Reviewer | Named role that reviews before use, plus whether review is mandatory or sampled. |
| Risk Tier | Low, medium, high, or blocked using the guide below. |
| Required Controls | Approved tool, data limit, human review, validation, monitoring, recordkeeping, escalation, or other controls. |
| Evidence Retained | Prompt, output, reviewer note, ticket, approval, validation memo, vendor review, or incident link. |
| Approval Date | Date approved for sandbox or production use. |
| Next Review Date | Quarterly for high-risk rows; at least annually for medium/low rows. |
| Re-review Trigger | Tool change, data class change, policy change, vendor update, incident, complaint, or move to production. |
| Incident/Exception Link | Ticket, exception log, risk acceptance, or incident record if applicable. |
| Vendor Review Link | Third-party due diligence, contract review, SOC report, or vendor monitoring file. |

## Vendor lifecycle fields

Use these fields whenever the row involves a vendor, embedded vendor feature,
hosted model, or third-party AI capability.

| Lifecycle stage | Inventory question |
|---|---|
| Planning rationale | What business problem does the AI tool solve, and why is a third party needed? |
| Due diligence status | Has InfoSec, Compliance, Risk, and the business owner reviewed the tool for this use? |
| Contract review status | Does the agreement cover confidentiality, audit, regulatory access, breach notice, and use limits? |
| Data-use terms | May the vendor use prompts, outputs, or bank data for model training or product improvement? |
| Model-training restriction | Is training on bank/customer data prohibited or opt-out confirmed in writing? |
| Retention/deletion terms | How long are prompts and outputs retained, and how are they deleted? |
| Subcontractor/fourth-party review | What subprocessors, hosted models, or infrastructure providers are involved? |
| Breach-notice terms | What notice timeline and evidence preservation requirements apply? |
| Monitoring owner | Who reviews performance, incidents, complaints, and vendor changes? |
| Next vendor review date | When is the next monitoring review due? |
| Termination/data-return plan | How will access be revoked and bank data returned or deleted? |

## Risk-tier guide

Tier on the highest factor that applies. The purpose is consistency across
departments, not false precision.

| Tier | Definition |
|---|---|
| Low | Internal drafting, public data, no customer impact, no regulated decision, approved tool, and human review before use. |
| Medium | Internal process support, customer-facing draft content, confidential internal data, or operational workflow support where human review is required. |
| High | Decision support for credit, fraud, BSA/AML, sanctions, complaints, regulatory reporting, customer-impacting workflows, or NPI used only in approved private environments. |
| Blocked | Public AI tool with NPI, SAR/AML detail, examination-sensitive information, privileged material, security controls, or final regulated decisions. |

Model-risk note: use current model-risk guidance and principles, including
SR 26-2 where applicable, for AI use cases that inform quantitative,
customer-impacting, or regulated decisions. Do not imply every generative AI
use case at every institution is automatically subject to the same model-risk
regime.

## Approval workflow

Move each row through this path:

1. Proposed - department submits intake questions and draft row.
2. Intake review - AI Program Owner confirms the row is a use case and names
   an owner.
3. Data classification - InfoSec or data owner confirms the highest data class
   and prohibited inputs.
4. Vendor/tool review - TPRM, InfoSec, and Compliance confirm approved-tool and
   contract status.
5. Risk tier assigned - Compliance/Risk assigns low, medium, high, or blocked.
6. Human review control defined - owner names reviewer, review standard, and
   evidence retained.
7. Approved, restricted, or blocked - approval is recorded with date,
   conditions, and next review date.
8. Quarterly or annual re-review - cadence follows the tier and any trigger
   event.

## Sample rows

Use these to calibrate the first pass.

| Example | Use case | Data/tool | Tier | Required control |
|---|---|---|---|---|
| Green/Low | Summarize public regulator press releases for internal training. | Public data in an approved tool. | Low | Human editor confirms accuracy before training use. |
| Yellow/Medium | Draft customer email language using approved templates and no customer data. | Internal templates in an approved enterprise tool. | Medium | Marketing and Compliance review before sending. |
| Red/Blocked | Enter loan-file details or SAR investigation notes into a public AI tool. | NPI, loan file, SAR/AML, or examination-sensitive content in a public tool. | Blocked | Do not use. Escalate to AI Program Owner and Compliance if attempted. |

## Maintenance cadence

- High-risk rows: review at least quarterly and whenever the tool, model,
  vendor, data class, workflow, or applicable guidance changes.
- Medium and low rows: review at least annually and on any material trigger
  event.
- Board or committee reporting: summarize count of use cases by tier, new
  rows, blocked rows, open exceptions, incidents, and overdue reviews.
- Retired rows: keep enough history to show when use stopped, who approved
  retirement, and where records were retained.

## Next step: AI Use-Case Inventory Workshop

Use this template to run a 60-minute workshop that identifies shadow AI use,
classifies risk tiers, assigns owners, and produces the first board-ready
inventory.

Bring Compliance, Risk, InfoSec, Operations, Lending, BSA/AML, Marketing, and
the AI Program Owner. Start with tools staff already use, then ask where
vendors have added AI features inside existing systems. Leave with at least
three completed rows, blocked uses named, owners assigned, and review dates
scheduled.

## Adapt before adoption

This template is a starting point, not legal or compliance advice. Adapt tier
definitions, approval roles, cadence, data classes, and vendor-control fields
to your institution's size, complexity, charter, regulator, data standards,
and third-party risk program before adoption.

## Sources

- AIEOG AI Lexicon and Financial Services AI Risk Management Framework, US
  Treasury / FBIIC / FSSCC, February 2026
- SR 26-2, Revised Guidance on Model Risk Management, Federal Reserve / OCC /
  FDIC, April 17, 2026
- Interagency Guidance on Third-Party Relationships: Risk Management, Federal
  Reserve / OCC / FDIC, June 2023
- NIST AI Risk Management Framework (AI RMF 1.0)
- ECOA / Regulation B and CFPB adverse-action guidance for credit-related use
  cases
