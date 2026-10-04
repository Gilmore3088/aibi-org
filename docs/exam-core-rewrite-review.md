# Exam review: prompting questions moved from RTFC to CORE

For James to review before merge (decided 2026-10-03). The skills tested are unchanged; only the framework vocabulary moved to CORE (Context, Objective, Resources, Expectations). Correct answers are unchanged. Question IDs keep their old `rtfc-` prefix so saved attempts still line up.

Answer-length check after the change: the correct answer is the longest option in 6 of 40 questions (15%), the same as before. The guard fails above 40%.

Exam personas (3) completed the exam end to end on the rewritten text.

## Change 1

**Before:** Prompting & the RTFC Framework

**After:** Prompting with CORE

## Change 2

**Before:** A loan officer needs to draft an adverse action notice for a denied small business loan. Using the RTFC framework, which prompt would produce the most compliant first draft?

**After:** A loan officer needs to draft an adverse action notice for a denied small business loan. Using CORE, which prompt would produce the most compliant first draft?

## Change 3

**Before:** This prompt uses all four RTFC elements — Role (compliance specialist), Task (draft adverse action notice), Format (formal letter with bullet reasons), Constraints (no PII, ECOA/Reg B alignment).

**After:** This prompt covers all four CORE parts — Context (a community bank compliance specialist), Objective (draft an adverse action notice for a denied SBA application), Resources (placeholder brackets instead of applicant data), Expectations (formal letter, reasons as bullets, ECOA and Regulation B alignment).

## Change 4

**Before:** Your teller supervisor needs to create a training guide for new hires on how to handle cash discrepancies at the window. Which "Role" assignment produces the most useful output?

**After:** Your teller supervisor needs to create a training guide for new hires on how to handle cash discrepancies at the window. Which Context line produces the most useful output?

## Change 5

**Before:** Specific roles produce specific output. Naming the industry, asset size, audience, and experience level causes the AI to calibrate tone, vocabulary, and detail level for the exact use case.

**After:** Specific context produces specific output. Naming the role, industry, asset size, audience, and experience level causes the AI to calibrate tone, vocabulary, and detail level for the exact use case.

## Change 6

**Before:** The document was too long for a single prompt — it should have been broken into sections with separate RTFC prompts per section, then synthesized

**After:** The document was too long for a single prompt — it should have been broken into sections with a separate CORE prompt per section, then synthesized

## Change 7

**Before:** A member services representative wants AI to help draft a response to a complaint about unexpected overdraft fees. The best "Constraints" to add to the RTFC prompt are:

**After:** A member services representative wants AI to help draft a response to a complaint about unexpected overdraft fees. The best Expectations to add to the CORE prompt are:

## Change 8

**Before:** Effective constraints are specific: no PII, word limit, tone guidance, liability guardrails, and a clear escalation path. Vague constraints ("make it sound nice") produce vague output.

**After:** Effective expectations are specific: no PII, word limit, tone guidance, liability guardrails, and a clear escalation path. Vague expectations ("make it sound nice") produce vague output.

## Change 9

**Before:** The lender's prompt lacked a Format element; once a table layout is specified, the AI's extracted figures can be used without checking the returns

**After:** The lender's prompt set no Expectations; once a table layout is specified, the AI's extracted figures can be used without checking the returns

## Change 10

**Before:** A compliance officer drafts a vendor management policy update using AI. The first draft is generic and reads like it could apply to any industry. The best fix using RTFC is to strengthen the:

**After:** A compliance officer drafts a vendor management policy update using AI. The first draft is generic and reads like it could apply to any industry. The best fix using CORE is to strengthen the:

## Change 11

**Before:** Task — ask the AI to "make it specific and detailed," which pushes the model to add institution-level language without needing any more context

**After:** Expectations — convert the policy from paragraphs to a numbered checklist, since generic language usually comes from the AI defaulting to narrative prose

## Change 12

**Before:** 

**After:** Context — specify "community bank with $400M in assets, FDIC-supervised, subject to Interagency TPRM Guidance" so the AI generates institution-specific language

## Change 13

**Before:** 

**After:** Objective — ask the AI to "make it specific and detailed," which pushes the model to add institution-level language without needing any more context

## Change 14

**Before:** Add FDCPA compliance as a Constraint in the prompt, regenerate, and then have compliance review the output before any staff member uses it

**After:** Add FDCPA compliance to the prompt's Expectations, regenerate, and then have compliance review the output before any staff member uses it

## Change 15

**Before:** Your BSA officer needs AI to draft narratives for 15 currency transaction reports from yesterday. The most efficient RTFC approach is:

**After:** Your BSA officer needs AI to draft narratives for 15 currency transaction reports from yesterday. The most efficient CORE approach is:

## Change 16

**Before:** Create one well-crafted RTFC template for CTR narratives, then apply it to each transaction individually — verifying each output against the source transaction before filing

**After:** Create one well-crafted CORE template for CTR narratives, then apply it to each transaction individually — verifying each output against the source transaction before filing

## Change 17

**Before:** A reusable RTFC template for CTR narratives saves time across many transactions while maintaining accuracy through individual verification. Batch processing 15 at once risks cross-contamination of transaction details.

**After:** A reusable CORE template for CTR narratives saves time across many transactions while maintaining accuracy through individual verification. Batch processing 15 at once risks cross-contamination of transaction details.

## Change 18

**Before:** The teller used the right tool but the wrong prompt format — adding a Role and Constraints would have made sharing the account details acceptable

**After:** The teller used the right tool but the wrong prompt format — adding Context and Expectations would have made sharing the account details acceptable

## To approve

- [ ] The 8 prompting questions read correctly in CORE terms
- [ ] Safe-use question 1, wrong answer (c), now says "Context and Expectations"
- [ ] Topic label "Prompting with CORE" (exam screen and results)
