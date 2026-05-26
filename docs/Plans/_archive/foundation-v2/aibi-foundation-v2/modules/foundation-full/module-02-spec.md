# Module 2: What AI Is and Is Not

**Pillar:** Awareness · **Duration:** 25 min · **Track:** Foundation Full
**Activity types used:** 6 (find the flaw — Hallucination Lab), 1 (single-model prompt)
**Daily-use outcomes:** Hallucination Catch Log entry; verification habit established

---

## Why this module exists

Module 1 produced a small win. Module 2 calibrates trust. The entire **Understanding** pillar that comes next assumes the learner now has working hallucination defense — a habit of expecting AI to be confidently wrong about specific facts and verifying before using.

This module is the Hallucination Lab. By the end, the learner has *triggered* hallucinations themselves, *caught* hallucinations across multiple models, and built a personal verification habit they will apply for the rest of the course and the rest of their banking career.

---

## Learning objectives

By the end, the learner will:

1. Trigger a hallucination on demand
2. Catch hallucinations in three different model outputs side-by-side
3. Articulate the "AI is good at language, bad at facts" principle in their own words
4. Maintain a Hallucination Catch Log going forward

---

## Activities

### Activity 2.1 — Trigger a hallucination yourself (8 min · type 1 + type 2)

**Setup (1 min):** "You're going to ask AI a question that almost guarantees a hallucination. Then you're going to catch it."

**The activity:**
1. Platform suggests three prompts known to produce hallucinations across most models. Learner picks one:
 - "What FDIC guidance covers AI use in community banks under $1B in assets?"
 - "What is the Federal Funds Rate as of today?"
 - "What does OCC Bulletin 2024-87 say about model risk management?"
2. Platform sends the picked prompt to all three models (parallel).
3. Responses stream in. Each will likely contain at least one fabricated specific.
4. Platform reveals the *intended* hallucinations after the learner reads the responses (e.g., "OCC Bulletin 2024-87 does not exist; both ChatGPT and Gemini fabricated content; Claude declined more carefully but still got the date wrong").
5. Learner reflects: "Which model handled it most carefully? Which made up the most?"

**Capture:** the prompt, three responses, the platform's reveal — saved to the Hallucination Catch Log.

### Activity 2.2 — Find the flaw (10 min · type 6)

**Setup (1 min):** "Now you'll see three responses to a real banking question. One contains a hallucination. Your job: find it."

**The activity:**
1. Platform presents a banking question (rotated quarterly): e.g., *"My loan officer wants to know what an Automated Valuation Model (AVM) is and what regulation governs it. Explain it."*
2. Platform displays three model responses (pre-recorded in the activity for consistency, refreshed quarterly).
3. Each response includes:
 - One verifiable, accurate response (fully correct against current regulation)
 - One response with a planted plausible-sounding fabrication (e.g., wrong date on the AVM final rule, fabricated citation)
 - One response that's accurate but omits a key caveat
4. Learner highlights any specific claim they want to verify.
5. After learner submits their flags, platform reveals the planted issues.
6. Platform offers: *"Want to verify the actually-correct response against the regulator's website? Click here."* (links to the FDIC, OCC, or CFPB page in question)

**Capture:** the learner's flags, the actual planted issues, the verified primary source link → entry in the Hallucination Catch Log.

### Activity 2.3 — Build your verification habit (5 min · type 1)

**Setup (1 min):** "You can't catch every hallucination. But you can build a habit that catches the ones that matter."

**The activity:**
1. Platform presents the five-point claim scan:
 - Specific regulation, statute, or document references
 - Specific dates
 - Specific dollar amounts or rates
 - Specific names (people, banks, vendors)
 - Specific policy claims about your bank
2. Learner walks through one personal example: *"What's a real claim you'd want to verify before using AI output at your bank?"*
3. Platform suggests primary sources for each scan type (regulator websites, the bank's policy doc, the bank's compliance officer).
4. Learner saves the scan + their primary-source list as a reference card.

**Capture:** the AI Claim Review reference card → saved for use in every subsequent module.

---

## Daily-use outcomes

1. A **Hallucination Catch Log** with at least two entries (the triggered one and the find-the-flaw one)
2. An **AI Claim Review reference card** the learner uses on any AI output before publishing
3. A **personal sense** that AI hallucinates *systematically*, not occasionally — and that catching it is a learnable habit

---

## Assessment criteria

- At least one fabrication correctly identified in Activity 2.2
- AI Claim Review card filled with the learner's role-specific primary sources
- Reflection in Activity 2.1 shows model-by-model judgment (not just "they all hallucinated")

---

## Author/facilitator notes

- **Calibrate quarterly.** Models update; their hallucination patterns shift. Re-test all activity prompts each quarter.
- **The "actually-correct" response in Activity 2.2 is the hardest to author.** It needs to be verifiable against current regulator content. Authors must validate before each release.
- **The platform reveals the plants only AFTER the learner has flagged.** Don't show the rubric first.
- **Rotate the planted errors quarterly** so the activity doesn't become "the test where Gemini lied about Bulletin 2024-87 again."

---

## Dependencies and forward links

- **Depends on:** Module 1 (learner has used the multi-model UI once)
- **Feeds into:** Every subsequent module — the verification habit is now table stakes; Module 7 (grounded Q&A reduces but doesn't eliminate); Module 15 (vendor pitch decoder is the same skill applied to marketing); Module 20 (Final Lab includes planted errors)
