# AI Use-Case Inventory

The single register of every place AI touches your institution: what it does,
who owns it, what data it sees, and how closely a human watches it. Maintain
it. Bring it to your AI committee. Hand it to your examiner before they ask —
because they will ask for this one first.

## Why this is the artifact examiners ask for first

There is still no comprehensive AI-specific banking law. Federal financial
regulators supervise AI through existing frameworks — model risk management,
third-party risk management, fair lending, BSA/AML, and consumer protection —
applied through risk-based examinations (GAO-25-107197, May 2025). That has a
direct consequence: an examiner cannot ask "are you following the AI rule,"
so they ask the next best question — "show me everything you're doing with AI
and how you govern it." The inventory is that answer in one document.

It is also a baseline expectation in its own right. The AIEOG AI Lexicon (US
Treasury / FBIIC / FSSCC) names the "AI use case inventory" as a foundational
governance practice for institutions of any size. And model risk management
guidance has long expected a complete inventory of models in use, under
development, or recently retired. The revised interagency guidance, SR 26-2
(Federal Reserve / OCC / FDIC, April 17, 2026), superseded SR 11-7 and SR 21-8
and made the framework explicitly risk-based and tailored to an institution's
size and model risk profile. It is described as most relevant to banks over
$30 billion in assets, but the agencies note it can still apply to smaller
institutions where model use is significant — and supervisory focus expressly
includes whether the inventory captures all material models and third-party
tools. For a community bank or credit union, the inventory is the cheapest,
highest-leverage examiner-readiness move you can make.

If you do nothing else with AI governance this year, keep this list current.

## The column schema

One row per use case. These are the fields an examiner expects to see, each
with a one-line definition.

| Column | What goes in it |
|--------|-----------------|
| Use case | The actual task in plain language — what the AI does, not the product name (e.g., "draft BSA SAR narratives"). |
| Owner | A named person accountable for this use case. Not "the committee," not a department. |
| Business purpose | Why the institution does this — the outcome it serves (efficiency, service, detection, compliance). |
| Tool & vendor | The specific product, version, and vendor (e.g., "Microsoft 365 Copilot, Microsoft"). Note "in-house" if built internally. |
| Data classes touched | The data the use case can see: Green (public), Yellow (internal, non-NPI), Red (NPI / PII / loan files). |
| Risk tier | Low / Medium / High, assigned with the rubric below. |
| Human-in-the-loop? | Yes / No — whether a person reviews or approves output before it has effect. For "Yes," note the control (mandatory / sampled). |
| Regulatory touchpoints | The rules the use case implicates (e.g., ECOA/Reg B, BSA/AML, GLBA, UDAAP, fair lending, Reg E). |
| Validation status | Validated / In review / Not validated / Vendor-attested — the state of independent testing of the tool for this use. |
| Review cadence | How often this row is re-examined (e.g., quarterly, annually). Higher tier means more frequent. |
| Last reviewed | The date a human last verified the row still describes how the use case actually runs (YYYY-MM-DD). |
| Status | Production / Pilot / Proposed / Retired. |

## Risk-tiering rubric

Tier on the highest factor that applies — if any single row pushes High, the
use case is High. A banker should be able to tier a use case in 30 seconds.

| Factor | Low | Medium | High |
|--------|-----|--------|------|
| Data touched | Green only | Yellow | Red (NPI / PII / loan or member files) |
| Effect of output | Internal draft, human rewrites fully | Customer-facing after review; operational input | Influences a credit, account, BSA/AML, or adverse-action decision |
| Autonomy | Output always rewritten by a person | Output edited/approved by a person | Output can act or post with no human check |
| Regulated domain | None | Indirect (marketing, internal ops) | Lending, BSA/AML, deposits, collections, fair lending |
| Customer impact if wrong | Negligible | Recoverable inconvenience | Financial, legal, or fair-lending harm |

Rule of thumb: anything that touches Red data, or sits in or near a
credit / account / BSA-AML decision, is **High** and should run with a
human-in-the-loop. Marketing copy on public facts with a human editor is
typically **Low**.

## Filled example inventory

A worked example across departments. Use it to see exactly how to complete a
row. Dates and vendors are illustrative.

| Use case | Owner | Business purpose | Tool & vendor | Data classes | Risk tier | HITL? | Regulatory touchpoints | Validation status | Cadence | Last reviewed | Status |
|----------|-------|------------------|---------------|--------------|-----------|-------|------------------------|-------------------|---------|---------------|--------|
| Pre-screen consumer loan applications for completeness and route to underwriters | Dana Whitfield, VP Lending | Faster, more consistent intake triage | Underwriting Assist, LendingCoVendor | Red | High | Yes (mandatory — underwriter reviews every routing) | ECOA / Reg B, fair lending, FCRA | In review | Quarterly | 2026-05-12 | Pilot |
| Draft BSA/AML SAR narratives from analyst-supplied facts | Marcus Reyes, BSA Officer | Reduce narrative drafting time, improve consistency | In-house GPT on approved tenant | Red | High | Yes (mandatory — BSA Officer edits and signs) | BSA / AML, SAR confidentiality | Validated | Quarterly | 2026-06-01 | Production |
| Summarize internal policy documents for staff training | Priya Nair, L&D Manager | Speed up training content development | Microsoft 365 Copilot, Microsoft | Yellow | Medium | Yes (sampled — reviewer spot-checks) | Internal policy accuracy | Vendor-attested | Annually | 2026-04-20 | Production |
| Generate marketing email copy on public product features | Sam Ortiz, Marketing Director | Faster campaign drafting | Jasper, Jasper AI | Green | Low | Yes (mandatory — editor reviews before send) | UDAAP, advertising / Reg DD claims | Not validated | Annually | 2026-03-15 | Production |
| Classify and route inbound member service emails | Lee Tran, Ops Manager | Reduce response time, route to right queue | ServiceRouter AI, OpsVendor | Yellow | Medium | No (auto-routes; misroutes corrected downstream) | GLBA (data handling), Reg E (if disputes) | In review | Quarterly | 2026-05-28 | Production |
| Chatbot answering general account FAQs on the website | Jordan Kim, Digital Banking | Self-service for common questions | ChatAssist, FinChatVendor | Yellow | High | Yes (escalates to human; no transactional actions) | UDAAP, GLBA, Reg E | In review | Quarterly | 2026-06-10 | Pilot |

## How to stand it up and maintain it

1. **Assign one owner of the inventory itself** — typically a named officer in
   risk or compliance. The inventory needs a person, not a committee, on the
   hook for keeping it current.
2. **Survey every department.** Ask the same two questions everywhere: "Are you
   using AI for any work task?" and "Is any vendor giving you AI-powered
   features you may not have classified as AI?" The second question is how you
   catch shadow AI buried in tools you already license.
3. **Capture one row per use case**, even when one tool covers several use
   cases. Tier each row with the rubric. Most community institutions surface
   9–14 use cases on the first pass.
4. **Set cadence by tier.** Review High-tier rows quarterly, Medium and Low at
   least annually. Re-review any row immediately when the vendor materially
   updates the tool, the data classes change, or the use case moves from pilot
   to production.
5. **Feed board reporting.** Each cycle, roll the inventory into a short summary
   for the board or its risk committee: count of use cases by tier, what's new
   since last period, what's in pilot, any High-tier row without completed
   validation, and any open issues. The inventory is the source of record;
   the board summary is its quarterly read-out.

## Common mistakes

- **"The committee" as owner.** Accountability has to land on a person. A
  committee can govern; it cannot be the owner of a use case.
- **Shadow AI not captured.** The biggest gaps are AI features inside tools you
  already use — CRM, core, productivity suites, fraud tools. If you only list
  tools you bought "for AI," the inventory is incomplete.
- **No last-reviewed date, or a stale one.** An undated row is an unverified
  row. Examiners read the dates first.
- **Listing tools instead of use cases.** "Microsoft 365 Copilot" is not a
  row. "Draft BSA SAR narratives in Copilot" is. One tool can generate many
  rows, each with its own tier and oversight.
- **Treating pilots as off-inventory.** Pilots touching Red data are exactly
  what examiners want to see governed. Log them with status = Pilot.
- **No human-in-the-loop on High-tier rows.** Any use case influencing a
  credit, account, or BSA/AML decision should show how a person checks it.
- **One-and-done.** An inventory built for an exam and never updated is worse
  than none — it documents that you know what you have and stopped watching.

## Adapt before adoption

This template is a starting point, not a policy. Tier definitions, cadence,
data classes, and ownership should be adapted to your institution's size, risk
profile, charter, and regulator before adoption. This artifact is general
information, not legal or compliance advice; confirm specifics with your own
counsel and compliance function.

## Sources

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC
- SR 26-2, Revised Guidance on Model Risk Management, Federal Reserve / OCC /
  FDIC, April 17, 2026 (supersedes SR 11-7, April 4, 2011, and SR 21-8)
- Interagency Guidance on Third-Party Relationships: Risk Management, Federal
  Reserve / OCC / FDIC, June 2023
- GAO-25-107197, Artificial Intelligence: Use and Oversight in Financial
  Services, US GAO, May 2025
- Equal Credit Opportunity Act (15 U.S.C. § 1691) and Regulation B (12 CFR
  Part 1002), CFPB
- Gramm-Leach-Bliley Act Privacy Rule (Title V, Subtitle A)
