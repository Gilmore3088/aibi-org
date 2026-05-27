# Fair-Lending Review Checklist for AI-Assisted Processes

For institutions that have, or are about to have, AI in or near a credit
decision. Run this before deployment, then again on a recurring cadence.

## Why this exists

ECOA and Regulation B do not have an "AI exception." Disparate-impact
obligations attach to any process that influences a credit decision,
whether the influence comes from a human, a static model, or an AI tool.
The institutions that run this review before being asked are positioned
to defend the program; the ones that don't are positioned to explain why.

## Scope this review

Identify every AI-assisted process that:

- Generates, recommends, or filters credit decisions
- Sets pricing tiers, terms, or limits
- Determines marketing eligibility for credit products
- Triages applicants for human review
- Drafts adverse-action reasoning or supporting documentation

Each one needs its own review. The same process may need separate reviews
for each product line.

## Pre-deployment checklist

### Data and design

- [ ] Training or input data documented, including the date range,
      source systems, and any known gaps
- [ ] Protected-class indicators identified in the data layer (race, sex,
      age, marital status, national origin, disability, familial status,
      receipt of public assistance, exercise of ECOA rights)
- [ ] Proxy variables flagged (ZIP code, surname, neighborhood markers
      that may correlate with protected class)
- [ ] Decisions documented end-to-end: what data goes in, what comes out,
      who acts on it

### Disparate-impact testing

- [ ] Approval-rate gap measured across protected classes
- [ ] Score / recommendation distribution compared across protected
      classes
- [ ] Outcome variance (loan performance, default, prepay) compared
      across protected classes
- [ ] Results compared to the non-AI baseline (same process without the
      AI tool)
- [ ] Documented threshold for what constitutes a material gap, and the
      action triggered at the threshold

### Explainability

- [ ] Adverse-action reasoning can be produced for any AI-assisted
      decision in a form that satisfies Regulation B
- [ ] Principal reasons map to specific input factors, not opaque scores
- [ ] Documentation is reviewable by a compliance officer without
      vendor assistance

### Governance

- [ ] Named owner for the AI-assisted process
- [ ] Named compliance reviewer
- [ ] Documented oversight level (automated / sampled / mandatory)
- [ ] Escalation path when a metric crosses an internal threshold
- [ ] Logged in the institution's AI use-case inventory

## Recurring review checklist

Run quarterly at minimum. Annually if the process is low-volume.

- [ ] Re-pull disparate-impact metrics
- [ ] Compare to the prior period — flag any worsening trend
- [ ] Verify the AI tool has not been materially updated by the vendor
      since the last review; if it has, re-run the full pre-deployment
      review
- [ ] Review adverse-action samples for explainability
- [ ] Report results to the same forum that receives the institution's
      standard fair-lending program reporting

## Decisions log

Maintain a short log of decisions made under this review: dates, who
signed off, what changed. The log is what an examiner reads first.

## Citations

- Equal Credit Opportunity Act (15 U.S.C. § 1691)
- Regulation B (12 CFR Part 1002), CFPB
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- GAO-25-107197, US GAO, May 2025
