# Proof collection runbook

Last updated: 2026-06-23.

Purpose: give the founder/operator a safe way to collect real proof for The AI
Banking Institute without inventing advisors, testimonials, logos, or outcomes.

This runbook supports the launch rule in `Plans/90-day-gtm-launch-plan-2026-06-22.md`:
collect proof from the first 10 to 20 users before scaling beyond warm or
organic channels.

## What counts as proof

Use only material that is real, approved, and specific.

| Proof type | Acceptable source | Public use rule |
|---|---|---|
| Founder/operator proof | `content/copy/index.ts` and owner-approved biography | Use factual role and responsibilities only until a real bio is supplied. |
| Advisor proof | Named advisor with written approval | Add to `content/advisors.ts` only after name, role, institution, quote, and usage context are approved. |
| Learner quote | Buyer or learner approval in writing | Quote exact approved text only; no anonymous "industry leader" filler. |
| Artifact proof | Saved learner artifact, course output, or synthetic example | Redact or synthesize customer/member data; label synthetic examples clearly. |
| Outcome proof | Before/after workflow, support outcome, saved artifact count, or course completion result | Tie the outcome to a documented source; do not imply guaranteed ROI. |
| Transaction proof | Live smoke-test evidence, purchase/refund success, entitlement access | Keep in `docs/live-smoke-test-evidence-log.md`; do not publish secrets, card data, cookies, or full magic links. |

## Do not publish

- Customer/member PII, account numbers, dates of birth, addresses, phone numbers, loan files, complaints, BSA/AML cases, or transaction records.
- Non-public examination material, credentials, secrets, internal system details, or confidential vendor records.
- Bank, credit union, vendor, advisor, or association logos without explicit written permission.
- Regulator, examiner, agency, or supervisory endorsement language.
- Quotes that were paraphrased into marketing copy without approval.
- ROI, efficiency, or time-savings claims that do not state assumptions and source.

## Intake workflow

1. Identify the proof candidate.
2. Classify it as quote, artifact, outcome, advisor, transaction, or support proof.
3. Remove customer/member data and institution-confidential detail.
4. Replace real names, account facts, amounts, dates, and locations with synthetic or ranged values unless the owner explicitly approves them.
5. Ask for written approval of the exact public text or artifact image.
6. Record approval source, date, approved use, and expiration or withdrawal terms.
7. Add the proof to the right surface only after approval:
   - `content/advisors.ts` for named advisors or SMEs.
   - `/courses/foundation/gallery` for synthetic or anonymized artifact examples.
   - `/about` for proof standards and approved founder/operator material.
   - campaign pages only after the proof is in this source-of-truth list.
8. Run claim-safety review before publishing.

## Approval record

Use this table for every proof item before it appears publicly.

| Field | Required value |
|---|---|
| Proof ID | Short slug, e.g. `learner-quote-001`. |
| Proof type | Quote, artifact, outcome, advisor, transaction, support. |
| Source owner | Person who approved use. |
| Source role/institution | Exact approved attribution or "private, not public". |
| Approved public text | Exact text or artifact description. |
| Approved surfaces | Site, email, slide, webinar, partner one-pager, internal only. |
| Approval date | YYYY-MM-DD. |
| Expiration/withdrawal | Any limits on use. |
| Redaction completed | Yes/no and reviewer. |
| Claim-safety review | Yes/no and reviewer. |

## Publishing gates

Do not publish a proof item until all of these are true:

- The source has approved the exact public language or artifact.
- The item contains no customer/member PII or confidential institutional data.
- The item does not imply regulator, examiner, bank, credit union, vendor, or association endorsement.
- The item does not imply guaranteed savings, guaranteed compliance, or guaranteed acceptance.
- The item is labeled synthetic, anonymized, or attributed accurately.
- The relevant page still keeps no-endorsement and data-boundary copy nearby.

## First 10 to 20 users proof targets

Collect at least three of these before scaling traffic:

1. One approved learner quote about a concrete artifact produced.
2. One anonymized before/after workflow artifact.
3. One support/access issue resolved within SLA.
4. One Foundation Packet screenshot with customer data removed.
5. One completion/certificate proof point with authenticity-only language.
6. One live purchase/refund evidence row from the smoke-test log.

