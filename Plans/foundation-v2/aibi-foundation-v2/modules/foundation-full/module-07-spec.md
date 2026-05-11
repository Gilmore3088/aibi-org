# Module 7: Safe AI Use II — The Regulatory Landscape

**Pillar:** Understanding · **Duration:** 30 min · **Track:** Foundation Full
**Activity types used:** 4 (adaptive scenario — regulator routing), 3 (sorting / classification)
**Daily-use outcomes:** First-Call List; scenario-routed regulatory crosswalk

---

## Why this module exists

Module 4 (Safe AI Use I) gave the learner the data tiers and the five never-do's — the literacy floor. Module 7 builds on that with the *operational* extension: when something happens in your day that touches AI, which regulation applies and who do you call?

The activity uses the scenario engine to route the learner through realistic situations until they can recognize the lens (Model Risk / Third-Party Risk / Fair Lending / BSA-AML / Cybersecurity) and the right first call.

---

## Learning objectives

By the end, the learner will:

1. Identify which regulatory lens applies to common AI use scenarios
2. Name the right first call (model risk owner, compliance officer, BSA officer, IT lead) for each lens
3. Articulate the practical action implied by each regulation in plain language
4. Maintain a personalized First-Call List

---

## Activities

### Activity 7.1 — Regulator routing scenarios (20 min · type 4)

**Setup (1 min):** "Eight short scenarios. In each, you face a real AI situation in your day. Identify the regulatory lens. Pick the first call. The platform shows whether you got it right and what would have happened either way."

**The activity:**

Eight scenarios drawn from realistic banker situations. Each takes ~2 minutes.

**Scenario 1 — Model Risk lens**
*"Your loan committee wants to use an AI tool that scores commercial credit applications and recommends approve/decline. What's the lens? Who's the first call?"*
- Best path: Model Risk Management lens; first call to model risk owner / risk officer / CFO depending on bank structure
- Wrong picks branch to "what would happen": "If you skipped MRM review and the model later showed disparate impact, here's the regulatory and reputational exposure..."

**Scenario 2 — Third-Party Risk lens**
*"A vendor is pitching an AI module for your CRM. They say it's 'just a feature' included in the existing contract. What do you do?"*
- Best path: Third-Party Risk Management lens; first call to vendor management or COO
- Wrong picks: "If you let it slip into production without TPRM review..."

**Scenario 3 — Fair Lending lens**
*"You used AI to generate marketing email content. The AI's output emphasizes one neighborhood's properties. What's the lens?"*
- Best path: Fair Lending; first call to compliance officer
- Wrong picks: "If marketing AI creates patterns of geographic exclusion..."

**Scenario 4 — BSA/AML lens**
*"Your AML team wants to use AI to draft SAR narratives from structured case data. What's the lens? What's the right path?"*
- Best path: BSA/AML lens; first call to BSA officer; tool must be approved with proper data residency and audit logs
- Wrong picks: "If you used a public AI tool for SAR narratives..."

**Scenario 5 — Privacy/GLBA lens**
*"An employee accidentally pasted a member's name + account number + balance into ChatGPT (free, personal account). What's the lens?"*
- Best path: GLBA/privacy + IT/security; first call to compliance and IT immediately; this triggers Module 18's Incident Response
- Wrong picks: "Quietly hoping it doesn't matter..." → "Here's why that's worse than escalating..."

**Scenario 6 — Cybersecurity lens**
*"You discover that an AI tool your team has been using stores prompts indefinitely on the vendor's servers. What's the lens?"*
- Best path: Cybersecurity + Third-Party Risk; first call to IT/security and vendor management
- Wrong picks: branches showing the resulting exposure

**Scenario 7 — Multi-lens situation**
*"You want to use AI for fair lending testing of your existing loan portfolio. What lenses apply?"*
- Best path: Model Risk + Fair Lending + Third-Party Risk (if a vendor tool); first calls to compliance officer + model risk owner
- Tests whether learner recognizes that real situations often touch multiple lenses

**Scenario 8 — Examiner question**
*"An examiner asks: 'Tell me about your AI training program.' What's the lens? What's the right first call?"*
- Best path: Governance / oversight; first call to your AI program owner (likely chief risk officer, COO, or compliance officer)
- Tests whether learner sees governance as a lens, not just a meta-thing

**Capture:** the learner's path through all eight scenarios + correct answers + the relevant primary source links → composite regulatory crosswalk customized to the learner's chosen paths.

### Activity 7.2 — Build your First-Call List (8 min · type 3)

**Setup (1 min):** "For each lens, you need a name and a way to reach them. The platform will help you build it."

**The activity:**
1. Platform displays the five lenses + 'Examiner / Audit / Governance' as a sixth tier.
2. Learner is prompted to fill in for *their bank*:
 - Model Risk owner: name, role, contact
 - Third-Party Risk owner: name, role, contact
 - Compliance officer: name, role, contact
 - BSA officer: name, role, contact
 - IT/Security lead: name, role, contact
 - AI program owner: name, role, contact
3. If learner doesn't know a name, platform prompts: "Ask your manager and complete this within the week."
4. Platform formats into a one-page First-Call List with phone, email, and Teams handle for each.

**Capture:** First-Call List → `module_07_first_call_list.md`.

---

## Daily-use outcomes

1. A **First-Call List** with names and contact info for every lens
2. A **scenario-routed crosswalk** showing the learner's reasoning paths through realistic AI situations
3. **Internalized escalation reflexes** — when something happens in real work, the learner knows immediately who to call

---

## Assessment criteria

- At least 6 of 8 scenarios with correct lens identification
- First-Call List filled with at least 4 of 6 specific names (the rest with "Need to ask manager" + a date)
- Multi-lens scenario (Scenario 7) recognized as multi-lens

---

## Author/facilitator notes

- **The scenario branches matter more than the right answer.** Authors must write meaningful "what would happen" branches for wrong picks. The learner who tries the wrong answer first learns more than the one who guesses right.
- **The First-Call List must be filled with real names, not roles.** A list of roles is useless in an emergency. Press the learner to fill specific names.
- **Quarterly refresh:** primary source links and regulatory citations must be re-verified each quarter against current regulator pages. Use the regulatory crosswalk artifact (`03-what-rule-applies-when.md` from v1, ported and updated) as the source of truth.

---

## Dependencies and forward links

- **Depends on:** Modules 1–4 (data tier discipline established); Module 5 (cyber awareness)
- **Feeds into:** Module 8 onward — every Creation activity now references the lens framework; Module 18 (Incident Response — the First-Call List is who you call); Module 19 (Examiner Q&A — Scenario 8 is the bridge)
