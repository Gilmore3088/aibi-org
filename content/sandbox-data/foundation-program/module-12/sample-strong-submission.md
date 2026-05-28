# Sample Strong Submission — Monthly BSA Exception Reporting Workflow

> Anonymized. Submitted Q1 2026 by an operations manager at a community
> credit union. Shown here as a model for specificity, tone, and the
> level of evidence the Institute looks for. Reviewer initials and dates
> have been replaced with placeholders.

---

## 1. The Skill

**One sentence:** Produces the first-draft narrative section of the
monthly BSA exception report from sanitized exception summaries the
BSA analyst prepares, reviewed and signed off by the BSA Officer before
distribution to the Risk Committee.

---

## 2. Sample Input

```
Reporting period: March 2026
Total exceptions: 14
Exceptions by category:
  - Structuring patterns flagged: 3
    - Pattern type: round-dollar deposits at multiple branches
    - Disposition: 2 closed (CDD updated), 1 escalated to SAR review
  - Velocity threshold breaches: 6
    - Disposition: 5 closed (legitimate business activity), 1 referred
  - Geography mismatches: 3
    - Disposition: All closed (documented member relocation)
  - Other: 2
    - Disposition: Both closed

Trend vs prior 3 months:
  Avg exceptions/month (Dec-Feb): 11
  Mar exception count: 14
  Largest category increase: structuring patterns (1 → 3)
```

**PII handling note:** Member names, account numbers, branch identifiers,
and specific dollar amounts are stripped at the BSA analyst's desk before
the bullet summary is composed. The AI tool only sees categorical
information and aggregate counts.

---

## 3. Raw AI Output

```
March 2026 BSA Exception Report — Narrative

In March 2026, the BSA monitoring team reviewed and dispositioned 14
exceptions, an increase from the prior three-month average of 11.

Structuring patterns drove the most notable category change, increasing
from one in the prior month to three in March. Two of the three patterns
involved round-dollar deposits at multiple branches and were closed with
updated CDD documentation. The third was escalated to SAR review and
remains open at month-end.

Velocity-threshold breaches accounted for six exceptions, all of which
have been dispositioned. Five were closed as legitimate business activity
(consistent with the member's stated occupation and prior transaction
history) and one was referred to the BSA Officer for additional review.

Geography-mismatch exceptions (three) were all closed after documented
member relocations were confirmed in the member files. Two miscellaneous
exceptions were closed.

The increase in structuring-pattern exceptions warrants Risk Committee
attention. The pattern type (round-dollar deposits at multiple branches)
is consistent with documented structuring typologies. The team will
continue monitoring at the current threshold.
```

---

## 4. Edited Output + Annotations

```
March 2026 BSA Exception Report — Narrative

In March 2026, the BSA team reviewed and dispositioned 14 exceptions —
14 vs. a 3-month average of 11.

Structuring patterns drove the category change, increasing from one
prior month to three in March. Two were closed with updated CDD
(round-dollar deposits across multiple branches; both consistent with
sanitized member explanations). One was escalated to SAR review and
remains open.

Velocity-threshold breaches: six exceptions. Five closed (consistent
with documented business activity); one referred for BSA Officer review.

Geography mismatches: three. All closed after documented member
relocations.

Other: two closed.

WATCH ITEM — Structuring pattern count moved from 1 → 3. The Risk
Committee should be aware; threshold-tuning conversation already
scheduled for next month's BSA review.
```

**Annotations:**

- **Change:** Removed "monitoring team" and replaced with "BSA team."
  **Why:** The institution's standard term is "BSA team"; "monitoring
  team" is consultant language that wouldn't match other documents the
  Risk Committee reads.

- **Change:** Tightened "an increase from the prior three-month average
  of 11" to "14 vs. a 3-month average of 11."
  **Why:** Risk Committee members skim. The numeric framing reads
  faster.

- **Change:** Pulled the structuring-pattern detail into a single
  sentence with the disposition inline.
  **Why:** The AI version was three sentences for what is essentially
  one fact. Risk Committee members will read this as denser anyway.

- **Change:** Added the WATCH ITEM block at the bottom.
  **Why:** The AI buried the most important finding in the closing
  paragraph. Risk Committee should see the call-out before any decision
  on monthly-report acceptance.

- **Change:** Removed "consistent with documented structuring typologies"
  from the AI version.
  **Why:** The AI inferred this characterization; the underlying data
  doesn't say this. I left the watch-item phrasing neutral so the BSA
  Officer can attach the typology characterization (or not) based on
  their judgment.

---

## 5. Human Review Notes

**Named reviewer:** BSA Officer.

**What the BSA Officer checks before the report is finalized:**

- Exception counts match the raw monitoring log (the BSA analyst's
  numbers are correct in the bullet summary)
- The escalated SAR-review item is consistent with the open SAR docket
- The "consistent with documented business activity" closings are
  supported by file-level evidence the BSA analyst can produce on
  request
- The WATCH ITEM phrasing is accurate and not over-stated

**What the BSA Officer would escalate (not approve):**

- Any sentence that characterizes member intent (e.g., "the member was
  attempting to structure") without underlying documented evidence
- Any disposition that doesn't match the file-level documentation
- Any month where structuring-pattern count exceeds five — that's a
  threshold conversation with the Risk Committee, not a routine report

**Review evidence:** BSA Officer initials + date are entered in the
monthly BSA report log. Both raw AI output and final edited version
are retained in the report packet for examination response if needed.

---

## 6. Safe AI Use Pledge

I, [Operations Manager], pledge to use AI tools in my role at [Credit
Union] under the following commitments:

I will use the variance-memo drafter and the BSA exception-report
drafter as AI-assisted workflows where my judgment is the final layer
before any output reaches the CFO or the Risk Committee.

I will not paste any member name, account number, or amount that
identifies a specific transaction into any AI tool, regardless of
whether the tool is on our approved list. Sanitization happens at my
desk, before any prompt.

I will not represent AI-generated text as my own work to the BSA
Officer, the CFO, or the Risk Committee. The annotation log on every
submission shows what I changed and why.

I will refresh this pledge quarterly. If the workflows change, or if
my role changes, I will rewrite the pledge to match.

Signed: [Operations Manager]
Date: 2026-03-31
Reviewed by: BSA Officer, [Date]; CFO, [Date]
