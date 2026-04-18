# Module 6: Prompt Autopsy -- Weak Prompts for Diagnosis

Three prompts of varying quality for RTFC Framework (Role, Task, Format, Constraint) analysis.

---

## Prompt A

**Banking task the learner was trying to accomplish:** A loan officer needed AI to distill a 40-page commercial real estate appraisal into key risk factors for the credit memo.

> Summarize this report.

**Quality issues:** Missing Role (no banking context), missing Format (no structure specified), missing Constraint (no length, audience, or regulatory framing). The prompt gives the model zero context about what kind of summary matters or who will read it.

---

## Prompt B

**Banking task the learner was trying to accomplish:** A branch manager wanted to use AI to identify trends in customer complaint data from the past quarter to prepare for an upcoming board report.

> You are an expert. Analyze the data and give me insights about everything.

**Quality issues:** Role is generic ("an expert" in what?), Task is unfocused ("analyze... everything" provides no direction), missing Format (no output structure -- table, narrative, bullet list?), missing Constraint (no scope, time period, audience, or relevance filter). The model will produce a sprawling, unusable response.

---

## Prompt C

**Banking task the learner was trying to accomplish:** A compliance analyst needed AI to review an updated BSA/AML policy document against current FinCEN guidance and flag gaps before the next exam cycle.

> As a compliance officer at a community bank, review this BSA policy for gaps. List them.

**Quality issues:** Role is solid (compliance officer, community bank context). Task is specific (review BSA policy for gaps). However, Format is unspecified -- "list them" does not define structure (table with severity ratings? numbered list with regulatory citations? priority order?). Constraint is absent -- no mention of which regulations to check against, no scope boundaries, no output length guidance. This prompt is close to institutional-grade but would produce inconsistent results across runs without Format and Constraint anchors.
