# Document Workflow Prompt

**Module 7 artifact · AiBI-Foundation**

A reusable document-handling prompt for one document type you handle regularly. Add this to your Personal Prompt Library in Module 11.

**Learner:** _______________________________________________
**Date:** _______________

---

## 1. Document and workflow

| Field | Answer |
|---|---|
| Document type | (e.g., loan committee prep memo, weekly meeting transcript, member complaint log) |
| Source of the document | (e.g., LOS export, Teams transcript, complaint management system) |
| Data tier of the source document | (Public / Internal / Confidential / Restricted) |
| Workflow type (pick one) | Summarize / Extract / Compare / Format-shift / Q&A (grounded) |
| Approved tool tier for this work | (Public AI / Copilot Chat / M365 Copilot / Approved specialist / No AI) |
| Specific tool I will use | |

## 2. The full prompt

Use C-A-T-C plus role assignment plus a verification request.

```
ROLE:
[who the AI is being for this work]

CONTEXT:
[bank size, what kind of document, what the output is for]

THE TASK:
[what the AI should do — be explicit and step-by-step if needed]

FORMAT:
[exact structure of the output — headings, length, bullet vs. prose]

RULES:
- Stick strictly to what the source document says.
- Do not infer, add, or extrapolate beyond what's written.
- If something is implied but not stated, mark it "implied but not explicit."
- [Add any other rules specific to your task]

VERIFICATION REQUEST:
For each [item / fact / action item] you extract, include the exact source quote so I can verify.
```

## 3. Verification step

How I will verify the AI output before using it:

_______________________________________________

## 4. Where the output goes

What I do with the verified output:

_______________________________________________

## 5. Test record

| Field | Answer |
|---|---|
| Date last tested | |
| Tested with which document | |
| Did the output match expectations? | (Yes / No / Partial — note) |
| Time before AI | |
| Time with AI | |

---

## Notes / what I'd refine next time

_______________________________________________
