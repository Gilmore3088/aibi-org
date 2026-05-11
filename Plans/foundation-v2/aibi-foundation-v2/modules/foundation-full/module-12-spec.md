# Module 12: Spreadsheet Workflows

**Pillar:** Creation · **Duration:** 30 min · **Track:** Foundation Full
**Activity types used:** 5 (build & test — Excel + AI lab), 6 (find the flaw)
**Daily-use outcomes:** Three reusable Excel/AI patterns

---

## Why this module exists

Most banker analysis happens in spreadsheets. Loan pipelines, ALCO scenarios, branch metrics, vendor comparisons, budgets, complaint logs — all live in Excel. AI-for-Excel is its own skill set: formula generation, data analysis, chart creation, anomaly detection, narrative commentary.

Module 12 closes the v1 gap and gives the learner three concrete, reusable patterns for AI-assisted spreadsheet work — every one of them with a planted error to catch, because Excel + AI hallucinates differently than text + AI.

---

## Learning objectives

By the end, the learner will:

1. Use AI to generate formulas and validate them
2. Use AI to analyze a column of data and produce narrative commentary
3. Use AI to identify outliers or anomalies
4. Catch AI errors specific to spreadsheet contexts (wrong cell references, fabricated calculations)

---

## Activities

### Activity 12.1 — Formula generation lab (8 min · type 5)

**Setup (1 min):** "Three Excel formula tasks. AI drafts. You verify."

**The activity:**
1. Platform provides a sample bank spreadsheet (synthetic, no NPI):
 - Column A: branch name
 - Column B: monthly transaction count
 - Column C: monthly deposit balance
 - Column D: complaint count
 - Column E: staff FTE
2. Learner is given three tasks:
 - "Calculate transactions per FTE for each branch"
 - "Flag branches where deposits dropped >5% from last month (sample data has prior month columns)"
 - "Calculate a weighted score: 50% deposits, 30% transactions, 20% inverted complaint count"
3. For each, learner asks AI for the formula. Platform sends to default model.
4. AI returns formula. Learner pastes into the platform's spreadsheet preview.
5. Platform shows whether the formula computes correctly. If wrong, platform highlights the issue (e.g., wrong cell reference, missing absolute reference, wrong function).

**Capture:** the three working formulas with notes on what AI got right/wrong → first Excel/AI Pattern.

### Activity 12.2 — Narrative commentary lab (10 min · type 8)

**Setup (1 min):** "Numbers are easy. Commentary is hard. Let AI help."

**The activity:**
1. Same sample spreadsheet. Learner picks a real reporting task they have:
 - Monthly variance commentary
 - ALCO scenario narrative
 - Branch dashboard explanation
 - Pipeline summary
 - Vendor comparison narrative
2. Learner pastes anonymized numbers (or uses platform's synthetic numbers).
3. Learner builds a prompt that includes:
 - Role assignment: "You are a [CFO / branch manager / etc.] commentary writer"
 - Context: "This is the [report]. Audience is [exec / board / committee]."
 - Constraints: "2 paragraphs. Plain English. Highlight what changed and why if you can tell. Do not invent reasons."
4. Platform sends to all three models in parallel.
5. Learner picks the best draft and edits.

**Capture:** the prompt + the chosen draft → second Excel/AI Pattern.

### Activity 12.3 — Anomaly hunt with planted error (10 min · type 6 + type 5)

**Setup (1 min):** "AI can spot patterns humans miss. AI can also see patterns that aren't there. You'll do both."

**The activity:**
1. Platform provides a larger sample dataset — a 50-row synthetic transaction summary by branch and category.
2. Learner asks: "Identify any anomalies in this data — outliers, unusual patterns, things that warrant attention."
3. Platform sends to default model. AI returns 4-6 flagged items.
4. Each flagged item has a "Verify" button. Platform shows the underlying data and asks: "Is this anomaly real?"
5. Two of the AI's flags are real anomalies (rotated quarterly). At least one is a *false positive* — AI seeing a pattern that isn't statistically meaningful. Learner catches it.
6. Platform reveals: which flags were real, which were AI seeing patterns, and why the false positive happened.

**Capture:** the verified anomalies + the false positive caught → third Excel/AI Pattern.

### Activity 12.4 — "Back at the bank" callout (1 min · reading)

> *"In the platform you used [model X] with a synthetic spreadsheet. At your bank, the equivalent is **M365 Copilot in Excel** for spreadsheet-grounded work, or Copilot Chat with the spreadsheet attached for text-based commentary. NPI rules apply identically. Real bank financials are at minimum Confidential — paid M365 Copilot tenant-grounded with manager approval, or stripped data into Copilot Chat."*

---

## Daily-use outcomes

1. **Three Excel/AI Patterns** — formula generation, narrative commentary, anomaly hunting
2. **Verified habit** of catching AI's spreadsheet-specific errors
3. **A real prompt** for the learner's most common reporting task

---

## Assessment criteria

- All three formulas working (after iteration)
- Narrative commentary produced and edited
- Real anomalies confirmed; false positive correctly identified
- Patterns saved with notes about model behavior in spreadsheet contexts

---

## Author/facilitator notes

- **Excel-specific hallucinations are different.** Wrong cell references, fabricated row counts, off-by-one indexing. Authors must include these in planted errors.
- **The dataset must be plausible.** A learner who can't believe the data set won't trust the lessons.
- **Quarterly refresh:** rotate the planted anomalies and false positives.

---

## Dependencies and forward links

- **Depends on:** Modules 8, 11
- **Feeds into:** Module 13 (the tool comparison includes Excel-grounded tools); Module 14 (workflows often chain spreadsheet ops); Module 16 (Finance and Operations role cases use these patterns); Module 17 (each Pattern becomes a library entry)
