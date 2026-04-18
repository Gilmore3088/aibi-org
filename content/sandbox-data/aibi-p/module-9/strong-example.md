# Strong Portfolio Example: BSA Exception Reporting Automation

## 1. The Skill

I built an AI-assisted triage prompt for our monthly BSA exception reports in
the operations department at a $420M community bank. Before this project, our
BSA officer manually reviewed 80-120 transaction monitoring alerts each month,
classifying each as actionable or false positive. I developed an RTFC prompt
in ChatGPT (GPT-4o) that takes a batch of anonymized alert summaries and
produces a preliminary triage: flagged for review, likely false positive, or
needs additional context.

**RTFC Prompt:**
> Role: You are a BSA compliance analyst at a community bank.
> Task: Triage the following transaction monitoring alerts. For each alert,
> classify it as REVIEW (requires BSA officer attention), FALSE POSITIVE
> (explain why), or NEEDS CONTEXT (specify what additional information is
> required).
> Format: Return a markdown table with columns: Alert ID, Classification,
> Reasoning, Recommended Next Step.
> Constraint: Never recommend closing an alert without explanation. Flag any
> alert involving a PEP, cash-intensive business, or structuring pattern as
> REVIEW regardless of dollar amount.

## 2. Sample Input

| Alert ID | Customer Type | Transaction Type | Amount | Pattern |
|----------|--------------|-----------------|--------|---------|
| MON-2026-0441 | Business checking | Wire transfer | $9,800 | Two wires below $10K threshold, 3 days apart |
| MON-2026-0442 | Personal savings | Cash deposit | $4,200 | Recurring monthly deposit, consistent for 14 months |
| MON-2026-0443 | Business checking | ACH batch | $87,500 | Payroll processor, amount varies +/-5% monthly |
| MON-2026-0444 | Personal checking | Cash withdrawal | $7,400 | Three withdrawals in one week totaling $19,800 |
| MON-2026-0445 | Business checking | International wire | $12,300 | First international wire on a 2-year-old account |

## 3. Raw Output

| Alert ID | Classification | Reasoning | Recommended Next Step |
|----------|---------------|-----------|----------------------|
| MON-2026-0441 | REVIEW | Two wire transfers just below the $10,000 CTR threshold within 3 days is a classic structuring pattern. | Pull full 90-day transaction history. Check if customer has been previously counseled on structuring. |
| MON-2026-0442 | FALSE POSITIVE | Recurring monthly deposit of consistent amount over 14 months indicates regular income (likely payroll or rental income). No escalating pattern. | No action required. Document rationale in case file. |
| MON-2026-0443 | FALSE POSITIVE | ACH batch consistent with payroll processing. Variance within normal range for employee count fluctuations. | No action required. |
| MON-2026-0444 | REVIEW | Three cash withdrawals totaling $19,800 in one week could indicate structuring to avoid CTR filing. | Review full transaction history. Determine if CTR was filed for any individual transaction. Interview branch staff. |
| MON-2026-0445 | REVIEW | First international wire on a seasoned account warrants review but is not inherently suspicious. Verify beneficiary and purpose. | Confirm wire details with relationship manager. Check OFAC screening results. |

## 4. Edited Output + Annotation

| Alert ID | Classification | Reasoning | Recommended Next Step |
|----------|---------------|-----------|----------------------|
| MON-2026-0441 | REVIEW | Two wire transfers below the $10,000 CTR threshold within 3 days. Consistent with structuring indicators under 31 CFR 1010.100(bbb). | Pull 90-day transaction history. Cross-reference with prior SARs on this account. Check CIP documentation for business type. **[ADDED: SAR cross-reference and CIP check -- the model omitted these standard steps.]** |
| MON-2026-0442 | FALSE POSITIVE | Recurring monthly deposit of consistent amount over 14 months indicates regular income pattern. No escalation in amounts or frequency. | Document rationale in alert disposition. **[KEPT as-is. Model got this right.]** |
| MON-2026-0443 | NEEDS CONTEXT | ACH batch is consistent with payroll, but we need to verify the processor is a known vendor. **[CHANGED from FALSE POSITIVE. Our bank requires vendor verification for ACH batches above $50K before closing an alert. The model does not know our internal policy threshold.]** | Confirm payroll processor against approved vendor list. If verified, close as false positive with documentation. |
| MON-2026-0444 | REVIEW | Three cash withdrawals totaling $19,800 in one week. Potential structuring. Note: individual transactions below $10K each, so no CTR was triggered per transaction. | Review 90-day history. File CTR if aggregate exceeds threshold. **[ADDED: The model suggested "interview branch staff" which is premature at triage stage and could tip off the customer. Removed per SAR confidentiality requirements under 31 USC 5318(g)(2).]** |
| MON-2026-0445 | REVIEW | First international wire on a 2-year-old account. Not inherently suspicious but warrants verification. | Verify beneficiary against OFAC SDN list. Confirm purpose with relationship manager. **[KEPT with minor edit. Model response was sound here.]** |

## Impact Summary

**Before:** BSA officer spent approximately 6 hours per month manually triaging
80-120 alerts, reading each transaction summary, and classifying by hand.

**After:** AI pre-triage reduces hands-on review time to approximately 1.5 hours
per month. The BSA officer reviews only the REVIEW and NEEDS CONTEXT items in
detail, plus spot-checks 10% of FALSE POSITIVE classifications.

**Time saved:** 4.5 hours per month (approximately 54 hours per year).

**Key learning:** The model is reliable for clear-cut false positives but
consistently under-flags items that require institution-specific policy
knowledge. The human review layer is not optional -- it catches policy gaps
the model cannot know about. This is exactly the kind of HITL workflow that
regulators expect under the Interagency TPRM Guidance.
