# Module 18: Incident Response Drill

**Pillar:** Application · **Duration:** 30 min · **Track:** Foundation Full
**Activity types used:** 7 (tabletop simulation), 1 (single-model prompt)
**Daily-use outcomes:** Incident Response Checklist + draft notification template

---

## Why this module exists

Prevention is the first line of defense. Response is the second. v1 had no Incident Response module; v2 adds one because real banks discover that staff *do* sometimes paste NPI into ChatGPT, the email-triage agent *does* misroute, the deepfake-cloned CEO voice *does* succeed.

When that happens, what does a community bank do? Without a runbook, the answer is "improvise" — and improvisation makes a bad event worse. Module 18 is a tabletop drill that produces the runbook.

---

## Learning objectives

By the end, the learner will:

1. Walk through a realistic AI incident step by step
2. Identify containment, notification, documentation, and post-mortem steps
3. Produce an Incident Response Checklist for their role
4. Draft a notification template their bank can adapt

---

## Activities

### Activity 18.1 — The big tabletop (20 min · type 7)

**Setup (1 min):** "A teller pasted a member's full name + account number + balance into ChatGPT (free, personal account) yesterday. They told you about it this morning. Walk through the response."

**The activity:**

A multi-step branching tabletop. Each step requires a decision; each decision branches.

**Step 1 — Discovery and immediate containment (3 min)**
- Choices: ignore / log it / immediate escalation / interview the teller / lock the teller's account
- Right path: log + immediate escalation to compliance + IT, *plus* a calm interview with the teller (not punitive)

**Step 2 — Determine scope (3 min)**
- Choices around what data was exposed, which AI tool was used, on what device, at what time
- Right path: collect full facts before notifying — but don't delay if scope is clearly material

**Step 3 — Vendor outreach (3 min)**
- Should you contact OpenAI? Compliance? Your insurance carrier?
- Right path: check OpenAI's enterprise data deletion options, contact compliance, and notify cyber insurance per policy

**Step 4 — Internal notification (3 min)**
- Who needs to know within the bank? CEO? Board? Audit committee?
- Right path: typically CEO + board chair + audit committee chair within 24 hours, depending on bank policy

**Step 5 — Member notification (3 min)**
- GLBA implications? State law (varies by state)? Member relationship?
- Right path: consult counsel on state-law requirements; depending on state, member notification may be required within X days

**Step 6 — Documentation and post-mortem (3 min)**
- What goes in the incident log? What goes to the next examiner conversation?
- Right path: detailed log, root-cause analysis (training? tool restrictions? supervision?), specific corrective actions

**Step 7 — Prevention update (1 min)**
- What changes next? Training? Tool blocks? Policy?
- Right path: usually a combination — refresher training, MDM/web-filtering update, and a renewed acknowledgment of the never-do's

**Capture:** the learner's path through all seven steps + the platform's rubric scoring.

### Activity 18.2 — Build your Incident Response Checklist (5 min · type 1)

**Setup (1 min):** "Your tabletop revealed the seven steps. The platform formats them as your role-specific checklist."

**The activity:**
1. Platform pre-fills a one-page Incident Response Checklist with the seven steps, the right-path actions, and the learner's First-Call List names from Module 7.
2. Learner reviews and customizes for their role:
 - As a teller: my role is steps 1–2; I escalate at step 1
 - As a manager: my role is steps 1–7
 - As a compliance officer: my role centers on steps 3–6
3. Learner saves.

**Capture:** Incident Response Checklist → `module_18_incident_response_checklist.md`.

### Activity 18.3 — Draft notification template (4 min · type 1)

**Setup (1 min):** "If your bank ever has to notify a member about an AI-related incident, the message matters. Draft a template now, calmly, before the moment."

**The activity:**

Platform sends a default model the prompt:

> *"Draft a member notification template for an AI-related data-handling incident at a $500M community bank. Required elements: clear factual statement of what happened, what data was involved, what the bank has done, what the member should do (if anything), how to contact the bank for questions, and an apology with substance. Tone: honest, calm, accountable, not corporate. Under 250 words. Make this a template — leave bracketed placeholders for the specifics."*

Learner reviews, edits, saves.

**Capture:** notification template → `module_18_member_notification_template.md`.

---

## Daily-use outcomes

1. An **Incident Response Checklist** customized to the learner's role
2. A **member notification template** the bank can adapt if needed
3. **Tabletop muscle memory** — the learner has walked through one realistic incident and knows what to do

---

## Assessment criteria

- All seven tabletop steps completed
- Right-path actions chosen on at least 5 of 7 (with feedback iteration on misses)
- Checklist customized to learner's role
- Notification template under 250 words and substantively appropriate

---

## Author/facilitator notes

- **The tabletop must feel real.** This is the module where the learner most needs to feel weight. Don't make it feel like a quiz.
- **State-law requirements vary.** The "right path" on member notification (Step 5) depends on state. The platform should ask the learner's state and provide jurisdiction-specific guidance.
- **The notification template is the kind of thing a friendly compliance officer can adapt directly.** Make it good.
- **Quarterly refresh:** rotate the tabletop scenario among 3–5 incident types (NPI paste / agent misroute / deepfake-cloned wire / vendor breach involving AI / shadow AI tool discovery).

---

## Dependencies and forward links

- **Depends on:** Modules 4 (data tiers), 5 (cyber/threats), 7 (regulatory routing — First-Call List), 14 (agents — failure modes)
- **Feeds into:** Module 19 (Examiner Q&A — examiners ask about incident response programs); Manager Track M3 (managers running this drill with their teams); AiBI-Leader (incident response is a board-level question)
