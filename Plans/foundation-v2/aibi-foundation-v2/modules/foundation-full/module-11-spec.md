# Module 11: Document Workflows

**Pillar:** Creation · **Duration:** 30 min · **Track:** Foundation Full
**Activity types used:** 2 (multi-model document Q&A), 5 (build & test), 6 (find the flaw)
**Daily-use outcomes:** Document Workflow Prompt + model-strength notes

---

## Why this module exists

Most banker work touches documents — loan files, meeting transcripts, policy documents, board packets, vendor reports. Module 11 teaches the five document workflows (summarize / extract / compare / format-shift / Q&A) and lets the learner watch the *same* document handled by *three* models so they capture which model is best for which workflow.

This is also the first Creation pillar module. The learner now produces something the bank uses, not just something they keep personally.

---

## Learning objectives

By the end, the learner will:

1. Identify the right workflow type (summarize / extract / compare / format-shift / Q&A) for a given task
2. Use a sample document to run the same workflow across three models and compare
3. Catch a planted hallucination in document-grounded output
4. Build a reusable Document Workflow Prompt for one document type they handle

---

## Activities

### Activity 11.1 — Multi-model document summary (10 min · type 2)

**Setup (1 min):** "Three models. One document. Same prompt. See what happens."

**The activity:**
1. Platform provides a sample 2-page operations meeting transcript (pre-stripped of NPI; clearly marked synthetic).
2. Learner uses a starter prompt: *"Summarize this transcript with: decisions made, action items with owners, open questions, and a 2-paragraph executive summary. Stick strictly to what's in the transcript."*
3. Platform sends to all three models with the document attached.
4. Side-by-side responses. Learner annotates:
 - Which model captured the most action items?
 - Which model produced the cleanest exec summary?
 - Which model added something *not* in the transcript?
5. Platform reveals: at least one model added a fabricated detail (rotated quarterly) — a hallucination even with grounding.

**Capture:** model-strength notes for "summarize" workflow.

### Activity 11.2 — Structured extraction with verification (8 min · type 5 + type 6)

**Setup (1 min):** "Now extract a structured table — and verify each row against the source."

**The activity:**
1. Same transcript. New prompt: *"Extract a clean table of action items with columns: Action Item, Owner, Due Date, Topic Area, Source Quote. Include only items clearly committed. Mark unspecified fields explicitly."*
2. Learner sends to one model (their preference from 11.1).
3. Platform displays the table with quotes.
4. Learner clicks each row's "Verify" button. Platform shows the source quote highlighted in the transcript. Learner confirms or flags the row.
5. At least one row will have a planted issue (the AI claims someone said something they didn't quite say). Learner catches it.

**Capture:** verified table + flag of the planted issue.

### Activity 11.3 — Build your Document Workflow Prompt (10 min · type 5 + type 8)

**Setup (1 min):** "Now apply this to a real document type from your job."

**The activity:**
1. Learner picks a document type they handle regularly (from their Module 9 inventory).
2. Platform asks:
 - Source of the document
 - Data tier
 - Workflow type (one of five)
 - Approved tool tier
3. Learner drafts a Document Workflow Prompt using all the patterns they've seen.
4. Platform stress-tests:
 - Sends a synthetic example of the document type at the prompt
 - Reports what came back
 - Asks the learner: "Did this match what you'd want?"
5. Learner iterates. Final version saved.

**Capture:** Document Workflow Prompt → `module_11_document_workflow_prompt.md`.

### Activity 11.4 — "Back at the bank" callout (1 min · reading)

> *"In the platform you used [model X] with a synthetic document. At your bank, the equivalent for an Internal-tier document is M365 Copilot Chat with file attachment. For a Confidential-tier document with tenant grounding, it's M365 Copilot in Word/Excel/Teams. For Restricted-tier, it's an explicitly approved workflow only — never the platform you just used. The pattern transfers; the tool changes."*

---

## Daily-use outcomes

1. A **Document Workflow Prompt** for a real document type the learner handles
2. **Model-strength notes** for summarize and extract workflows
3. **Verified verification habit** — the learner has now caught hallucinations in grounded output

---

## Assessment criteria

- Multi-model summary completed with annotations
- Planted issue in extraction caught
- Document Workflow Prompt has all five C-A-T-C elements + verification request
- "Back at the bank" tier match is correct for the learner's chosen document type

---

## Author/facilitator notes

- **Sample documents must be synthetic and clearly labeled.** No real bank materials in the platform ever.
- **Planted hallucination rotation:** maintain a bank of 5–7 plant patterns and rotate quarterly.
- **Workflow types:** the five (summarize / extract / compare / format-shift / Q&A) cover ~95% of banker document work. Don't add more.

---

## Dependencies and forward links

- **Depends on:** Modules 8 (prompting), 10 (projects/context)
- **Feeds into:** Module 12 (spreadsheet workflows are document workflows for tabular data); Module 14 (workflows chain document operations); Module 17 (every Document Workflow Prompt becomes a library entry)
