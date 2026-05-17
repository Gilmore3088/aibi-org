# Spreadsheet/AI Patterns

**Module 12 artifact · AiBI-Foundation v2**

Three reusable patterns the learner has tested for AI-assisted spreadsheet work.

**Learner:** _______________________________________________
**Date:** _______________

---

## Pattern 1 — Formula generation

**When to use:** I need a formula and would benefit from an AI starting point that I'll verify.

**My prompt:**

```
You are helping a [role] at a community bank build an Excel formula.

Source data: [describe columns and what they contain]
Goal: [what the formula should calculate]

Output: the formula in Excel syntax. Then explain in plain English what
it does. Note any cell references I should adjust.

Do not invent column letters I haven't given you.
```

**My verification step:** Test the formula in a sample row before applying to the full sheet.

**My recent test:** _______________ (date) — formula computed correctly: ☐ Yes ☐ No (note)

---

## Pattern 2 — Narrative commentary

**When to use:** I have numbers; I need them in prose for a memo, board packet, or email.

**My prompt:**

```
You are a [CFO / branch manager / etc.] commentary writer for our
internal [report]. Audience is [exec / board / committee].

Below are the numbers (anonymized). Write 2 paragraphs of commentary
that highlights what changed and why if you can tell from the data.

Constraints:
- Plain English, no corporate buzzwords
- Do not invent reasons not supported by the data
- Flag anything that looks like an outlier
- Lead with the most important change

Numbers:
[paste]
```

**My verification step:** Read every number reference against the source. Edit any "why" claims that aren't actually supported by the data.

---

## Pattern 3 — Anomaly hunt

**When to use:** I have a dataset and want a second pair of eyes for unusual patterns.

**My prompt:**

```
You are reviewing a dataset for outliers and unusual patterns. The data
is from [describe what — e.g., monthly transactions by branch].

Identify any anomalies that warrant attention. For each:
1. The specific data point or row
2. Why it stands out
3. Whether it might be a real signal or a false positive
4. What to verify before acting on it

Do not flag patterns that are statistically unremarkable. Be selective.

Data:
[paste]
```

**My verification step:** For each flag, check the underlying data. AI flags both real anomalies and false positives — review every one before acting.

---

## Notes on which model is best for what

(Filled from Module 13 comparisons)

| Pattern | My preferred model | Notes |
|---|---|---|
| Formula generation | | |
| Narrative commentary | | |
| Anomaly hunt | | |

---

## Tier check

For all three patterns:

- **Inputs:** never include member NPI directly; use anonymized data or M365 Copilot tenant-grounded for Confidential
- **Tool tier:** Internal-tier work fine in Copilot Chat; Confidential needs paid M365 Copilot or an approved specialist
- **Verification:** required for every output
