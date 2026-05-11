# Module 15: Vendor Pitch Decoder

**Pillar:** Creation · **Duration:** 30 min · **Track:** Foundation Full
**Activity types used:** 6 (find the flaw — real vendor pitch decks), 5 (build & test — scorecard application)
**Daily-use outcomes:** Vendor Evaluation Scorecard the learner takes to vendor meetings

---

## Why this module exists

Every core processor and software vendor is now adding "AI features" to their pitch deck. Some of those features are real and well-engineered. Many are slideware — marketing language attached to legacy capability. Community banks lose money buying the difference.

Module 15 puts the learner through three real (lightly anonymized) vendor pitch decks and trains them to decode them. By the end, the learner has an evidence-based Vendor Evaluation Scorecard ready for the next vendor meeting — and a manager will likely want a copy.

---

## Learning objectives

By the end, the learner will:

1. Distinguish "AI" from "automation," "rules engine," and "machine learning" in vendor language
2. Identify the questions vendors avoid answering
3. Apply a scorecard to evaluate vendor AI claims
4. Walk away with a Vendor Evaluation Scorecard ready for use

---

## Activities

### Activity 15.1 — Decode three pitch decks (18 min · type 6)

**Setup (1 min):** "Three real (anonymized) AI vendor pitch decks. Annotate each. The platform will show you the patterns."

**The activity:**

Three pitch deck excerpts presented in sequence. Each ~5 minutes.

**Pitch 1 — Core processor "AI Insights"**
- Excerpt with phrases like "AI-powered analytics," "machine learning recommendations," "intelligent fraud detection"
- Learner annotates: which claims are specific? Which are vague? What questions would you ask?
- Platform reveals: the underlying capability is mostly a rules engine with statistical anomaly detection — not an LLM. The phrase "AI-powered" obscures more than it reveals.

**Pitch 2 — LOS vendor "GenAI Credit Memo Assistant"**
- Excerpt promising a credit memo drafted from financial inputs
- Learner annotates: what data does it use? Where does it process? What model? What's the audit trail? What's the SLA?
- Platform reveals: real GenAI capability but with vague answers on data residency, model provider, and audit. The vendor is using a third-party API but not disclosing which.

**Pitch 3 — Compliance tool "Regulatory AI"**
- Excerpt promising "automated regulatory monitoring with AI summarization"
- Learner annotates: source coverage? hallucination defense? human review workflow?
- Platform reveals: the tool is a useful aggregator, but the "AI summarization" is a model summarizing summaries — increasing hallucination risk that's not mentioned.

**Capture:** annotated pitches with the learner's flagged concerns.

### Activity 15.2 — The decoder questions (5 min · reading + sorting)

**Setup (1 min):** "Twelve questions that decode any AI vendor pitch. Sort them by what they reveal."

**The activity:**

Platform shows 12 questions. Learner sorts each into a category:

| Category | Question examples |
|---|---|
| **What is it actually doing?** | "Is this an LLM or a rules engine?" "What model are you using?" "Walk me through one specific output." |
| **Where does my data go?** | "Where is data processed and stored?" "Is my data used to train any model?" "What's the retention policy?" |
| **How does it handle errors?** | "What's the hallucination rate?" "What happens when it's wrong?" "What's the human-in-the-loop design?" |
| **How does it pass an exam?** | "What's your SOC 2 status?" "Do you have a model card?" "How do you support our model risk management documentation?" |

After sorting, learner picks 3 questions they will ask in their next vendor meeting.

### Activity 15.3 — Build your Vendor Evaluation Scorecard (5 min · type 1)

**Setup (1 min):** "Combine the patterns and the questions into a scorecard you can use."

**The activity:**

Platform pre-fills a Vendor Evaluation Scorecard with:

- The 12 decoder questions (sorted into the four categories)
- A rating field for each (1–5 with anchored descriptions)
- A red-flag checklist (vague substance, no data residency answer, no model risk documentation, no audit trail)
- A "what to take to TPRM/compliance" summary section

Learner customizes for their bank's specific concerns and prints/saves.

**Capture:** Vendor Evaluation Scorecard → `module_15_vendor_evaluation_scorecard.md`.

### Activity 15.4 — "Back at the bank" callout (1 min · reading)

> *"You can run this scorecard in the room with the vendor. You can also run it after the meeting. The scorecard goes to TPRM/vendor management as part of the evaluation file. If your bank doesn't have a TPRM process for AI vendors yet — that's the conversation to have with your COO."*

---

## Daily-use outcomes

1. A **Vendor Evaluation Scorecard** the learner uses in the next vendor meeting
2. **A pattern-recognition skill** for AI marketing language vs. substance
3. **Twelve decoder questions** memorized through use

---

## Assessment criteria

- All three pitches annotated with substantive concerns
- 12 decoder questions correctly sorted
- Scorecard customized to learner's bank context
- 3 chosen questions for next meeting are realistic

---

## Author/facilitator notes

- **The pitch decks must be real** (lightly anonymized with vendor permission, or composite/synthetic if not). Stock examples lose the lesson.
- **Quarterly refresh:** rotate pitch decks. New ones come out constantly.
- **Don't disparage specific vendors.** The lesson is pattern recognition, not vendor takedowns.

---

## Dependencies and forward links

- **Depends on:** Modules 7 (regulatory landscape — TPRM lens), 13 (tool comparison evidence)
- **Feeds into:** AiBI-Specialist Week 2 (Platform Mastery for Your Department deepens this); Manager Track M3 (managers may run this with reports who attend vendor pitches)
