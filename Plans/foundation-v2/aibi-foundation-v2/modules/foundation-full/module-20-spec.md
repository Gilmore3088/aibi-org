# Module 20: Final Practitioner Lab

**Pillar:** Application · **Duration:** 60 min · **Track:** Foundation Full
**Activity types used:** All eight types, integrated
**Daily-use outcomes:** Final Lab Package + library updated · Certifying artifact

---

## Why this module exists

This is the certifying artifact for AiBI-Foundation. Everything in the prior 19 modules is preparation. This module asks the learner to demonstrate, end-to-end, that they can pick a real banking task, apply data-tier discipline, choose the right tool, run the workflow safely across multiple models, verify the output, catch a planted error, and produce something they would actually use at work.

The lab is **60 minutes** because a meaningful capstone needs more time than a typical module. Anything shorter would force learners to fake the depth.

---

## Learning objectives

By the end, the learner will:

1. Execute a complete, real banking task end-to-end using AI safely
2. Demonstrate every Foundation skill in one continuous activity
3. Catch a planted hallucination as part of verification
4. Produce a Final Practitioner Lab Package that earns Foundation certification

---

## Activities

### Activity 20.1 — Pick your scenario (3 min · type 1)

Three scenarios, calibrated to the same difficulty, banking-flavored.

- **Scenario A — Member dispute response** (universal): a long-standing member's complaint about overlapping fees; learner uses the bank's policy document (synthetic) to draft a thoughtful, accurate, retention-focused reply.
- **Scenario B — Loan committee prep** (lending-leaning): three commercial credit memos; learner produces the committee packet using a workflow.
- **Scenario C — Compliance bulletin review** (compliance/ops/finance): a synthetic FFIEC bulletin; learner identifies which areas of bank policy may need review and drafts an email to their manager.

Each has at least one planted error (rotated from a bank of 6–9; per quarter only 2–3 are active).

### Activity 20.2 — Pre-flight + tool selection (4 min · type 3 + type 1)

**Setup (1 min):**

The platform displays:
- Pre-flight check (Module 4): five questions, learner answers
- Tool tier picker: appropriate to the scenario's data tier
- Tool picker: from the learner's Personal Tool Choice Map

**Capture:** pre-flight answers + tool selection with reasoning.

### Activity 20.3 — Run the scenario (35 min · types 2, 5, 6, 7, 8 mixed)

**Setup (1 min):** "Now do the work. The platform will support but not direct."

**The activity:**

The learner executes the scenario:
1. Sets up the project / system prompt (using Module 10 patterns)
2. Runs the AI step (multi-model if scenario warrants)
3. Verifies output (Module 2 + 11 patterns) — *this is where the planted error must be caught*
4. Iterates if needed
5. Produces the final deliverable (the email, the packet, the analysis)

The platform displays the learner's progress:
- Time spent in each step
- Models used
- Verification flags raised
- Errors caught vs. missed

### Activity 20.4 — Library entry (10 min · type 5)

**Setup (1 min):** "Convert this work into a permanent library entry."

**The activity:**

The platform pre-fills a Library entry from the lab work. Learner reviews, fills gaps, runs one final stress-test against an alternate model, and saves.

**Capture:** new library entry → library updated to ≥6 entries (one new, plus the prior 5 from Module 17).

### Activity 20.5 — Reflection and submit (7 min · type 1)

**Setup (1 min):** "Reflect, sign, submit."

**The activity:**

Platform asks for:
- 3–5 sentence reflection: what worked, what didn't, what you'd do differently
- Self-rating against the rubric (which the platform also auto-grades)
- Sign-off

The platform compiles the Final Lab Package: cover, pre-flight, tool selection, project/system prompt, prompts and outputs, verification log, planted-error catch, final deliverable, library entry, reflection, sign-off.

**Capture:** Final Practitioner Lab Package → `module_20_final_lab_package.md` → submitted for grading.

---

## Daily-use outcomes

1. The **Final Practitioner Lab Package** that earns AiBI-Foundation certification
2. **One new library entry**, multi-model tested
3. **Demonstrated competence** across every Foundation skill
4. **Qualifying portfolio** for AiBI-Specialist and AiBI-Leader

---

## Assessment criteria (rubric)

| Criterion | Pass | Coach | Fail |
|---|---|---|---|
| Pre-flight check | All 5 answered with realistic responses | 1–2 light | Skipped |
| Data tier discipline | Correct tier + tool tier match | Slightly mismatched | Restricted into public tool |
| Prompt quality | C-A-T-C + system prompt as appropriate | Partial | One-line prompt |
| Multi-model use | Used at least 2 models where scenario warrants | 1 model | Single-model with no comparison |
| Verification | At least one verification documented; planted error caught | Verification described but planted error missed | No verification |
| Final deliverable | Could be sent / submitted as-is | Needs minor edits | Not usable |
| Reflection | Honest, specific, learnable | Generic | Missing |
| Library entry | Schema-conformant, all required fields | Most fields filled | Missing or shape-broken |

Pass = all criteria meet "Pass" or "Coach" with at most 2 "Coach." Fail = any criterion is "Fail."

The planted-error catch is significant. A learner who runs the scenario carefully should catch it. A learner who doesn't will pass everything in the AI's first draft, including the error. We grade on *catching*, not on producing perfect output.

---

## Author/facilitator notes

- **Plant the errors clearly in the author bible.** Each scenario should have 1–2 planted errors per active version, rotated quarterly from a bank of 6–9.
- **Allow re-attempts.** A learner who fails one criterion gets feedback and one re-attempt. Two failed attempts triggers a coaching session before re-trying.
- **Keep the Lab Package short.** The template should fit in 3–5 pages, not 30. Brevity is part of the discipline.
- **Examiner-reviewable.** The package is, by design, the kind of thing a friendly examiner could review to evaluate the bank's AI training program. That's a feature.
- **Quarterly refresh:** rotate scenarios and planted errors. The quarterly refresh runner (described in `platform-requirements.md`) supports this.

---

## Dependencies and forward links

- **Depends on:** Every prior module. This is the synthesis.
- **Feeds into:** AiBI-Specialist entry (the Final Lab Package is the prerequisite portfolio); AiBI-Leader entry (same); the bank's quarterly AI program review
