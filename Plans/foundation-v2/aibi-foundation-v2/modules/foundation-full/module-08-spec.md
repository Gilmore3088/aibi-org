# Module 8: Prompting Fundamentals

**Pillar:** Understanding · **Duration:** 30 min · **Track:** Foundation Full
**Activity types used:** 2 (multi-model comparison), 5 (build & test)
**Daily-use outcomes:** Prompt Strategy Cheat Sheet (multi-model annotated)

---

## Why this module exists

Module 1 introduced C-A-T-C through a single multi-model comparison. Module 8 expands C-A-T-C into the full prompt toolkit and stress-tests each technique across all three models. By the end, the learner has not just *learned* prompting techniques — they've watched each technique succeed or fail across multiple models, and captured a Cheat Sheet annotated with model-specific tips.

---

## Learning objectives

By the end, the learner will:

1. Apply the four advanced techniques (role assignment, examples, step-by-step instructions, iterative refinement) across three models
2. Diagnose poor AI output and identify which prompt element was missing
3. Rewrite a weak prompt into a strong one for any of three banking tasks
4. Capture model-specific prompting notes (e.g., "Claude needs more context; ChatGPT needs more constraints; Gemini needs more examples")

---

## Activities

### Activity 8.1 — Diagnose the weak prompt (8 min · type 6)

**Setup (1 min):** "Three weak prompts. Three weak responses. Identify what's missing in each."

**The activity:**
1. Platform shows three weak prompts and the responses each produced (across three models for variety):
 - "Make this email better." → generic, off-tone, might invent facts
 - "Summarize this loan committee transcript." → loses key decisions
 - "Write a fair lending policy." → wrong job for AI; should be narrowed
2. Learner annotates each: which C-A-T-C element is missing? Why does the response fail?
3. Platform reveals the right diagnosis with reasoning.

**Capture:** entries in the Prompt Strategy Cheat Sheet under "What weak prompts look like."

### Activity 8.2 — Build & test the four techniques (16 min · type 5 + type 2)

**Setup (1 min):** "You'll use each of the four advanced techniques on the same starter task. The platform will show you what changes."

**The activity (four sub-activities, ~3 min each):**

**8.2A — Role assignment**
- Learner takes a starter task ("Review this draft for fair lending risk") and adds a role assignment.
- Platform sends both versions (with and without role) to all three models.
- Side-by-side: which produced better output? Which model was most affected by role assignment?
- Capture: model-by-model notes on role assignment.

**8.2B — Examples (few-shot)**
- Learner adds 2 examples of "good output in our bank's voice" to a basic prompt.
- Platform sends both versions to all three models.
- Compare. Capture: which model benefited most from examples? (Often: Claude for tone matching; ChatGPT for format matching.)

**8.2C — Step-by-step instructions**
- Learner takes a multi-part task ("summarize a board meeting") and converts to numbered steps.
- Platform sends both versions to all three models.
- Compare. Capture: which model was most strictly compliant with steps?

**8.2D — Iterative refinement**
- Learner runs a starter prompt, gets a draft, then sends one of three follow-ups:
 - "What's missing from that draft?"
 - "Give me three alternatives: more formal, more casual, shorter."
 - "What might a regulator question?"
- Platform shows the iteration improving the output.
- Capture: which follow-up produced the most useful refinement.

### Activity 8.3 — Rewrite a real prompt (5 min · type 5)

**Setup (1 min):** "Take one of the three weak prompts from Activity 8.1. Rewrite it using all four techniques. Test."

**The activity:**
1. Learner picks one weak prompt from Activity 8.1.
2. Rewrites with role assignment + examples + step-by-step + planned follow-ups.
3. Platform sends rewritten prompt to default model.
4. Learner reviews; if not satisfied, refines once more.
5. Platform asks: "Is this prompt now ready to go in your Cheat Sheet?"

**Capture:** the rewritten prompt → starter prompt in the Prompt Strategy Cheat Sheet.

---

## Daily-use outcomes

1. A **Prompt Strategy Cheat Sheet** annotated with model-specific tips
2. **Three rewritten starter prompts** the learner can paste tomorrow
3. **Internalized model intuition** — the learner knows which model wants which kind of context

---

## Assessment criteria

- All three weak prompts correctly diagnosed
- All four techniques applied with multi-model comparison
- Final rewritten prompt has all four C-A-T-C elements + at least two of the four advanced techniques

---

## Author/facilitator notes

- **The model-specific notes shouldn't be hard rules.** Models change with each release. Frame them as "tendencies you'll observe" rather than laws.
- **Quarterly refresh:** the multi-model comparisons must be recalibrated against current model behavior. If Claude becomes more concise or Gemini becomes warmer, update the activity descriptions.
- **The "narrowing" lesson from Activity 8.1's third weak prompt is critical.** Bankers tend to over-ask AI. Drill the narrowing.

---

## Dependencies and forward links

- **Depends on:** Modules 1, 2, 4 (prompting basics, hallucination defense, data discipline)
- **Feeds into:** Module 10 (Projects use these techniques in system prompts); Module 17 (Library entries built with these techniques); Module 20 (Final Lab requires demonstrating these techniques)
