# AiBI-Foundation v2 · Activity Pattern Specification

The pedagogical design contract for every module in v2. Authors and platform engineers both work to this spec.

---

## 1. The core principle

> **Bankers learn by doing. Every minute the learner spends in this course is hands-on with AI, producing something they will use the next day at work.**

Video is minimal or eliminated. Reading is concise. The learner spends 80%+ of module time *acting*: prompting, comparing, sorting, building, finding flaws, simulating.

---

## 2. The module shape

```
MODULE = 3–5 ACTIVITIES

Each activity:
   ┌──────────────────────────────────────┐
   │ SETUP             1–2 min            │
   │   Text-only. What this activity is.  │
   │   What the learner will produce.     │
   ├──────────────────────────────────────┤
   │ ACTIVITY          most of the time   │
   │   API-powered. Hands-on.             │
   │   Adaptive feedback throughout.      │
   ├──────────────────────────────────────┤
   │ CAPTURE           1–2 min            │
   │   Outcome saved to learner artifact  │
   │   store; Personal Prompt Library     │
   │   updated when applicable.           │
   └──────────────────────────────────────┘
```

A 30-minute module typically has 3–4 activities of 5–10 minutes each, with brief setup and capture around each.

---

## 3. The eight activity types

### Type 1 — Single-model prompt

**What it is:** Learner writes a prompt; one model responds. Standard chat interaction.

**Platform requirements:** API access to one model; UI for prompt entry, response display, capture.

**Use when:** Introducing a concept; first hands-on after a setup; capturing a single artifact.

**Example:** Module 1, learner writes their first C-A-T-C prompt; the platform sends to a default model; learner sees response, captures.

---

### Type 2 — Multi-model comparison

**What it is:** Same prompt sent in parallel to multiple models (Claude, ChatGPT, Gemini, optionally M365 Copilot). Responses display side-by-side. Learner compares, picks, optionally merges.

**Platform requirements:** Parallel API calls, three-column response UI, "pick" and "merge" affordances, capture log.

**Use when:** Teaching judgment about tool selection; building model intuition; demonstrating that AI is not monolithic.

**Example:** Module 8, learner sends the same prompt to three models. The platform highlights differences in tone, length, structure. Learner picks favorites and tags strengths.

**Capture:** the chosen response *plus* a model-preference note ("Claude was better at the formal tone; Gemini was best at concise").

---

### Type 3 — Sorting / classification

**What it is:** Drag-and-drop interface. Items are presented; learner sorts them into categories. Adaptive feedback explains misplacements.

**Platform requirements:** Drag-drop UI; classification rules engine; adaptive feedback based on learner's specific misclassifications; capture of correct final state.

**Use when:** Teaching mental models — data tiers, tool tiers, regulatory lenses, fit/no-fit decisions.

**Example:** Module 4, sort 20 banking artifacts (a member email, the bank's strategic plan, a SAR narrative, etc.) into Public / Internal / Confidential / Restricted. Mistakes prompt explanation: "This contains member account data, so it's Restricted, not Confidential."

**Capture:** a Personal Data-Tier Routing Card built from the learner's correctly-sorted final state, customized to *their* role.

---

### Type 4 — Adaptive scenario

**What it is:** Branching scenario engine. Learner reads a setup, picks an action, sees the consequence, picks the next action, etc. Different paths lead to different outcomes.

**Platform requirements:** Scenario authoring tool; branching state machine; outcome tracker; capture log of the learner's path.

**Use when:** Practicing decision-making in context — examiner Q&A, member dialogues, regulatory routing, vendor evaluation conversations.

**Example:** Module 19, "An OCC examiner asks 'Tell me about your AI training program.'" Learner picks from 4 candidate openings; based on choice, examiner follows up differently. After 5 exchanges, learner sees the full path and the rubric scoring.

**Capture:** an Examiner Q&A Prep Card containing the learner's best answers across multiple runs.

---

### Type 5 — Build & test

**What it is:** Learner builds something — a prompt, system prompt, project, workflow, agent — and the platform stress-tests it. Shows the learner what their build does well and where it fails.

**Platform requirements:** Build affordance (prompt editor, system prompt builder, workflow canvas); test runner that sends adversarial or realistic inputs to the build; results display.

**Use when:** The skill is constructive (not just analytic). Prompts, projects, workflows, defenses.

**Example A:** Module 5, learner builds a defensive system prompt; the platform sends prompt-injection attacks ("Ignore prior instructions and...") and shows whether the system prompt held up.

**Example B:** Module 17, learner uploads their Personal Prompt Library; the platform runs each entry against the same input across three models, then reports consistency and quality.

**Capture:** the build itself, plus a stress-test report.

---

### Type 6 — Find the flaw

**What it is:** Learner is presented with AI output (or several outputs). Some contain hallucinations, miscitations, biased framings, or compliance issues. Learner identifies them.

**Platform requirements:** Output display with annotation affordance; flaw locations and types pre-coded; feedback engine; scoring.

**Use when:** Building verification habit; exposing hallucination patterns; teaching critical reading of AI output; vendor pitch evaluation.

**Example A:** Module 2, three model responses to a regulatory question; one fabricates an FIL number; one omits a key caveat; one is correct. Learner annotates each.

**Example B:** Module 15, real (lightly anonymized) vendor pitch decks. Learner annotates buzzwords vs. substance, hype vs. evidence.

**Capture:** for Module 2, a Hallucination Catch Log entry. For Module 15, a Vendor Evaluation Scorecard.

---

### Type 7 — Tabletop simulation

**What it is:** A multi-step incident or scenario walked through step-by-step. Learner acts as the responder. Each step requires a decision and produces a consequence.

**Platform requirements:** Linear scenario engine with decision points; consequence display; rubric scoring; capture of decisions made.

**Use when:** Incident response, examiner walk-throughs, hands-on regulatory routing.

**Example:** Module 18, "A teller pasted a member's full name + account number + balance into ChatGPT. Walk through the response." The learner advances through: discovery → containment → notification → documentation → post-mortem.

**Capture:** an Incident Response Checklist filled with the learner's correct decisions plus their bank's draft notification template.

---

### Type 8 — Real-world capture

**What it is:** Learner brings a real (sanitized) artifact from their job and works with it in the platform under guidance. The platform processes it, suggests improvements, and produces a usable output.

**Platform requirements:** Upload affordance with NPI scan/redaction prompt; standard activity flow with the learner's content; capture into the artifact store.

**Use when:** Bridging the platform to actual daily work; building real Personal Prompt Library entries; the Final Lab.

**Example:** Module 16, learner pastes their messiest real recurring task (with NPI stripped) and the platform walks them through building a Role Use-Case Card for it.

**Capture:** a real, role-specific artifact.

---

## 4. Daily-use outcome rule

**Every activity must produce something the learner can use the next day at work.**

This is the single hardest authoring constraint. Authors must answer for every activity:

> *"If the learner closes this module right now, what specifically have they walked away with that they will use tomorrow?"*

If the answer is "an understanding of X" — that's not enough. Re-author until the answer is concrete:

- A card they print
- A prompt they paste
- A system prompt they use
- A scorecard they apply
- A checklist they reference
- A library entry they invoke
- A script they say

Authors who can't produce a daily-use outcome must either (a) re-design the activity, or (b) cut the activity.

---

## 5. The three rules of activity quality

### Rule 1: Adaptive feedback beats static feedback

If the learner misclassifies, the platform doesn't say "wrong." It says *why* — referencing the specific item and the specific rule. This requires authors to anticipate plausible mistakes per item and write feedback for each.

### Rule 2: Real banking content beats generic content

Every activity uses banking-specific content. Even multi-model comparison prompts are banking prompts (member emails, loan inquiries, board memos, regulatory questions) — never "write me a poem about spring." Use real banking voice everywhere.

### Rule 3: The platform is a teaching tool, the bank's tools are the production environment

Every activity ends with a "back at the bank" callout: which approved tool would the learner use for this same pattern at their bank, and at what data tier. This prevents the platform itself from becoming a tool the learner inappropriately uses for real work.

---

## 6. What video is allowed for

Video is **not banned**, but it's strictly minor:

| Allowed video | Max length | Purpose |
|---|---|---|
| Module intro | 60 sec | What this module is, what you'll walk away with |
| Platform mechanics | 90 sec | "Here's how to use this activity type the first time you see it" |
| Optional context tracker | 2 min | Optional cultural/historical context; learners can skip |

**Forbidden:**
- Lecture-style video as the primary teaching mode
- Talking-head videos longer than 2 minutes
- Pre-recorded "demos" that the learner could do themselves in the platform
- Vendor-style explainer videos

---

## 7. Authoring checklist for every module

Before a module ships, the author confirms:

- [ ] At least 80% of module time is hands-on activity (not video, not reading)
- [ ] Every activity has a defined daily-use outcome
- [ ] Banking-specific content throughout — no generic examples
- [ ] Adaptive feedback written for each activity
- [ ] "Back at the bank" callout in every activity
- [ ] Capture flow connects to the learner's artifact store
- [ ] Multi-model comparison activities tested against current model behavior
- [ ] Planted-error scenarios documented in the author bible
- [ ] Quarterly refresh triggers identified

---

## 8. The contract authors keep with learners

**Every minute is hands-on. Every activity produces something you'll use tomorrow. Every module ends with you holding more, not knowing more.**

Knowledge transfer happens, but as a *byproduct* of doing — not as the main event.
